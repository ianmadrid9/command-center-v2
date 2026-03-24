/**
 * Eventbrite RSVP Agent - DEEP RESEARCH
 * 
 * Enhanced with:
 * - Smart scoring based on deep research
 * - Urgency detection (early-bird deadlines, low quantity)
 * - Networking value assessment
 * - Automatic prioritization
 * - Budget tracking
 */

const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const EVENTBRITE_USER_EMAIL = process.env.EVENTBRITE_USER_EMAIL;
const EVENTBRITE_USER_NAME = process.env.EVENTBRITE_USER_NAME || 'Ian Madrid';

// Enhanced RSVP criteria with scoring
const RSVP_CRITERIA = {
  // Budget
  maxMonthlyBudget: 100, // Max $100/month on events
  maxSingleTicket: 30, // Max $30 per event
  preferFree: true,
  
  // Scoring thresholds
  minOverallScore: 60, // Only RSVP to events scoring 60+
  minNetworkingScore: 50, // Minimum networking value
  
  // Urgency handling
  grabUrgentFree: true, // Auto-grab urgent free tickets
  grabUrgentEarlyBird: true, // Auto-grab urgent early-bird
  
  // Date range
  minDaysUntilEvent: 1,
  maxDaysUntilEvent: 60,
  
  // Keywords (must have at least one)
  keywords: ['tech', 'startup', 'networking', 'founder', 'ceo', 'entrepreneur', 'ai', 'fintech', 'investor', 'venture'],
  
  // Priority keywords (higher score)
  priorityKeywords: ['investor', 'venture capital', 'angel investor', 'founder', 'ceo']
};

// Calculate RSVP priority score
function calculateRSVPScore(event) {
  let score = 0;
  const reasons = [];
  
  // Base score from event research
  score += event.overall_score || 50;
  
  // Ticket urgency bonus
  if (event.ticket_urgency === 'critical') {
    score += 30;
    reasons.push('🚨 Critical urgency (early-bird ending)');
  } else if (event.ticket_urgency === 'high') {
    score += 20;
    reasons.push('⚠️ High urgency (low quantity)');
  } else if (event.ticket_urgency === 'medium') {
    score += 10;
    reasons.push('🟡 Medium urgency');
  }
  
  // Free ticket bonus
  if (event.is_free) {
    score += 20;
    reasons.push('🟢 FREE ticket');
  }
  
  // Networking value
  if (event.networking_score >= 80) {
    score += 25;
    reasons.push('💼 Excellent networking potential');
  } else if (event.networking_score >= 60) {
    score += 15;
    reasons.push('👍 Good networking potential');
  }
  
  // Priority keywords
  const eventName = (event.name || '').toLowerCase();
  const hasPriorityKeyword = RSVP_CRITERIA.priorityKeywords.some(k => eventName.includes(k));
  if (hasPriorityKeyword) {
    score += 20;
    reasons.push('⭐ High-priority keyword');
  }
  
  // Distance bonus (closer is better)
  if (event.distance) {
    const distanceNum = parseFloat(event.distance);
    if (distanceNum < 1) {
      score += 15;
      reasons.push('📍 Very close (< 1 mile)');
    } else if (distanceNum < 2) {
      score += 10;
      reasons.push('📍 Close (< 2 miles)');
    }
  }
  
  // Venue quality
  if (event.venue_score >= 80) {
    score += 10;
    reasons.push('🏢 Great venue');
  }
  
  return {
    score: Math.min(100, score),
    reasons,
    priority: score >= 90 ? 'CRITICAL' : score >= 80 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'LOW'
  };
}

// Check if event should be RSVP'd
function shouldRSVP(event, monthlySpent = 0) {
  const eventDate = new Date(event.start);
  const now = new Date();
  const daysUntilEvent = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
  
  // Date range check
  if (daysUntilEvent < RSVP_CRITERIA.minDaysUntilEvent) {
    return { should: false, reason: 'Event too soon' };
  }
  if (daysUntilEvent > RSVP_CRITERIA.maxDaysUntilEvent) {
    return { should: false, reason: 'Event too far' };
  }
  
  // Keyword check
  const name = event.name.toLowerCase();
  const desc = (event.description || '').toLowerCase();
  const hasKeyword = RSVP_CRITERIA.keywords.some(k => name.includes(k) || desc.includes(k));
  
  if (!hasKeyword) {
    return { should: false, reason: 'No relevant keywords' };
  }
  
  // Calculate score
  const scoreResult = calculateRSVPScore(event);
  
  // Minimum score check
  if (scoreResult.score < RSVP_CRITERIA.minOverallScore) {
    return { 
      should: false, 
      reason: `Score too low (${scoreResult.score} < ${RSVP_CRITERIA.minOverallScore})`,
      score: scoreResult
    };
  }
  
  // Budget check
  const ticketPrice = event.best_ticket?.cost || 0;
  if (monthlySpent + ticketPrice > RSVP_CRITERIA.maxMonthlyBudget) {
    return { 
      should: false, 
      reason: 'Would exceed monthly budget',
      score: scoreResult
    };
  }
  
  if (ticketPrice > RSVP_CRITERIA.maxSingleTicket) {
    return { 
      should: false, 
      reason: `Ticket too expensive ($${ticketPrice} > $${RSVP_CRITERIA.maxSingleTicket})`,
      score: scoreResult
    };
  }
  
  // Auto-grab urgent free tickets
  if (event.is_free && event.ticket_urgency === 'critical' && RSVP_CRITERIA.grabUrgentFree) {
    return {
      should: true,
      reason: 'URGENT: Free ticket ending soon!',
      score: scoreResult,
      urgent: true
    };
  }
  
  // Auto-grab urgent early-bird
  if (event.ticket_urgency === 'critical' && RSVP_CRITERIA.grabUrgentEarlyBird && ticketPrice <= RSVP_CRITERIA.maxSingleTicket) {
    return {
      should: true,
      reason: 'URGENT: Early-bird ending soon!',
      score: scoreResult,
      urgent: true
    };
  }
  
  // Regular approval
  return {
    should: true,
    reason: `Good match (score: ${scoreResult.score})`,
    score: scoreResult,
    urgent: false
  };
}

// Enhanced RSVP with deep research
async function rsvpToEvent(event) {
  console.log(`\n🎫 RSVP Analysis: ${event.name}`);
  console.log(`   Score: ${event.overall_score}/100`);
  console.log(`   Networking: ${event.networking_rating}`);
  console.log(`   Ticket Urgency: ${event.ticket_urgency}`);
  
  if (!EVENTBRITE_API_KEY) {
    return { success: false, error: 'API key missing' };
  }
  
  if (!EVENTBRITE_USER_EMAIL) {
    return { success: false, error: 'Email missing' };
  }
  
  try {
    // Get detailed ticket info
    const ticketsUrl = `https://www.eventbriteapi.com/v3/events/${event.id}/ticket_classes/`;
    const ticketsResponse = await fetch(ticketsUrl, {
      headers: { 'Authorization': `Bearer ${EVENTBRITE_API_KEY}` }
    });
    
    if (!ticketsResponse.ok) {
      throw new Error(`Failed to fetch tickets: ${ticketsResponse.status}`);
    }
    
    const ticketsData = await ticketsResponse.json();
    const ticketClasses = ticketsData.ticket_classes || [];
    
    // Find best available ticket based on research
    const bestTicket = ticketClasses.find(ticket => {
      const cost = parseFloat(ticket.cost?.value || 999);
      const isAvailable = ticket.quantity?.total > 0 && !ticket.sold_out;
      
      // Prioritize: Free > Early-bird ≤$15 > Regular ≤$30
      if (!isAvailable) return false;
      if (cost === 0) return true; // Free is best
      if (ticket.name?.toLowerCase().includes('early') && cost <= 15) return true;
      if (cost <= 30) return true;
      
      return false;
    });
    
    if (!bestTicket) {
      return { success: false, error: 'No eligible tickets available' };
    }
    
    console.log(`   🎫 Best ticket: ${bestTicket.name || 'General'} ($${bestTicket.cost?.value || 0})`);
    
    // Create order
    const orderUrl = `https://www.eventbriteapi.com/v3/events/${event.id}/orders/`;
    const orderData = {
      ticket_classes: [{ id: bestTicket.id, quantity: 1 }],
      attendee: {
        name: EVENTBRITE_USER_NAME,
        email: EVENTBRITE_USER_EMAIL
      }
    };
    
    const orderResponse = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}));
      throw new Error(`Order failed: ${orderResponse.status}`);
    }
    
    const orderData_response = await orderResponse.json();
    
    console.log(`   ✅ RSVP successful! Order: ${orderData_response.id}`);
    
    return {
      success: true,
      orderId: orderData_response.id,
      eventId: event.id,
      eventName: event.name,
      ticketName: bestTicket.name || 'General Admission',
      price: bestTicket.cost?.value || 0,
      eventUrl: event.url,
      rsvpdAt: new Date().toISOString(),
      
      // Deep research data
      overall_score: event.overall_score,
      networking_rating: event.networking_rating,
      ticket_urgency: event.ticket_urgency,
      venue_name: event.venue?.name,
      distance: event.distance
    };
    
  } catch (error) {
    console.error(`   ❌ RSVP failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Save RSVPs with research data
async function saveRSVPs(rsvps) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const rsvpsPath = path.join(process.cwd(), 'data', 'eventbrite-rsvps.json');
  
  let existingRsvps = { rsvps: [], total_count: 0 };
  try {
    const existing = await fs.readFile(rsvpsPath, 'utf-8');
    existingRsvps = JSON.parse(existing);
  } catch (e) {}
  
  const newRsvps = [...(existingRsvps.rsvps || []), ...rsvps];
  
  const data = {
    last_updated: new Date().toISOString(),
    rsvps: newRsvps,
    total_count: newRsvps.length,
    total_spent: newRsvps.reduce((sum, r) => sum + (r.price || 0), 0)
  };
  
  await fs.writeFile(rsvpsPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved ${rsvps.length} RSVPs`);
}

// Main function with deep research
async function run() {
  console.log('🎫 Eventbrite RSVP Agent (Deep Research) starting...\n');
  
  if (!EVENTBRITE_API_KEY) {
    console.log('⚠️  No API key - will analyze but not RSVP\n');
  }
  
  // Load events with deep research
  const fs = require('fs').promises;
  const path = require('path');
  const eventsPath = path.join(process.cwd(), 'data', 'eventbrite-events.json');
  
  let eventsData;
  try {
    const fileContents = await fs.readFile(eventsPath, 'utf-8');
    eventsData = JSON.parse(fileContents);
  } catch (error) {
    console.error('❌ No events found. Run eventbrite-scout.js first!');
    return [];
  }
  
  const events = eventsData.events || [];
  console.log(`📋 Loaded ${events.length} events with deep research\n`);
  
  // Calculate monthly spending
  const rsvpsPath = path.join(process.cwd(), 'data', 'eventbrite-rsvps.json');
  let monthlySpent = 0;
  try {
    const existing = await fs.readFile(rsvpsPath, 'utf-8');
    const data = JSON.parse(existing);
    const thisMonth = new Date().getMonth();
    const rsvpsThisMonth = data.rsvps?.filter(r => {
      const rsvpDate = new Date(r.rsvpdAt);
      return rsvpDate.getMonth() === thisMonth;
    }) || [];
    monthlySpent = rsvpsThisMonth.reduce((sum, r) => sum + (r.price || 0), 0);
    console.log(`💰 Monthly spending: $${monthlySpent}/${RSVP_CRITERIA.maxMonthlyBudget}\n`);
  } catch (e) {}
  
  // Process events
  const rsvps = [];
  
  for (const event of events) {
    const decision = shouldRSVP(event, monthlySpent);
    
    console.log(`\n📅 ${event.name}`);
    console.log(`   Score: ${event.overall_score}/100 | Networking: ${event.networking_rating}`);
    console.log(`   Ticket: ${event.is_free ? '🟢 FREE' : `💰 $${event.price}`}`);
    console.log(`   Decision: ${decision.should ? '✅ RSVP' : '❌ Skip'} - ${decision.reason}`);
    
    if (decision.should) {
      const result = await rsvpToEvent(event);
      if (result.success) {
        rsvps.push(result);
        monthlySpent += result.price || 0;
      }
    }
  }
  
  // Save RSVPs
  if (rsvps.length > 0) {
    await saveRSVPs(rsvps);
    
    console.log('\n🎉 RSVP Agent completed!');
    console.log(`✅ RSVP'd to ${rsvps.length} event(s):\n`);
    
    rsvps.forEach((rsvp, i) => {
      console.log(`${i + 1}. ${rsvp.eventName}`);
      console.log(`   🎫 ${rsvp.ticketName} ($${rsvp.price})`);
      console.log(`   📊 Score: ${rsvp.overall_score}/100 | Networking: ${rsvp.networking_rating}`);
      console.log(`   📍 ${rsvp.venue_name} (${rsvp.distance})`);
      console.log(`   🔗 ${rsvp.eventUrl}\n`);
    });
  } else {
    console.log('\n✅ No new RSVPs needed');
  }
  
  return rsvps;
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, shouldRSVP, rsvpToEvent, calculateRSVPScore };

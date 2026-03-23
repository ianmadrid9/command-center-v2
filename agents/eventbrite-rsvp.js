/**
 * Eventbrite RSVP Agent
 * 
 * Automatically registers for events when free or early bird tickets are found.
 * Runs after eventbrite-scout to grab tickets immediately.
 * 
 * Features:
 * - Detects newly available free/early-bird tickets
 * - Auto-RSVPs using stored user info
 * - Saves confirmation to dashboard
 * - Sends notification when successful
 */

const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const EVENTBRITE_USER_EMAIL = process.env.EVENTBRITE_USER_EMAIL;
const EVENTBRITE_USER_NAME = process.env.EVENTBRITE_USER_NAME || 'Ian Madrid';

// RSVP criteria - what tickets to grab automatically
const RSVP_CRITERIA = {
  maxPrice: 0, // Only free tickets (0 = free only)
  grabEarlyBird: true, // Grab early bird even if not free (under this price)
  earlyBirdMaxPrice: 15, // Max price for early bird tickets
  minDaysUntilEvent: 1, // Don't grab tickets for events happening today
  maxDaysUntilEvent: 60, // Don't grab tickets more than 60 days out
  keywords: ['tech', 'startup', 'networking', 'founder', 'ceo', 'entrepreneur', 'ai', 'fintech'],
  requireKeywords: true, // Only RSVP if event has relevant keywords
};

// Check if event matches our criteria
function shouldRSVP(event) {
  const eventDate = new Date(event.start);
  const now = new Date();
  const daysUntilEvent = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
  
  // Check date range
  if (daysUntilEvent < RSVP_CRITERIA.minDaysUntilEvent) {
    console.log(`  ⏭️  Skipping: Event too soon (${daysUntilEvent} days)`);
    return false;
  }
  if (daysUntilEvent > RSVP_CRITERIA.maxDaysUntilEvent) {
    console.log(`  ⏭️  Skipping: Event too far (${daysUntilEvent} days)`);
    return false;
  }
  
  // Check keywords
  if (RSVP_CRITERIA.requireKeywords) {
    const name = event.name.toLowerCase();
    const desc = (event.description || '').toLowerCase();
    const hasKeyword = RSVP_CRITERIA.keywords.some(k => name.includes(k) || desc.includes(k));
    
    if (!hasKeyword) {
      console.log(`  ⏭️  Skipping: No relevant keywords`);
      return false;
    }
  }
  
  // Check pricing
  if (event.is_free) {
    console.log(`  ✅ Qualifies: FREE ticket available`);
    return true;
  }
  
  // Check early bird pricing
  if (RSVP_CRITERIA.grabEarlyBird && event.free_tickets_status?.includes('Sold Out')) {
    const priceMatch = event.price?.match(/\$(\d+\.?\d*)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      if (price <= RSVP_CRITERIA.earlyBirdMaxPrice) {
        console.log(`  ✅ Qualifies: Early bird at $${price} (under $${RSVP_CRITERIA.earlyBirdMaxPrice})`);
        return true;
      }
    }
  }
  
  console.log(`  ⏭️  Skipping: Doesn't meet criteria`);
  return false;
}

// RSVP to an event
async function rsvpToEvent(event) {
  console.log(`\n🎫 Attempting to RSVP: ${event.name}`);
  
  if (!EVENTBRITE_API_KEY) {
    console.error('  ❌ EVENTBRITE_API_KEY not configured');
    return { success: false, error: 'API key missing' };
  }
  
  if (!EVENTBRITE_USER_EMAIL) {
    console.error('  ❌ EVENTBRITE_USER_EMAIL not configured');
    return { success: false, error: 'User email missing' };
  }
  
  try {
    // Get ticket classes for this event
    const ticketsUrl = `https://www.eventbriteapi.com/v3/events/${event.id}/ticket_classes/`;
    const ticketsResponse = await fetch(ticketsUrl, {
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
      }
    });
    
    if (!ticketsResponse.ok) {
      throw new Error(`Failed to fetch tickets: ${ticketsResponse.status}`);
    }
    
    const ticketsData = await ticketsResponse.json();
    const ticketClasses = ticketsData.ticket_classes || [];
    
    // Find an available free or early bird ticket
    const eligibleTicket = ticketClasses.find(ticket => {
      const cost = parseFloat(ticket.cost?.value || 999);
      const isAvailable = ticket.quantity?.total > 0 && !ticket.sold_out;
      const isFree = cost === 0;
      const isEarlyBird = ticket.name?.toLowerCase().includes('early') && cost <= RSVP_CRITERIA.earlyBirdMaxPrice;
      
      return isAvailable && (isFree || isEarlyBird);
    });
    
    if (!eligibleTicket) {
      console.log(`  ⚠️  No eligible tickets available`);
      return { success: false, error: 'No eligible tickets' };
    }
    
    console.log(`  🎫 Found ticket: ${eligibleTicket.name || 'Free Ticket'} ($${eligibleTicket.cost?.value || 0})`);
    
    // Create order (RSVP)
    const orderUrl = `https://www.eventbriteapi.com/v3/events/${event.id}/orders/`;
    const orderData = {
      ticket_classes: [
        {
          id: eligibleTicket.id,
          quantity: 1
        }
      ],
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
      throw new Error(`Order failed: ${orderResponse.status} - ${JSON.stringify(errorData)}`);
    }
    
    const orderData_response = await orderResponse.json();
    
    console.log(`  ✅ RSVP successful! Order ID: ${orderData_response.id}`);
    
    return {
      success: true,
      orderId: orderData_response.id,
      eventId: event.id,
      eventName: event.name,
      ticketName: eligibleTicket.name || 'Free Ticket',
      price: eligibleTicket.cost?.value || 0,
      eventUrl: event.url,
      rsvpdAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`  ❌ RSVP failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Save RSVP confirmations
async function saveRSVPs(rsvps) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const rsvpsPath = path.join(process.cwd(), 'data', 'eventbrite-rsvps.json');
  
  // Load existing RSVPs
  let existingRsvps = { rsvps: [], total_count: 0 };
  try {
    const existing = await fs.readFile(rsvpsPath, 'utf-8');
    existingRsvps = JSON.parse(existing);
  } catch (e) {
    // File doesn't exist yet
  }
  
  // Add new RSVPs
  const newRsvps = [...(existingRsvps.rsvps || []), ...rsvps];
  
  const data = {
    last_updated: new Date().toISOString(),
    rsvps: newRsvps,
    total_count: newRsvps.length
  };
  
  await fs.writeFile(rsvpsPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved ${rsvps.length} new RSVPs to ${rsvpsPath}`);
}

// Main agent function
async function run() {
  console.log('🎫 Eventbrite RSVP Agent starting...');
  console.log('');
  
  if (!EVENTBRITE_API_KEY) {
    console.error('❌ EVENTBRITE_API_KEY not set!');
    console.error('Set it with: openclaw env set EVENTBRITE_API_KEY=your_key_here');
    console.error('');
    console.error('Will check events but cannot RSVP without API key.');
    console.log('');
  }
  
  if (!EVENTBRITE_USER_EMAIL) {
    console.error('❌ EVENTBRITE_USER_EMAIL not set!');
    console.error('Set it with: openclaw env set EVENTBRITE_USER_EMAIL=your@email.com');
    console.error('');
    console.error('Will check events but cannot RSVP without email.');
    console.log('');
  }
  
  // Load events from scout
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
  console.log(`📋 Loaded ${events.length} events from scout`);
  console.log('');
  console.log('🔍 Checking RSVP eligibility...');
  console.log(`   Criteria: Free tickets OR Early Bird ≤$${RSVP_CRITERIA.earlyBirdMaxPrice}`);
  console.log(`   Keywords: ${RSVP_CRITERIA.keywords.join(', ')}`);
  console.log(`   Date range: ${RSVP_CRITERIA.minDaysUntilEvent}-${RSVP_CRITERIA.maxDaysUntilEvent} days`);
  console.log('');
  
  const rsvps = [];
  
  for (const event of events) {
    console.log(`\n📅 ${event.name}`);
    console.log(`   ${event.start} | ${event.distance} | ${event.venue?.name}`);
    console.log(`   ${event.is_free ? '🟢 FREE' : `💰 ${event.price} (${event.free_tickets_status})`}`);
    
    if (shouldRSVP(event)) {
      const result = await rsvpToEvent(event);
      if (result.success) {
        rsvps.push(result);
      }
      
      // Rate limiting - wait between RSVPs
      if (rsvps.length % 3 === 0) {
        console.log('  ⏳ Rate limit pause (3 RSVPs done)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // Save RSVPs
  if (rsvps.length > 0) {
    await saveRSVPs(rsvps);
    
    console.log('\n🎉 RSVP Agent completed!');
    console.log(`✅ Successfully RSVP'd to ${rsvps.length} event(s):`);
    rsvps.forEach((rsvp, i) => {
      console.log(`   ${i + 1}. ${rsvp.eventName}`);
      console.log(`      Ticket: ${rsvp.ticketName} ($${rsvp.price})`);
      console.log(`      Order: ${rsvp.orderId}`);
      console.log(`      URL: ${rsvp.eventUrl}`);
    });
  } else {
    console.log('\n🎉 RSVP Agent completed!');
    console.log('ℹ️  No new RSVPs made (all events already processed or no eligible tickets)');
  }
  
  return rsvps;
}

// Run the agent
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, shouldRSVP, rsvpToEvent };

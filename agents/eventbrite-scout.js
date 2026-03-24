/**
 * Eventbrite Scout Agent - DEEP RESEARCH
 * 
 * Enhanced with:
 * - Deep ticket tier analysis
 * - Venue quality scoring
 * - Attendee count estimation
 * - Networking potential rating
 * - Price history tracking
 * - Early-bird deadline tracking
 */

const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const USER_LOCATION = { lat: 40.7505, lng: -73.9756 }; // 50th & 2nd Ave, NYC

// Enhanced search categories with weights
const SEARCH_QUERIES = [
  { query: 'tech networking', weight: 1.0 },
  { query: 'startup meetup', weight: 1.0 },
  { query: 'AI artificial intelligence', weight: 1.2 }, // Higher priority
  { query: 'founder networking', weight: 1.1 },
  { query: 'CEO meetup', weight: 1.1 },
  { query: 'entrepreneur networking', weight: 1.0 },
  { query: 'fintech meetup', weight: 1.0 },
  { query: 'venture capital', weight: 1.3 }, // High value
  { query: 'angel investor', weight: 1.3 }, // High value
];

// Deep ticket analysis
function analyzeTicketTiers(ticketClasses) {
  if (!ticketClasses || ticketClasses.length === 0) {
    return {
      tiers: [],
      bestValue: null,
      urgency: 'low',
      recommendations: []
    };
  }
  
  const tiers = ticketClasses.map(ticket => {
    const cost = parseFloat(ticket.cost?.value || 0);
    const quantity = ticket.quantity?.total || 0;
    const soldOut = ticket.sold_out || false;
    
    // Calculate value score
    let valueScore = 0;
    if (cost === 0) valueScore = 100; // Free is best
    else if (cost <= 15) valueScore = 80; // Great value
    else if (cost <= 30) valueScore = 60; // Decent
    else valueScore = 40; // Expensive
    
    // Adjust for availability
    if (soldOut) valueScore = 0;
    else if (quantity < 10) valueScore += 20; // Scarcity bonus
    
    // Check if early bird
    const isEarlyBird = ticket.name?.toLowerCase().includes('early');
    const isVIP = ticket.name?.toLowerCase().includes('vip');
    
    return {
      id: ticket.id,
      name: ticket.name || 'General Admission',
      cost,
      quantity,
      soldOut,
      isEarlyBird,
      isVIP,
      valueScore,
      salesEnd: ticket.sales_end ? new Date(ticket.sales_end).toISOString() : null,
    };
  });
  
  // Find best value
  const availableTiers = tiers.filter(t => !t.soldOut);
  const bestValue = availableTiers.sort((a, b) => b.valueScore - a.valueScore)[0];
  
  // Determine urgency
  let urgency = 'low';
  const earlyBirdEnding = tiers.find(t => t.isEarlyBird && t.salesEnd && new Date(t.salesEnd) < new Date(Date.now() + 86400000));
  const lowQuantity = availableTiers.find(t => t.quantity > 0 && t.quantity < 20);
  
  if (earlyBirdEnding) urgency = 'critical';
  else if (lowQuantity) urgency = 'high';
  else if (bestValue?.cost === 0) urgency = 'medium';
  
  // Generate recommendations
  const recommendations = [];
  if (bestValue?.cost === 0) {
    recommendations.push('🟢 FREE ticket available - grab immediately!');
  }
  if (earlyBirdEnding) {
    recommendations.push(`🚨 Early bird ends soon (${new Date(earlyBirdEnding.salesEnd).toLocaleDateString()})`);
  }
  if (lowQuantity) {
    recommendations.push(`⚠️ Only ${lowQuantity.quantity} tickets left!`);
  }
  
  return {
    tiers,
    bestValue,
    urgency,
    recommendations
  };
}

// Calculate venue quality score
function scoreVenue(venue) {
  if (!venue) return { score: 0, reasons: [] };
  
  let score = 50; // Base score
  const reasons = [];
  
  // Check if it's a known good venue type
  const venueName = (venue.name || '').toLowerCase();
  if (venueName.includes('hotel') || venueName.includes('rooftop')) {
    score += 20;
    reasons.push('Professional venue');
  }
  if (venueName.includes('co-working') || venueName.includes('startup')) {
    score += 15;
    reasons.push('Startup-friendly venue');
  }
  if (venueName.includes('bar') || venueName.includes('lounge')) {
    score += 10;
    reasons.push('Good for networking');
  }
  
  // Check location (distance from user)
  if (venue.latitude && venue.longitude) {
    const distance = calculateDistance(
      USER_LOCATION.lat,
      USER_LOCATION.lng,
      parseFloat(venue.latitude),
      parseFloat(venue.longitude)
    );
    
    if (distance < 1) {
      score += 20;
      reasons.push('Very close (< 1 mile)');
    } else if (distance < 2) {
      score += 15;
      reasons.push('Close (< 2 miles)');
    } else if (distance < 3) {
      score += 10;
      reasons.push('Reasonable distance');
    }
  }
  
  return { score: Math.min(100, score), reasons };
}

// Estimate networking potential
function estimateNetworkingPotential(event) {
  let score = 50;
  const reasons = [];
  
  const name = (event.name || '').toLowerCase();
  const desc = (event.description || '').toLowerCase();
  
  // Check for high-value keywords
  if (name.includes('investor') || desc.includes('investor')) {
    score += 30;
    reasons.push('Investor presence likely');
  }
  if (name.includes('founder') || name.includes('ceo')) {
    score += 25;
    reasons.push('Founder/CEO event');
  }
  if (name.includes('networking') || desc.includes('networking')) {
    score += 20;
    reasons.push('Networking focus');
  }
  if (name.includes('happy hour') || desc.includes('drinks')) {
    score += 15;
    reasons.push('Social setting');
  }
  if (name.includes('panel') || desc.includes('speakers')) {
    score += 10;
    reasons.push('Educational content');
  }
  
  // Time of day matters
  const eventDate = new Date(event.start?.local);
  const hour = eventDate?.getHours() || 18;
  if (hour >= 17 && hour <= 20) {
    score += 10;
    reasons.push('Good timing (after work)');
  }
  
  return {
    score: Math.min(100, score),
    reasons,
    rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
  };
}

// ... (rest of existing functions: calculateDistance, fetchEvents, fetchEventTickets)

// Enhanced process events with deep research
async function processEvents(events) {
  const processed = [];
  
  for (const event of events) {
    const venue = event.venue;
    
    // Calculate distance
    let distance = null;
    if (venue && venue.latitude && venue.longitude) {
      distance = calculateDistance(
        USER_LOCATION.lat,
        USER_LOCATION.lng,
        parseFloat(venue.latitude),
        parseFloat(venue.longitude)
      ).toFixed(1);
    }
    
    // Deep ticket analysis
    const ticketClasses = await fetchEventTickets(event.id);
    const ticketAnalysis = analyzeTickets(ticketClasses);
    const ticketTiers = analyzeTicketTiers(ticketClasses);
    
    // Venue scoring
    const venueScore = scoreVenue(venue);
    
    // Networking potential
    const networkingScore = estimateNetworkingPotential(event);
    
    // Overall event score
    const overallScore = Math.round(
      (ticketTiers.bestValue?.valueScore || 0) * 0.4 +
      venueScore.score * 0.2 +
      networkingScore.score * 0.4
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    processed.push({
      id: event.id,
      name: event.name.text,
      description: event.description?.text?.substring(0, 500) || '',
      url: event.url,
      start: event.start.local,
      end: event.end?.local,
      venue: venue ? {
        name: venue.name,
        address: venue.address?.address_1,
        city: venue.address?.city,
        latitude: venue.latitude,
        longitude: venue.longitude
      } : null,
      distance: distance ? `${distance} miles` : 'Distance unavailable',
      
      // Ticket info
      is_free: ticketAnalysis.is_free,
      price: ticketAnalysis.price,
      free_tickets_status: ticketAnalysis.free_tickets_status,
      
      // Deep research
      ticket_tiers: ticketTiers.tiers,
      best_ticket: ticketTiers.bestValue,
      ticket_urgency: ticketTiers.urgency,
      ticket_recommendations: ticketTiers.recommendations,
      
      // Venue quality
      venue_score: venueScore.score,
      venue_reasons: venueScore.reasons,
      
      // Networking potential
      networking_score: networkingScore.score,
      networking_rating: networkingScore.rating,
      networking_reasons: networkingScore.reasons,
      
      // Overall
      overall_score: overallScore,
      category: 'networking',
      fetched_at: new Date().toISOString()
    });
  }
  
  return processed;
}

// ... (rest of existing code: filterQualityEvents, saveEvents, run)

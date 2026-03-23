/**
 * Eventbrite Scout Agent
 * 
 * Runs daily to find new tech/networking events near 50th & 2nd Ave, NYC
 * Updates dashboard with fresh events and distances
 * 
 * UPDATED: Now fetches actual ticket data to verify true pricing
 */

const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const USER_LOCATION = { lat: 40.7505, lng: -73.9756 }; // 50th & 2nd Ave, NYC

// Event categories to search for
const SEARCH_CATEGORIES = [
  'startup-networking',
  'tech-networking',
  'business-networking',
  'founder-events',
  'ceo-networking',
  'entrepreneur-events'
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fetch events from Eventbrite API
async function fetchEvents(location = 'New York') {
  // Search for events with relevant keywords directly in the query
  // Eventbrite API v3 doesn't support keyword search well, so we search broadly and filter
  const url = `https://www.eventbriteapi.com/v3/events/search/?q=tech+startup+networking&location.address=${location}&sort_by=date`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Fetch actual ticket information for an event
async function fetchEventTickets(eventId) {
  const url = `https://www.eventbriteapi.com/v3/events/${eventId}/ticket_classes/`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.ticket_classes || [];
  } catch (error) {
    console.error(`Error fetching tickets for event ${eventId}:`, error);
    return null;
  }
}

// Analyze ticket classes to determine true pricing
function analyzeTickets(ticketClasses) {
  if (!ticketClasses || ticketClasses.length === 0) {
    return {
      is_free: false,
      price: 'Unknown',
      free_tickets_status: 'No ticket info available',
      has_free_tickets: false
    };
  }
  
  // Find free and paid tickets
  const freeTickets = ticketClasses.filter(t => t.cost?.value === 0 || t.cost?.value === '0');
  const paidTickets = ticketClasses.filter(t => t.cost?.value > 0 || t.cost?.value === '0' && !t.free);
  
  // Check if any free tickets are available
  const availableFreeTickets = freeTickets.filter(t => t.quantity?.total !== 0 && !t.sold_out);
  const soldOutFreeTickets = freeTickets.filter(t => t.quantity?.total === 0 || t.sold_out);
  
  // Find the cheapest paid ticket
  const cheapestPaid = paidTickets.length > 0 
    ? Math.min(...paidTickets.map(t => parseFloat(t.cost?.value || 999)))
    : null;
  
  // Determine status
  if (availableFreeTickets.length > 0) {
    return {
      is_free: true,
      price: 'Free',
      free_tickets_status: 'Free tickets available',
      has_free_tickets: true
    };
  }
  
  if (soldOutFreeTickets.length > 0 && cheapestPaid) {
    return {
      is_free: false,
      price: `$${cheapestPaid.toFixed(2)}`,
      free_tickets_status: 'Sold Out - Early Bird Free tickets gone',
      has_free_tickets: false
    };
  }
  
  if (cheapestPaid) {
    return {
      is_free: false,
      price: `$${cheapestPaid.toFixed(2)}`,
      free_tickets_status: 'No free tickets offered',
      has_free_tickets: false
    };
  }
  
  return {
    is_free: false,
    price: 'Unknown',
    free_tickets_status: 'No ticket info available',
    has_free_tickets: false
  };
}

// Process and enrich events with distance and ticket info
async function processEvents(events) {
  const processed = [];
  
  for (const event of events) {
    const venue = event.venue;
    let distance = null;
    
    if (venue && venue.latitude && venue.longitude) {
      distance = calculateDistance(
        USER_LOCATION.lat,
        USER_LOCATION.lng,
        parseFloat(venue.latitude),
        parseFloat(venue.longitude)
      ).toFixed(1);
    }
    
    // Fetch actual ticket information
    const ticketClasses = await fetchEventTickets(event.id);
    const ticketAnalysis = analyzeTickets(ticketClasses);
    
    // Wait a bit to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    processed.push({
      id: event.id,
      name: event.name.text,
      description: event.description?.text?.substring(0, 200) || '',
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
      is_free: ticketAnalysis.is_free,
      price: ticketAnalysis.price,
      free_tickets_status: ticketAnalysis.free_tickets_status,
      category: 'networking',
      fetched_at: new Date().toISOString()
    });
  }
  
  return processed;
}

// Filter events by quality criteria
function filterQualityEvents(events) {
  const keywords = ['tech', 'startup', 'networking', 'founder', 'ceo', 'entrepreneur', 'ai', 'fintech'];
  
  return events.filter(event => {
    const name = event.name.toLowerCase();
    const desc = event.description.toLowerCase();
    
    // Must have at least one keyword
    const hasKeyword = keywords.some(k => name.includes(k) || desc.includes(k));
    
    // Must have venue info
    const hasVenue = event.venue && event.venue.name;
    
    // Prioritize truly free events, but include paid ones with sold-out free tickets
    const isActuallyFree = event.is_free;
    const hadFreeTickets = event.free_tickets_status?.includes('Sold Out');
    
    return hasKeyword && hasVenue && (isActuallyFree || hadFreeTickets);
  });
}

// Save events to dashboard data file
async function saveEvents(events) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const dataPath = path.join(process.cwd(), 'data', 'eventbrite-events.json');
  
  const data = {
    last_updated: new Date().toISOString(),
    events: events,
    total_count: events.length
  };
  
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${events.length} events to ${dataPath}`);
}

// Main agent function
async function run() {
  if (!EVENTBRITE_API_KEY) {
    console.error('❌ EVENTBRITE_API_KEY not set!');
    console.error('');
    console.error('To fix this:');
    console.error('1. Get your API key from: https://www.eventbrite.com/platform/api-keys');
    console.error('2. Add it to your .env file:');
    console.error('   EVENTBRITE_API_KEY=your_key_here');
    console.error('3. Or set it in Gateway: openclaw env set EVENTBRITE_API_KEY=your_key_here');
    console.error('');
    console.error('Using cached events from data/eventbrite-events.json for now...');
    
    // Try to load cached events
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'data', 'eventbrite-events.json');
      const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
      console.log(`✅ Loaded ${data.events?.length || 0} cached events`);
      return data.events || [];
    } catch (e) {
      console.error('No cached events found');
      return [];
    }
  }
  
  console.log('🔍 Eventbrite Scout Agent starting...');
  console.log(`📍 Searching near: 50th & 2nd Ave, NYC`);
  console.log(`🎫 Checking actual ticket availability (not just event.free flag)`);
  console.log('');
  
  const allEvents = [];
  
  // Search with keyword-based approach (Eventbrite API works better this way)
  console.log(`Searching: tech startup networking in NYC...`);
  const events = await fetchEvents();
  console.log(`  Found ${events.length} events, fetching ticket details...`);
  const processed = await processEvents(events);
  allEvents.push(...processed);
  
  // Remove duplicates by event ID
  const uniqueEvents = allEvents.filter((event, index, self) =>
    index === self.findIndex(e => e.id === event.id)
  );
  
  console.log(`\n📊 Total unique events: ${uniqueEvents.length}`);
  
  // Filter for quality
  const qualityEvents = filterQualityEvents(uniqueEvents);
  console.log(`✅ Quality events after filtering: ${qualityEvents.length}`);
  
  // Sort: truly free first, then by date
  qualityEvents.sort((a, b) => {
    if (a.is_free && !b.is_free) return -1;
    if (!a.is_free && b.is_free) return 1;
    return new Date(a.start) - new Date(b.start);
  });
  
  // Save to dashboard (only if we have events to prevent data loss)
  if (qualityEvents.length > 0) {
    await saveEvents(qualityEvents);
  } else {
    console.log('\n⚠️  No events to save - keeping existing cached data');
  }
  
  console.log('\n🎉 Eventbrite Scout Agent completed!');
  console.log(`📅 Next events:`);
  qualityEvents.slice(0, 5).forEach(event => {
    const priceTag = event.is_free ? '🟢 FREE' : `💰 ${event.price} (${event.free_tickets_status})`;
    console.log(`   • ${event.name}`);
    console.log(`     ${event.start} | ${event.distance} | ${event.venue?.name}`);
    console.log(`     ${priceTag}`);
  });
  
  // Summary
  const freeCount = qualityEvents.filter(e => e.is_free).length;
  const paidCount = qualityEvents.filter(e => !e.is_free).length;
  const soldOutFreeCount = qualityEvents.filter(e => e.free_tickets_status?.includes('Sold Out')).length;
  
  console.log('\n📊 Summary:');
  console.log(`   🟢 Truly free: ${freeCount}`);
  console.log(`   💰 Paid (free sold out): ${soldOutFreeCount}`);
  console.log(`   Total: ${paidCount}`);
  
  return qualityEvents;
}

// Run the agent
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, fetchEvents, processEvents, filterQualityEvents };

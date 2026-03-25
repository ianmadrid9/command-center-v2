import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventName, eventDate, venue, ticketUrl, isFree, price } = await request.json();
    
    if (!eventId || !eventName) {
      return NextResponse.json({ error: 'Event ID and name required' }, { status: 400 });
    }
    
    console.log('🎫 Auto-reserving ticket:', eventName);
    
    // TODO: Browser automation to book on Eventbrite
    // For now, create a placeholder ticket
    // Full implementation would:
    // 1. Open Eventbrite in managed browser
    // 2. Navigate to event URL
    // 3. Click "Register" or "Get Tickets"
    // 4. Fill in attendee info
    // 5. Complete checkout (free = no payment)
    // 6. Scrape QR code from confirmation page
    // 7. Save to eventbrite-tickets.json
    
    const dataPath = path.join(process.cwd(), 'data', 'eventbrite-tickets.json');
    let data;
    try {
      const fileContents = await fs.readFile(dataPath, 'utf-8');
      data = JSON.parse(fileContents);
    } catch {
      data = { tickets: [], last_updated: null };
    }
    
    // Check if already reserved
    const existingIndex = data.tickets.findIndex((t: any) => t.eventId === eventId);
    if (existingIndex >= 0) {
      return NextResponse.json({ 
        error: 'Already reserved this event',
        ticket: data.tickets[existingIndex]
      });
    }
    
    // Create placeholder ticket (QR code will be added after booking)
    const ticket = {
      id: `ticket-${Date.now()}`,
      eventId,
      eventName,
      eventDate,
      venue,
      ticketUrl,
      isFree: isFree || false,
      price: price || 'Free',
      qrCodeUrl: null,
      qrCodeData: null,
      status: 'reserved' as const,
      reservedAt: new Date().toISOString(),
    };
    
    data.tickets.unshift(ticket);
    data.last_updated = new Date().toISOString();
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    
    console.log('✅ Ticket reserved (placeholder - QR code pending)');
    
    // TODO: Trigger browser automation to complete booking
    // For now, return success with placeholder
    return NextResponse.json({
      success: true,
      ticket,
      message: 'Ticket reserved. QR code will be added once booking is confirmed.',
    });
  } catch (error) {
    console.error('❌ Error reserving ticket:', error);
    return NextResponse.json(
      { error: 'Failed to reserve ticket', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

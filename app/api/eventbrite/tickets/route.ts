import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'eventbrite-tickets.json');
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      success: true,
      tickets: data.tickets || [],
      last_updated: data.last_updated,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      tickets: [],
      message: 'No tickets yet',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventName, eventDate, venue, ticketUrl, isFree, price, qrCodeUrl, qrCodeData } = await request.json();
    
    if (!eventId || !eventName) {
      return NextResponse.json({ error: 'Event ID and name required' }, { status: 400 });
    }
    
    const dataPath = path.join(process.cwd(), 'data', 'eventbrite-tickets.json');
    let data;
    try {
      const fileContents = await fs.readFile(dataPath, 'utf-8');
      data = JSON.parse(fileContents);
    } catch {
      data = { tickets: [], last_updated: null };
    }
    
    // Check if ticket already exists
    const existingIndex = data.tickets.findIndex((t: any) => t.eventId === eventId);
    
    const ticket = {
      id: `ticket-${Date.now()}`,
      eventId,
      eventName,
      eventDate,
      venue,
      ticketUrl,
      isFree: isFree || false,
      price: price || 'Free',
      qrCodeUrl: qrCodeUrl || null,
      qrCodeData: qrCodeData || null,
      status: qrCodeUrl ? 'confirmed' : 'reserved',
      reservedAt: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      // Update existing ticket
      data.tickets[existingIndex] = { ...data.tickets[existingIndex], ...ticket };
    } else {
      // Add new ticket
      data.tickets.unshift(ticket);
    }
    
    data.last_updated = new Date().toISOString();
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error saving ticket:', error);
    return NextResponse.json(
      { error: 'Failed to save ticket', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id');
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }
    
    const dataPath = path.join(process.cwd(), 'data', 'eventbrite-tickets.json');
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContents);
    
    data.tickets = data.tickets.filter((t: any) => t.id !== ticketId);
    data.last_updated = new Date().toISOString();
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Ticket removed',
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

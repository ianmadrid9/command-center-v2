import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'eventbrite-rsvps.json');
    
    try {
      const fileContents = await fs.readFile(dataPath, 'utf-8');
      const data = JSON.parse(fileContents);
      
      return NextResponse.json({
        success: true,
        last_updated: data.last_updated,
        rsvps: data.rsvps || [],
        total_count: data.total_count || 0
      });
    } catch (error) {
      // File doesn't exist yet - return empty array
      return NextResponse.json({
        success: true,
        last_updated: null,
        rsvps: [],
        total_count: 0,
        message: 'No RSVPs yet. Run the Eventbrite RSVP agent to grab tickets.'
      });
    }
  } catch (error) {
    console.error('Error reading RSVP data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read RSVP data',
        rsvps: []
      },
      { status: 500 }
    );
  }
}

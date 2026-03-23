import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'eventbrite-events.json');
    
    try {
      const fileContents = await fs.readFile(dataPath, 'utf-8');
      const data = JSON.parse(fileContents);
      
      return NextResponse.json({
        success: true,
        last_updated: data.last_updated,
        events: data.events || [],
        total_count: data.total_count || 0
      });
    } catch (error) {
      // File doesn't exist yet - return empty array
      return NextResponse.json({
        success: true,
        last_updated: null,
        events: [],
        total_count: 0,
        message: 'No events yet. Run the Eventbrite Scout agent to fetch events.'
      });
    }
  } catch (error) {
    console.error('Error reading eventbrite events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read event data',
        events: []
      },
      { status: 500 }
    );
  }
}

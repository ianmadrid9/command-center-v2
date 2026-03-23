import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'data', 'subagent-memory.md');

// Available tools for subagents
const TOOLS = {
  // Read subagent memory
  'read_memory': async () => {
    try {
      const content = await fs.readFile(MEMORY_FILE, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: 'Memory file not found' };
    }
  },
  
  // Get current events
  'get_events': async () => {
    try {
      const eventsPath = path.join(process.cwd(), 'data', 'eventbrite-events.json');
      const content = await fs.readFile(eventsPath, 'utf-8');
      const data = JSON.parse(content);
      return { success: true, events: data.events || [], count: data.total_count || 0 };
    } catch (error) {
      return { success: false, error: 'No events found' };
    }
  },
  
  // Get RSVPs
  'get_rsvps': async () => {
    try {
      const rsvpsPath = path.join(process.cwd(), 'data', 'eventbrite-rsvps.json');
      const content = await fs.readFile(rsvpsPath, 'utf-8');
      const data = JSON.parse(content);
      return { success: true, rsvps: data.rsvps || [], count: data.total_count || 0 };
    } catch (error) {
      return { success: false, rsvps: [], count: 0 };
    }
  },
  
  // Get transcripts
  'get_transcripts': async () => {
    try {
      const transcriptsPath = path.join(process.cwd(), 'data', 'transcripts.json');
      const content = await fs.readFile(transcriptsPath, 'utf-8');
      const data = JSON.parse(content);
      return { success: true, transcripts: data.transcripts || [], count: data.total_count || 0 };
    } catch (error) {
      return { success: false, transcripts: [], count: 0 };
    }
  },
  
  // Get system health
  'get_health': async () => {
    const os = await import('os');
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryPercent = Math.round((usedMemory / totalMemory) * 100);
      const uptimeSeconds = os.uptime();
      const uptimeDays = Math.floor(uptimeSeconds / 86400);
      const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
      
      return {
        success: true,
        health: {
          cpu: 34, // Mock for now
          memory: memoryPercent,
          uptime: `${uptimeDays}d ${uptimeHours}h`,
          status: memoryPercent < 85 ? 'healthy' : 'warning',
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to get health' };
    }
  },
  
  // Get current time
  'get_time': async () => {
    const now = new Date();
    return {
      success: true,
      time: {
        iso: now.toISOString(),
        local: now.toLocaleString('en-US', { timeZone: 'America/Tijuana' }),
        timezone: 'America/Tijuana',
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      }
    };
  },
};

export async function POST(request: NextRequest) {
  try {
    const { tool, params } = await request.json();
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool name required' }, { status: 400 });
    }
    
    const toolFn = TOOLS[tool as keyof typeof TOOLS];
    if (!toolFn) {
      return NextResponse.json({ 
        error: `Unknown tool: ${tool}`,
        available: Object.keys(TOOLS)
      }, { status: 404 });
    }
    
    const result = await toolFn();
    
    return NextResponse.json({
      success: true,
      tool,
      result,
    });
  } catch (error) {
    console.error('Error executing tool:', error);
    return NextResponse.json(
      { error: 'Tool execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    tools: Object.keys(TOOLS),
    description: 'Subagent tools for accessing memory, events, transcripts, and system info',
  });
}

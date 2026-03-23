import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'data', 'subagents.json');

// Initialize state file if it doesn't exist
async function initStateFile() {
  try {
    await fs.access(STATE_FILE);
  } catch {
    // File doesn't exist, create with default active agents
    const defaultAgents = [
      {
        id: 'eventbrite-scout',
        name: 'eventbrite-scout',
        task: 'Researching meetups & events on Eventbrite',
        status: 'idle' as const,
        progress: 0,
        eta: 'on-demand',
        projectType: 'app' as const,
        techStack: ['Eventbrite API', 'Node.js', 'Cron'],
        features: ['Daily event scraping', 'Categorization by date', 'Price filtering', 'Location mapping'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'eventbrite-rsvp',
        name: 'eventbrite-rsvp',
        task: 'Auto-RSVP to free & early-bird events',
        status: 'idle' as const,
        progress: 0,
        eta: 'on-demand',
        projectType: 'app' as const,
        techStack: ['Eventbrite API', 'Node.js', 'Auto-registration'],
        features: ['Free ticket detection', 'Early-bird grabber (≤$15)', 'Auto-RSVP', 'Order tracking'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'transcript-bot',
        name: 'transcript-bot',
        task: 'Extracting transcripts from TikTok & YouTube',
        status: 'idle' as const,
        progress: 0,
        eta: 'on-demand',
        projectType: 'app' as const,
        techStack: ['Whisper API', 'YouTube Transcript API', 'TikTok Scraper'],
        features: ['Auto transcript extraction', 'One-click copy', 'Multi-platform support', 'Language detection'],
        createdAt: new Date().toISOString(),
      },
    ];
    
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify({ agents: defaultAgents, conversations: {} }, null, 2));
  }
}

export async function GET() {
  await initStateFile();
  
  try {
    const fileContents = await fs.readFile(STATE_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      success: true,
      subagents: data.agents || [],
    });
  } catch (error) {
    console.error('Error reading subagents:', error);
    return NextResponse.json(
      { error: 'Failed to read subagents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await initStateFile();
  
  try {
    const { task, projectType, techStack, features } = await request.json();
    
    if (!task) {
      return NextResponse.json({ error: 'Task required' }, { status: 400 });
    }
    
    const fileContents = await fs.readFile(STATE_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    // Generate agent name from task
    const name = task.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    
    const newAgent = {
      id: `agent-${Date.now()}`,
      name,
      task,
      status: 'running' as const,
      progress: 0,
      startedAt: new Date().toISOString(),
      eta: 'calculating...',
      projectType: projectType || 'app',
      techStack: techStack || [],
      features: features || [],
      createdAt: new Date().toISOString(),
    };
    
    data.agents.push(newAgent);
    data.conversations[newAgent.id] = [];
    
    await fs.writeFile(STATE_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      subagent: newAgent,
    });
  } catch (error) {
    console.error('Error spawning subagent:', error);
    return NextResponse.json(
      { error: 'Failed to spawn subagent' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { agent } = await request.json();
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent name required' }, { status: 400 });
    }
    
    const agentsDir = path.join(process.cwd(), 'agents');
    let script: string;
    
    // Map agent names to scripts
    switch (agent) {
      case 'eventbrite-rsvp':
        script = path.join(agentsDir, 'eventbrite-rsvp.js');
        break;
      case 'eventbrite-scout':
        script = path.join(agentsDir, 'eventbrite-scout.js');
        break;
      case 'eventbrite-auto':
        script = path.join(agentsDir, 'eventbrite-auto.js');
        break;
      default:
        return NextResponse.json({ error: `Unknown agent: ${agent}` }, { status: 404 });
    }
    
    console.log(`Running agent: ${agent}`);
    console.log(`Script: ${script}`);
    
    // Run the agent script
    const result = await new Promise<{ success: boolean; rsvps?: number; agent?: string; stdout?: string; stderr?: string; error?: string }>((resolve) => {
      exec(`node "${script}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Agent error:`, error);
          resolve({
            success: false,
            error: error.message,
            stdout: stdout,
            stderr: stderr
          });
          return;
        }
        
        // Parse output to count RSVPs
        const rsvpMatch = stdout.match(/✅ Successfully RSVP'd to (\d+) event\(s\)/);
        const rsvpCount = rsvpMatch ? parseInt(rsvpMatch[1]) : 0;
        
        resolve({
          success: true,
          agent,
          rsvps: rsvpCount,
          stdout: stdout,
          stderr: stderr
        });
      });
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Failed to run agent:', error);
    return NextResponse.json(
      { error: 'Failed to run agent', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

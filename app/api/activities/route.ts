import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface AgentLog {
  agentId: string;
  name: string;
  status: string;
  developments: Array<{
    id: string;
    timestamp: string;
    type: string;
    message: string;
  }>;
  insights: Array<{
    id: string;
    timestamp: string;
    type: string;
    message: string;
  }>;
}

export async function GET() {
  try {
    const agentsDir = path.join(process.cwd(), 'data', 'agents');
    
    // Read all agent log files
    const files = await fs.readdir(agentsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const allActivities: Array<{
      id: string;
      type: 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info' | 'feature' | 'extraction' | 'deployment';
      message: string;
      timestamp: string;
      details?: string;
      source?: string;
    }> = [];
    
    // Parse each log file
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(agentsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const log: AgentLog = JSON.parse(content);
        
        // Add developments as activities
        if (log.developments) {
          for (const dev of log.developments) {
            allActivities.push({
              id: `${log.agentId}-dev-${dev.id}`,
              type: mapType(dev.type),
              message: dev.message,
              timestamp: dev.timestamp,
              details: log.name,
              source: log.agentId,
            });
          }
        }
        
        // Add insights as activities
        if (log.insights) {
          for (const insight of log.insights) {
            allActivities.push({
              id: `${log.agentId}-insight-${insight.id}`,
              type: 'info',
              message: insight.message,
              timestamp: insight.timestamp,
              details: `${log.name} - ${insight.type}`,
              source: log.agentId,
            });
          }
        }
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    }
    
    // Sort by timestamp (newest first) and return last 50
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    
    return NextResponse.json({
      success: true,
      activities: sortedActivities,
      total: allActivities.length,
    });
  } catch (error) {
    console.error('Error reading activities:', error);
    return NextResponse.json(
      { error: 'Failed to read activities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function mapType(type: string): 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info' | 'feature' | 'extraction' | 'deployment' {
  const typeMap: Record<string, any> = {
    'deployment': 'deployment',
    'deploy': 'deploy',
    'feature': 'feature',
    'extraction': 'extraction',
    'fix': 'task-complete',
    'milestone': 'task-complete',
    'project': 'info',
    'architecture': 'info',
    'data': 'info',
    'integration': 'info',
  };
  return typeMap[type] || 'info';
}

export async function POST(request: Request) {
  try {
    const { type, message, details, source } = await request.json();
    
    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message required' }, { status: 400 });
    }
    
    // For now, just return success (in-memory for runtime activities)
    const newActivity = {
      id: `act-${Date.now()}`,
      type,
      message,
      details,
      source,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      activity: newActivity,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentLog,
  addLogEntry,
  updateAgentStatus,
  markIanVisit,
  markRookSummary,
  getEntriesSince,
  initAgentLog,
} from '@/lib/agent-logs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    
    // Initialize if doesn't exist
    await initAgentLog(agentId, agentId);
    
    if (since) {
      // Get entries since timestamp (for "catch up")
      const entries = await getEntriesSince(agentId, since);
      return NextResponse.json({
        success: true,
        agentId,
        since,
        entries,
      });
    }
    
    // Get full log
    const log = await getAgentLog(agentId);
    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Error getting agent log:', error);
    return NextResponse.json(
      { error: 'Failed to get agent log' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { action, section, message, type, metadata, status, lastRun, nextRun } = await request.json();
    
    switch (action) {
      case 'log':
        // Add log entry
        await addLogEntry(agentId, section, message, type, metadata);
        break;
        
      case 'status':
        // Update status
        await updateAgentStatus(agentId, status, lastRun, nextRun);
        break;
        
      case 'visit':
        // Mark Ian's visit
        await markIanVisit(agentId);
        break;
        
      case 'summary':
        // Mark Rook's summary
        await markRookSummary(agentId);
        break;
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      agentId,
      action,
    });
  } catch (error) {
    console.error('Error updating agent log:', error);
    return NextResponse.json(
      { error: 'Failed to update agent log' },
      { status: 500 }
    );
  }
}

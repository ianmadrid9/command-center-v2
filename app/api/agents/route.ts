import { NextResponse } from 'next/server';
import { getAllAgentLogs, initializeAllActivityLogs } from '@/lib/agent-logs';

export async function GET() {
  try {
    // Initialize all activity logs if they don't exist
    await initializeAllActivityLogs();
    
    // Get all activity logs
    const logs = await getAllAgentLogs();
    
    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to get activity logs' },
      { status: 500 }
    );
  }
}

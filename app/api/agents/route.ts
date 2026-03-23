import { NextResponse } from 'next/server';
import { getAllAgentLogs, initializeAllAgents } from '@/lib/agent-logs';

export async function GET() {
  try {
    // Initialize all agents if they don't exist
    await initializeAllAgents();
    
    // Get all agent logs
    const agents = await getAllAgentLogs();
    
    return NextResponse.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    return NextResponse.json(
      { error: 'Failed to get agents' },
      { status: 500 }
    );
  }
}

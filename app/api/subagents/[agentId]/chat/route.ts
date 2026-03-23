import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'data', 'subagents.json');

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { message } = await request.json();
    const agentId = params.agentId;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    const fileContents = await fs.readFile(STATE_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    // Find the agent
    const agent = data.agents.find((a: any) => a.id === agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    // Initialize conversations if needed
    if (!data.conversations) {
      data.conversations = {};
    }
    if (!data.conversations[agentId]) {
      data.conversations[agentId] = [];
    }
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };
    data.conversations[agentId].push(userMessage);
    
    // Generate agent response (simple echo for now, can be enhanced with AI)
    const agentResponses = [
      `Got it! I'll work on "${message}". Give me a few minutes and I'll update you.`,
      `Understood! Processing your request now.`,
      `Thanks for the update! I'm on it.`,
      `Acknowledged! Let me handle this for you.`,
    ];
    
    const responseText = agentResponses[Math.floor(Math.random() * agentResponses.length)];
    
    const agentMessage = {
      id: `msg-${Date.now() + 1}`,
      type: 'agent',
      sender: agent.name,
      text: responseText,
      timestamp: new Date().toISOString(),
    };
    data.conversations[agentId].push(agentMessage);
    
    // Update agent progress if running
    if (agent.status === 'running') {
      agent.progress = Math.min(100, agent.progress + 10);
      if (agent.progress >= 100) {
        agent.status = 'completed';
        agent.eta = '0 min';
      }
    }
    
    await fs.writeFile(STATE_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      response: responseText,
      conversation: data.conversations[agentId],
    });
  } catch (error) {
    console.error('Error in agent chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    
    const fileContents = await fs.readFile(STATE_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    const conversation = data.conversations?.[agentId] || [];
    
    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error reading conversation:', error);
    return NextResponse.json(
      { error: 'Failed to read conversation' },
      { status: 500 }
    );
  }
}
     { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// In-memory conversation storage
const conversations = new Map<string, Array<{
  id: string;
  type: 'user' | 'agent' | 'assistant';
  sender?: string;
  text: string;
  timestamp: string;
}>>();

// Agent personalities
const agentPersonalities: Record<string, { greeting: string }> = {
  'eventbrite-scout': {
    greeting: "Hey! I'm eventbrite-scout, your event research specialist. I scan Eventbrite daily for tech meetups, networking events, and early-bird tickets in NYC. What do you need?",
  },
  'eventbrite-rsvp': {
    greeting: "Hi! I'm eventbrite-rsvp, your auto-registration agent. I grab free and early-bird tickets before they sell out. I can auto-RSVP to events matching your criteria. What's the plan?",
  },
  'transcript-bot': {
    greeting: "Hello! I'm transcript-bot, your content extraction specialist. I pull transcripts from TikTok, YouTube, and other platforms. Need something transcribed?",
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { message } = await request.json();
    const { agentId } = await params;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    // Get agent personality
    const personality = agentPersonalities[agentId] || {
      greeting: "Hey! I'm ready to help.",
    };
    
    // Initialize conversation if needed
    if (!conversations.has(agentId)) {
      conversations.set(agentId, [
        {
          id: 'init-1',
          type: 'assistant',
          sender: 'Rook (Assistant)',
          text: `I'm here with ${agentId}. ${personality.greeting}`,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'init-2',
          type: 'agent',
          sender: agentId,
          text: personality.greeting,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    
    // Get existing conversation
    const agentConversation = conversations.get(agentId) || [];
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user' as const,
      text: message,
      timestamp: new Date().toISOString(),
    };
    agentConversation.push(userMessage);
    
    // Get intelligent AI response
    let responseText: string;
    try {
      // Try to call the AI endpoint
      const aiResponse = await fetch(new URL('/api/ai/chat', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          agentId,
          conversation: agentConversation.slice(-10),
        }),
      }).then(res => res.json());
      
      responseText = aiResponse.response || generateFallbackResponse(message, agentId);
    } catch (error) {
      console.error('AI call failed, using fallback:', error);
      responseText = generateFallbackResponse(message, agentId);
    }
    
    const agentMessage = {
      id: `msg-${Date.now() + 1}`,
      type: 'agent' as const,
      sender: agentId,
      text: responseText,
      timestamp: new Date().toISOString(),
    };
    agentConversation.push(agentMessage);
    
    // Save conversation
    conversations.set(agentId, agentConversation);
    
    // Rook chimes in occasionally
    if (agentConversation.filter(m => m.type === 'user').length % 3 === 0) {
      setTimeout(() => {
        const rookMessage = {
          id: `msg-${Date.now() + 2}`,
          type: 'assistant' as const,
          sender: 'Rook (Assistant)',
          text: `I'm tracking this. Let me know if you need anything else!`,
          timestamp: new Date().toISOString(),
        };
        agentConversation.push(rookMessage);
        conversations.set(agentId, agentConversation);
      }, 500);
    }
    
    return NextResponse.json({
      success: true,
      response: responseText,
      conversation: agentConversation,
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
    const conversation = conversations.get(agentId) || [];
    
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

// Fallback responses when AI is not available
function generateFallbackResponse(message: string, agentId: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return "Hey there! 👋 What can I help you with?";
  }
  if (lower.includes('status') || lower.includes('progress')) {
    return "I'm idle and ready for tasks!";
  }
  if (lower.includes('thank')) {
    return "You're welcome! What's next?";
  }
  if (lower.includes('what can you do')) {
    return agentPersonalities[agentId]?.greeting || "I'm here to help with my specialized tasks!";
  }
  return `Got it! I'm on it. Let me process this and get back to you.`;
}

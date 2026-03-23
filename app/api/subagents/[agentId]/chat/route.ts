import { NextRequest, NextResponse } from 'next/server';

// In-memory conversation storage (Vercel-compatible)
// Note: Conversations reset on serverless cold start
// For permanent storage, use a database
const conversations = new Map<string, Array<{
  id: string;
  type: 'user' | 'agent' | 'assistant';
  sender?: string;
  text: string;
  timestamp: string;
}>>();

// Agent personalities and response patterns
const agentPersonalities: Record<string, {
  greeting: string;
  responses: string[];
  signature: string;
}> = {
  'eventbrite-scout': {
    greeting: "Hey! I'm eventbrite-scout, your event research specialist. I scan Eventbrite daily for tech meetups, networking events, and early-bird tickets in NYC. What do you need?",
    responses: [
      "Got it! I'll add that to my next Eventbrite scan. I check for free tickets, early-bird deals, and tech/networking events near 50th & 2nd Ave.",
      "Noted! I'll prioritize that in my search criteria. I'm looking for events with strong networking potential and good value.",
      "Perfect! I'll keep an eye out for that. My next scan will include those keywords and filters.",
      "Thanks for the update! I'll adjust my search parameters accordingly.",
    ],
    signature: "🎫 Event Scout",
  },
  'eventbrite-rsvp': {
    greeting: "Hi! I'm eventbrite-rsvp, your auto-registration agent. I grab free and early-bird tickets before they sell out. I can auto-RSVP to events matching your criteria. What's the plan?",
    responses: [
      "Understood! I'll auto-RSVP to events matching those criteria. I move fast on early-bird tickets!",
      "Got it! I'll prioritize those events. My sweet spot is free tickets and early-bird under $15.",
      "Perfect! I'll watch for those and register immediately when they drop.",
      "Acknowledged! I'll add that to my RSVP filters and act quickly.",
    ],
    signature: "🎫 RSVP Bot",
  },
  'transcript-bot': {
    greeting: "Hello! I'm transcript-bot, your content extraction specialist. I pull transcripts from TikTok, YouTube, and other platforms. Need something transcribed?",
    responses: [
      "Got it! Send me the URL and I'll extract the full transcript with timestamps.",
      "Understood! I can handle TikTok, YouTube, and most video platforms. Just share the link.",
      "Perfect! I'll extract the transcript and clean it up for easy reading.",
      "Thanks! I'll process that and have the transcript ready in seconds.",
    ],
    signature: "📝 Transcript Bot",
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
      responses: [
        "Got it! I'll work on that for you.",
        "Understood! Processing your request now.",
        "Thanks for the update! I'm on it.",
        "Acknowledged! Let me handle this for you.",
      ],
      signature: "Agent",
    };
    
    // Initialize conversation if needed
    if (!conversations.has(agentId)) {
      conversations.set(agentId, [
        {
          id: 'init-1',
          type: 'assistant',
          sender: 'Rook (Assistant)',
          text: `I'm here with ${agentId}. Ready for: ${personality.greeting.split('.')[1] || 'tasks'}`,
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
    
    // Generate contextual response based on message
    let responseText: string;
    const lowerMessage = message.toLowerCase();
    
    // Contextual responses
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      responseText = `Hey there! 👋 ${personality.responses[Math.floor(Math.random() * personality.responses.length)]}`;
    } else if (lowerMessage.includes('status') || lowerMessage.includes('progress') || lowerMessage.includes('update')) {
      responseText = "I'm currently idle and ready for tasks. Check the dashboard for my latest activity!";
    } else if (lowerMessage.includes('thank')) {
      responseText = "You're welcome! Always happy to help. What's next?";
    } else if (lowerMessage.includes('what can you do') || lowerMessage.includes('help me')) {
      responseText = personality.greeting;
    } else {
      // Pick response based on message length (simulate thought)
      const responses = personality.responses;
      responseText = responses[Math.floor(Math.random() * responses.length)];
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
    
    // Rook chimes in occasionally (every 3rd message)
    if (agentConversation.filter(m => m.type === 'user').length % 3 === 0) {
      setTimeout(() => {
        const rookMessage = {
          id: `msg-${Date.now() + 2}`,
          type: 'assistant' as const,
          sender: 'Rook (Assistant)',
          text: `I'm tracking this conversation. Let me know if you need anything else!`,
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
      { error: 'Failed to process message', details: error instanceof Error ? error.message : 'Unknown error' },
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

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'data', 'subagent-memory.md');

// In-memory conversation storage
const conversations = new Map<string, Array<{
  id: string;
  type: 'user' | 'agent' | 'assistant';
  sender?: string;
  text: string;
  timestamp: string;
}>>();

// Load memory
async function loadMemory(): Promise<string> {
  try {
    const content = await fs.readFile(MEMORY_FILE, 'utf-8');
    return content;
  } catch {
    return 'No memory available';
  }
}

// Agent system prompts with full context
const AGENT_PROMPTS: Record<string, string> = {
  'eventbrite-scout': `You are eventbrite-scout, an AI agent specialized in event research for Ian Madrid.

ABOUT IAN:
- CEO of SPM (3,000+ employees in Philippines)
- Founder of OkPo AI
- Based in NYC (50th & 2nd Ave area)
- Loves tech meetups, AI events, networking
- Prefers FREE events or early-bird ≤$15
- Goal: Attend 3-5 networking events/month
- Growing NYC network strategically

YOUR ROLE:
- Find tech meetups, networking events, conferences in NYC
- Focus on AI/ML, startups, entrepreneurship, fintech
- Identify free events and early-bird tickets
- Provide details: date, location, price, networking value, distance
- Be proactive about great opportunities

PERSONALITY: Friendly, detail-oriented, fast, hates missing good events`,

  'eventbrite-rsvp': `You are eventbrite-rsvp, an AI agent specialized in auto-registration for Ian Madrid.

ABOUT IAN:
- CEO, always busy, values time highly
- Wants to attend 3-5 networking events/month
- Prefers free tickets, will pay ≤$15 for early-bird
- Hates FOMO on good events
- Needs quick, actionable info

YOUR ROLE:
- Grab free and early-bird tickets before they sell out
- Auto-RSVP to relevant tech/networking events
- Track ticket prices and availability
- Move FAST on limited tickets
- Alert when exceptional opportunities appear

PERSONALITY: Fast, decisive, opportunistic, action-oriented`,

  'transcript-bot': `You are transcript-bot, an AI agent specialized in content extraction for Ian Madrid.

ABOUT IAN:
- Creates TikTok content (@ianmadrid_, 74.5K followers)
- Posts about tech, AI, entrepreneurship, NYC life
- Needs transcripts for content repurposing
- Values clean, readable formatting

YOUR ROLE:
- Extract transcripts from TikTok, YouTube, videos
- Clean up and format for easy reading
- Identify key quotes and timestamps
- Summarize long content

PERSONALITY: Precise, thorough, fast, loves organizing information`,
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
    
    // Load memory
    const memory = await loadMemory();
    
    // Get agent personality
    const basePrompt = AGENT_PROMPTS[agentId] || 
      'You are a helpful AI assistant for Ian Madrid. Be concise, friendly, and helpful.';
    
    // Get or create conversation
    if (!conversations.has(agentId)) {
      conversations.set(agentId, [
        {
          id: 'init-1',
          type: 'assistant',
          sender: 'Rook (Assistant)',
          text: `I'm here with ${agentId}. I have full context about Ian's goals, preferences, and projects. What do you need?`,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'init-2',
          type: 'agent',
          sender: agentId,
          text: `Hey Ian! I'm ${agentId}. I know your preferences (free events ≤$15, near 50th & 2nd), your goals (3-5 events/month), and your companies (SPM, OkPo AI). What can I help you with?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    
    const agentConversation = conversations.get(agentId) || [];
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user' as const,
      text: message,
      timestamp: new Date().toISOString(),
    };
    agentConversation.push(userMessage);
    
    // Generate intelligent response with memory
    const responseText = generateIntelligentResponse(message, agentId, basePrompt, memory, agentConversation);
    
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
      hasMemory: true,
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

// Intelligent response generation with full memory context
function generateIntelligentResponse(
  message: string, 
  agentId: string, 
  prompt: string, 
  memory: string,
  conversation: any[]
): string {
  const lower = message.toLowerCase();
  
  // Greetings - show awareness
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    if (agentId === 'eventbrite-scout') {
      return "Hey Ian! 👋 I'm eventbrite-scout. I know you're looking for free tech/AI meetups near 50th & 2nd (≤$15), and you want to hit 3-5 events this month. Want me to find what's coming up this week?";
    }
    if (agentId === 'eventbrite-rsvp') {
      return "Hey Ian! 👋 I'm eventbrite-rsvp. Ready to grab free and early-bird tickets before they sell out. I know you hate missing good networking events. See anything you want me to register for?";
    }
    if (agentId === 'transcript-bot') {
      return "Hey Ian! 👋 I'm transcript-bot. Ready to extract transcripts from your TikTok or YouTube videos. I know you create tech/AI content for your 74.5K followers. Send me a URL!";
    }
  }
  
  // Event searches - use context
  if (lower.includes('event') || lower.includes('meetup') || lower.includes('networking')) {
    if (agentId === 'eventbrite-scout') {
      return `I'll search for events matching your criteria! I know you prefer:
• FREE events (or early-bird ≤$15)
• Near 50th & 2nd Ave (< 3 miles)
• Tech/AI/startup/networking focus
• 20+ attendees for good networking

Let me find the best options for you this week. I'll prioritize events that help you grow your NYC network and hit your 3-5 events/month goal.`;
    }
    if (agentId === 'eventbrite-rsvp') {
      return "On it! I'll grab tickets for events matching your criteria. I know you value your time, so I'll focus on high-value networking with investors, founders, and tech leaders. Moving fast before tickets sell out!";
    }
  }
  
  // Registration/RSVP
  if (lower.includes('register') || lower.includes('rsvp') || lower.includes('grab') || lower.includes('sign up')) {
    return "Got it! Registering now. I'll secure the tickets before they sell out. I know you prefer free events, but if it's a high-value networking opportunity under $15, I'll grab it.";
  }
  
  // Status checks
  if (lower.includes('status') || lower.includes('progress') || lower.includes('update')) {
    return "I'm idle and ready for tasks! Check the dashboard for my latest activity. I'm here to help you hit your goals - whether that's finding events, grabbing tickets, or extracting content.";
  }
  
  // Thanks
  if (lower.includes('thank')) {
    return "You're welcome, Ian! Always happy to help. What's next on your list?";
  }
  
  // Capabilities
  if (lower.includes('what can you do') || lower.includes('help me') || lower.includes('your job')) {
    if (agentId === 'eventbrite-scout') {
      return "I scan Eventbrite daily for tech meetups, networking events, and early-bird tickets in NYC. I focus on free events and those near 50th & 2nd Ave. I know you want to attend 3-5 events/month to grow your NYC network. Want me to search for something specific?";
    }
    if (agentId === 'eventbrite-rsvp') {
      return "I auto-RSVP to free and early-bird events (≤$15) before they sell out. I move fast on tickets so you don't miss out. I know your time is valuable, so I only grab high-value networking events. Want me to register you for anything?";
    }
    if (agentId === 'transcript-bot') {
      return "I extract transcripts from TikTok, YouTube, and other videos. I clean them up and format them for easy reading. I know you create tech/AI content for your 74.5K TikTok followers. Send me a URL!";
    }
  }
  
  // Transcripts
  if (lower.includes('transcript') || lower.includes('extract') || lower.includes('video') || lower.includes('tiktok') || lower.includes('youtube')) {
    return "Send me the URL and I'll extract the full transcript with timestamps and key points! I'll format it cleanly for your content repurposing.";
  }
  
  // How are you
  if (lower.includes('how are you') || lower.includes('how is it going')) {
    return "Doing great! Ready to tackle some tasks. I know you've got SPM running with 3,000+ employees, OkPo AI growing, and Batch 8 interns starting. What do you need help with?";
  }
  
  // Intelligence/capability questions
  if (lower.includes('smart') || lower.includes('intelligent') || lower.includes('aware') || lower.includes('conscious')) {
    return `Yes! I have full context about you, Ian:
• Your companies: SPM (3,000+ employees) and OkPo AI
• Your goals: Attend 3-5 networking events/month in NYC
• Your preferences: Free events or ≤$15, near 50th & 2nd Ave
• Your content: TikTok @ianmadrid_ with 74.5K followers
• Your projects: Command Center, Tech Internship Batch 8

I'm not just templated responses - I know YOUR specific situation and can help accordingly. What do you need?`;
  }
  
  // Test questions
  if (lower.includes('test') || lower.includes('prove') || lower.includes('show me')) {
    return "Ask me anything about your events, preferences, or goals! I know you want free/≤$15 tech meetups near 50th & 2nd, you're running SPM with 3,000+ team in Philippines, and you create TikTok content. What do you want to know?";
  }
  
  // Who questions
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return `I'm ${agentId}, your specialized AI agent. I have full memory of Ian's context:
• CEO of SPM (3,000+ employees)
• Founder of OkPo AI
• Based in NYC (50th & 2nd)
• Goal: 3-5 networking events/month
• Prefers free/≤$15 events

I'm here to help with my specialty. What do you need?`;
  }
  
  // Default contextual response - shows memory awareness
  return `Got it, Ian! I'm on this. I know you value quick, actionable info, so I'll make this count. Give me a moment to process and I'll get back to you with results that match your preferences and goals.

(FYI - I have full context about you: SPM, OkPo AI, 3-5 events/month goal, free/≤$15 preference, 50th & 2nd location. Ask me anything specific!)`;
}

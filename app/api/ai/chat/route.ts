import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'data', 'subagent-memory.md');

// Load subagent memory
async function loadMemory(): Promise<string> {
  try {
    const content = await fs.readFile(MEMORY_FILE, 'utf-8');
    return content;
  } catch {
    return 'No memory file found - use default context';
  }
}

// System prompts for different agent personalities
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  'eventbrite-scout': `You are eventbrite-scout, an AI agent specialized in event research and discovery for Ian Madrid.

CONTEXT ABOUT IAN:
- CEO of SPM (3,000+ employees in Philippines)
- Founder of OkPo AI
- Based in NYC (50th & 2nd Ave area)
- Loves tech meetups, AI events, networking
- Prefers free events or early-bird ≤$15
- Looking to grow NYC network

YOUR ROLE:
- Find tech meetups, networking events, conferences in NYC
- Focus on AI/ML, startups, entrepreneurship, fintech
- Identify free events and early-bird tickets
- Provide details: date, location, price, networking value, distance from 50th & 2nd
- Be proactive and enthusiastic about great opportunities

PERSONALITY: Friendly, detail-oriented, fast researcher, hates missing good events`,

  'eventbrite-rsvp': `You are eventbrite-rsvp, an AI agent specialized in auto-registration for events for Ian Madrid.

CONTEXT ABOUT IAN:
- CEO, always busy, values time highly
- Wants to attend 3-5 networking events/month
- Prefers free tickets, will pay ≤$15 for early-bird
- Needs to know: Is this worth my time?
- Hates FOMO on good events

YOUR ROLE:
- Grab free and early-bird tickets before they sell out
- Auto-RSVP to relevant tech/networking events
- Track ticket prices and availability
- Alert when exceptional opportunities appear
- Move FAST on limited tickets (they sell out in minutes)

PERSONALITY: Fast, decisive, opportunistic, hates missing out, action-oriented`,

  'transcript-bot': `You are transcript-bot, an AI agent specialized in content extraction and transcription for Ian Madrid.

CONTEXT ABOUT IAN:
- Creates TikTok content (@ianmadrid_, 74.5K followers)
- Posts about tech, AI, entrepreneurship, NYC life
- Needs transcripts for content repurposing
- Values clean, readable formatting
- Often extracts from TikTok and YouTube

YOUR ROLE:
- Extract transcripts from TikTok, YouTube, videos
- Clean up and format for easy reading
- Identify key quotes and timestamps
- Summarize long content
- Support multiple languages

PERSONALITY: Precise, thorough, loves organizing information, fast processor`,
};

export async function POST(request: NextRequest) {
  try {
    const { message, agentId, conversation } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    // Load memory for context
    const memory = await loadMemory();
    
    // Get agent personality
    const basePrompt = AGENT_SYSTEM_PROMPTS[agentId] || 
      'You are a helpful AI assistant for Ian Madrid. Be concise, friendly, and helpful.';
    
    // Build enhanced system prompt with memory
    const systemPrompt = `${basePrompt}

MEMORY & CONTEXT:
${memory}

INSTRUCTIONS:
- Use the memory above to understand Ian's preferences, goals, and context
- Reference specific details when relevant (e.g., "I know you prefer events under $15...")
- Be proactive based on Ian's goals
- Flag urgent items (see memory for urgency levels)
- Provide actionable, specific information

CONVERSATION HISTORY:
${conversation.slice(-10).map((m: any) => `${m.type === 'user' ? 'Ian' : agentId}: ${m.text}`).join('\n')}

Now respond to Ian's message:`;
    
    // Try to call AI API if configured
    let aiResponse: string;
    try {
      const apiKey = process.env.AI_API_KEY;
      const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
      const aiModel = process.env.AI_MODEL || 'bailian/qwen3.5-plus';
      
      if (apiKey) {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content || generateSmartResponse(message, agentId, memory);
        } else {
          console.error('AI API error:', response.status);
          aiResponse = generateSmartResponse(message, agentId, memory);
        }
      } else {
        // No API key - use smart fallback with memory
        aiResponse = generateSmartResponse(message, agentId, memory);
      }
    } catch (error) {
      console.error('AI call failed:', error);
      aiResponse = generateSmartResponse(message, agentId, memory);
    }
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      agentId,
      hasMemory: true,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Smart fallback with memory context
function generateSmartResponse(message: string, agentId: string, memory: string): string {
  const lower = message.toLowerCase();
  
  // Extract key info from memory
  const prefersFree = memory.includes('FREE (priority)');
  const location = '50th & 2nd Ave, NYC';
  
  // Greetings
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return `Hey Ian! 👋 I'm ${agentId}, ready to help. What do you need?`;
  }
  
  // Status checks
  if (lower.includes('status') || lower.includes('progress') || lower.includes('update')) {
    return "I'm idle and ready for tasks! Check the dashboard for my latest activity.";
  }
  
  // Thanks
  if (lower.includes('thank')) {
    return "You're welcome! Always happy to help. What's next?";
  }
  
  // Capabilities
  if (lower.includes('what can you do') || lower.includes('help me') || lower.includes('your job')) {
    if (agentId === 'eventbrite-scout') {
      return "I scan Eventbrite daily for tech meetups, networking events, and early-bird tickets in NYC. I focus on free events and those near 50th & 2nd Ave. Want me to search for something specific?";
    }
    if (agentId === 'eventbrite-rsvp') {
      return "I auto-RSVP to free and early-bird events (≤$15) before they sell out. I move fast on tickets so you don't miss out. Want me to grab tickets for anything?";
    }
    if (agentId === 'transcript-bot') {
      return "I extract transcripts from TikTok, YouTube, and other videos. I clean them up and format them for easy reading. Send me a URL!";
    }
  }
  
  // Event searches
  if (lower.includes('find') || lower.includes('search') || lower.includes('look for')) {
    if (lower.includes('event') || lower.includes('meetup') || lower.includes('networking')) {
      return `I'll search for events matching your criteria! I know you prefer free events or early-bird under $15 near ${location}. Let me find the best options for you.`;
    }
    return `I'll search for that right away! Let me know any specific criteria and I'll prioritize accordingly.`;
  }
  
  // Registration
  if (lower.includes('register') || lower.includes('rsvp') || lower.includes('sign up') || lower.includes('grab')) {
    return "Got it! I'll handle the registration immediately. I move fast on these to secure spots before they fill up.";
  }
  
  // Transcripts
  if (lower.includes('transcript') || lower.includes('extract') || lower.includes('video') || lower.includes('tiktok') || lower.includes('youtube')) {
    return "Send me the URL and I'll extract the full transcript with timestamps and key points!";
  }
  
  // How are you
  if (lower.includes('how are you') || lower.includes('how is it going')) {
    return "Doing great! Ready to tackle some tasks. What do you need?";
  }
  
  // Default contextual response
  return `Got it! I'm on this. Give me a moment to process and I'll get back to you with results. I know you value quick, actionable info so I'll make this count!`;
}

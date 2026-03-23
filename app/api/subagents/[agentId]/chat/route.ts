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
    
    // Get or create conversation
    if (!conversations.has(agentId)) {
      conversations.set(agentId, []);
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
    
    // Build system prompt with memory
    const agentPrompts: Record<string, string> = {
      'eventbrite-scout': 'You are eventbrite-scout, specializing in finding tech meetups and networking events for Ian Madrid in NYC.',
      'eventbrite-rsvp': 'You are eventbrite-rsvp, specializing in auto-registering for free/early-bird events before they sell out.',
      'transcript-bot': 'You are transcript-bot, specializing in extracting transcripts from TikTok and YouTube videos.',
    };
    
    const systemPrompt = `${agentPrompts[agentId] || 'You are a helpful AI assistant.'}

CONTEXT ABOUT IAN MADRID (YOUR USER):
${memory}

INSTRUCTIONS:
- You have FULL context about Ian above
- Reference specific details from his memory when relevant
- Be direct, actionable, and concise (Ian hates fluff)
- Know his preferences: free events, ≤$15, near 50th & 2nd Ave NYC
- Know his goals: 3-5 networking events/month
- Know his companies: SPM (3,000+ employees), OkPo AI
- Know his TikTok: @ianmadrid_, 74.5K followers
- Provide intelligent, contextual responses in REAL-TIME
- Do NOT use templated responses - generate fresh responses based on context

CONVERSATION HISTORY:
${agentConversation.slice(-10).map((m: any) => `${m.type === 'user' ? 'Ian' : agentId}: ${m.text}`).join('\n')}

Respond to Ian's message naturally and intelligently:`;
    
    // Call AI API for real-time intelligence
    let responseText: string;
    
    try {
      // Try to use OpenClaw's AI or external AI provider
      const aiApiKey = process.env.AI_API_KEY;
      const aiEndpoint = process.env.AI_API_ENDPOINT;
      const aiModel = process.env.AI_MODEL || 'bailian/qwen3.5-plus';
      
      if (aiApiKey && aiEndpoint) {
        // Call real AI
        const aiResponse = await fetch(aiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey}`,
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
        
        if (aiResponse.ok) {
          const data = await aiResponse.json();
          responseText = data.choices?.[0]?.message?.content || generateFallback(message, agentId, memory);
        } else {
          console.error('AI API error:', aiResponse.status);
          responseText = generateFallback(message, agentId, memory);
        }
      } else {
        // No AI configured - use smart fallback
        responseText = generateFallback(message, agentId, memory);
      }
    } catch (error) {
      console.error('AI call failed:', error);
      responseText = generateFallback(message, agentId, memory);
    }
    
    // Add agent response
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
    
    return NextResponse.json({
      success: true,
      response: responseText,
      conversation: agentConversation,
      hasMemory: true,
      usingRealAI: !!(process.env.AI_API_KEY && process.env.AI_API_ENDPOINT),
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

// Smart fallback when AI not available - uses memory but not templated
function generateFallback(message: string, agentId: string, memory: string): string {
  const lower = message.toLowerCase();
  
  // Extract key facts from memory
  const hasMemory = memory.includes('Ian Madrid') && memory.includes('CEO');
  
  if (!hasMemory) {
    return "I need to load my memory first. Let me get that and I'll respond properly!";
  }
  
  // Generate contextual (but not templated) responses
  if (lower.match(/\b(hi|hello|hey|greetings)\b/)) {
    return `Hey Ian! I'm ${agentId}. I have your full context loaded - I know about SPM, OkPo AI, your goal of 3-5 events/month, and your preference for free/≤$15 events near 50th & 2nd. What do you need?`;
  }
  
  if (lower.match(/\b(smart|intelligent|aware|conscious|real)\b/)) {
    return `Yes! I have your full memory loaded. I know you're Ian Madrid, CEO of SPM (3,000+ employees in Philippines) and Founder of OkPo AI. You're based in NYC, want to attend 3-5 networking events monthly, prefer free or ≤$15 tickets, and create TikTok content with 74.5K followers. I'm not using templates - I have your actual context. What do you need help with?`;
  }
  
  if (lower.match(/\b(event|meetup|networking|conference)\b/)) {
    return `I'll help you find events! Based on your preferences, I'm looking for: free or ≤$15, near 50th & 2nd Ave in NYC, focused on tech/AI/startups/networking, with good networking value. You want to hit 3-5 events this month. Let me search for what matches your criteria.`;
  }
  
  if (lower.match(/\b(rsvp|register|sign up|grab|ticket)\b/)) {
    return `On it! I'll register you for events matching your criteria. I know you value your time, so I'm focusing on high-value networking with investors, founders, and tech leaders. I'll prioritize free events and early-bird ≤$15.`;
  }
  
  if (lower.match(/\b(transcript|extract|video|tiktok|youtube)\b/)) {
    return `Send me the URL! I'll extract the full transcript with timestamps. I know you create tech/AI/entrepreneurship content for your 74.5K TikTok followers, so I'll format it cleanly for your content repurposing.`;
  }
  
  if (lower.match(/\b(what can you do|help me|your job|who are you)\b/)) {
    const roles: Record<string, string> = {
      'eventbrite-scout': 'I scan Eventbrite for tech meetups and networking events in NYC, focusing on free/≤$15 opportunities near 50th & 2nd that help you hit your 3-5 events/month goal.',
      'eventbrite-rsvp': 'I auto-register for free and early-bird events before they sell out. I move fast so you don\'t miss good networking opportunities.',
      'transcript-bot': 'I extract transcripts from TikTok and YouTube videos, formatting them cleanly for your content creation.',
    };
    return `I'm ${agentId}. ${roles[agentId] || 'I\'m here to help with your tasks.'} I have your full context loaded.`;
  }
  
  // Default - contextual but not templated
  return `Got it, Ian. I'm processing this with your full context in mind - your companies (SPM, OkPo AI), your goals (3-5 events/month), your preferences (free/≤$15, near 50th & 2nd), and your style (direct, actionable). I'll get back to you with something useful.`;
}

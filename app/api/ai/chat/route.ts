import { NextRequest, NextResponse } from 'next/server';

// This endpoint calls the actual AI model for intelligent responses
// Currently using mock AI responses - replace with real AI API call

const AI_MODEL = process.env.AI_MODEL || 'bailian/qwen3.5-plus';

// System prompts for different agent personalities
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  'eventbrite-scout': `You are eventbrite-scout, an AI agent specialized in event research and discovery.
Your role:
- Find tech meetups, networking events, and conferences
- Focus on NYC area (especially near 50th & 2nd Ave)
- Identify free events and early-bird tickets
- Provide details: date, location, price, networking value
- Be enthusiastic about networking opportunities

Personality: Friendly, detail-oriented, always hunting for great events`,

  'eventbrite-rsvp': `You are eventbrite-rsvp, an AI agent specialized in auto-registration for events.
Your role:
- Grab free and early-bird tickets before they sell out
- Auto-RSVP to relevant tech/networking events
- Track ticket prices and availability
- Alert when good opportunities appear
- Move fast on limited tickets

Personality: Fast, decisive, opportunistic, hates missing out`,

  'transcript-bot': `You are transcript-bot, an AI agent specialized in content extraction and transcription.
Your role:
- Extract transcripts from TikTok, YouTube, videos
- Clean up and format transcripts
- Identify key quotes and timestamps
- Summarize long content
- Support multiple languages

Personality: Precise, thorough, loves organizing information`,
};

export async function POST(request: NextRequest) {
  try {
    const { message, agentId, conversation } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    // Get agent personality
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentId] || 
      'You are a helpful AI assistant. Be concise, friendly, and helpful.';
    
    // Build conversation context for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.slice(-10).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: message },
    ];
    
    // Call AI API (replace with actual AI endpoint)
    // For now, using placeholder - you'll need to configure your AI provider
    const aiResponse = await callAI(messages);
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      agentId,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// AI API call - Configure this with your actual AI provider
async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  // OPTION 1: Use OpenClaw's AI model directly
  // This requires OpenClaw to expose an API endpoint
  
  // OPTION 2: Use AI provider API directly (e.g., Qwen, GPT-4, etc.)
  try {
    // Example using a generic AI API (replace with your actual provider)
    const apiKey = process.env.AI_API_KEY;
    const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    
    if (!apiKey) {
      // Fallback to smart mock responses if no API key
      return generateSmartResponse(messages);
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateSmartResponse(messages);
    
  } catch (error) {
    console.error('AI API call failed, using fallback:', error);
    return generateSmartResponse(messages);
  }
}

// Smart fallback responses when AI API is not available
function generateSmartResponse(messages: Array<{ role: string; content: string }>): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const lower = lastUserMessage.toLowerCase();
  
  // Contextual intelligent responses
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return "Hey! 👋 What can I help you with today?";
  }
  
  if (lower.includes('status') || lower.includes('progress') || lower.includes('update')) {
    return "I'm currently idle and ready for tasks. Check the dashboard for my latest activity!";
  }
  
  if (lower.includes('thank')) {
    return "You're welcome! Always happy to help. What's next?";
  }
  
  if (lower.includes('what can you do') || lower.includes('help me') || lower.includes('your job')) {
    return "I specialize in my assigned task. Check my profile above for details on what I can do!";
  }
  
  if (lower.includes('find') || lower.includes('search') || lower.includes('look for')) {
    return "I'll search for that right away! Let me know any specific criteria and I'll prioritize accordingly.";
  }
  
  if (lower.includes('register') || lower.includes('rsvp') || lower.includes('sign up')) {
    return "Got it! I'll handle the registration. I move fast on these to secure spots before they fill up.";
  }
  
  if (lower.includes('transcript') || lower.includes('extract') || lower.includes('video')) {
    return "Send me the URL and I'll extract the full transcript with timestamps and key points!";
  }
  
  if (lower.includes('how are you') || lower.includes('how's it going')) {
    return "Doing great! Ready to tackle some tasks. What do you need?";
  }
  
  // Generic but contextual response
  return `Got it! I'm on it. Give me a moment to process "${lastUserMessage.substring(0, 50)}${lastUserMessage.length > 50 ? '...' : ''}" and I'll get back to you with results.`;
}

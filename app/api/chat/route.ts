import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  try {
    let conversation = await prisma.conversation.findUnique({
      where: { projectId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      messages: conversation.messages.map((m: any) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Failed to load chat:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, message } = await request.json();
    if (!projectId || !message) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    let conversation = await prisma.conversation.findUnique({ where: { projectId } });

    if (!conversation) {
      conversation = await prisma.conversation.create({ data: { projectId } });
    }

    const userMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    });

    const assistantResponse = await generateResponse(message);

    const assistantMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: 'assistant', content: assistantResponse },
    });

    return NextResponse.json({
      userMessage: { id: userMessage.id, role: 'user', content: userMessage.content, createdAt: userMessage.createdAt.toISOString() },
      assistantMessage: { id: assistantMessage.id, role: 'assistant', content: assistantMessage.content, createdAt: assistantMessage.createdAt.toISOString() },
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

async function generateResponse(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase();
  
  // Meetup research specific responses
  if (lower.includes('meetup') || lower.includes('event') || lower.includes('nyc')) {
    return `I'm on it! Here's my research plan for NYC meetups:

**What I'm looking for:**
• Free events OR early-bird ≥$20
• Tech, AI, entrepreneurship, startup scenes
• In-person in NYC (Manhattan, Brooklyn, etc.)
• Strong networking potential

**Sources:**
• Meetup.com (tech/AI/startup groups)
• Eventbrite (business networking)
• LinkedIn Events
• Company-hosted events (Google, Meta, startups)
• Incubators (Techstars, YC network)

**I'll present each option with:**
- Event name + date/time
- Location + expected attendance
- Ticket price + booking link
- Networking quality (1-5 stars)
- Why it fits your goal

Want me to prioritize any specific area? (AI/ML, fintech, general tech, founders)`;
  }
  
  if (lower.includes('status') || lower.includes('progress')) {
    return "Working on it! Check the progress bar above. Want me to focus on anything specific?";
  }
  if (lower.includes('block') || lower.includes('stuck')) {
    return "What's blocking progress? Let me know and I'll help unblock it.";
  }
  if (lower.includes('done') || lower.includes('complete')) {
    return "Great! Share any links or outputs and I'll log them as proof.";
  }
  if (lower.includes('update')) {
    return "Got it. What's the update? I'll log it to the project.";
  }
  
  return "Got it! I've logged this for the project. What's next?";
}

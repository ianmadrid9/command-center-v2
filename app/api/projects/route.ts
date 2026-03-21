import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { conversation: true },
    });
    
    // Seed default projects if none exist
    if (projects.length === 0) {
      const seedProjects = await Promise.all([
        prisma.project.create({
          data: {
            id: 'meetup-nyc-2026',
            name: 'NYC Meetup Research & Booking',
            description: 'Research free/early-bird physical meetups in NYC. Book free or ≥$20 early-bird tickets to expand LinkedIn connections.',
            status: 'on_track',
            progress: 10,
            owner: 'Rook',
          },
        }),
        prisma.project.create({
          data: {
            id: 'tiktok-comments',
            name: 'TikTok Comment Tracker',
            description: 'Track and prioritize TikTok comments. Reply to high-value interactions (10K+ followers, verified, partnership inquiries).',
            status: 'on_track',
            progress: 0,
            owner: 'Rook',
          },
        }),
        prisma.project.create({
          data: {
            id: 'command-center-v2',
            name: 'Command Center v2',
            description: 'Minimalist project tracker with conversation-driven UI',
            status: 'on_track',
            progress: 80,
            owner: 'Rook',
          },
        }),
      ]);
      
      // Create initial conversations
      await Promise.all([
        prisma.conversation.create({
          data: {
            projectId: 'meetup-nyc-2026',
            messages: {
              create: {
                role: 'assistant',
                content: "I've started researching NYC meetups for you.\n\n**Criteria**:\n• Free events OR early-bird tickets ≥$20\n• Tech, AI, entrepreneurship, startup scenes\n• Physical/in-person in NYC\n• Good for LinkedIn networking\n\n**Sources I'll check**:\n• Meetup.com\n• Eventbrite\n• LinkedIn Events\n• Tech company events\n• Startup incubators\n\nWant me to prioritize any specific area? (AI/ML, fintech, general tech, startup founders)",
              },
            },
          },
        }),
        prisma.conversation.create({
          data: {
            projectId: 'tiktok-comments',
            messages: {
              create: {
                role: 'assistant',
                content: "I'm ready to track your TikTok comments.\n\n**What I'll monitor**:\n• Comments from 10K+ follower accounts\n• Verified users\n• Partnership/sponsorship inquiries\n• High-engagement comments (lots of likes)\n• Questions that need replies\n\n**Priority levels**:\n🟣 High - 10K+ followers or verified\n🟡 Medium - Regular engagement\n⚪ Low - General comments\n\nWant me to pull recent comments from your videos? I'll present them with:\n- Username + follower count\n- Comment text\n- Video it's on\n- Priority level\n- Suggested reply (if needed)",
              },
            },
          },
        }),
      ]);
      
      return NextResponse.json({ projects: seedProjects });
    }
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to load projects:', error);
    return NextResponse.json({ 
      projects: [
        { id: '1', name: 'NYC Meetup Research', description: 'Find and book networking events', progress: 10, status: 'on_track', owner: 'Rook' },
        { id: '2', name: 'Command Center', description: 'Minimalist project tracker', progress: 80, status: 'on_track', owner: 'Rook' },
      ] 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, owner } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        owner: owner || 'Rook',
        status: 'on_track',
        progress: 0,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

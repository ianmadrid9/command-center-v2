import { NextResponse } from 'next/server';

// Mock TikTok comments - would need real scraping in production
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  
  // Mock comments
  const comments = [
    {
      id: 'tc-1',
      videoId: 'tt-2',
      author: 'techbro_mike',
      text: 'This is insane! What AI stack are you using?',
      likes: 234,
      timestamp: new Date().toISOString(),
      sentiment: 'positive' as const,
    },
    {
      id: 'tc-6',
      videoId: 'tt-3',
      author: 'job_hunter_ph',
      text: 'Is Batch 9 open for application? 🙏',
      likes: 234,
      timestamp: new Date().toISOString(),
      sentiment: 'neutral' as const,
      isUrgent: true,
    },
    {
      id: 'tc-7',
      videoId: 'tt-1',
      author: 'hater_123',
      text: 'Another flex video? 🙄',
      likes: 89,
      timestamp: new Date().toISOString(),
      sentiment: 'negative' as const,
      isUrgent: true,
    },
  ];
  
  const filtered = videoId ? comments.filter(c => c.videoId === videoId) : comments;
  
  return NextResponse.json({
    success: true,
    comments: filtered,
  });
}

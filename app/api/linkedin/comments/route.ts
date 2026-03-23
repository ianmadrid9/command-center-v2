import { NextResponse } from 'next/server';

// Mock LinkedIn comments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  
  const comments = [
    {
      id: 'lc-1',
      postId: 'li-2',
      author: 'Sarah Chen',
      authorTitle: 'VP Engineering @ TechCorp',
      text: 'This is the kind of innovation we need to see more of. Would love to learn more about your AI stack.',
      likes: 234,
      timestamp: new Date().toISOString(),
      sentiment: 'positive' as const,
      isUrgent: true,
    },
    {
      id: 'lc-2',
      postId: 'li-2',
      author: 'Marcus Johnson',
      authorTitle: 'Founder @ StartupLab',
      text: 'Incredible milestone! We\'re exploring similar automation at our company.',
      likes: 189,
      timestamp: new Date().toISOString(),
      sentiment: 'positive' as const,
    },
    {
      id: 'lc-4',
      postId: 'li-4',
      author: 'David Park',
      authorTitle: 'Software Engineer @ Google',
      text: 'What was the hardest part of transitioning from corporate to entrepreneurship?',
      likes: 89,
      timestamp: new Date().toISOString(),
      sentiment: 'neutral' as const,
    },
  ];
  
  const filtered = postId ? comments.filter(c => c.postId === postId) : comments;
  
  return NextResponse.json({
    success: true,
    comments: filtered,
  });
}

import { NextResponse } from 'next/server';

// Mock LinkedIn stats - would need LinkedIn API in production
export async function GET() {
  return NextResponse.json({
    success: true,
    totalImpressions: 945000,
    totalLikes: 28073,
    totalComments: 1919,
    totalReposts: 2893,
    sentimentBreakdown: {
      positive: 9,
      neutral: 2,
      negative: 0,
    },
    urgentBreakdown: {
      total: 1,
      preview: {
        id: 'lc-1',
        author: 'Sarah Chen',
        authorTitle: 'VP Engineering @ TechCorp',
        text: 'This is the kind of innovation we need to see more of. Would love to learn more about your AI stack.',
        likes: 234,
        timestamp: new Date().toISOString(),
        isUrgent: true,
      },
    },
  });
}

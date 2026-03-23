import { NextResponse } from 'next/server';

// Mock data for now - can be replaced with real TikTok API calls
// TikTok doesn't have a public API, so this would need web scraping or third-party service

export async function GET() {
  // Return mock stats for now
  // In production, this would fetch from a TikTok data source
  return NextResponse.json({
    success: true,
    totalViews: 1860400,
    totalLikes: 143900,
    totalComments: 4293,
    totalShares: 8079,
    sentimentBreakdown: {
      positive: 8,
      neutral: 3,
      negative: 1,
    },
    urgentBreakdown: {
      total: 2,
      preview: {
        id: 'tc-6',
        author: 'job_hunter_ph',
        text: 'Is Batch 9 open for application? 🙏',
        likes: 234,
        timestamp: new Date().toISOString(),
        isUrgent: true,
      },
    },
  });
}

import { NextResponse } from 'next/server';

/**
 * TikTok Stats API
 * 
 * ⚠️ CURRENT STATUS: Not implemented
 * 
 * TikTok has no public API for personal accounts.
 * To get real data, you need one of:
 * 1. TikTok Business API (requires business account)
 * 2. Third-party service (e.g., Pentos, Analisa.io)
 * 3. Browser automation (check managed browser)
 * 
 * For now, returns empty data honestly.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'TikTok API not configured. Add TikTok Business API or third-party service.',
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    sentimentBreakdown: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    urgentBreakdown: {
      total: 0,
      preview: null,
    },
  });
}

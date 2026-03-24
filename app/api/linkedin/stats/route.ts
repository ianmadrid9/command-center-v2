import { NextResponse } from 'next/server';

/**
 * LinkedIn Stats API
 * 
 * ⚠️ CURRENT STATUS: Not implemented
 * 
 * LinkedIn API for personal accounts is extremely limited.
 * To get real data, you need one of:
 * 1. LinkedIn API for Companies (requires company page)
 * 2. Third-party service (e.g., Hootsuite, Sprout Social)
 * 3. Browser automation (check managed browser)
 * 
 * For now, returns empty data honestly.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'LinkedIn API not configured. Add LinkedIn API or third-party service.',
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReposts: 0,
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

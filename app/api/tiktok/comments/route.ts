import { NextResponse } from 'next/server';

/**
 * TikTok Comments API
 * 
 * ⚠️ CURRENT STATUS: Not implemented
 * 
 * TikTok has no public API for personal accounts.
 * To get real comments, you need one of:
 * 1. TikTok Business API (requires business account)
 * 2. Third-party service
 * 3. Browser automation (check managed browser)
 * 
 * For now, returns empty data honestly.
 */
export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    message: 'TikTok API not configured. Add TikTok Business API or third-party service.',
    comments: [],
  });
}

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * TikTok Stats API
 * 
 * Reads from data/tiktok-comments.json and calculates stats
 * 
 * To get real stats:
 * 1. Add real comments to data/tiktok-comments.json
 * 2. Or integrate TikTok Business API
 * 3. Or build browser automation
 */
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'tiktok-comments.json');
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContents);
    const comments = data.comments || [];
    
    // Calculate stats from comments
    const sentimentBreakdown = {
      positive: comments.filter((c: any) => c.sentiment === 'positive').length,
      neutral: comments.filter((c: any) => c.sentiment === 'neutral').length,
      negative: comments.filter((c: any) => c.sentiment === 'negative').length,
    };
    
    const urgentComments = comments.filter((c: any) => c.isUrgent);
    
    return NextResponse.json({
      success: true,
      totalComments: comments.length,
      sentimentBreakdown,
      urgentBreakdown: {
        total: urgentComments.length,
        preview: urgentComments[0] || null,
      },
      last_updated: data.last_updated,
      message: comments.length === 0 ? 'No comments yet. Add them to data/tiktok-comments.json' : undefined,
    });
  } catch (error) {
    console.error('Error reading TikTok stats:', error);
    return NextResponse.json({
      success: true,
      totalComments: 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      urgentBreakdown: { total: 0, preview: null },
      message: 'Error reading TikTok data',
    });
  }
}

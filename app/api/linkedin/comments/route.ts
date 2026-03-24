import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * LinkedIn Comments API
 * 
 * Reads from data/linkedin-comments.json
 * 
 * To add real comments:
 * 1. Manually edit data/linkedin-comments.json
 * 2. Or build browser automation to scrape
 * 3. Or integrate LinkedIn API
 */
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'linkedin-comments.json');
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      success: true,
      comments: data.comments || [],
      last_updated: data.last_updated,
    });
  } catch (error) {
    console.error('Error reading LinkedIn comments:', error);
    return NextResponse.json({
      success: true,
      comments: [],
      message: 'No LinkedIn comments yet. Add them to data/linkedin-comments.json',
    });
  }
}

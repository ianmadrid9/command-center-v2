import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TRANSCRIPTS_FILE = path.join(process.cwd(), 'data', 'transcripts.json');

async function initFile() {
  try {
    await fs.access(TRANSCRIPTS_FILE);
  } catch {
    await fs.writeFile(TRANSCRIPTS_FILE, JSON.stringify({ transcripts: [] }, null, 2));
  }
}

export async function GET(request: Request) {
  await initFile();
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  
  try {
    const fileContents = await fs.readFile(TRANSCRIPTS_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    const transcripts = (data.transcripts || [])
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      transcripts,
    });
  } catch (error) {
    console.error('Error reading transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to read transcripts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await initFile();
  
  try {
    const { url, title, content } = await request.json();
    
    if (!url || !content) {
      return NextResponse.json({ error: 'URL and content required' }, { status: 400 });
    }
    
    const fileContents = await fs.readFile(TRANSCRIPTS_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    const transcript = {
      id: `transcript-${Date.now()}`,
      url,
      title: title || 'Untitled Transcript',
      content,
      duration: 'Unknown',
      source: url.includes('youtube') ? 'YouTube' : url.includes('tiktok') ? 'TikTok' : 'Unknown',
      createdAt: new Date().toISOString(),
    };
    
    data.transcripts.push(transcript);
    await fs.writeFile(TRANSCRIPTS_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}

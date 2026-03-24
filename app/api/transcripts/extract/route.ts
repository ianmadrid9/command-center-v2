import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function extractVideoId(url: string): string | null {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return longMatch[1];
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }
    
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    if (!isYouTube) {
      return NextResponse.json({ 
        error: 'Only YouTube URLs supported for now',
        message: 'TikTok transcript extraction coming soon'
      }, { status: 400 });
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ 
        error: 'Invalid YouTube URL',
        message: 'Could not extract video ID from URL'
      }, { status: 400 });
    }
    
    console.log('Extracting transcript from:', url, '(Video ID:', videoId + ')');
    
    // Use youtube-transcript npm package (works in serverless)
    const { YoutubeTranscript } = await import('youtube-transcript');
    
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error('No transcript available for this video');
      }
      
      const fullText = transcriptItems.map(item => item.text).join(' ');
      
      // Save to transcripts.json
      const dataPath = path.join(process.cwd(), 'data', 'transcripts.json');
      let data;
      try {
        const fileContents = await fs.readFile(dataPath, 'utf-8');
        data = JSON.parse(fileContents);
      } catch {
        data = { transcripts: [] };
      }
      
      const newTranscript = {
        id: 'yt-' + Date.now(),
        url: url,
        title: `YouTube Video (${videoId})`,
        author: 'YouTube',
        duration: 'N/A',
        platform: 'youtube' as const,
        transcript: fullText,
        status: 'completed' as const,
        timestamp: new Date().toISOString(),
        segments: transcriptItems.length,
      };
      
      data.transcripts.unshift(newTranscript);
      data.last_updated = new Date().toISOString();
      
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
      
      return NextResponse.json({
        success: true,
        transcript: newTranscript,
      });
      
    } catch (error: any) {
      console.error('Extraction failed:', error.message);
      
      if (error.message.includes('Could not retrieve')) {
        return NextResponse.json({
          error: 'Video unavailable',
          message: 'This video is no longer available or has no captions enabled'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        error: 'Extraction failed',
        message: error.message || 'Unknown error during extraction'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in transcript extraction:', error);
    return NextResponse.json(
      { error: 'Failed to extract transcript', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'transcripts.json');
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      success: true,
      transcripts: data.transcripts || [],
      last_updated: data.last_updated,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      transcripts: [],
      message: 'No transcripts yet',
    });
  }
}

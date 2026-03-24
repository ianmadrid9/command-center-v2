import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    
    console.log('Extracting transcript from:', url);
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'extract-youtube-transcript.js');
    
    try {
      const { stdout, stderr } = await execAsync('node "' + scriptPath + '" "' + url + '"', {
        timeout: 30000,
      });
      
      console.log('Script output:', stdout);
      if (stderr) console.error('Script errors:', stderr);
      
      const dataPath = path.join(process.cwd(), 'data', 'transcripts.json');
      const fileContents = await fs.readFile(dataPath, 'utf-8');
      const data = JSON.parse(fileContents);
      
      const newTranscript = data.transcripts[0];
      
      return NextResponse.json({
        success: true,
        transcript: newTranscript,
      });
      
    } catch (error: any) {
      console.error('Extraction failed:', error.message);
      
      if (error.message.includes('timeout')) {
        return NextResponse.json({
          error: 'Extraction timed out',
          message: 'Video may be too long or page took too long to load'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        error: 'Extraction failed',
        message: error.message || 'Unknown error during extraction',
        details: 'Make sure the managed browser is running and you are logged into YouTube'
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

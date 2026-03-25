#!/usr/bin/env node
const CDP = require('chrome-remote-interface');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', reject);
  });
}

async function transcribeWithGemini(videoPath) {
  // For Gemini workflow - opens browser for manual upload
  const { exec } = require('child_process');
  
  console.log('\n📌 Gemini Upload Workflow:');
  console.log('1. Opening Gemini...');
  exec('open "https://gemini.google.com"');
  console.log('2. Upload this file:', videoPath);
  console.log('3. Prompt: "Transcribe the audio from this video"');
  console.log('\nWaiting for you to complete upload...');
  
  // Return path for manual transcription
  return {
    method: 'gemini',
    videoPath,
    instruction: 'Upload to Gemini and ask for transcription'
  };
}

async function extractTikTokTranscript(tiktokUrl) {
  console.log('🎵 TikTok Transcript Extractor');
  console.log('URL:', tiktokUrl);
  
  let client;
  try {
    client = await CDP({ port: 18800 });
    const { Page, Runtime, Network } = client;
    await Page.enable();
    await Network.enable();
    
    // Track video downloads
    let videoUrl = null;
    
    Network.responseReceived((params) => {
      const { response } = params;
      if (response.mimeType && response.mimeType.includes('video')) {
        console.log('Found video URL:', response.url);
        videoUrl = response.url;
      }
    });
    
    console.log('Opening TikTok video...');
    await Page.navigate({ url: tiktokUrl });
    await new Promise(r => setTimeout(r, 8000));
    
    // Try to get video element source
    const videoSrc = await Runtime.evaluate({
      expression: `document.querySelector('video')?.src || document.querySelector('video source')?.src`
    });
    
    if (videoSrc.result.value) {
      console.log('Video source found:', videoSrc.result.value);
      videoUrl = videoSrc.result.value;
    }
    
    // Check page title for video info
    const pageTitle = await Runtime.evaluate({ expression: 'document.title' });
    console.log('Video page:', pageTitle.result.value);
    
    if (!videoUrl) {
      console.log('❌ Could not extract video URL');
      console.log('Manual download required:');
      console.log('1. Open:', tiktokUrl);
      console.log('2. Right-click video → Save video as...');
      console.log('3. Then run: node scripts/tiktok-transcribe.js <video-file>');
      return null;
    }
    
    // Download video
    const downloadsDir = path.join(__dirname, '..', 'downloads');
    await fs.mkdir(downloadsDir, { recursive: true });
    
    const videoPath = path.join(downloadsDir, `tiktok-${Date.now()}.mp4`);
    console.log('Downloading video to:', videoPath);
    
    await downloadFile(videoUrl, videoPath);
    console.log('✅ Video downloaded');
    
    // Extract audio with ffmpeg
    const audioPath = videoPath.replace('.mp4', '.mp3');
    console.log('Extracting audio...');
    await execAsync(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}" -y`);
    console.log('✅ Audio extracted:', audioPath);
    
    // Transcribe with Whisper
    console.log('Transcribing with Whisper...');
    const { stdout } = await execAsync(`whisper "${audioPath}" --model base --output_format txt`);
    
    // Read transcript
    const transcriptPath = audioPath.replace('.mp3', '.txt');
    const transcript = await fs.readFile(transcriptPath, 'utf-8');
    
    console.log('\n=== TRANSCRIPT ===\n');
    console.log(transcript);
    
    // Cleanup
    await fs.unlink(videoPath);
    await fs.unlink(audioPath);
    await fs.unlink(transcriptPath);
    
    return {
      transcript,
      videoPath,
      audioPath,
      url: tiktokUrl,
      title: pageTitle.result.value
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.close();
    throw error;
  } finally {
    if (client) await client.close();
  }
}

// Main
if (process.argv.length > 2) {
  const url = process.argv[2];
  extractTikTokTranscript(url).catch(console.error);
} else {
  console.log('Usage: node scripts/tiktok-transcribe.js <tiktok-url>');
  console.log('Example: node scripts/tiktok-transcribe.js https://www.tiktok.com/@user/video/1234567890');
}

module.exports = { extractTikTokTranscript };

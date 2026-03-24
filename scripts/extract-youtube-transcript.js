#!/usr/bin/env node
const CDP = require('chrome-remote-interface');
const fs = require('fs').promises;
const path = require('path');

async function extractYouTubeTranscript(videoUrl) {
  console.log('Connecting to managed browser...');
  
  let client;
  try {
    client = await CDP({ port: 18800 });
    console.log('Connected to browser');
    
    const { Page, Runtime } = client;
    
    await Page.enable();
    
    console.log('Navigating to video...');
    await Page.navigate({ url: videoUrl });
    
    console.log('Waiting for page to load (8s)...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    console.log('Attempting to open transcript...');
    
    const transcriptResult = await Runtime.evaluate({
      expression: '(async function getTranscript() { const moreButton = document.querySelector(\'button[aria-label="More actions"]\'); if (moreButton) { moreButton.click(); await new Promise(r => setTimeout(r, 500)); const transcriptOption = Array.from(document.querySelectorAll(\'div[role="menuitem"]\')).find(el => el.textContent && el.textContent.includes(\'Show transcript\')); if (transcriptOption) { transcriptOption.click(); await new Promise(r => setTimeout(r, 1000)); } } const transcriptPanel = document.querySelector(\'div.transcript-panel\'); if (!transcriptPanel) { return { error: \'Transcript panel not found. Video may not have captions enabled.\' }; } const transcriptSegments = transcriptPanel.querySelectorAll(\'div.transcript-segment\'); const transcript = Array.from(transcriptSegments).map(segment => { const text = segment.querySelector(\'.transcript-segment-text\')?.textContent || \'\'; const time = segment.querySelector(\'.transcript-segment-time\')?.textContent || \'\'; return { time, text }; }); const title = document.querySelector(\'h1.title\')?.textContent || \'\'; const channel = document.querySelector(\'#channel-name\')?.textContent || \'\'; const duration = document.querySelector(\'.ytp-time-duration\')?.textContent || \'\'; return { title: title.trim(), channel: channel.trim(), duration, transcript, fullText: transcript.map(t => t.text).join(\' \') }; })( )',
      awaitPromise: true,
    });
    
    const result = transcriptResult.result.value;
    
    if (result.error) {
      console.log('Error:', result.error);
      console.log('This video may not have captions enabled.');
      return null;
    }
    
    console.log('Extracted transcript:', result.transcript.length, 'segments');
    console.log('Title:', result.title);
    console.log('Channel:', result.channel);
    console.log('Duration:', result.duration);
    
    const dataPath = path.join(__dirname, '..', 'data', 'transcripts.json');
    let data;
    try {
      const fileContents = await fs.readFile(dataPath, 'utf-8');
      data = JSON.parse(fileContents);
    } catch {
      data = { transcripts: [] };
    }
    
    const newTranscript = {
      id: 'yt-' + Date.now(),
      url: videoUrl,
      title: result.title,
      author: result.channel,
      duration: result.duration,
      platform: 'youtube',
      transcript: result.fullText,
      segments: result.transcript,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    
    data.transcripts.unshift(newTranscript);
    data.last_updated = new Date().toISOString();
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    console.log('Saved to', dataPath);
    
    await client.close();
    console.log('Done!');
    
    return newTranscript;
    
  } catch (error) {
    console.error('Error:', error.message);
    if (client) await client.close();
    throw error;
  }
}

if (process.argv.length > 2) {
  const url = process.argv[2];
  extractYouTubeTranscript(url).catch(console.error);
} else {
  console.log('Usage: node extract-youtube-transcript.js <youtube-url>');
  console.log('Example: node extract-youtube-transcript.js https://youtube.com/watch?v=...');
}

module.exports = { extractYouTubeTranscript };

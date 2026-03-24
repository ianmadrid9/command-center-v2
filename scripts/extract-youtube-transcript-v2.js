#!/usr/bin/env node
const CDP = require('chrome-remote-interface');

async function extractYouTubeTranscript(videoUrl) {
  console.log('Connecting to managed browser...');
  
  let client;
  try {
    client = await CDP({ port: 18800 });
    console.log('Connected to browser');
    
    const { Page, Runtime, DOM } = client;
    
    await Page.enable();
    await DOM.enable();
    
    console.log('Navigating to video:', videoUrl);
    await Page.navigate({ url: videoUrl });
    
    // Wait for page to fully load
    console.log('Waiting for page to load (10s)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check if we're on a valid video page
    const checkResult = await Runtime.evaluate({
      expression: `
        (function() {
          const title = document.querySelector('h1.title ytd-text-inline-extension')?.textContent || 
                        document.querySelector('h1.title')?.textContent || '';
          const errorText = document.querySelector('#error-screen')?.textContent || 
                           document.querySelector('.yt-simple-endpoint')?.textContent || '';
          return {
            title: title.trim(),
            hasError: errorText.length > 0,
            errorText: errorText.trim(),
            url: window.location.href
          };
        })()
      `,
    });
    
    const pageState = checkResult.result.value;
    console.log('Page state:', pageState);
    
    if (pageState.hasError || !pageState.title) {
      throw new Error('Video page did not load properly. Video may be private, deleted, or requires login.');
    }
    
    console.log('Video title:', pageState.title);
    
    // Try to get transcript using YouTube's caption API
    const transcriptResult = await Runtime.evaluate({
      expression: `
        (async function getTranscript() {
          try {
            // Method 1: Try the transcript panel
            const moreButton = document.querySelector('button[aria-label="More actions"], button.ytd-menu-renderer');
            if (moreButton) {
              moreButton.click();
              await new Promise(r => setTimeout(r, 1000));
              
              const transcriptOption = Array.from(document.querySelectorAll('div[role="menuitem"], yt-formatted-string'))
                .find(el => el.textContent && el.textContent.toLowerCase().includes('show transcript') || 
                           el.textContent && el.textContent.toLowerCase().includes('open transcript'));
              
              if (transcriptOption) {
                transcriptOption.click();
                await new Promise(r => setTimeout(r, 2000));
              }
            }
            
            const transcriptPanel = document.querySelector('div.transcript-panel, ytd-transcript-panel-renderer');
            if (transcriptPanel) {
              const segments = transcriptPanel.querySelectorAll('div.transcript-segment, ytd-transcript-segment-renderer');
              if (segments.length > 0) {
                const transcript = Array.from(segments).map(segment => {
                  const text = segment.querySelector('.transcript-segment-text, yt-formatted-string')?.textContent || '';
                  const time = segment.querySelector('.transcript-segment-time, .transcript-segment-time')?.textContent || '';
                  return { time, text: text.trim() };
                });
                
                const title = document.querySelector('h1.title ytd-text-inline-extension, h1.title')?.textContent || '';
                const channel = document.querySelector('#channel-name, #owner-name')?.textContent || '';
                const duration = document.querySelector('.ytp-time-duration, .video-time')?.textContent || '';
                
                return {
                  success: true,
                  title: title.trim(),
                  channel: channel.trim(),
                  duration,
                  transcript,
                  fullText: transcript.map(t => t.text).join(' ')
                };
              }
            }
            
            // Method 2: Try to get captions from the video element
            const video = document.querySelector('video');
            if (video && video.textTracks && video.textTracks.length > 0) {
              const track = video.textTracks[0];
              const cues = [];
              for (let i = 0; i < track.cues.length; i++) {
                cues.push({
                  time: track.cues[i].startTime,
                  text: track.cues[i].text
                });
              }
              
              if (cues.length > 0) {
                const title = document.querySelector('h1.title')?.textContent || '';
                const channel = document.querySelector('#channel-name')?.textContent || '';
                
                return {
                  success: true,
                  title: title.trim(),
                  channel: channel.trim(),
                  duration: video.duration ? Math.floor(video.duration / 60) + ':' + (Math.floor(video.duration) % 60).toString().padStart(2, '0') : '',
                  transcript: cues.map(c => ({ time: c.time, text: c.text })),
                  fullText: cues.map(c => c.text).join(' ')
                };
              }
            }
            
            return {
              success: false,
              error: 'Transcript not found. Video may not have captions enabled.'
            };
            
          } catch (e) {
            return {
              success: false,
              error: e.message
            };
          }
        })()
      `,
      awaitPromise: true,
    });
    
    const result = transcriptResult.result.value;
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to extract transcript');
    }
    
    console.log('✓ Extracted transcript:', result.transcript.length, 'segments');
    console.log('Title:', result.title);
    console.log('Channel:', result.channel);
    
    return result;
    
  } catch (error) {
    console.error(' Error:', error.message);
    if (client) await client.close();
    throw error;
  } finally {
    if (client) await client.close();
  }
}

if (process.argv.length > 2) {
  const url = process.argv[2];
  extractYouTubeTranscript(url)
    .then(result => {
      console.log('\\n=== FULL TRANSCRIPT ===');
      console.log(result.fullText);
    })
    .catch(console.error);
} else {
  console.log('Usage: node extract-youtube-transcript-v2.js <youtube-url>');
}

module.exports = { extractYouTubeTranscript };

#!/usr/bin/env node
/**
 * Get Recent TikTok Videos & Comments
 * Uses managed browser to scrape your profile
 */

const CDP = require('chrome-remote-interface');
const fs = require('fs').promises;
const path = require('path');

async function getRecentTikToks() {
  console.log('🎵 Connecting to managed browser...');
  
  let client;
  try {
    client = await CDP({ port: 18800 });
    console.log('✅ Connected');
    
    const { Page, Runtime, Network } = client;
    
    await Page.enable();
    await Network.enable();
    
    // Go to your TikTok profile
    console.log('📱 Going to @ianmadrid_ profile...');
    await Page.navigate({ url: 'https://www.tiktok.com/@ianmadrid_' });
    
    console.log('⏳ Waiting 8s for page load...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Get page content to see what we're working with
    console.log('📄 Checking page content...');
    const checkResult = await Runtime.evaluate({
      expression: `
        document.title + ' | ' + (document.querySelector('[data-e2e="user-post-list"]') ? 'Has videos' : 'No videos found') + ' | ' + (document.querySelector('button[type="submit"]') ? 'Login required' : 'No login button');
      `,
    });
    
    console.log('Page info:', checkResult.result.value);
    
    // Try to get video list
    console.log('🎬 Looking for recent videos...');
    const videosResult = await Runtime.evaluate({
      expression: `
        const videos = [];
        const videoElements = document.querySelectorAll('[data-e2e="user-post-item"]');
        
        videoElements.forEach((el, i) => {
          if (i < 5) { // Get first 5 videos
            const desc = el.querySelector('[data-e2e="video-desc"]')?.textContent || '';
            const views = el.querySelector('[data-e2e="video-plays"]')?.textContent || '';
            const comments = el.querySelector('[data-e2e="video-comments"]')?.textContent || '';
            const likes = el.querySelector('[data-e2e="video-likes"]')?.textContent || '';
            
            videos.push({
              index: i,
              description: desc.substring(0, 100),
              views,
              comments,
              likes
            });
          }
        });
        
        videos;
      `,
    });
    
    const videos = videosResult.result.value || [];
    console.log('Found videos:', videos);
    
    if (videos.length === 0) {
      console.log('❌ No videos found. You might not be logged in or the page structure changed.');
      console.log('ℹ️ Try logging into TikTok manually in the browser first.');
    }
    
    await client.close();
    return videos;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.close();
    throw error;
  }
}

getRecentTikToks().catch(console.error);

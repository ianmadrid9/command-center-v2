#!/usr/bin/env node
/**
 * Scrape TikTok Comments Using Managed Browser
 * 
 * Uses CDP to connect to your running Chrome profile
 * Scrapes comments from your TikTok notifications page
 */

const CDP = require('chrome-remote-interface');
const fs = require('fs').promises;
const path = require('path');

async function scrapeTikTokComments() {
  console.log('🎵 Connecting to managed browser...');
  
  let client;
  try {
    client = await CDP({ port: 18800 });
    console.log('✅ Connected to browser');
    
    const { Page, Runtime } = client;
    
    await Page.enable();
    
    // Navigate to TikTok notifications (shows recent comment activity)
    console.log('📱 Navigating to TikTok notifications...');
    await Page.navigate({ url: 'https://www.tiktok.com/notifications' });
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load (10s)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📄 Page loaded, scraping comments...');
    
    // Execute JavaScript to scrape notifications/comments
    const result = await Runtime.evaluate({
      expression: `
        // Scrape from notifications
        const notifications = [];
        const notifElements = document.querySelectorAll('[data-e2e="notification_item"]');
        
        notifElements.forEach(el => {
          try {
            const text = el.textContent || '';
            const time = el.querySelector('time')?.textContent || '';
            
            // Check if it's a comment notification
            if (text.includes('commented') || text.includes('mentioned')) {
              const match = text.match(/@?(\\w+)\\s+commented/);
              const author = match ? match[1] : 'Unknown';
              
              notifications.push({
                author: author,
                username: '@' + author,
                text: text,
                likes: 0,
                timestamp: new Date().toISOString(),
                timeAgo: time,
                sentiment: 'neutral',
                isUrgent: text.includes('mentioned') || text.includes('question')
              });
            }
          } catch (e) {
            console.error('Error:', e);
          }
        });
        
        notifications;
      `,
      awaitPromise: true,
    });
    
    const comments = result.result.value || [];
    console.log(`✅ Scraped ${comments.length} comments/notifications`);
    
    // If we got comments, save them
    if (comments.length > 0) {
      const dataPath = path.join(__dirname, '..', 'data', 'tiktok-comments.json');
      const data = {
        last_updated: new Date().toISOString(),
        source: 'browser-scrape',
        comments: comments,
      };
      
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
      console.log(`💾 Saved to ${dataPath}`);
    } else {
      console.log('ℹ️ No comments found. You might need to:');
      console.log("   1. Make sure you're logged in to TikTok in the browser");
      console.log('   2. Check if you have recent comment notifications');
      console.log('   3. Or manually add comments to data/tiktok-comments.json');
    }
    
    await client.close();
    console.log('✅ Done!');
    
    return comments;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.close();
    throw error;
  }
}

scrapeTikTokComments().catch(console.error);

#!/usr/bin/env node
/**
 * Scrape LinkedIn Comments Using Managed Browser
 */

const CDP = require('chrome-remote-interface');
const fs = require('fs').promises;
const path = require('path');

async function scrapeLinkedInComments() {
  console.log('💼 Connecting to managed browser...');
  
  let client;
  try {
    client = await CDP({ port: 18800 });
    console.log('✅ Connected to browser');
    
    const { Page, Runtime } = client;
    
    await Page.enable();
    
    // Navigate to LinkedIn notifications
    console.log('📱 Navigating to LinkedIn notifications...');
    await Page.navigate({ url: 'https://www.linkedin.com/messaging/' });
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load (10s)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📄 Page loaded, checking for comments...');
    
    // Execute JavaScript to check if logged in
    const result = await Runtime.evaluate({
      expression: `
        document.body.textContent.substring(0, 500);
      `,
      awaitPromise: true,
    });
    
    const pageContent = result.result.value || '';
    
    if (pageContent.includes('Sign in') || pageContent.includes('Log in')) {
      console.log('❌ Not logged in to LinkedIn');
      console.log('ℹ️ You need to log in to LinkedIn in the browser first');
    } else {
      console.log('✅ Appears to be logged in');
      console.log('ℹ️ LinkedIn structure is complex - manual entry recommended for now');
    }
    
    await client.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.close();
    throw error;
  }
}

scrapeLinkedInComments().catch(console.error);

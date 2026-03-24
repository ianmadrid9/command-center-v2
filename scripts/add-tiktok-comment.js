#!/usr/bin/env node
/**
 * Add TikTok Comment
 * 
 * Usage: node scripts/add-tiktok-comment.js "comment text" author @username sentiment
 * 
 * Sentiment: positive, neutral, or negative
 * Add --urgent flag for urgent comments
 * 
 * Example:
 * node scripts/add-tiktok-comment.js "Great video!" john @johndoe positive
 * node scripts/add-tiktok-comment.js "When is Batch 9?" sarah @saraht neutral --urgent
 */

const fs = require('fs').promises;
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node add-tiktok-comment.js "comment text" author @username sentiment [--urgent]');
    console.log('Example: node add-tiktok-comment.js "Great video!" john @johndoe positive');
    process.exit(1);
  }
  
  const [text, author, username, sentiment, ...flags] = args;
  const isUrgent = flags.includes('--urgent');
  
  const dataPath = path.join(__dirname, '..', 'data', 'tiktok-comments.json');
  
  let data;
  try {
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    data = JSON.parse(fileContents);
  } catch {
    data = { last_updated: new Date().toISOString(), source: 'manual', comments: [] };
  }
  
  const newComment = {
    id: `tc-${Date.now()}`,
    videoId: 'latest',
    author,
    username,
    text,
    likes: 0,
    timestamp: new Date().toISOString(),
    sentiment: sentiment || 'neutral',
    isUrgent,
  };
  
  data.comments.unshift(newComment);
  data.last_updated = new Date().toISOString();
  
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  console.log('✅ Comment added:', text);
}

main().catch(console.error);

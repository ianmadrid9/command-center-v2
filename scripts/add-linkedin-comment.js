#!/usr/bin/env node
/**
 * Add LinkedIn Comment
 * 
 * Usage: node scripts/add-linkedin-comment.js "comment text" author "title" sentiment
 * 
 * Sentiment: positive, neutral, or negative
 * Add --urgent flag for urgent comments
 * 
 * Example:
 * node scripts/add-linkedin-comment.js "Great insights!" "John Doe" "CEO @ Company" positive
 * node scripts/add-linkedin-comment.js "Interested in Batch 9" "Sarah Chen" "VP @ TechCorp" neutral --urgent
 */

const fs = require('fs').promises;
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node add-linkedin-comment.js "comment text" author "title" sentiment [--urgent]');
    console.log('Example: node add-linkedin-comment.js "Great insights!" "John Doe" "CEO @ Company" positive');
    process.exit(1);
  }
  
  const [text, author, title, sentiment, ...flags] = args;
  const isUrgent = flags.includes('--urgent');
  
  const dataPath = path.join(__dirname, '..', 'data', 'linkedin-comments.json');
  
  let data;
  try {
    const fileContents = await fs.readFile(dataPath, 'utf-8');
    data = JSON.parse(fileContents);
  } catch {
    data = { last_updated: new Date().toISOString(), source: 'manual', comments: [] };
  }
  
  const newComment = {
    id: `lc-${Date.now()}`,
    postId: 'latest',
    author,
    authorTitle: title,
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

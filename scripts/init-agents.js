/**
 * Initialize all agent logs with sample data
 */

const fs = require('fs').promises;
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'data', 'agents');

const agents = [
  {
    agentId: 'tiktok-monitor',
    name: '🎵 TikTok Monitor',
    status: 'healthy',
    lastRun: new Date(Date.now() - 2 * 3600000).toISOString(), // 2h ago
    nextRun: new Date(Date.now() + 4 * 3600000).toISOString(), // 4h from now
    instructions: [
      { id: '1', timestamp: new Date().toISOString(), type: 'info', message: 'Check for new videos every 6 hours' },
      { id: '2', timestamp: new Date().toISOString(), type: 'info', message: 'Alert if video gets 10K+ views in first hour' },
    ],
    developments: [
      { id: '1', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), type: 'info', message: 'New video posted: "AI Startup Life"', metadata: { views: 23000 } },
      { id: '2', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), type: 'info', message: '12 new comments, 1 from verified account' },
    ],
    insights: [
      { id: '1', timestamp: new Date().toISOString(), type: 'suggestion', message: 'Posting at 2PM shows 40% better engagement - recommend scheduling posts for this time' },
    ],
    brainstorming: [],
    ianLastVisit: null,
    rookLastSummary: null,
  },
  {
    agentId: 'linkedin-monitor',
    name: '💼 LinkedIn Monitor',
    status: 'healthy',
    lastRun: new Date(Date.now() - 1 * 3600000).toISOString(), // 1h ago
    nextRun: new Date(Date.now() + 1 * 3600000).toISOString(), // 1h from now
    instructions: [
      { id: '1', timestamp: new Date().toISOString(), type: 'info', message: 'Check for new comments every hour' },
    ],
    developments: [
      { id: '1', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), type: 'info', message: '3 new comments on recent post' },
    ],
    insights: [],
    brainstorming: [],
    ianLastVisit: null,
    rookLastSummary: null,
  },
  {
    agentId: 'eventbrite',
    name: '🎫 Eventbrite',
    status: 'warning',
    lastRun: new Date(Date.now() - 6 * 3600000).toISOString(), // 6h ago
    nextRun: new Date().toISOString(), // Now
    instructions: [
      { id: '1', timestamp: new Date().toISOString(), type: 'info', message: 'Find tech meetups in NYC every 6 hours' },
      { id: '2', timestamp: new Date().toISOString(), type: 'info', message: 'Focus on free events or early-bird ≤$15' },
    ],
    developments: [
      { id: '1', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), type: 'info', message: 'Found 5 events this week' },
    ],
    insights: [
      { id: '1', timestamp: new Date().toISOString(), type: 'alert', message: '2 events have free tickets selling fast - grab soon' },
    ],
    brainstorming: [],
    ianLastVisit: null,
    rookLastSummary: null,
  },
  {
    agentId: 'transcript-extractor',
    name: '📝 Transcripts',
    status: 'healthy',
    lastRun: new Date(Date.now() - 3 * 3600000).toISOString(), // 3h ago
    nextRun: null,
    instructions: [
      { id: '1', timestamp: new Date().toISOString(), type: 'info', message: 'Extract transcripts when URL is provided' },
    ],
    developments: [
      { id: '1', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), type: 'info', message: 'Extracted 2 transcripts today' },
    ],
    insights: [],
    brainstorming: [],
    ianLastVisit: null,
    rookLastSummary: null,
  },
];

async function init() {
  console.log('Initializing agent logs...');
  
  // Ensure directory exists
  await fs.mkdir(AGENTS_DIR, { recursive: true });
  
  // Create each agent log
  for (const agent of agents) {
    const filePath = path.join(AGENTS_DIR, `${agent.agentId}.json`);
    await fs.writeFile(filePath, JSON.stringify(agent, null, 2));
    console.log(`✅ Created ${agent.name}`);
  }
  
  console.log('\n✅ All agents initialized!');
}

init().catch(console.error);

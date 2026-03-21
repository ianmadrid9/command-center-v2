// Mock data for dashboard development - replace with real API calls later

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  progress: number;
  dueDate?: string;
}

export interface Subagent {
  id: string;
  name: string;
  task: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  eta?: string;
  projectType?: 'landing' | 'app' | 'game';
  techStack?: string[];
  features?: string[];
  previewUrl?: string;
  repoUrl?: string;
}

export interface Activity {
  id: string;
  type: 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info';
  message: string;
  timestamp: string;
  details?: string;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  variant: 'default' | 'primary' | 'danger';
}

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Deploy production build',
    status: 'in-progress',
    priority: 'high',
    assignee: 'marine-bot',
    progress: 67,
    dueDate: '2026-03-21T10:00:00Z',
  },
  {
    id: '2',
    title: 'Review PR #342',
    status: 'pending',
    priority: 'medium',
    assignee: 'code-reviewer',
    progress: 0,
    dueDate: '2026-03-21T14:00:00Z',
  },
  {
    id: '3',
    title: 'Backup database',
    status: 'completed',
    priority: 'high',
    assignee: 'backup-agent',
    progress: 100,
    dueDate: '2026-03-21T06:00:00Z',
  },
  {
    id: '4',
    title: 'Sync Feishu docs',
    status: 'blocked',
    priority: 'low',
    progress: 45,
    dueDate: '2026-03-22T09:00:00Z',
  },
  {
    id: '5',
    title: 'Generate weekly report',
    status: 'pending',
    priority: 'medium',
    assignee: 'report-bot',
    progress: 0,
    dueDate: '2026-03-21T18:00:00Z',
  },
];

// Mock Subagents
export const mockSubagents: Subagent[] = [
  {
    id: 'sa-1',
    name: 'ticp-landing',
    task: 'Building TICP landing page (Next.js + Tailwind)',
    status: 'running',
    progress: 67,
    startedAt: '2026-03-21T12:30:00Z',
    eta: '8 min',
    projectType: 'landing',
    techStack: ['Next.js 15', 'Tailwind CSS', 'TypeScript'],
    features: ['Hero section', 'Features grid', 'Contact form', 'Mobile responsive'],
    previewUrl: 'https://ticp-landing.vercel.app',
    repoUrl: 'https://github.com/ianmadrid/ticp-landing',
  },
  {
    id: 'sa-2',
    name: 'tictactoe-game',
    task: 'Creating Tic Tac Toe mini app (React + TypeScript)',
    status: 'running',
    progress: 45,
    startedAt: '2026-03-21T12:15:00Z',
    eta: '12 min',
    projectType: 'game',
    techStack: ['React', 'TypeScript', 'Vite'],
    features: ['2-player mode', 'AI opponent', 'Score tracking', 'Undo move'],
    previewUrl: 'https://tictactoe-mini.vercel.app',
    repoUrl: 'https://github.com/ianmadrid/tictactoe-mini',
  },
  {
    id: 'sa-3',
    name: 'command-center',
    task: 'Building Command Center dashboard',
    status: 'completed',
    progress: 100,
    startedAt: '2026-03-21T06:00:00Z',
    eta: '0 min',
    projectType: 'app',
    techStack: ['Next.js', 'Prisma', 'SQLite'],
    features: ['Deployed', 'CI/CD pipeline'],
    previewUrl: 'https://command-center-v2-iota.vercel.app',
    repoUrl: 'https://github.com/ianmadrid/command-center-v2',
  },
  {
    id: 'sa-4',
    name: 'feishu-sync',
    task: 'Syncing Feishu cloud documents',
    status: 'idle',
    progress: 0,
    eta: '-',
  },
  {
    id: 'sa-5',
    name: 'github-monitor',
    task: 'Monitoring GitHub issues & PRs',
    status: 'running',
    progress: 100,
    startedAt: '2026-03-21T05:00:00Z',
    eta: 'continuous',
  },
  {
    id: 'sa-6',
    name: 'eventbrite-scout',
    task: 'Researching meetups & events on Eventbrite',
    status: 'running',
    progress: 82,
    startedAt: '2026-03-21T13:00:00Z',
    eta: '3 min',
    projectType: 'app',
    techStack: ['Eventbrite API', 'Node.js', 'Cron'],
    features: ['Daily event scraping', 'Categorization by date', 'Price filtering', 'Location mapping'],
  },
  {
    id: 'sa-7',
    name: 'transcript-bot',
    task: 'Extracting transcripts from TikTok & YouTube',
    status: 'running',
    progress: 100,
    startedAt: '2026-03-21T13:30:00Z',
    eta: 'continuous',
    projectType: 'app',
    techStack: ['Whisper API', 'YouTube Transcript API', 'TikTok Scraper'],
    features: ['Auto transcript extraction', 'One-click copy', 'Multi-platform support', 'Language detection'],
  },
];

// Mock Activity Feed
export const mockActivities: Activity[] = [
  {
    id: 'a-1',
    type: 'deploy',
    message: 'Production build deployed successfully',
    timestamp: '2026-03-21T06:45:00Z',
    details: 'Vercel deployment #1847',
  },
  {
    id: 'a-2',
    type: 'task-complete',
    message: 'Database backup completed',
    timestamp: '2026-03-21T06:30:00Z',
    details: '2.3GB backed up to S3',
  },
  {
    id: 'a-3',
    type: 'agent-spawn',
    message: 'New subagent spawned: code-reviewer',
    timestamp: '2026-03-21T06:15:00Z',
    details: 'PR #342 review task',
  },
  {
    id: 'a-4',
    type: 'info',
    message: 'Feishu sync completed',
    timestamp: '2026-03-21T06:00:00Z',
    details: '12 documents updated',
  },
  {
    id: 'a-5',
    type: 'error',
    message: 'API rate limit exceeded',
    timestamp: '2026-03-21T05:45:00Z',
    details: 'GitHub API - retrying in 5 min',
  },
  {
    id: 'a-6',
    type: 'deploy',
    message: 'Staging environment updated',
    timestamp: '2026-03-21T05:30:00Z',
    details: 'Commit: abc123f',
  },
];

// Mock System Health
export const mockHealth: SystemHealth = {
  cpu: 34,
  memory: 62,
  disk: 45,
  uptime: '14d 7h 23m',
  status: 'healthy',
};

// Mock Quick Actions
export const mockQuickActions: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Spawn Agent',
    icon: '🤖',
    action: 'spawn',
    variant: 'primary',
  },
  {
    id: 'qa-2',
    label: 'Deploy',
    icon: '🚀',
    action: 'deploy',
    variant: 'primary',
  },
  {
    id: 'qa-3',
    label: 'Refresh',
    icon: '🔄',
    action: 'refresh',
    variant: 'default',
  },
  {
    id: 'qa-4',
    label: 'Clear Cache',
    icon: '🧹',
    action: 'clear-cache',
    variant: 'default',
  },
  {
    id: 'qa-5',
    label: 'Emergency Stop',
    icon: '🛑',
    action: 'stop-all',
    variant: 'danger',
  },
];

// Helper functions for dynamic mock data
export function getTaskStats() {
  const total = mockTasks.length;
  const completed = mockTasks.filter((t) => t.status === 'completed').length;
  const inProgress = mockTasks.filter((t) => t.status === 'in-progress').length;
  const pending = mockTasks.filter((t) => t.status === 'pending').length;
  const blocked = mockTasks.filter((t) => t.status === 'blocked').length;

  return { total, completed, inProgress, pending, blocked };
}

export function getSubagentStats() {
  const total = mockSubagents.length;
  const running = mockSubagents.filter((s) => s.status === 'running').length;
  const idle = mockSubagents.filter((s) => s.status === 'idle').length;
  const completed = mockSubagents.filter((s) => s.status === 'completed').length;

  return { total, running, idle, completed };
}

// TikTok Types
export interface TikTokVideo {
  id: string;
  url: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  postedAt: string;
  thumbnail?: string;
}

export interface TikTokComment {
  id: string;
  videoId: string;
  author: string;
  text: string;
  likes: number;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isCreator?: boolean;
}

// Mock TikTok Videos (last 5 days)
export const mockTikTokVideos: TikTokVideo[] = [
  {
    id: 'tt-1',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567890',
    description: 'Day in the life running 3000+ person company 🇵🇭 #ceo #okpo #tech',
    views: 234500,
    likes: 18200,
    comments: 342,
    shares: 891,
    postedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-2',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567891',
    description: 'Our AI agent just closed a deal without me 😂 #ai #automation #okpo',
    views: 567800,
    likes: 45300,
    comments: 1205,
    shares: 2341,
    postedAt: '2026-03-19T09:15:00Z',
  },
  {
    id: 'tt-3',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567892',
    description: 'Tech internship program Batch 8 starts today! 🚀 #internship #tech #hiring',
    views: 123400,
    likes: 9800,
    comments: 456,
    shares: 234,
    postedAt: '2026-03-18T16:45:00Z',
  },
  {
    id: 'tt-4',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567893',
    description: 'NYC vs Manila office vibes 🗽🇵🇭 #jpmorgan #entrepreneur',
    views: 891200,
    likes: 67400,
    comments: 2103,
    shares: 4521,
    postedAt: '2026-03-17T11:00:00Z',
  },
  {
    id: 'tt-5',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567894',
    description: 'Building Command Center v2 live on stream 💻 #coding #saas #buildinpublic',
    views: 45600,
    likes: 3200,
    comments: 187,
    shares: 92,
    postedAt: '2026-03-16T20:30:00Z',
  },
];

// Mock TikTok Comments
export const mockTikTokComments: TikTokComment[] = [
  {
    id: 'tc-1',
    videoId: 'tt-2',
    author: 'techbro_mike',
    text: 'This is insane! What AI stack are you using?',
    likes: 234,
    timestamp: '2026-03-21T05:30:00Z',
    sentiment: 'positive',
  },
  {
    id: 'tc-2',
    videoId: 'tt-2',
    author: 'startup_sarah',
    text: 'Need this for my company ASAP 🔥',
    likes: 189,
    timestamp: '2026-03-21T04:15:00Z',
    sentiment: 'positive',
  },
  {
    id: 'tc-3',
    videoId: 'tt-1',
    author: 'manila_dev',
    text: 'Proud to be part of the OKPO family! 🇵🇭',
    likes: 567,
    timestamp: '2026-03-21T03:45:00Z',
    sentiment: 'positive',
  },
  {
    id: 'tc-4',
    videoId: 'tt-4',
    author: 'curious_coder',
    text: 'How do you manage teams across timezones?',
    likes: 123,
    timestamp: '2026-03-21T02:20:00Z',
    sentiment: 'neutral',
  },
  {
    id: 'tc-5',
    videoId: 'tt-4',
    author: 'ianmadrid_',
    text: 'Great question! I use async comms + overlapping hours. Will make a video about this!',
    likes: 892,
    timestamp: '2026-03-21T02:45:00Z',
    sentiment: 'positive',
    isCreator: true,
  },
  {
    id: 'tc-6',
    videoId: 'tt-3',
    author: 'job_hunter_ph',
    text: 'Is Batch 9 open for application? 🙏',
    likes: 45,
    timestamp: '2026-03-20T23:10:00Z',
    sentiment: 'neutral',
  },
  {
    id: 'tc-7',
    videoId: 'tt-1',
    author: 'hater_123',
    text: 'Another flex video? 🙄',
    likes: 12,
    timestamp: '2026-03-20T22:30:00Z',
    sentiment: 'negative',
  },
  {
    id: 'tc-8',
    videoId: 'tt-5',
    author: 'dev_enthusiast',
    text: 'What tech stack? Next.js?',
    likes: 67,
    timestamp: '2026-03-20T21:00:00Z',
    sentiment: 'neutral',
  },
  {
    id: 'tc-9',
    videoId: 'tt-2',
    author: 'ai_researcher',
    text: 'The future is here! Love seeing real world applications 🤖',
    likes: 345,
    timestamp: '2026-03-20T19:45:00Z',
    sentiment: 'positive',
  },
  {
    id: 'tc-10',
    videoId: 'tt-4',
    author: 'nyc_local',
    text: 'Representing! 🗽',
    likes: 234,
    timestamp: '2026-03-20T18:20:00Z',
    sentiment: 'positive',
  },
  {
    id: 'tc-11',
    videoId: 'tt-3',
    author: 'mom_of_three',
    text: 'My son applied! Fingers crossed 🤞',
    likes: 89,
    timestamp: '2026-03-20T17:00:00Z',
    sentiment: 'positive',
  },
  {
    id: 'tc-12',
    videoId: 'tt-1',
    author: 'business_coach',
    text: 'Leadership goals right here 💯',
    likes: 456,
    timestamp: '2026-03-20T16:30:00Z',
    sentiment: 'positive',
  },
];

export function getTikTokStats() {
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  // Filter videos from last 3 days
  const recentVideos = mockTikTokVideos.filter(v => {
    const videoDate = new Date(v.postedAt);
    return videoDate >= threeDaysAgo;
  });
  
  const totalViews = recentVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = recentVideos.reduce((sum, v) => sum + v.likes, 0);
  const totalComments = recentVideos.reduce((sum, v) => sum + v.comments, 0);
  const totalShares = recentVideos.reduce((sum, v) => sum + v.shares, 0);
  
  const sentimentBreakdown = {
    positive: mockTikTokComments.filter(c => c.sentiment === 'positive').length,
    neutral: mockTikTokComments.filter(c => c.sentiment === 'neutral').length,
    negative: mockTikTokComments.filter(c => c.sentiment === 'negative').length,
  };

  return { totalViews, totalLikes, totalComments, totalShares, sentimentBreakdown };
}

export function getCommentsByVideo(videoId: string) {
  return mockTikTokComments.filter(c => c.videoId === videoId);
}

export function getRecentComments(limit = 10) {
  return mockTikTokComments
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// LinkedIn Types
export interface LinkedInPost {
  id: string;
  url: string;
  content: string;
  impressions: number;
  likes: number;
  comments: number;
  reposts: number;
  postedAt: string;
  type: 'text' | 'image' | 'article' | 'video';
}

export interface LinkedInComment {
  id: string;
  postId: string;
  author: string;
  authorTitle?: string;
  text: string;
  likes: number;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isCreator?: boolean;
}

// Mock LinkedIn Posts (last 5 days)
export const mockLinkedInPosts: LinkedInPost[] = [
  {
    id: 'li-1',
    url: 'https://www.linkedin.com/posts/ianmadrid_okpo-ai-ceo-activity-7175234567890123456',
    content: "Just wrapped Q1 review with our 3,000+ team in the Philippines. The energy, the dedication, the results — I'm incredibly proud. Here's what we learned about scaling people-first...",
    impressions: 145000,
    likes: 3420,
    comments: 287,
    reposts: 156,
    postedAt: '2026-03-20T08:00:00Z',
    type: 'text',
  },
  {
    id: 'li-2',
    url: 'https://www.linkedin.com/posts/ianmadrid_artificialintelligence-automation-startup-activity-7174567890123456789',
    content: "Our AI agent closed its first deal today. No human intervention. This is the future of work — not replacing people, but amplifying what we can achieve...",
    impressions: 287000,
    likes: 8934,
    comments: 542,
    reposts: 891,
    postedAt: '2026-03-19T14:30:00Z',
    type: 'article',
  },
  {
    id: 'li-3',
    url: 'https://www.linkedin.com/posts/ianmadrid_hiring-tech-internship-activity-7173890123456789012',
    content: "Batch 8 of our Tech Internship Program starts Monday! 50+ students from universities across the Philippines. We're bridging the gap between classroom and real-world impact...",
    impressions: 67000,
    likes: 2145,
    comments: 178,
    reposts: 234,
    postedAt: '2026-03-18T10:15:00Z',
    type: 'image',
  },
  {
    id: 'li-4',
    url: 'https://www.linkedin.com/posts/ianmadrid_jpmorgan-nyc-entrepreneur-activity-7173123456789012345',
    content: "From JPMorgan to building my own empire. The corporate world taught me discipline, but entrepreneurship taught me freedom. Here's my journey...",
    impressions: 412000,
    likes: 12340,
    comments: 823,
    reposts: 1567,
    postedAt: '2026-03-17T16:45:00Z',
    type: 'video',
  },
  {
    id: 'li-5',
    url: 'https://www.linkedin.com/posts/ianmadrid_buildinpublic-saas-commandcenter-activity-7172456789012345678',
    content: "Building Command Center v2 in public. Day 1: Mock data first, backend later. Ship fast, iterate faster. Who else is building this weekend?",
    impressions: 34000,
    likes: 1234,
    comments: 89,
    reposts: 45,
    postedAt: '2026-03-16T19:00:00Z',
    type: 'text',
  },
];

// Mock LinkedIn Comments
export const mockLinkedInComments: LinkedInComment[] = [
  {
    id: 'lc-1',
    postId: 'li-2',
    author: 'Sarah Chen',
    authorTitle: 'VP Engineering @ TechCorp',
    text: "This is the kind of innovation we need to see more of. Would love to learn more about your AI stack and how you're handling edge cases.",
    likes: 234,
    timestamp: '2026-03-21T06:30:00Z',
    sentiment: 'positive',
  },
  {
    id: 'lc-2',
    postId: 'li-2',
    author: 'Marcus Johnson',
    authorTitle: 'Founder @ StartupLab',
    text: "Incredible milestone! We're exploring similar automation at our company. Happy to connect and share learnings.",
    likes: 189,
    timestamp: '2026-03-21T05:15:00Z',
    sentiment: 'positive',
  },
  {
    id: 'lc-3',
    postId: 'li-1',
    author: 'Maria Santos',
    authorTitle: 'HR Director @ SPM',
    text: "Proud to be part of this journey! Our team in Manila is unstoppable 🇵🇭",
    likes: 567,
    timestamp: '2026-03-21T04:00:00Z',
    sentiment: 'positive',
    isCreator: true,
  },
  {
    id: 'lc-4',
    postId: 'li-4',
    author: 'David Park',
    authorTitle: 'Software Engineer @ Google',
    text: "What was the hardest part of transitioning from corporate to entrepreneurship?",
    likes: 89,
    timestamp: '2026-03-21T03:20:00Z',
    sentiment: 'neutral',
  },
  {
    id: 'lc-5',
    postId: 'li-4',
    author: 'Ian Madrid',
    authorTitle: 'CEO @ SPM | Founder @ OkPo AI',
    text: "Great question David! For me it was letting go of the 'stable paycheck' mindset. The uncertainty is real, but so is the freedom. Happy to chat more about it!",
    likes: 456,
    timestamp: '2026-03-21T03:45:00Z',
    sentiment: 'positive',
    isCreator: true,
  },
  {
    id: 'lc-6',
    postId: 'li-3',
    author: 'Jennifer Lopez',
    authorTitle: 'Career Coach',
    text: "This program is changing lives. My mentee from Batch 5 just got promoted! Keep up the amazing work.",
    likes: 123,
    timestamp: '2026-03-20T22:10:00Z',
    sentiment: 'positive',
  },
  {
    id: 'lc-7',
    postId: 'li-1',
    author: 'Robert Kim',
    authorTitle: 'Operations Manager',
    text: "How do you maintain culture at this scale? Would love to hear your thoughts on remote team management.",
    likes: 78,
    timestamp: '2026-03-20T20:30:00Z',
    sentiment: 'neutral',
  },
  {
    id: 'lc-8',
    postId: 'li-2',
    author: 'Alex Thompson',
    authorTitle: 'AI Researcher @ MIT',
    text: "The implications of autonomous agents in business are profound. Would be interested in collaborating on research.",
    likes: 345,
    timestamp: '2026-03-20T18:45:00Z',
    sentiment: 'positive',
  },
  {
    id: 'lc-9',
    postId: 'li-5',
    author: 'Emily Zhang',
    authorTitle: 'Full Stack Developer',
    text: "Following along! What's your tech stack for Command Center?",
    likes: 45,
    timestamp: '2026-03-20T17:00:00Z',
    sentiment: 'neutral',
  },
  {
    id: 'lc-10',
    postId: 'li-4',
    author: 'Michael Brown',
    authorTitle: 'Investor @ VentureFirst',
    text: "Inspiring story. We're always looking for founders with this kind of drive. Let's connect.",
    likes: 234,
    timestamp: '2026-03-20T15:20:00Z',
    sentiment: 'positive',
  },
  {
    id: 'lc-11',
    postId: 'li-3',
    author: 'Lisa Wang',
    authorTitle: 'University Professor',
    text: "Our students love this program. The practical experience they gain is invaluable.",
    likes: 167,
    timestamp: '2026-03-20T14:00:00Z',
    sentiment: 'positive',
  },
  {
    id: 'lc-12',
    postId: 'li-1',
    author: 'James Wilson',
    authorTitle: 'Business Consultant',
    text: "Scaling to 3,000+ is no small feat. What's your secret?",
    likes: 92,
    timestamp: '2026-03-20T12:30:00Z',
    sentiment: 'neutral',
  },
];

export function getLinkedInStats() {
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  // Filter posts from last 3 days
  const recentPosts = mockLinkedInPosts.filter(p => {
    const postDate = new Date(p.postedAt);
    return postDate >= threeDaysAgo;
  });
  
  const totalImpressions = recentPosts.reduce((sum, p) => sum + p.impressions, 0);
  const totalLikes = recentPosts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = recentPosts.reduce((sum, p) => sum + p.comments, 0);
  const totalReposts = recentPosts.reduce((sum, p) => sum + p.reposts, 0);
  
  const sentimentBreakdown = {
    positive: mockLinkedInComments.filter(c => c.sentiment === 'positive').length,
    neutral: mockLinkedInComments.filter(c => c.sentiment === 'neutral').length,
    negative: mockLinkedInComments.filter(c => c.sentiment === 'negative').length,
  };

  return { totalImpressions, totalLikes, totalComments, totalReposts, sentimentBreakdown };
}

export function getCommentsByPost(postId: string) {
  return mockLinkedInComments.filter(c => c.postId === postId);
}

export function getRecentLinkedInComments(limit = 10) {
  return mockLinkedInComments
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Eventbrite Types
export interface EventbriteEvent {
  id: string;
  url: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  price: string;
  priceVerified: boolean;
  earlyBird?: boolean;
  attendees: number;
  category: string;
  timing: 'today' | 'tomorrow' | 'this-week' | 'next-week';
  insight?: {
    worth: 'high' | 'medium' | 'low' | 'avoid';
    reason: string;
    flags?: string[];
  };
  attending?: boolean;
  flags?: string[];
}

// Mock Eventbrite Events
export const mockEventbriteEvents: EventbriteEvent[] = [
  {
    id: 'eb-1',
    url: 'https://www.eventbrite.com/e/ai-startup-founders-meetup-tickets-123456',
    title: 'AI Startup Founders Meetup',
    organizer: 'Tech Manila',
    date: '2026-03-21',
    time: '18:00',
    location: 'BGC, Taguig',
    isOnline: false,
    price: '₱500',
    priceVerified: true,
    attendees: 87,
    category: 'Technology',
    timing: 'today',
    insight: {
      worth: 'high',
      reason: 'Strong organizer track record, relevant to your AI work, good networking potential',
    },
    attending: false,
  },
  {
    id: 'eb-2',
    url: 'https://www.eventbrite.com/e/nextjs-developers-workshop-tickets-234567',
    title: 'Next.js Developers Workshop',
    organizer: 'Philippine JS',
    date: '2026-03-21',
    time: '14:00',
    location: 'Makati',
    isOnline: false,
    price: 'Free',
    priceVerified: true,
    attendees: 124,
    category: 'Development',
    timing: 'today',
    insight: {
      worth: 'medium',
      reason: 'Good for staying current, but you already know Next.js well',
    },
    attending: true,
  },
  {
    id: 'eb-3',
    url: 'https://www.eventbrite.com/e/saas-scaling-strategies-tickets-345678',
    title: 'SaaS Scaling Strategies',
    organizer: 'Startup Grind Manila',
    date: '2026-03-22',
    time: '16:00',
    location: 'Ortigas Center',
    isOnline: false,
    price: '₱800',
    priceVerified: false,
    earlyBird: false,
    attendees: 56,
    category: 'Business',
    timing: 'tomorrow',
    insight: {
      worth: 'high',
      reason: 'Directly applicable to your 3000+ person operation, Startup Grind is reputable',
    },
    attending: false,
  },
  {
    id: 'eb-4',
    url: 'https://www.eventbrite.com/e/remote-team-building-webinar-tickets-456789',
    title: 'Remote Team Building Webinar',
    organizer: 'HR Summit PH',
    date: '2026-03-22',
    time: '10:00',
    location: 'Online',
    isOnline: true,
    price: 'Free',
    priceVerified: true,
    attendees: 234,
    category: 'HR & Management',
    timing: 'tomorrow',
    insight: {
      worth: 'medium',
      reason: 'Online format is convenient, but content may be generic for your scale',
    },
    attending: false,
  },
  {
    id: 'eb-5',
    url: 'https://www.eventbrite.com/e/fintech-innovations-summit-tickets-567890',
    title: 'FinTech Innovations Summit',
    organizer: 'FinTech Philippines',
    date: '2026-03-24',
    time: '09:00',
    location: 'Mall of Asia Arena',
    isOnline: false,
    price: '₱2,500',
    priceVerified: true,
    earlyBird: false,
    attendees: 412,
    category: 'Finance',
    timing: 'this-week',
    insight: {
      worth: 'low',
      reason: 'Expensive, large crowd limits meaningful connections, not core to your business',
    },
    attending: false,
  },
  {
    id: 'eb-6',
    url: 'https://www.eventbrite.com/e/react-native-mobile-dev-tickets-678901',
    title: 'React Native Mobile Dev Meetup',
    organizer: 'Mobile Devs PH',
    date: '2026-03-25',
    time: '18:30',
    location: 'Bonifacio High Street',
    isOnline: false,
    price: '₱300',
    priceVerified: false,
    earlyBird: true,
    attendees: 78,
    category: 'Development',
    timing: 'this-week',
    insight: {
      worth: 'low',
      reason: 'You are not building mobile apps currently, low ROI for your time',
    },
    attending: false,
  },
  {
    id: 'eb-7',
    url: 'https://www.eventbrite.com/e/ai-automation-for-business-tickets-789012',
    title: 'AI Automation for Business',
    organizer: 'AI Philippines',
    date: '2026-03-26',
    time: '15:00',
    location: 'BGC',
    isOnline: false,
    price: '₱1,200',
    priceVerified: true,
    attendees: 145,
    category: 'Technology',
    timing: 'this-week',
    insight: {
      worth: 'high',
      reason: 'Perfect fit for OkPo AI, potential partnership opportunities, credible organizer',
    },
    attending: true,
  },
  {
    id: 'eb-8',
    url: 'https://www.eventbrite.com/e/entrepreneur-networking-night-tickets-890123',
    title: 'Entrepreneur Networking Night',
    organizer: 'EO Manila',
    date: '2026-03-27',
    time: '19:00',
    location: 'Makati',
    isOnline: false,
    price: '₱1,500',
    priceVerified: true,
    earlyBird: false,
    attendees: 92,
    category: 'Networking',
    timing: 'this-week',
    insight: {
      worth: 'medium',
      reason: 'EO is quality network, but steep price. Consider if you need new connections',
    },
    attending: false,
  },
  {
    id: 'eb-9',
    url: 'https://www.eventbrite.com/e/tech-hiring-strategies-tickets-901234',
    title: 'Tech Hiring Strategies',
    organizer: 'HR Tech Summit',
    date: '2026-03-28',
    time: '13:00',
    location: 'Online',
    isOnline: true,
    price: '₱600',
    priceVerified: true,
    attendees: 167,
    category: 'HR & Management',
    timing: 'next-week',
    insight: {
      worth: 'high',
      reason: 'Relevant for your internship program and 3000+ workforce, online is convenient',
    },
    attending: false,
  },
  {
    id: 'eb-10',
    url: 'https://www.eventbrite.com/e/startup-funding-pitch-day-tickets-012345',
    title: 'Startup Funding Pitch Day',
    organizer: 'VentureLab PH',
    date: '2026-03-28',
    time: '14:00',
    location: 'Ayala Triangle Gardens',
    isOnline: false,
    price: 'Free',
    priceVerified: false,
    attendees: 203,
    category: 'Business',
    timing: 'next-week',
    insight: {
      worth: 'medium',
      reason: 'Free is great, but mostly early-stage founders. May find talent or co-founders',
      flags: ['Price may change - unverified'],
    },
    attending: false,
  },
  {
    id: 'eb-11',
    url: 'https://www.eventbrite.com/e/cloud-architecture-deep-dive-tickets-112233',
    title: 'Cloud Architecture Deep Dive',
    organizer: 'AWS User Group PH',
    date: '2026-03-29',
    time: '10:00',
    location: 'Ortigas',
    isOnline: false,
    price: '₱900',
    priceVerified: true,
    earlyBird: true,
    attendees: 89,
    category: 'Technology',
    timing: 'next-week',
    insight: {
      worth: 'medium',
      reason: 'Technical depth is good, but your team leads could attend and brief you',
      flags: ['Early bird ends soon'],
    },
    attending: false,
  },
  {
    id: 'eb-12',
    url: 'https://www.eventbrite.com/e/ecommerce-growth-hacking-tickets-223344',
    title: 'E-commerce Growth Hacking',
    organizer: 'E-commerce PH',
    date: '2026-03-30',
    time: '16:00',
    location: 'Online',
    isOnline: true,
    price: '₱450',
    priceVerified: false,
    attendees: 312,
    category: 'Marketing',
    timing: 'next-week',
    insight: {
      worth: 'avoid',
      reason: 'Organizer has mixed reviews, content likely recycled, not aligned with your biz',
      flags: ['Unverified price', 'Organizer rating: 3.2/5'],
    },
    attending: false,
  },
];

export function getEventbriteStats() {
  const today = mockEventbriteEvents.filter(e => e.timing === 'today').length;
  const tomorrow = mockEventbriteEvents.filter(e => e.timing === 'tomorrow').length;
  const thisWeek = mockEventbriteEvents.filter(e => e.timing === 'this-week').length;
  const nextWeek = mockEventbriteEvents.filter(e => e.timing === 'next-week').length;
  const total = mockEventbriteEvents.length;
  
  const freeEvents = mockEventbriteEvents.filter(e => e.price === 'Free').length;
  const onlineEvents = mockEventbriteEvents.filter(e => e.isOnline).length;

  return { today, tomorrow, thisWeek, nextWeek, total, freeEvents, onlineEvents };
}

export function getTodayEventsCount() {
  return mockEventbriteEvents.filter(e => e.timing === 'today').length;
}

export function getEventsByTiming(timing: string) {
  return mockEventbriteEvents.filter(e => e.timing === timing);
}

export function getAttendingEvents() {
  return mockEventbriteEvents.filter(e => e.attending);
}

export function getAttendingByDay() {
  const attending = getAttendingEvents();
  const byDay: Record<string, EventbriteEvent[]> = {
    today: [],
    tomorrow: [],
    'this-week': [],
    'next-week': [],
  };
  
  attending.forEach(event => {
    byDay[event.timing].push(event);
  });
  
  return byDay;
}

export function toggleAttending(eventId: string) {
  const event = mockEventbriteEvents.find(e => e.id === eventId);
  if (event) {
    event.attending = !event.attending;
  }
  return event;
}

// Transcript Types
export interface Transcript {
  id: string;
  url: string;
  platform: 'tiktok' | 'youtube';
  title: string;
  author: string;
  duration: string;
  transcript: string;
  timestamp: string;
  status: 'processing' | 'completed' | 'failed';
  language?: string;
}

// Mock Transcripts
export const mockTranscripts: Transcript[] = [
  {
    id: 'tr-1',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567891',
    platform: 'tiktok',
    title: 'Our AI agent just closed a deal without me 😂',
    author: '@ianmadrid_',
    duration: '0:47',
    transcript: `Hey everyone, so something crazy happened today. Our AI agent - yeah, the one we built at OkPo AI - it literally closed a deal without any human intervention.

Let me break this down. We've been working on this autonomous sales agent for the past few months. It can handle inbound leads, qualify them, answer questions, schedule calls, and close deals.

Today, a lead came in through our website at like 3 AM. The agent responded within seconds, answered all their questions about pricing and features, handled objections, sent over the contract, and they signed.

I woke up to a notification that we closed a ₱250K deal while I was sleeping. This is the future of work, people. It's not about replacing humans - it's about amplifying what we can achieve.

Our team can now focus on the complex stuff, the creative work, the relationships. The AI handles the repetitive tasks.

If you're building in this space, let's connect. This is just the beginning.`,
    timestamp: '2026-03-21T13:30:00Z',
    status: 'completed',
    language: 'en',
  },
  {
    id: 'tr-2',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    title: 'Building Command Center v2 - Live Coding Session',
    author: 'Ian Madrid',
    duration: '45:23',
    transcript: `What's up everyone, welcome back to the channel. Today we're building Command Center version 2 from scratch.

So the idea here is simple - I want a dashboard that shows me everything happening across my businesses. We're talking:
- Active subagents and what they're working on
- Social media monitoring - TikTok, LinkedIn, YouTube comments
- Event discovery from Eventbrite
- Project tracking for all the mini apps and landing pages we're spinning up

Let me show you the stack. We're using Next.js 15 with the App Router, TypeScript obviously, Tailwind for styling, and we're deploying to Vercel.

First, let's set up the basic layout. I want a clean, dark theme - easy on the eyes when you're staring at this all day.

[typing sounds]

Alright, so we've got the navbar, sidebar, and main content area. Now let's add the KPI cards at the top. These will show quick stats - active tasks, running agents, social metrics.

Next, we need the social monitoring section. This is where it gets interesting. We're going to pull in comments from TikTok, LinkedIn, and eventually YouTube. The goal is to see all engagement in one place.

[continues coding...]

So that's the basic structure. In the next video, we'll connect the actual APIs and make this thing live. If you're following along, drop a comment and let me know what features you want to see.

Thanks for watching, and I'll see you in the next one.`,
    timestamp: '2026-03-21T12:00:00Z',
    status: 'completed',
    language: 'en',
  },
  {
    id: 'tr-3',
    url: 'https://www.tiktok.com/@ianmadrid_/video/7345678901234567890',
    platform: 'tiktok',
    title: 'Day in the life running 3000+ person company 🇵🇭',
    author: '@ianmadrid_',
    duration: '1:12',
    transcript: `6 AM - Wake up, check messages from the Manila team. It's already evening there so they're wrapping up.

7 AM - Quick workout, then breakfast with the kids. This part is non-negotiable. Family first.

9 AM - Deep work block. This is when I build. Right now it's Command Center v2. No meetings, no calls, just coding.

12 PM - Lunch and team standup. We've got 3000+ people across call centers, field work, HR, legal, data, and IT. The standup is just with my direct reports - keeps it focused.

2 PM - Meetings. Investor calls, partnership discussions, hiring decisions. I try to batch these so they don't fragment my day.

5 PM - Review what the AI agents built today. Yeah, we have subagents working on projects while I'm in meetings. It's wild.

7 PM - Dinner, then maybe some light work if I'm feeling it. Otherwise, family time or catching up on content.

The truth is, running a company this size isn't about doing everything yourself. It's about building systems and teams that work without you.

That's the goal anyway. Some days I hit it, some days I don't. But that's the journey.`,
    timestamp: '2026-03-21T10:00:00Z',
    status: 'completed',
    language: 'en',
  },
];

export function getTranscriptStats() {
  const total = mockTranscripts.length;
  const completed = mockTranscripts.filter(t => t.status === 'completed').length;
  const processing = mockTranscripts.filter(t => t.status === 'processing').length;
  const tiktokCount = mockTranscripts.filter(t => t.platform === 'tiktok').length;
  const youtubeCount = mockTranscripts.filter(t => t.platform === 'youtube').length;

  return { total, completed, processing, tiktokCount, youtubeCount };
}

export function getTranscriptById(id: string) {
  return mockTranscripts.find(t => t.id === id);
}

export function getRecentTranscripts(limit = 5) {
  return mockTranscripts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

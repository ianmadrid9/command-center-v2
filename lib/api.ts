/**
 * Real API client for Command Center
 * Replaces mock data with actual backend calls
 */

import type {
  Task,
  Subagent,
  Activity,
  SystemHealth,
  QuickAction,
  TikTokVideo,
  TikTokComment,
  LinkedInPost,
  LinkedInComment,
  EventbriteEvent,
  Transcript,
} from './mockData';

// ============ SUBAGENTS ============

export interface SubagentStats {
  total: number;
  running: number;
  idle: number;
  completed: number;
}

export async function fetchSubagents(): Promise<Subagent[]> {
  const res = await fetch('/api/subagents');
  if (!res.ok) throw new Error('Failed to fetch subagents');
  const data = await res.json();
  return data.subagents || [];
}

export async function fetchSubagentStats(): Promise<SubagentStats> {
  const subagents = await fetchSubagents();
  return {
    total: subagents.length,
    running: subagents.filter(s => s.status === 'running').length,
    idle: subagents.filter(s => s.status === 'idle').length,
    completed: subagents.filter(s => s.status === 'completed').length,
  };
}

export async function spawnSubagent(task: string, options?: {
  projectType?: 'landing' | 'app' | 'game';
  techStack?: string[];
  features?: string[];
}): Promise<Subagent> {
  const res = await fetch('/api/subagents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, ...options }),
  });
  if (!res.ok) throw new Error('Failed to spawn subagent');
  const data = await res.json();
  return data.subagent;
}

export async function sendAgentMessage(agentId: string, message: string): Promise<{ response: string }> {
  const res = await fetch(`/api/subagents/${agentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  const data = await res.json();
  return { response: data.response };
}

// ============ EVENTBRITE ============

export interface EventbriteData {
  last_updated: string | null;
  events: any[];
  total_count: number;
}

export async function fetchEventbriteEvents(): Promise<EventbriteData> {
  const res = await fetch('/api/eventbrite');
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return {
    last_updated: data.last_updated,
    events: data.events || [],
    total_count: data.total_count || 0,
  };
}

export interface RSVPData {
  last_updated: string | null;
  rsvps: any[];
  total_count: number;
}

export async function fetchRSVPs(): Promise<RSVPData> {
  const res = await fetch('/api/rsvps');
  if (!res.ok) throw new Error('Failed to fetch RSVPs');
  const data = await res.json();
  return {
    last_updated: data.last_updated,
    rsvps: data.rsvps || [],
    total_count: data.total_count || 0,
  };
}

export async function runAgent(agent: string): Promise<{ success: boolean; rsvps?: number; error?: string }> {
  const res = await fetch('/api/agents/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent }),
  });
  const data = await res.json();
  return data;
}

// ============ SYSTEM HEALTH ============

export async function fetchSystemHealth(): Promise<SystemHealth> {
  // For now, return mock data - can be replaced with real system metrics
  return {
    cpu: 34,
    memory: 62,
    disk: 45,
    uptime: '14d 7h 23m',
    status: 'healthy',
  };
}

// ============ ACTIVITIES ============

export async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch('/api/activities');
  if (!res.ok) throw new Error('Failed to fetch activities');
  const data = await res.json();
  return data.activities || [];
}

// ============ TIKTOK ============

export interface TikTokStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  urgentBreakdown: {
    total: number;
    preview: TikTokComment | null;
  };
}

export async function fetchTikTokVideos(): Promise<TikTokVideo[]> {
  const res = await fetch('/api/tiktok/videos');
  if (!res.ok) throw new Error('Failed to fetch TikTok videos');
  const data = await res.json();
  return data.videos || [];
}

export async function fetchTikTokComments(videoId?: string): Promise<TikTokComment[]> {
  const url = videoId ? `/api/tiktok/comments?videoId=${videoId}` : '/api/tiktok/comments';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch TikTok comments');
  const data = await res.json();
  return data.comments || [];
}

export async function fetchTikTokStats(): Promise<TikTokStats> {
  const res = await fetch('/api/tiktok/stats');
  if (!res.ok) throw new Error('Failed to fetch TikTok stats');
  const data = await res.json();
  return data;
}

// ============ LINKEDIN ============

export interface LinkedInStats {
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  urgentBreakdown: {
    total: number;
    preview: LinkedInComment | null;
  };
}

export async function fetchLinkedInPosts(): Promise<LinkedInPost[]> {
  const res = await fetch('/api/linkedin/posts');
  if (!res.ok) throw new Error('Failed to fetch LinkedIn posts');
  const data = await res.json();
  return data.posts || [];
}

export async function fetchLinkedInComments(postId?: string): Promise<LinkedInComment[]> {
  const url = postId ? `/api/linkedin/comments?postId=${postId}` : '/api/linkedin/comments';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch LinkedIn comments');
  const data = await res.json();
  return data.comments || [];
}

export async function fetchLinkedInStats(): Promise<LinkedInStats> {
  const res = await fetch('/api/linkedin/stats');
  if (!res.ok) throw new Error('Failed to fetch LinkedIn stats');
  const data = await res.json();
  return data;
}

// ============ TRANSCRIPTS ============

export async function fetchTranscripts(limit = 10): Promise<Transcript[]> {
  const res = await fetch(`/api/transcripts?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch transcripts');
  const data = await res.json();
  return data.transcripts || [];
}

export async function extractTranscript(url: string): Promise<Transcript> {
  const res = await fetch('/api/transcripts/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to extract transcript');
  const data = await res.json();
  return data.transcript;
}

// ============ PROJECTS ============

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'on_track' | 'at_risk' | 'blocked' | 'completed';
  progress: number;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.projects || [];
}

export async function createProject(data: { name: string; description?: string }): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  const result = await res.json();
  return result.project;
}

// ============ TASKS ============

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks || [];
}

export async function createTask(data: { title: string; priority?: string }): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create task');
  const result = await res.json();
  return result.task;
}

// ============ MOCK DATA HELPERS (for components without backend yet) ============

// Re-export from mockData for components that still need it
export {
  getTikTokStats,
  getLinkedInStats,
  getRecentComments,
  getRecentLinkedInComments,
  mockQuickActions,
  mockTranscripts,
  getTaskStats,
  getSubagentStats,
  mockEventbriteEvents,
} from './mockData';

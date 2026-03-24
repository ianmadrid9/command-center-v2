/**
 * Agent Logs - Full logging for Rook to read
 * Minimalist UI for Ian to glance
 */

import { promises as fs } from 'fs';
import path from 'path';

const AGENTS_DIR = path.join(process.cwd(), 'data', 'agents');

export interface AgentLog {
  agentId: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'idle';
  lastRun: string | null;
  nextRun: string | null;
  instructions: LogEntry[];
  developments: LogEntry[];
  insights: LogEntry[];
  brainstorming: LogEntry[];
  ianLastVisit: string | null;
  rookLastSummary: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  metadata?: any;
}

// Ensure agents directory exists
async function ensureAgentsDir() {
  try {
    await fs.access(AGENTS_DIR);
  } catch {
    await fs.mkdir(AGENTS_DIR, { recursive: true });
  }
}

// Get agent log file path
function getAgentLogPath(agentId: string): string {
  return path.join(AGENTS_DIR, `${agentId}.json`);
}

// Initialize agent log
export async function initAgentLog(agentId: string, name: string): Promise<AgentLog> {
  await ensureAgentsDir();
  
  const logPath = getAgentLogPath(agentId);
  
  try {
    await fs.access(logPath);
    // Already exists, return existing
    return await getAgentLog(agentId);
  } catch {
    // Create new
    const log: AgentLog = {
      agentId,
      name,
      status: 'idle',
      lastRun: null,
      nextRun: null,
      instructions: [],
      developments: [],
      insights: [],
      brainstorming: [],
      ianLastVisit: null,
      rookLastSummary: null,
    };
    
    await fs.writeFile(logPath, JSON.stringify(log, null, 2));
    return log;
  }
}

// Get agent log
export async function getAgentLog(agentId: string): Promise<AgentLog> {
  const logPath = getAgentLogPath(agentId);
  const content = await fs.readFile(logPath, 'utf-8');
  return JSON.parse(content);
}

// Get all agent logs (for Dev Agents card)
export async function getAllAgentLogs(): Promise<AgentLog[]> {
  await ensureAgentsDir();
  
  try {
    const files = await fs.readdir(AGENTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const logs = await Promise.all(
      jsonFiles.map(async file => {
        const agentId = file.replace('.json', '');
        return await getAgentLog(agentId);
      })
    );
    
    return logs.sort((a, b) => {
      // Sort by status (error/warning first), then by lastRun
      const statusPriority = { error: 0, warning: 1, healthy: 2, idle: 3 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return (b.lastRun || '').localeCompare(a.lastRun || '');
    });
  } catch {
    return [];
  }
}

// Add log entry
export async function addLogEntry(
  agentId: string,
  section: 'instructions' | 'developments' | 'insights' | 'brainstorming',
  message: string,
  type: string = 'info',
  metadata?: any
): Promise<void> {
  const log = await getAgentLog(agentId);
  
  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    metadata,
  };
  
  log[section].push(entry);
  
  // Keep last 100 entries per section
  if (log[section].length > 100) {
    log[section] = log[section].slice(-100);
  }
  
  await fs.writeFile(getAgentLogPath(agentId), JSON.stringify(log, null, 2));
}

// Update agent status
export async function updateAgentStatus(
  agentId: string,
  status: 'healthy' | 'warning' | 'error' | 'idle',
  lastRun?: string | null,
  nextRun?: string | null
): Promise<void> {
  const log = await getAgentLog(agentId);
  log.status = status;
  if (lastRun !== undefined) log.lastRun = lastRun;
  if (nextRun !== undefined) log.nextRun = nextRun;
  await fs.writeFile(getAgentLogPath(agentId), JSON.stringify(log, null, 2));
}

// Mark Ian's last visit
export async function markIanVisit(agentId: string): Promise<void> {
  const log = await getAgentLog(agentId);
  log.ianLastVisit = new Date().toISOString();
  await fs.writeFile(getAgentLogPath(agentId), JSON.stringify(log, null, 2));
}

// Mark Rook's last summary
export async function markRookSummary(agentId: string): Promise<void> {
  const log = await getAgentLog(agentId);
  log.rookLastSummary = new Date().toISOString();
  await fs.writeFile(getAgentLogPath(agentId), JSON.stringify(log, null, 2));
}

// Get entries since timestamp (for "catch up" feature)
export async function getEntriesSince(agentId: string, since: string): Promise<{
  developments: LogEntry[];
  insights: LogEntry[];
  brainstorming: LogEntry[];
}> {
  const log = await getAgentLog(agentId);
  const sinceTime = new Date(since).getTime();
  
  return {
    developments: log.developments.filter(e => new Date(e.timestamp).getTime() > sinceTime),
    insights: log.insights.filter(e => new Date(e.timestamp).getTime() > sinceTime),
    brainstorming: log.brainstorming.filter(e => new Date(e.timestamp).getTime() > sinceTime),
  };
}

// Predefined activity log IDs for dashboard sections
export const ACTIVITY_LOG_IDS = {
  TIKTOK: 'tiktok-monitor',
  LINKEDIN: 'linkedin-monitor',
  EVENTBRITE: 'eventbrite',
  TRANSCRIPTS: 'transcript-extractor',
  SYSTEM_CAPACITY: 'system-capacity',
  ACTIVITY_FEED: 'activity-feed',
  DEPLOYMENTS: 'deployments',
  LIFE_GOALS: 'life-goals',
} as const;

// Initialize all default activity logs
export async function initializeAllActivityLogs(): Promise<void> {
  const logs = [
    { id: ACTIVITY_LOG_IDS.TIKTOK, name: '🎵 TikTok' },
    { id: ACTIVITY_LOG_IDS.LINKEDIN, name: '💼 LinkedIn' },
    { id: ACTIVITY_LOG_IDS.EVENTBRITE, name: '🎫 Eventbrite' },
    { id: ACTIVITY_LOG_IDS.TRANSCRIPTS, name: '📝 Transcripts' },
    { id: ACTIVITY_LOG_IDS.SYSTEM_CAPACITY, name: '📊 System' },
    { id: ACTIVITY_LOG_IDS.ACTIVITY_FEED, name: '📋 Activity' },
    { id: ACTIVITY_LOG_IDS.DEPLOYMENTS, name: '🚀 Deployments' },
    { id: ACTIVITY_LOG_IDS.LIFE_GOALS, name: '🎯 Life Goals' },
  ];
  
  await Promise.all(
    logs.map(log => initAgentLog(log.id, log.name))
  );
}

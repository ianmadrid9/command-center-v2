'use client';

import { useState } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { DevAgentsKpi } from '@/components/dashboard/dev-agents-kpi';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SystemCapacity } from '@/components/dashboard/system-capacity';
import { TikTokMonitor } from '@/components/dashboard/tiktok-monitor';
import { LinkedInMonitor } from '@/components/dashboard/linkedin-monitor';
import { EventbriteMonitor } from '@/components/dashboard/eventbrite-monitor';
import { TranscriptExtractor } from '@/components/dashboard/transcript-extractor';
import { 
  mockTasks, 
  mockSubagents, 
  mockActivities, 
  mockHealth, 
  mockQuickActions,
  mockTikTokComments,
  mockLinkedInComments,
  mockEventbriteEvents,
  mockTranscripts,
  getTaskStats,
  getSubagentStats,
  getTikTokStats,
  getRecentComments,
  getLinkedInStats,
  getRecentLinkedInComments,
  getRecentTranscripts
} from '@/lib/mockData';

export default function Dashboard() {
  const [useMockData, setUseMockData] = useState(true);
  
  const taskStats = getTaskStats();
  const subagentStats = getSubagentStats();
  const tiktokStats = getTikTokStats();
  const linkedInStats = getLinkedInStats();
  const recentComments = getRecentComments(8);
  const recentLinkedInComments = getRecentLinkedInComments(6);
  const recentTranscripts = getRecentTranscripts(5);

  function handleQuickAction(action: string) {
    console.log('Quick action:', action);
    // TODO: Implement actual actions
    alert(`Action "${action}" triggered (mock)`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Command Center</h1>
          <p className="mt-1 text-sm text-muted">Your projects. Your conversations. Your progress.</p>
        </div>
        <button
          onClick={() => setUseMockData(!useMockData)}
          className="text-xs text-muted hover:text-accent transition-colors px-3 py-1.5 rounded-lg border border-border"
        >
          {useMockData ? '🟢 Mock Data' : '🔴 Live Data'}
        </button>
      </div>

      {/* KPI Stats - Full Width Grid (3 per row on desktop, 2 on mobile) */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <StatsCard
          title="Active Tasks"
          value={taskStats.inProgress}
          subtitle={`${taskStats.completed} done today`}
          icon="📋"
        />
        <StatsCard
          title="TikTok"
          value={tiktokStats.totalViews >= 1000000 ? `${(tiktokStats.totalViews / 1000000).toFixed(1)}M` : tiktokStats.totalViews >= 1000 ? `${(tiktokStats.totalViews / 1000).toFixed(0)}K` : tiktokStats.totalViews}
          subtitle="last 3 days"
          icon="🎵"
        />
        <StatsCard
          title="LinkedIn"
          value={linkedInStats.totalImpressions >= 1000000 ? `${(linkedInStats.totalImpressions / 1000000).toFixed(1)}M` : linkedInStats.totalImpressions >= 1000 ? `${(linkedInStats.totalImpressions / 1000).toFixed(0)}K` : linkedInStats.totalImpressions}
          subtitle="last 3 days"
          icon="💼"
        />
        <StatsCard
          title="Events"
          value={mockEventbriteEvents.filter(e => e.timing === 'today').length}
          subtitle="today"
          icon="🎫"
        />
        <StatsCard
          title="Deployments"
          value="12"
          subtitle="this week"
          icon="🚀"
        />
        <DevAgentsKpi subagents={mockSubagents} />
      </div>

      {/* Social Monitoring - Full Width Cards */}
      <div className="space-y-4">
        <TikTokMonitor recentComments={recentComments} />
        <LinkedInMonitor recentComments={recentLinkedInComments} />
      </div>

      {/* Events & Transcript - Full Width Stacked */}
      <div className="space-y-4">
        <EventbriteMonitor events={mockEventbriteEvents} />
        <TranscriptExtractor transcripts={recentTranscripts} />
      </div>

      {/* Dev Agents & System Capacity - Full Width Stacked */}
      <div className="space-y-4">
        <DevAgentsKpi subagents={mockSubagents} />
        <SystemCapacity health={mockHealth} currentAgents={mockSubagents.filter(s => s.status === 'running').length} />
      </div>

      {/* Activity Feed & Quick Actions - Full Width Stacked */}
      <div className="space-y-4">
        <ActivityFeed activities={mockActivities} />
        <QuickActions actions={mockQuickActions} onAction={handleQuickAction} />
      </div>
    </div>
  );
}

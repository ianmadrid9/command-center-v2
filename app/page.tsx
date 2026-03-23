'use client';

import { useState } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { DevAgentsKpi } from '@/components/dashboard/dev-agents-kpi';
import { LifeGoalsKpi } from '@/components/dashboard/life-goals-kpi';
import { TikTokCommentsModal } from '@/components/dashboard/tiktok-kpi';
import { LinkedInCommentsModal } from '@/components/dashboard/linkedin-monitor';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SystemCapacity } from '@/components/dashboard/system-capacity';
import { EventbriteMonitor } from '@/components/dashboard/eventbrite-monitor';
import { TranscriptExtractor } from '@/components/dashboard/transcript-extractor';
import { fetchTikTokStats, fetchLinkedInStats, fetchTikTokComments, fetchLinkedInComments, mockHealth, mockQuickActions, mockEventbriteEvents, mockTranscripts, getTaskStats, getSubagentStats } from '@/lib/mockData';

export default function Dashboard() {
  const [useMockData, setUseMockData] = useState(true);
  const [showTikTokComments, setShowTikTokComments] = useState(false);
  const [showLinkedInComments, setShowLinkedInComments] = useState(false);
  
  const taskStats = getTaskStats();
  const subagentStats = getSubagentStats();
  const tiktokStats = getTikTokStats();
  const linkedInStats = getLinkedInStats();
  const recentComments = fetchTikTokComments().slice(0, 8);
  const recentLinkedInComments = fetchLinkedInComments().slice(0, 6);
  const recentTranscripts = mockTranscripts.slice(0, 5);

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
          <h1 className="text-3xl font-semibold">Clawmmand Center</h1>
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
      </div>

      {/* Dev Agents - Full Width Row */}
      <div>
        <DevAgentsKpi />
      </div>

      {/* Life Goals - Full Width Row */}
      <div>
        <LifeGoalsKpi />
      </div>

      {/* Social Media Stats - Full Width Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* TikTok Card */}
        <div className="card p-5 w-full cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setShowTikTokComments(true)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              <div>
                <h3 className="font-medium">TikTok</h3>
                <p className="text-xs text-muted">last 3 days</p>
              </div>
            </div>
            <span className="text-xs text-accent">Click to view comments ↗</span>
          </div>
          
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {tiktokStats.totalViews >= 1000000 ? `${(tiktokStats.totalViews / 1000000).toFixed(1)}M` : tiktokStats.totalViews >= 1000 ? `${(tiktokStats.totalViews / 1000).toFixed(0)}K` : tiktokStats.totalViews}
              </p>
              <p className="text-xs text-muted">Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{tiktokStats.totalComments >= 1000 ? `${(tiktokStats.totalComments / 1000).toFixed(1)}K` : tiktokStats.totalComments}</p>
              <p className="text-xs text-muted">Comments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{tiktokStats.sentimentBreakdown.positive}</p>
              <p className="text-xs text-muted">Positive</p>
            </div>
          </div>
          
          {/* Urgent Comments */}
          {tiktokStats.urgentBreakdown.total > 0 && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  <div>
                    <p className="text-sm font-semibold text-red-200">Urgent Comments</p>
                    <p className="text-xs text-red-300/70">{tiktokStats.urgentBreakdown.total} of {tiktokStats.totalComments} comments need attention</p>
                  </div>
                </div>
              </div>
              {tiktokStats.urgentBreakdown.preview && (
                <div className="text-xs text-red-100/80">
                  <p className="font-medium mb-1">{tiktokStats.urgentBreakdown.preview.author}</p>
                  <p className="line-clamp-2">"{tiktokStats.urgentBreakdown.preview.text}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LinkedIn Card */}
        <div className="card p-5 w-full cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setShowLinkedInComments(true)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <div>
                <h3 className="font-medium">LinkedIn</h3>
                <p className="text-xs text-muted">last 3 days</p>
              </div>
            </div>
            <span className="text-xs text-accent">Click to view comments ↗</span>
          </div>
          
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {linkedInStats.totalImpressions >= 1000000 ? `${(linkedInStats.totalImpressions / 1000000).toFixed(1)}M` : linkedInStats.totalImpressions >= 1000 ? `${(linkedInStats.totalImpressions / 1000).toFixed(0)}K` : linkedInStats.totalImpressions}
              </p>
              <p className="text-xs text-muted">Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{linkedInStats.totalComments >= 1000 ? `${(linkedInStats.totalComments / 1000).toFixed(1)}K` : linkedInStats.totalComments}</p>
              <p className="text-xs text-muted">Comments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{linkedInStats.sentimentBreakdown.positive}</p>
              <p className="text-xs text-muted">Positive</p>
            </div>
          </div>
          
          {/* Urgent Comments */}
          {linkedInStats.urgentBreakdown.total > 0 && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  <div>
                    <p className="text-sm font-semibold text-red-200">Urgent Comments</p>
                    <p className="text-xs text-red-300/70">{linkedInStats.urgentBreakdown.total} of {linkedInStats.totalComments} comments need attention</p>
                  </div>
                </div>
              </div>
              {linkedInStats.urgentBreakdown.preview && (
                <div className="text-xs text-red-100/80">
                  <p className="font-medium mb-1">{linkedInStats.urgentBreakdown.preview.author}</p>
                  {linkedInStats.urgentBreakdown.preview.authorTitle && (
                    <p className="text-red-300/60 mb-1">{linkedInStats.urgentBreakdown.preview.authorTitle}</p>
                  )}
                  <p className="line-clamp-2">"{linkedInStats.urgentBreakdown.preview.text}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TikTok Comments Modal */}
      <TikTokCommentsModal
        isOpen={showTikTokComments}
        onClose={() => setShowTikTokComments(false)}
        recentComments={recentComments}
      />

      {/* LinkedIn Comments Modal */}
      <LinkedInCommentsModal
        isOpen={showLinkedInComments}
        onClose={() => setShowLinkedInComments(false)}
        recentComments={recentLinkedInComments}
      />

      {/* Social Monitoring - Full Width Cards */}
      <div className="space-y-4">
      </div>

      {/* Events & Transcript - Full Width Stacked */}
      <div className="space-y-4">
        <EventbriteMonitor />
        <TranscriptExtractor transcripts={recentTranscripts} />
      </div>

      {/* System Capacity - Full Width */}
      <div className="space-y-4">
        <SystemCapacity health={mockHealth} currentAgents={subagentStats.running} />
      </div>

      {/* Activity Feed & Quick Actions - Full Width Stacked */}
      <div className="space-y-4">
        <ActivityFeed activities={[]} />
        <QuickActions actions={mockQuickActions} onAction={handleQuickAction} />
      </div>
    </div>
  );
}

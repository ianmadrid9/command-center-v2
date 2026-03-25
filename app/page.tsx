'use client';

import { useState, useEffect } from 'react';
import { LifeGoalsKpi } from '@/components/dashboard/life-goals-kpi';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { EventbriteMonitor } from '@/components/dashboard/eventbrite-monitor';
import { TranscriptExtractor } from '@/components/dashboard/transcript-extractor';
import { MyTickets } from '@/components/dashboard/my-tickets';
import { SystemCapacity } from '@/components/dashboard/system-capacity';
import { InstructionsModal } from '@/components/dashboard/instructions-modal';
import { fetchActivities, fetchSystemHealth } from '@/lib/api';

export default function Dashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [acts, health] = await Promise.all([
          fetchActivities(),
          fetchSystemHealth(),
        ]);
        setActivities(acts);
        setSystemHealth(health);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Clawmmand Center</h1>
          <p className="mt-1 text-sm text-muted">Your projects. Your conversations. Your progress.</p>
        </div>
        <InstructionsModal
          sectionName="Master Prompt - One Organism"
          lastRead="2026-03-25T03:47:00.000Z"
          instructions={[
            { id: '0', priority: 'critical', message: 'THE DASHBOARD IS ONE ORGANISM - Not separate parts. Every action affects the whole system. Activity Feed is the pulse - if stale, organism is dead.' },
            { id: '1', priority: 'critical', message: 'WORKFLOW IS HOLISTIC - Before ANY action: (1) Read master-prompt.json, (2) Read section prompts, (3) Update lastInstructionsRead, (4) Do work, (5) Add to developments[], (6) Update lastInstructionsFollowed, (7) git commit → push → deploy. Steps 3,5,6 ARE the work.' },
            { id: '2', priority: 'critical', message: 'NO MOCK DATA EVER - Never display fake stats, comments, or activity. Empty truth > Full lies.' },
            { id: '3', priority: 'critical', message: 'PREVENT HALLUCINATION - Only report what is in logs. Read prompts before acting, never rely on memory.' },
            { id: '16', priority: 'critical', message: 'ACTIVITY FEED IS THE PULSE - Check /api/activities before answering. If most recent activity >1 hour old, you are out of sync.' },
            { id: '17', priority: 'critical', message: 'EVERY COMMIT UPDATES THE ORGANISM - Each git commit must include updated activity logs with fresh timestamps. No exceptions.' },
            { id: '18', priority: 'critical', message: 'YOU ARE THE NERVOUS SYSTEM - You (Rook) are not separate from dashboard. Log as you go, not at end.' },
          ]}
          trigger={
            <button className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 hover:border-accent/50" title="View Master Prompt">
              🧠 One Organism
            </button>
          }
        />
      </div>

      {/* Life Goals */}
      <div>
        <LifeGoalsKpi />
      </div>

      {/* Events & Tickets */}
      <div className="space-y-4">
        <EventbriteMonitor />
        <MyTickets />
        <TranscriptExtractor />
      </div>

      {/* System Capacity */}
      <div>
        {systemHealth && <SystemCapacity health={systemHealth} currentAgents={0} />}
      </div>

      {/* Activity Feed */}
      <div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

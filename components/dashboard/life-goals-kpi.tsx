'use client';

import { useState } from 'react';
import { LifeGoalsModal } from './life-goals-modal';
import { getLifeGoalStats, mockLifeGoals } from '@/lib/mockData';

export function LifeGoalsKpi() {
  const [showModal, setShowModal] = useState(false);
  const stats = getLifeGoalStats();

  return (
    <>
      <div
        className="card p-5 w-full cursor-pointer hover:border-accent/50 transition-colors"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-semibold text-lg">Life Goals</h3>
              <p className="text-sm text-muted">
                {stats.onTrack} on track • {stats.needsAttention} need attention • {stats.total} total
              </p>
            </div>
          </div>
          <div className="text-right">
            {stats.urgentTasks.length > 0 ? (
              <div className="flex items-center gap-2 text-red-400">
                <span className="animate-pulse">🚨</span>
                <span className="text-sm font-medium">{stats.urgentTasks.length} urgent task{stats.urgentTasks.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span>
                <span className="text-sm font-medium">All on track</span>
              </div>
            )}
            <p className="text-xs text-accent mt-1">Click to view details & chat ↗</p>
          </div>
        </div>
        
        {/* Goals Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockLifeGoals.map((goal) => (
            <div key={goal.id} className="p-3 rounded-xl bg-slate-900/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{goal.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    goal.status === 'on-track' ? 'bg-green-500/10 text-green-400' :
                    goal.status === 'needs-attention' ? 'bg-amber-500/10 text-amber-400' :
                    goal.status === 'at-risk' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {goal.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted">Progress</span>
                <span className="text-accent">{goal.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-accent"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-2 line-clamp-1">
                Next: {goal.nextMilestone}
              </p>
            </div>
          ))}
        </div>
      </div>

      <LifeGoalsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

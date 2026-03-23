'use client';

import { useState, useEffect } from 'react';
import { Subagent } from '@/lib/mockData';
import { SubagentChat } from './subagent-chat';

interface DevAgentsKpiProps {
  subagents: Subagent[];
}

export function DevAgentsKpi({ subagents }: DevAgentsKpiProps) {
  const [showChat, setShowChat] = useState(false);
  const [isRunningRSVP, setIsRunningRSVP] = useState(false);
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);

  // Load RSVP count on mount
  useEffect(() => {
    fetch('/api/rsvps')
      .then(res => res.json())
      .then(data => setRsvpCount(data.total_count || 0))
      .catch(() => setRsvpCount(0));
  }, []);

  const total = subagents.length;
  const idle = subagents.filter(s => s.status === 'idle').length;
  const running = subagents.filter(s => s.status === 'running').length;
  const completed = subagents.filter(s => s.status === 'completed').length;
  const urgentCount = subagents.filter(s => s.status === 'running' && s.progress < 50).length;

  // Trigger RSVP agent
  async function triggerRSVP() {
    setIsRunningRSVP(true);
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'eventbrite-rsvp' })
      });
      const result = await response.json();
      if (result.success) {
        setRsvpCount(result.rsvps?.length || rsvpCount! + 1);
        alert(`✅ RSVP agent completed! Grabbed ${result.rsvps?.length || 0} tickets.`);
      } else {
        alert(`⚠️ ${result.error || 'RSVP agent failed'}`);
      }
    } catch (error) {
      alert('❌ Failed to run RSVP agent');
    } finally {
      setIsRunningRSVP(false);
    }
  }

  return (
    <>
      <div
        onClick={() => setShowChat(true)}
        className="card p-5 w-full cursor-pointer hover:border-accent/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="font-semibold text-lg">Dev Agents</h3>
              <p className="text-sm text-muted">
                {running} running • {idle} idle • {completed} completed
              </p>
            </div>
          </div>
          <div className="text-right">
            {urgentCount > 0 ? (
              <p className="text-sm text-red-400">🚨 {urgentCount} need attention</p>
            ) : (
              <p className="text-sm text-green-400">✅ All running smoothly</p>
            )}
            <p className="text-xs text-accent mt-1">Click to chat with agents ↗</p>
          </div>
        </div>
        
        {/* Quick RSVP Action */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-900/50 border border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div>
              <p className="text-sm font-medium">Eventbrite RSVP Agent</p>
              <p className="text-xs text-muted">
                {rsvpCount !== null ? `✅ ${rsvpCount} tickets grabbed` : 'Auto-grab free & early-bird tickets'}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); triggerRSVP(); }}
            disabled={isRunningRSVP}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRunningRSVP
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-accent/20 text-accent hover:bg-accent/30'
            }`}
          >
            {isRunningRSVP ? '🔄 Running...' : '🚀 Run Now'}
          </button>
        </div>
        
        {/* Quick Agent Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {subagents.slice(0, 7).map((agent) => (
            <div key={agent.id} className="p-2 rounded-lg bg-slate-900/50 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  agent.status === 'running' ? 'bg-green-500 animate-pulse' :
                  agent.status === 'completed' ? 'bg-blue-500' :
                  agent.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-xs font-medium truncate">{agent.name}</span>
              </div>
              {agent.status === 'running' && agent.progress < 100 && (
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-accent"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <SubagentChat
          subagents={subagents}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

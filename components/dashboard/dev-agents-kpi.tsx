'use client';

import { useState, useEffect } from 'react';
import { Subagent } from '@/lib/mockData';
import { fetchSubagents, runAgent, fetchRSVPs } from '@/lib/api';
import { SubagentChat } from './subagent-chat';

export function DevAgentsKpi() {
  const [showChat, setShowChat] = useState(false);
  const [isRunningRSVP, setIsRunningRSVP] = useState(false);
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);
  const [subagents, setSubagents] = useState<Subagent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load subagents and RSVP count
  useEffect(() => {
    async function loadData() {
      try {
        const [agents, rsvps] = await Promise.all([
          fetchSubagents(),
          fetchRSVPs(),
        ]);
        setSubagents(agents);
        setRsvpCount(rsvps.total_count);
      } catch (error) {
        console.error('Failed to load agents:', error);
        setSubagents([]);
        setRsvpCount(0);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
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
      const result = await runAgent('eventbrite-rsvp');
      if (result.success) {
        setRsvpCount((result.rsvps || 0));
        alert(`✅ RSVP agent completed! Grabbed ${result.rsvps || 0} tickets.`);
      } else {
        alert(`⚠️ ${result.error || 'RSVP agent failed'}`);
      }
    } catch (error) {
      alert('❌ Failed to run RSVP agent');
    } finally {
      setIsRunningRSVP(false);
    }
  }

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="font-semibold text-lg">Dev Agents</h3>
            <p className="text-sm text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
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

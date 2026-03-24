'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  metadata?: any;
}

interface ActivityLog {
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

interface ActivityLogModalProps {
  logId: string;
  title: string;
  icon: string;
  onClose?: () => void;
}

export function ActivityLogModal({ logId, title, icon, onClose }: ActivityLogModalProps) {
  const [log, setLog] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [newInstruction, setNewInstruction] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'instructions' | 'developments' | 'insights' | 'brainstorming'>('overview');

  useEffect(() => {
    async function loadLog() {
      try {
        const res = await fetch(`/api/agents/${logId}`);
        const data = await res.json();
        setLog(data.log);
        
        // Mark Ian's visit
        await fetch(`/api/agents/${logId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'visit' }),
        });
      } catch (error) {
        console.error('Failed to load activity log:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadLog();
  }, [logId]);

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function formatTimeAgo(timestamp: string | null): string {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  async function addInstruction() {
    if (!newInstruction.trim()) return;
    
    try {
      await fetch(`/api/agents/${logId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log',
          section: 'instructions',
          message: newInstruction,
          type: 'info',
        }),
      });
      
      setNewInstruction('');
      
      // Reload log
      const res = await fetch(`/api/agents/${logId}`);
      const data = await res.json();
      setLog(data.log);
    } catch (error) {
      console.error('Failed to add instruction:', error);
    }
  }

  function getTypeIcon(type: string): string {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'suggestion': return '💡';
      case 'alert': return '🚨';
      case 'decision': return '✅';
      default: return '📝';
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-muted">Loading {title}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!log) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground transition-colors text-lg"
              >
                ← Back
              </button>
            )}
            <div>
              <h3 className="text-xl font-semibold">{icon} {title} Activity Log</h3>
              <p className="text-sm text-muted">
                Status: {log.status === 'healthy' ? '✅ Active' : log.status === 'warning' ? '⚠️ Needs Attention' : log.status} • 
                Last update: {formatTimeAgo(log.lastRun)}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors text-3xl p-3 -mr-3 -mt-3 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-3 border-b border-border overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-accent text-slate-950'
                : 'bg-slate-800 text-muted hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'instructions'
                ? 'bg-accent text-slate-950'
                : 'bg-slate-800 text-muted hover:text-foreground'
            }`}
          >
            Instructions ({log.instructions.length})
          </button>
          <button
            onClick={() => setActiveTab('developments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'developments'
                ? 'bg-accent text-slate-950'
                : 'bg-slate-800 text-muted hover:text-foreground'
            }`}
          >
            Activity ({log.developments.length})
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'insights'
                ? 'bg-accent text-slate-950'
                : 'bg-slate-800 text-muted hover:text-foreground'
            }`}
          >
            Rook's Insights ({log.insights.length})
          </button>
          <button
            onClick={() => setActiveTab('brainstorming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'brainstorming'
                ? 'bg-accent text-slate-950'
                : 'bg-slate-800 text-muted hover:text-foreground'
            }`}
          >
            Decisions ({log.brainstorming.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-border/50">
                <h4 className="font-medium mb-3">Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">Status</p>
                    <p className={`text-lg font-medium ${
                      log.status === 'healthy' ? 'text-green-400' :
                      log.status === 'warning' ? 'text-amber-400' :
                      log.status === 'error' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {log.status === 'healthy' ? '✅ Active' : log.status === 'warning' ? '⚠️ Needs Attention' : log.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Last Update</p>
                    <p className="text-lg font-medium">{formatTimeAgo(log.lastRun)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Next Update</p>
                    <p className="text-lg font-medium">{log.nextRun ? formatTimeAgo(log.nextRun) : 'On-demand'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Your Last Visit</p>
                    <p className="text-lg font-medium">{log.ianLastVisit ? formatTime(log.ianLastVisit) : 'Never'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-border/50 text-center">
                  <p className="text-2xl font-bold">{log.instructions.length}</p>
                  <p className="text-xs text-muted mt-1">Instructions</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-border/50 text-center">
                  <p className="text-2xl font-bold">{log.developments.length}</p>
                  <p className="text-xs text-muted mt-1">Activity</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-border/50 text-center">
                  <p className="text-2xl font-bold">{log.insights.length}</p>
                  <p className="text-xs text-muted mt-1">Insights</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-border/50 text-center">
                  <p className="text-2xl font-bold">{log.brainstorming.length}</p>
                  <p className="text-xs text-muted mt-1">Decisions</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-border/50">
                <h4 className="font-medium mb-3">Recent Activity</h4>
                {log.developments.length > 0 ? (
                  <div className="space-y-2">
                    {log.developments.slice(-3).reverse().map((entry) => (
                      <div key={entry.id} className="flex gap-3 text-sm">
                        <span className="text-xs text-muted whitespace-nowrap">{formatTimeAgo(entry.timestamp)}</span>
                        <span>{entry.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">No activity yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              {/* Add Instruction */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder={`Add instruction for ${title.toLowerCase()}...`}
                  className="flex-1 rounded-xl border border-border bg-slate-900 px-4 py-2 text-sm outline-none focus:border-accent"
                  onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                />
                <button
                  onClick={addInstruction}
                  className="rounded-xl bg-accent text-slate-950 font-medium text-sm px-4 py-2 hover:bg-accent/90 transition-colors"
                >
                  Add Instruction
                </button>
              </div>

              {/* Instructions List */}
              <div className="space-y-2">
                {log.instructions.length > 0 ? (
                  log.instructions.slice().reverse().map((entry) => (
                    <div key={entry.id} className="p-3 rounded-xl bg-slate-900/50 border border-border/50">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getTypeIcon(entry.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm">{entry.message}</p>
                          <p className="text-xs text-muted mt-1">{formatTime(entry.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm">No instructions yet. Add your first instruction above.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'developments' && (
            <div className="space-y-2">
              {log.developments.length > 0 ? (
                log.developments.slice().reverse().map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl bg-slate-900/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getTypeIcon(entry.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm">{entry.message}</p>
                        <p className="text-xs text-muted mt-1">{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No activity yet.</p>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-2">
              {log.insights.length > 0 ? (
                log.insights.slice().reverse().map((entry) => (
                  <div key={entry.id} className={`p-3 rounded-xl border ${
                    entry.type === 'alert' ? 'bg-red-500/10 border-red-500/30' :
                    entry.type === 'suggestion' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-900/50 border-border/50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getTypeIcon(entry.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm">{entry.message}</p>
                        <p className="text-xs text-muted mt-1">{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No insights yet. Rook reads these logs and will add suggestions here.</p>
              )}
            </div>
          )}

          {activeTab === 'brainstorming' && (
            <div className="space-y-2">
              {log.brainstorming.length > 0 ? (
                log.brainstorming.slice().reverse().map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl bg-slate-900/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getTypeIcon(entry.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm">{entry.message}</p>
                        <p className="text-xs text-muted mt-1">{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No decisions yet. When you and Rook make decisions about this, they'll be logged here.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

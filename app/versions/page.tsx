'use client';

import { useState } from 'react';

// Mock version data (in real implementation, this would come from git API)
const versions = [
  {
    version: 'v2.0.0',
    commit: '6af040c',
    date: '2026-03-21',
    status: 'current',
    description: 'Command Center Dashboard Complete',
    features: [
      '6 KPI cards (3-column grid)',
      'Dev Agents chat modal',
      'System Capacity concurrency planner',
      'Eventbrite with AI insights',
      'TikTok hover comments',
      'Full-width layout',
    ],
    files: '23 files changed, 3,533 insertions',
  },
  {
    version: 'v1.0.0',
    commit: '9450b3b',
    date: '2026-03-20',
    status: 'old',
    description: 'Initial MVP',
    features: [
      'Basic project cards',
      'Meetup research project',
      'Simple layout',
    ],
    files: 'Initial commit',
  },
];

export default function VersionsPage() {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackComplete, setRollbackComplete] = useState(false);

  function handleRollback(version: string) {
    setSelectedVersion(version);
    setIsRollingBack(true);
    
    // Simulate rollback (in real implementation, this would call an API)
    setTimeout(() => {
      setIsRollingBack(false);
      setRollbackComplete(true);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Version History</h1>
          <p className="text-muted">Select a version to view details or rollback</p>
        </div>

        {/* Current Version Alert */}
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-200">Current Version: v2.0.0</p>
              <p className="text-sm text-muted">Deployed to production on 2026-03-21</p>
            </div>
          </div>
        </div>

        {/* Rollback Success Message */}
        {rollbackComplete && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-medium text-green-200">Rollback Complete!</p>
                <p className="text-sm text-muted">
                  Successfully rolled back to {selectedVersion}. The production site has been updated.
                </p>
                <button
                  onClick={() => setRollbackComplete(false)}
                  className="mt-2 text-xs text-accent hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Versions List */}
        <div className="space-y-4">
          {versions.map((v) => (
            <div
              key={v.version}
              className={`card p-6 border-2 transition-colors ${
                v.status === 'current'
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border/50 hover:border-accent/30'
              }`}
            >
              {/* Version Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    v.status === 'current' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <h2 className="text-xl font-semibold">{v.version}</h2>
                    <p className="text-sm text-muted">{v.description}</p>
                  </div>
                </div>
                {v.status === 'current' ? (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Current
                  </span>
                ) : (
                  <button
                    onClick={() => handleRollback(v.version)}
                    disabled={isRollingBack}
                    className="text-xs px-4 py-2 rounded-lg bg-accent text-slate-950 font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {isRollingBack && selectedVersion === v.version ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Rolling back...
                      </span>
                    ) : (
                      'Rollback to This'
                    )}
                  </button>
                )}
              </div>

              {/* Version Details */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-muted mb-1">Commit</p>
                  <p className="font-mono text-sm">{v.commit}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-muted mb-1">Date</p>
                  <p className="text-sm">{v.date}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-muted mb-1">Changes</p>
                  <p className="text-sm">{v.files}</p>
                </div>
              </div>

              {/* Features List */}
              <div>
                <p className="text-xs text-muted font-medium mb-2">Features:</p>
                <ul className="space-y-1">
                  {v.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 rounded-xl bg-slate-900/50 border border-border/50">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <span>💡</span> How Rollback Works
          </h3>
          <ol className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">1.</span>
              Click "Rollback to This" on any version
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">2.</span>
              System will restore that version's code
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">3.</span>
              Production site updates automatically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">4.</span>
              You'll see a confirmation message
            </li>
          </ol>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-200">
              ⚠️ <strong>Note:</strong> Rollback will delete all changes made after the selected version. 
              Make sure you want to lose newer features before rolling back.
            </p>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-accent hover:underline inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

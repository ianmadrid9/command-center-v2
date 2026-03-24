'use client';

import { useState, useRef, useEffect } from 'react';

interface LifeGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LifeGoalsModal({ isOpen, onClose }: LifeGoalsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors text-lg"
            >
              ← Back
            </button>
            <div>
              <h3 className="text-lg font-semibold">🎯 Life Goals</h3>
              <p className="text-xs text-muted">Feature coming soon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-3xl p-3 -mr-3 -mt-3 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold mb-2">Life Goals Tracking</h4>
            <p className="text-muted mb-4">
              This feature is being built out. Check back soon!
            </p>
            <p className="text-sm text-muted">
              For now, track your goals in the Activity Logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

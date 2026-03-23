'use client';

import { useState, useRef, useEffect } from 'react';
import { TikTokComment } from '@/lib/mockData';

interface TikTokKpiProps {
  totalViews: number;
  totalComments: number;
  recentComments: TikTokComment[];
  onClick?: () => void;
}

export function TikTokKpi({ totalViews, totalComments, recentComments, onClick }: TikTokKpiProps) {
  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }

  return (
    <div
      className="card p-4 w-full cursor-pointer hover:border-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">TikTok</p>
          <p className="kpi">{formatNumber(totalViews)}</p>
          <p className="text-xs text-muted mt-0.5">{totalComments} comments</p>
        </div>
        <div className="text-xl opacity-60">🎵</div>
      </div>
    </div>
  );
}

interface TikTokCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentComments: TikTokComment[];
}

export function TikTokCommentsModal({ isOpen, onClose, recentComments }: TikTokCommentsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 5) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function getVideoUrlFromComment(comment: TikTokComment) {
    return `https://www.tiktok.com/@ianmadrid_/video/${comment.id}`;
  }

  const sentimentColors = {
    positive: 'text-green-400 bg-green-500/10 border-green-500/20',
    neutral: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    negative: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const sentimentIcons = {
    positive: '😊',
    neutral: '😐',
    negative: '😠',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="card w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎵</span>
            <div>
              <h2 className="text-2xl font-semibold">TikTok Comments</h2>
              <p className="text-sm text-muted">{recentComments.length} recent comments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-3xl p-3 -mr-3 -mt-3 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-3">
          {recentComments.map((comment) => (
            <a
              key={comment.id}
              href={getVideoUrlFromComment(comment)}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-4 rounded-xl border transition-colors hover:border-accent/50 ${
                sentimentColors[comment.sentiment]
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{sentimentIcons[comment.sentiment]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.author}</span>
                    {comment.isCreator && (
                      <span className="text-xs bg-accent text-slate-950 px-2 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-base opacity-90">{comment.text}</p>
                  <div className="flex items-center gap-3 mt-3 text-sm opacity-70">
                    <span>❤️ {comment.likes}</span>
                    <span>•</span>
                    <span>{formatTime(comment.timestamp)}</span>
                    <span className="text-accent ml-auto">Open Video ↗</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <a
            href="https://www.tiktok.com/@ianmadrid_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            View all comments on TikTok ↗
          </a>
        </div>

        {/* Close Hint */}
        <div className="mt-4 text-center text-xs text-muted">
          Click outside to close
        </div>
      </div>
    </div>
  );
}

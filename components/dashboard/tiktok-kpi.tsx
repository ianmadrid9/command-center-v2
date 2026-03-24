'use client';

import { useState, useRef, useEffect } from 'react';
import type { TikTokComment } from '@/lib/mockData';

interface TikTokCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TikTokCommentsModal({ isOpen, onClose }: TikTokCommentsModalProps) {
  const [comments, setComments] = useState<TikTokComment[]>([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch real comments when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/tiktok/comments')
        .then(res => res.json())
        .then(data => {
          setComments(data.comments || []);
          setLoading(false);
        })
        .catch(() => {
          setComments([]);
          setLoading(false);
        });
    }
  }, [isOpen]);

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

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
              <p className="text-sm text-muted">{comments.length} recent comments</p>
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
        <div className="space-y-4 px-8 pb-8">
          {loading ? (
            <div className="text-center py-8 text-muted">Loading comments...</div>
          ) : apiMessage ? (
            <div className="text-center py-8">
              <p className="text-muted mb-2">⚠️ {apiMessage}</p>
              <p className="text-sm text-muted">Comments will appear here once TikTok API is configured.</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted">No comments yet</div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-xl border ${
                  comment.sentiment === 'positive' ? 'bg-green-500/5 border-green-500/20' :
                  comment.sentiment === 'negative' ? 'bg-red-500/5 border-red-500/20' :
                  'bg-slate-900/50 border-border/50'
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
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <a
            href="https://www.tiktok.com/@ianmadrid_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            View profile on TikTok ↗
          </a>
        </div>
      </div>
    </div>
  );
}

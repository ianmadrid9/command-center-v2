'use client';

import { TikTokComment } from '@/lib/mockData';

interface TikTokMonitorProps {
  recentComments: TikTokComment[];
}

export function TikTokMonitor({ recentComments }: TikTokMonitorProps) {
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

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎵</span>
          <h3 className="font-medium">TikTok Comments</h3>
        </div>
        <a
          href="https://www.tiktok.com/@ianmadrid_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          @ianmadrid_ ↗
        </a>
      </div>

      {/* Significant Comments Only */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {recentComments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-xl border text-sm ${sentimentColors[comment.sentiment]}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{sentimentIcons[comment.sentiment]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.author}</span>
                  {comment.isCreator && (
                    <span className="text-xs bg-accent text-slate-950 px-1.5 py-0.5 rounded">
                      YOU
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm opacity-90">{comment.text}</p>
                <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                  <span>❤️ {comment.likes}</span>
                  <span>•</span>
                  <span>{formatTime(comment.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

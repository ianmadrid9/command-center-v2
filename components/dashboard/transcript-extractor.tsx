'use client';

import { useState } from 'react';
import { Transcript } from '@/lib/mockData';

interface TranscriptExtractorProps {
  transcripts: Transcript[];
}

export function TranscriptExtractor({ transcripts }: TranscriptExtractorProps) {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleExtract(e?: React.FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;

    setIsExtracting(true);
    // Simulate extraction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExtracting(false);
    setUrl('');
  }

  async function handleCopy(transcript: Transcript) {
    await navigator.clipboard.writeText(transcript.transcript);
    setCopiedId(transcript.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getPlatformIcon(platform: string) {
    return platform === 'tiktok' ? '🎵' : '📺';
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h3 className="font-medium">Transcript Extractor</h3>
        </div>
        <span className="text-xs text-muted">
          {transcripts.filter(t => t.status === 'completed').length} extracted
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleExtract} className="mb-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste TikTok or YouTube URL..."
            className="flex-1 rounded-xl border border-border bg-slate-900 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={isExtracting || !url.trim()}
            className="rounded-xl bg-accent text-slate-950 font-medium text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            {isExtracting ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⏳</span>
                Extracting
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>🎯</span>
                Extract
              </span>
            )}
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          Supports: TikTok videos, YouTube videos
        </p>
      </form>

      {/* Transcripts List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {transcripts.map((transcript) => (
          <div
            key={transcript.id}
            className="rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden"
          >
            {/* Header */}
            <div
              className="p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={() => setExpandedId(expandedId === transcript.id ? null : transcript.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">{getPlatformIcon(transcript.platform)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{transcript.title}</p>
                    <p className="text-xs text-muted">
                      {transcript.author} • {transcript.duration} • {formatTime(transcript.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {transcript.status === 'completed' && (
                    <span className="text-xs text-green-400">✓ Ready</span>
                  )}
                  {transcript.status === 'processing' && (
                    <span className="text-xs text-amber-400 animate-pulse">Processing...</span>
                  )}
                  <span className={`text-xs transition-transform ${expandedId === transcript.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === transcript.id && transcript.status === 'completed' && (
              <div className="p-3 pt-0 border-t border-border/50">
                <div className="mt-3 p-3 rounded-lg bg-slate-950/50 max-h-48 overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap">
                  {transcript.transcript}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleCopy(transcript)}
                    className="flex-1 rounded-lg bg-accent text-slate-950 font-medium text-xs py-2 hover:bg-accent/90 transition-colors"
                  >
                    {copiedId === transcript.id ? (
                      <span className="flex items-center justify-center gap-1">
                        ✓ Copied!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        📋 Copy Transcript
                      </span>
                    )}
                  </button>
                  <a
                    href={transcript.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-slate-800 font-medium text-xs px-3 py-2 hover:bg-slate-700 transition-colors"
                  >
                    ↗ Open
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

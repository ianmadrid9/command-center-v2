'use client';

import { useState, useEffect } from 'react';
import { InstructionsModal } from './instructions-modal';

interface Transcript {
  id: string;
  url: string;
  title: string;
  author: string;
  duration: string;
  platform: 'youtube' | 'tiktok';
  transcript: string;
  status: 'completed' | 'processing' | 'error';
  timestamp: string;
  error?: string;
}

export function TranscriptExtractor() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranscripts() {
      try {
        const res = await fetch('/api/transcripts');
        const data = await res.json();
        setTranscripts(data.transcripts || []);
      } catch (error) {
        console.error('Failed to load transcripts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTranscripts();
  }, []);

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
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="text-center py-8 text-muted">Loading transcripts...</div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <div>
            <h3 className="font-medium">Transcript Log</h3>
            <p className="text-[10px] text-muted mt-0.5">
              ✅ Instructions followed: Mar 24, 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InstructionsModal
            sectionName="Transcript Extractor"
            lastFollowed="2026-03-24T19:22:00.000Z"
            instructions={[
              { id: '2', priority: 'critical', message: 'YouTube: youtube-transcript npm (API, NO browser) - Fast 1-2s' },
              { id: '3', priority: 'critical', message: 'TikTok: yt-dlp + Whisper - Download + AI transcribe (30-60s)' },
              { id: '4', priority: 'critical', message: 'NO browser automation for YouTube - abandoned method' },
              { id: '5', priority: 'high', message: 'CHAT-FIRST: User pastes link → Extract → Chat → Log to dashboard' },
              { id: '6', priority: 'high', message: 'LOG EVERYTHING: Save to data/transcripts.json with full metadata' },
              { id: '7', priority: 'medium', message: 'LANGUAGE: Whisper auto-detects, record in metadata' },
              { id: '8', priority: 'medium', message: 'ERRORS: Tell user immediately, specific error, no endless retry' },
            ]}
            trigger={
              <button className="text-xs text-muted hover:text-accent transition-colors" title="View instructions">
                📋
              </button>
            }
          />
          <span className="text-xs text-muted">
            {transcripts.filter(t => t.status === 'completed').length} transcripts
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-slate-800/50 border border-border/50">
        <p className="text-xs text-muted">
          📌 <strong className="text-foreground">Paste YouTube links in chat</strong> — transcripts are extracted and logged here automatically
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {transcripts.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <div className="text-4xl mb-2">📝</div>
            <p>No transcripts yet</p>
            <p className="text-xs mt-1">Paste a YouTube URL above to extract</p>
          </div>
        ) : (
          transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className="rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden"
            >
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
                      {transcript.error && (
                        <p className="text-xs text-red-400 mt-1">⚠️ {transcript.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {transcript.status === 'completed' && (
                      <span className="text-xs text-green-400">✓ Ready</span>
                    )}
                    {transcript.status === 'processing' && (
                      <span className="text-xs text-amber-400 animate-pulse">Processing...</span>
                    )}
                    {transcript.status === 'error' && (
                      <span className="text-xs text-red-400">Error</span>
                    )}
                    <span className={'text-xs transition-transform ' + (expandedId === transcript.id ? 'rotate-180' : '')}>
                      ▼
                    </span>
                  </div>
                </div>
              </div>

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
                      ↗ Open Video
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

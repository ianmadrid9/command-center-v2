'use client';

import { useState, useEffect } from 'react';
import { InstructionsModal } from './instructions-modal';

interface EventbriteEvent {
  id: string;
  name: string;
  description: string;
  url: string;
  start: string;
  end?: string;
  venue: {
    name: string;
    address?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
  } | null;
  distance: string;
  is_free: boolean;
  price?: string;
  category: string;
  fetched_at: string;
}

export function EventbriteMonitor() {
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real events from data file
    fetch('/api/eventbrite')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    
    if (diffDays === 0) return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diffDays === 1) return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diffDays <= 7) return `In ${diffDays} days (${date.toLocaleDateString('en-US', { weekday: 'short' })})`;
    
    return date.toLocaleDateString('en-US', options);
  }

  function getCategoryIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('ai') || lower.includes('tech')) return '🤖';
    if (lower.includes('fintech')) return '💰';
    if (lower.includes('startup')) return '🚀';
    if (lower.includes('networking')) return '🤝';
    if (lower.includes('founder') || lower.includes('ceo')) return '👔';
    return '📅';
  }

  async function handleReserve(event: EventbriteEvent) {
    try {
      // Call API to reserve ticket via browser automation
      const res = await fetch('/api/eventbrite/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.start,
          venue: event.venue?.name || '',
          ticketUrl: event.url,
          isFree: event.is_free,
          price: event.price || 'Free',
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Reserved! QR code will appear in "My Tickets" section once confirmed.`);
      } else {
        alert(`❌ Reservation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`❌ Reservation failed: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎫</span>
          <div>
            <h3 className="font-medium">Eventbrite Events</h3>
            <p className="text-xs text-muted">Loading events...</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted">
          <p>🔄 Fetching latest events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5 w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎫</span>
          <div>
            <h3 className="font-medium">Eventbrite Events</h3>
            <p className="text-xs text-muted">Error loading events</p>
          </div>
        </div>
        <div className="text-center py-8 text-red-400">
          <p>⚠️ {error}</p>
          <p className="text-xs text-muted mt-2">Run the Eventbrite Scout agent to fetch events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎫</span>
          <div>
            <h3 className="font-medium">Eventbrite Events</h3>
            <p className="text-xs text-muted">
              {events.length} events near 50th & 2nd Ave
            </p>
            <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
              ✅ Instructions followed: Mar 24, 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InstructionsModal
            sectionName="Eventbrite Monitor"
            lastFollowed="2026-03-24T19:22:00.000Z"
            instructions={[
              { id: '2', priority: 'critical', message: 'CHECK FOR FREE TICKETS FIRST - Always scan for free tickets, flag with 🎁 FREE badge' },
              { id: '3', priority: 'critical', message: 'PRICE VERIFICATION - Never show unverified prices, mark with ⚠️' },
              { id: '9', priority: 'critical', message: 'QR CODE WORKFLOW - Book via browser, scrape QR, save to JSON, display in My Tickets' },
              { id: '4', priority: 'high', message: 'EARLY BIRD DETECTION - Badge early bird pricing with deadlines' },
              { id: '5', priority: 'high', message: 'SELLING FAST - <20% tickets = 🔥 badge' },
              { id: '10', priority: 'high', message: 'AUTO-RESERVE - For FREE: show "🎁 Reserve Now" button, book automatically' },
              { id: '6', priority: 'medium', message: 'AI INSIGHTS - Worth Going/Consider It/Skip This + reasoning' },
              { id: '7', priority: 'medium', message: 'COLLAPSIBLE WEEKS - "This Week" / "Next Week" collapsed default' },
              { id: '8', priority: 'low', message: "I'LL ATTEND - Save to eventbrite-rsvps.json" },
            ]}
            trigger={
              <button className="text-xs text-muted hover:text-accent transition-colors" title="View instructions">
                📋
              </button>
            }
          />
          <a
            href="https://www.eventbrite.com/d/ny--new-york/tech-networking--events/?price=t"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            Browse More ↗
          </a>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <p>📭 No events found</p>
          <p className="text-xs mt-2">Run the Eventbrite Scout agent to fetch events</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.slice(0, 10).map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden"
            >
              {/* Event Header */}
              <div
                className="p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getCategoryIcon(event.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.name}</p>
                    <p className="text-xs text-muted truncate">{event.venue?.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                      <span>📅 {formatDate(event.start)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-400">
                          📍 {event.distance}
                        </span>
                        <span className={event.is_free ? 'text-green-400' : 'text-amber-400'}>
                          {event.is_free ? '🆓 Free' : '💰 You Pay'}
                        </span>
                      </div>
                      {event.is_free ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReserve(event);
                          }}
                          className="text-xs bg-accent text-slate-950 px-2 py-0.5 rounded-full font-medium hover:bg-accent/90 transition-colors"
                        >
                          🎫 Reserve
                        </button>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          ⚠️ Settle yourself
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === event.id && (
                <div className="p-3 pt-0 border-t border-border/50">
                  {event.description && (
                    <p className="text-xs text-muted mb-3 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-accent text-slate-950 font-medium text-xs py-2 text-center hover:bg-accent/90 transition-colors"
                    >
                      🎫 Get Tickets ↗
                    </a>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="rounded-lg bg-slate-800 font-medium text-xs px-4 py-2 hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

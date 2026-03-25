'use client';

import { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  ticketUrl: string;
  reservedAt: string;
  status: 'reserved' | 'confirmed' | 'used';
  isFree: boolean;
  price: string;
}

export function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch('/api/eventbrite/tickets');
        const data = await res.json();
        setTickets(data.tickets || []);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTickets();
  }, []);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getNextEvent(): Ticket | undefined {
    if (tickets.length === 0) return undefined;
    const sorted = [...tickets].sort((a, b) => 
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
    return sorted[0];
  }

  const nextEvent = getNextEvent();

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="text-center py-8 text-muted">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="card p-0 w-full overflow-hidden">
      {/* Collapsed KPI Row */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎫</span>
            <div>
              <h3 className="font-medium">My Tickets</h3>
              {tickets.length > 0 ? (
                <p className="text-xs text-muted mt-0.5">
                  {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} reserved
                  {nextEvent && (
                    <span className="ml-2">
                      • Next: <strong className="text-foreground">{nextEvent.eventName}</strong> on {formatDate(nextEvent.eventDate)}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted mt-0.5">
                  Free and early bird tickets you've reserved will appear here
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {tickets.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  ✅ {tickets.filter(t => t.status === 'confirmed').length} Confirmed
                </span>
                <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                  ⏳ {tickets.filter(t => t.status === 'reserved').length} Pending
                </span>
              </div>
            )}
            <span className={`text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border p-4">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="text-4xl mb-2">🎫</div>
              <p>No tickets yet</p>
              <p className="text-xs mt-2">Click "🎫 Reserve" on FREE events to auto-book tickets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden"
                >
                  {/* Ticket Header */}
                  <div className="p-3 bg-slate-800/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{ticket.eventName}</p>
                        <p className="text-xs text-muted mt-0.5">
                          📅 {formatDate(ticket.eventDate)} • 📍 {ticket.venue}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {ticket.isFree ? (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              🎁 FREE
                            </span>
                          ) : (
                            <span className="text-xs bg-slate-700 text-gray-300 px-2 py-0.5 rounded-full">
                              {ticket.price}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            ticket.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            ticket.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ticket.status === 'confirmed' ? '✓ Confirmed' :
                             ticket.status === 'reserved' ? '⏳ Reserved' : '✓ Used'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Actions */}
                  <div className="p-3">
                    {ticket.qrCodeUrl ? (
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 p-3 rounded-lg bg-white flex items-center justify-center">
                          <img 
                            src={ticket.qrCodeUrl} 
                            alt="Ticket QR Code"
                            className="w-40 h-40 object-contain"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <a
                            href={ticket.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-accent text-slate-950 font-medium text-xs py-2 px-3 text-center hover:bg-accent/90 transition-colors"
                          >
                            🎫 View on Eventbrite
                          </a>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = ticket.qrCodeUrl!;
                              link.download = `ticket-${ticket.eventId}.png`;
                              link.click();
                            }}
                            className="rounded-lg bg-slate-800 font-medium text-xs py-2 px-3 hover:bg-slate-700 transition-colors"
                          >
                            ⬇️ Download QR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-800 text-center text-sm text-muted">
                        <p>⏳ QR code will appear here after Eventbrite confirmation</p>
                        <p className="text-xs mt-1">Check your email for confirmation, then forward to me to extract QR code</p>
                        <a
                          href={ticket.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 rounded-lg bg-accent text-slate-950 font-medium text-xs py-2 px-4 hover:bg-accent/90 transition-colors"
                        >
                          🎫 Check Eventbrite Status
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

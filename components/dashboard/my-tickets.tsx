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
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="text-center py-8 text-muted">Loading tickets...</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="card p-5 w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎫</span>
          <h3 className="font-medium">My Tickets</h3>
        </div>
        <div className="text-center py-8 text-muted">
          <div className="text-4xl mb-2">🎫</div>
          <p>No tickets yet</p>
          <p className="text-xs mt-2">Free and early bird tickets you've reserved will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎫</span>
          <h3 className="font-medium">My Tickets</h3>
        </div>
        <span className="text-xs text-muted">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden"
          >
            <div
              className="p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ticket.eventName}</p>
                  <p className="text-xs text-muted">
                    {formatDate(ticket.eventDate)} • {ticket.venue}
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
                <span className={`text-xs transition-transform ${expandedTicket === ticket.id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </div>

            {expandedTicket === ticket.id && (
              <div className="p-3 pt-0 border-t border-border/50">
                {ticket.qrCodeUrl ? (
                  <div className="mt-3 p-3 rounded-lg bg-white flex items-center justify-center">
                    <img 
                      src={ticket.qrCodeUrl} 
                      alt="Ticket QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-3 p-4 rounded-lg bg-slate-800 text-center text-sm text-muted">
                    <p>QR code will appear here after confirmation</p>
                    <p className="text-xs mt-1">Check your email for Eventbrite confirmation</p>
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <a
                    href={ticket.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-accent text-slate-950 font-medium text-xs py-2 text-center hover:bg-accent/90 transition-colors"
                  >
                    🎫 View on Eventbrite
                  </a>
                  {ticket.qrCodeUrl && (
                    <button
                      onClick={() => {
                        // Download QR code
                        const link = document.createElement('a');
                        link.href = ticket.qrCodeUrl!;
                        link.download = `ticket-${ticket.eventId}.png`;
                        link.click();
                      }}
                      className="rounded-lg bg-slate-800 font-medium text-xs px-3 py-2 hover:bg-slate-700 transition-colors"
                    >
                      ⬇️ Download
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

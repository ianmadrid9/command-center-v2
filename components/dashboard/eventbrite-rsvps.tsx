'use client';

import { useState, useEffect } from 'react';

interface RSVP {
  orderId: string;
  eventId: string;
  eventName: string;
  ticketName: string;
  price: number;
  eventUrl: string;
  rsvpdAt: string;
  overall_score?: number;
  networking_rating?: string;
  venue_name?: string;
  distance?: string;
}

export function EventbriteRSVPs() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    async function loadRSVPs() {
      try {
        const res = await fetch('/api/rsvps');
        const data = await res.json();
        setRsvps(data.rsvps || []);
        setTotalSpent(data.total_spent || 0);
      } catch (error) {
        console.error('Failed to load RSVPs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadRSVPs();
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="text-center py-8 text-muted">Loading your tickets...</div>
      </div>
    );
  }

  if (rsvps.length === 0) {
    return (
      <div className="card p-5 w-full">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="font-medium mb-2">No tickets yet</h3>
          <p className="text-sm text-muted">
            Run the Eventbrite RSVP agent to auto-reserve free tickets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎫</span>
          <div>
            <h3 className="font-semibold text-lg">My Tickets</h3>
            <p className="text-sm text-muted">
              {rsvps.length} ticket{rsvps.length !== 1 ? 's' : ''} • ${totalSpent} total spent
            </p>
          </div>
        </div>
        <button
          onClick={() => window.open('https://www.eventbrite.com/account-settings/', '_blank')}
          className="text-xs text-accent hover:underline"
        >
          View on Eventbrite ↗
        </button>
      </div>

      <div className="grid gap-4">
        {rsvps.slice().reverse().map((rsvp) => (
          <div
            key={rsvp.orderId}
            className="rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden"
          >
            {/* Ticket Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{rsvp.eventName}</h4>
                  <p className="text-sm text-muted">
                    🎫 {rsvp.ticketName} {rsvp.price === 0 ? '(FREE)' : `$${rsvp.price}`}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Order: {rsvp.orderId} • Reserved {formatDate(rsvp.rsvpdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {rsvp.overall_score && (
                    <div className="text-sm mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rsvp.overall_score >= 80 ? 'bg-green-500/20 text-green-400' :
                        rsvp.overall_score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        Score: {rsvp.overall_score}/100
                      </span>
                    </div>
                  )}
                  {rsvp.networking_rating && (
                    <p className="text-xs text-muted">{rsvp.networking_rating} Networking</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="p-4 grid md:grid-cols-3 gap-4">
              {/* QR Code Placeholder */}
              <div className="md:col-span-1">
                <div className="aspect-square bg-white rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-xs text-gray-600">
                      QR Code<br/>
                      <span className="text-[10px]">Show at event</span>
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted mt-2 text-center">
                  Order: {rsvp.orderId}
                </p>
              </div>

              {/* Event Info */}
              <div className="md:col-span-2 space-y-3">
                {rsvp.venue_name && (
                  <div>
                    <p className="text-xs text-muted mb-1">Venue</p>
                    <p className="text-sm font-medium">{rsvp.venue_name}</p>
                    {rsvp.distance && (
                      <p className="text-xs text-muted">{rsvp.distance} from you</p>
                    )}
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-muted mb-1">Event Details</p>
                  <a
                    href={rsvp.eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline inline-flex items-center gap-1"
                  >
                    View on Eventbrite ↗
                  </a>
                </div>

                <div className="flex gap-2">
                  <a
                    href={rsvp.eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-accent text-slate-950 font-medium text-xs py-2 text-center hover:bg-accent/90 transition-colors"
                  >
                    🎫 View Ticket
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rsvp.orderId);
                      alert('Order ID copied!');
                    }}
                    className="rounded-lg bg-slate-800 font-medium text-xs px-4 py-2 hover:bg-slate-700 transition-colors"
                  >
                    📋 Copy Order ID
                  </button>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <p className="text-[10px] text-muted">
                    ℹ️ To get your actual QR code, click "View Ticket" above or check your email confirmation from Eventbrite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add to Dashboard Button */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <p className="text-xs text-muted text-center">
          💡 Tip: Your tickets are also saved to{' '}
          <code className="bg-slate-800 px-2 py-0.5 rounded">data/eventbrite-rsvps.json</code>
        </p>
      </div>
    </div>
  );
}

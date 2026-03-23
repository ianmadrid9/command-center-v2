'use client';

interface QRCodeProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  attendeeName: string;
}

export function QRCode({ eventId, eventName, eventDate, eventTime, attendeeName }: QRCodeProps) {
  // Generate a simple QR-like pattern (in production, use a real QR library)
  // This creates a visual placeholder that looks like a QR code
  
  const generatePattern = () => {
    const seed = eventId + attendeeName;
    const pattern = [];
    for (let i = 0; i < 21; i++) {
      const row = [];
      for (let j = 0; j < 21; j++) {
        // Create a deterministic pattern based on seed
        const hash = seed.charCodeAt(i % seed.length) + seed.charCodeAt(j % seed.length);
        row.push(hash % 2 === 0);
      }
      pattern.push(row);
    }
    return pattern;
  };

  const pattern = generatePattern();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Pattern */}
      <div className="p-4 bg-white rounded-xl border-4 border-slate-900">
        <div className="grid grid-cols-21 gap-0.5" style={{ gridTemplateColumns: 'repeat(21, 1fr)' }}>
          {pattern.map((row, i) =>
            row.map((isBlack, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-1.5 h-1.5 ${isBlack ? 'bg-slate-900' : 'bg-white'}`}
              />
            ))
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">{eventName}</h3>
        <p className="text-sm text-muted">
          {new Date(eventDate).toLocaleDateString()} • {eventTime}
        </p>
        <p className="text-sm text-muted">Attendee: {attendeeName}</p>
        <p className="text-xs text-muted font-mono">ID: {eventId}</p>
      </div>

      {/* Instructions */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center">
        📱 Show this QR code at the event entrance for check-in
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { EventbriteEvent, getAttendingByDay, toggleAttending } from '@/lib/mockData';

interface EventbriteMonitorProps {
  events: EventbriteEvent[];
}

export function EventbriteMonitor({ events }: EventbriteMonitorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    'this-week': true,
    'next-week': true,
  });
  const [localEvents, setLocalEvents] = useState(events);

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function formatEventDate(date: string, timing: string, time: string) {
    const d = new Date(date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const displayTime = formatTime(time);
    
    // Use timing to determine relative date
    if (timing === 'today') return `Today ${displayTime} (${dayName})`;
    if (timing === 'tomorrow') return `Tomorrow ${displayTime} (${dayName})`;
    
    // Calculate days from now for this-week and next-week
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `In ${diffDays} days ${displayTime} (${dayName})`;
    return `${displayTime} (${dayName})`;
  }

  function getCategoryIcon(category: string) {
    const icons: Record<string, string> = {
      'Technology': '💻',
      'Development': '⚛️',
      'Business': '💼',
      'HR & Management': '👥',
      'Finance': '💰',
      'Networking': '🤝',
      'Marketing': '📈',
    };
    return icons[category] || '📅';
  }

  function getWorthColor(worth: string) {
    const colors: Record<string, string> = {
      high: 'text-green-400 bg-green-500/10 border-green-500/30',
      medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      low: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
      avoid: 'text-red-400 bg-red-500/10 border-red-500/30',
    };
    return colors[worth] || colors.medium;
  }

  function getWorthIcon(worth: string) {
    const icons: Record<string, string> = {
      high: '✅',
      medium: '🤔',
      low: '👎',
      avoid: '⚠️',
    };
    return icons[worth] || '🤔';
  }

  function handleToggleAttend(eventId: string) {
    toggleAttending(eventId);
    setLocalEvents([...events]);
    setShowCalendar(true);
  }

  function toggleSection(timing: string) {
    setCollapsedSections(prev => ({
      ...prev,
      [timing]: !prev[timing as keyof typeof prev],
    }));
  }

  const attendingByDay = getAttendingByDay();
  const attendingCount = events.filter(e => e.attending).length;

  const timingSections = [
    { key: 'today', label: 'Today', color: 'border-red-500/50 bg-red-500/5', collapsible: false },
    { key: 'tomorrow', label: 'Tomorrow', color: 'border-amber-500/50 bg-amber-500/5', collapsible: false },
    { key: 'this-week', label: 'This Week', color: 'border-blue-500/50 bg-blue-500/5', collapsible: true },
    { key: 'next-week', label: 'Next Week', color: 'border-green-500/50 bg-green-500/5', collapsible: true },
  ];

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎫</span>
          <div>
            <h3 className="font-medium">Eventbrite Meetups</h3>
            <p className="text-xs text-muted">{events.filter(e => e.timing === 'today').length} today</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            📅 My Calendar ({attendingCount})
          </button>
          <a
            href="https://www.eventbrite.com.ph/d/philippines--manila/events/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:underline"
          >
            Browse ↗
          </a>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="mb-4 p-3 rounded-xl border border-accent/30 bg-accent/5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">📅 My Events</h4>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>
          {attendingCount === 0 ? (
            <p className="text-xs text-muted">No events yet. Click "I'll Attend" on any event.</p>
          ) : (
            <div className="space-y-3">
              {['today', 'tomorrow', 'this-week', 'next-week'].map((timing) => {
                const dayEvents = attendingByDay[timing as keyof typeof attendingByDay];
                if (dayEvents.length === 0) return null;
                return (
                  <div key={timing}>
                    <p className="text-xs text-muted capitalize mb-1">{timing.replace('-', ' ')}</p>
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-2 rounded-lg bg-slate-900/50 flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-muted">{formatEventDate(event.date, event.timing, event.time)}</p>
                        </div>
                        <button
                          onClick={() => handleToggleAttend(event.id)}
                          className="text-xs text-red-400 hover:text-red-300 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {timingSections.map((section) => {
          const sectionEvents = events.filter(e => e.timing === section.key);
          if (sectionEvents.length === 0) return null;

          const isCollapsed = section.collapsible && collapsedSections[section.key as keyof typeof collapsedSections];

          return (
            <div
              key={section.key}
              className={`rounded-xl border p-3 ${section.color}`}
            >
              <div 
                className={`flex items-center justify-between mb-2 ${section.collapsible ? 'cursor-pointer' : ''}`}
                onClick={() => section.collapsible && toggleSection(section.key)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{section.label}</h4>
                  {section.collapsible && (
                    <span className="text-xs transition-transform">
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{sectionEvents.length} events</span>
                  {section.collapsible && isCollapsed && (
                    <span className="text-xs text-accent">Click to expand</span>
                  )}
                </div>
              </div>

              {!isCollapsed && (
              <div className="space-y-2">
                {sectionEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg bg-slate-900/50 overflow-hidden"
                  >
                    {/* Event Header */}
                    <div
                      className="p-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getCategoryIcon(event.category)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted truncate">{event.organizer}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                            <span>📅 {formatEventDate(event.date, event.timing, event.time)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={event.isOnline ? 'text-green-400' : 'text-muted'}>
                                {event.isOnline ? '🌐 Online' : '📍 In-person'}
                              </span>
                              <span className={event.price === 'Free' ? 'text-green-400' : 'text-muted'}>
                                {event.price}
                                {!event.priceVerified && <span className="text-amber-400 ml-0.5">?</span>}
                              </span>
                            </div>
                            <span className="text-xs text-muted">
                              👥 {event.attendees}
                            </span>
                          </div>
                          {/* Price flags */}
                          {event.flags && event.flags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {event.flags.map((flag, i) => (
                                <span key={i} className="text-xs text-amber-400 bg-amber-500/10 px-1 rounded">
                                  ⚠️ {flag}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Early bird badge */}
                          {event.earlyBird && (
                            <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                              🐦 Early bird available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === event.id && (
                      <div className="p-2 pt-0 border-t border-border/50">
                        {/* AI Insight */}
                        {event.insight && (
                          <div className={`mt-2 p-2 rounded-lg border text-xs ${getWorthColor(event.insight.worth)}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <span>{getWorthIcon(event.insight.worth)}</span>
                              <span className="font-medium capitalize">
                                {event.insight.worth === 'high' ? 'Worth Going' : 
                                 event.insight.worth === 'medium' ? 'Consider It' :
                                 event.insight.worth === 'low' ? 'Low Priority' : 'Skip This'}
                              </span>
                            </div>
                            <p className="opacity-90">{event.insight.reason}</p>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleToggleAttend(event.id)}
                            className={`flex-1 rounded-lg font-medium text-xs py-1.5 transition-colors ${
                              event.attending
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-accent text-slate-950 hover:bg-accent/90'
                            }`}
                          >
                            {event.attending ? '✓ Attending' : "I'll Attend"}
                          </button>
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-slate-800 font-medium text-xs px-3 py-1.5 hover:bg-slate-700 transition-colors"
                          >
                            ↗ Details
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

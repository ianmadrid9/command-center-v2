# Command Center Agents

Automated agents that run in the background to keep your dashboard updated.

---

## 🎫 Eventbrite Agents

### 1. Eventbrite Scout Agent

**Purpose:** Finds tech/networking events and checks actual ticket availability

**What it does:**
- Searches Eventbrite for relevant events near NYC
- Fetches real-time ticket data for each event
- Identifies: FREE tickets, sold-out early birds, paid tickets
- Saves enriched event data to `data/eventbrite-events.json`

**Manual Run:**
```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-scout.js
```

---

### 2. Eventbrite RSVP Agent ⚡

**Purpose:** Automatically grabs free/early-bird tickets before they sell out

**What it does:**
- Reads events from `data/eventbrite-events.json`
- Checks each event against RSVP criteria:
  - ✅ FREE tickets available
  - ✅ Early bird ≤ $15 (configurable)
  - ✅ Event has relevant keywords (tech, startup, networking, etc.)
  - ✅ Event is 1-60 days away
- Auto-RSVPS using your Eventbrite account
- Saves confirmations to `data/eventbrite-rsvps.json`

**Manual Run:**
```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-rsvp.js
```

**Requirements:**
- `EVENTBRITE_API_KEY` - Your API key
- `EVENTBRITE_USER_EMAIL` - Your Eventbrite email
- `EVENTBRITE_USER_NAME` - Your full name

---

### 3. Eventbrite Auto-Scout & RSVP 🚀

**Purpose:** Runs both agents in sequence (recommended)

**What it does:**
1. Runs Scout to fetch fresh events with ticket data
2. Runs RSVP to grab eligible tickets immediately
3. Perfect for catching early-bird tickets as soon as they're found

**Manual Run:**
```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-auto.js
```

---

## ⏰ Automated Schedule (Cron)

### Option 1: Run Auto-Scout & RSVP every 6 hours

Catches early-bird tickets throughout the day:

```bash
# Add to crontab (crontab -e)
0 */6 * * * cd /Users/spm/.openclaw/workspace/command-center && node agents/eventbrite-auto.js >> ~/eventbrite-auto.log 2>&1
```

### Option 2: Separate schedules

Scout every morning, RSVP every hour during business hours:

```bash
# Scout daily at 8 AM
0 8 * * * cd /Users/spm/.openclaw/workspace/command-center && node agents/eventbrite-scout.js >> ~/eventbrite-scout.log 2>&1

# RSVP hourly 9 AM - 6 PM on weekdays
0 9-18 * * 1-5 cd /Users/spm/.openclaw/workspace/command-center && node agents/eventbrite-rsvp.js >> ~/eventbrite-rsvp.log 2>&1
```

---

## 📁 Output Files

| File | Description |
|------|-------------|
| `data/eventbrite-events.json` | All discovered events with ticket data |
| `data/eventbrite-rsvps.json` | Confirmed RSVPs with order IDs |

---

## 🔧 Configuration

### Environment Variables

Add to `.env` or set via Gateway:

```bash
# Required for Scout
EVENTBRITE_API_KEY=your_api_key_here

# Required for RSVP
EVENTBRITE_USER_EMAIL=your@email.com
EVENTBRITE_USER_NAME=Your Full Name
```

### RSVP Criteria (Customize in eventbrite-rsvp.js)

```javascript
const RSVP_CRITERIA = {
  maxPrice: 0,              // Only free tickets
  grabEarlyBird: true,      // Grab early bird even if not free
  earlyBirdMaxPrice: 15,    // Max price for early bird
  minDaysUntilEvent: 1,     // Don't grab same-day events
  maxDaysUntilEvent: 60,    // Don't grab events >60 days out
  keywords: ['tech', 'startup', 'networking', 'founder', 'ceo', 'entrepreneur', 'ai', 'fintech'],
  requireKeywords: true,    // Only RSVP if keywords match
};
```

---

## 🎯 Get Your API Key

1. Go to https://www.eventbrite.com/platform/api-keys
2. Log in to your Eventbrite account
3. Click "Generate API Key"
4. Copy and configure as shown above

---

## 📊 Dashboard Integration

The dashboard automatically displays:
- **Eventbrite Monitor** - Shows upcoming events with ticket status
- **RSVP Confirmations** - Shows your confirmed registrations
- **Quick Actions** - One-click RSVP from the dashboard (future feature)

Check the main dashboard at: http://localhost:3000

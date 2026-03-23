# 🎫 RSVP Subagent - Quick Start

## What It Does

The **Eventbrite RSVP Agent** automatically grabs free and early-bird tickets before they sell out.

### Example Output from Test Run:

```
📅 AI Startup Networking Rooftop Happy Hour
   💰 $12.51 (Sold Out - Early Bird Free tickets gone)
  ✅ Qualifies: Early bird at $12.51 (under $15)

📅 Tech Networking Event by Startup Valley in NYC Manhattan
   🟢 FREE
  ✅ Qualifies: FREE ticket available

📅 NYC Tech Mixer 2026
   🟢 FREE
  ✅ Qualifies: FREE ticket available
```

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Your Eventbrite API Key

1. Go to https://www.eventbrite.com/platform/api-keys
2. Log in with your Eventbrite account
3. Click **"Generate API Key"**
4. Copy the key

### Step 2: Configure Environment Variables

Run these commands:

```bash
openclaw env set EVENTBRITE_API_KEY=your_api_key_here
openclaw env set EVENTBRITE_USER_EMAIL=your@email.com
openclaw env set EVENTBRITE_USER_NAME="Ian Madrid"
```

### Step 3: Test It

```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-auto.js
```

You should see:
- ✅ Events being scanned
- ✅ Eligible tickets identified
- ✅ RSVP confirmations with order IDs

---

## 🎯 What Gets Auto-RSVP'd

The agent grabs tickets that match **ALL** criteria:

✅ **FREE tickets** - Always grabs these  
✅ **Early Bird ≤ $15** - Configurable in code  
✅ **Relevant keywords** - tech, startup, networking, founder, CEO, entrepreneur, AI, fintech  
✅ **1-60 days away** - Not same-day, not too far out  

### Skips:

❌ Events happening today  
❌ Events >60 days in the future  
❌ Paid tickets >$15 (unless you change the config)  
❌ Events without relevant keywords  

---

## ⏰ Automated Schedule

### Recommended: Run every 6 hours

Catches early-bird tickets throughout the day:

```bash
# Edit crontab
crontab -e

# Add this line:
0 */6 * * * cd /Users/spm/.openclaw/workspace/command-center && node agents/eventbrite-auto.js >> ~/eventbrite-auto.log 2>&1
```

### Alternative: Scout daily, RSVP hourly

```bash
# Scout every morning at 8 AM
0 8 * * * node /Users/spm/.openclaw/workspace/command-center/agents/eventbrite-scout.js

# RSVP every hour during business hours (9 AM - 6 PM, weekdays)
0 9-18 * * 1-5 node /Users/spm/.openclaw/workspace/command-center/agents/eventbrite-rsvp.js
```

---

## 📊 Where to Find RSVPs

### Confirmed RSVPs File

`data/eventbrite-rsvps.json` contains:

```json
{
  "last_updated": "2026-03-23T16:00:00.000Z",
  "rsvps": [
    {
      "success": true,
      "orderId": "123456789",
      "eventId": "1984939375104",
      "eventName": "AI Startup Networking Rooftop Happy Hour",
      "ticketName": "Free Ticket",
      "price": 0,
      "eventUrl": "https://www.eventbrite.com/e/...",
      "rsvpdAt": "2026-03-23T16:00:00.000Z"
    }
  ],
  "total_count": 1
}
```

### Dashboard Integration

The dashboard will show:
- **Eventbrite Monitor widget** - Upcoming events with ticket status
- **RSVP confirmations** - Your registered events with order IDs
- **Quick actions** - One-click RSVP (future enhancement)

---

## 🔧 Customize RSVP Criteria

Edit `agents/eventbrite-rsvp.js`:

```javascript
const RSVP_CRITERIA = {
  maxPrice: 0,              // Only free tickets (0 = free only)
  grabEarlyBird: true,      // Grab early bird even if not free
  earlyBirdMaxPrice: 15,    // ← Change this to adjust max early bird price
  minDaysUntilEvent: 1,     // Don't grab same-day events
  maxDaysUntilEvent: 60,    // Don't grab events >60 days out
  keywords: ['tech', 'startup', 'networking', 'founder', 'ceo', 'entrepreneur', 'ai', 'fintech'],
  requireKeywords: true,    // Only RSVP if keywords match
};
```

---

## 🚨 Troubleshooting

### "EVENTBRITE_API_KEY not set"

Run: `openclaw env set EVENTBRITE_API_KEY=your_key_here`

### "EVENTBRITE_USER_EMAIL not set"

Run: `openclaw env set EVENTBRITE_USER_EMAIL=your@email.com`

### "No eligible tickets available"

This means:
- Free tickets are already sold out, OR
- Early bird tickets exceed your max price, OR
- Event doesn't match your keyword criteria

### "Order failed: 400"

Usually means:
- Event is already sold out
- You're already registered
- Ticket quantity is 0

Check the event URL manually to confirm availability.

---

## 💡 Pro Tips

1. **Run frequently** - Early-bird tickets sell out in minutes. Run every 1-6 hours.

2. **Check logs** - Review `~/eventbrite-auto.log` to see what was grabbed.

3. **Adjust criteria** - If you're missing good events, lower the `earlyBirdMaxPrice` or add more keywords.

4. **Monitor RSVPs** - Check `data/eventbrite-rsvps.json` after each run.

5. **Backup plan** - The agent saves confirmations, but also check your Eventbrite email for tickets.

---

## 📞 Need Help?

- **Eventbrite API Docs:** https://www.eventbrite.com/platform/api
- **Get API Key:** https://www.eventbrite.com/platform/api-keys
- **Dashboard:** http://localhost:3000

---

**Ready to catch those early-bird tickets! 🎟️**

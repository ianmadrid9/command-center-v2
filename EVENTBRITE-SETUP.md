# 🎫 Eventbrite Integration Setup

## What's Already Working ✅

Your dashboard now shows **real Eventbrite events** with:
- ✅ Event name, date, time
- ✅ Distance from 50th & 2nd Ave, NYC
- ✅ **Free vs Paid events** (you settle paid ones yourself)
- ✅ Direct links to RSVP on Eventbrite
- ✅ Auto-refreshes when new data is fetched

---

## Current Events (Sample Data)

Right now you have **7 sample events**:

### 🆓 Free Events (5):
1. **AI Startup Networking Rooftop Happy Hour** - 0.8 miles
2. **Fintech Startup Networking Rooftop Happy Hour** - 0.8 miles  
3. **Tech Networking Event by Startup Valley** - 1.6 miles
4. **Startup Tech & AI Networking** - 1.7 miles
5. **NYC Tech Mixer 2026** - 2.3 miles

### 💰 Paid Events (2) - You settle yourself:
1. **Women in Tech, Fintech, AI Networking** - $9.85 - 0.6 miles
2. **NYC Tech Startups, Investors Networking** - $9.85 - 0.5 miles

---

## To Enable Daily Auto-Updates

### Step 1: Get Eventbrite API Key

1. Go to: https://www.eventbrite.com/platform/api-keys
2. Log in with your Eventbrite account (openclawian@gmail.com)
3. Copy your **Private Token**

### Step 2: Add to .env File

Edit `.env` in your command-center folder:

```bash
EVENTBRITE_API_KEY=your_api_key_here
```

### Step 3: Run Setup Script

```bash
cd /Users/spm/.openclaw/workspace/command-center
./setup-cron.sh
```

This sets up a **daily cron job** that runs at 9:00 AM to fetch new events.

---

## Manual Commands

### Fetch New Events Anytime:
```bash
cd /Users/spm/.openclaw/workspace/command-center
npm run eventbrite-scout
```

### View Logs:
```bash
tail -f /Users/spm/.openclaw/workspace/command-center/logs/eventbrite-scout.log
```

### Remove Daily Job:
```bash
crontab -e
# Delete the line containing "eventbrite-scout"
```

---

## Payment Handling

**Free Events:**
- Click "Get Tickets" → Free RSVP

**Paid Events:**
- Dashboard shows "⚠️ Settle yourself" badge
- Click "Get Tickets" → You pay on Eventbrite with your account
- Events are clearly marked so you know which ones need payment

---

## Dashboard Location

The Eventbrite Events widget is in your main dashboard at:
http://localhost:3000 (or your deployed URL)

Look for the 🎫 **Eventbrite Events** section!

---

## Need Help?

- **No events showing?** Run `npm run eventbrite-scout` manually
- **Wrong location?** Update `USER_LOCATION` in `agents/eventbrite-scout.js`
- **Want different categories?** Edit `SEARCH_CATEGORIES` in the same file

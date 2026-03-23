# Eventbrite API Setup

## Get Your API Key

1. Go to https://www.eventbrite.com/platform/api-keys
2. Log in to your Eventbrite account
3. Click "Generate API Key" or copy your existing key
4. Copy the key (starts with `...`)

## Configure in Command Center

### Required Environment Variables

```bash
# API access
EVENTBRITE_API_KEY=your_api_key_here

# For auto-RSVP (required to grab tickets)
EVENTBRITE_USER_EMAIL=your@email.com
EVENTBRITE_USER_NAME=Your Full Name
```

### Option 1: Local .env file (for testing)

```bash
cd /Users/spm/.openclaw/workspace/command-center
cp .env.example .env
# Edit .env and add your credentials
```

### Option 2: Gateway environment (recommended for production)

```bash
openclaw env set EVENTBRITE_API_KEY=your_key_here
openclaw env set EVENTBRITE_USER_EMAIL=your@email.com
openclaw env set EVENTBRITE_USER_NAME="Ian Madrid"
```

## Usage

### Manual Run

**Scout only** (fetch events with ticket data):
```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-scout.js
```

**RSVP only** (grab tickets from existing events):
```bash
node agents/eventbrite-rsvp.js
```

**Auto-Scout & RSVP** (recommended - runs both in sequence):
```bash
node agents/eventbrite-auto.js
```

### Automated (Cron)

Run every 6 hours to catch early bird tickets:
```bash
# Add to crontab (crontab -e)
0 */6 * * * cd /Users/spm/.openclaw/workspace/command-center && node agents/eventbrite-auto.js >> ~/eventbrite-auto.log 2>&1
```

Or use the setup script:
```bash
./setup-cron.sh
```

## What Changed

The Eventbrite Scout agent now:

✅ **Fetches actual ticket data** - No longer trusts the `event.free` flag  
✅ **Checks ticket availability** - Knows when free tickets are sold out  
✅ **Shows real pricing** - Displays actual ticket prices from the API  
✅ **Protects cached data** - Won't overwrite events when API fails  

### Ticket Status Examples

- 🟢 **FREE** - Free tickets are currently available
- 💰 **$12.51** (Sold Out - Early Bird Free tickets gone) - Free tickets existed but sold out
- 💰 **$9.85** (No free tickets offered) - Event never had free tickets

## Troubleshooting

### "EVENTBRITE_API_KEY not set"

The API key isn't configured. Follow the setup steps above.

### "Eventbrite API error: 403"

Your API key is invalid or expired. Generate a new one from the Eventbrite platform.

### "Eventbrite API error: 404"

The API endpoint might have changed. Check Eventbrite API docs for updates.

## Cron Schedule (Optional)

To run the scout daily:

```bash
# Add to crontab
0 8 * * * cd /Users/spm/.openclaw/workspace/command-center && node agents/eventbrite-scout.js
```

Or use the provided setup script:

```bash
./setup-cron.sh
```

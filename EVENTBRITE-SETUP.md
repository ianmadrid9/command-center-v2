# Eventbrite API Setup

## Get Your API Key

1. Go to https://www.eventbrite.com/platform/api-keys
2. Log in to your Eventbrite account
3. Click "Generate API Key" or copy your existing key
4. Copy the key (starts with `...`)

## Configure in Command Center

### Option 1: Local .env file (for testing)

```bash
cd /Users/spm/.openclaw/workspace/command-center
cp .env.example .env
echo "EVENTBRITE_API_KEY=YOUR_KEY_HERE" >> .env
```

### Option 2: Gateway environment (recommended for production)

```bash
openclaw env set EVENTBRITE_API_KEY=YOUR_KEY_HERE
```

## Test the Agent

```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-scout.js
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

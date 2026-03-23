# Command Center Agents

Automated agents that run in the background to keep your dashboard updated.

## Eventbrite Scout Agent

**Purpose:** Finds free tech/networking events near your location daily

**Schedule:** Runs every day at 9:00 AM

**Location:** 50th & 2nd Ave, NYC

### Manual Run

```bash
cd /Users/spm/.openclaw/workspace/command-center
npm run eventbrite-scout
```

### Setup Daily Cron Job

1. Open crontab:
```bash
crontab -e
```

2. Add this line:
```bash
0 9 * * * cd /Users/spm/.openclaw/workspace/command-center && npm run eventbrite-scout >> logs/eventbrite-scout.log 2>&1
```

3. Save and exit

### Output

Events are saved to: `data/eventbrite-events.json`

The dashboard automatically reads from this file and displays:
- Event name
- Date/time
- Venue location
- Distance from 50th & 2nd Ave
- Link to RSVP on Eventbrite

### Environment Variables

Add to your `.env` file:
```
EVENTBRITE_API_KEY=your_api_key_here
```

Get your API key from: https://www.eventbrite.com/platform/api-keys

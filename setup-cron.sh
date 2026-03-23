#!/bin/bash

# Eventbrite Scout Agent - Daily Cron Setup
# This script sets up a daily cron job to fetch new events

echo "🔧 Setting up Eventbrite Scout daily cron job..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create logs directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/logs"

# Create the cron job
CRON_JOB="0 9 * * * cd $SCRIPT_DIR && npm run eventbrite-scout >> $SCRIPT_DIR/logs/eventbrite-scout.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "eventbrite-scout"; then
    echo "✅ Cron job already exists!"
    crontab -l | grep "eventbrite-scout"
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job added!"
    echo ""
    echo "📅 Schedule: Every day at 9:00 AM"
    echo "📝 Logs: $SCRIPT_DIR/logs/eventbrite-scout.log"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To manually run the agent:"
echo "  cd $SCRIPT_DIR && npm run eventbrite-scout"
echo ""
echo "To view logs:"
echo "  tail -f $SCRIPT_DIR/logs/eventbrite-scout.log"
echo ""
echo "To remove the cron job:"
echo "  crontab -e  # Then remove the line containing 'eventbrite-scout'"

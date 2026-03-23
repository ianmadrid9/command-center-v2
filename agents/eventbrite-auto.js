#!/usr/bin/env node
/**
 * Eventbrite Auto-Scout & RSVP
 * 
 * Runs both scout and RSVP agents in sequence:
 * 1. Fetches fresh events with ticket data
 * 2. Automatically RSVPs to eligible events
 * 
 * Perfect for cron jobs or manual runs.
 */

const { exec } = require('child_process');
const path = require('path');

const agentsDir = __dirname;

console.log('🚀 Eventbrite Auto-Scout & RSVP');
console.log('================================');
console.log('');
console.log('Step 1: Scouting for events with ticket data...');
console.log('');

// Run scout first
exec(`node ${path.join(agentsDir, 'eventbrite-scout.js')}`, (error, stdout, stderr) => {
  console.log(stdout);
  if (stderr) console.error(stderr);
  if (error) {
    console.error('❌ Scout failed. Skipping RSVP.');
    process.exit(1);
  }
  
  console.log('');
  console.log('Step 2: Auto-RSVP to eligible events...');
  console.log('');
  
  // Then run RSVP
  exec(`node ${path.join(agentsDir, 'eventbrite-rsvp.js')}`, (error, stdout, stderr) => {
    console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) {
      console.error('❌ RSVP failed.');
      process.exit(1);
    }
    
    console.log('');
    console.log('✅ All done! Check data/eventbrite-rsvps.json for confirmations.');
  });
});

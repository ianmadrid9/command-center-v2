import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'activities.json');

// Initialize activities file
async function initActivitiesFile() {
  try {
    await fs.access(ACTIVITIES_FILE);
  } catch {
    // Create with empty activities
    await fs.writeFile(ACTIVITIES_FILE, JSON.stringify({ activities: [] }, null, 2));
  }
}

export async function GET() {
  await initActivitiesFile();
  
  try {
    const fileContents = await fs.readFile(ACTIVITIES_FILE, 'utf-8');
    const data = JSON.parse(fileContents);
    
    // Return last 50 activities, sorted by timestamp
    const activities = (data.activities || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    
    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('Error reading activities:', error);
    return NextResponse.json(
      { error: 'Failed to read activities' },
      { status: 500 }
    );
  }
}

// Helper function to log activities (can be called from other endpoints)
export async function logActivity(activity: {
  type: 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info';
  message: string;
  details?: string;
}) {
  await initActivitiesFile();
  
  const fileContents = await fs.readFile(ACTIVITIES_FILE, 'utf-8');
  const data = JSON.parse(fileContents);
  
  const newActivity = {
    id: `act-${Date.now()}`,
    ...activity,
    timestamp: new Date().toISOString(),
  };
  
  data.activities.push(newActivity);
  
  // Keep only last 200 activities
  if (data.activities.length > 200) {
    data.activities = data.activities.slice(-200);
  }
  
  await fs.writeFile(ACTIVITIES_FILE, JSON.stringify(data, null, 2));
  return newActivity;
}

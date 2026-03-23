import { NextResponse } from 'next/server';

// In-memory activity storage (Vercel-compatible)
const activities: Array<{
  id: string;
  type: 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info';
  message: string;
  timestamp: string;
  details?: string;
}> = [
  // Seed with some initial activities
  {
    id: 'act-1',
    type: 'info',
    message: 'Command Center initialized',
    timestamp: new Date().toISOString(),
    details: 'System ready',
  },
];

export async function GET() {
  try {
    // Return last 50 activities, sorted by timestamp
    const sortedActivities = [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    
    return NextResponse.json({
      success: true,
      activities: sortedActivities,
    });
  } catch (error) {
    console.error('Error reading activities:', error);
    return NextResponse.json(
      { error: 'Failed to read activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { type, message, details } = await request.json();
    
    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message required' }, { status: 400 });
    }
    
    const newActivity = {
      id: `act-${Date.now()}`,
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    
    activities.push(newActivity);
    
    // Keep only last 200 activities
    if (activities.length > 200) {
      activities.splice(0, activities.length - 200);
    }
    
    return NextResponse.json({
      success: true,
      activity: newActivity,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

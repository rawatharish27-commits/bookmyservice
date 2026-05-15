import { NextRequest, NextResponse } from 'next/server';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// In-memory visitor tracking (simple alternative since VisitorSession model doesn't exist in schema)
const visitors = new Map<string, { lastActive: Date; page?: string; referrer?: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, page, referrer } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Cleanup old sessions
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);
    for (const [key, value] of visitors.entries()) {
      if (value.lastActive < threshold) {
        visitors.delete(key);
      }
    }

    // Update or create session
    visitors.set(sessionId, {
      lastActive: new Date(),
      page: page || visitors.get(sessionId)?.page,
      referrer: referrer || visitors.get(sessionId)?.referrer,
    });

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);

    // Count active visitors
    let activeVisitors = 0;
    for (const [, value] of visitors.entries()) {
      if (value.lastActive > threshold) {
        activeVisitors++;
      }
    }

    return NextResponse.json({
      activeVisitors,
      todayVisitors: visitors.size,
      totalVisitors: visitors.size,
    });
  } catch (error) {
    console.error('Visitor stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

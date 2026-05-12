import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

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

    // Cleanup: mark sessions as inactive if lastActive > 5 minutes ago
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);
    await db.visitorSession.updateMany({
      where: {
        isActive: true,
        lastActive: { lt: threshold },
      },
      data: { isActive: false },
    });

    // Get request metadata
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    // Upsert the visitor session
    const session = await db.visitorSession.upsert({
      where: { sessionId },
      update: {
        lastActive: new Date(),
        isActive: true,
        ...(page !== undefined && { page }),
        ...(referrer !== undefined && { referrer }),
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
      },
      create: {
        sessionId,
        isActive: true,
        lastActive: new Date(),
        ...(page && { page }),
        ...(referrer && { referrer }),
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
      },
    });

    return NextResponse.json({ sessionId: session.sessionId });
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

    // Count active visitors: isActive=true AND lastActive > 5 minutes ago
    const activeVisitors = await db.visitorSession.count({
      where: {
        isActive: true,
        lastActive: { gt: threshold },
      },
    });

    // Count total visitors today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayVisitors = await db.visitorSession.count({
      where: {
        createdAt: { gte: todayStart },
      },
    });

    // Count total visitors (all time)
    const totalVisitors = await db.visitorSession.count();

    return NextResponse.json({
      activeVisitors,
      todayVisitors,
      totalVisitors,
    });
  } catch (error) {
    console.error('Visitor stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

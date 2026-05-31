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

    // Mark expired sessions as inactive
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);
    await db.visitorSession.updateMany({
      where: {
        isActive: true,
        lastActiveAt: { lt: threshold },
      },
      data: { isActive: false },
    });

    // Get IP and user agent from headers
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Upsert session
    const existing = await db.visitorSession.findUnique({
      where: { sessionId },
    });

    if (existing) {
      await db.visitorSession.update({
        where: { sessionId },
        data: {
          lastActiveAt: new Date(),
          isActive: true,
          page: page || existing.page,
          referrer: referrer || existing.referrer,
        },
      });
    } else {
      await db.visitorSession.create({
        data: {
          sessionId,
          ipAddress,
          userAgent,
          page: page || null,
          referrer: referrer || null,
          isActive: true,
          lastActiveAt: new Date(),
        },
      });
    }

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
    // Mark expired sessions as inactive first
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);
    await db.visitorSession.updateMany({
      where: {
        isActive: true,
        lastActiveAt: { lt: threshold },
      },
      data: { isActive: false },
    });

    // Count active visitors
    const activeVisitors = await db.visitorSession.count({
      where: { isActive: true },
    });

    // Count today's visitors
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayVisitors = await db.visitorSession.count({
      where: { createdAt: { gte: todayStart } },
    });

    // Total visitors ever
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

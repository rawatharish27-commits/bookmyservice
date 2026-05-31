import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);

    const result = await db.visitorSession.updateMany({
      where: {
        isActive: true,
        lastActiveAt: { lt: threshold },
      },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      deactivatedCount: result.count,
      message: `Deactivated ${result.count} expired visitor sessions`,
    });
  } catch (error) {
    console.error('Visitor cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

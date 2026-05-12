import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export async function POST() {
  try {
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);

    const result = await db.visitorSession.updateMany({
      where: {
        isActive: true,
        lastActive: { lt: threshold },
      },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      deactivatedCount: result.count,
      message: `${result.count} inactive session(s) marked as inactive`,
    });
  } catch (error) {
    console.error('Visitor cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

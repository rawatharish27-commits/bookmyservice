import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  // Auth check - admin only
  let user;
  try {
    user = await requireAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!requireRole(user, 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access revenue streams' },
        { status: 403 }
      );
    }

    const revenueStreams = await db.revenueStream.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalEstimated = revenueStreams
      .filter((r) => r.status === 'ACTIVE' && r.estimatedMonthlyRevenue)
      .reduce((sum, r) => sum + (r.estimatedMonthlyRevenue || 0), 0);

    return NextResponse.json({
      revenueStreams,
      totalEstimatedMonthlyRevenue: totalEstimated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Revenue streams error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

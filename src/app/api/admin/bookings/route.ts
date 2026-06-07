import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access bookings list' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          provider: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, title: true } },
          payment: { select: { id: true, status: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin bookings list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

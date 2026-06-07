import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }
    if (targetType) {
      where.targetType = targetType.toUpperCase();
    }

    const [logs, total] = await Promise.all([
      db.adminLog.findMany({
        where,
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.adminLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
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
    console.error('Admin logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

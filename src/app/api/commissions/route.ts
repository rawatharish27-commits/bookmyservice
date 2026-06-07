import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const commissionType = searchParams.get('commissionType');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId: user.userId };

    if (status) {
      whereClause.status = status;
    }

    if (commissionType) {
      whereClause.commissionType = commissionType;
    }

    const [commissions, total] = await Promise.all([
      db.commission.findMany({
        where: whereClause,
        include: {
          referral: {
            select: {
              id: true,
              referralCode: true,
              referredName: true,
              referredEmail: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.commission.count({ where: whereClause }),
    ]);

    // Calculate summary
    const allCommissions = await db.commission.findMany({
      where: { userId: user.userId },
    });

    const totalEarnings = allCommissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingAmount = allCommissions
      .filter((c) => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.amount, 0);
    const approvedAmount = allCommissions
      .filter((c) => c.status === 'APPROVED')
      .reduce((sum, c) => sum + c.amount, 0);
    const paidAmount = allCommissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalEarnings,
        pendingAmount,
        approvedAmount,
        paidAmount,
        totalCount: allCommissions.length,
        pendingCount: allCommissions.filter((c) => c.status === 'PENDING').length,
        approvedCount: allCommissions.filter((c) => c.status === 'APPROVED').length,
        paidCount: allCommissions.filter((c) => c.status === 'PAID').length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Commissions fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

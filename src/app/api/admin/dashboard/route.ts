import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access dashboard' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalProviders,
      totalClients,
      totalServices,
      totalBookings,
      totalRevenue,
      pendingBookings,
      completedBookings,
      activeDisputes,
      pendingKyc,
      pendingServiceApprovals,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: { name: 'PROVIDER' } } }),
      db.user.count({ where: { role: { name: 'CLIENT' } } }),
      db.service.count(),
      db.booking.count(),
      db.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      db.booking.count({ where: { status: 'PENDING' } }),
      db.booking.count({ where: { status: 'COMPLETED' } }),
      db.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      db.providerKyc.count({ where: { verificationStatus: 'PENDING' } }),
      db.service.count({ where: { approvalStatus: 'PENDING' } }),
    ]);

    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
        service: { select: { id: true, title: true } },
      },
    });

    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { role: { select: { name: true } } },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProviders,
        totalClients,
        totalServices,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingBookings,
        completedBookings,
        activeDisputes,
        pendingKyc,
        pendingServiceApprovals,
      },
      recentBookings,
      recentUsers,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

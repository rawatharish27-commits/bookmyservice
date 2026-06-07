import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access analytics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const [
      newUsers,
      newBookings,
      completedBookings,
      totalRevenue,
      avgBookingValue,
      bookingsByStatus,
      usersByRole,
    ] = await Promise.all([
      db.user.count({ where: { createdAt: { gte: startDate } } }),
      db.booking.count({ where: { createdAt: { gte: startDate } } }),
      db.booking.count({
        where: { status: 'COMPLETED', completedAt: { gte: startDate } },
      }),
      db.payment.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: startDate } },
        _sum: { amount: true },
      }),
      db.booking.aggregate({
        where: { status: 'COMPLETED', completedAt: { gte: startDate } },
        _avg: { finalPrice: true },
      }),
      db.booking.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { createdAt: { gte: startDate } },
      }),
      db.user.groupBy({
        by: ['roleId'],
        _count: { roleId: true },
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    // Top categories
    const topCategories = await db.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { services: true } },
      },
      orderBy: { services: { _count: 'desc' } },
      take: 10,
    });

    // Top services by bookings
    const topServices = await db.service.findMany({
      where: { isActive: true, isApproved: true },
      orderBy: { totalBookings: 'desc' },
      take: 10,
      include: {
        provider: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({
      period,
      startDate,
      metrics: {
        newUsers,
        newBookings,
        completedBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        avgBookingValue: avgBookingValue._avg.finalPrice || 0,
        completionRate: newBookings > 0 ? (completedBookings / newBookings) * 100 : 0,
      },
      bookingsByStatus: bookingsByStatus.map((b) => ({
        status: b.status,
        count: b._count.status,
      })),
      usersByRole,
      topCategories: topCategories.map((c) => ({
        id: c.id,
        name: c.name,
        servicesCount: c._count.services,
      })),
      topServices: topServices.map((s) => ({
        id: s.id,
        title: s.title,
        totalBookings: s.totalBookings,
        averageRating: s.averageRating,
        provider: s.provider.name,
        category: s.category.name,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

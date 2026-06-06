import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();

    // Define time boundaries
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as start of week
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Active threshold (5 min)
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);

    // Mark expired sessions as inactive
    await db.visitorSession.updateMany({
      where: {
        isActive: true,
        lastActiveAt: { lt: activeThreshold },
      },
      data: { isActive: false },
    });

    // Get all counts in parallel
    const [
      dailyVisitors,
      weeklyVisitors,
      monthlyVisitors,
      yearlyVisitors,
      activeVisitors,
      totalVisitors,
      totalClients,
      totalProviders,
      totalServices,
      totalBookings,
    ] = await Promise.all([
      db.visitorSession.count({ where: { createdAt: { gte: todayStart } } }),
      db.visitorSession.count({ where: { createdAt: { gte: weekStart } } }),
      db.visitorSession.count({ where: { createdAt: { gte: monthStart } } }),
      db.visitorSession.count({ where: { createdAt: { gte: yearStart } } }),
      db.visitorSession.count({ where: { isActive: true } }),
      db.visitorSession.count(),
      db.user.count({ where: { roleId: 1 } }),
      db.user.count({ where: { roleId: 2 } }),
      db.service.count({ where: { isActive: true, isApproved: true } }),
      db.booking.count(),
    ]);

    return NextResponse.json({
      activeVisitors,
      dailyVisitors,
      weeklyVisitors,
      monthlyVisitors,
      yearlyVisitors,
      totalVisitors,
      totalClients,
      totalProviders,
      totalServices,
      totalBookings,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Platform stats fetch error:', error);
    return NextResponse.json({
      activeVisitors: 0,
      dailyVisitors: 0,
      weeklyVisitors: 0,
      monthlyVisitors: 0,
      yearlyVisitors: 0,
      totalVisitors: 0,
      totalClients: 0,
      totalProviders: 0,
      totalServices: 0,
      totalBookings: 0,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

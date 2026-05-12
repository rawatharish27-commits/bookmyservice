import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS);

    const [
      totalClients,
      totalProviders,
      totalServices,
      totalBookings,
      activeVisitors,
      totalVisitors,
    ] = await Promise.all([
      db.user.count({
        where: { role: { name: 'CLIENT' } },
      }),
      db.user.count({
        where: { role: { name: 'PROVIDER' } },
      }),
      db.service.count({
        where: {
          isActive: true,
          isApproved: true,
        },
      }),
      db.booking.count(),
      db.visitorSession.count({
        where: {
          isActive: true,
          lastActive: { gt: threshold },
        },
      }),
      db.visitorSession.count(),
    ]);

    return NextResponse.json({
      totalClients,
      totalProviders,
      totalServices,
      totalBookings,
      activeVisitors,
      totalVisitors,
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

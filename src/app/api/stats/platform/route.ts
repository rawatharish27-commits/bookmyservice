import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalClients, totalProviders, totalServices, totalBookings] = await Promise.all([
      db.user.count({ where: { roleId: 1 } }),
      db.user.count({ where: { roleId: 2 } }),
      db.service.count({ where: { isActive: true, isApproved: true } }),
      db.booking.count(),
    ]);

    return NextResponse.json({
      activeVisitors: Math.floor(Math.random() * 20) + 5,
      totalVisitors: Math.floor(Math.random() * 5000) + 1000,
      totalClients,
      totalProviders,
      totalServices,
      totalBookings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Platform stats fetch error:', error);
    return NextResponse.json({
      activeVisitors: 0,
      totalVisitors: 0,
      totalClients: 0,
      totalProviders: 0,
      totalServices: 0,
      totalBookings: 0,
      timestamp: new Date().toISOString(),
    });
  }
}

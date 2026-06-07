import { NextResponse } from 'next/server';

export async function GET() {
  const health: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'bookmyservice-frontend',
    version: process.env.npm_package_version || '0.2.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Check database connection
  try {
    const { db } = await import('@/lib/db');
    await db.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (err) {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' }
  });
}

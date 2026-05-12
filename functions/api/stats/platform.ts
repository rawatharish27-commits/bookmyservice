/**
 * GET /api/stats/platform - Returns platform statistics
 *   - Public endpoint (no auth required)
 */

import { query, queryOne } from '../../_shared/db';
import { json, error } from '../../_shared/response';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    // Count clients (roleId = 1)
    const clientCount = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM User WHERE roleId = 1 AND status != 'BLOCKED'`,
      []
    );

    // Count providers (roleId = 2)
    const providerCount = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM User WHERE roleId = 2 AND status = 'ACTIVE'`,
      []
    );

    // Count active services
    const serviceCount = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM Service WHERE isActive = 1 AND approvalStatus = 'APPROVED'`,
      []
    );

    // Count total bookings
    const bookingCount = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM Booking`,
      []
    );

    // Count active visitors (sessions active in last 5 minutes)
    const activeVisitorCount = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM VisitorSession WHERE isActive = 1 AND datetime(lastActive) > datetime('now', '-5 minutes')`,
      []
    );

    // Count total visitors
    const totalVisitorCount = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM VisitorSession`,
      []
    );

    // Get recent stats for additional context
    const completedBookings = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM Booking WHERE status = 'COMPLETED'`,
      []
    );

    const pendingBookings = await queryOne(
      context.env.DB,
      `SELECT COUNT(*) as count FROM Booking WHERE status = 'PENDING'`,
      []
    );

    return json({
      totalClients: Number((clientCount as Record<string, unknown>)?.count || 0),
      totalProviders: Number((providerCount as Record<string, unknown>)?.count || 0),
      totalServices: Number((serviceCount as Record<string, unknown>)?.count || 0),
      totalBookings: Number((bookingCount as Record<string, unknown>)?.count || 0),
      completedBookings: Number((completedBookings as Record<string, unknown>)?.count || 0),
      pendingBookings: Number((pendingBookings as Record<string, unknown>)?.count || 0),
      activeVisitors: Number((activeVisitorCount as Record<string, unknown>)?.count || 0),
      totalVisitors: Number((totalVisitorCount as Record<string, unknown>)?.count || 0),
    });
  } catch (err) {
    console.error('Platform stats error:', err);
    return error('Failed to fetch platform statistics', 500);
  }
}

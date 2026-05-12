/**
 * POST /api/stats/visitor - Track visitor session
 *   - Body: sessionId, page
 *   - Upserts visitor record
 */

import { queryOne, execute } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { sanitizeString, getClientIP } from '../../_shared/security';

interface Env {
  DB: D1Database;
}

function generateId(): string {
  return `vs_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const body = await context.request.json() as Record<string, unknown>;
    const sessionId = sanitizeString(String(body.sessionId || ''));
    const page = sanitizeString(String(body.page || ''));

    if (!sessionId) {
      return error('sessionId is required');
    }

    const ipAddress = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;

    // Check if session already exists
    const existing = await queryOne(
      context.env.DB,
      `SELECT id FROM VisitorSession WHERE sessionId = ?`,
      [sessionId]
    );

    if (existing) {
      // Update existing session
      await execute(
        context.env.DB,
        `UPDATE VisitorSession SET lastActive = datetime('now'), isActive = 1, page = ?, updatedAt = datetime('now') WHERE sessionId = ?`,
        [page || null, sessionId]
      );
    } else {
      // Create new session
      const id = generateId();
      await execute(
        context.env.DB,
        `INSERT INTO VisitorSession (id, sessionId, ipAddress, userAgent, page, isActive, lastActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'), datetime('now'))`,
        [id, sessionId, ipAddress, userAgent, page || null]
      );
    }

    // Update PlatformStats table
    await execute(
      context.env.DB,
      `UPDATE PlatformStats SET
        totalVisitors = (SELECT COUNT(*) FROM VisitorSession),
        activeVisitors = (SELECT COUNT(*) FROM VisitorSession WHERE isActive = 1 AND datetime(lastActive) > datetime('now', '-5 minutes')),
        updatedAt = datetime('now')
       WHERE id = 1`
    );

    // If no row exists, insert one
    const statsRow = await queryOne(
      context.env.DB,
      `SELECT id FROM PlatformStats WHERE id = 1`,
      []
    );

    if (!statsRow) {
      await execute(
        context.env.DB,
        `INSERT INTO PlatformStats (id, totalVisitors, totalUsers, totalProviders, totalBookings, totalServices, activeVisitors, updatedAt)
         VALUES (1,
           (SELECT COUNT(*) FROM VisitorSession),
           (SELECT COUNT(*) FROM User WHERE roleId = 1),
           (SELECT COUNT(*) FROM User WHERE roleId = 2 AND status = 'ACTIVE'),
           (SELECT COUNT(*) FROM Booking),
           (SELECT COUNT(*) FROM Service WHERE isActive = 1 AND approvalStatus = 'APPROVED'),
           (SELECT COUNT(*) FROM VisitorSession WHERE isActive = 1 AND datetime(lastActive) > datetime('now', '-5 minutes')),
           datetime('now')
         )`,
        []
      );
    }

    return json({ success: true });
  } catch (err) {
    console.error('Visitor tracking error:', err);
    return error('Failed to track visitor', 500);
  }
}

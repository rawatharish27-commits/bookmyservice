// ─── services/notification.service.ts ─────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (notifications section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── List Notifications ───────────────────────────────────────────────

export async function listNotifications(userId: string, limit: number, offset: number): Promise<{
  notifications: any[]; unreadCount: number; total: number; limit: number; offset: number
}> {
  const result = await pool.query('SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [userId, limit, offset]).catch(() => ({ rows: [] }))
  const unreadResult = await pool.query('SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1 AND "isRead" = false', [userId]).catch(() => ({ rows: [{ count: 0 }] }))
  return { notifications: result.rows, unreadCount: parseInt(unreadResult.rows[0].count), total: result.rows.length, limit, offset }
}

// ─── Mark Notification Read ───────────────────────────────────────────

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  await pool.query('UPDATE "Notification" SET "isRead" = true WHERE id = $1 AND "userId" = $2', [notificationId, userId])
}

// ─── Mark All Notifications Read ──────────────────────────────────────

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await pool.query('UPDATE "Notification" SET "isRead" = true WHERE "userId" = $1', [userId])
}

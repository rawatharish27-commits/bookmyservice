// ─── services/device.service.ts ─────────────────────────────────────────
// Pure business logic extracted from routes/device.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Register Device Token ───────────────────────────────────────────

export async function registerDeviceToken(userId: string, data: {
  token: string; platform?: string; appVersion?: string
}): Promise<{
  success: true; message: string; id: string; created: boolean
} | { success: false; error: string; status: number }> {
  const { token, platform, appVersion } = data

  if (!token) return { success: false, error: 'FCM device token is required', status: 400 }
  if (typeof token !== 'string' || token.length > 500) return { success: false, error: 'Invalid device token', status: 400 }

  const tokenId = 'dtk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)

  // Upsert: deactivate old tokens for this device, insert new one
  // Check if this token already exists for any user
  const existing = await pool.query('SELECT id, "userId" FROM "DeviceToken" WHERE token = $1', [token])
  if (existing.rows.length > 0) {
    // Token already registered — update it to this user (handles re-login)
    await pool.query(
      'UPDATE "DeviceToken" SET "userId" = $1, platform = $2, "appVersion" = $3, "isActive" = true, "updatedAt" = NOW() WHERE token = $4',
      [userId, platform || 'unknown', appVersion || null, token]
    )
    return { success: true, message: 'Device token updated', id: existing.rows[0].id, created: false }
  }

  // New token — insert
  await pool.query(
    'INSERT INTO "DeviceToken" (id, "userId", token, platform, "appVersion", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())',
    [tokenId, userId, token, platform || 'unknown', appVersion || null]
  )

  return { success: true, message: 'Device token registered', id: tokenId, created: true }
}

// ─── Remove Device Token ─────────────────────────────────────────────

export async function removeDeviceToken(userId: string, token: string): Promise<{
  success: true; message: string
} | { success: false; error: string; status: number }> {
  if (!token) return { success: false, error: 'FCM device token is required', status: 400 }

  // Deactivate the token instead of deleting (for analytics)
  await pool.query(
    'UPDATE "DeviceToken" SET "isActive" = false, "updatedAt" = NOW() WHERE token = $1 AND "userId" = $2',
    [token, userId]
  )

  return { success: true, message: 'Device token removed' }
}

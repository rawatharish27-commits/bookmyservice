// ─── routes/device.routes.ts ──────────────────────────────────────────
// FCM Device Token & Worker/Monitoring endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser } from '../lib/shared'
import { getFCMStatus } from '../lib/firebase'
import { getWorkerStatus, jobTracker } from '../workers/notification.worker'

const router = new Hono()

// ─── FCM Device Token Endpoints ────────────────────────────────────────
// Frontend registers FCM tokens so the backend can send push notifications

router.post('/api/devices/token', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { token, platform, appVersion } = await c.req.json()
    if (!token) return c.json({ error: 'FCM device token is required' }, 400)
    if (typeof token !== 'string' || token.length > 500) return c.json({ error: 'Invalid device token' }, 400)

    const tokenId = 'dtk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)

    // Upsert: deactivate old tokens for this device, insert new one
    // Check if this token already exists for any user
    const existing = await pool.query('SELECT id, "userId" FROM "DeviceToken" WHERE token = $1', [token])
    if (existing.rows.length > 0) {
      // Token already registered — update it to this user (handles re-login)
      await pool.query(
        'UPDATE "DeviceToken" SET "userId" = $1, platform = $2, "appVersion" = $3, "isActive" = true, "updatedAt" = NOW() WHERE token = $4',
        [user.id, platform || 'unknown', appVersion || null, token]
      )
      return c.json({ message: 'Device token updated', id: existing.rows[0].id })
    }

    // New token — insert
    await pool.query(
      'INSERT INTO "DeviceToken" (id, "userId", token, platform, "appVersion", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())',
      [tokenId, user.id, token, platform || 'unknown', appVersion || null]
    )

    return c.json({ message: 'Device token registered', id: tokenId }, 201)
  } catch (e) {
    console.error('Device token registration error:', e)
    return c.json({ error: 'Failed to register device token' }, 500)
  }
})

router.delete('/api/devices/token', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { token } = await c.req.json()
    if (!token) return c.json({ error: 'FCM device token is required' }, 400)

    // Deactivate the token instead of deleting (for analytics)
    await pool.query(
      'UPDATE "DeviceToken" SET "isActive" = false, "updatedAt" = NOW() WHERE token = $1 AND "userId" = $2',
      [token, user.id]
    )

    return c.json({ message: 'Device token removed' })
  } catch (e) {
    console.error('Device token removal error:', e)
    return c.json({ error: 'Failed to remove device token' }, 500)
  }
})

// Get FCM status for monitoring
router.get('/api/fcm/status', (c) => {
  return c.json(getFCMStatus())
})

// ─── Worker & Monitoring Endpoints ─────────────────────────────────────

router.get('/api/worker/status', (c) => {
  return c.json(getWorkerStatus())
})

router.get('/api/worker/jobs', (c) => {
  const limit = parseInt(c.req.query('limit') || '50')
  return c.json({ jobs: jobTracker.getRecentJobs(limit) })
})

router.get('/api/worker/dead-letter', (c) => {
  return c.json({ jobs: jobTracker.getDeadLetterJobs(), total: jobTracker.getDeadLetterJobs().length })
})

router.post('/api/worker/recover/:jobId', (c) => {
  const jobId = c.req.param('jobId')
  const result = jobTracker.recoverJob(jobId)
  return c.json(result, result.success ? 200 : 404)
})

export const deviceRoutes = router

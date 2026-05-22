// ─── routes/device.routes.ts ──────────────────────────────────────────
// FCM Device Token & Worker/Monitoring endpoints
// Refactored: thin handlers that delegate to device.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser } from '../lib/shared'
import { getFCMStatus } from '../lib/firebase'
import { getWorkerStatus, jobTracker } from '../workers/notification.worker'
import * as deviceService from '../services/device.service'

const router = new Hono()

// ─── FCM Device Token Endpoints ────────────────────────────────────────
// Frontend registers FCM tokens so the backend can send push notifications

router.post('/api/devices/token', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const { token, platform, appVersion } = await c.req.json()
    const result = await deviceService.registerDeviceToken(user.id, { token, platform, appVersion })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message, id: result.id }, result.created ? 201 : 200)
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
    const result = await deviceService.removeDeviceToken(user.id, token)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message })
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

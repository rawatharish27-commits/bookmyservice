// ─── routes/health.routes.ts ──────────────────────────────────────────
// Root route & Health check endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool } from '../lib/shared'
import { redis } from '../lib/redis'
import { getQueueStatus } from '../queues'
import { getSentryStatus } from '../lib/sentry'
import { getWorkerStatus } from '../workers/notification.worker'
import { getFCMStatus } from '../lib/firebase'
import { getRazorpayStatus } from '../lib/razorpay'
import { getCloudflareConfig } from '../lib/cloudflare'
import { getBackupStatus } from '../lib/backup'

const router = new Hono()

// Root route
router.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'bookmyservice-api',
    version: '1.0.0',
    endpoints: '/api/*'
  })
})

// Health check
router.get('/api/health', async (c) => {
  const cacheStatus = await redis.ping()
  const mem = process.memoryUsage()
  return c.json({
    status: 'ok',
    service: 'bookmyservice-api',
    cache: cacheStatus,
    queue: getQueueStatus(),
    sentry: getSentryStatus(),
    worker: getWorkerStatus(),
    fcm: getFCMStatus(),
    razorpay: getRazorpayStatus(),
    cloudflare: getCloudflareConfig(),
    backup: await getBackupStatus(pool),
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
  })
})

export const healthRoutes = router

// ─── routes/health.routes.ts ──────────────────────────────────────────
// Root route & Health check endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, requireAdmin } from '../lib/shared'
import { redis } from '../lib/redis'
import { getQueueStatus } from '../queues'
import { getSentryStatus } from '../lib/sentry'
import { getWorkerStatus } from '../workers/notification.worker'
import { getFCMStatus } from '../lib/firebase'
import { getRazorpayStatus } from '../lib/razorpay'
import { getCloudflareConfig } from '../lib/cloudflare'
import { getBackupStatus } from '../lib/backup'
import { getMetricsPrometheus, getMetricsJSON, getMetricsSummary } from '../lib/metrics'
import { getSecretHealthDashboard } from '../lib/env'
import { INSTANCE_ID, createHealthChecker, shutdownManager, type HealthStatus } from '../lib/scaling'

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

// Health check — includes metrics summary
router.get('/api/health', async (c) => {
  const cacheStatus = await redis.ping()
  const mem = process.memoryUsage()
  const metricsSummary = getMetricsSummary()

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
    metrics: metricsSummary,
  })
})

// Metrics endpoint — Prometheus or JSON format based on Accept header
router.get('/api/metrics', (c) => {
  const accept = c.req.header('accept') || ''
  if (accept.includes('text/plain')) {
    return c.text(getMetricsPrometheus(), 200, { 'Content-Type': 'text/plain; version=0.0.4' })
  }
  return c.json(getMetricsJSON())
})

// Secret health dashboard — admin only
// Shows which secrets are configured vs missing (never reveals values)
router.get('/api/health/secrets', async (c) => {
  const admin = await requireAdmin(c)
  if (!admin) return c.json({ error: 'Admin access required' }, 403)
  return c.json(getSecretHealthDashboard())
})

// ─── Readiness/Liveness Probes ──────────────────────────────────────

// Create health checker with real dependencies
const healthChecker = createHealthChecker({
  poolQuery: async () => {
    try {
      await pool.query('SELECT 1 as ok')
      return true
    } catch { return false }
  },
  redisPing: async () => {
    try {
      const result = await redis.ping()
      return result.ok
    } catch { return false }
  },
  queueReady: () => getQueueStatus().ready,
  shutdownManager,
})

// GET /api/health/ready — Readiness probe (for Kubernetes/load balancer)
router.get('/api/health/ready', async (c) => {
  const health = await healthChecker()
  if (!health.ready) return c.json({ ready: false, reason: 'shutdown_in_progress' }, 503)
  return c.json({ ready: true, instanceId: INSTANCE_ID })
})

// GET /api/health/live — Liveness probe (for Kubernetes)
router.get('/api/health/live', (c) => {
  return c.json({ live: true, instanceId: INSTANCE_ID, uptime: process.uptime() })
})

export const healthRoutes = router

// ─── routes/technician.routes.ts ────────────────────────────────────────
// Technician profile, jobs, and earnings endpoints
// Refactored: thin handlers that delegate to technician.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser } from '../lib/shared'
import * as technicianService from '../services/technician.service'

const router = new Hono()

// GET /api/technician/profile - Get technician profile
router.get('/api/technician/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await technicianService.getTechnicianProfile(user.id)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ profile: result.profile })
  } catch (e) { return c.json({ profile: null }) }
})

// PATCH /api/technician/profile - Update technician profile
router.patch('/api/technician/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const result = await technicianService.updateTechnicianProfile(user.id, body)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// GET /api/technician/jobs - Technician jobs
router.get('/api/technician/jobs', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const status = c.req.query('status')
    const result = await technicianService.getTechnicianJobs(user.id, status || undefined)
    return c.json(result)
  } catch (e) { return c.json({ jobs: [], total: 0 }) }
})

// GET /api/technician/earnings - Technician earnings
router.get('/api/technician/earnings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await technicianService.getTechnicianEarnings(user.id)
    return c.json(result)
  } catch (e) { return c.json({ earnings: { totalEarnings: 0, monthlyEarnings: 0, totalCompletedJobs: 0 } }) }
})

export const technicianRoutes = router

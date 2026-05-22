// ─── routes/franchise.routes.ts ─────────────────────────────────────────
// Franchise dashboard, vendors, analytics, and public franchise endpoints
// Refactored: thin handlers that delegate to franchise.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser } from '../lib/shared'
import * as franchiseService from '../services/franchise.service'

const router = new Hono()

// GET /api/franchise/dashboard - Franchise dashboard (requires auth)
router.get('/api/franchise/dashboard', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await franchiseService.getFranchiseDashboard(user.id)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ franchise: result.franchise, stats: result.stats })
  } catch (e) { return c.json({ error: 'Failed to get franchise dashboard' }, 500) }
})

// GET /api/franchise/vendors - List franchise vendors (requires auth)
router.get('/api/franchise/vendors', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await franchiseService.getFranchiseVendors(user.id)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ vendors: result.vendors, total: result.total })
  } catch (e) { return c.json({ error: 'Failed to list franchise vendors' }, 500) }
})

// GET /api/franchise/analytics - Franchise analytics (requires auth)
router.get('/api/franchise/analytics', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const result = await franchiseService.getFranchiseAnalytics(user.id)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ franchiseId: result.franchiseId, city: result.city, revenueByMonth: result.revenueByMonth, topServices: result.topServices })
  } catch (e) { return c.json({ error: 'Failed to get franchise analytics' }, 500) }
})

// GET /api/vendor/bookings - Vendor bookings (requires auth)
router.get('/api/vendor/bookings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Vendor access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    const result = await franchiseService.getVendorBookings(user.id, { status: status || undefined, limit, offset })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list vendor bookings' }, 500) }
})

// GET /api/vendor/services - Vendor services (requires auth)
router.get('/api/vendor/services', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Vendor access required' }, 403)
    const result = await franchiseService.getVendorServices(user.id)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list vendor services' }, 500) }
})

// GET /api/franchises - Public list of franchises
router.get('/api/franchises', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await franchiseService.listFranchises(limit, offset)
    return c.json(result)
  } catch (e) { return c.json({ franchises: [], total: 0 }) }
})

// POST /api/franchises - Create a franchise application (requires auth)
router.post('/api/franchises', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const body = await c.req.json()
    const result = await franchiseService.createFranchise(auth.id, body)
    return c.json(result, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

export const franchiseRoutes = router

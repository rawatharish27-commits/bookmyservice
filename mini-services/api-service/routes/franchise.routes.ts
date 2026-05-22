// ─── routes/franchise.routes.ts ─────────────────────────────────────────
// Franchise dashboard, vendors, analytics, and public franchise endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser, transformServiceRow } from '../lib/shared'

const router = new Hono()

// GET /api/franchise/dashboard - Franchise dashboard (requires auth)
router.get('/api/franchise/dashboard', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!franchiseResult.rows[0]) return c.json({ error: 'No franchise found for this user' }, 404)
    const franchise = franchiseResult.rows[0]
    const bookingsResult = await pool.query('SELECT COUNT(*) as total, COALESCE(SUM("finalPrice"), 0) as revenue FROM "Booking" WHERE "providerId" IN (SELECT id FROM "User" WHERE city = $1) AND status = \'COMPLETED\'', [franchise.city]).catch(() => ({ rows: [{ total: 0, revenue: 0 }] }))
    const vendorsResult = await pool.query('SELECT COUNT(*) as total FROM "User" WHERE "roleId" = 2 AND city = $1', [franchise.city]).catch(() => ({ rows: [{ total: 0 }] }))
    return c.json({
      franchise,
      stats: { totalBookings: parseInt(bookingsResult.rows[0]?.total || '0'), totalRevenue: parseFloat(bookingsResult.rows[0]?.revenue || '0'), totalVendors: parseInt(vendorsResult.rows[0]?.total || '0') }
    })
  } catch (e) { return c.json({ error: 'Failed to get franchise dashboard' }, 500) }
})

// GET /api/franchise/vendors - List franchise vendors (requires auth)
router.get('/api/franchise/vendors', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!franchiseResult.rows[0]) return c.json({ error: 'No franchise found' }, 404)
    const franchise = franchiseResult.rows[0]
    const result = await pool.query('SELECT id, name, email, phone, city, "isVerified", "completedJobsCount", "createdAt" FROM "User" WHERE "roleId" = 2 AND city = $1 ORDER BY "createdAt" DESC', [franchise.city]).catch(() => ({ rows: [] }))
    return c.json({ vendors: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list franchise vendors' }, 500) }
})

// GET /api/franchise/analytics - Franchise analytics (requires auth)
router.get('/api/franchise/analytics', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [user.id]).catch(() => ({ rows: [] }))
    if (!franchiseResult.rows[0]) return c.json({ error: 'No franchise found' }, 404)
    const franchise = franchiseResult.rows[0]
    const revenueByMonth = await pool.query("SELECT TO_CHAR(\"completedAt\", 'YYYY-MM') as month, COUNT(*) as bookings, COALESCE(SUM(\"finalPrice\"), 0) as revenue FROM \"Booking\" WHERE \"providerId\" IN (SELECT id FROM \"User\" WHERE city = $1) AND status = 'COMPLETED' AND \"completedAt\" >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month", [franchise.city]).catch(() => ({ rows: [] }))
    const topServices = await pool.query('SELECT s.title as name, COUNT(b.id) as bookings FROM "Service" s JOIN "Booking" b ON b."serviceId" = s.id JOIN "User" u ON s."providerId" = u.id WHERE u.city = $1 AND b.status = \'COMPLETED\' GROUP BY s.title ORDER BY bookings DESC LIMIT 5', [franchise.city]).catch(() => ({ rows: [] }))
    return c.json({ franchiseId: franchise.id, city: franchise.city, revenueByMonth: revenueByMonth.rows, topServices: topServices.rows })
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
    let query = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", u.phone as "clientPhone" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."providerId" = $1'
    const params: any[] = [user.id]
    let idx = 2
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ bookings: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list vendor bookings' }, 500) }
})

// GET /api/vendor/services - Vendor services (requires auth)
router.get('/api/vendor/services', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Vendor access required' }, 403)
    const result = await pool.query(
      'SELECT s.*, sc.name as "categoryName" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."providerId" = $1 ORDER BY s."createdAt" DESC',
      [user.id]
    ).catch(() => ({ rows: [] }))
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list vendor services' }, 500) }
})

// GET /api/franchises - Public list of franchises
router.get('/api/franchises', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT * FROM "Franchise" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ franchises: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ franchises: [], total: 0 }) }
})

// POST /api/franchises - Create a franchise application (requires auth)
router.post('/api/franchises', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const body = await c.req.json()
    const id = 'fr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Franchise" (id, name, city, state, country, "contactPhone", "contactEmail", "ownerId", slug, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, \'PENDING\')', [id, body.name, body.city, body.state || '', body.country || 'India', body.contactPhone || '', body.contactEmail || '', body.ownerId || auth.id, body.slug || body.name?.toLowerCase().replace(/\s+/g, '-')])
    return c.json({ message: 'Franchise application submitted', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

export const franchiseRoutes = router

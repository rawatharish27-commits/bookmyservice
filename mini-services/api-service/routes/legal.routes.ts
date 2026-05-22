// ─── routes/legal.routes.ts ──────────────────────────────────────────
// Legal, FAQ, Contact, and Stats endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, LEGAL_TYPE_MAP } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'

const router = new Hono()

// Legal pages
router.get('/api/legal', async (c) => {
  try {
    const result = await pool.query('SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC')
    return c.json({ documents: result.rows, total: result.rows.length })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

router.get('/api/legal/:type', async (c) => {
  try {
    const typeParam = c.req.param('type')
    const pageType = LEGAL_TYPE_MAP[typeParam] || typeParam.toUpperCase()
    const result = await pool.query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    return c.json(result.rows[0])
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// FAQ
router.get('/api/faq', async (c) => {
  try {
    const category = c.req.query('category')
    const result = category 
      ? await pool.query('SELECT * FROM "Faq" WHERE category = $1 AND "isActive" = true ORDER BY "displayOrder"', [category])
      : await pool.query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"')
    return c.json({ faqs: result.rows, total: result.rows.length })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Contact
router.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json()
    if (!name || !email || !subject || !message) return c.json({ error: 'All fields required' }, 400)
    const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message])
    return c.json({ success: true, id }, 201)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Stats
router.get('/api/stats', async (c) => {
  try {
    // Try PlatformStats table first
    try {
      const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
      if (result.rows[0]) {
        const stats = result.rows[0]
        return c.json({
          totalProviders: String(stats.totalProviders || 0),
          totalCustomers: String(stats.totalUsers || 0),
          avgRating: String(stats.avgRating || 0),
        })
      }
    } catch (e) { /* PlatformStats table may not exist */ }

    // Fallback: compute real counts from actual DB tables
    const [providerResult, userResult, ratingResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2 AND status = \'ACTIVE\'').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 1 AND status = \'ACTIVE\'').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT AVG("averageRating") as avg FROM "Service" WHERE "isActive" = true AND "isApproved" = true AND "averageRating" > 0').catch(() => ({ rows: [{ avg: null }] })),
    ])
    const providerCount = parseInt(providerResult.rows[0]?.count || '0')
    const customerCount = parseInt(userResult.rows[0]?.count || '0')
    const avgRating = ratingResult.rows[0]?.avg ? (Math.round(parseFloat(ratingResult.rows[0].avg) * 10) / 10) : 0
    return c.json({
      totalProviders: String(providerCount),
      totalCustomers: String(customerCount),
      avgRating: String(avgRating),
    })
  } catch (e) { console.error('Stats error:', e); return c.json({ totalProviders: '0', totalCustomers: '0', avgRating: '0' }) }
})

router.get('/api/stats/platform', async (c) => {
  try {
    // Try cache first
    const cacheKey = CacheKeys.platformStats()
    const cached = await redis.getJson<Record<string, any>>(cacheKey)
    if (cached) return c.json(cached)

    const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
    const data = result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }

    // Write to cache (non-blocking)
    redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})

    return c.json(data)
  } catch (e) { console.error('Stats error:', e); return c.json({ totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }) }
})

export const legalRoutes = router

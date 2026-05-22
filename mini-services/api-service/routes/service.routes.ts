// ─── routes/service.routes.ts ──────────────────────────────────────────
// All /api/services/*, /api/categories/*, /api/subcategories/* routes
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser, requireAdmin, transformServiceRow, transformReviewRow } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'
import { createServiceSchema } from '../validators/provider.schema'
import { validateBody } from '../validators/validate'

const router = new Hono()

// GET /api/categories
router.get('/api/categories', async (c) => {
  try {
    const cacheKey = CacheKeys.categoriesAll()
    const cached = await redis.getJson<{ categories: any[]; total: number }>(cacheKey)
    if (cached) return c.json(cached)
    const result = await pool.query('SELECT id, name, slug, description, "iconUrl", icon, "imageUrl", "parentId", "isActive", "displayOrder", "isEmergency", "seoTitle", "seoDescription", "createdAt", "updatedAt" FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"')
    const data = { categories: result.rows, total: result.rows.length }
    redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})
    return c.json(data)
  } catch (e) { console.error('Categories error:', e); return c.json({ categories: [], total: 0 }) }
})

// GET /api/categories/:id
router.get('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const cacheKey = CacheKeys.categoryDetail(id)
    const cached = await redis.getJson<Record<string, any>>(cacheKey)
    if (cached) return c.json(cached)
    const result = await pool.query('SELECT * FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    const subResult = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [result.rows[0].id])
    const data = { ...result.rows[0], subcategories: subResult.rows }
    redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})
    return c.json(data)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// GET /api/categories/:id/services
router.get('/api/categories/:id/services', async (c) => {
  try {
    const id = c.req.param('id')
    const catResult = await pool.query('SELECT id FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1', [id])
    if (!catResult.rows[0]) return c.json({ error: 'Category not found' }, 404)
    const categoryId = catResult.rows[0].id
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query(
      'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage", ss.name as "subcategoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "ServiceSubcategory" ss ON s."subcategoryId" = ss.id WHERE s."categoryId" = $1 AND s."isActive" = true AND s."isApproved" = true ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $2 OFFSET $3',
      [categoryId, limit, offset]
    )
    const countResult = await pool.query('SELECT COUNT(*) as total FROM "Service" WHERE "categoryId" = $1 AND "isActive" = true AND "isApproved" = true', [categoryId])
    return c.json({ services: result.rows.map(transformServiceRow), total: parseInt(countResult.rows[0].total), limit, offset })
  } catch (e) { console.error('Category services error:', e); return c.json({ error: 'Failed' }, 500) }
})

// GET /api/subcategories
router.get('/api/subcategories', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    if (categoryId) {
      const result = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [parseInt(categoryId)])
      return c.json({ subcategories: result.rows, total: result.rows.length })
    }
    const result = await pool.query('SELECT * FROM "ServiceSubcategory" WHERE "isActive" = true ORDER BY "categoryId", "displayOrder"')
    return c.json({ subcategories: result.rows, total: result.rows.length })
  } catch (e) { console.error('Subcategories error:', e); return c.json({ subcategories: [], total: 0 }) }
})

// GET /api/popular-searches
router.get('/api/popular-searches', async (c) => {
  try {
    const count = parseInt(c.req.query('count') || '10')
    const searches = await redis.getPopularSearches(Math.min(count, 50))
    return c.json({ searches, total: searches.length })
  } catch (e) {
    return c.json({ searches: [], total: 0 })
  }
})

// GET /api/services
router.get('/api/services', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const categoryId = c.req.query('categoryId') || c.req.query('category')
    const search = c.req.query('search')
    if (search) { redis.trackSearch(search).catch(() => {}) }
    const cacheKey = CacheKeys.servicesList(limit, offset, categoryId || undefined, search || undefined)
    const cached = await redis.getJson<{ services: any[]; total: number; limit: number; offset: number; pagination: { total: number; limit: number; offset: number } }>(cacheKey)
    if (cached) return c.json(cached)
    let query = 'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true'
    const params: any[] = []
    if (categoryId) { query += ' AND s."categoryId" = $' + (params.length + 1); params.push(parseInt(categoryId)) }
    if (search) { query += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1})`; params.push(`%${search}%`) }
    query += ' ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)
    const result = await pool.query(query, params)
    let countQuery = 'SELECT COUNT(*) as total FROM "Service" s WHERE s."isActive" = true AND s."isApproved" = true'
    const countParams: any[] = []
    if (categoryId) { countQuery += ' AND s."categoryId" = $1'; countParams.push(parseInt(categoryId)) }
    if (search) { countQuery += ` AND (s.title ILIKE $${countParams.length + 1} OR s.description ILIKE $${countParams.length + 1})`; countParams.push(`%${search}%`) }
    const countResult = await pool.query(countQuery, countParams).catch(() => ({ rows: [{ total: 0 }] }))
    const data = { services: result.rows.map(transformServiceRow), total: parseInt(countResult.rows[0]?.total || '0'), limit, offset, pagination: { total: parseInt(countResult.rows[0]?.total || '0'), limit, offset } }
    redis.setJson(cacheKey, data, CacheTTL.MEDIUM).catch(() => {})
    return c.json(data)
  } catch (e) { console.error('Services error:', e); return c.json({ services: [], total: 0, limit: 20, offset: 0, pagination: { total: 0, limit: 20, offset: 0 } }) }
})

// GET /api/services/:id
router.get('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const cacheKey = CacheKeys.serviceDetail(id)
    const cached = await redis.getJson<Record<string, any>>(cacheKey)
    if (cached) return c.json(cached)
    const result = await pool.query(
      'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", u.phone as "providerPhone", u.city as "providerCity", u."isVerified" as "providerVerified", u."completedJobsCount" as "providerCompletedJobs", u."verifiedBadge" as "providerVerifiedBadge", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage", ss.name as "subcategoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "ServiceSubcategory" ss ON s."subcategoryId" = ss.id WHERE s.id = $1',
      [id]
    )
    if (!result.rows[0]) return c.json({ error: 'Service not found' }, 404)
    const availResult = await pool.query('SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"', [id])
    const reviewResult = await pool.query('SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT 10', [id])
    const data = { ...transformServiceRow(result.rows[0]), availability: availResult.rows, reviews: reviewResult.rows.map(transformReviewRow) }
    redis.setJson(cacheKey, data, CacheTTL.MEDIUM).catch(() => {})
    return c.json(data)
  } catch (e) { console.error('Service detail error:', e); return c.json({ error: 'Failed' }, 500) }
})

// GET /api/services/search
router.get('/api/services/search', async (c) => {
  try {
    const q = c.req.query('q') || ''
    const category = c.req.query('category')
    const city = c.req.query('city')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    let query = 'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true'
    const params: any[] = []
    if (q) { query += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1} OR s.city ILIKE $${params.length + 1})`; params.push(`%${q}%`) }
    if (category) { query += ` AND s."categoryId" = $${params.length + 1}`; params.push(parseInt(category)) }
    if (city) { query += ` AND s.city ILIKE $${params.length + 1}`; params.push(`%${city}%`) }
    query += ` ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length, limit, offset })
  } catch (e) { console.error('Search error:', e); return c.json({ error: 'Search failed' }, 500) }
})

// GET /api/services/:id/reviews
router.get('/api/services/:id/reviews', async (c) => {
  try {
    const id = c.req.param('id')
    const limit = parseInt(c.req.query('limit') || '10')
    const result = await pool.query('SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT $2', [id, limit])
    return c.json({ reviews: result.rows.map(transformReviewRow), total: result.rows.length })
  } catch (e) { return c.json({ reviews: [], total: 0 }) }
})

// GET /api/services/:id/availability
router.get('/api/services/:id/availability', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query('SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"', [id])
    return c.json({ availability: result.rows })
  } catch (e) { return c.json({ availability: [] }) }
})

// POST /api/services
router.post('/api/services', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Only providers can create services' }, 403)
    const vResult = await validateBody(c, createServiceSchema)
    if (!vResult.success) return vResult.response
    const { title, description, categoryId, subcategoryId, basePrice, images, serviceDurationMinutes, isEmergencyAvailable } = vResult.data
    const id = 'svc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "Service" (id, title, description, "categoryId", "subcategoryId", "providerId", "basePrice", images, "serviceDurationMinutes", "isEmergencyAvailable", "isActive", "isApproved", "isFeatured", "averageRating", "totalReviews", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false, false, 0, 0, NOW(), NOW())',
      [id, title, description || null, categoryId, subcategoryId || null, user.id, basePrice, images || null, serviceDurationMinutes || null, isEmergencyAvailable || false]
    )
    await redis.delByPattern('cache:services:*').catch(() => {})
    await redis.delByPattern('cache:categories:*').catch(() => {})
    return c.json({ message: 'Service created, pending approval', service: { id, title, status: 'PENDING_APPROVAL' } }, 201)
  } catch (e) { console.error('Create service error:', e); return c.json({ error: 'Failed to create service' }, 500) }
})

// PATCH /api/services/:id
router.patch('/api/services/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const existing = await pool.query('SELECT * FROM "Service" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
    if (!existing.rows[0]) return c.json({ error: 'Service not found' }, 404)
    if (existing.rows[0].providerId !== user.id && user.roleId !== 5) return c.json({ error: 'Not authorized to update this service' }, 403)
    const body = await c.req.json()
    const fields = ['title', 'description', 'basePrice', 'images', 'serviceDurationMinutes', 'isEmergencyAvailable', 'isActive']
    const updates = []
    const values: any[] = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Service" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const result = await pool.query('SELECT * FROM "Service" WHERE id = $1', [id]).catch(() => existing)
    await redis.del(CacheKeys.serviceDetail(id)).catch(() => {})
    await redis.delByPattern('cache:services:*').catch(() => {})
    return c.json({ message: 'Service updated', service: result.rows[0] })
  } catch (e) { return c.json({ error: 'Failed to update service' }, 500) }
})

// PATCH /api/services/:id/approve
router.patch('/api/services/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const body = await c.req.json().catch(() => ({}))
    const status = body.approved !== false ? 'APPROVED' : 'REJECTED'
    await pool.query('UPDATE "Service" SET "approvalStatus" = $1, "isApproved" = $2, "approvedAt" = NOW(), "updatedAt" = NOW() WHERE id = $3', [status, body.approved !== false, id])
    return c.json({ message: `Service ${status.toLowerCase()}`, serviceId: id })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// DELETE /api/services/:id
router.delete('/api/services/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const serviceCheck = await pool.query('SELECT "providerId" FROM "Service" WHERE id = $1', [id])
    if (serviceCheck.rows.length === 0) return c.json({ error: 'Service not found' }, 404)
    if (serviceCheck.rows[0].providerId !== user.id && user.roleId !== 1 && user.roleId !== 3) return c.json({ error: 'Not authorized' }, 403)
    await pool.query('DELETE FROM "Service" WHERE id = $1', [id])
    return c.json({ message: 'Service deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

export const serviceRoutes = router

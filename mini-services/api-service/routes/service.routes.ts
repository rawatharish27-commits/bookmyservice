// ─── routes/service.routes.ts ──────────────────────────────────────────
// All /api/services/*, /api/categories/*, /api/subcategories/* routes
// Refactored: thin handlers that delegate to service-catalog.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser, requireAdmin } from '../lib/shared'
import { redis, CacheKeys } from '../lib/redis'
import { createServiceSchema } from '../validators/provider.schema'
import { validateBody } from '../validators/validate'
import * as serviceCatalog from '../services/service-catalog.service'

const router = new Hono()

// GET /api/categories
router.get('/api/categories', async (c) => {
  try {
    const data = await serviceCatalog.listCategories()
    return c.json(data)
  } catch (e) { console.error('Categories error:', e); return c.json({ categories: [], total: 0 }) }
})

// GET /api/categories/:id
router.get('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await serviceCatalog.getCategoryDetail(id)
    if (!data) return c.json({ error: 'Not found' }, 404)
    return c.json(data)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// GET /api/categories/:id/services
router.get('/api/categories/:id/services', async (c) => {
  try {
    const id = c.req.param('id')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await serviceCatalog.getCategoryServices(id, limit, offset)
    if (!result) return c.json({ error: 'Category not found' }, 404)
    return c.json(result)
  } catch (e) { console.error('Category services error:', e); return c.json({ error: 'Failed' }, 500) }
})

// GET /api/subcategories
router.get('/api/subcategories', async (c) => {
  try {
    const categoryId = c.req.query('categoryId')
    const data = await serviceCatalog.listSubcategories(categoryId ? parseInt(categoryId) : undefined)
    return c.json(data)
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
    const data = await serviceCatalog.listServices({ limit, offset, categoryId: categoryId || undefined, search: search || undefined })
    return c.json(data)
  } catch (e) { console.error('Services error:', e); return c.json({ services: [], total: 0, limit: 20, offset: 0, pagination: { total: 0, limit: 20, offset: 0 } }) }
})

// GET /api/services/:id
router.get('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await serviceCatalog.getServiceDetail(id)
    if (!data) return c.json({ error: 'Service not found' }, 404)
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
    const data = await serviceCatalog.searchServices({ q, category: category || undefined, city: city || undefined, limit, offset })
    return c.json(data)
  } catch (e) { console.error('Search error:', e); return c.json({ error: 'Search failed' }, 500) }
})

// GET /api/services/:id/reviews
router.get('/api/services/:id/reviews', async (c) => {
  try {
    const id = c.req.param('id')
    const limit = parseInt(c.req.query('limit') || '10')
    const data = await serviceCatalog.getServiceReviews(id, limit)
    return c.json(data)
  } catch (e) { return c.json({ reviews: [], total: 0 }) }
})

// GET /api/services/:id/availability
router.get('/api/services/:id/availability', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await serviceCatalog.getServiceAvailability(id)
    return c.json(data)
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
    const result = await serviceCatalog.createService(user.id, { title, description, categoryId, subcategoryId, basePrice, images, serviceDurationMinutes, isEmergencyAvailable })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Service created, pending approval', service: result.service }, 201)
  } catch (e) { console.error('Create service error:', e); return c.json({ error: 'Failed to create service' }, 500) }
})

// PATCH /api/services/:id
router.patch('/api/services/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json()
    const result = await serviceCatalog.updateService(user.id, user.roleId, id, body)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Service updated', service: result.service })
  } catch (e) { return c.json({ error: 'Failed to update service' }, 500) }
})

// PATCH /api/services/:id/approve
router.patch('/api/services/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const body = await c.req.json().catch(() => ({}))
    const result = await serviceCatalog.approveService(id, body.approved !== false)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// DELETE /api/services/:id
router.delete('/api/services/:id', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const id = c.req.param('id')
    const result = await serviceCatalog.deleteService(user.id, user.roleId, id)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: 'Service deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

export const serviceRoutes = router

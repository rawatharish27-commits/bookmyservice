// ─── services/service-catalog.service.ts ────────────────────────────────
// Pure business logic extracted from routes/service.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool, transformServiceRow, transformReviewRow } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'

// ─── Types ────────────────────────────────────────────────────────────

export interface CreateServiceInput {
  title: string
  description?: string
  categoryId: number
  subcategoryId?: number
  basePrice: number
  images?: string[]
  serviceDurationMinutes?: number
  isEmergencyAvailable?: boolean
}

export interface ListServicesFilters {
  limit: number
  offset: number
  categoryId?: string
  search?: string
}

export interface SearchServicesFilters {
  q: string
  category?: string
  city?: string
  limit: number
  offset: number
}

// ─── Categories ───────────────────────────────────────────────────────

export async function listCategories(): Promise<{ categories: any[]; total: number }> {
  const cacheKey = CacheKeys.categoriesAll()
  const cached = await redis.getJson<{ categories: any[]; total: number }>(cacheKey)
  if (cached) return cached

  const result = await pool.query(
    'SELECT id, name, slug, description, "iconUrl", icon, "imageUrl", "parentId", "isActive", "displayOrder", "isEmergency", "seoTitle", "seoDescription", "createdAt", "updatedAt" FROM "ServiceCategory" WHERE "isActive" = true ORDER BY "displayOrder"'
  )
  const data = { categories: result.rows, total: result.rows.length }
  redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})
  return data
}

export async function getCategoryDetail(idOrSlug: string): Promise<Record<string, any> | null> {
  const cacheKey = CacheKeys.categoryDetail(idOrSlug)
  const cached = await redis.getJson<Record<string, any>>(cacheKey)
  if (cached) return cached

  const result = await pool.query(
    'SELECT * FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1',
    [idOrSlug]
  )
  if (!result.rows[0]) return null

  const subResult = await pool.query(
    'SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"',
    [result.rows[0].id]
  )
  const data = { ...result.rows[0], subcategories: subResult.rows }
  redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})
  return data
}

export async function getCategoryServices(categoryId: string, limit: number, offset: number): Promise<{
  services: any[]; total: number; limit: number; offset: number
} | null> {
  const catResult = await pool.query(
    'SELECT id FROM "ServiceCategory" WHERE id::text = $1 OR slug = $1',
    [categoryId]
  )
  if (!catResult.rows[0]) return null

  const catId = catResult.rows[0].id
  const result = await pool.query(
    'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage", ss.name as "subcategoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "ServiceSubcategory" ss ON s."subcategoryId" = ss.id WHERE s."categoryId" = $1 AND s."isActive" = true AND s."isApproved" = true ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $2 OFFSET $3',
    [catId, limit, offset]
  )
  const countResult = await pool.query(
    'SELECT COUNT(*) as total FROM "Service" WHERE "categoryId" = $1 AND "isActive" = true AND "isApproved" = true',
    [catId]
  )
  return {
    services: result.rows.map(transformServiceRow),
    total: parseInt(countResult.rows[0].total),
    limit,
    offset,
  }
}

// ─── Subcategories ───────────────────────────────────────────────────

export async function listSubcategories(categoryId?: number): Promise<{ subcategories: any[]; total: number }> {
  if (categoryId) {
    const result = await pool.query(
      'SELECT * FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"',
      [categoryId]
    )
    return { subcategories: result.rows, total: result.rows.length }
  }
  const result = await pool.query(
    'SELECT * FROM "ServiceSubcategory" WHERE "isActive" = true ORDER BY "categoryId", "displayOrder"'
  )
  return { subcategories: result.rows, total: result.rows.length }
}

// ─── Services ────────────────────────────────────────────────────────

export async function listServices(filters: ListServicesFilters): Promise<{
  services: any[]; total: number; limit: number; offset: number; pagination: { total: number; limit: number; offset: number }
}> {
  const { limit, offset, categoryId, search } = filters

  if (search) { redis.trackSearch(search).catch(() => {}) }

  const cacheKey = CacheKeys.servicesList(limit, offset, categoryId || undefined, search || undefined)
  const cached = await redis.getJson<{
    services: any[]; total: number; limit: number; offset: number; pagination: { total: number; limit: number; offset: number }
  }>(cacheKey)
  if (cached) return cached

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

  const data = {
    services: result.rows.map(transformServiceRow),
    total: parseInt(countResult.rows[0]?.total || '0'),
    limit,
    offset,
    pagination: { total: parseInt(countResult.rows[0]?.total || '0'), limit, offset },
  }
  redis.setJson(cacheKey, data, CacheTTL.MEDIUM).catch(() => {})
  return data
}

export async function getServiceDetail(id: string): Promise<Record<string, any> | null> {
  const cacheKey = CacheKeys.serviceDetail(id)
  const cached = await redis.getJson<Record<string, any>>(cacheKey)
  if (cached) return cached

  const result = await pool.query(
    'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", u.phone as "providerPhone", u.city as "providerCity", u."isVerified" as "providerVerified", u."completedJobsCount" as "providerCompletedJobs", u."verifiedBadge" as "providerVerifiedBadge", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage", ss.name as "subcategoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id LEFT JOIN "ServiceSubcategory" ss ON s."subcategoryId" = ss.id WHERE s.id = $1',
    [id]
  )
  if (!result.rows[0]) return null

  const availResult = await pool.query(
    'SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"',
    [id]
  )
  const reviewResult = await pool.query(
    'SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT 10',
    [id]
  )
  const data = { ...transformServiceRow(result.rows[0]), availability: availResult.rows, reviews: reviewResult.rows.map(transformReviewRow) }
  redis.setJson(cacheKey, data, CacheTTL.MEDIUM).catch(() => {})
  return data
}

export async function searchServices(filters: SearchServicesFilters): Promise<{
  services: any[]; total: number; limit: number; offset: number
}> {
  const { q, category, city, limit, offset } = filters
  let query = 'SELECT s.*, u.name as "providerName", u."profileImageUrl" as "providerImage", sc.name as "categoryName", sc.slug as "categorySlug", sc.icon as "categoryIcon", sc."imageUrl" as "categoryImage" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."isActive" = true AND s."isApproved" = true'
  const params: any[] = []
  if (q) { query += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1} OR s.city ILIKE $${params.length + 1})`; params.push(`%${q}%`) }
  if (category) { query += ` AND s."categoryId" = $${params.length + 1}`; params.push(parseInt(category)) }
  if (city) { query += ` AND s.city ILIKE $${params.length + 1}`; params.push(`%${city}%`) }
  query += ` ORDER BY s."isFeatured" DESC, s."averageRating" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  params.push(limit, offset)
  const result = await pool.query(query, params)
  return { services: result.rows.map(transformServiceRow), total: result.rows.length, limit, offset }
}

// ─── Service Reviews ─────────────────────────────────────────────────

export async function getServiceReviews(serviceId: string, limit: number): Promise<{
  reviews: any[]; total: number
}> {
  const result = await pool.query(
    'SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE r."serviceId" = $1 ORDER BY r."createdAt" DESC LIMIT $2',
    [serviceId, limit]
  )
  return { reviews: result.rows.map(transformReviewRow), total: result.rows.length }
}

// ─── Service Availability ────────────────────────────────────────────

export async function getServiceAvailability(serviceId: string): Promise<{
  availability: any[]
}> {
  const result = await pool.query(
    'SELECT * FROM "ServiceAvailability" WHERE "serviceId" = $1 AND "isAvailable" = true ORDER BY "dayOfWeek"',
    [serviceId]
  )
  return { availability: result.rows }
}

// ─── Create Service ──────────────────────────────────────────────────

export async function createService(userId: string, data: CreateServiceInput): Promise<{
  success: true; service: { id: string; title: string; status: string }
} | { success: false; error: string; status: number }> {
  const { title, description, categoryId, subcategoryId, basePrice, images, serviceDurationMinutes, isEmergencyAvailable } = data
  const id = 'svc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query(
    'INSERT INTO "Service" (id, title, description, "categoryId", "subcategoryId", "providerId", "basePrice", images, "serviceDurationMinutes", "isEmergencyAvailable", "isActive", "isApproved", "isFeatured", "averageRating", "totalReviews", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false, false, 0, 0, NOW(), NOW())',
    [id, title, description || null, categoryId, subcategoryId || null, userId, basePrice, images || null, serviceDurationMinutes || null, isEmergencyAvailable || false]
  )
  await redis.delByPattern('cache:services:*').catch(() => {})
  await redis.delByPattern('cache:categories:*').catch(() => {})
  return { success: true, service: { id, title, status: 'PENDING_APPROVAL' } }
}

// ─── Update Service ──────────────────────────────────────────────────

export async function updateService(userId: string, roleId: number, serviceId: string, fields: Record<string, any>): Promise<{
  success: true; service: any
} | { success: false; error: string; status: number }> {
  const existing = await pool.query('SELECT * FROM "Service" WHERE id = $1', [serviceId]).catch(() => ({ rows: [] }))
  if (!existing.rows[0]) return { success: false, error: 'Service not found', status: 404 }
  if (existing.rows[0].providerId !== userId && roleId !== 5) return { success: false, error: 'Not authorized to update this service', status: 403 }

  const allowedFields = ['title', 'description', 'basePrice', 'images', 'serviceDurationMinutes', 'isEmergencyAvailable', 'isActive']
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of allowedFields) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { success: false, error: 'No fields to update', status: 400 }
  updates.push('"updatedAt" = NOW()')
  values.push(serviceId)
  await pool.query(`UPDATE "Service" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  const result = await pool.query('SELECT * FROM "Service" WHERE id = $1', [serviceId]).catch(() => existing)
  await redis.del(CacheKeys.serviceDetail(serviceId)).catch(() => {})
  await redis.delByPattern('cache:services:*').catch(() => {})
  return { success: true, service: result.rows[0] }
}

// ─── Approve Service ─────────────────────────────────────────────────

export async function approveService(serviceId: string, approved: boolean): Promise<{
  message: string; serviceId: string
}> {
  const status = approved !== false ? 'APPROVED' : 'REJECTED'
  await pool.query(
    'UPDATE "Service" SET "approvalStatus" = $1, "isApproved" = $2, "approvedAt" = NOW(), "updatedAt" = NOW() WHERE id = $3',
    [status, approved !== false, serviceId]
  )
  return { message: `Service ${status.toLowerCase()}`, serviceId }
}

// ─── Delete Service ──────────────────────────────────────────────────

export async function deleteService(userId: string, roleId: number, serviceId: string): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const serviceCheck = await pool.query('SELECT "providerId" FROM "Service" WHERE id = $1', [serviceId])
  if (serviceCheck.rows.length === 0) return { success: false, error: 'Service not found', status: 404 }
  if (serviceCheck.rows[0].providerId !== userId && roleId !== 1 && roleId !== 3) return { success: false, error: 'Not authorized', status: 403 }
  await pool.query('DELETE FROM "Service" WHERE id = $1', [serviceId])
  return { success: true }
}

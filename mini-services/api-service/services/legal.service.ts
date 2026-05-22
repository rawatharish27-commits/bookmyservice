// ─── services/legal.service.ts ──────────────────────────────────────────
// Pure business logic extracted from routes/legal.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool, LEGAL_TYPE_MAP } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'

// ─── List Legal Documents ────────────────────────────────────────────

export async function listLegalDocuments(): Promise<{
  documents: any[]; total: number
}> {
  const result = await pool.query('SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC')
  return { documents: result.rows, total: result.rows.length }
}

// ─── Get Legal Document ──────────────────────────────────────────────

export async function getLegalDocument(typeParam: string): Promise<{
  success: true; document: any
} | { success: false; error: string; status: number }> {
  const pageType = LEGAL_TYPE_MAP[typeParam] || typeParam.toUpperCase()
  const result = await pool.query('SELECT * FROM "LegalPage" WHERE "pageType" = $1', [pageType])
  if (!result.rows[0]) return { success: false, error: 'Not found', status: 404 }
  return { success: true, document: result.rows[0] }
}

// ─── List FAQ ────────────────────────────────────────────────────────

export async function listFAQ(category?: string): Promise<{
  faqs: any[]; total: number
}> {
  const result = category
    ? await pool.query('SELECT * FROM "Faq" WHERE category = $1 AND "isActive" = true ORDER BY "displayOrder"', [category])
    : await pool.query('SELECT * FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder"')
  return { faqs: result.rows, total: result.rows.length }
}

// ─── Submit Contact ──────────────────────────────────────────────────

export async function submitContact(data: {
  name: string; email: string; subject: string; message: string
}): Promise<{
  success: true; id: string
} | { success: false; error: string; status: number }> {
  const { name, email, subject, message } = data
  if (!name || !email || !subject || !message) return { success: false, error: 'All fields required', status: 400 }
  const id = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)', [id, name, email, subject, message])
  return { success: true, id }
}

// ─── Get Stats ───────────────────────────────────────────────────────

export async function getStats(): Promise<{
  totalProviders: string; totalCustomers: string; avgRating: string
}> {
  // Try PlatformStats table first
  try {
    const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
    if (result.rows[0]) {
      const stats = result.rows[0]
      return {
        totalProviders: String(stats.totalProviders || 0),
        totalCustomers: String(stats.totalUsers || 0),
        avgRating: String(stats.avgRating || 0),
      }
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
  return {
    totalProviders: String(providerCount),
    totalCustomers: String(customerCount),
    avgRating: String(avgRating),
  }
}

// ─── Get Platform Stats ──────────────────────────────────────────────

export async function getPlatformStats(): Promise<Record<string, any>> {
  // Try cache first
  const cacheKey = CacheKeys.platformStats()
  const cached = await redis.getJson<Record<string, any>>(cacheKey)
  if (cached) return cached

  const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
  const data = result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }

  // Write to cache (non-blocking)
  redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})

  return data
}

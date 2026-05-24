// ─── services/review.service.ts ────────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (reviews section)
// ─────────────────────────────────────────────────────────────────────

import { pool, transformReviewRow } from '../lib/shared'

// ─── Create Review ────────────────────────────────────────────────────

export async function createReview(userId: string, data: { bookingId?: string; serviceId: string; reviewedId?: string; rating: number; comment?: string }): Promise<{
  success: true; review: { id: string; rating: number; comment: string | null }
} | { success: false; error: string; status: number }> {
  const { bookingId, serviceId, rating, comment } = data
  if (!serviceId || !rating) return { success: false, error: 'serviceId and rating are required', status: 400 }
  if (rating < 1 || rating > 5) return { success: false, error: 'Rating must be between 1 and 5', status: 400 }
  if (bookingId) {
    const bookingResult = await pool.query('SELECT status FROM "Booking" WHERE id = $1 AND "clientId" = $2', [bookingId, userId]).catch(() => ({ rows: [] }))
    if (bookingResult.rows[0] && bookingResult.rows[0].status !== 'COMPLETED') return { success: false, error: 'Can only review completed bookings', status: 400 }
  }
  if (bookingId) {
    const existing = await pool.query('SELECT id FROM "Review" WHERE "bookingId" = $1', [bookingId])
    if (existing.rows.length > 0) return { success: false, error: 'Review already exists for this booking', status: 409 }
  }
  const id = 'rev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "Review" (id, "bookingId", "serviceId", "reviewerId", rating, comment, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())', [id, bookingId || null, serviceId, userId, rating, comment || null])
  try { await pool.query('UPDATE "Service" SET "averageRating" = (SELECT AVG(rating) FROM "Review" WHERE "serviceId" = $1), "totalReviews" = (SELECT COUNT(*) FROM "Review" WHERE "serviceId" = $1), "updatedAt" = NOW() WHERE id = $1', [serviceId]) } catch (e) { /* ignore */ }
  return { success: true, review: { id, rating, comment: comment || null } }
}

// ─── List Reviews ─────────────────────────────────────────────────────

export async function listReviews(filters: { serviceId?: string; reviewedId?: string; limit?: number; offset?: number }): Promise<{
  reviews: any[]; total: number; limit: number; offset: number
}> {
  const { serviceId, reviewedId, limit = 20, offset = 0 } = filters
  let query = 'SELECT r.*, u.name as "reviewerName", u."profileImageUrl" as "reviewerImage" FROM "Review" r LEFT JOIN "User" u ON r."reviewerId" = u.id WHERE 1=1'
  const params: any[] = []
  let idx = 1
  if (serviceId) { query += ` AND r."serviceId" = $${idx}`; params.push(serviceId); idx++ }
  if (reviewedId) { query += ` AND r."reviewedId" = $${idx}`; params.push(reviewedId); idx++ }
  query += ` ORDER BY r."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(limit, offset)
  const result = await pool.query(query, params).catch(() => ({ rows: [] }))
  return { reviews: result.rows.map(transformReviewRow), total: result.rows.length, limit, offset }
}

// ─── Delete Review ────────────────────────────────────────────────────

export async function deleteReview(reviewId: string, userId: string, roleId: number): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const reviewCheck = await pool.query('SELECT "reviewerId" FROM "Review" WHERE id = $1', [reviewId])
  if (reviewCheck.rows.length === 0) return { success: false, error: 'Review not found', status: 404 }
  if (reviewCheck.rows[0].reviewerId !== userId && roleId !== 1 && roleId !== 3) return { success: false, error: 'Not authorized', status: 403 }
  await pool.query('DELETE FROM "Review" WHERE id = $1', [reviewId])
  return { success: true }
}

// ─── Update Review ────────────────────────────────────────────────────

export async function updateReview(reviewId: string, fields: { rating?: number; comment?: string }): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of ['rating', 'comment'] as const) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { success: false, error: 'No fields', status: 400 }
  updates.push('"updatedAt" = NOW()')
  values.push(reviewId)
  await pool.query(`UPDATE "Review" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  return { success: true }
}

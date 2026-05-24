// ─── services/favorites.service.ts ─────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (favorites section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── List Favorites ───────────────────────────────────────────────────

export async function listFavorites(userId: string): Promise<{
  favorites: any[]; total: number
}> {
  const result = await pool.query('SELECT f.*, s.title as "serviceName", s."images" as "serviceImage", s."basePrice", s."basePrice" as "finalPrice", s."averageRating", sc.name as "categoryName" FROM "Favorite" f LEFT JOIN "Service" s ON f."serviceId" = s.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE f."userId" = $1 ORDER BY f."createdAt" DESC', [userId]).catch(() => ({ rows: [] }))
  return { favorites: result.rows, total: result.rows.length }
}

// ─── Add Favorite ─────────────────────────────────────────────────────

export async function addFavorite(userId: string, serviceId: string): Promise<{
  success: true; favorite: { id: string; serviceId: string }
} | { success: false; error: string; status: number }> {
  if (!serviceId) return { success: false, error: 'serviceId is required', status: 400 }
  const existing = await pool.query('SELECT id FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [userId, serviceId]).catch(() => ({ rows: [] }))
  if (existing.rows.length > 0) return { success: false, error: 'Already in favorites', status: 409 }
  const id = 'fav_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "Favorite" (id, "userId", "serviceId", "createdAt") VALUES ($1, $2, $3, NOW())', [id, userId, serviceId])
  return { success: true, favorite: { id, serviceId } }
}

// ─── Remove Favorite ──────────────────────────────────────────────────

export async function removeFavorite(userId: string, serviceId: string): Promise<void> {
  await pool.query('DELETE FROM "Favorite" WHERE "userId" = $1 AND "serviceId" = $2', [userId, serviceId])
}

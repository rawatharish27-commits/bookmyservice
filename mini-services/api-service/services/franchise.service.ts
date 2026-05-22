// ─── services/franchise.service.ts ──────────────────────────────────────
// Pure business logic extracted from routes/franchise.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool, transformServiceRow } from '../lib/shared'

// ─── Franchise Dashboard ─────────────────────────────────────────────

export async function getFranchiseDashboard(userId: string): Promise<{
  success: true; franchise: any; stats: { totalBookings: number; totalRevenue: number; totalVendors: number }
} | { success: false; error: string; status: number }> {
  const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (!franchiseResult.rows[0]) return { success: false, error: 'No franchise found for this user', status: 404 }
  const franchise = franchiseResult.rows[0]
  const bookingsResult = await pool.query('SELECT COUNT(*) as total, COALESCE(SUM("finalPrice"), 0) as revenue FROM "Booking" WHERE "providerId" IN (SELECT id FROM "User" WHERE city = $1) AND status = \'COMPLETED\'', [franchise.city]).catch(() => ({ rows: [{ total: 0, revenue: 0 }] }))
  const vendorsResult = await pool.query('SELECT COUNT(*) as total FROM "User" WHERE "roleId" = 2 AND city = $1', [franchise.city]).catch(() => ({ rows: [{ total: 0 }] }))
  return {
    success: true,
    franchise,
    stats: {
      totalBookings: parseInt(bookingsResult.rows[0]?.total || '0'),
      totalRevenue: parseFloat(bookingsResult.rows[0]?.revenue || '0'),
      totalVendors: parseInt(vendorsResult.rows[0]?.total || '0'),
    },
  }
}

// ─── Franchise Vendors ───────────────────────────────────────────────

export async function getFranchiseVendors(userId: string): Promise<{
  success: true; vendors: any[]; total: number
} | { success: false; error: string; status: number }> {
  const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (!franchiseResult.rows[0]) return { success: false, error: 'No franchise found', status: 404 }
  const franchise = franchiseResult.rows[0]
  const result = await pool.query('SELECT id, name, email, phone, city, "isVerified", "completedJobsCount", "createdAt" FROM "User" WHERE "roleId" = 2 AND city = $1 ORDER BY "createdAt" DESC', [franchise.city]).catch(() => ({ rows: [] }))
  return { success: true, vendors: result.rows, total: result.rows.length }
}

// ─── Franchise Analytics ─────────────────────────────────────────────

export async function getFranchiseAnalytics(userId: string): Promise<{
  success: true; franchiseId: string; city: string; revenueByMonth: any[]; topServices: any[]
} | { success: false; error: string; status: number }> {
  const franchiseResult = await pool.query('SELECT * FROM "Franchise" WHERE "ownerId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (!franchiseResult.rows[0]) return { success: false, error: 'No franchise found', status: 404 }
  const franchise = franchiseResult.rows[0]
  const revenueByMonth = await pool.query("SELECT TO_CHAR(\"completedAt\", 'YYYY-MM') as month, COUNT(*) as bookings, COALESCE(SUM(\"finalPrice\"), 0) as revenue FROM \"Booking\" WHERE \"providerId\" IN (SELECT id FROM \"User\" WHERE city = $1) AND status = 'COMPLETED' AND \"completedAt\" >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month", [franchise.city]).catch(() => ({ rows: [] }))
  const topServices = await pool.query('SELECT s.title as name, COUNT(b.id) as bookings FROM "Service" s JOIN "Booking" b ON b."serviceId" = s.id JOIN "User" u ON s."providerId" = u.id WHERE u.city = $1 AND b.status = \'COMPLETED\' GROUP BY s.title ORDER BY bookings DESC LIMIT 5', [franchise.city]).catch(() => ({ rows: [] }))
  return { success: true, franchiseId: franchise.id, city: franchise.city, revenueByMonth: revenueByMonth.rows, topServices: topServices.rows }
}

// ─── Vendor Bookings ─────────────────────────────────────────────────

export async function getVendorBookings(userId: string, filters: { status?: string; limit: number; offset: number }): Promise<{
  bookings: any[]; total: number; limit: number; offset: number
}> {
  const { status, limit, offset } = filters
  let query = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", u.phone as "clientPhone" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."providerId" = $1'
  const params: any[] = [userId]
  let idx = 2
  if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
  query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(limit, offset)
  const result = await pool.query(query, params).catch(() => ({ rows: [] }))
  return { bookings: result.rows, total: result.rows.length, limit, offset }
}

// ─── Vendor Services ─────────────────────────────────────────────────

export async function getVendorServices(userId: string): Promise<{
  services: any[]; total: number
}> {
  const result = await pool.query(
    'SELECT s.*, sc.name as "categoryName" FROM "Service" s LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE s."providerId" = $1 ORDER BY s."createdAt" DESC',
    [userId]
  ).catch(() => ({ rows: [] }))
  return { services: result.rows.map(transformServiceRow), total: result.rows.length }
}

// ─── List Franchises (Public) ────────────────────────────────────────

export async function listFranchises(limit: number, offset: number): Promise<{
  franchises: any[]; total: number
}> {
  const result = await pool.query('SELECT * FROM "Franchise" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
  return { franchises: result.rows, total: result.rows.length }
}

// ─── Create Franchise ────────────────────────────────────────────────

export async function createFranchise(userId: string, data: any): Promise<{
  message: string; id: string
}> {
  const id = 'fr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query(
    'INSERT INTO "Franchise" (id, name, city, state, country, "contactPhone", "contactEmail", "ownerId", slug, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, \'PENDING\')',
    [id, data.name, data.city, data.state || '', data.country || 'India', data.contactPhone || '', data.contactEmail || '', data.ownerId || userId, data.slug || data.name?.toLowerCase().replace(/\s+/g, '-')]
  )
  return { message: 'Franchise application submitted', id }
}

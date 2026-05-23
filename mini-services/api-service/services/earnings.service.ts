// ─── services/earnings.service.ts ──────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (earnings section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Get Earnings ─────────────────────────────────────────────────────

export async function getEarnings(userId: string, period: string): Promise<{
  earnings: any; recentBookings: any[]; period: string
}> {
  let dateFilter = ''
  if (period === 'week') dateFilter = "AND b.\"completedAt\" >= NOW() - INTERVAL '7 days'"
  else if (period === 'month') dateFilter = "AND b.\"completedAt\" >= NOW() - INTERVAL '30 days'"
  else if (period === 'year') dateFilter = "AND b.\"completedAt\" >= NOW() - INTERVAL '365 days'"
  const earningsResult = await pool.query(`SELECT COALESCE(SUM(b."finalPrice"), 0) as "totalEarnings", COUNT(*) as "totalJobs", COALESCE(AVG(b."finalPrice"), 0) as "avgEarning" FROM "Booking" b WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b.status = 'COMPLETED' ${dateFilter}`, [userId]).catch(() => ({ rows: [{ totalEarnings: 0, totalJobs: 0, avgEarning: 0 }] }))
  const pendingResult = await pool.query('SELECT COALESCE(SUM(b."finalPrice"), 0) as "pendingAmount" FROM "Booking" b WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b."paymentStatus" = \'PENDING\'', [userId]).catch(() => ({ rows: [{ pendingAmount: 0 }] }))
  const recentResult = await pool.query('SELECT b.id, b."bookingNumber", b."finalPrice", b."completedAt", s.title as "serviceName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id WHERE (b."providerId" = $1 OR b."technicianId" = $1) AND b.status = \'COMPLETED\' ORDER BY b."completedAt" DESC LIMIT 10', [userId]).catch(() => ({ rows: [] }))
  return { earnings: { ...earningsResult.rows[0], pendingAmount: pendingResult.rows[0].pendingAmount }, recentBookings: recentResult.rows, period }
}

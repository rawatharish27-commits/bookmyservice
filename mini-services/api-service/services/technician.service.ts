// ─── services/technician.service.ts ────────────────────────────────────
// Pure business logic extracted from routes/technician.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Get Technician Profile ──────────────────────────────────────────

export async function getTechnicianProfile(userId: string): Promise<{
  success: true; profile: any
} | { success: false; error: string; status: number }> {
  const result = await pool.query('SELECT u.id, u.email, u.name, u.phone, u."roleId", u.status, u."emailVerified", u."phoneVerified", u."profileImageUrl", u.address, u.city, u.state, u.country, u.pincode, u.latitude, u.longitude, u."lastLoginAt", u."deletedAt", u."createdAt", u."updatedAt", r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
  if (!result.rows[0]) return { success: false, error: 'Not found', status: 404 }
  const { roleName, ...profile } = result.rows[0]
  return { success: true, profile: { ...profile, role: roleName } }
}

// ─── Update Technician Profile ───────────────────────────────────────

export async function updateTechnicianProfile(userId: string, fields: Record<string, any>): Promise<{
  success: true; message: string
} | { success: false; error: string; status: number }> {
  const allowedFields = ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl']
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of allowedFields) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { success: false, error: 'No fields', status: 400 }
  updates.push('"updatedAt" = NOW()')
  values.push(userId)
  await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  return { success: true, message: 'Profile updated' }
}

// ─── Get Technician Jobs ─────────────────────────────────────────────

export async function getTechnicianJobs(userId: string, status?: string): Promise<{
  jobs: any[]; total: number
}> {
  const result = await pool.query(
    'SELECT b.*, s.title as "serviceName", s.basePrice, u.name as "clientName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."technicianId" = $1 ORDER BY b."createdAt" DESC LIMIT 50',
    [userId]
  ).catch(() => ({ rows: [] }))
  let jobs = result.rows
  if (status) jobs = jobs.filter((j: any) => j.status === status)
  return { jobs, total: jobs.length }
}

// ─── Get Technician Earnings ─────────────────────────────────────────

export async function getTechnicianEarnings(userId: string): Promise<{
  earnings: { totalEarnings: number; monthlyEarnings: number; totalCompletedJobs: number }
}> {
  const result = await pool.query(
    'SELECT COALESCE(SUM("finalPrice"), 0) as "totalEarnings", COALESCE(SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL \'30 days\' THEN "finalPrice" ELSE 0 END), 0) as "monthlyEarnings", COUNT(*) as "totalCompletedJobs" FROM "Booking" WHERE "technicianId" = $1 AND status = \'COMPLETED\'',
    [userId]
  ).catch(() => ({ rows: [{ totalEarnings: 0, monthlyEarnings: 0, totalCompletedJobs: 0 }] }))
  return { earnings: result.rows[0] }
}

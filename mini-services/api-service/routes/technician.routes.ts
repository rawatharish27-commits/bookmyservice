// ─── routes/technician.routes.ts ────────────────────────────────────────
// Technician profile, jobs, and earnings endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser } from '../lib/shared'

const router = new Hono()

// GET /api/technician/profile - Get technician profile
router.get('/api/technician/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [user.id])
    if (!result.rows[0]) return c.json({ error: 'Not found' }, 404)
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ profile: { ...profile, role: roleName } })
  } catch (e) { return c.json({ profile: null }) }
})

// PATCH /api/technician/profile - Update technician profile
router.patch('/api/technician/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const body = await c.req.json()
    const fields = ['name', 'phone', 'city', 'state', 'country', 'address', 'pincode', 'profileImageUrl']
    const updates: string[] = []
    const values: any[] = []
    let idx = 1
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ }
    }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(user.id)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    return c.json({ message: 'Profile updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// GET /api/technician/jobs - Technician jobs
router.get('/api/technician/jobs', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const status = c.req.query('status')
    const result = await pool.query('SELECT b.*, s.title as "serviceName", s.basePrice, u.name as "clientName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id WHERE b."technicianId" = $1 ORDER BY b."createdAt" DESC LIMIT 50',
      [user.id]).catch(() => ({ rows: [] }))
    let jobs = result.rows
    if (status) jobs = jobs.filter((j: any) => j.status === status)
    return c.json({ jobs, total: jobs.length })
  } catch (e) { return c.json({ jobs: [], total: 0 }) }
})

// GET /api/technician/earnings - Technician earnings
router.get('/api/technician/earnings', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Auth required' }, 401)
    const result = await pool.query('SELECT COALESCE(SUM("finalPrice"), 0) as "totalEarnings", COALESCE(SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL \'30 days\' THEN "finalPrice" ELSE 0 END), 0) as "monthlyEarnings", COUNT(*) as "totalCompletedJobs" FROM "Booking" WHERE "technicianId" = $1 AND status = \'COMPLETED\'',
      [user.id]).catch(() => ({ rows: [{ totalEarnings: 0, monthlyEarnings: 0, totalCompletedJobs: 0 }] }))
    return c.json({ earnings: result.rows[0] })
  } catch (e) { return c.json({ earnings: { totalEarnings: 0, monthlyEarnings: 0, totalCompletedJobs: 0 } }) }
})

export const technicianRoutes = router

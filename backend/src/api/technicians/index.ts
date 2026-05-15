import { Hono } from 'hono'
import { getCurrentUser } from '../../shared/auth.ts'
import { query } from '../../shared/db.ts'

const app = new Hono()

// GET /api/technicians/me
app.get('/me', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const res = await query('SELECT id, email, phone, name, status, city, state, country, "profileImageUrl" FROM "User" WHERE id = $1', [user.id])
    return c.json({ success: true, data: res.rows[0] })
  } catch (err) {
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// POST /api/technicians/location - update technician location
app.post('/location', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const body = await c.req.json()
    const { latitude, longitude, accuracy } = body
    if (latitude == null || longitude == null) return c.json({ error: 'Invalid location' }, 400)
    // upsert into TechnicianLocation
    await query('INSERT INTO "TechnicianLocation" ("technicianId", latitude, longitude, accuracy, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,now(),now()) ON CONFLICT ("technicianId") DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, accuracy = EXCLUDED.accuracy, "updatedAt" = now()', [user.id, latitude, longitude, accuracy || null])
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to update location' }, 500)
  }
})

// PATCH /api/technicians/availability - toggle availability status
app.patch('/availability', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const body = await c.req.json()
    const { available } = body
    if (available == null) return c.json({ error: 'Invalid payload' }, 400)
    await query('UPDATE "User" SET status = $1, "updatedAt" = now() WHERE id = $2', [available ? 'ACTIVE' : 'OFFLINE', user.id])
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to update availability' }, 500)
  }
})

// GET /api/technicians/jobs - list assigned jobs
app.get('/jobs', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const res = await query('SELECT b.* FROM "Booking" b WHERE b."providerId" = $1 ORDER BY b."createdAt" DESC', [user.id])
    return c.json({ success: true, data: res.rows })
  } catch (err) {
    return c.json({ error: 'Failed to fetch jobs' }, 500)
  }
})

// POST /api/technicians/jobs/:id/accept
app.post('/jobs/:id/accept', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const id = c.req.param('id')
  try {
    await query('UPDATE "Booking" SET status = $1, "updatedAt" = now(), "completedAt" = NULL WHERE id = $2 AND "providerId" = $3', ['IN_PROGRESS', id, user.id])
    await query('UPDATE "JobAssignment" SET status = $1, "acceptedAt" = now(), "updatedAt" = now() WHERE "bookingId" = $2 AND "technicianId" = $3', ['ACCEPTED', id, user.id])
    await query('INSERT INTO "Notification" ("userId", type, title, message, "actionUrl", "isRead", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,now())', [user.id, 'JOB_ACCEPTED', 'Job Accepted', `You accepted job ${id}`, `/provider/bookings/${id}`, false])
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to accept job' }, 500)
  }
})

// POST /api/technicians/jobs/:id/complete
app.post('/jobs/:id/complete', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const id = c.req.param('id')
  try {
    await query('UPDATE "Booking" SET status = $1, "completedAt" = now(), "updatedAt" = now() WHERE id = $2 AND "providerId" = $3', ['COMPLETED', id, user.id])
    await query('UPDATE "JobAssignment" SET status = $1, "updatedAt" = now() WHERE "bookingId" = $2 AND "technicianId" = $3', ['COMPLETED', id, user.id])
    // create notification to client
    const bookingRes = await query('SELECT "clientId" FROM "Booking" WHERE id = $1', [id])
    const clientId = bookingRes.rows[0]?.clientId
    if (clientId) {
      await query('INSERT INTO "Notification" ("userId", type, title, message, "actionUrl", "isRead", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,now())', [clientId, 'JOB_COMPLETED', 'Job Completed', `Your booking ${id} has been marked complete by the technician.`, `/client/bookings/${id}`, false])
    }
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to complete job' }, 500)
  }
})

export default app

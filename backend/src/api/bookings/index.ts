import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { getCurrentUser } from '../../shared/auth.ts'

const app = new Hono()

// GET /api/bookings - list bookings for current user
app.get('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const res = await query('SELECT * FROM "Booking" WHERE clientId = $1 OR providerId = $1 ORDER BY "createdAt" DESC', [user.id])
    return c.json({ success: true, data: res.rows })
  } catch (err) {
    return c.json({ error: 'Failed to fetch bookings' }, 500)
  }
})

// POST /api/bookings - create booking and attempt auto-assignment
app.post('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const { serviceId, scheduledDate, scheduledTime, serviceAddress, serviceLatitude, serviceLongitude, basePrice, finalPrice, specialInstructions } = body

    if (!serviceId || serviceLatitude == null || serviceLongitude == null) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const svc = await query('SELECT "categoryId", "basePrice" FROM "Service" WHERE id = $1 AND "isActive" = true AND "isApproved" = true', [serviceId])
    const service = svc.rows[0]
    if (!service) {
      return c.json({ error: 'Service not found or unavailable' }, 404)
    }

    const categoryId = service.categoryId
    let assignedProviderId: string | null = null
    if (categoryId) {
      const providersRes = await query(
        'SELECT u.id, u.latitude, u.longitude FROM "User" u JOIN "Service" s ON s."providerId" = u.id WHERE s."categoryId" = $1 AND u.status = $2 AND s."isActive" = true AND s."isApproved" = true',
        [categoryId, 'ACTIVE']
      )

      if (providersRes.rows.length > 0) {
        let nearest = null
        let bestDist = Infinity
        for (const p of providersRes.rows) {
          if (p.latitude == null || p.longitude == null) continue
          const d = Math.pow(p.latitude - serviceLatitude, 2) + Math.pow(p.longitude - serviceLongitude, 2)
          if (d < bestDist) {
            bestDist = d
            nearest = p
          }
        }
        if (nearest) assignedProviderId = nearest.id
      }
    }

    if (!assignedProviderId) {
      const adminRes = await query('SELECT id FROM "User" WHERE "roleId" = (SELECT id FROM "Role" WHERE name = $1) LIMIT 1', ['ADMIN'])
      assignedProviderId = adminRes.rows[0]?.id || user.id
    }

    const bookingNumber = `BYS-${Math.floor(Math.random() * 900000 + 100000)}-${Date.now().toString(36).toUpperCase()}`
    const amount = finalPrice ?? basePrice ?? service.basePrice ?? 0
    const platformFee = Math.round(amount * 0.05 * 100) / 100
    const providerEarnings = Math.round((amount - platformFee) * 100) / 100

    const insertRes = await query(
      `INSERT INTO "Booking" ("bookingNumber", "clientId", "providerId", "serviceId", status, "scheduledDate", "scheduledTime", "serviceAddress", "serviceLatitude", "serviceLongitude", "distanceKm", "basePrice", "finalPrice", "platformFee", "providerEarnings", "specialInstructions", "paymentStatus", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now(),now()) RETURNING *`,
      [bookingNumber, user.id, assignedProviderId, serviceId, assignedProviderId ? 'ACCEPTED' : 'PENDING', scheduledDate || null, scheduledTime || null, serviceAddress || '', serviceLatitude, serviceLongitude, null, basePrice ?? service.basePrice ?? 0, amount, platformFee, providerEarnings, specialInstructions || null, 'PENDING']
    )

    const booking = insertRes.rows[0]
    await query('INSERT INTO "JobAssignment" ("bookingId", "technicianId", status, "assignedAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now(), now())', [booking.id, assignedProviderId, assignedProviderId ? 'ASSIGNED' : 'PENDING'])

    await query('INSERT INTO "Notification" ("userId", type, title, message, "actionUrl", "isRead", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,now())', [user.id, 'BOOKING_CREATED', 'Booking Created', `Your booking ${bookingNumber} has been placed.`, `/bookings/${booking.id}`, false])
    if (assignedProviderId) {
      await query('INSERT INTO "Notification" ("userId", type, title, message, "actionUrl", "isRead", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,now())', [assignedProviderId, 'JOB_ASSIGNED', 'New Job Assigned', `A new job ${bookingNumber} has been assigned to you.`, `/provider/bookings/${booking.id}`, false])
    }

    return c.json({ success: true, data: booking })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Invalid request' }, 400)
  }
})

export default app
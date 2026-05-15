import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { getCurrentUser } from '../../shared/auth.ts'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const serviceId = c.req.query('serviceId')
    const providerId = c.req.query('providerId')
    const params: any[] = []
    let where = 'WHERE r."isVerified" = true'

    if (serviceId) {
      params.push(serviceId)
      where += ` AND r."serviceId" = $${params.length}`
    }
    if (providerId) {
      params.push(providerId)
      where += ` AND r."reviewedId" = $${params.length}`
    }

    const sql = `
      SELECT r.*, u.name AS "reviewerName", u."profileImageUrl" AS "reviewerImage"
      FROM "Review" r
      JOIN "User" u ON u.id = r."reviewerId"
      ${where}
      ORDER BY r."createdAt" DESC
      LIMIT 100
    `
    const result = await query(sql, params)
    return c.json({ success: true, data: result.rows })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to fetch reviews' }, 500)
  }
})

app.post('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const { bookingId, rating, comment, images } = await c.req.json()
    if (!bookingId || !rating) return c.json({ error: 'Booking ID and rating are required' }, 400)

    const bookingRes = await query('SELECT * FROM "Booking" WHERE id = $1', [bookingId])
    const booking = bookingRes.rows[0]
    if (!booking) return c.json({ error: 'Booking not found' }, 404)
    if (booking.clientId !== user.id) return c.json({ error: 'You can only review your own booking' }, 403)

    const existing = await query('SELECT id FROM "Review" WHERE "bookingId" = $1', [bookingId])
    if (existing.rows.length > 0) return c.json({ error: 'Review already submitted for this booking' }, 409)

    const insert = await query(
      'INSERT INTO "Review" ("bookingId", "reviewerId", "reviewedId", "serviceId", rating, comment, images, "isVerified", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),now()) RETURNING *',
      [bookingId, user.id, booking.providerId, booking.serviceId, rating, comment || '', images ? JSON.stringify(images) : null, true]
    )

    await query('UPDATE "Service" SET "totalReviews" = "totalReviews" + 1, "averageRating" = ("averageRating" * ("totalReviews" - 1) + $1) / GREATEST("totalReviews", 1) WHERE id = $2', [rating, booking.serviceId])

    return c.json({ success: true, data: insert.rows[0] })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to submit review' }, 500)
  }
})

export default app

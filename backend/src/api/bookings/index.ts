import { Hono } from 'hono'

const app = new Hono()

// GET /api/bookings
app.get('/', async (c) => {
  // TODO: Get user's bookings
  return c.json({
    success: true,
    message: 'Bookings endpoint - implementation needed',
    data: []
  })
})

// POST /api/bookings
app.post('/', async (c) => {
  try {
    const bookingData = await c.req.json()
    // TODO: Create booking
    return c.json({
      success: true,
      message: 'Booking created - implementation needed',
      data: bookingData
    })
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

export default app
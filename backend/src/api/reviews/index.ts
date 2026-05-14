import { Hono } from 'hono'

const app = new Hono()

// GET /api/reviews
app.get('/', async (c) => {
  // TODO: Get reviews
  return c.json({
    success: true,
    message: 'Reviews endpoint - implementation needed',
    data: []
  })
})

export default app
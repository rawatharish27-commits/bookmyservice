import { Hono } from 'hono'

const app = new Hono()

// GET /api/services
app.get('/', async (c) => {
  // TODO: Get all services
  return c.json({
    success: true,
    message: 'Services endpoint - implementation needed',
    data: []
  })
})

export default app
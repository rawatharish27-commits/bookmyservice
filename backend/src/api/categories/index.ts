import { Hono } from 'hono'

const app = new Hono()

// GET /api/categories
app.get('/', async (c) => {
  // TODO: Get all categories
  return c.json({
    success: true,
    message: 'Categories endpoint - implementation needed',
    data: []
  })
})

export default app
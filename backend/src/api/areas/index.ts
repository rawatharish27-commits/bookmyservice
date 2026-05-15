import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const result = await query('SELECT id, name, city, pincode, active, providerCount, customerCount, "createdAt", "updatedAt" FROM "Area" ORDER BY "createdAt" DESC')
    return c.json({ success: true, data: result.rows })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load areas' }, 500)
  }
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await query('SELECT id, name, city, pincode, active, providerCount, customerCount, "createdAt", "updatedAt" FROM "Area" WHERE id = $1', [id])
    const area = result.rows[0]
    if (!area) return c.json({ error: 'Area not found' }, 404)
    return c.json({ success: true, data: area })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load area' }, 500)
  }
})

export default app

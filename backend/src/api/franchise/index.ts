import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const result = await query('SELECT id, name, ownerId, city, state, country, commissionPct, "createdAt", "updatedAt" FROM "Franchise" ORDER BY "createdAt" DESC')
    return c.json({ success: true, data: result.rows })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load franchises' }, 500)
  }
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await query('SELECT id, name, ownerId, city, state, country, commissionPct, "createdAt", "updatedAt" FROM "Franchise" WHERE id = $1', [id])
    const franchise = result.rows[0]
    if (!franchise) return c.json({ error: 'Franchise not found' }, 404)
    return c.json({ success: true, data: franchise })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load franchise' }, 500)
  }
})

export default app

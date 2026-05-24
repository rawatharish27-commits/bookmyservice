import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/', async (c) => {
  const categoryId = Number(c.req.query('categoryId') || c.req.query('category'))
  try {
    const sql = `
      SELECT id, name, slug, description
      FROM "ServiceSubcategory"
      WHERE "isActive" = true
      ${Number.isFinite(categoryId) ? 'AND "categoryId" = $1' : ''}
      ORDER BY "displayOrder"
    `
    const params = Number.isFinite(categoryId) ? [categoryId] : []
    const result = await query<{ id: number; name: string; slug: string; description?: string }>(sql, params)
    return c.json(result.rows)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load subcategories' }, 500)
  }
})

export default app

import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

// GET /api/faq - Returns all active FAQ items, optionally filtered by category
app.get('/', async (c) => {
  try {
    const category = c.req.query('category')

    let sql = 'SELECT id, category, question, answer, "displayOrder" FROM "Faq" WHERE "isActive" = true'
    const params: unknown[] = []

    if (category) {
      sql += ' AND category = $1'
      params.push(category)
    }

    sql += ' ORDER BY "displayOrder" ASC, id ASC'

    const result = await query<{
      id: number
      category: string
      question: string
      answer: string
      displayOrder: number
    }>(sql, params)

    const faqs = result.rows.map(({ displayOrder, ...rest }) => rest)

    // Group by category for convenience
    const grouped: Record<string, Array<{ id: number; question: string; answer: string }>> = {}
    for (const faq of faqs) {
      const cat = faq.category || 'General'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({ id: faq.id, question: faq.question, answer: faq.answer })
    }

    return c.json({
      faqs,
      grouped,
      total: faqs.length,
    })
  } catch (error) {
    console.error('Get FAQ error:', error)
    return c.json({ error: 'Failed to fetch FAQ items' }, 500)
  }
})

export default app

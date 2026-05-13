import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const result = await query<{
      id: number
      category: string
      question: string
      answer: string
    }>(
      'SELECT id, category, question, answer FROM "Faq" WHERE "isActive" = true ORDER BY "displayOrder" ASC'
    )

    const grouped = result.rows.reduce<Record<string, Array<{ id: number; question: string; answer: string }>>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push({ id: item.id, question: item.question, answer: item.answer })
      return acc
    }, {})

    return c.json(grouped)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load FAQ' }, 500)
  }
})

export default app

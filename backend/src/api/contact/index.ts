import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    await query(
      'INSERT INTO "ContactMessage" (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), name, email, subject, message]
    )

    return c.json({ success: true, message: 'Contact message sent successfully' })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to submit contact form' }, 500)
  }
})

export default app

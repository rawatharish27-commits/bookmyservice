import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

// POST /api/contact - Submit contact form
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Missing required fields: name, email, subject, message' }, 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email))) {
      return c.json({ error: 'Invalid email format' }, 400)
    }

    // Validate lengths
    const sanitizedName = String(name).trim()
    const sanitizedEmail = String(email).trim().toLowerCase()
    const sanitizedSubject = String(subject).trim()
    const sanitizedMessage = String(message).trim()

    if (sanitizedName.length > 100) {
      return c.json({ error: 'Name must be at most 100 characters' }, 400)
    }
    if (sanitizedSubject.length > 200) {
      return c.json({ error: 'Subject must be at most 200 characters' }, 400)
    }
    if (sanitizedMessage.length > 5000) {
      return c.json({ error: 'Message must be at most 5000 characters' }, 400)
    }

    const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`

    await query(
      'INSERT INTO "ContactMessage" (id, name, email, subject, message, "isRead") VALUES ($1, $2, $3, $4, $5, false)',
      [id, sanitizedName, sanitizedEmail, sanitizedSubject, sanitizedMessage]
    )

    return c.json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
      id,
    }, 201)
  } catch (error) {
    console.error('Contact form error:', error)
    return c.json({ error: 'Failed to submit contact form' }, 500)
  }
})

export default app

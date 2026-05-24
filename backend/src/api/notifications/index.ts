import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { getCurrentUser } from '../../shared/auth.ts'

const app = new Hono()

app.get('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const result = await query<{
      id: string
      type: string
      title: string
      message: string
      actionUrl?: string
      isRead: boolean
      createdAt: string
    }>(
      'SELECT id, type, title, message, "actionUrl", "isRead", "createdAt" FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 25',
      [user.id]
    )

    const notifications = result.rows.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      actionUrl: item.actionUrl || null,
      isRead: Boolean(item.isRead),
      createdAt: item.createdAt,
    }))

    return c.json({ notifications })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to fetch notifications' }, 500)
  }
})

app.patch('/:id/read', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const notificationId = c.req.param('id')
  try {
    await query('UPDATE "Notification" SET "isRead" = true, "readAt" = NOW() WHERE id = $1 AND "userId" = $2', [notificationId, user.id])
    return c.json({ success: true })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to mark notification read' }, 500)
  }
})

app.patch('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    await query('UPDATE "Notification" SET "isRead" = true, "readAt" = NOW() WHERE "userId" = $1', [user.id])
    return c.json({ success: true })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to mark all notifications read' }, 500)
  }
})

export default app

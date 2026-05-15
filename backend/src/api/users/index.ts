import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { getCurrentUser } from '../../shared/auth.ts'

const app = new Hono()

app.get('/profile', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const result = await query(
      'SELECT id, email, phone, name, "roleId", status, "profileImageUrl", address, city, state, country, pincode, latitude, longitude, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
      [user.id]
    )
    return c.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to fetch profile' }, 500)
  }
})

app.patch('/profile', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const existingResult = await query(
      'SELECT name, phone, address, city, state, country, pincode, latitude, longitude, "profileImageUrl" FROM "User" WHERE id = $1',
      [user.id]
    )
    const existing = existingResult.rows[0]
    const body = await c.req.json()
    const { name, phone, address, city, state, country, pincode, latitude, longitude, profileImageUrl } = body

    await query(
      'UPDATE "User" SET name = $1, phone = $2, address = $3, city = $4, state = $5, country = $6, pincode = $7, latitude = $8, longitude = $9, "profileImageUrl" = $10, "updatedAt" = now() WHERE id = $11',
      [name || existing.name, phone || existing.phone, address || existing.address, city || existing.city, state || existing.state, country || existing.country, pincode || existing.pincode, latitude ?? existing.latitude, longitude ?? existing.longitude, profileImageUrl || existing.profileImageUrl, user.id]
    )
    return c.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

export default app

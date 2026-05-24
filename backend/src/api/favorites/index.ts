import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { getCurrentUser, formatUser } from '../../shared/auth.ts'

const app = new Hono()

app.get('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const result = await query<{
    id: string
    serviceId: string
    title: string
    description: string
    "basePrice": number
    images: string | null
    "providerName": string
    "categoryId": number
    "categoryName": string
    "categorySlug": string
  }>(
    `
      SELECT f.id, s.id AS "serviceId", s.title, s.description, s."basePrice", s.images,
        u.name AS "providerName",
        c.id AS "categoryId", c.name AS "categoryName", c.slug AS "categorySlug"
      FROM "Favorite" f
      JOIN "Service" s ON s.id = f."serviceId"
      JOIN "User" u ON u.id = s."providerId"
      JOIN "ServiceCategory" c ON c.id = s."categoryId"
      WHERE f."customerId" = $1
      ORDER BY f."createdAt" DESC
    `,
    [user.id]
  )

  const favorites = result.rows.map((row) => ({
    id: row.id,
    serviceId: row.serviceId,
    title: row.title,
    description: row.description,
    basePrice: row.basePrice,
    images: row.images,
    provider: { name: row.providerName },
    category: { id: row.categoryId, name: row.categoryName, slug: row.categorySlug },
  }))

  return c.json({ favorites })
})

app.post('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const serviceId = body.serviceId
    if (!serviceId) return c.json({ error: 'Service ID is required' }, 400)

    await query(
      'INSERT INTO "Favorite" (id, "customerId", "serviceId") VALUES ($1, $2, $3) ON CONFLICT ("customerId", "serviceId") DO NOTHING',
      [crypto.randomUUID(), user.id, serviceId]
    )

    return c.json({ success: true, message: 'Service added to favorites' })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to add favorite' }, 500)
  }
})

app.delete('/:serviceId', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const serviceId = c.req.param('serviceId')
  try {
    await query('DELETE FROM "Favorite" WHERE "customerId" = $1 AND "serviceId" = $2', [user.id, serviceId])
    return c.json({ success: true, message: 'Favorite removed' })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to remove favorite' }, 500)
  }
})

export default app

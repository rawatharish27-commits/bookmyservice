import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const categoryId = Number(c.req.query('categoryId') || c.req.query('category'))
    const search = String(c.req.query('search') || '').trim()
    const params: any[] = []
    let where = 'WHERE s."isActive" = true AND s."isApproved" = true'

    if (Number.isFinite(categoryId) && categoryId > 0) {
      params.push(categoryId)
      where += ` AND s."categoryId" = $${params.length}`
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      where += ` AND (LOWER(s.title) LIKE $${params.length} OR LOWER(s.description) LIKE $${params.length})`
    }

    const sql = `
      SELECT s.*, c.name AS "categoryName", u.name AS "providerName", u."profileImageUrl" AS "providerImage"
      FROM "Service" s
      JOIN "ServiceCategory" c ON c.id = s."categoryId"
      JOIN "User" u ON u.id = s."providerId"
      ${where}
      ORDER BY s."updatedAt" DESC
      LIMIT 75
    `

    const result = await query(sql, params)
    const services = result.rows.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      basePrice: item.basePrice,
      priceNegotiable: item.priceNegotiable,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      providerId: item.providerId,
      providerName: item.providerName,
      providerImage: item.providerImage,
      city: item.city,
      state: item.state,
      country: item.country,
      pincode: item.pincode,
      images: item.images ? JSON.parse(item.images) : [],
      averageRating: item.averageRating,
      totalBookings: item.totalBookings,
      totalReviews: item.totalReviews,
      isActive: item.isActive,
      isApproved: item.isApproved,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return c.json({ success: true, data: services })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load services' }, 500)
  }
})

app.get('/:id', async (c) => {
  const serviceId = c.req.param('id')
  if (!serviceId) return c.json({ error: 'Invalid service id' }, 400)

  try {
    const result = await query(
      `SELECT s.*, c.name AS "categoryName", u.name AS "providerName", u."profileImageUrl" AS "providerImage"
       FROM "Service" s
       JOIN "ServiceCategory" c ON c.id = s."categoryId"
       JOIN "User" u ON u.id = s."providerId"
       WHERE s.id = $1 AND s."isActive" = true AND s."isApproved" = true`,
      [serviceId]
    )

    const service = result.rows[0]
    if (!service) return c.json({ error: 'Service not found' }, 404)

    return c.json({
      success: true,
      data: {
        ...service,
        images: service.images ? JSON.parse(service.images) : [],
      },
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load service' }, 500)
  }
})

export default app

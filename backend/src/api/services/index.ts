import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

function distanceExpression(latParam: number, lngParam: number) {
  return `6371 * acos(
    LEAST(1, GREATEST(-1,
      cos(radians($${latParam})) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($${lngParam}))
      + sin(radians($${latParam})) * sin(radians(u.latitude))
    ))
  )`
}

function formatServiceRow(item: any) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    basePrice: item.basePrice,
    priceNegotiable: item.priceNegotiable,
    serviceDurationMinutes: item.serviceDurationMinutes,
    category: {
      id: item.categoryId,
      name: item.categoryName,
      slug: item.categorySlug || null,
    },
    provider: {
      id: item.providerId,
      name: item.providerName,
      profileImageUrl: item.providerImage,
      city: item.providerCity,
      state: item.providerState,
      country: item.providerCountry,
    },
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
    approvalStatus: item.approvalStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    distanceKm: item.distanceKm ?? null,
    providerName: item.providerName,
    providerImage: item.providerImage,
  }
}

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
      SELECT s.*, c.name AS "categoryName", c.slug AS "categorySlug", u.name AS "providerName", u."profileImageUrl" AS "providerImage",
             u.city AS "providerCity", u.state AS "providerState", u.country AS "providerCountry"
      FROM "Service" s
      JOIN "ServiceCategory" c ON c.id = s."categoryId"
      JOIN "User" u ON u.id = s."providerId"
      ${where}
      ORDER BY s."updatedAt" DESC
      LIMIT 75
    `

    const result = await query(sql, params)
    const services = result.rows.map(formatServiceRow)

    return c.json({ success: true, services })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load services' }, 500)
  }
})

app.get('/search', async (c) => {
  try {
    const q = String(c.req.query('q') || '').trim()
    const categoryId = Number(c.req.query('category'))
    const subcategoryId = Number(c.req.query('subcategory'))
    const city = String(c.req.query('city') || '').trim()
    const minPrice = Number(c.req.query('minPrice') || 0)
    const maxPrice = Number(c.req.query('maxPrice') || 0)
    const limit = Number(c.req.query('limit') || 30)
    const lat = Number(c.req.query('lat') ?? NaN)
    const lng = Number(c.req.query('lng') ?? NaN)

    const params: any[] = []
    let where = 'WHERE s."isActive" = true AND s."isApproved" = true'
    let selectDistance = ''
    let orderBy = 'ORDER BY s."updatedAt" DESC'

    if (Number.isFinite(categoryId) && categoryId > 0) {
      params.push(categoryId)
      where += ` AND s."categoryId" = $${params.length}`
    }
    if (Number.isFinite(subcategoryId) && subcategoryId > 0) {
      params.push(subcategoryId)
      where += ` AND s."subcategoryId" = $${params.length}`
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`)
      where += ` AND (LOWER(s.title) LIKE $${params.length} OR LOWER(s.description) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length})`
    }
    if (city) {
      params.push(city.toLowerCase())
      where += ` AND (LOWER(s.city) = $${params.length} OR LOWER(u.city) = $${params.length})`
    }
    if (minPrice > 0) {
      params.push(minPrice)
      where += ` AND s."basePrice" >= $${params.length}`
    }
    if (maxPrice > 0) {
      params.push(maxPrice)
      where += ` AND s."basePrice" <= $${params.length}`
    }
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      params.push(lat, lng)
      const distanceSql = distanceExpression(params.length - 1, params.length)
      selectDistance = `, ${distanceSql} AS "distanceKm"`
      where += ` AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND ${distanceSql} <= 20`
      orderBy = 'ORDER BY "distanceKm" ASC, s."updatedAt" DESC'
    }

    params.push(limit)
    const sql = `
      SELECT s.*, c.name AS "categoryName", c.slug AS "categorySlug", u.name AS "providerName", u."profileImageUrl" AS "providerImage",
             u.city AS "providerCity", u.state AS "providerState", u.country AS "providerCountry"
      ${selectDistance}
      FROM "Service" s
      JOIN "ServiceCategory" c ON c.id = s."categoryId"
      JOIN "User" u ON u.id = s."providerId"
      ${where}
      ${orderBy}
      LIMIT $${params.length}
    `

    const result = await query(sql, params)
    const services = result.rows.map(formatServiceRow)

    return c.json({ success: true, services })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to search services' }, 500)
  }
})

app.get('/nearby', async (c) => {
  try {
    const lat = Number(c.req.query('lat') ?? NaN)
    const lng = Number(c.req.query('lng') ?? NaN)
    const city = String(c.req.query('city') || '').trim()
    const pincode = String(c.req.query('pincode') || '').trim()

    const params: any[] = []
    let where = 'WHERE s."isActive" = true AND s."isApproved" = true AND u.status = $1'
    params.push('ACTIVE')
    let distanceSegment = ''

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      params.push(lat, lng)
      distanceSegment = distanceExpression(params.length - 1, params.length)
      where += ` AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND ${distanceSegment} <= 20`
    } else if (pincode) {
      params.push(pincode)
      where += ` AND u.pincode = $${params.length}`
    } else if (city) {
      params.push(city.toLowerCase())
      where += ` AND LOWER(u.city) = $${params.length}`
    } else {
      return c.json({
        success: true,
        availableCategories: [],
        providerCount: 0,
        serviceCount: 0,
        hasNearbyProviders: false,
      })
    }

    const categorySql = `
      SELECT c.id, c.name, c.slug, count(*) AS "serviceCount", count(DISTINCT u.id) AS "providerCount"
      ${distanceSegment ? `, min(${distanceSegment}) AS "minDistance"` : ''}
      FROM "Service" s
      JOIN "ServiceCategory" c ON c.id = s."categoryId"
      JOIN "User" u ON u.id = s."providerId"
      ${where}
      GROUP BY c.id, c.name, c.slug
      ORDER BY count(*) DESC
      LIMIT 12
    `

    const totalSql = `
      SELECT count(DISTINCT u.id) AS "providerCount", count(*) AS "serviceCount"
      FROM "Service" s
      JOIN "User" u ON u.id = s."providerId"
      ${where}
    `

    const [categoriesResult, totalsResult] = await Promise.all([
      query(categorySql, params),
      query(totalSql, params),
    ])

    const availableCategories = categoriesResult.rows.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      serviceCount: Number(item.serviceCount || 0),
      providerCount: Number(item.providerCount || 0),
      minDistanceKm: item.minDistance ? Number(item.minDistance.toFixed(1)) : undefined,
    }))

    const providerCount = Number(totalsResult.rows[0]?.providerCount || 0)
    const serviceCount = Number(totalsResult.rows[0]?.serviceCount || 0)

    let area = null
    if (pincode) {
      const areaResult = await query('SELECT name, city, pincode, active, providerCount, customerCount FROM "Area" WHERE pincode = $1 LIMIT 1', [pincode])
      area = areaResult.rows[0] || null
    } else if (city) {
      const areaResult = await query('SELECT name, city, pincode, active, providerCount, customerCount FROM "Area" WHERE LOWER(city) = $1 ORDER BY active DESC LIMIT 1', [city.toLowerCase()])
      area = areaResult.rows[0] || null
    }

    return c.json({
      success: true,
      availableCategories,
      providerCount,
      serviceCount,
      area,
      hasNearbyProviders: providerCount > 0,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to detect nearby availability' }, 500)
  }
})

app.get('/:id', async (c) => {
  const serviceId = c.req.param('id')
  if (!serviceId) return c.json({ error: 'Invalid service id' }, 400)

  try {
    const result = await query(
      `SELECT s.*, c.name AS "categoryName", c.slug AS "categorySlug", u.name AS "providerName", u."profileImageUrl" AS "providerImage",
              u.city AS "providerCity", u.state AS "providerState", u.country AS "providerCountry"
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
      ...formatServiceRow({
        ...service,
        categorySlug: service.categorySlug,
      }),
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load service' }, 500)
  }
})

export default app

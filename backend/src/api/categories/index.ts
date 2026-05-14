import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const result = await query<{
      id: number
      name: string
      slug: string
      description?: string
      icon?: string
      iconUrl?: string
      subcategoriesCount: number
      servicesCount: number
    }>(
      `
      SELECT c.id, c.name, c.slug, c.description, c.icon, c."iconUrl",
        COALESCE(sc.count, 0) AS "subcategoriesCount",
        COALESCE(svc.count, 0) AS "servicesCount"
      FROM "ServiceCategory" c
      LEFT JOIN (
        SELECT "categoryId", COUNT(*) AS count
        FROM "ServiceSubcategory"
        WHERE "isActive" = true
        GROUP BY "categoryId"
      ) sc ON sc."categoryId" = c.id
      LEFT JOIN (
        SELECT "categoryId", COUNT(*) AS count
        FROM "Service"
        WHERE "isActive" = true
        GROUP BY "categoryId"
      ) svc ON svc."categoryId" = c.id
      WHERE c."isActive" = true
      ORDER BY c."displayOrder" ASC
      `
    )

    const categories = result.rows.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      icon: item.icon,
      imageUrl: item.iconUrl || `/category-${item.slug}.svg`,
      subcategoriesCount: Number(item.subcategoriesCount),
      servicesCount: Number(item.servicesCount),
    }))

    return c.json(categories)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load categories' }, 500)
  }
})

app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!id) {
    return c.json({ error: 'Invalid category id' }, 400)
  }

  try {
    const categoryResult = await query<{
      id: number
      name: string
      slug: string
      description?: string
      icon?: string
      iconUrl?: string
    }>('SELECT id, name, slug, description, icon, "iconUrl" FROM "ServiceCategory" WHERE id = $1 AND "isActive" = true', [id])

    const category = categoryResult.rows[0]
    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }

    const subcategoriesResult = await query<{
      id: number
      name: string
      slug: string
      description?: string
    }>('SELECT id, name, slug, description FROM "ServiceSubcategory" WHERE "categoryId" = $1 AND "isActive" = true ORDER BY "displayOrder"', [id])

    const servicesCountResult = await query<{ count: number }>('SELECT COUNT(*) AS count FROM "Service" WHERE "categoryId" = $1 AND "isActive" = true', [id])

    return c.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.iconUrl || `/category-${category.slug}.svg`,
      icon: category.icon,
      subcategories: subcategoriesResult.rows,
      servicesCount: Number(servicesCountResult.rows[0]?.count || 0),
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load category details' }, 500)
  }
})

export default app
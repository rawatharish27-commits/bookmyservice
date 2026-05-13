import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

app.get('/platform', async (c) => {
  try {
    const result = await query<{
      totalVisitors: number
      totalUsers: number
      totalProviders: number
      totalServices: number
      totalBookings: number
      activeVisitors: number
      "updatedAt": string
    }>('SELECT * FROM "PlatformStats" WHERE id = 1')

    const row = result.rows[0] || {
      totalVisitors: 0,
      totalUsers: 0,
      totalProviders: 0,
      totalServices: 0,
      totalBookings: 0,
      activeVisitors: 0,
      updatedAt: new Date().toISOString(),
    }

    return c.json({
      activeVisitors: Number(row.activeVisitors),
      totalVisitors: Number(row.totalVisitors),
      totalUsers: Number(row.totalUsers),
      totalProviders: Number(row.totalProviders),
      totalServices: Number(row.totalServices),
      totalBookings: Number(row.totalBookings),
      timestamp: row.updatedAt || new Date().toISOString(),
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to fetch platform stats' }, 500)
  }
})

export default app

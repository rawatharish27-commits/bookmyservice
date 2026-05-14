import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

// GET /api/stats/platform - Returns platform statistics
app.get('/platform', async (c) => {
  try {
    // Count clients (roleId = 1, status != BLOCKED)
    const clientResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 1 AND status != \'BLOCKED\''
    )
    const clientCount = parseInt(clientResult.rows[0]?.count || '0', 10)

    // Count providers (roleId = 2, status = ACTIVE)
    const providerResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2 AND status = \'ACTIVE\''
    )
    const providerCount = parseInt(providerResult.rows[0]?.count || '0', 10)

    // Count active services
    const serviceResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "Service" WHERE "isActive" = true AND "approvalStatus" = \'APPROVED\''
    )
    const serviceCount = parseInt(serviceResult.rows[0]?.count || '0', 10)

    // Count total bookings
    const bookingResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "Booking"'
    )
    const bookingCount = parseInt(bookingResult.rows[0]?.count || '0', 10)

    // Count completed bookings
    const completedResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "Booking" WHERE status = \'COMPLETED\''
    )
    const completedCount = parseInt(completedResult.rows[0]?.count || '0', 10)

    // Count pending bookings
    const pendingResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "Booking" WHERE status = \'PENDING\''
    )
    const pendingCount = parseInt(pendingResult.rows[0]?.count || '0', 10)

    // Count active visitors (sessions active in last 5 minutes)
    const activeVisitorResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "VisitorSession" WHERE "isActive" = true AND "lastActive" >= NOW() - INTERVAL \'5 minutes\''
    )
    const activeVisitorCount = parseInt(activeVisitorResult.rows[0]?.count || '0', 10)

    // Count total visitors
    const totalVisitorResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "VisitorSession"'
    )
    const totalVisitorCount = parseInt(totalVisitorResult.rows[0]?.count || '0', 10)

    return c.json({
      totalClients: clientCount,
      totalProviders: providerCount,
      totalServices: serviceCount,
      totalBookings: bookingCount,
      completedBookings: completedCount,
      pendingBookings: pendingCount,
      activeVisitors: activeVisitorCount,
      totalVisitors: totalVisitorCount,
    })
  } catch (error) {
    console.error('Platform stats error:', error)
    return c.json({ error: 'Failed to fetch platform statistics' }, 500)
  }
})

// POST /api/stats/visitor - Track visitor session
app.post('/visitor', async (c) => {
  try {
    const body = await c.req.json()
    const { sessionId, page } = body

    if (!sessionId) {
      return c.json({ error: 'sessionId is required' }, 400)
    }

    const userAgent = c.req.header('User-Agent') || null
    const now = new Date().toISOString()

    // Check if session already exists
    const existing = await query<{ id: string }>(
      'SELECT id FROM "VisitorSession" WHERE "sessionId" = $1',
      [String(sessionId)]
    )

    if (existing.rows.length > 0) {
      // Update existing session
      await query(
        `UPDATE "VisitorSession" SET "lastActive" = NOW(), "isActive" = true, page = $1, "updatedAt" = NOW() WHERE "sessionId" = $2`,
        [page || null, String(sessionId)]
      )
    } else {
      // Create new session
      const id = `vs_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
      await query(
        `INSERT INTO "VisitorSession" (id, "sessionId", "userAgent", page, "isActive", "lastActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, true, NOW(), NOW(), NOW())`,
        [id, String(sessionId), userAgent, page || null]
      )
    }

    // Update PlatformStats table
    const totalVisitorsResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "VisitorSession"'
    )
    const activeVisitorsResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM "VisitorSession" WHERE "isActive" = true AND "lastActive" >= NOW() - INTERVAL \'5 minutes\''
    )

    const totalVisitors = parseInt(totalVisitorsResult.rows[0]?.count || '0', 10)
    const activeVisitors = parseInt(activeVisitorsResult.rows[0]?.count || '0', 10)

    // Upsert platform stats
    const statsRow = await query('SELECT id FROM "PlatformStats" WHERE id = 1')
    if (statsRow.rows.length > 0) {
      await query(
        `UPDATE "PlatformStats" SET "totalVisitors" = $1, "activeVisitors" = $2, "updatedAt" = NOW() WHERE id = 1`,
        [totalVisitors, activeVisitors]
      )
    } else {
      // Count other stats for initial row
      const totalUsersResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 1'
      )
      const totalProvidersResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2 AND status = \'ACTIVE\''
      )
      const totalBookingsResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM "Booking"'
      )
      const totalServicesResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM "Service" WHERE "isActive" = true AND "approvalStatus" = \'APPROVED\''
      )

      await query(
        `INSERT INTO "PlatformStats" (id, "totalVisitors", "totalUsers", "totalProviders", "totalBookings", "totalServices", "activeVisitors", "updatedAt")
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())`,
        [
          totalVisitors,
          parseInt(totalUsersResult.rows[0]?.count || '0', 10),
          parseInt(totalProvidersResult.rows[0]?.count || '0', 10),
          parseInt(totalBookingsResult.rows[0]?.count || '0', 10),
          parseInt(totalServicesResult.rows[0]?.count || '0', 10),
          activeVisitors,
        ]
      )
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Visitor tracking error:', error)
    return c.json({ error: 'Failed to track visitor' }, 500)
  }
})

export default app

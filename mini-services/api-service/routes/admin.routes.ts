// ─── routes/admin.routes.ts ────────────────────────────────────────────
// All /api/admin/* routes
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, requireAdmin, transformServiceRow } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'
import { logger, captureApiError } from '../lib/sentry'
import { listBackups, createBackup, getBackupStatus, getBackupDetails, deleteBackup, restoreBackup } from '../lib/backup'

const router = new Hono()

// GET /api/admin/users
router.get('/api/admin/users', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const role = c.req.query('role')
    const search = c.req.query('search')
    let query = 'SELECT u.id, u.email, u.name, u.phone, u.city, u."roleId", u.status, u."isVerified", u."emailVerified", u."phoneVerified", u."createdAt", r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (role) { query += ` AND r.name = $${idx}`; params.push(role); idx++ }
    if (search) { query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.phone ILIKE $${idx})`; params.push(`%${search}%`); idx++ }
    query += ` ORDER BY u."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    const countResult = await pool.query('SELECT COUNT(*) as total FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE 1=1' + (role ? ` AND r.name = $1` : ''), role ? [role] : [])
    return c.json({ users: result.rows, total: parseInt(countResult.rows[0]?.total || '0'), limit, offset })
  } catch (e) { console.error('Admin list users error:', e); return c.json({ error: 'Failed to list users' }, 500) }
})

// GET /api/admin/users/:id
router.get('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [id])
    if (!result.rows[0]) return c.json({ error: 'User not found' }, 404)
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ user: { ...profile, role: roleName } })
  } catch (e) { return c.json({ error: 'Failed to get user' }, 500) }
})

// PATCH /api/admin/users/:id
router.patch('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const body = await c.req.json()
    const fields = ['status', 'isVerified', 'emailVerified', 'phoneVerified', 'verifiedBadge']
    const updates = []; const values: any[] = []; let idx = 1
    for (const f of fields) { if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ } }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, 'UPDATE_USER', 'USER', id, JSON.stringify(body)])
    const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [id])
    const { passwordHash, roleName, ...profile } = result.rows[0]
    return c.json({ message: 'User updated', user: { ...profile, role: roleName } })
  } catch (e) { console.error('Admin update user error:', e); return c.json({ error: 'Failed to update user' }, 500) }
})

// DELETE /api/admin/users/:id
router.delete('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const id = c.req.param('id')
    await pool.query('DELETE FROM "User" WHERE id = $1', [id])
    return c.json({ message: 'User deleted' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// GET /api/admin/services
router.get('/api/admin/services', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT s.*, u.name as "providerName", sc.name as "categoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE 1=1'
    const params: any[] = []
    let idx = 1
    if (status === 'approved') { query += ' AND s."isApproved" = true' }
    else if (status === 'pending') { query += ' AND s."isApproved" = false' }
    query += ` ORDER BY s."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ services: result.rows.map(transformServiceRow), total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list services' }, 500) }
})

// PATCH /api/admin/services/:id
router.patch('/api/admin/services/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const { isApproved, rejectionReason, isActive } = await c.req.json()
    const updates = []; const values: any[] = []; let idx = 1
    if (isApproved !== undefined) { updates.push(`"isApproved" = $${idx}`); values.push(isApproved); idx++ }
    if (rejectionReason !== undefined) { updates.push(`"rejectionReason" = $${idx}`); values.push(rejectionReason); idx++ }
    if (isActive !== undefined) { updates.push(`"isActive" = $${idx}`); values.push(isActive); idx++ }
    if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
    updates.push('"updatedAt" = NOW()')
    values.push(id)
    await pool.query(`UPDATE "Service" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, isApproved ? 'APPROVE_SERVICE' : 'REJECT_SERVICE', 'SERVICE', id, JSON.stringify({ isApproved, rejectionReason })])
    return c.json({ message: `Service ${isApproved ? 'approved' : 'updated'}` })
  } catch (e) { return c.json({ error: 'Failed to update service' }, 500) }
})

// GET /api/admin/bookings
router.get('/api/admin/bookings', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE 1=1'
    const params: any[] = []; let idx = 1
    if (status) { query += ` AND b.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params)
    return c.json({ bookings: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list bookings' }, 500) }
})

// GET /api/admin/revenue
router.get('/api/admin/revenue', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const period = c.req.query('period') || 'month'
    let dateFilter = ''
    if (period === 'week') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '7 days'"
    else if (period === 'month') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '30 days'"
    else if (period === 'year') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '365 days'"
    const revenueResult = await pool.query(`SELECT COALESCE(SUM("finalPrice"), 0) as "totalRevenue", COUNT(*) as "totalBookings", COALESCE(SUM("couponDiscount"), 0) as "totalDiscounts" FROM "Booking" WHERE status = 'COMPLETED' ${dateFilter}`).catch(() => ({ rows: [{ totalRevenue: 0, totalBookings: 0, totalDiscounts: 0 }] }))
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM "Booking" GROUP BY status').catch(() => ({ rows: [] }))
    const byCategory = await pool.query("SELECT sc.name as category, COALESCE(SUM(b.\"finalPrice\"), 0) as revenue FROM \"Booking\" b JOIN \"Service\" s ON b.\"serviceId\" = s.id JOIN \"ServiceCategory\" sc ON s.\"categoryId\" = sc.id WHERE b.status = 'COMPLETED' GROUP BY sc.name ORDER BY revenue DESC").catch(() => ({ rows: [] }))
    return c.json({ revenue: revenueResult.rows[0], byStatus: byStatus.rows, byCategory: byCategory.rows, period })
  } catch (e) { return c.json({ error: 'Failed to get revenue stats' }, 500) }
})

// GET /api/admin/logs
router.get('/api/admin/logs', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT l.*, u.name as "adminName" FROM "AdminLog" l LEFT JOIN "User" u ON l."adminId" = u.id ORDER BY l."createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ logs: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to get logs' }, 500) }
})

// GET /api/admin/analytics
router.get('/api/admin/analytics', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const userCount = await pool.query('SELECT COUNT(*) as count FROM "User"').catch(() => ({ rows: [{ count: 0 }] }))
    const providerCount = await pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2').catch(() => ({ rows: [{ count: 0 }] }))
    const bookingCount = await pool.query('SELECT COUNT(*) as count FROM "Booking"').catch(() => ({ rows: [{ count: 0 }] }))
    const serviceCount = await pool.query('SELECT COUNT(*) as count FROM "Service" WHERE "isActive" = true').catch(() => ({ rows: [{ count: 0 }] }))
    const revenueTotal = await pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED'").catch(() => ({ rows: [{ total: 0 }] }))
    const recentSignups = await pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"createdAt\" >= NOW() - INTERVAL '30 days'").catch(() => ({ rows: [{ count: 0 }] }))
    const recentBookings = await pool.query("SELECT COUNT(*) as count FROM \"Booking\" WHERE \"createdAt\" >= NOW() - INTERVAL '30 days'").catch(() => ({ rows: [{ count: 0 }] }))
    const disputeCount = await pool.query("SELECT COUNT(*) as count FROM \"Dispute\" WHERE status = 'OPEN'").catch(() => ({ rows: [{ count: 0 }] }))
    const topCategories = await pool.query("SELECT sc.name, COUNT(b.id) as bookings, COALESCE(SUM(b.\"finalPrice\"), 0) as revenue FROM \"ServiceCategory\" sc LEFT JOIN \"Service\" s ON s.\"categoryId\" = sc.id LEFT JOIN \"Booking\" b ON b.\"serviceId\" = s.id AND b.status = 'COMPLETED' GROUP BY sc.name ORDER BY bookings DESC LIMIT 5").catch(() => ({ rows: [] }))
    const topCities = await pool.query("SELECT u.city, COUNT(b.id) as bookings FROM \"Booking\" b JOIN \"User\" u ON b.\"clientId\" = u.id WHERE u.city IS NOT NULL GROUP BY u.city ORDER BY bookings DESC LIMIT 5").catch(() => ({ rows: [] }))
    return c.json({
      analytics: {
        totalUsers: parseInt(userCount.rows[0]?.count || '0'), totalProviders: parseInt(providerCount.rows[0]?.count || '0'),
        totalBookings: parseInt(bookingCount.rows[0]?.count || '0'), totalServices: parseInt(serviceCount.rows[0]?.count || '0'),
        totalRevenue: parseFloat(revenueTotal.rows[0]?.total || '0'), recentSignups: parseInt(recentSignups.rows[0]?.count || '0'),
        recentBookings: parseInt(recentBookings.rows[0]?.count || '0'), openDisputes: parseInt(disputeCount.rows[0]?.count || '0'),
        topCategories: topCategories.rows, topCities: topCities.rows,
      }
    })
  } catch (e) { console.error('Admin analytics error:', e); return c.json({ error: 'Failed to get analytics' }, 500) }
})

// GET /api/admin/disputes
router.get('/api/admin/disputes', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT d.*, b."bookingNumber", u.name as "raisedByName", ua.name as "assignedToName" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id LEFT JOIN "User" u ON d."raisedBy" = u.id LEFT JOIN "User" ua ON d."assignedTo" = ua.id WHERE 1=1'
    const params: any[] = []; let idx = 1
    if (status) { query += ` AND d.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY d."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ disputes: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list disputes' }, 500) }
})

// PATCH /api/admin/disputes/:id
router.patch('/api/admin/disputes/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const { status, resolution, refundAmount } = await c.req.json()
    if (!status) return c.json({ error: 'status is required' }, 400)
    const updates = ['status = $1', '"assignedTo" = $2', '"resolvedAt" = NOW()', '"updatedAt" = NOW()']
    const values: any[] = [status, admin.id]; let idx = 3
    if (resolution) { updates.push(`resolution = $${idx}`); values.push(resolution); idx++ }
    if (refundAmount) { updates.push(`"refundAmount" = $${idx}`); values.push(refundAmount); idx++ }
    values.push(id)
    await pool.query(`UPDATE "Dispute" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, 'RESOLVE_DISPUTE', 'DISPUTE', id, JSON.stringify({ status, resolution, refundAmount })])
    return c.json({ message: 'Dispute updated' })
  } catch (e) { return c.json({ error: 'Failed to resolve dispute' }, 500) }
})

// GET /api/admin/payouts
router.get('/api/admin/payouts', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status')
    let query = 'SELECT p.*, u.name as "userName", u.email as "userEmail", u.phone as "userPhone" FROM "PayoutRequest" p LEFT JOIN "User" u ON p."userId" = u.id WHERE 1=1'
    const params: any[] = []; let idx = 1
    if (status) { query += ` AND p.status = $${idx}`; params.push(status); idx++ }
    query += ` ORDER BY p."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
    params.push(limit, offset)
    const result = await pool.query(query, params).catch(() => ({ rows: [] }))
    return c.json({ payouts: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list payouts' }, 500) }
})

// PATCH /api/admin/payouts/:id
router.patch('/api/admin/payouts/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id')
    const { status, transactionRef, remarks } = await c.req.json()
    if (!status) return c.json({ error: 'status is required' }, 400)
    const updates = ['status = $1', '"processedBy" = $2', '"processedAt" = NOW()', '"updatedAt" = NOW()']
    const values: any[] = [status, admin.id]; let idx = 3
    if (transactionRef) { updates.push(`"bankRef" = $${idx}`); values.push(transactionRef); idx++ }
    if (remarks) { updates.push(`"rejectionReason" = $${idx}`); values.push(remarks); idx++ }
    values.push(id)
    await pool.query(`UPDATE "PayoutRequest" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    if (status === 'REJECTED') {
      const payoutResult = await pool.query('SELECT * FROM "PayoutRequest" WHERE id = $1', [id]).catch(() => ({ rows: [] }))
      if (payoutResult.rows[0]) {
        await pool.query('UPDATE "Wallet" SET balance = balance + $1, "updatedAt" = NOW() WHERE "userId" = $2', [payoutResult.rows[0].amount, payoutResult.rows[0].userId])
      }
    }
    const logId = 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, admin.id, 'PROCESS_PAYOUT', 'PAYOUT', id, JSON.stringify({ status, transactionRef })])
    return c.json({ message: 'Payout processed' })
  } catch (e) { return c.json({ error: 'Failed to process payout' }, 500) }
})

// GET /api/admin/coupons
router.get('/api/admin/coupons', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT * FROM "Coupon" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ coupons: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list coupons' }, 500) }
})

// POST /api/admin/coupons
router.post('/api/admin/coupons', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const { code, discountType, discountValue, maxDiscount, minOrderAmount, usageLimit, validTo, isActive } = await c.req.json()
    if (!code || !discountType || !discountValue || !validTo) return c.json({ error: 'code, discountType, discountValue, and validTo are required' }, 400)
    const id = 'cpn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Coupon" (id, code, "discountType", "discountValue", "maxDiscount", "minOrderAmount", "usageLimit", "validTo", "isActive", "usageCount", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, NOW(), NOW())', [id, code, discountType, discountValue, maxDiscount || null, minOrderAmount || null, usageLimit || null, validTo, isActive !== false])
    return c.json({ message: 'Coupon created', coupon: { id, code, discountType, discountValue } }, 201)
  } catch (e) { console.error('Create coupon error:', e); return c.json({ error: 'Failed to create coupon' }, 500) }
})

// GET /api/admin/franchises
router.get('/api/admin/franchises', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT f.*, u.name as "ownerName", u.email as "ownerEmail", u.phone as "ownerPhone" FROM "Franchise" f LEFT JOIN "User" u ON f."ownerId" = u.id ORDER BY f."createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ franchises: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list franchises' }, 500) }
})

// GET /api/admin/inventory
router.get('/api/admin/inventory', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT * FROM "InventoryItem" ORDER BY name').catch(() => ({ rows: [] }))
    return c.json({ inventory: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list inventory' }, 500) }
})

// GET /api/admin/amc
router.get('/api/admin/amc', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const plans = await pool.query('SELECT * FROM "AMCPlan" ORDER BY price').catch(() => ({ rows: [] }))
    const subscriptions = await pool.query('SELECT s.*, u.name as "userName", p.name as "planName" FROM "AMCSubscription" s LEFT JOIN "User" u ON s."clientId" = u.id LEFT JOIN "AMCPlan" p ON s."planId" = p.id ORDER BY s."createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ plans: plans.rows, subscriptions: subscriptions.rows })
  } catch (e) { return c.json({ error: 'Failed to list AMC data' }, 500) }
})

// GET /api/admin/b2b
router.get('/api/admin/b2b', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await pool.query('SELECT b.*, u.name as "contactName", u.email as "contactEmail" FROM "B2BContract" b LEFT JOIN "User" u ON b."clientId" = u.id ORDER BY b."createdAt" DESC').catch(() => ({ rows: [] }))
    return c.json({ contracts: result.rows, total: result.rows.length })
  } catch (e) { return c.json({ error: 'Failed to list B2B contracts' }, 500) }
})

// GET /api/admin/crm
router.get('/api/admin/crm', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const result = await pool.query('SELECT c.*, u.name as "userName" FROM "CRMActivity" c LEFT JOIN "User" u ON c."userId" = u.id ORDER BY c."createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
    return c.json({ activities: result.rows, total: result.rows.length, limit, offset })
  } catch (e) { return c.json({ error: 'Failed to list CRM activities' }, 500) }
})

// GET /api/admin/dashboard - Comprehensive metrics
router.get('/api/admin/dashboard', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const [usersTotal, usersClients, usersProviders, usersTechnicians, usersVendors, usersNewToday, usersActiveThisWeek, usersSuspended] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM "User"').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 1').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 4').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 5').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "createdAt" >= CURRENT_DATE').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"lastLoginAt\" >= NOW() - INTERVAL '7 days'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE status = 'SUSPENDED'").catch(() => ({ rows: [{ count: 0 }] })),
    ])
    const [bookingsTotal, bookingsToday, bookingsPending, bookingsCompleted, bookingsCancelled, bookingsEmergency, bookingsSuccessRate, bookingsAvgValue] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM "Booking"').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "Booking" WHERE "createdAt" >= CURRENT_DATE').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Booking\" WHERE status = 'PENDING'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Booking\" WHERE status = 'COMPLETED'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Booking\" WHERE status = 'CANCELLED'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(b.id) as count FROM \"Booking\" b JOIN \"Service\" s ON b.\"serviceId\" = s.id WHERE s.\"isEmergencyAvailable\" = true").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COALESCE(COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as rate FROM \"Booking\" WHERE status IN ('COMPLETED', 'CANCELLED')").catch(() => ({ rows: [{ rate: 0 }] })),
      pool.query("SELECT COALESCE(AVG(\"finalPrice\"), 0) as avg FROM \"Booking\" WHERE status = 'COMPLETED'").catch(() => ({ rows: [{ avg: 0 }] })),
    ])
    const [revenueTotal, revenueToday, revenueThisWeek, revenueThisMonth, commissionEarned, pendingPayouts, escrowHeld, refunds] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED'").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED' AND \"completedAt\" >= CURRENT_DATE").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED' AND \"completedAt\" >= NOW() - INTERVAL '7 days'").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED' AND \"completedAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"platformFee\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED'").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM \"PayoutRequest\" WHERE status = 'PENDING'").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE \"paymentStatus\" = 'ESCROW' AND status NOT IN ('COMPLETED', 'CANCELLED')").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"refundAmount\"), 0) as total FROM \"Dispute\" WHERE \"refundAmount\" IS NOT NULL AND \"refundAmount\" > 0").catch(() => ({ rows: [{ total: 0 }] })),
    ])
    const [servicesTotal, servicesActive, servicesPendingApproval, servicesAvgRating] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM "Service"').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "Service" WHERE "isActive" = true AND "isApproved" = true').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "Service" WHERE "isApproved" = false').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COALESCE(AVG("averageRating"), 0) as avg FROM "Service" WHERE "isActive" = true AND "isApproved" = true').catch(() => ({ rows: [{ avg: 0 }] })),
    ])
    const [disputesActive, disputesResolved, disputesOpen] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM \"Dispute\" WHERE status IN ('OPEN', 'IN_PROGRESS')").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Dispute\" WHERE status = 'RESOLVED'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Dispute\" WHERE status = 'OPEN'").catch(() => ({ rows: [{ count: 0 }] })),
    ])
    const [kycPending, kycApproved, kycRejected] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM \"ProviderKyc\" WHERE \"verificationStatus\" = 'PENDING'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"ProviderKyc\" WHERE \"verificationStatus\" = 'APPROVED'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"ProviderKyc\" WHERE \"verificationStatus\" = 'REJECTED'").catch(() => ({ rows: [{ count: 0 }] })),
    ])
    const [recentBookings, recentUsers] = await Promise.all([
      pool.query('SELECT b.id, b."bookingNumber", b.status, b."finalPrice", b."scheduledDate", b."createdAt", u.name as "clientName", p.name as "providerName", s.title as "serviceName" FROM "Booking" b LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id LEFT JOIN "Service" s ON b."serviceId" = s.id ORDER BY b."createdAt" DESC LIMIT 5').catch(() => ({ rows: [] })),
      pool.query('SELECT u.id, u.name, u.email, u.phone, u.city, u.status, u."createdAt", r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" ORDER BY u."createdAt" DESC LIMIT 5').catch(() => ({ rows: [] })),
    ])
    return c.json({
      users: { total: parseInt(usersTotal.rows[0].count), clients: parseInt(usersClients.rows[0].count), providers: parseInt(usersProviders.rows[0].count), technicians: parseInt(usersTechnicians.rows[0].count), vendors: parseInt(usersVendors.rows[0].count), newToday: parseInt(usersNewToday.rows[0].count), activeThisWeek: parseInt(usersActiveThisWeek.rows[0].count), suspended: parseInt(usersSuspended.rows[0].count) },
      bookings: { total: parseInt(bookingsTotal.rows[0].count), today: parseInt(bookingsToday.rows[0].count), pending: parseInt(bookingsPending.rows[0].count), completed: parseInt(bookingsCompleted.rows[0].count), cancelled: parseInt(bookingsCancelled.rows[0].count), emergency: parseInt(bookingsEmergency.rows[0].count), successRate: parseFloat(Number(bookingsSuccessRate.rows[0].rate).toFixed(2)), avgValue: parseFloat(Number(bookingsAvgValue.rows[0].avg).toFixed(2)) },
      revenue: { total: parseFloat(Number(revenueTotal.rows[0].total).toFixed(2)), today: parseFloat(Number(revenueToday.rows[0].total).toFixed(2)), thisWeek: parseFloat(Number(revenueThisWeek.rows[0].total).toFixed(2)), thisMonth: parseFloat(Number(revenueThisMonth.rows[0].total).toFixed(2)), commissionEarned: parseFloat(Number(commissionEarned.rows[0].total).toFixed(2)), pendingPayouts: parseFloat(Number(pendingPayouts.rows[0].total).toFixed(2)), escrowHeld: parseFloat(Number(escrowHeld.rows[0].total).toFixed(2)), refunds: parseFloat(Number(refunds.rows[0].total).toFixed(2)) },
      services: { total: parseInt(servicesTotal.rows[0].count), active: parseInt(servicesActive.rows[0].count), pendingApproval: parseInt(servicesPendingApproval.rows[0].count), avgRating: parseFloat(Number(servicesAvgRating.rows[0].avg).toFixed(2)) },
      disputes: { active: parseInt(disputesActive.rows[0].count), resolved: parseInt(disputesResolved.rows[0].count), open: parseInt(disputesOpen.rows[0].count) },
      kyc: { pending: parseInt(kycPending.rows[0].count), approved: parseInt(kycApproved.rows[0].count), rejected: parseInt(kycRejected.rows[0].count) },
      recentBookings: recentBookings.rows, recentUsers: recentUsers.rows,
    })
  } catch (e) {
    console.error('Admin dashboard error:', e)
    return c.json({ users: { total: 0, clients: 0, providers: 0, technicians: 0, vendors: 0, newToday: 0, activeThisWeek: 0, suspended: 0 }, bookings: { total: 0, today: 0, pending: 0, completed: 0, cancelled: 0, emergency: 0, successRate: 0, avgValue: 0 }, revenue: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, commissionEarned: 0, pendingPayouts: 0, escrowHeld: 0, refunds: 0 }, services: { total: 0, active: 0, pendingApproval: 0, avgRating: 0 }, disputes: { active: 0, resolved: 0, open: 0 }, kyc: { pending: 0, approved: 0, rejected: 0 }, recentBookings: [], recentUsers: [] })
  }
})

// ═══ ADMIN FAQ ════════════════════════════════════════════════════════

router.get('/api/admin/faq', async (c) => { try { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); const result = await pool.query('SELECT * FROM "Faq" ORDER BY "displayOrder"').catch(() => ({ rows: [] })); return c.json({ faqs: result.rows, total: result.rows.length }) } catch (e) { return c.json({ faqs: [], total: 0 }) } })
router.post('/api/admin/faq', async (c) => { try { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); const body = await c.req.json(); await pool.query('INSERT INTO "Faq" (question, answer, category, "isActive", "displayOrder") VALUES ($1, $2, $3, $4, $5)', [body.question, body.answer, body.category || 'GENERAL', body.isActive !== false, body.displayOrder || 0]); return c.json({ message: 'FAQ created' }, 201) } catch (e) { return c.json({ error: 'Failed' }, 500) } })
router.patch('/api/admin/faq/:id', async (c) => { try { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); const id = c.req.param('id'); const body = await c.req.json(); const fields = ['question', 'answer', 'category', 'isActive', 'displayOrder']; const updates = []; const values = []; let idx = 1; for (const f of fields) { if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ } } if (updates.length === 0) return c.json({ error: 'No fields' }, 400); updates.push('"updatedAt" = NOW()'); values.push(id); await pool.query(`UPDATE "Faq" SET ${updates.join(', ')} WHERE id = $${idx}`, values); return c.json({ message: 'FAQ updated' }) } catch (e) { return c.json({ error: 'Failed' }, 500) } })
router.delete('/api/admin/faq/:id', async (c) => { try { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); const id = c.req.param('id'); await pool.query('DELETE FROM "Faq" WHERE id = $1', [id]); return c.json({ message: 'FAQ deleted' }) } catch (e) { return c.json({ error: 'Failed' }, 500) } })

// ═══ ADMIN CATEGORIES ══════════════════════════════════════════════════

router.post('/api/admin/categories', async (c) => {
  try {
    const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const body = await c.req.json()
    const id = body.id || 'cat_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "imageUrl", "isActive", "displayOrder", "isEmergency") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4, icon = $5, "updatedAt" = NOW()', [id, body.name, body.slug || body.name?.toLowerCase().replace(/\s+/g, '-'), body.description || '', body.icon || 'Wrench', body.imageUrl || '/images/default.jpg', body.isActive !== false, body.displayOrder || 0, body.isEmergency || false])
    await redis.delByPattern('cache:categories:*').catch(() => {})
    return c.json({ message: 'Category saved', id }, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

router.patch('/api/admin/categories/:id', async (c) => {
  try {
    const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const id = c.req.param('id'); const body = await c.req.json()
    const fields = ['name', 'slug', 'description', 'icon', 'imageUrl', 'isActive', 'displayOrder', 'isEmergency']
    const updates = []; const values = []; let idx = 1
    for (const f of fields) { if (body[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(body[f]); idx++ } }
    if (updates.length === 0) return c.json({ error: 'No fields' }, 400)
    updates.push('"updatedAt" = NOW()'); values.push(id)
    await pool.query(`UPDATE "ServiceCategory" SET ${updates.join(', ')} WHERE id::text = $${idx}`, values)
    return c.json({ message: 'Category updated' })
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ ADMIN ANALYTICS DASHBOARD ════════════════════════════════════════

router.get('/api/admin/analytics/dashboard', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const cacheKey = 'cache:admin:analytics:dashboard'
    const cached = await redis.getJson(cacheKey)
    if (cached) return c.json(cached)

    const [totalRevenueResult, totalBookingsResult, activeUsersResult, activeProvidersResult, totalFranchisesResult, cancellationRateResult, currentMonthRevenueResult, previousMonthRevenueResult, currentMonthBookingsResult, previousMonthBookingsResult, currentMonthUsersResult, previousMonthUsersResult, currentMonthProvidersResult, previousMonthProvidersResult, currentMonthFranchisesResult, previousMonthFranchisesResult, currentMonthCancellationsResult, previousMonthCancellationsResult] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED'").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM "Booking"').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"lastLoginAt\" >= NOW() - INTERVAL '30 days'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"roleId\" = 2 AND status = 'ACTIVE'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Franchise\" WHERE status = 'ACTIVE'").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COALESCE(COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as rate FROM \"Booking\"").catch(() => ({ rows: [{ rate: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED' AND \"completedAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COALESCE(SUM(\"finalPrice\"), 0) as total FROM \"Booking\" WHERE status = 'COMPLETED' AND \"completedAt\" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND \"completedAt\" < DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ total: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Booking\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Booking\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND \"createdAt\" < DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND \"createdAt\" < DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"roleId\" = 2 AND \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"User\" WHERE \"roleId\" = 2 AND \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND \"createdAt\" < DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Franchise\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM \"Franchise\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND \"createdAt\" < DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COALESCE(COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as rate FROM \"Booking\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ rate: 0 }] })),
      pool.query("SELECT COALESCE(COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as rate FROM \"Booking\" WHERE \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND \"createdAt\" < DATE_TRUNC('month', CURRENT_DATE)").catch(() => ({ rows: [{ rate: 0 }] })),
    ])

    const calcGrowth = (current: number, previous: number): number => { if (previous === 0) return current > 0 ? 100 : 0; return parseFloat((((current - previous) / previous) * 100).toFixed(1)) }

    const stats = {
      totalRevenue: parseFloat(Number(totalRevenueResult.rows[0].total).toFixed(2)),
      totalBookings: parseInt(String(totalBookingsResult.rows[0].count || 0)),
      activeUsers: parseInt(String(activeUsersResult.rows[0].count || 0)),
      activeProviders: parseInt(String(activeProvidersResult.rows[0].count || 0)),
      totalFranchises: parseInt(String(totalFranchisesResult.rows[0].count || 0)),
      cancellationRate: parseFloat(Number(cancellationRateResult.rows[0].rate || 0).toFixed(1)),
      revenueGrowth: calcGrowth(parseFloat(Number(currentMonthRevenueResult.rows[0].total).toFixed(2)), parseFloat(Number(previousMonthRevenueResult.rows[0].total).toFixed(2))),
      bookingGrowth: calcGrowth(parseInt(String(currentMonthBookingsResult.rows[0].count || 0)), parseInt(String(previousMonthBookingsResult.rows[0].count || 0))),
      userGrowth: calcGrowth(parseInt(String(currentMonthUsersResult.rows[0].count || 0)), parseInt(String(previousMonthUsersResult.rows[0].count || 0))),
      providerGrowth: calcGrowth(parseInt(String(currentMonthProvidersResult.rows[0].count || 0)), parseInt(String(previousMonthProvidersResult.rows[0].count || 0))),
      franchiseGrowth: calcGrowth(parseInt(String(currentMonthFranchisesResult.rows[0].count || 0)), parseInt(String(previousMonthFranchisesResult.rows[0].count || 0))),
      cancellationRateChange: parseFloat((parseFloat(Number(currentMonthCancellationsResult.rows[0].rate || 0).toFixed(1)) - parseFloat(Number(previousMonthCancellationsResult.rows[0].rate || 0).toFixed(1))).toFixed(1)),
    }

    const monthlyRevenueResult = await pool.query("SELECT TO_CHAR(\"completedAt\", 'YYYY-MM') as month, COALESCE(SUM(\"finalPrice\"), 0) as revenue FROM \"Booking\" WHERE status = 'COMPLETED' AND \"completedAt\" >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month ASC").catch(() => ({ rows: [] }))
    const monthlyRevenue = monthlyRevenueResult.rows.map((r: any) => ({ month: r.month, revenue: parseFloat(Number(r.revenue).toFixed(2)) }))

    const topCategoriesResult = await pool.query("SELECT sc.id::text, sc.name, COUNT(b.id) as bookings, COALESCE(SUM(b.\"finalPrice\"), 0) as revenue FROM \"ServiceCategory\" sc LEFT JOIN \"Service\" s ON s.\"categoryId\" = sc.id LEFT JOIN \"Booking\" b ON b.\"serviceId\" = s.id AND b.status = 'COMPLETED' GROUP BY sc.id, sc.name ORDER BY bookings DESC LIMIT 5").catch(() => ({ rows: [] }))
    const topCategories = topCategoriesResult.rows.map((r: any) => ({ id: r.id, name: r.name, bookings: parseInt(String(r.bookings || 0)), revenue: parseFloat(Number(r.revenue || 0).toFixed(2)) }))

    const topCitiesResult = await pool.query("SELECT COALESCE(b.\"serviceCity\", u.city) as city, COUNT(b.id) as bookings, COALESCE(SUM(b.\"finalPrice\"), 0) as revenue FROM \"Booking\" b LEFT JOIN \"User\" u ON b.\"clientId\" = u.id WHERE b.status = 'COMPLETED' AND (b.\"serviceCity\" IS NOT NULL OR u.city IS NOT NULL) GROUP BY city ORDER BY bookings DESC LIMIT 5").catch(() => ({ rows: [] }))
    const topCities = topCitiesResult.rows.map((r: any) => ({ city: r.city, bookings: parseInt(String(r.bookings || 0)), revenue: parseFloat(Number(r.revenue || 0).toFixed(2)) }))

    const topServicesResult = await pool.query("SELECT s.id, s.title, COUNT(b.id) as bookings, COALESCE(SUM(b.\"finalPrice\"), 0) as revenue, sc.name as category FROM \"Service\" s LEFT JOIN \"Booking\" b ON b.\"serviceId\" = s.id AND b.status = 'COMPLETED' LEFT JOIN \"ServiceCategory\" sc ON s.\"categoryId\" = sc.id GROUP BY s.id, s.title, sc.name ORDER BY bookings DESC LIMIT 5").catch(() => ({ rows: [] }))
    const topServices = topServicesResult.rows.map((r: any) => ({ id: r.id, title: r.title, bookings: parseInt(String(r.bookings || 0)), revenue: parseFloat(Number(r.revenue || 0).toFixed(2)), category: r.category || 'Uncategorized' }))

    const recentBookingsResult = await pool.query('SELECT b.id, b."bookingNumber", b.status, b."finalPrice", b."createdAt", u.id as "clientId", u.name as "clientName", s.id as "serviceId", s.title as "serviceTitle" FROM "Booking" b LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "Service" s ON b."serviceId" = s.id ORDER BY b."createdAt" DESC LIMIT 5').catch(() => ({ rows: [] }))
    const recentBookings = recentBookingsResult.rows.map((r: any) => ({ id: r.id, bookingNumber: r.bookingNumber, client: { id: r.clientId, name: r.clientName }, service: { id: r.serviceId, title: r.serviceTitle }, status: r.status, finalPrice: parseFloat(Number(r.finalPrice || 0).toFixed(2)), createdAt: r.createdAt }))

    const data = { stats, monthlyRevenue, topCategories, topCities, topServices, recentBookings }
    redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})
    return c.json(data)
  } catch (e) { console.error('Analytics dashboard error:', e); return c.json({ error: 'Failed to get analytics dashboard data' }, 500) }
})

// ═══ ADMIN BACKUPS ════════════════════════════════════════════════════

router.get('/api/admin/backups', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const limit = parseInt(c.req.query('limit') || '30'); const backups = await listBackups(pool, limit); return c.json({ backups, total: backups.length }) } catch (e) { console.error('List backups error:', e); return c.json({ error: 'Failed to list backups' }, 500) } })
router.post('/api/admin/backups', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const record = await createBackup(pool); return c.json({ message: 'Backup created', backup: record }, 201) } catch (e) { console.error('Create backup error:', e); return c.json({ error: 'Failed to create backup', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) } })
router.get('/api/admin/backups/status', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const status = await getBackupStatus(pool); return c.json(status) } catch (e) { console.error('Backup status error:', e); return c.json({ error: 'Failed to get backup status' }, 500) } })
router.get('/api/admin/backups/:id', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const backupId = c.req.param('id'); const includeData = c.req.query('includeData') === 'true'; const details = await getBackupDetails(pool, backupId, includeData); if (!details) return c.json({ error: 'Backup not found' }, 404); return c.json(details) } catch (e) { console.error('Backup details error:', e); return c.json({ error: 'Failed to get backup details' }, 500) } })
router.delete('/api/admin/backups/:id', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const backupId = c.req.param('id'); const deleted = await deleteBackup(pool, backupId); if (!deleted) return c.json({ error: 'Backup not found' }, 404); return c.json({ message: 'Backup deleted', id: backupId }) } catch (e) { console.error('Delete backup error:', e); return c.json({ error: 'Failed to delete backup' }, 500) } })
router.post('/api/admin/backups/:id/restore', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const backupId = c.req.param('id'); const body = await c.req.json().catch(() => ({})); if (!body.confirm || body.confirm !== 'RESTORE') { return c.json({ error: 'Restoring a backup is DANGEROUS and will overwrite current data. Send { confirm: "RESTORE" } in the request body to proceed.' }, 400) } const result = await restoreBackup(pool, backupId); return c.json({ message: 'Backup restored', ...result }) } catch (e) { console.error('Restore backup error:', e); return c.json({ error: 'Failed to restore backup', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) } })

export default router

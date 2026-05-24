// ─── services/admin.service.ts ──────────────────────────────────────────
// Pure business logic extracted from routes/admin.routes.ts
// All functions accept dependencies as parameters and return data objects
// (not HTTP responses). HTTP concerns remain in the route file.
// ─────────────────────────────────────────────────────────────────────

import { Pool } from 'pg'
import { redis, CacheTTL } from '../lib/redis'
import { logger } from '../lib/logger'
import { transformServiceRow } from '../lib/shared'

// ─── Types ─────────────────────────────────────────────────────────────

export interface ListUsersFilters {
  role?: string
  search?: string
  limit: number
  offset: number
}

export interface ListAdminServicesFilters {
  status?: string
  limit: number
  offset: number
}

export interface ListAdminBookingsFilters {
  status?: string
  limit: number
  offset: number
}

export interface ListAdminDisputesFilters {
  status?: string
  limit: number
  offset: number
}

export interface ListAdminPayoutsFilters {
  status?: string
  limit: number
  offset: number
}

export interface CreateCouponData {
  code: string
  discountType: string
  discountValue: number
  maxDiscount?: number | null
  minOrderAmount?: number | null
  usageLimit?: number | null
  validTo: string
  isActive?: boolean
}

export interface UpdateDisputeData {
  status: string
  resolution?: string
  refundAmount?: number
}

export interface ProcessPayoutData {
  status: string
  transactionRef?: string
  remarks?: string
}

export interface UpdateServiceData {
  isApproved?: boolean
  rejectionReason?: string
  isActive?: boolean
}

// ─── Helper: generate a log ID ─────────────────────────────────────────

function generateLogId(): string {
  return 'log_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
}

// ─── Users ─────────────────────────────────────────────────────────────

export async function listUsers(pool: Pool, filters: ListUsersFilters) {
  let query = 'SELECT u.id, u.email, u.name, u.phone, u.city, u."roleId", u.status, u."isVerified", u."emailVerified", u."phoneVerified", u."createdAt", r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE 1=1'
  const params: any[] = []
  let idx = 1
  if (filters.role) { query += ` AND r.name = $${idx}`; params.push(filters.role); idx++ }
  if (filters.search) { query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.phone ILIKE $${idx})`; params.push(`%${filters.search}%`); idx++ }
  query += ` ORDER BY u."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(filters.limit, filters.offset)
  const result = await pool.query(query, params)
  const countResult = await pool.query('SELECT COUNT(*) as total FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE 1=1' + (filters.role ? ` AND r.name = $1` : ''), filters.role ? [filters.role] : [])
  return { users: result.rows, total: parseInt(countResult.rows[0]?.total || '0'), limit: filters.limit, offset: filters.offset }
}

export async function getUser(pool: Pool, userId: string) {
  const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
  if (!result.rows[0]) return null
  const { passwordHash, roleName, ...profile } = result.rows[0]
  return { ...profile, role: roleName }
}

export async function updateUser(pool: Pool, adminId: string, userId: string, fields: Record<string, any>) {
  const allowedFields = ['status', 'isVerified', 'emailVerified', 'phoneVerified', 'verifiedBadge']
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of allowedFields) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { error: 'No fields to update' }
  updates.push('"updatedAt" = NOW()')
  values.push(userId)
  await pool.query(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  const logId = generateLogId()
  await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, adminId, 'UPDATE_USER', 'USER', userId, JSON.stringify(fields)])
  const result = await pool.query('SELECT u.*, r.name as "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.id = $1', [userId])
  const { passwordHash, roleName, ...profile } = result.rows[0]
  return { message: 'User updated', user: { ...profile, role: roleName } }
}

export async function deleteUser(pool: Pool, userId: string) {
  await pool.query('DELETE FROM "User" WHERE id = $1', [userId])
  return { message: 'User deleted' }
}

// ─── Services ──────────────────────────────────────────────────────────

export async function listAdminServices(pool: Pool, filters: ListAdminServicesFilters) {
  let query = 'SELECT s.*, u.name as "providerName", sc.name as "categoryName" FROM "Service" s LEFT JOIN "User" u ON s."providerId" = u.id LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id WHERE 1=1'
  const params: any[] = []
  let idx = 1
  if (filters.status === 'approved') { query += ' AND s."isApproved" = true' }
  else if (filters.status === 'pending') { query += ' AND s."isApproved" = false' }
  query += ` ORDER BY s."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(filters.limit, filters.offset)
  const result = await pool.query(query, params)
  return { services: result.rows.map(transformServiceRow), total: result.rows.length, limit: filters.limit, offset: filters.offset }
}

export async function updateService(pool: Pool, adminId: string, serviceId: string, data: UpdateServiceData) {
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  if (data.isApproved !== undefined) { updates.push(`"isApproved" = $${idx}`); values.push(data.isApproved); idx++ }
  if (data.rejectionReason !== undefined) { updates.push(`"rejectionReason" = $${idx}`); values.push(data.rejectionReason); idx++ }
  if (data.isActive !== undefined) { updates.push(`"isActive" = $${idx}`); values.push(data.isActive); idx++ }
  if (updates.length === 0) return { error: 'No fields to update' }
  updates.push('"updatedAt" = NOW()')
  values.push(serviceId)
  await pool.query(`UPDATE "Service" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  const logId = generateLogId()
  await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, adminId, data.isApproved ? 'APPROVE_SERVICE' : 'REJECT_SERVICE', 'SERVICE', serviceId, JSON.stringify({ isApproved: data.isApproved, rejectionReason: data.rejectionReason })])
  return { message: `Service ${data.isApproved ? 'approved' : 'updated'}` }
}

// ─── Bookings ──────────────────────────────────────────────────────────

export async function listAdminBookings(pool: Pool, filters: ListAdminBookingsFilters) {
  let query = 'SELECT b.*, s.title as "serviceName", u.name as "clientName", p.name as "providerName" FROM "Booking" b LEFT JOIN "Service" s ON b."serviceId" = s.id LEFT JOIN "User" u ON b."clientId" = u.id LEFT JOIN "User" p ON b."providerId" = p.id WHERE 1=1'
  const params: any[] = []
  let idx = 1
  if (filters.status) { query += ` AND b.status = $${idx}`; params.push(filters.status); idx++ }
  query += ` ORDER BY b."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(filters.limit, filters.offset)
  const result = await pool.query(query, params)
  return { bookings: result.rows, total: result.rows.length, limit: filters.limit, offset: filters.offset }
}

// ─── Revenue ───────────────────────────────────────────────────────────

export async function getRevenue(pool: Pool, period: string) {
  let dateFilter = ''
  if (period === 'week') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '7 days'"
  else if (period === 'month') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '30 days'"
  else if (period === 'year') dateFilter = "AND \"completedAt\" >= NOW() - INTERVAL '365 days'"
  const revenueResult = await pool.query(`SELECT COALESCE(SUM("finalPrice"), 0) as "totalRevenue", COUNT(*) as "totalBookings", COALESCE(SUM("couponDiscount"), 0) as "totalDiscounts" FROM "Booking" WHERE status = 'COMPLETED' ${dateFilter}`).catch(() => ({ rows: [{ totalRevenue: 0, totalBookings: 0, totalDiscounts: 0 }] }))
  const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM "Booking" GROUP BY status').catch(() => ({ rows: [] }))
  const byCategory = await pool.query("SELECT sc.name as category, COALESCE(SUM(b.\"finalPrice\"), 0) as revenue FROM \"Booking\" b JOIN \"Service\" s ON b.\"serviceId\" = s.id JOIN \"ServiceCategory\" sc ON s.\"categoryId\" = sc.id WHERE b.status = 'COMPLETED' GROUP BY sc.name ORDER BY revenue DESC").catch(() => ({ rows: [] }))
  return { revenue: revenueResult.rows[0], byStatus: byStatus.rows, byCategory: byCategory.rows, period }
}

// ─── Logs ──────────────────────────────────────────────────────────────

export async function getAdminLogs(pool: Pool, limit: number, offset: number) {
  const result = await pool.query('SELECT l.*, u.name as "adminName" FROM "AdminLog" l LEFT JOIN "User" u ON l."adminId" = u.id ORDER BY l."createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
  return { logs: result.rows, total: result.rows.length, limit, offset }
}

// ─── Analytics ─────────────────────────────────────────────────────────

export async function getAnalytics(pool: Pool) {
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
  return {
    analytics: {
      totalUsers: parseInt(userCount.rows[0]?.count || '0'),
      totalProviders: parseInt(providerCount.rows[0]?.count || '0'),
      totalBookings: parseInt(bookingCount.rows[0]?.count || '0'),
      totalServices: parseInt(serviceCount.rows[0]?.count || '0'),
      totalRevenue: parseFloat(revenueTotal.rows[0]?.total || '0'),
      recentSignups: parseInt(recentSignups.rows[0]?.count || '0'),
      recentBookings: parseInt(recentBookings.rows[0]?.count || '0'),
      openDisputes: parseInt(disputeCount.rows[0]?.count || '0'),
      topCategories: topCategories.rows,
      topCities: topCities.rows,
    }
  }
}

// ─── Disputes ──────────────────────────────────────────────────────────

export async function listAdminDisputes(pool: Pool, filters: ListAdminDisputesFilters) {
  let query = 'SELECT d.*, b."bookingNumber", u.name as "raisedByName", ua.name as "assignedToName" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id LEFT JOIN "User" u ON d."raisedBy" = u.id LEFT JOIN "User" ua ON d."assignedTo" = ua.id WHERE 1=1'
  const params: any[] = []
  let idx = 1
  if (filters.status) { query += ` AND d.status = $${idx}`; params.push(filters.status); idx++ }
  query += ` ORDER BY d."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(filters.limit, filters.offset)
  const result = await pool.query(query, params).catch(() => ({ rows: [] }))
  return { disputes: result.rows, total: result.rows.length, limit: filters.limit, offset: filters.offset }
}

export async function updateDispute(pool: Pool, adminId: string, disputeId: string, data: UpdateDisputeData) {
  if (!data.status) return { error: 'status is required' }
  const updates = ['status = $1', '"assignedTo" = $2', '"resolvedAt" = NOW()', '"updatedAt" = NOW()']
  const values: any[] = [data.status, adminId]
  let idx = 3
  if (data.resolution) { updates.push(`resolution = $${idx}`); values.push(data.resolution); idx++ }
  if (data.refundAmount) { updates.push(`"refundAmount" = $${idx}`); values.push(data.refundAmount); idx++ }
  values.push(disputeId)
  await pool.query(`UPDATE "Dispute" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  const logId = generateLogId()
  await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, adminId, 'RESOLVE_DISPUTE', 'DISPUTE', disputeId, JSON.stringify({ status: data.status, resolution: data.resolution, refundAmount: data.refundAmount })])
  return { message: 'Dispute updated' }
}

// ─── Payouts ───────────────────────────────────────────────────────────

export async function listAdminPayouts(pool: Pool, filters: ListAdminPayoutsFilters) {
  let query = 'SELECT p.*, u.name as "userName", u.email as "userEmail", u.phone as "userPhone" FROM "PayoutRequest" p LEFT JOIN "User" u ON p."userId" = u.id WHERE 1=1'
  const params: any[] = []
  let idx = 1
  if (filters.status) { query += ` AND p.status = $${idx}`; params.push(filters.status); idx++ }
  query += ` ORDER BY p."createdAt" DESC LIMIT $${idx} OFFSET $${idx + 1}`
  params.push(filters.limit, filters.offset)
  const result = await pool.query(query, params).catch(() => ({ rows: [] }))
  return { payouts: result.rows, total: result.rows.length, limit: filters.limit, offset: filters.offset }
}

export async function processPayout(pool: Pool, adminId: string, payoutId: string, data: ProcessPayoutData) {
  if (!data.status) return { error: 'status is required' }
  const updates = ['status = $1', '"processedBy" = $2', '"processedAt" = NOW()', '"updatedAt" = NOW()']
  const values: any[] = [data.status, adminId]
  let idx = 3
  if (data.transactionRef) { updates.push(`"bankRef" = $${idx}`); values.push(data.transactionRef); idx++ }
  if (data.remarks) { updates.push(`"rejectionReason" = $${idx}`); values.push(data.remarks); idx++ }
  values.push(payoutId)
  await pool.query(`UPDATE "PayoutRequest" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  if (data.status === 'REJECTED') {
    const payoutResult = await pool.query('SELECT * FROM "PayoutRequest" WHERE id = $1', [payoutId]).catch(() => ({ rows: [] }))
    if (payoutResult.rows[0]) {
      await pool.query('UPDATE "Wallet" SET balance = balance + $1, "updatedAt" = NOW() WHERE "userId" = $2', [payoutResult.rows[0].amount, payoutResult.rows[0].userId])
    }
  }
  const logId = generateLogId()
  await pool.query('INSERT INTO "AdminLog" (id, "adminId", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())', [logId, adminId, 'PROCESS_PAYOUT', 'PAYOUT', payoutId, JSON.stringify({ status: data.status, transactionRef: data.transactionRef })])
  return { message: 'Payout processed' }
}

// ─── Coupons ───────────────────────────────────────────────────────────

export async function listCoupons(pool: Pool) {
  const result = await pool.query('SELECT * FROM "Coupon" ORDER BY "createdAt" DESC').catch(() => ({ rows: [] }))
  return { coupons: result.rows, total: result.rows.length }
}

export async function createCoupon(pool: Pool, data: CreateCouponData) {
  if (!data.code || !data.discountType || !data.discountValue || !data.validTo) {
    return { error: 'code, discountType, discountValue, and validTo are required' }
  }
  const id = 'cpn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "Coupon" (id, code, "discountType", "discountValue", "maxDiscount", "minOrderAmount", "usageLimit", "validTo", "isActive", "usageCount", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, NOW(), NOW())', [id, data.code, data.discountType, data.discountValue, data.maxDiscount || null, data.minOrderAmount || null, data.usageLimit || null, data.validTo, data.isActive !== false])
  return { message: 'Coupon created', coupon: { id, code: data.code, discountType: data.discountType, discountValue: data.discountValue } }
}

// ─── Franchises ────────────────────────────────────────────────────────

export async function listFranchises(pool: Pool) {
  const result = await pool.query('SELECT f.*, u.name as "ownerName", u.email as "ownerEmail", u.phone as "ownerPhone" FROM "Franchise" f LEFT JOIN "User" u ON f."ownerId" = u.id ORDER BY f."createdAt" DESC').catch(() => ({ rows: [] }))
  return { franchises: result.rows, total: result.rows.length }
}

// ─── Inventory ─────────────────────────────────────────────────────────

export async function listInventory(pool: Pool) {
  const result = await pool.query('SELECT * FROM "InventoryItem" ORDER BY name').catch(() => ({ rows: [] }))
  return { inventory: result.rows, total: result.rows.length }
}

// ─── AMC ───────────────────────────────────────────────────────────────

export async function listAMC(pool: Pool) {
  const plans = await pool.query('SELECT * FROM "AMCPlan" ORDER BY price').catch(() => ({ rows: [] }))
  const subscriptions = await pool.query('SELECT s.*, u.name as "userName", p.name as "planName" FROM "AMCSubscription" s LEFT JOIN "User" u ON s."clientId" = u.id LEFT JOIN "AMCPlan" p ON s."planId" = p.id ORDER BY s."createdAt" DESC').catch(() => ({ rows: [] }))
  return { plans: plans.rows, subscriptions: subscriptions.rows }
}

// ─── B2B ───────────────────────────────────────────────────────────────

export async function listB2B(pool: Pool) {
  const result = await pool.query('SELECT b.*, u.name as "contactName", u.email as "contactEmail" FROM "B2BContract" b LEFT JOIN "User" u ON b."clientId" = u.id ORDER BY b."createdAt" DESC').catch(() => ({ rows: [] }))
  return { contracts: result.rows, total: result.rows.length }
}

// ─── CRM ───────────────────────────────────────────────────────────────

export async function listCRM(pool: Pool, limit: number, offset: number) {
  const result = await pool.query('SELECT c.*, u.name as "userName" FROM "CRMActivity" c LEFT JOIN "User" u ON c."userId" = u.id ORDER BY c."createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]).catch(() => ({ rows: [] }))
  return { activities: result.rows, total: result.rows.length, limit, offset }
}

// ─── Dashboard (30+ concurrent queries) ────────────────────────────────

export async function getDashboard(pool: Pool) {
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
  return {
    users: { total: parseInt(usersTotal.rows[0].count), clients: parseInt(usersClients.rows[0].count), providers: parseInt(usersProviders.rows[0].count), technicians: parseInt(usersTechnicians.rows[0].count), vendors: parseInt(usersVendors.rows[0].count), newToday: parseInt(usersNewToday.rows[0].count), activeThisWeek: parseInt(usersActiveThisWeek.rows[0].count), suspended: parseInt(usersSuspended.rows[0].count) },
    bookings: { total: parseInt(bookingsTotal.rows[0].count), today: parseInt(bookingsToday.rows[0].count), pending: parseInt(bookingsPending.rows[0].count), completed: parseInt(bookingsCompleted.rows[0].count), cancelled: parseInt(bookingsCancelled.rows[0].count), emergency: parseInt(bookingsEmergency.rows[0].count), successRate: parseFloat(Number(bookingsSuccessRate.rows[0].rate).toFixed(2)), avgValue: parseFloat(Number(bookingsAvgValue.rows[0].avg).toFixed(2)) },
    revenue: { total: parseFloat(Number(revenueTotal.rows[0].total).toFixed(2)), today: parseFloat(Number(revenueToday.rows[0].total).toFixed(2)), thisWeek: parseFloat(Number(revenueThisWeek.rows[0].total).toFixed(2)), thisMonth: parseFloat(Number(revenueThisMonth.rows[0].total).toFixed(2)), commissionEarned: parseFloat(Number(commissionEarned.rows[0].total).toFixed(2)), pendingPayouts: parseFloat(Number(pendingPayouts.rows[0].total).toFixed(2)), escrowHeld: parseFloat(Number(escrowHeld.rows[0].total).toFixed(2)), refunds: parseFloat(Number(refunds.rows[0].total).toFixed(2)) },
    services: { total: parseInt(servicesTotal.rows[0].count), active: parseInt(servicesActive.rows[0].count), pendingApproval: parseInt(servicesPendingApproval.rows[0].count), avgRating: parseFloat(Number(servicesAvgRating.rows[0].avg).toFixed(2)) },
    disputes: { active: parseInt(disputesActive.rows[0].count), resolved: parseInt(disputesResolved.rows[0].count), open: parseInt(disputesOpen.rows[0].count) },
    kyc: { pending: parseInt(kycPending.rows[0].count), approved: parseInt(kycApproved.rows[0].count), rejected: parseInt(kycRejected.rows[0].count) },
    recentBookings: recentBookings.rows,
    recentUsers: recentUsers.rows,
  }
}

export function getDashboardFallback() {
  return {
    users: { total: 0, clients: 0, providers: 0, technicians: 0, vendors: 0, newToday: 0, activeThisWeek: 0, suspended: 0 },
    bookings: { total: 0, today: 0, pending: 0, completed: 0, cancelled: 0, emergency: 0, successRate: 0, avgValue: 0 },
    revenue: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, commissionEarned: 0, pendingPayouts: 0, escrowHeld: 0, refunds: 0 },
    services: { total: 0, active: 0, pendingApproval: 0, avgRating: 0 },
    disputes: { active: 0, resolved: 0, open: 0 },
    kyc: { pending: 0, approved: 0, rejected: 0 },
    recentBookings: [],
    recentUsers: [],
  }
}

// ─── Analytics Dashboard (cached) ──────────────────────────────────────

export async function getAnalyticsDashboard(pool: Pool) {
  const cacheKey = 'cache:admin:analytics:dashboard'
  const cached = await redis.getJson(cacheKey)
  if (cached) return { cached, fromCache: true }

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

  const calcGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat((((current - previous) / previous) * 100).toFixed(1))
  }

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
  // Cache the result (non-blocking)
  redis.setJson(cacheKey, data, CacheTTL.LONG).catch(() => {})
  return { data, fromCache: false }
}

// ─── FAQ ───────────────────────────────────────────────────────────────

export async function listFAQ(pool: Pool) {
  const result = await pool.query('SELECT * FROM "Faq" ORDER BY "displayOrder"').catch(() => ({ rows: [] }))
  return { faqs: result.rows, total: result.rows.length }
}

export async function createFAQ(pool: Pool, data: any) {
  await pool.query('INSERT INTO "Faq" (question, answer, category, "isActive", "displayOrder") VALUES ($1, $2, $3, $4, $5)', [data.question, data.answer, data.category || 'GENERAL', data.isActive !== false, data.displayOrder || 0])
  return { message: 'FAQ created' }
}

export async function updateFAQ(pool: Pool, id: string, fields: any) {
  const allowedFields = ['question', 'answer', 'category', 'isActive', 'displayOrder']
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of allowedFields) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { error: 'No fields' }
  updates.push('"updatedAt" = NOW()')
  values.push(id)
  await pool.query(`UPDATE "Faq" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  return { message: 'FAQ updated' }
}

export async function deleteFAQ(pool: Pool, id: string) {
  await pool.query('DELETE FROM "Faq" WHERE id = $1', [id])
  return { message: 'FAQ deleted' }
}

// ─── Categories ────────────────────────────────────────────────────────

export async function upsertCategory(pool: Pool, data: any) {
  const id = data.id || 'cat_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "imageUrl", "isActive", "displayOrder", "isEmergency") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4, icon = $5, "updatedAt" = NOW()', [id, data.name, data.slug || data.name?.toLowerCase().replace(/\s+/g, '-'), data.description || '', data.icon || 'Wrench', data.imageUrl || '/images/default.jpg', data.isActive !== false, data.displayOrder || 0, data.isEmergency || false])
  await redis.delByPattern('cache:categories:*').catch(() => {})
  return { message: 'Category saved', id }
}

export async function updateCategory(pool: Pool, id: string, fields: any) {
  const allowedFields = ['name', 'slug', 'description', 'icon', 'imageUrl', 'isActive', 'displayOrder', 'isEmergency']
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of allowedFields) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { error: 'No fields' }
  updates.push('"updatedAt" = NOW()')
  values.push(id)
  await pool.query(`UPDATE "ServiceCategory" SET ${updates.join(', ')} WHERE id::text = $${idx}`, values)
  return { message: 'Category updated' }
}

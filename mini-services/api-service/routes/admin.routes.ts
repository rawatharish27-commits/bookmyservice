// ─── routes/admin.routes.ts ────────────────────────────────────────────
// All /api/admin/* routes — thin handlers that delegate to admin.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, requireAdmin } from '../lib/shared'
import { captureApiError } from '../lib/sentry'
import { listBackups, createBackup, getBackupStatus, getBackupDetails, deleteBackup, restoreBackup } from '../lib/backup'
import * as adminService from '../services/admin.service'

const router = new Hono()

// GET /api/admin/users
router.get('/api/admin/users', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listUsers(pool, {
      role: c.req.query('role'),
      search: c.req.query('search'),
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    })
    return c.json(result)
  } catch (e) { console.error('Admin list users error:', e); return c.json({ error: 'Failed to list users' }, 500) }
})

// GET /api/admin/users/:id
router.get('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const user = await adminService.getUser(pool, c.req.param('id'))
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json({ user })
  } catch (e) { return c.json({ error: 'Failed to get user' }, 500) }
})

// PATCH /api/admin/users/:id
router.patch('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const body = await c.req.json()
    const result = await adminService.updateUser(pool, admin.id, c.req.param('id'), body)
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result)
  } catch (e) { console.error('Admin update user error:', e); return c.json({ error: 'Failed to update user' }, 500) }
})

// DELETE /api/admin/users/:id
router.delete('/api/admin/users/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Unauthorized' }, 403)
    const result = await adminService.deleteUser(pool, c.req.param('id'))
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// GET /api/admin/services
router.get('/api/admin/services', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listAdminServices(pool, {
      status: c.req.query('status'),
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list services' }, 500) }
})

// PATCH /api/admin/services/:id
router.patch('/api/admin/services/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const { isApproved, rejectionReason, isActive } = await c.req.json()
    const result = await adminService.updateService(pool, admin.id, c.req.param('id'), { isApproved, rejectionReason, isActive })
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to update service' }, 500) }
})

// GET /api/admin/bookings
router.get('/api/admin/bookings', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listAdminBookings(pool, {
      status: c.req.query('status'),
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list bookings' }, 500) }
})

// GET /api/admin/revenue
router.get('/api/admin/revenue', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.getRevenue(pool, c.req.query('period') || 'month')
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to get revenue stats' }, 500) }
})

// GET /api/admin/logs
router.get('/api/admin/logs', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.getAdminLogs(pool, parseInt(c.req.query('limit') || '20'), parseInt(c.req.query('offset') || '0'))
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to get logs' }, 500) }
})

// GET /api/admin/analytics
router.get('/api/admin/analytics', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.getAnalytics(pool)
    return c.json(result)
  } catch (e) { console.error('Admin analytics error:', e); return c.json({ error: 'Failed to get analytics' }, 500) }
})

// GET /api/admin/disputes
router.get('/api/admin/disputes', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listAdminDisputes(pool, {
      status: c.req.query('status'),
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list disputes' }, 500) }
})

// PATCH /api/admin/disputes/:id
router.patch('/api/admin/disputes/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const { status, resolution, refundAmount } = await c.req.json()
    const result = await adminService.updateDispute(pool, admin.id, c.req.param('id'), { status, resolution, refundAmount })
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to resolve dispute' }, 500) }
})

// GET /api/admin/payouts
router.get('/api/admin/payouts', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listAdminPayouts(pool, {
      status: c.req.query('status'),
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    })
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list payouts' }, 500) }
})

// PATCH /api/admin/payouts/:id
router.patch('/api/admin/payouts/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const { status, transactionRef, remarks } = await c.req.json()
    const result = await adminService.processPayout(pool, admin.id, c.req.param('id'), { status, transactionRef, remarks })
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to process payout' }, 500) }
})

// GET /api/admin/coupons
router.get('/api/admin/coupons', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listCoupons(pool)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list coupons' }, 500) }
})

// POST /api/admin/coupons
router.post('/api/admin/coupons', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const { code, discountType, discountValue, maxDiscount, minOrderAmount, usageLimit, validTo, isActive } = await c.req.json()
    const result = await adminService.createCoupon(pool, { code, discountType, discountValue, maxDiscount, minOrderAmount, usageLimit, validTo, isActive })
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result, 201)
  } catch (e) { console.error('Create coupon error:', e); return c.json({ error: 'Failed to create coupon' }, 500) }
})

// GET /api/admin/franchises
router.get('/api/admin/franchises', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listFranchises(pool)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list franchises' }, 500) }
})

// GET /api/admin/inventory
router.get('/api/admin/inventory', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listInventory(pool)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list inventory' }, 500) }
})

// GET /api/admin/amc
router.get('/api/admin/amc', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listAMC(pool)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list AMC data' }, 500) }
})

// GET /api/admin/b2b
router.get('/api/admin/b2b', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listB2B(pool)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list B2B contracts' }, 500) }
})

// GET /api/admin/crm
router.get('/api/admin/crm', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listCRM(pool, parseInt(c.req.query('limit') || '20'), parseInt(c.req.query('offset') || '0'))
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed to list CRM activities' }, 500) }
})

// GET /api/admin/dashboard - Comprehensive metrics
router.get('/api/admin/dashboard', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.getDashboard(pool)
    return c.json(result)
  } catch (e) {
    console.error('Admin dashboard error:', e)
    return c.json(adminService.getDashboardFallback())
  }
})

// ═══ ADMIN FAQ ════════════════════════════════════════════════════════

router.get('/api/admin/faq', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.listFAQ(pool)
    return c.json(result)
  } catch (e) { return c.json({ faqs: [], total: 0 }) }
})

router.post('/api/admin/faq', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const body = await c.req.json()
    const result = await adminService.createFAQ(pool, body)
    return c.json(result, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

router.patch('/api/admin/faq/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const body = await c.req.json()
    const result = await adminService.updateFAQ(pool, c.req.param('id'), body)
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

router.delete('/api/admin/faq/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.deleteFAQ(pool, c.req.param('id'))
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ ADMIN CATEGORIES ══════════════════════════════════════════════════

router.post('/api/admin/categories', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const body = await c.req.json()
    const result = await adminService.upsertCategory(pool, body)
    return c.json(result, 201)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

router.patch('/api/admin/categories/:id', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const body = await c.req.json()
    const result = await adminService.updateCategory(pool, c.req.param('id'), body)
    if (result.error) return c.json({ error: result.error }, 400)
    return c.json(result)
  } catch (e) { return c.json({ error: 'Failed' }, 500) }
})

// ═══ ADMIN ANALYTICS DASHBOARD ════════════════════════════════════════

router.get('/api/admin/analytics/dashboard', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ error: 'Admin access required' }, 403)
    const result = await adminService.getAnalyticsDashboard(pool)
    if (result.fromCache) {
      return c.json(result.cached)
    }
    return c.json(result.data)
  } catch (e) { console.error('Analytics dashboard error:', e); return c.json({ error: 'Failed to get analytics dashboard data' }, 500) }
})

// ═══ ADMIN BACKUPS ════════════════════════════════════════════════════

router.get('/api/admin/backups', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const limit = parseInt(c.req.query('limit') || '30'); const backups = await listBackups(pool, limit); return c.json({ backups, total: backups.length }) } catch (e) { console.error('List backups error:', e); return c.json({ error: 'Failed to list backups' }, 500) } })
router.post('/api/admin/backups', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const record = await createBackup(pool); return c.json({ message: 'Backup created', backup: record }, 201) } catch (e) { console.error('Create backup error:', e); return c.json({ error: 'Failed to create backup', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) } })
router.get('/api/admin/backups/status', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const status = await getBackupStatus(pool); return c.json(status) } catch (e) { console.error('Backup status error:', e); return c.json({ error: 'Failed to get backup status' }, 500) } })
router.get('/api/admin/backups/:id', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const backupId = c.req.param('id'); const includeData = c.req.query('includeData') === 'true'; const details = await getBackupDetails(pool, backupId, includeData); if (!details) return c.json({ error: 'Backup not found' }, 404); return c.json(details) } catch (e) { console.error('Backup details error:', e); return c.json({ error: 'Failed to get backup details' }, 500) } })
router.delete('/api/admin/backups/:id', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const backupId = c.req.param('id'); const deleted = await deleteBackup(pool, backupId); if (!deleted) return c.json({ error: 'Backup not found' }, 404); return c.json({ message: 'Backup deleted', id: backupId }) } catch (e) { console.error('Delete backup error:', e); return c.json({ error: 'Failed to delete backup' }, 500) } })
router.post('/api/admin/backups/:id/restore', async (c) => { const admin = await requireAdmin(c); if (!admin) return c.json({ error: 'Admin access required' }, 403); try { const backupId = c.req.param('id'); const body = await c.req.json().catch(() => ({})); if (!body.confirm || body.confirm !== 'RESTORE') { return c.json({ error: 'Restoring a backup is DANGEROUS and will overwrite current data. Send { confirm: "RESTORE" } in the request body to proceed.' }, 400) } const result = await restoreBackup(pool, backupId); return c.json({ message: 'Backup restored', ...result }) } catch (e) { console.error('Restore backup error:', e); return c.json({ error: 'Failed to restore backup', detail: process.env.NODE_ENV === 'production' ? undefined : (e instanceof Error ? e.message : String(e)) }, 500) } })

export const adminRoutes = router

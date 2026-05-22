// ─── routes/legal.routes.ts ──────────────────────────────────────────
// Legal, FAQ, Contact, and Stats endpoints
// Refactored: thin handlers that delegate to legal.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import * as legalService from '../services/legal.service'

const router = new Hono()

// Legal pages
router.get('/api/legal', async (c) => {
  try {
    const data = await legalService.listLegalDocuments()
    return c.json(data)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

router.get('/api/legal/:type', async (c) => {
  try {
    const typeParam = c.req.param('type')
    const result = await legalService.getLegalDocument(typeParam)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json(result.document)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// FAQ
router.get('/api/faq', async (c) => {
  try {
    const category = c.req.query('category')
    const data = await legalService.listFAQ(category || undefined)
    return c.json(data)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Contact
router.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json()
    const result = await legalService.submitContact({ name, email, subject, message })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ success: true, id: result.id }, 201)
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})

// Stats
router.get('/api/stats', async (c) => {
  try {
    const data = await legalService.getStats()
    return c.json(data)
  } catch (e) { console.error('Stats error:', e); return c.json({ totalProviders: '0', totalCustomers: '0', avgRating: '0' }) }
})

router.get('/api/stats/platform', async (c) => {
  try {
    const data = await legalService.getPlatformStats()
    return c.json(data)
  } catch (e) { console.error('Stats error:', e); return c.json({ totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 }) }
})

export const legalRoutes = router

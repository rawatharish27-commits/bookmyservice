// ─── routes/referral.routes.ts ──────────────────────────────────────────
// All referral / commission routes
// Refactored: thin handlers that delegate to referral.service
// ────────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser, requireAdmin } from '../lib/shared'
import * as referralService from '../services/referral.service'

const router = new Hono()

// ─── 1. POST /api/referral/track ─────────────────────────────────────────

router.post('/api/referral/track', async (c) => {
  try {
    const { referrerId, referredId } = await c.req.json()
    const result = await referralService.trackReferral({ referrerId, referredId })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ success: true, referral: result.referral }, 201)
  } catch (e) {
    console.error('Referral track error:', e)
    return c.json({ error: 'Failed to track referral' }, 500)
  }
})

// ─── 2. GET /api/referral/whatsapp-message ────────────────────────────────

router.get('/api/referral/whatsapp-message', async (c) => {
  try {
    const city = c.req.query('city')
    const referralCode = c.req.query('referralCode')

    const result = await referralService.getWhatsAppMessage(city || '', referralCode || undefined)
    if (!result.success) return c.json({ error: (result as any).error }, (result as any).status)
    return c.json({ message: result.message, city: result.city, referralCode: result.referralCode, link: result.link })
  } catch (e) {
    console.error('WhatsApp message error:', e)
    return c.json({ error: 'Failed to generate WhatsApp message' }, 500)
  }
})

// ─── 3. GET /api/referrals ────────────────────────────────────────────────

router.get('/api/referrals', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const data = await referralService.getReferrals(auth.id)
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to get referrals' }, 500)
  }
})

// ─── 4. GET /api/commission/info ──────────────────────────────────────────

router.get('/api/commission/info', async (c) => {
  try {
    const data = await referralService.getCommissionInfo()
    return c.json(data)
  } catch (e) {
    console.error('Commission info error:', e)
    return c.json({ error: 'Failed to get commission info' }, 500)
  }
})

// ─── 5. GET /api/commissions ──────────────────────────────────────────────

router.get('/api/commissions', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const data = await referralService.getCommissions(auth.id, page, limit)
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to get commissions' }, 500)
  }
})

export const referralRoutes = router

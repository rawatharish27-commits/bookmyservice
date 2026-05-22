// ─── routes/referral.routes.ts ──────────────────────────────────────────
// All referral / commission routes
// Extracted from the monolithic index.ts
// ────────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, JWT_SECRET, getAuthUser, requireAdmin } from '../lib/shared'

const router = new Hono()

// ─── 1. POST /api/referral/track ─────────────────────────────────────────
// Create referral record

router.post('/api/referral/track', async (c) => {
  try {
    const { referrerId, referredId } = await c.req.json()

    if (!referrerId || !referredId) {
      return c.json({ error: 'referrerId and referredId are required' }, 400)
    }

    const id = 'ref_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const record = {
      id,
      referrerId,
      refereeId: referredId,
      referrerReward: 0,
      refereeReward: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    // Insert into DB (no in-memory fallback)
    await pool.query(
      'INSERT INTO "Referral" (id, "referrerId", "refereeId", "referrerReward", "refereeReward", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, referrerId, referredId, 0, 0, 'PENDING', new Date().toISOString()]
    )

    return c.json({
      success: true,
      referral: record,
    }, 201)
  } catch (e) {
    console.error('Referral track error:', e)
    return c.json({ error: 'Failed to track referral' }, 500)
  }
})

// ─── 2. GET /api/referral/whatsapp-message ────────────────────────────────
// Get WhatsApp referral message

router.get('/api/referral/whatsapp-message', async (c) => {
  try {
    const city = c.req.query('city')
    const referralCode = c.req.query('referralCode')

    if (!city) {
      return c.json({ error: 'city query parameter is required' }, 400)
    }

    const baseUrl = 'https://bookyourservice.com'
    const referralLink = referralCode
      ? `${baseUrl}/join?ref=${referralCode}&city=${encodeURIComponent(city)}`
      : `${baseUrl}/join?city=${encodeURIComponent(city)}`

    const message = `Hamare area me Book My Service start ho raha hai. Agar aap AC repair / electrician / plumber service provide karte ho to join karo aur customers pao. ${referralLink}`

    return c.json({
      message,
      city,
      referralCode: referralCode || null,
      link: referralLink,
    })
  } catch (e) {
    console.error('WhatsApp message error:', e)
    return c.json({ error: 'Failed to generate WhatsApp message' }, 500)
  }
})

// ─── 3. GET /api/referrals ────────────────────────────────────────────────
// Get referrals list

router.get('/api/referrals', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    // Try DB
    try {
      const result = await pool.query('SELECT r.*, u.name as "referredName" FROM "Referral" r LEFT JOIN "User" u ON u.id = r."refereeId" WHERE r."referrerId" = $1 ORDER BY r."createdAt" DESC', [auth.id])
      if (result.rows.length > 0) return c.json(result.rows)
    } catch (dbError) { /* DB table may not exist */ }
    // Return empty if no data
    return c.json([])
  } catch (e) {
    return c.json({ error: 'Failed to get referrals' }, 500)
  }
})

// ─── 4. GET /api/commission/info ──────────────────────────────────────────
// Get commission structure

router.get('/api/commission/info', async (c) => {
  try {
    // Try DB first
    try {
      const result = await pool.query('SELECT * FROM "CommissionStructure" ORDER BY id ASC')
      if (result.rows.length > 0) {
        const commissionMap: Record<string, any> = {}
        for (const row of result.rows) {
          commissionMap[row.type] = {
            rate: row.rate,
            type: row.commissionType,
            description: row.description,
          }
        }
        return c.json(commissionMap)
      }
    } catch (dbError) {
      // Table doesn't exist yet
    }

    // Return static commission info
    return c.json({
      customerBooking: {
        rate: 5,
        type: 'PERCENTAGE',
        description: '5% referral commission',
      },
      providerEarnings: {
        rate: 2,
        type: 'PERCENTAGE',
        description: '2% override commission',
      },
      areaGrowthBonus: {
        description: 'Monthly incentive based on area growth',
      },
    })
  } catch (e) {
    console.error('Commission info error:', e)
    return c.json({ error: 'Failed to get commission info' }, 500)
  }
})

// ─── 5. GET /api/commissions ──────────────────────────────────────────────
// Get commission summary + history

router.get('/api/commissions', async (c) => {
  try {
    const auth = await getAuthUser(c)
    if (!auth) return c.json({ error: 'Authentication required' }, 401)
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')

    // Try DB
    try {
      const result = await pool.query('SELECT * FROM "Commission" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [auth.id, limit, (page - 1) * limit])
      if (result.rows.length > 0) {
        const countResult = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'PENDING\' THEN amount ELSE 0 END) as "pendingAmount", SUM(CASE WHEN status = \'APPROVED\' THEN amount ELSE 0 END) as "approvedAmount", SUM(CASE WHEN status = \'PAID\' THEN amount ELSE 0 END) as "paidAmount", SUM(amount) as "totalEarnings" FROM "Commission" WHERE "userId" = $1', [auth.id])
        return c.json({
          commissions: result.rows,
          pagination: { page, limit, total: parseInt(countResult.rows[0]?.total || '0'), totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || '0') / limit) },
          summary: countResult.rows[0] || { totalEarnings: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0 },
        })
      }
    } catch (dbError) { /* DB table may not exist */ }

    return c.json({
      commissions: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      summary: { totalEarnings: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0 },
    })
  } catch (e) {
    return c.json({ error: 'Failed to get commissions' }, 500)
  }
})

export const referralRoutes = router

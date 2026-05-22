// ─── services/referral.service.ts ───────────────────────────────────────
// Pure business logic extracted from routes/referral.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Track Referral ──────────────────────────────────────────────────

export async function trackReferral(data: {
  referrerId: string; referredId: string
}): Promise<{
  success: true; referral: any
} | { success: false; error: string; status: number }> {
  const { referrerId, referredId } = data

  if (!referrerId || !referredId) {
    return { success: false, error: 'referrerId and referredId are required', status: 400 }
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

  // Insert into DB
  await pool.query(
    'INSERT INTO "Referral" (id, "referrerId", "refereeId", "referrerReward", "refereeReward", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [id, referrerId, referredId, 0, 0, 'PENDING', new Date().toISOString()]
  )

  return { success: true, referral: record }
}

// ─── Get WhatsApp Message ────────────────────────────────────────────

export async function getWhatsAppMessage(city: string, referralCode?: string): Promise<{
  message: string; city: string; referralCode: string | null; link: string
} | { success: false; error: string; status: number }> {
  if (!city) {
    return { success: false, error: 'city query parameter is required', status: 400 }
  }

  const baseUrl = 'https://bookyourservice.com'
  const referralLink = referralCode
    ? `${baseUrl}/join?ref=${referralCode}&city=${encodeURIComponent(city)}`
    : `${baseUrl}/join?city=${encodeURIComponent(city)}`

  const message = `Hamare area me Book My Service start ho raha hai. Agar aap AC repair / electrician / plumber service provide karte ho to join karo aur customers pao. ${referralLink}`

  return {
    message,
    city,
    referralCode: referralCode || null,
    link: referralLink,
  }
}

// ─── Get Referrals ───────────────────────────────────────────────────

export async function getReferrals(userId: string): Promise<any[]> {
  // Try DB
  try {
    const result = await pool.query('SELECT r.*, u.name as "referredName" FROM "Referral" r LEFT JOIN "User" u ON u.id = r."refereeId" WHERE r."referrerId" = $1 ORDER BY r."createdAt" DESC', [userId])
    if (result.rows.length > 0) return result.rows
  } catch (dbError) { /* DB table may not exist */ }
  // Return empty if no data
  return []
}

// ─── Get Commission Info ─────────────────────────────────────────────

export async function getCommissionInfo(): Promise<Record<string, any>> {
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
      return commissionMap
    }
  } catch (dbError) {
    // Table doesn't exist yet
  }

  // Return static commission info
  return {
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
  }
}

// ─── Get Commissions ─────────────────────────────────────────────────

export async function getCommissions(userId: string, page: number, limit: number): Promise<{
  commissions: any[]; pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { totalEarnings: number; pendingAmount: number; approvedAmount: number; paidAmount: number }
}> {
  // Try DB
  try {
    const result = await pool.query('SELECT * FROM "Commission" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [userId, limit, (page - 1) * limit])
    if (result.rows.length > 0) {
      const countResult = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'PENDING\' THEN amount ELSE 0 END) as "pendingAmount", SUM(CASE WHEN status = \'APPROVED\' THEN amount ELSE 0 END) as "approvedAmount", SUM(CASE WHEN status = \'PAID\' THEN amount ELSE 0 END) as "paidAmount", SUM(amount) as "totalEarnings" FROM "Commission" WHERE "userId" = $1', [userId])
      return {
        commissions: result.rows,
        pagination: { page, limit, total: parseInt(countResult.rows[0]?.total || '0'), totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || '0') / limit) },
        summary: countResult.rows[0] || { totalEarnings: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0 },
      }
    }
  } catch (dbError) { /* DB table may not exist */ }

  return {
    commissions: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
    summary: { totalEarnings: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0 },
  }
}

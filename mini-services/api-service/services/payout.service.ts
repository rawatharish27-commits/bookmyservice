// ─── services/payout.service.ts ────────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (payouts section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── List Payouts ─────────────────────────────────────────────────────

export async function listPayouts(userId: string, limit: number, offset: number): Promise<{
  payouts: any[]; total: number; limit: number; offset: number
}> {
  const result = await pool.query('SELECT * FROM "PayoutRequest" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3', [userId, limit, offset]).catch(() => ({ rows: [] }))
  return { payouts: result.rows, total: result.rows.length, limit, offset }
}

// ─── Request Payout ───────────────────────────────────────────────────

export async function requestPayout(userId: string, amount: number, method: string, metadata?: any): Promise<{
  success: true; payout: { id: string; amount: number; status: string }
} | { success: false; error: string; status: number }> {
  if (!amount || amount <= 0) return { success: false, error: 'Amount must be positive', status: 400 }
  if (!method || !['BANK_TRANSFER', 'UPI'].includes(method)) return { success: false, error: 'method must be BANK_TRANSFER or UPI', status: 400 }
  const walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [userId]).catch(() => ({ rows: [] }))
  const wallet = walletResult.rows[0]
  if (wallet && wallet.balance < amount) return { success: false, error: 'Insufficient wallet balance', status: 400 }
  const id = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "PayoutRequest" (id, "userId", amount, method, metadata, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, \'PENDING\', NOW(), NOW())', [id, userId, amount, method, metadata || null])
  if (wallet) { await pool.query('UPDATE "Wallet" SET balance = balance - $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id]) }
  return { success: true, payout: { id, amount, status: 'PENDING' } }
}

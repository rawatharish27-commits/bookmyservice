// ─── services/wallet.service.ts ────────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (wallet section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Get or Create Wallet ─────────────────────────────────────────────

export async function getOrCreateWallet(userId: string): Promise<any> {
  const result = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (!result.rows[0]) {
    const walletId = 'wlt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    try {
      await pool.query('INSERT INTO "Wallet" (id, "userId", balance, "createdAt", "updatedAt") VALUES ($1, $2, 0, NOW(), NOW())', [walletId, userId])
      const newResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [userId])
      return newResult.rows[0]
    } catch (e) {
      return { id: walletId, userId, balance: 0 }
    }
  }
  return result.rows[0]
}

// ─── Deposit to Wallet ────────────────────────────────────────────────

export async function depositToWallet(userId: string, amount: number, category?: string, referenceId?: string, referenceType?: string): Promise<{
  success: true; wallet: any; transactionId: string
} | { success: false; error: string; status: number }> {
  if (!amount || amount <= 0) return { success: false, error: 'Amount must be positive', status: 400 }
  let walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (!walletResult.rows[0]) {
    const walletId = 'wlt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query('INSERT INTO "Wallet" (id, "userId", balance, "createdAt", "updatedAt") VALUES ($1, $2, 0, NOW(), NOW())', [walletId, userId])
    walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [userId]).catch(() => ({ rows: [{ id: walletId, balance: 0 }] }))
  }
  const wallet = walletResult.rows[0]
  await pool.query('UPDATE "Wallet" SET balance = balance + $1, "updatedAt" = NOW() WHERE id = $2', [amount, wallet.id])
  const txnId = 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "WalletTransaction" (id, "walletId", "userId", type, category, amount, description, "referenceId", "referenceType", status, "createdAt") VALUES ($1, $2, $3, \'CREDIT\', $4, $5, \'Wallet deposit\', $6, $7, \'COMPLETED\', NOW())', [txnId, wallet.id, userId, category || 'CASHBACK', amount, referenceId || null, referenceType || null])
  const updated = await pool.query('SELECT * FROM "Wallet" WHERE id = $1', [wallet.id]).catch(() => ({ rows: [{ ...wallet, balance: (wallet.balance || 0) + amount }] }))
  return { success: true, wallet: updated.rows[0], transactionId: txnId }
}

// ─── Get Wallet Transactions ──────────────────────────────────────────

export async function getWalletTransactions(userId: string): Promise<{
  transactions: any[]; total: number
}> {
  const result = await pool.query('SELECT * FROM "WalletTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50', [userId]).catch(() => ({ rows: [] }))
  return { transactions: result.rows, total: result.rows.length }
}

// ─── Withdraw from Wallet ─────────────────────────────────────────────

export async function withdrawFromWallet(userId: string, amount: number, method?: string): Promise<{
  success: true; amount: number; payoutId: string
} | { success: false; error: string; status: number }> {
  if (!amount || amount <= 0) return { success: false, error: 'Invalid amount', status: 400 }
  const walletResult = await pool.query('SELECT * FROM "Wallet" WHERE "userId" = $1', [userId]).catch(() => ({ rows: [] }))
  const wallet = walletResult.rows[0]
  if (wallet && wallet.balance < amount) return { success: false, error: 'Insufficient balance', status: 400 }
  const id = 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "PayoutRequest" (id, "userId", amount, method, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())', [id, userId, amount, method || 'BANK_TRANSFER', 'PENDING'])
  await pool.query('UPDATE "Wallet" SET balance = balance - $1 WHERE "userId" = $2', [amount, userId])
  return { success: true, amount, payoutId: id }
}

// ─── Razorpay Payment Gateway Integration ───────────────────────────────
// Handles payment creation, verification, capture, and refund via Razorpay
// REST API. Uses native fetch instead of the SDK to avoid dependency issues.
//
// Setup:
//   1. Create a Razorpay account at https://dashboard.razorpay.com
//   2. Generate API keys from Settings → API Keys
//   3. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars
//   4. For webhooks, set RAZORPAY_WEBHOOK_SECRET env var
//
// Fallback:
//   If Razorpay credentials are not configured, all payment operations are
//   logged as stubs — the app continues to work normally (stub mode).
//   This is useful for development and testing without real payments.
//
// Features:
//   - Settlement Reconciliation: Fetch settlements and reconcile with payments
//   - Payout Ledger: Track provider payouts with fee calculations
//   - Accounting Audit Trail: Full audit trail for payment entities

import * as crypto from 'crypto'
import { Pool } from 'pg'

// ─── Configuration ──────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1'

let isInitialized = false
let initError: string | null = null

function initializeRazorpay(): void {
  if (isInitialized) return

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    initError = 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars'
    console.log('💳 [Razorpay] Not configured — payment operations will be logged as stubs. Set Razorpay env vars to enable.')
    isInitialized = true
    return
  }

  isInitialized = true
  console.log('💳 [Razorpay] Payment gateway initialized successfully')
}

// Initialize on module load
initializeRazorpay()

// ─── Types ──────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi' | 'cardless_emi' | 'paylater'

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number              // Amount in paise (smallest currency unit)
  currency: string
  receipt: string
  status: 'created' | 'attempted' | 'paid'
  notes: Record<string, string>
  createdAt: number
}

export interface RazorpayPayment {
  id: string
  entity: string
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  method: PaymentMethod | null
  order_id: string
  email: string
  contact: string
  captured: boolean
  description: string
  card_id?: string
  bank?: string
  wallet?: string
  vpa?: string
  fee: number
  tax: number
  created_at: number
}

export interface RazorpayRefund {
  id: string
  entity: string
  amount: number
  currency: string
  payment_id: string
  notes: Record<string, string>
  receipt: string | null
  status: 'processed' | 'pending' | 'failed'
  created_at: number
  processed_at: number | null
  speed_processed: string | null
  speed_requested: string | null
}

export interface CreateOrderParams {
  amount: number              // Amount in rupees (will be converted to paise)
  currency?: string           // Default: INR
  receipt: string             // Your internal receipt/order ID
  notes?: Record<string, string>
}

export interface CapturePaymentParams {
  paymentId: string
  amount: number              // Amount in rupees (will be converted to paise)
  currency?: string
}

export interface RefundPaymentParams {
  paymentId: string
  amount?: number             // If omitted, full refund. In rupees (converted to paise)
  notes?: Record<string, string>
  receipt?: string
  speed?: 'normal' | 'optimum'
}

// ─── Settlement Reconciliation Types ────────────────────────────────────

export interface Settlement {
  id: string
  amount: number
  status: string
  created_at: number
  utr: string
}

export interface ReconciliationResult {
  settlementId: string
  matched: boolean
  payments: {
    paymentId: string
    amount: number
    status: string
    matched: boolean
  }[]
  discrepancies: string[]
}

// ─── Payout Ledger Types ───────────────────────────────────────────────

export interface PayoutLedgerEntry {
  id?: string
  providerId: string
  amount: number
  platformFee: number
  gst: number
  netAmount: number
  settlementId: string | null
  status: string
  createdAt?: string
}

// ─── Accounting Audit Trail Types ──────────────────────────────────────

export interface AuditEntry {
  id?: string
  entityType: 'payment' | 'refund' | 'settlement' | 'payout'
  entityId: string
  action: string
  previousState: string | null
  newState: string | null
  performedBy: string
  metadata: Record<string, any> | null
  createdAt?: string
}

// ─── Razorpay Status ───────────────────────────────────────────────────
export function getRazorpayStatus(): { initialized: boolean; error: string | null; stubMode: boolean } {
  return {
    initialized: !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
    error: initError,
    stubMode: !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET,
  }
}

// ─── Get Razorpay Public Key (for frontend checkout) ───────────────────
export function getRazorpayKeyId(): string | null {
  return RAZORPAY_KEY_ID || null
}

// ─── HTTP Helper ────────────────────────────────────────────────────────
async function razorpayRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, any>
): Promise<T> {
  const url = `${RAZORPAY_BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body && method === 'POST') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = (errorData as any)?.error?.description || `Razorpay API error: ${response.status}`
    throw new Error(errorMessage)
  }

  return response.json() as Promise<T>
}

// ─── Create Order ──────────────────────────────────────────────────────
// Creates a Razorpay order for a booking. The frontend will use this
// order ID to open the Razorpay checkout modal.
export async function createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    // Stub mode — return a mock order
    const stubId = `order_stub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    console.log(`💳 [RAZORPAY STUB] Create order: amount=${params.amount} ${params.currency || 'INR'}, receipt=${params.receipt}`)
    return {
      id: stubId,
      entity: 'order',
      amount: Math.round(params.amount * 100),  // Convert to paise
      currency: params.currency || 'INR',
      receipt: params.receipt,
      status: 'created',
      notes: params.notes || {},
      createdAt: Math.floor(Date.now() / 1000),
    }
  }

  // Convert amount from rupees to paise (Razorpay expects smallest currency unit)
  const amountInPaise = Math.round(params.amount * 100)

  const payload: Record<string, any> = {
    amount: amountInPaise,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes || {},
  }

  const order = await razorpayRequest<RazorpayOrder>('POST', '/orders', payload)
  console.log(`💳 [Razorpay] Order created: ${order.id} for ₹${params.amount}`)
  return order
}

// ─── Verify Payment Signature ──────────────────────────────────────────
// Verifies that the payment signature sent from the Razorpay checkout
// is authentic. This MUST be done server-side to prevent tampering.
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    // Stub mode — accept all signatures
    console.log(`💳 [RAZORPAY STUB] Verify signature: order=${orderId}, payment=${paymentId}`)
    return true
  }

  // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  // Use constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    // If lengths differ or hex parsing fails, signature is invalid
    console.warn('💳 [Razorpay] Signature verification failed — length mismatch or invalid hex')
    return false
  }
}

// ─── Verify Webhook Signature ──────────────────────────────────────────
// Verifies the signature on Razorpay webhook payloads.
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.log(`💳 [RAZORPAY STUB] Verify webhook signature`)
    return true
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    console.warn('💳 [Razorpay] Webhook signature verification failed')
    return false
  }
}

// ─── Capture Payment ───────────────────────────────────────────────────
// Captures an authorized payment. Required for card/netbanking payments
// that are first authorized and then need manual capture.
export async function capturePayment(params: CapturePaymentParams): Promise<RazorpayPayment> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.log(`💳 [RAZORPAY STUB] Capture payment: ${params.paymentId}, amount=${params.amount}`)
    return {
      id: params.paymentId,
      entity: 'payment',
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'INR',
      status: 'captured',
      method: null,
      order_id: '',
      email: '',
      contact: '',
      captured: true,
      description: 'Stub capture',
      fee: 0,
      tax: 0,
      created_at: Math.floor(Date.now() / 1000),
    }
  }

  const amountInPaise = Math.round(params.amount * 100)

  const payload: Record<string, any> = {
    amount: amountInPaise,
    currency: params.currency || 'INR',
  }

  const payment = await razorpayRequest<RazorpayPayment>(
    'POST',
    `/payments/${params.paymentId}/capture`,
    payload
  )
  console.log(`💳 [Razorpay] Payment captured: ${params.paymentId} for ₹${params.amount}`)
  return payment
}

// ─── Refund Payment ────────────────────────────────────────────────────
// Initiates a refund for a captured payment.
export async function refundPayment(params: RefundPaymentParams): Promise<RazorpayRefund> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const stubId = `rfnd_stub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    console.log(`💳 [RAZORPAY STUB] Refund payment: ${params.paymentId}, amount=${params.amount || 'full'}`)
    return {
      id: stubId,
      entity: 'refund',
      amount: params.amount ? Math.round(params.amount * 100) : 0,
      currency: 'INR',
      payment_id: params.paymentId,
      notes: params.notes || {},
      receipt: params.receipt || null,
      status: 'processed',
      created_at: Math.floor(Date.now() / 1000),
      processed_at: Math.floor(Date.now() / 1000),
      speed_processed: null,
      speed_requested: params.speed || null,
    }
  }

  const payload: Record<string, any> = {}
  if (params.amount) {
    payload.amount = Math.round(params.amount * 100)  // Convert to paise
  }
  if (params.notes) {
    payload.notes = params.notes
  }
  if (params.receipt) {
    payload.receipt = params.receipt
  }
  if (params.speed) {
    payload.speed = params.speed
  }

  const refund = await razorpayRequest<RazorpayRefund>(
    'POST',
    `/payments/${params.paymentId}/refund`,
    payload
  )
  console.log(`💳 [Razorpay] Refund initiated: ${refund.id} for payment ${params.paymentId}`)
  return refund
}

// ─── Get Payment Details ───────────────────────────────────────────────
// Fetches payment details from Razorpay by payment ID.
export async function getPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.log(`💳 [RAZORPAY STUB] Get payment details: ${paymentId}`)
    return {
      id: paymentId,
      entity: 'payment',
      amount: 0,
      currency: 'INR',
      status: 'captured',
      method: null,
      order_id: '',
      email: '',
      contact: '',
      captured: false,
      description: 'Stub payment',
      fee: 0,
      tax: 0,
      created_at: Math.floor(Date.now() / 1000),
    }
  }

  return razorpayRequest<RazorpayPayment>('GET', `/payments/${paymentId}`)
}

// ─── Map Razorpay Status to Internal Status ────────────────────────────
export function mapRazorpayStatus(status: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    'created': 'PENDING',
    'authorized': 'AUTHORIZED',
    'captured': 'CAPTURED',
    'failed': 'FAILED',
    'refunded': 'REFUNDED',
  }
  return statusMap[status] || 'PENDING'
}

// ─── Settlement Reconciliation ──────────────────────────────────────────

/**
 * Fetch settlements from Razorpay API.
 * Returns a list of settlements within the specified date range.
 */
export async function fetchSettlements(fromDate: string, toDate: string): Promise<Settlement[]> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.log(`💳 [RAZORPAY STUB] Fetch settlements: ${fromDate} to ${toDate}`)
    return []
  }

  try {
    // Razorpay settlements endpoint with date filters
    const fromTimestamp = Math.floor(new Date(fromDate).getTime() / 1000)
    const toTimestamp = Math.floor(new Date(toDate).getTime() / 1000)

    const response = await razorpayRequest<{ items: any[] }>(
      'GET',
      `/settlements?from=${fromTimestamp}&to=${toTimestamp}&count=100`
    )

    const settlements: Settlement[] = (response.items || []).map((item: any) => ({
      id: item.id,
      amount: item.amount || 0,
      status: item.status || 'unknown',
      created_at: item.created_at || 0,
      utr: item.utr || '',
    }))

    console.log(`💳 [Razorpay] Fetched ${settlements.length} settlements from ${fromDate} to ${toDate}`)
    return settlements
  } catch (err: any) {
    console.error(`💳 [Razorpay] Failed to fetch settlements: ${err.message}`)
    return []
  }
}

/**
 * Reconcile a settlement against payment records in the database.
 * Compares settlement data against payment records and flags discrepancies.
 */
export async function reconcileSettlement(pool: Pool, settlementId: string): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    settlementId,
    matched: false,
    payments: [],
    discrepancies: [],
  }

  try {
    // Fetch the settlement details from Razorpay
    let settlement: Settlement | null = null

    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const response = await razorpayRequest<any>('GET', `/settlements/${settlementId}`)
        settlement = {
          id: response.id,
          amount: response.amount || 0,
          status: response.status || 'unknown',
          created_at: response.created_at || 0,
          utr: response.utr || '',
        }
      } catch (err: any) {
        result.discrepancies.push(`Failed to fetch settlement from Razorpay: ${err.message}`)
      }
    } else {
      // Stub mode — create a dummy settlement for testing
      console.log(`💳 [RAZORPAY STUB] Reconcile settlement: ${settlementId}`)
      settlement = {
        id: settlementId,
        amount: 0,
        status: 'processed',
        created_at: Math.floor(Date.now() / 1000),
        utr: '',
      }
    }

    if (!settlement) {
      result.discrepancies.push('Settlement not found on Razorpay')
      return result
    }

    // Fetch payments linked to this settlement from the database
    let dbPayments: any[] = []
    try {
      const paymentResult = await pool.query(
        `SELECT "paymentId", amount, status, metadata FROM "Payment" WHERE metadata->>'settlement_id' = $1 OR "paymentId" IN (
          SELECT "paymentId" FROM "Payment" WHERE metadata->>'settlement_id' = $1
        )`,
        [settlementId]
      )
      dbPayments = paymentResult.rows
    } catch (dbErr: any) {
      // Payment table may not exist or metadata column may not have settlement_id
      console.warn(`⚠️  Could not fetch payments for settlement ${settlementId}: ${dbErr.message}`)
    }

    // If no payments found via settlement_id, try to find captured payments
    // around the settlement time
    if (dbPayments.length === 0) {
      try {
        const settlementDate = new Date(settlement.created_at * 1000).toISOString()
        const dayBefore = new Date(settlement.created_at * 1000 - 86400000).toISOString()

        const paymentResult = await pool.query(
          `SELECT "paymentId", amount, status, metadata FROM "Payment"
           WHERE status = 'CAPTURED' AND "createdAt" BETWEEN $1 AND $2`,
          [dayBefore, settlementDate]
        )
        dbPayments = paymentResult.rows
      } catch (dbErr: any) {
        console.warn(`⚠️  Could not fetch captured payments: ${dbErr.message}`)
      }
    }

    // Compare settlement amount against sum of captured payments
    const totalDbAmount = dbPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

    for (const payment of dbPayments) {
      const paymentEntry = {
        paymentId: payment.paymentId,
        amount: payment.amount || 0,
        status: payment.status,
        matched: payment.status === 'CAPTURED',
      }
      result.payments.push(paymentEntry)

      if (payment.status !== 'CAPTURED') {
        result.discrepancies.push(
          `Payment ${payment.paymentId} has status "${payment.status}" but is linked to a processed settlement`
        )
      }
    }

    // Check if total payment amounts match settlement
    if (settlement.amount > 0 && totalDbAmount > 0) {
      const settlementAmountInRupees = settlement.amount / 100 // Razorpay amounts are in paise
      if (Math.abs(settlementAmountInRupees - totalDbAmount) > 1) {
        result.discrepancies.push(
          `Settlement amount (₹${settlementAmountInRupees}) does not match total captured payments (₹${totalDbAmount})`
        )
      }
    }

    // Check for empty payments in a non-zero settlement
    if (dbPayments.length === 0 && settlement.amount > 0) {
      result.discrepancies.push(
        `Settlement has amount ₹${settlement.amount / 100} but no matching payments found in database`
      )
    }

    result.matched = result.discrepancies.length === 0

    console.log(`💳 [Razorpay] Reconciliation for ${settlementId}: ${result.matched ? 'MATCHED' : 'DISCREPANCIES'} (${result.discrepancies.length} issues)`)
    return result
  } catch (err: any) {
    result.discrepancies.push(`Reconciliation error: ${err.message}`)
    return result
  }
}

// ─── Payout Ledger ─────────────────────────────────────────────────────

/**
 * Ensure the PayoutLedger table exists. Auto-creates if it doesn't.
 * Same pattern as RefreshToken table.
 */
async function ensurePayoutLedgerTable(pool: Pool): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "PayoutLedger" (
        id VARCHAR(36) PRIMARY KEY,
        "providerId" VARCHAR(36) NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        "platformFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
        gst DECIMAL(12,2) NOT NULL DEFAULT 0,
        "netAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "settlementId" VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    // Create index on providerId for fast lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "PayoutLedger_providerId_idx" ON "PayoutLedger" ("providerId")
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "PayoutLedger_settlementId_idx" ON "PayoutLedger" ("settlementId")
    `)
  } catch (err: any) {
    console.warn('⚠️  Could not create PayoutLedger table:', err.message)
  }
}

/**
 * Record a payout ledger entry.
 * Auto-creates PayoutLedger table if it doesn't exist.
 */
export async function recordPayoutLedgerEntry(pool: Pool, entry: PayoutLedgerEntry): Promise<void> {
  try {
    await ensurePayoutLedgerTable(pool)

    const id = entry.id || `payout_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`

    await pool.query(
      `INSERT INTO "PayoutLedger" (id, "providerId", amount, "platformFee", gst, "netAmount", "settlementId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        id,
        entry.providerId,
        entry.amount,
        entry.platformFee,
        entry.gst,
        entry.netAmount,
        entry.settlementId,
        entry.status || 'PENDING',
      ]
    )

    console.log(`💰 [PayoutLedger] Recorded payout: ${id} for provider ${entry.providerId}, net ₹${entry.netAmount}`)
  } catch (err: any) {
    console.error(`💰 [PayoutLedger] Failed to record payout: ${err.message}`)
    throw new Error(`Failed to record payout ledger entry: ${err.message}`)
  }
}

/**
 * Get payout history for a provider.
 * Returns entries ordered by most recent first.
 */
export async function getPayoutLedger(pool: Pool, providerId: string, limit: number = 50): Promise<PayoutLedgerEntry[]> {
  try {
    await ensurePayoutLedgerTable(pool)

    const result = await pool.query(
      `SELECT id, "providerId", amount, "platformFee", gst, "netAmount", "settlementId", status, "createdAt"
       FROM "PayoutLedger"
       WHERE "providerId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2`,
      [providerId, limit]
    )

    return result.rows.map((row: any) => ({
      id: row.id,
      providerId: row.providerId,
      amount: parseFloat(row.amount) || 0,
      platformFee: parseFloat(row.platformFee) || 0,
      gst: parseFloat(row.gst) || 0,
      netAmount: parseFloat(row.netAmount) || 0,
      settlementId: row.settlementId,
      status: row.status,
      createdAt: row.createdAt,
    }))
  } catch (err: any) {
    console.error(`💰 [PayoutLedger] Failed to get payouts: ${err.message}`)
    return []
  }
}

/**
 * Get a summary of all payouts for a provider.
 * Returns total earned, total fees, total payout, and pending amount.
 */
export async function getPayoutSummary(pool: Pool, providerId: string): Promise<{
  totalEarned: number
  totalFees: number
  totalPayout: number
  pendingAmount: number
}> {
  try {
    await ensurePayoutLedgerTable(pool)

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(amount), 0) as "totalEarned",
        COALESCE(SUM("platformFee" + gst), 0) as "totalFees",
        COALESCE(SUM(CASE WHEN status IN ('COMPLETED', 'PROCESSED') THEN "netAmount" ELSE 0 END), 0) as "totalPayout",
        COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PROCESSING') THEN "netAmount" ELSE 0 END), 0) as "pendingAmount"
       FROM "PayoutLedger"
       WHERE "providerId" = $1`,
      [providerId]
    )

    const row = result.rows[0]
    return {
      totalEarned: parseFloat(row.totalEarned) || 0,
      totalFees: parseFloat(row.totalFees) || 0,
      totalPayout: parseFloat(row.totalPayout) || 0,
      pendingAmount: parseFloat(row.pendingAmount) || 0,
    }
  } catch (err: any) {
    console.error(`💰 [PayoutLedger] Failed to get payout summary: ${err.message}`)
    return { totalEarned: 0, totalFees: 0, totalPayout: 0, pendingAmount: 0 }
  }
}

// ─── Accounting Audit Trail ────────────────────────────────────────────

/**
 * Ensure the PaymentAudit table exists. Auto-creates if it doesn't.
 * Same pattern as RefreshToken table.
 */
async function ensurePaymentAuditTable(pool: Pool): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "PaymentAudit" (
        id VARCHAR(36) PRIMARY KEY,
        "entityType" VARCHAR(50) NOT NULL,
        "entityId" VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        "previousState" TEXT,
        "newState" TEXT,
        "performedBy" VARCHAR(255) NOT NULL,
        metadata JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    // Create indexes for fast lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "PaymentAudit_entityType_entityId_idx" ON "PaymentAudit" ("entityType", "entityId")
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "PaymentAudit_entityId_idx" ON "PaymentAudit" ("entityId")
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "PaymentAudit_createdAt_idx" ON "PaymentAudit" ("createdAt")
    `)
  } catch (err: any) {
    console.warn('⚠️  Could not create PaymentAudit table:', err.message)
  }
}

/**
 * Record an audit entry for a payment entity.
 * Auto-creates PaymentAudit table if it doesn't exist.
 */
export async function recordAuditEntry(pool: Pool, entry: AuditEntry): Promise<void> {
  try {
    await ensurePaymentAuditTable(pool)

    const id = entry.id || `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`

    await pool.query(
      `INSERT INTO "PaymentAudit" (id, "entityType", "entityId", action, "previousState", "newState", "performedBy", metadata, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        id,
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.previousState || null,
        entry.newState || null,
        entry.performedBy,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
      ]
    )
  } catch (err: any) {
    console.error(`📋 [PaymentAudit] Failed to record audit entry: ${err.message}`)
    throw new Error(`Failed to record audit entry: ${err.message}`)
  }
}

/**
 * Get the full audit trail for a specific entity.
 * Returns audit entries ordered by creation time (chronological order).
 */
export async function getAuditTrail(pool: Pool, entityType: string, entityId: string): Promise<AuditEntry[]> {
  try {
    await ensurePaymentAuditTable(pool)

    const result = await pool.query(
      `SELECT id, "entityType", "entityId", action, "previousState", "newState", "performedBy", metadata, "createdAt"
       FROM "PaymentAudit"
       WHERE "entityType" = $1 AND "entityId" = $2
       ORDER BY "createdAt" ASC`,
      [entityType, entityId]
    )

    return result.rows.map((row: any) => ({
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      action: row.action,
      previousState: row.previousState,
      newState: row.newState,
      performedBy: row.performedBy,
      metadata: row.metadata,
      createdAt: row.createdAt,
    }))
  } catch (err: any) {
    console.error(`📋 [PaymentAudit] Failed to get audit trail: ${err.message}`)
    return []
  }
}

/**
 * Wrap a DB operation with automatic audit trail recording.
 * Records the previous state, executes the operation, then records the new state.
 * If the operation fails, still records the attempt in the audit trail.
 */
export async function withAuditTrail<T>(
  pool: Pool,
  entityType: string,
  entityId: string,
  action: string,
  performedBy: string,
  fn: () => Promise<T>
): Promise<T> {
  let previousState: string | null = null

  // Attempt to capture previous state
  try {
    await ensurePaymentAuditTable(pool)

    if (entityType === 'payment') {
      const result = await pool.query(
        `SELECT * FROM "Payment" WHERE "paymentId" = $1 OR id = $1`,
        [entityId]
      )
      previousState = result.rows[0] ? JSON.stringify(result.rows[0]) : null
    } else if (entityType === 'payout') {
      const result = await pool.query(
        `SELECT * FROM "PayoutLedger" WHERE id = $1`,
        [entityId]
      )
      previousState = result.rows[0] ? JSON.stringify(result.rows[0]) : null
    } else if (entityType === 'settlement') {
      previousState = `settlement:${entityId}`
    } else if (entityType === 'refund') {
      const result = await pool.query(
        `SELECT * FROM "Payment" WHERE "refundId" = $1 OR "paymentId" = $1`,
        [entityId]
      )
      previousState = result.rows[0] ? JSON.stringify(result.rows[0]) : null
    }
  } catch (err: any) {
    console.warn(`📋 [PaymentAudit] Could not capture previous state: ${err.message}`)
    previousState = null
  }

  try {
    // Execute the operation
    const result = await fn()

    // Capture new state after successful operation
    let newState: string | null = null
    try {
      if (entityType === 'payment') {
        const stateResult = await pool.query(
          `SELECT * FROM "Payment" WHERE "paymentId" = $1 OR id = $1`,
          [entityId]
        )
        newState = stateResult.rows[0] ? JSON.stringify(stateResult.rows[0]) : null
      } else if (entityType === 'payout') {
        const stateResult = await pool.query(
          `SELECT * FROM "PayoutLedger" WHERE id = $1`,
          [entityId]
        )
        newState = stateResult.rows[0] ? JSON.stringify(stateResult.rows[0]) : null
      } else if (entityType === 'settlement') {
        newState = `settlement:${entityId}:processed`
      } else if (entityType === 'refund') {
        const stateResult = await pool.query(
          `SELECT * FROM "Payment" WHERE "refundId" = $1 OR "paymentId" = $1`,
          [entityId]
        )
        newState = stateResult.rows[0] ? JSON.stringify(stateResult.rows[0]) : null
      }
    } catch (err: any) {
      console.warn(`📋 [PaymentAudit] Could not capture new state: ${err.message}`)
      newState = 'operation_completed'
    }

    // Record the audit entry
    await recordAuditEntry(pool, {
      entityType: entityType as AuditEntry['entityType'],
      entityId,
      action,
      previousState,
      newState,
      performedBy,
      metadata: { success: true },
    })

    return result
  } catch (err: any) {
    // Record the failed attempt in audit trail
    try {
      await recordAuditEntry(pool, {
        entityType: entityType as AuditEntry['entityType'],
        entityId,
        action: `${action}_FAILED`,
        previousState,
        newState: null,
        performedBy,
        metadata: { success: false, error: err.message?.substring(0, 500) },
      })
    } catch (auditErr: any) {
      console.error(`📋 [PaymentAudit] Failed to record failed audit entry: ${auditErr.message}`)
    }

    throw err
  }
}

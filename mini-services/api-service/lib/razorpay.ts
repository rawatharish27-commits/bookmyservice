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

import * as crypto from 'crypto'

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

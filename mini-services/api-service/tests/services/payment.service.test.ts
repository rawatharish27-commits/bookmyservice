// ─── tests/services/payment.service.test.ts ────────────────────────────
// Tests for services/payment.service.ts — payment business logic
// All external dependencies (pool, redis, queues, razorpay) are mocked.
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the service
vi.mock('../../lib/shared', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  },
}))

vi.mock('../../lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    delByPattern: vi.fn().mockResolvedValue(0),
    getJson: vi.fn().mockResolvedValue(null),
    setJson: vi.fn().mockResolvedValue('OK'),
  },
}))

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../lib/razorpay', () => ({
  getRazorpayKeyId: vi.fn().mockReturnValue(null),
  getRazorpayStatus: vi.fn().mockReturnValue({ initialized: false, error: 'Not configured', stubMode: true }),
  createOrder: vi.fn().mockResolvedValue({
    id: 'order_stub_123',
    entity: 'order',
    amount: 50000,
    currency: 'INR',
    receipt: 'bkg_test',
    status: 'created',
    notes: {},
    createdAt: Math.floor(Date.now() / 1000),
  }),
  verifyPaymentSignature: vi.fn().mockReturnValue(true),
  verifyWebhookSignature: vi.fn().mockReturnValue(true),
  capturePayment: vi.fn(),
  refundPayment: vi.fn(),
  getPaymentDetails: vi.fn(),
  mapRazorpayStatus: vi.fn().mockReturnValue('PENDING'),
}))

vi.mock('../../queues', () => ({
  pushNotificationJob: vi.fn().mockResolvedValue(undefined),
  pushBookingJob: vi.fn().mockResolvedValue(undefined),
}))

import { getPaymentConfig, createPaymentOrder } from '../../services/payment.service'
import { Pool } from 'pg'

// Create a mock pool for the functions that accept pool as parameter
const mockPool = {
  query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
} as unknown as Pool

describe('Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(mockPool as any).query = vi.fn().mockResolvedValue({ rows: [], rowCount: 0 })
  })

  // ─── getPaymentConfig ──────────────────────────────────────────────
  describe('getPaymentConfig', () => {
    it('returns config with stubMode when Razorpay not configured', () => {
      const config = getPaymentConfig()
      expect(config.stubMode).toBe(true)
      expect(config.currency).toBe('INR')
    })

    it('returns null keyId when Razorpay is not configured', () => {
      const config = getPaymentConfig()
      expect(config.keyId).toBeNull()
    })

    it('includes currency in config', () => {
      const config = getPaymentConfig()
      expect(config).toHaveProperty('currency', 'INR')
    })
  })

  // ─── createPaymentOrder ────────────────────────────────────────────
  describe('createPaymentOrder', () => {
    it('returns error for non-existent booking', async () => {
      ;(mockPool as any).query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await createPaymentOrder(mockPool, 'usr_client123', 1, 'CLIENT', 'bkg_nonexistent')
      expect(result).toHaveProperty('error')
      if ('error' in result) {
        expect(result.error).toBe('Booking not found')
      }
    })

    it('returns error when user does not own the booking', async () => {
      ;(mockPool as any).query.mockResolvedValueOnce({
        rows: [{
          id: 'bkg_1',
          clientId: 'usr_other_client',
          finalPrice: 500,
          paymentStatus: 'PENDING',
          status: 'PENDING',
        }],
        rowCount: 1,
      })

      const result = await createPaymentOrder(mockPool, 'usr_client123', 1, 'CLIENT', 'bkg_1')
      expect(result).toHaveProperty('error')
      if ('error' in result) {
        expect(result.error).toBe('You can only pay for your own bookings')
      }
    })

    it('returns error for cancelled booking', async () => {
      ;(mockPool as any).query.mockResolvedValueOnce({
        rows: [{
          id: 'bkg_1',
          clientId: 'usr_client123',
          finalPrice: 500,
          paymentStatus: 'PENDING',
          status: 'CANCELLED',
        }],
        rowCount: 1,
      })

      const result = await createPaymentOrder(mockPool, 'usr_client123', 1, 'CLIENT', 'bkg_1')
      expect(result).toHaveProperty('error')
      if ('error' in result) {
        expect(result.error).toBe('Cannot pay for a cancelled booking')
      }
    })

    it('returns error for already paid booking', async () => {
      ;(mockPool as any).query.mockResolvedValueOnce({
        rows: [{
          id: 'bkg_1',
          clientId: 'usr_client123',
          finalPrice: 500,
          paymentStatus: 'PAID',
          status: 'PENDING',
        }],
        rowCount: 1,
      })

      const result = await createPaymentOrder(mockPool, 'usr_client123', 1, 'CLIENT', 'bkg_1')
      expect(result).toHaveProperty('error')
      if ('error' in result) {
        expect(result.error).toBe('Booking already paid')
      }
    })

    it('returns error for zero amount booking', async () => {
      ;(mockPool as any).query.mockResolvedValueOnce({
        rows: [{
          id: 'bkg_1',
          clientId: 'usr_client123',
          finalPrice: 0,
          paymentStatus: 'PENDING',
          status: 'PENDING',
        }],
        rowCount: 1,
      })

      const result = await createPaymentOrder(mockPool, 'usr_client123', 1, 'CLIENT', 'bkg_1')
      expect(result).toHaveProperty('error')
      if ('error' in result) {
        expect(result.error).toBe('Invalid booking amount')
      }
    })

    it('creates payment order for valid booking', async () => {
      ;(mockPool as any).query
        .mockResolvedValueOnce({
          rows: [{
            id: 'bkg_1',
            clientId: 'usr_client123',
            finalPrice: 500,
            paymentStatus: 'PENDING',
            status: 'CONFIRMED',
          }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // No existing pending payment
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT Payment

      const result = await createPaymentOrder(mockPool, 'usr_client123', 1, 'CLIENT', 'bkg_1')
      if ('message' in result) {
        expect(result.message).toBe('Payment order created')
        expect(result.payment).toBeDefined()
        expect(result.payment.amount).toBe(500)
        expect(result.payment.status).toBe('PENDING')
      } else {
        expect(result).not.toHaveProperty('error')
      }
    })

    it('allows admin to pay for any booking', async () => {
      ;(mockPool as any).query
        .mockResolvedValueOnce({
          rows: [{
            id: 'bkg_1',
            clientId: 'usr_other',
            finalPrice: 500,
            paymentStatus: 'PENDING',
            status: 'CONFIRMED',
          }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await createPaymentOrder(mockPool, 'usr_admin', 3, 'ADMIN', 'bkg_1')
      if ('message' in result) {
        expect(result.message).toBe('Payment order created')
      } else {
        expect(result).not.toHaveProperty('error')
      }
    })
  })
})

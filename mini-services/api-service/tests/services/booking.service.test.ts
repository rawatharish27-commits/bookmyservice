// ─── tests/services/booking.service.test.ts ────────────────────────────
// Tests for services/booking.service.ts — booking business logic
// All external dependencies (pool, redis, queues) are mocked.
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

vi.mock('../../queues', () => ({
  pushNotificationJob: vi.fn().mockResolvedValue(undefined),
  pushBookingJob: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../lib/logger', () => ({
  BookingEvents: {
    created: vi.fn(),
    failed: vi.fn(),
  },
}))

import {
  createBooking,
  listBookings,
  getBooking,
  updateBookingStatus,
  verifyOtp,
} from '../../services/booking.service'
import { pool } from '../../lib/shared'

describe('Booking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset pool.query mock to prevent leftover mockResolvedValueOnce from bleeding between tests
    ;(pool.query as any).mockReset()
    ;(pool.query as any).mockResolvedValue({ rows: [], rowCount: 0 })
  })

  // ─── createBooking ─────────────────────────────────────────────────
  describe('createBooking', () => {
    it('returns error for non-existent service', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await createBooking('usr_client123', 'client@example.com', {
        serviceId: 'svc_nonexistent',
        scheduledDate: '2025-02-15',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Service not found')
        expect(result.status).toBe(404)
      }
    })

    it('creates booking with valid data', async () => {
      const mockService = {
        id: 'svc_abc123',
        providerId: 'usr_provider123',
        basePrice: 299,
        categoryId: 'cat_abc123',
      }
      const mockBooking = {
        id: 'bkg_new123',
        bookingNumber: 'BK12345678ABC',
        clientId: 'usr_client123',
        serviceId: 'svc_abc123',
        status: 'PENDING',
        basePrice: 299,
        finalPrice: 299,
        otpCode: '654321',
      }

      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [mockService], rowCount: 1 }) // service lookup
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT booking
        .mockResolvedValueOnce({ rows: [mockBooking], rowCount: 1 }) // SELECT booking

      const result = await createBooking('usr_client123', 'client@example.com', {
        serviceId: 'svc_abc123',
        scheduledDate: '2025-02-15',
        scheduledTime: '10:00',
        address: '123 Main St',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.booking).toBeDefined()
        expect(result.booking.status).toBe('PENDING')
      }
    })

    it('creates booking with coupon discount', async () => {
      const mockService = {
        id: 'svc_abc123',
        providerId: 'usr_provider123',
        basePrice: 399,
        categoryId: 'cat_abc123',
      }
      const mockCoupon = {
        id: 'coupon_123',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscount: 200,
        isActive: true,
      }

      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [mockService], rowCount: 1 }) // service lookup
        .mockResolvedValueOnce({ rows: [mockCoupon], rowCount: 1 }) // coupon lookup
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT booking
        .mockResolvedValueOnce({ rows: [{ id: 'bkg_1', status: 'PENDING', finalPrice: 359.1 }], rowCount: 1 })

      const result = await createBooking('usr_client123', 'client@example.com', {
        serviceId: 'svc_abc123',
        scheduledDate: '2025-02-15',
        couponId: 'coupon_123',
      })

      expect(result.success).toBe(true)
    })
  })

  // ─── listBookings ──────────────────────────────────────────────────
  describe('listBookings', () => {
    it('returns bookings for client role', async () => {
      const mockBookings = [
        { id: 'bkg_1', status: 'PENDING', serviceName: 'AC Repair' },
        { id: 'bkg_2', status: 'COMPLETED', serviceName: 'Plumbing' },
      ]

      ;(pool.query as any).mockResolvedValueOnce({ rows: mockBookings, rowCount: 2 })

      const result = await listBookings('usr_client123', 1, 'CLIENT', {})
      expect(result.bookings).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('returns bookings for provider role', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [{ id: 'bkg_1' }], rowCount: 1 })

      const result = await listBookings('usr_provider123', 2, 'PROVIDER', {})
      expect(result.bookings).toHaveLength(1)
    })

    it('filters by status when provided', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await listBookings('usr_client123', 1, 'CLIENT', { status: 'PENDING' })
      expect(result.bookings).toHaveLength(0)
      expect(pool.query).toHaveBeenCalled()
    })

    it('uses default limit and offset when not provided', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await listBookings('usr_client123', 1, 'CLIENT', {})
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
    })
  })

  // ─── getBooking ────────────────────────────────────────────────────
  describe('getBooking', () => {
    it('returns error for non-existent booking', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await getBooking('bkg_nonexistent', 'usr_123', 1)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Booking not found')
        expect(result.status).toBe(404)
      }
    })

    it('returns forbidden for unauthorized user (technician not assigned)', async () => {
      ;(pool.query as any).mockResolvedValueOnce({
        rows: [{ id: 'bkg_1', clientId: 'usr_other', providerId: 'usr_provider', technicianId: 'usr_tech1' }],
        rowCount: 1,
      })

      // Use roleId 5 (VENDOR) which is not 1, 3, or 7
      const result = await getBooking('bkg_1', 'usr_stranger', 5)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Forbidden')
        expect(result.status).toBe(403)
      }
    })

    it('returns booking for authorized client', async () => {
      const mockBooking = { id: 'bkg_1', clientId: 'usr_client123', providerId: 'usr_provider' }
      ;(pool.query as any).mockResolvedValueOnce({ rows: [mockBooking], rowCount: 1 })

      const result = await getBooking('bkg_1', 'usr_client123', 1)
      expect(result.success).toBe(true)
    })
  })

  // ─── updateBookingStatus ───────────────────────────────────────────
  describe('updateBookingStatus', () => {
    it('returns error for invalid status', async () => {
      const result = await updateBookingStatus('bkg_1', 'usr_123', 2, 'INVALID_STATUS')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid status')
        expect(result.status).toBe(400)
      }
    })

    it('returns error for non-existent booking', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await updateBookingStatus('bkg_nonexistent', 'usr_123', 2, 'ACCEPTED')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Booking not found')
        expect(result.status).toBe(404)
      }
    })

    it('returns error for unauthorized role change', async () => {
      ;(pool.query as any).mockResolvedValueOnce({
        rows: [{ id: 'bkg_1', status: 'PENDING' }],
        rowCount: 1,
      })

      // Use roleId 5 (VENDOR) which is not in [2, 4] for ACCEPTED and not 1 or 3
      const result = await updateBookingStatus('bkg_1', 'usr_vendor', 5, 'ACCEPTED')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Not authorized')
        expect(result.status).toBe(403)
      }
    })

    it('successfully updates status with valid transition (provider accepts)', async () => {
      const mockBooking = { id: 'bkg_1', status: 'PENDING', providerId: 'usr_provider' }

      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [mockBooking], rowCount: 1 }) // existing booking
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE query
        .mockResolvedValueOnce({ rows: [{ ...mockBooking, status: 'ACCEPTED' }], rowCount: 1 }) // SELECT final

      const result = await updateBookingStatus('bkg_1', 'usr_provider', 2, 'ACCEPTED')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.booking).toBeDefined()
        expect(result.booking.status).toBe('ACCEPTED')
      }
    })

    it('allows admin to update any booking status', async () => {
      const mockBooking = { id: 'bkg_1', status: 'PENDING' }

      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [mockBooking], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ ...mockBooking, status: 'CANCELLED' }], rowCount: 1 })

      const result = await updateBookingStatus('bkg_1', 'usr_admin', 3, 'CANCELLED')
      expect(result.success).toBe(true)
    })
  })

  // ─── verifyOtp ─────────────────────────────────────────────────────
  describe('verifyOtp', () => {
    it('returns error when OTP is missing', async () => {
      const result = await verifyOtp('bkg_1', '')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('OTP is required')
        expect(result.status).toBe(400)
      }
    })

    it('returns error for non-existent booking', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await verifyOtp('bkg_nonexistent', '123456')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Booking not found')
        expect(result.status).toBe(404)
      }
    })

    it('returns error for incorrect OTP', async () => {
      ;(pool.query as any).mockResolvedValueOnce({
        rows: [{ id: 'bkg_1', otpCode: '654321' }],
        rowCount: 1,
      })

      const result = await verifyOtp('bkg_1', 'wrong_otp')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Invalid OTP')
        expect(result.status).toBe(400)
      }
    })

    it('successfully verifies correct OTP', async () => {
      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [{ id: 'bkg_1', otpCode: '123456' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE

      const result = await verifyOtp('bkg_1', '123456')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.bookingId).toBe('bkg_1')
      }
    })
  })
})

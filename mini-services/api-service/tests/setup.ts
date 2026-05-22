import { vi } from 'vitest'

// ─── Mock pg Pool ──────────────────────────────────────────────────────
export const mockPool = {
  query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  connect: vi.fn(),
  end: vi.fn(),
  on: vi.fn(),
}

// ─── Mock Redis ────────────────────────────────────────────────────────
export const mockRedis = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  getJson: vi.fn().mockResolvedValue(null),
  setJson: vi.fn().mockResolvedValue('OK'),
  delByPattern: vi.fn().mockResolvedValue(0),
  getPopularSearches: vi.fn().mockResolvedValue([]),
  trackSearch: vi.fn().mockResolvedValue(undefined),
  incr: vi.fn().mockResolvedValue(1),
  expire: vi.fn().mockResolvedValue(1),
  exists: vi.fn().mockResolvedValue(0),
  healthCheck: vi.fn().mockResolvedValue({ ok: true }),
  setOtp: vi.fn().mockResolvedValue(undefined),
  getOtp: vi.fn().mockResolvedValue(null),
  deleteOtp: vi.fn().mockResolvedValue(undefined),
  setSession: vi.fn().mockResolvedValue(undefined),
  getSession: vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  invalidateByTag: vi.fn().mockResolvedValue(0),
  tagKey: vi.fn().mockResolvedValue(undefined),
  invalidateUser: vi.fn().mockResolvedValue(undefined),
  zincrby: vi.fn().mockResolvedValue(undefined),
  zrevrange: vi.fn().mockResolvedValue([]),
  forceReconnect: vi.fn().mockResolvedValue(true),
  ping: vi.fn().mockResolvedValue({ ok: true, backend: 'memory' }),
}

// ─── Mock Queue Functions ──────────────────────────────────────────────
export const mockPushNotificationJob = vi.fn().mockResolvedValue(undefined)
export const mockPushBookingJob = vi.fn().mockResolvedValue(undefined)

// ─── Mock Logger ───────────────────────────────────────────────────────
export const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  http: vi.fn(),
}

// ─── Reset all mocks between tests ─────────────────────────────────────
export function resetMocks() {
  mockPool.query.mockReset().mockResolvedValue({ rows: [], rowCount: 0 })
  mockPool.connect.mockReset()
  mockPool.end.mockReset()
  mockPool.on.mockReset()

  Object.values(mockRedis).forEach(fn => {
    if (typeof fn === 'function' && 'mockReset' in fn) fn.mockReset()
  })
  // Restore default return values after reset
  mockRedis.get.mockResolvedValue(null)
  mockRedis.set.mockResolvedValue('OK')
  mockRedis.del.mockResolvedValue(1)
  mockRedis.getJson.mockResolvedValue(null)
  mockRedis.setJson.mockResolvedValue('OK')
  mockRedis.delByPattern.mockResolvedValue(0)
  mockRedis.getPopularSearches.mockResolvedValue([])
  mockRedis.trackSearch.mockResolvedValue(undefined)
  mockRedis.incr.mockResolvedValue(1)
  mockRedis.expire.mockResolvedValue(1)
  mockRedis.exists.mockResolvedValue(0)

  mockPushNotificationJob.mockReset().mockResolvedValue(undefined)
  mockPushBookingJob.mockReset().mockResolvedValue(undefined)

  Object.values(mockLogger).forEach(fn => {
    if (typeof fn === 'function' && 'mockReset' in fn) fn.mockReset()
  })
}

// ─── Test data factories ───────────────────────────────────────────────
export function createMockUser(overrides: Record<string, any> = {}) {
  return {
    id: 'usr_abc123def456ghi789jk',
    email: 'test@example.com',
    phone: '+919876543210',
    name: 'Test User',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxABCDEFGHIJ', // bcrypt hash
    roleId: 1,
    roleName: 'CLIENT',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockBooking(overrides: Record<string, any> = {}) {
  return {
    id: 'bkg_abc123def456ghi789jk',
    bookingNumber: 'BK12345678ABC',
    clientId: 'usr_client123',
    providerId: 'usr_provider123',
    technicianId: null,
    serviceId: 'svc_abc123',
    scheduledDate: '2025-02-15',
    scheduledTime: '10:00',
    serviceAddress: '123 Main St, Mumbai',
    serviceLatitude: 19.076,
    serviceLongitude: 72.8777,
    specialInstructions: null,
    basePrice: 500,
    couponDiscount: 0,
    finalPrice: 500,
    couponId: null,
    otpCode: '123456',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockService(overrides: Record<string, any> = {}) {
  return {
    id: 'svc_abc123',
    title: 'AC Repair',
    description: 'Professional AC repair service',
    basePrice: 500,
    categoryId: 'cat_abc123',
    providerId: 'usr_provider123',
    isActive: true,
    ...overrides,
  }
}

export function createMockPayment(overrides: Record<string, any> = {}) {
  return {
    id: 'pay_abc123def456ghi789jk',
    orderId: 'order_stub_123',
    bookingId: 'bkg_abc123def456ghi789jk',
    userId: 'usr_client123',
    amount: 500,
    currency: 'INR',
    status: 'PENDING',
    method: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

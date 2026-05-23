// ─── tests/services/auth.service.test.ts ────────────────────────────────
// Tests for services/auth.service.ts — auth business logic
// All external dependencies (pool, redis, queues) are mocked.
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mock functions that are available in vi.mock factory
const { mockCompare, mockHash } = vi.hoisted(() => ({
  mockCompare: vi.fn().mockResolvedValue(false),
  mockHash: vi.fn().mockResolvedValue('$2a$10$mockhash'),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: mockCompare,
    hash: mockHash,
  },
  compare: mockCompare,
  hash: mockHash,
}))

// Mock dependencies before importing the service
vi.mock('../../lib/shared', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  },
  JWT_SECRET: 'test-jwt-secret-for-testing',
  validateInputLengths: vi.fn().mockReturnValue(null),
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
  AuthEvents: {
    failedLogin: vi.fn(),
    successfulLogin: vi.fn(),
    registration: vi.fn(),
  },
}))

vi.mock('../../lib/sentry', () => ({
  setSentryUser: vi.fn(),
}))

import { loginUser, registerUser, sanitizeUser, createAccessToken, verifyToken, isJwtError } from '../../services/auth.service'
import { pool } from '../../lib/shared'

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset bcrypt compare mock to default (password mismatch)
    mockCompare.mockResolvedValue(false)
  })

  // ─── sanitizeUser ──────────────────────────────────────────────────
  describe('sanitizeUser', () => {
    it('removes passwordHash from user object', () => {
      const user = {
        id: 'usr_123',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: '$2a$10$secret',
        roleName: 'CLIENT',
        roleId: 1,
      }
      const result = sanitizeUser(user)
      expect(result).not.toHaveProperty('passwordHash')
      expect(result.role).toBe('CLIENT')
      expect(result.email).toBe('test@example.com')
    })

    it('removes roleName and replaces with role', () => {
      const user = {
        id: 'usr_123',
        roleName: 'PROVIDER',
        roleId: 2,
      }
      const result = sanitizeUser(user)
      expect(result).not.toHaveProperty('roleName')
      expect(result).not.toHaveProperty('passwordHash')
      expect(result.role).toBe('PROVIDER')
    })

    it('preserves all other fields', () => {
      const user = {
        id: 'usr_123',
        email: 'test@example.com',
        phone: '+919876543210',
        name: 'Test User',
        roleName: 'ADMIN',
        roleId: 3,
        passwordHash: 'secret',
        city: 'Mumbai',
      }
      const result = sanitizeUser(user)
      expect(result.id).toBe('usr_123')
      expect(result.email).toBe('test@example.com')
      expect(result.phone).toBe('+919876543210')
      expect(result.name).toBe('Test User')
      expect(result.city).toBe('Mumbai')
      expect(result.role).toBe('ADMIN')
    })
  })

  // ─── loginUser ─────────────────────────────────────────────────────
  describe('loginUser', () => {
    it('returns error for non-existent email', async () => {
      ;(pool.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await loginUser('nonexistent@example.com', 'password123', '127.0.0.1')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Invalid email or password')
        expect(result.status).toBe(401)
      }
    })

    it('returns error for invalid password', async () => {
      // bcrypt.compare returns false by default (mockCompare)
      ;(pool.query as any).mockResolvedValueOnce({
        rows: [{
          id: 'usr_123',
          email: 'test@example.com',
          passwordHash: '$2a$10$somehash',
          roleName: 'CLIENT',
          roleId: 1,
          status: 'ACTIVE',
        }],
        rowCount: 1,
      })

      const result = await loginUser('test@example.com', 'wrongpassword', '127.0.0.1')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Invalid email or password')
        expect(result.status).toBe(401)
      }
    })

    it('returns error for inactive/suspended account', async () => {
      // Make bcrypt.compare return true (correct password)
      mockCompare.mockResolvedValueOnce(true)

      ;(pool.query as any).mockResolvedValueOnce({
        rows: [{
          id: 'usr_123',
          email: 'test@example.com',
          passwordHash: '$2a$10$somehash',
          roleName: 'CLIENT',
          roleId: 1,
          status: 'SUSPENDED',
        }],
        rowCount: 1,
      })

      const result = await loginUser('test@example.com', 'password123', '127.0.0.1')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('suspended')
        expect(result.status).toBe(403)
      }
    })

    it('returns success with valid credentials and active account', async () => {
      // Make bcrypt.compare return true (correct password)
      mockCompare.mockResolvedValueOnce(true)

      ;(pool.query as any)
        .mockResolvedValueOnce({
          rows: [{
            id: 'usr_123',
            email: 'test@example.com',
            passwordHash: '$2a$10$somehash',
            roleName: 'CLIENT',
            roleId: 1,
            status: 'ACTIVE',
          }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE lastLoginAt

      const result = await loginUser('test@example.com', 'password123', '127.0.0.1')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.user).toBeDefined()
        expect(result.user.role).toBe('CLIENT')
        expect(result.accessToken).toBeDefined()
        expect(result.user).not.toHaveProperty('passwordHash')
      }
    })
  })

  // ─── registerUser ──────────────────────────────────────────────────
  describe('registerUser', () => {
    it('returns error for duplicate email', async () => {
      ;(pool.query as any).mockResolvedValueOnce({
        rows: [{ id: 'usr_existing' }],
        rowCount: 1,
      })

      const result = await registerUser({
        email: 'existing@example.com',
        phone: '+919876543210',
        name: 'Test',
        password: 'password123',
        roleId: 1,
      }, '127.0.0.1')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Email already registered')
        expect(result.status).toBe(409)
      }
    })

    it('returns error for duplicate phone', async () => {
      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email check → not found
        .mockResolvedValueOnce({ rows: [{ id: 'usr_existing' }], rowCount: 1 }) // phone check → found

      const result = await registerUser({
        email: 'new@example.com',
        phone: '+919876543210',
        name: 'Test',
        password: 'password123',
        roleId: 1,
      }, '127.0.0.1')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Phone already registered')
        expect(result.status).toBe(409)
      }
    })

    it('returns error for invalid roleId', async () => {
      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email check
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // phone check
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // roleCheck → no rows = invalid role

      const result = await registerUser({
        email: 'new@example.com',
        phone: '+919876543210',
        name: 'Test',
        password: 'password123',
        roleId: 999,
      }, '127.0.0.1')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid roleId')
        expect(result.status).toBe(400)
      }
    })

    it('successfully registers a new client user', async () => {
      const mockUser = {
        id: 'usr_new123',
        email: 'new@example.com',
        phone: '+919876543210',
        name: 'New User',
        roleName: 'CLIENT',
        roleId: 1,
      }

      ;(pool.query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email check
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // phone check
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // roleCheck (role exists)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT User
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 }) // SELECT new user

      const result = await registerUser({
        email: 'new@example.com',
        phone: '+919876543210',
        name: 'New User',
        password: 'password123',
        roleId: 1,
      }, '127.0.0.1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.user).toBeDefined()
        expect(result.user.role).toBe('CLIENT')
        expect(result.accessToken).toBeDefined()
        expect(result.user).not.toHaveProperty('passwordHash')
      }
    })
  })

  // ─── createAccessToken / verifyToken ────────────────────────────────
  describe('createAccessToken & verifyToken', () => {
    it('creates and verifies a valid JWT token', async () => {
      const payload = { id: 'usr_123', email: 'test@example.com', role: 'CLIENT', roleId: 1 }
      const token = await createAccessToken(payload)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const verified = await verifyToken(token)
      expect(verified.sub).toBe('usr_123')
      expect(verified.email).toBe('test@example.com')
      expect(verified.role).toBe('CLIENT')
    })
  })

  // ─── isJwtError ────────────────────────────────────────────────────
  describe('isJwtError', () => {
    it('detects expired JWT error', () => {
      expect(isJwtError({ code: 'ERR_JWT_EXPIRED' })).toBe(true)
    })

    it('detects invalid JWT error', () => {
      expect(isJwtError({ code: 'ERR_JWS_INVALID' })).toBe(true)
      expect(isJwtError({ code: 'ERR_JWT_INVALID' })).toBe(true)
    })

    it('returns false for non-JWT errors', () => {
      expect(isJwtError({ code: 'SOME_OTHER_ERROR' })).toBe(false)
      expect(isJwtError(null)).toBe(false)
      expect(isJwtError(undefined)).toBe(false)
    })
  })
})

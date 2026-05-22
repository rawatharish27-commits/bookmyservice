// ─── tests/lib/rbac.test.ts ───────────────────────────────────────────
// Tests for lib/rbac.ts — Role-Based Access Control system
// Tests the hasPermission, checkPermission, getRolePermissions,
// and PermissionDeniedError functions.
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { hasPermission, checkPermission, getRolePermissions, Permission, PermissionDeniedError } from '../../lib/rbac'

describe('RBAC System', () => {
  // ─── hasPermission ──────────────────────────────────────────────────
  describe('hasPermission', () => {
    it('should allow ADMIN all permissions', () => {
      expect(hasPermission(3, Permission.BOOKING_CREATE)).toBe(true)
      expect(hasPermission(3, Permission.ADMIN_DASHBOARD)).toBe(true)
      expect(hasPermission(3, Permission.ADMIN_BACKUP)).toBe(true)
      expect(hasPermission(3, Permission.ADMIN_SECRETS_VIEW)).toBe(true)
      expect(hasPermission(3, Permission.PAYMENT_REFUND)).toBe(true)
      expect(hasPermission(3, Permission.SERVICE_DELETE_ANY)).toBe(true)
    })

    it('should allow SUB_ADMIN all permissions (same as ADMIN)', () => {
      expect(hasPermission(7, Permission.BOOKING_CREATE)).toBe(true)
      expect(hasPermission(7, Permission.ADMIN_DASHBOARD)).toBe(true)
      expect(hasPermission(7, Permission.ADMIN_BACKUP)).toBe(true)
    })

    it('should restrict CLIENT permissions', () => {
      expect(hasPermission(1, Permission.BOOKING_CREATE)).toBe(true)
      expect(hasPermission(1, Permission.BOOKING_READ_OWN)).toBe(true)
      expect(hasPermission(1, Permission.BOOKING_CANCEL_OWN)).toBe(true)
      expect(hasPermission(1, Permission.SERVICE_READ)).toBe(true)
      expect(hasPermission(1, Permission.PAYMENT_CREATE)).toBe(true)
      expect(hasPermission(1, Permission.NOTIFICATION_READ_OWN)).toBe(true)
      // Client should NOT have these
      expect(hasPermission(1, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(1, Permission.SERVICE_CREATE)).toBe(false)
      expect(hasPermission(1, Permission.SERVICE_DELETE_ANY)).toBe(false)
      expect(hasPermission(1, Permission.BOOKING_READ_ANY)).toBe(false)
      expect(hasPermission(1, Permission.USER_READ_ANY)).toBe(false)
      expect(hasPermission(1, Permission.ADMIN_PAYOUT_PROCESS)).toBe(false)
    })

    it('should restrict PROVIDER permissions', () => {
      expect(hasPermission(2, Permission.SERVICE_CREATE)).toBe(true)
      expect(hasPermission(2, Permission.SERVICE_UPDATE_OWN)).toBe(true)
      expect(hasPermission(2, Permission.SERVICE_DELETE_OWN)).toBe(true)
      expect(hasPermission(2, Permission.BOOKING_READ_OWN)).toBe(true)
      expect(hasPermission(2, Permission.BOOKING_UPDATE_OWN)).toBe(true)
      // Provider should NOT have these
      expect(hasPermission(2, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(2, Permission.SERVICE_UPDATE_ANY)).toBe(false)
      expect(hasPermission(2, Permission.BOOKING_READ_ANY)).toBe(false)
      expect(hasPermission(2, Permission.PAYMENT_READ_ANY)).toBe(false)
    })

    it('should restrict TECHNICIAN permissions', () => {
      expect(hasPermission(4, Permission.BOOKING_READ_OWN)).toBe(true)
      expect(hasPermission(4, Permission.BOOKING_UPDATE_OWN)).toBe(true)
      expect(hasPermission(4, Permission.SERVICE_READ)).toBe(true)
      // Technician should NOT have these
      expect(hasPermission(4, Permission.BOOKING_CREATE)).toBe(false)
      expect(hasPermission(4, Permission.SERVICE_CREATE)).toBe(false)
      expect(hasPermission(4, Permission.ADMIN_DASHBOARD)).toBe(false)
    })

    it('should restrict VENDOR permissions', () => {
      expect(hasPermission(5, Permission.SERVICE_CREATE)).toBe(true)
      expect(hasPermission(5, Permission.SERVICE_UPDATE_OWN)).toBe(true)
      expect(hasPermission(5, Permission.PAYMENT_READ_OWN)).toBe(true)
      // Vendor should NOT have these
      expect(hasPermission(5, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(5, Permission.BOOKING_CREATE)).toBe(false)
    })

    it('should restrict FRANCHISE permissions', () => {
      expect(hasPermission(6, Permission.FRANCHISE_DASHBOARD)).toBe(true)
      expect(hasPermission(6, Permission.FRANCHISE_MANAGE_VENDORS)).toBe(true)
      expect(hasPermission(6, Permission.SERVICE_READ)).toBe(true)
      // Franchise should NOT have these
      expect(hasPermission(6, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(6, Permission.BOOKING_CREATE)).toBe(false)
    })

    it('should restrict AREA_MANAGER permissions', () => {
      expect(hasPermission(8, Permission.BOOKING_READ_OWN)).toBe(true)
      expect(hasPermission(8, Permission.SERVICE_READ)).toBe(true)
      // Area Manager should NOT have these
      expect(hasPermission(8, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(8, Permission.BOOKING_CREATE)).toBe(false)
    })

    it('should restrict MANAGER permissions', () => {
      expect(hasPermission(9, Permission.BOOKING_READ_OWN)).toBe(true)
      expect(hasPermission(9, Permission.BOOKING_UPDATE_OWN)).toBe(true)
      expect(hasPermission(9, Permission.SERVICE_READ)).toBe(true)
      // Manager should NOT have these
      expect(hasPermission(9, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(9, Permission.BOOKING_CREATE)).toBe(false)
    })

    it('should restrict LOCAL_ADMIN permissions', () => {
      expect(hasPermission(10, Permission.BOOKING_READ_OWN)).toBe(true)
      expect(hasPermission(10, Permission.SERVICE_READ)).toBe(true)
      // Local Admin should NOT have these
      expect(hasPermission(10, Permission.ADMIN_DASHBOARD)).toBe(false)
      expect(hasPermission(10, Permission.BOOKING_CREATE)).toBe(false)
    })

    it('should return false for unknown role', () => {
      expect(hasPermission(999, Permission.BOOKING_CREATE)).toBe(false)
      expect(hasPermission(0, Permission.BOOKING_CREATE)).toBe(false)
      expect(hasPermission(-1, Permission.SERVICE_READ)).toBe(false)
    })
  })

  // ─── checkPermission ────────────────────────────────────────────────
  describe('checkPermission', () => {
    it('should not throw for allowed permission', () => {
      expect(() => checkPermission(3, Permission.BOOKING_CREATE)).not.toThrow()
      expect(() => checkPermission(1, Permission.BOOKING_CREATE)).not.toThrow()
      expect(() => checkPermission(2, Permission.SERVICE_CREATE)).not.toThrow()
    })

    it('should throw PermissionDeniedError for denied permission', () => {
      expect(() => checkPermission(1, Permission.ADMIN_DASHBOARD)).toThrow(PermissionDeniedError)
    })

    it('should throw PermissionDeniedError for unknown role', () => {
      expect(() => checkPermission(999, Permission.BOOKING_CREATE)).toThrow(PermissionDeniedError)
    })

    it('PermissionDeniedError contains useful message', () => {
      try {
        checkPermission(1, Permission.ADMIN_DASHBOARD)
      } catch (err) {
        expect(err).toBeInstanceOf(PermissionDeniedError)
        expect((err as PermissionDeniedError).message).toContain('1')
        expect((err as PermissionDeniedError).message).toContain(Permission.ADMIN_DASHBOARD)
        expect((err as PermissionDeniedError).name).toBe('PermissionDeniedError')
      }
    })
  })

  // ─── getRolePermissions ─────────────────────────────────────────────
  describe('getRolePermissions', () => {
    it('should return permissions array for known role', () => {
      const perms = getRolePermissions(1)
      expect(perms.length).toBeGreaterThan(0)
      expect(perms).toContain(Permission.BOOKING_CREATE)
      expect(perms).toContain(Permission.BOOKING_READ_OWN)
      expect(perms).toContain(Permission.PAYMENT_CREATE)
    })

    it('should return all permissions for ADMIN', () => {
      const perms = getRolePermissions(3)
      expect(perms.length).toBe(Object.keys(Permission).length)
    })

    it('should return all permissions for SUB_ADMIN', () => {
      const perms = getRolePermissions(7)
      expect(perms.length).toBe(Object.keys(Permission).length)
    })

    it('should return empty array for unknown role', () => {
      expect(getRolePermissions(999)).toEqual([])
      expect(getRolePermissions(0)).toEqual([])
    })

    it('should return specific permissions for each role', () => {
      const clientPerms = getRolePermissions(1)
      const providerPerms = getRolePermissions(2)
      // Provider should have SERVICE_CREATE, Client should not
      expect(providerPerms).toContain(Permission.SERVICE_CREATE)
      expect(clientPerms).not.toContain(Permission.SERVICE_CREATE)
    })
  })
})

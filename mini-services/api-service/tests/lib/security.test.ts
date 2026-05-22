// ─── tests/lib/security.test.ts ─────────────────────────────────────────
// Tests for lib/security.ts — input sanitization, injection detection,
// XSS detection, allowlist validation
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import {
  sanitizeInput,
  detectSQLInjection,
  detectXSS,
  isValidOrigin,
  generateCSPNonce,
  validateAgainstSchema,
} from '../../lib/security'

describe('Security Utilities', () => {
  // ─── sanitizeInput ─────────────────────────────────────────────────
  describe('sanitizeInput', () => {
    it('strips script tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('strips event handler attributes', () => {
      const result = sanitizeInput('<div onclick="alert(1)">hello</div>')
      expect(result).not.toContain('onclick')
    })

    it('strips javascript: URLs', () => {
      const result = sanitizeInput('javascript:alert(1)')
      expect(result).not.toContain('javascript:')
    })

    it('removes null bytes', () => {
      const result = sanitizeInput('hello\0world')
      expect(result).toBe('helloworld')
    })

    it('strips iframe tags', () => {
      const result = sanitizeInput('<iframe src="evil.com"></iframe>')
      expect(result).not.toContain('<iframe')
    })

    it('strips vbscript: URLs', () => {
      const result = sanitizeInput('vbscript:msgbox("xss")')
      expect(result).not.toContain('vbscript:')
    })

    it('returns input unchanged for clean strings', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World')
      expect(sanitizeInput('user@example.com')).toBe('user@example.com')
    })

    it('returns input unchanged for non-string types', () => {
      expect(sanitizeInput(null as any)).toBeNull()
      expect(sanitizeInput(undefined as any)).toBeUndefined()
      expect(sanitizeInput(123 as any)).toBe(123)
    })

    it('strips SVG tags with script content', () => {
      const result = sanitizeInput('<svg onload="alert(1)"><circle/></svg>')
      expect(result).not.toContain('<svg')
    })

    it('strips expression() CSS', () => {
      const result = sanitizeInput('expression(alert(1))')
      expect(result).not.toContain('expression')
    })
  })

  // ─── detectSQLInjection ────────────────────────────────────────────
  describe('detectSQLInjection', () => {
    it('detects UNION SELECT pattern', () => {
      expect(detectSQLInjection("' UNION SELECT * FROM users")).toBe(true)
    })

    it('detects OR 1=1 pattern', () => {
      expect(detectSQLInjection("' OR 1=1")).toBe(true)
    })

    it('detects AND 1=1 pattern', () => {
      expect(detectSQLInjection("' AND 1=1")).toBe(true)
    })

    it('detects DROP TABLE pattern', () => {
      expect(detectSQLInjection('; DROP TABLE users')).toBe(true)
    })

    it('detects INSERT INTO pattern', () => {
      expect(detectSQLInjection('INSERT INTO users VALUES')).toBe(true)
    })

    it('detects information_schema access', () => {
      expect(detectSQLInjection('SELECT * FROM information_schema.tables')).toBe(true)
    })

    it('detects pg_catalog access', () => {
      expect(detectSQLInjection('SELECT * FROM pg_catalog')).toBe(true)
    })

    it('returns false for normal input', () => {
      expect(detectSQLInjection('AC Repair Service')).toBe(false)
      expect(detectSQLInjection('John O\'Brien')).toBe(false) // Apostrophe in name
    })

    it('returns false for empty/null input', () => {
      expect(detectSQLInjection('')).toBe(false)
      expect(detectSQLInjection(null as any)).toBe(false)
    })
  })

  // ─── detectXSS ─────────────────────────────────────────────────────
  describe('detectXSS', () => {
    it('detects script tags', () => {
      expect(detectXSS('<script>alert(1)</script>')).toBe(true)
    })

    it('detects event handlers', () => {
      expect(detectXSS('<img onerror="alert(1)"/>')).toBe(true)
    })

    it('detects javascript: URLs', () => {
      expect(detectXSS('javascript:alert(1)')).toBe(true)
    })

    it('detects iframe tags', () => {
      expect(detectXSS('<iframe src="evil.com">')).toBe(true)
    })

    it('detects encoded script tags', () => {
      expect(detectXSS('%3cscript')).toBe(true)
    })

    it('returns false for normal input', () => {
      expect(detectXSS('Hello World')).toBe(false)
      expect(detectXSS('<b>bold text</b>')).toBe(false)
    })

    it('returns false for empty/null input', () => {
      expect(detectXSS('')).toBe(false)
      expect(detectXSS(null as any)).toBe(false)
    })
  })

  // ─── isValidOrigin ─────────────────────────────────────────────────
  describe('isValidOrigin', () => {
    it('returns false for empty origin', () => {
      expect(isValidOrigin('', ['https://example.com'])).toBe(false)
    })

    it('matches exact origin', () => {
      expect(isValidOrigin('https://example.com', ['https://example.com'])).toBe(true)
    })

    it('rejects non-allowed origin', () => {
      expect(isValidOrigin('https://evil.com', ['https://example.com'])).toBe(false)
    })

    it('matches wildcard subdomain', () => {
      expect(isValidOrigin('https://app.example.com', ['*.example.com'])).toBe(true)
      expect(isValidOrigin('https://api.example.com', ['*.example.com'])).toBe(true)
    })

    it('matches regex pattern', () => {
      expect(isValidOrigin('https://app.example.com', ['/\\.example\\.com$/'])).toBe(true)
    })
  })

  // ─── generateCSPNonce ──────────────────────────────────────────────
  describe('generateCSPNonce', () => {
    it('generates a non-empty string', () => {
      const nonce = generateCSPNonce()
      expect(nonce).toBeDefined()
      expect(typeof nonce).toBe('string')
      expect(nonce.length).toBeGreaterThan(0)
    })

    it('generates unique nonces', () => {
      const nonce1 = generateCSPNonce()
      const nonce2 = generateCSPNonce()
      expect(nonce1).not.toBe(nonce2)
    })
  })

  // ─── validateAgainstSchema ─────────────────────────────────────────
  describe('validateAgainstSchema', () => {
    describe('email validation', () => {
      it('validates correct emails', () => {
        const result = validateAgainstSchema('test@example.com', 'email')
        expect(result.valid).toBe(true)
        expect(result.sanitized).toBe('test@example.com')
      })

      it('rejects invalid emails', () => {
        const result = validateAgainstSchema('not-an-email', 'email')
        expect(result.valid).toBe(false)
      })

      it('lowercases email', () => {
        const result = validateAgainstSchema('Test@Example.COM', 'email')
        expect(result.valid).toBe(true)
        expect(result.sanitized).toBe('test@example.com')
      })
    })

    describe('phone validation', () => {
      it('validates Indian phone numbers with +91', () => {
        const result = validateAgainstSchema('+919876543210', 'phone')
        expect(result.valid).toBe(true)
      })

      it('validates Indian phone numbers without +91', () => {
        const result = validateAgainstSchema('9876543210', 'phone')
        expect(result.valid).toBe(true)
      })

      it('rejects invalid phone numbers', () => {
        const result = validateAgainstSchema('12345', 'phone')
        expect(result.valid).toBe(false)
      })

      it('rejects phone numbers starting with wrong digit', () => {
        const result = validateAgainstSchema('5876543210', 'phone')
        expect(result.valid).toBe(false)
      })
    })

    describe('name validation', () => {
      it('validates correct names', () => {
        const result = validateAgainstSchema('John O\'Brien', 'name')
        expect(result.valid).toBe(true)
      })

      it('rejects names with special characters', () => {
        const result = validateAgainstSchema('John123', 'name')
        expect(result.valid).toBe(false)
      })

      it('rejects too short names', () => {
        const result = validateAgainstSchema('A', 'name')
        expect(result.valid).toBe(false)
      })
    })

    describe('pincode validation', () => {
      it('validates 6-digit pincodes', () => {
        const result = validateAgainstSchema('400001', 'pincode')
        expect(result.valid).toBe(true)
      })

      it('rejects non-6-digit pincodes', () => {
        const result = validateAgainstSchema('12345', 'pincode')
        expect(result.valid).toBe(false)
      })
    })

    describe('url validation', () => {
      it('validates http/https URLs', () => {
        const result = validateAgainstSchema('https://example.com/path', 'url')
        expect(result.valid).toBe(true)
      })

      it('rejects javascript: URLs', () => {
        const result = validateAgainstSchema('javascript:alert(1)', 'url')
        expect(result.valid).toBe(false)
      })

      it('rejects data: URLs', () => {
        const result = validateAgainstSchema('data:text/html,<script>alert(1)</script>', 'url')
        expect(result.valid).toBe(false)
      })
    })

    it('returns error for unknown schema', () => {
      const result = validateAgainstSchema('test', 'unknown' as any)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Unknown schema')
    })

    it('returns error for empty/null input', () => {
      const result = validateAgainstSchema('', 'email')
      expect(result.valid).toBe(false)
    })
  })
})

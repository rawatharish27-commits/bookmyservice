/**
 * ─── Tracking Service — Configuration ──────────────────────────────────
 *
 * Centralized configuration constants for the tracking service.
 * All values are sourced from environment variables with sensible defaults.
 */

export const PORT = 3003

export const JWT_SECRET = process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024'

// Allowed CORS origins — matches main API service
export const ALLOWED_ORIGINS = [
  'https://bookmyservice.pages.dev',
  'https://bookyourservice.co.in',
  'https://www.bookyourservice.co.in',
  'https://bookmyservice-eta.vercel.app',
  'https://servicebooking-u2wa.onrender.com',
]

// Redis URL for Socket.IO adapter (horizontal scaling)
// If not set, the service runs in single-instance mode (in-memory only)
export const REDIS_URL = process.env.REDIS_URL || ''

/**
 * Check if an origin is allowed for CORS.
 * Allows production origins plus any localhost/127.0.0.1 origin (for development).
 */
export function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true
  return false
}

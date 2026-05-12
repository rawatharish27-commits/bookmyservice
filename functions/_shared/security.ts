/**
 * Security utilities: Rate limiting, input sanitization, request validation.
 */

// ─── Rate Limiting (in-memory, per-worker) ──────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  '/api/auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  '/api/auth/change-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  '/api/contact': { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  '__default': { windowMs: 60 * 1000, maxRequests: 60 },
};

export function checkRateLimit(path: string, ip: string): { allowed: boolean; retryAfterMs: number } {
  const config = RATE_LIMITS[path] || RATE_LIMITS['__default'];
  const key = `${path}:${ip}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')           // Remove < and > to prevent XSS
    .replace(/['";]/g, '')          // Remove quotes to prevent SQL injection
    .replace(/--/g, '')             // Remove SQL comments
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b/gi, '') // Remove SQL keywords
    .trim()
    .slice(0, 1000);               // Limit length
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, 50); // Limit array size
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  return sanitized as T;
}

// ─── Request Validation ──────────────────────────────────────────────────────

const MAX_REQUEST_SIZE = 1024 * 100; // 100KB

export async function validateRequestSize(request: Request): Promise<boolean> {
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return false;
  }
  return true;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be at most 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  return { valid: errors.length === 0, errors };
}

export function validatePrice(price: number): boolean {
  return Number.isFinite(price) && price >= 199 && price <= 499;
}

// ─── IP Extraction ───────────────────────────────────────────────────────────

export function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  );
}

/**
 * Global middleware for all Cloudflare Pages Functions.
 * Handles: Security headers, CORS, Rate limiting, Request validation.
 */

import { checkRateLimit, getClientIP, validateRequestSize } from './_shared/security';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'none';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Max-Age': '86400',
};

const ALLOWED_ORIGINS = [
  'https://bookyourservice.co.in',
  'https://www.bookyourservice.co.in',
  'https://bookyourservice.pages.dev',
];

function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Allow Cloudflare Pages preview URLs
  if (origin.endsWith('.pages.dev')) return origin;
  return ALLOWED_ORIGINS[0];
}

export async function onRequest(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Origin': getCorsOrigin(request),
      },
    });
  }

  // Rate limiting for API routes
  if (path.startsWith('/api/')) {
    const ip = getClientIP(request);
    const { allowed, retryAfterMs } = checkRateLimit(path, ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
          ...SECURITY_HEADERS,
        },
      });
    }

    // Validate request size for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const validSize = await validateRequestSize(request);
      if (!validSize) {
        return new Response(JSON.stringify({ error: 'Request payload too large. Maximum 100KB allowed.' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
        });
      }
    }
  }

  // Proceed to the actual handler
  const response = await next();

  // Add security and CORS headers to all responses
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newHeaders.set(key, value);
  }
  newHeaders.set('Access-Control-Allow-Origin', getCorsOrigin(request));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

# Task 13 — Cloudflare Configuration for Production Security

## Agent: Cloudflare Security Agent

## Work Completed

### 1. Cloudflare Pages Headers — `frontend/public/_headers` (NEW)
- Created `_headers` file with comprehensive security headers for all routes:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(self)
  - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Static asset caching: `/assets/*` with immutable 1-year cache
- HTML short cache with must-revalidate: `/*.html`
- Service worker no-cache: `/sw.js`
- API routes no-cache: `/api/*`

### 2. Cloudflare Pages _redirects — `frontend/public/_redirects` (UPDATED)
- Updated existing `_redirects` from `/* /index.html 200` to include:
  - API proxy: `/api/*` → `https://bookmyservice-api.onrender.com/api/:splat` (200)
  - SPA fallback: `/*` → `/index.html` (200)

### 3. Cloudflare Wrangler Config — `frontend/wrangler.toml` (NEW)
- Created wrangler.toml for Cloudflare Pages deployment
- Bucket: `./dist` (Vite build output)
- Environment variables: `VITE_API_URL` for production and staging
- Production: `https://bookmyservice-api.onrender.com`
- Staging: `https://bookmyservice-api-staging.onrender.com`

### 4. Backend Cloudflare Module — `mini-services/api-service/lib/cloudflare.ts` (NEW)
- `getCloudflareRealIP(c)` — Extracts real IP from CF-Connecting-IP, X-Forwarded-For, X-Real-IP
- `cloudflareCacheHeaders(ttl)` — Hono middleware that sets Cache-Control, CDN-Cache-Control, Cloudflare-CDN-Cache-Control for CDN edge caching
- `isCloudflareRequest(c)` — Checks for CF-specific headers
- `getCloudflareCountry(c)` — Gets country from CF-IPCountry header
- `getCloudflareRayID(c)` — Gets Cloudflare Ray ID for request tracing
- `botProtectionMiddleware()` — Blocks known bad bots (sqlmap, nikto, nmap, etc.) and suspicious user agents; integrates with CF Bot Management score headers
- `ddosThrottleMiddleware()` — Per-IP request throttling (100 req/min, 5-min block on exceed); uses getCloudflareRealIP() for accurate detection; periodic cleanup of throttle state
- `getCloudflareConfig()` — Returns CF configuration status + throttle metrics for health monitoring
- `clearThrottleForIP()`, `blacklistIP()`, `unblacklistIP()` — Admin utilities

### 5. Integrated Cloudflare Module into `mini-services/api-service/index.ts` (ADDITIVE)
- Added imports: `getCloudflareRealIP`, `cloudflareCacheHeaders`, `botProtectionMiddleware`, `getCloudflareConfig`, `ddosThrottleMiddleware` from `./lib/cloudflare`
- Added import: `requestValidationMiddleware` from `./lib/security`
- Updated rate limiter key generator to use `getCloudflareRealIP(c)` instead of raw `x-forwarded-for` header
- Added bot protection middleware BEFORE rate limiter: `app.use('/api/*', botProtectionMiddleware())`
- Added DDoS throttle middleware: `app.use('/api/*', ddosThrottleMiddleware())`
- Added request validation middleware: `app.use('/api/*', requestValidationMiddleware())`
- Added CDN cache headers for public GET endpoints:
  - `/api/categories` + `/api/categories/*` — 5 min (300s)
  - `/api/services` + `/api/services/*` — 3 min (180s)
  - `/api/stats` + `/api/stats/*` — 5 min (300s)
- Added `cloudflare: getCloudflareConfig()` to health endpoint response

### 6. Security Utilities Module — `mini-services/api-service/lib/security.ts` (NEW)
- `sanitizeInput(input)` — Removes XSS vectors (script tags, event handlers, javascript: URLs, etc.)
- `isValidOrigin(origin, allowedOrigins)` — Origin validation with wildcard subdomain support
- `generateCSPNonce()` — Cryptographically secure CSP nonce generation
- `detectSQLInjection(input)` — Detects SQL injection patterns (UNION SELECT, OR 1=1, etc.)
- `detectXSS(input)` — Detects XSS patterns (script tags, event handlers, encoded variants)
- `securityHeadersMiddleware()` — Enhanced security headers (HSTS, Permissions-Policy, CSP with nonce)
- `requestValidationMiddleware()` — Validates request patterns:
  - Path traversal detection (../, ..%2f, double-encoding)
  - Null byte injection
  - Excessive path depth (>20 segments)
  - Query parameter length limit (5000 chars)
  - SQL injection detection in path/query
  - XSS detection in path/query
  - Header injection (CRLF in Host)
  - CSP nonce generation per request

### 7. Cloudflare Deployment Guide — `CLOUDFLARE_SETUP.md` (NEW)
Comprehensive 13-section guide covering:
1. DNS Setup (nameserver configuration, DNS records)
2. SSL/TLS Configuration (Full strict, HSTS, TLS 1.3)
3. Cloudflare Pages Deployment (repo connection, env vars, custom domain)
4. Page Rules for Caching (static assets, API bypass, HTTPS redirect)
5. Firewall Rules (bot blocking, country restrictions, SQL injection patterns)
6. Workers for Edge Caching (API cache worker with HIT/MISS headers)
7. Rate Limiting Rules (global, auth, login, booking)
8. Analytics Setup (Web Analytics, Logpush, monitoring alerts)
9. WAF Settings (managed rules, OWASP, bot management)
10. Performance Optimization (Brotli, Early Hints, caching config)
11. Backend CORS Configuration
12. Deployment Checklist
13. Troubleshooting

## Testing Results
- API starts successfully with all new middleware
- Health endpoint returns `cloudflare` config section with throttle metrics
- Cache headers verified on public GET endpoints:
  - `/api/categories`: `cache-control: public, max-age=300, s-maxage=300`
  - `/api/services`: `cache-control: public, max-age=180, s-maxage=180`
  - `/api/stats`: `cache-control: public, max-age=300, s-maxage=300`
- Bot protection does NOT block legitimate tools (curl, browsers)
- Bot protection DOES block known attack tools (sqlmap, nikto, nmap, etc.)
- DDoS throttle tracks active IPs and blocks abusers
- Security headers present on all API responses
- Next.js frontend still renders correctly
- All existing routes and services preserved (no deletions)

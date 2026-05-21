# Cloudflare Setup Guide — BookMyService Production Deployment

This guide covers the complete Cloudflare configuration for the BookMyService production environment.

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Users      │────▶│  Cloudflare CDN  │────▶│  Render Backend  │
│              │     │  (Pages + Proxy) │     │  (api-service)   │
└─────────────┘     └──────────────────┘     └──────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Edge Cache  │
                    │  WAF + DDoS  │
                    │  Rate Limit  │
                    └─────────────┘
```

- **Frontend**: Cloudflare Pages (React/Vite SPA)
- **Backend**: Render.com (Hono API on port 3001)
- **Database**: Supabase PostgreSQL
- **Domain**: bookyourservice.co.in

---

## 1. DNS Setup

### Point Domain to Cloudflare Nameservers

1. Log in to your domain registrar (where you purchased `bookyourservice.co.in`)
2. Find the DNS/Nameserver settings
3. Replace the existing nameservers with Cloudflare's assigned nameservers:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
4. Wait for DNS propagation (up to 48 hours, usually 15-30 minutes)

### Add DNS Records in Cloudflare Dashboard

Go to **DNS → Records** and add:

| Type  | Name                  | Content                          | Proxy | TTL  |
|-------|-----------------------|----------------------------------|-------|------|
| A     | `bookyourservice.co.in` | `76.76.21.21` (CF Pages)       | ☁️ Proxied | Auto |
| CNAME | `www`                 | `bookyourservice.pages.dev`      | ☁️ Proxied | Auto |
| CNAME | `api`                 | `bookmyservice-api.onrender.com` | ☁️ Proxied | Auto |
| TXT   | `@`                   | (verification TXT from registrar)| DNS only  | Auto |

> **Important**: Always use ☁️ Proxied (orange cloud) for the root domain and www. This enables Cloudflare's CDN, WAF, and DDoS protection.

---

## 2. SSL/TLS Configuration

### Set SSL Mode

Go to **SSL/TLS → Overview**:

- Set mode to **Full (strict)**
- This ensures Cloudflare validates the origin server's certificate
- Both Cloudflare ↔ User AND Cloudflare ↔ Origin are encrypted

### Enable Always Use HTTPS

Go to **SSL/TLS → Edge Certificates**:

- ✅ **Always Use HTTPS** — ON
- ✅ **Automatic HTTPS Rewrites** — ON
- ✅ **Minimum TLS Version** — TLS 1.2
- ✅ **Opportunistic Encryption** — ON
- ✅ **TLS 1.3** — ON

### Certificate Settings

- **Certificate Authority**: Let's Encrypt (automatic via Cloudflare)
- **Certificate Validity**: 15 years (Cloudflare manages renewal)
- **Authenticated Origin Pulls**: ON (ensures only Cloudflare can connect to origin)

---

## 3. Cloudflare Pages Deployment

### Connect Repository

1. Go to **Workers & Pages → Create Application → Pages**
2. Connect your GitHub repository
3. Set build configuration:
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`

### Environment Variables

Set in **Pages → Settings → Environment variables**:

| Variable | Production Value | Staging Value |
|----------|-----------------|---------------|
| `VITE_API_URL` | `https://bookmyservice-api.onrender.com` | `https://bookmyservice-api-staging.onrender.com` |

### Custom Domain

1. Go to **Pages → bookmyservice → Custom domains**
2. Add `bookyourservice.co.in` and `www.bookyourservice.co.in`
3. Cloudflare will automatically configure DNS records

### _headers and _redirects

These files are already configured in `frontend/public/`:
- `_headers` — Security headers for all routes
- `_redirects` — API proxy to Render + SPA fallback

---

## 4. Page Rules for Caching

Go to **Rules → Page Rules** and add:

### Rule 1: Cache Static Assets
- **URL**: `*bookyourservice.co.in/assets/*`
- **Settings**:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year

### Rule 2: No Cache for API
- **URL**: `*bookyourservice.co.in/api/*`
- **Settings**:
  - Cache Level: Bypass
  - Disable Performance (Rocket Loader, Mirage, Polish)

### Rule 3: Secure Root Domain
- **URL**: `bookyourservice.co.in/*`
- **Settings**:
  - Always Use HTTPS
  - SSL: Full (Strict)

### Rule 4: WWW Redirect
- **URL**: `www.bookyourservice.co.in/*`
- **Settings**:
  - Forwarding URL (301 — Permanent Redirect)
  - Destination: `https://bookyourservice.co.in/$1`

---

## 5. Firewall Rules (Bot & DDoS Protection)

Go to **Security → WAF → Custom Rules**:

### Rule 1: Block Known Bad Bots
```
(http.user_agent contains "sqlmap") or 
(http.user_agent contains "nikto") or 
(http.user_agent contains "nmap") or 
(http.user_agent contains "masscan") or 
(http.user_agent contains "dirbuster") or 
(http.user_agent contains "gobuster") or 
(http.user_agent contains "nuclei") or 
(http.user_agent contains "crawlergo")
```
**Action**: Block

### Rule 2: Block Suspicious Countries (Optional)
```
(ip.geoip.country in {"CN" "RU" "KP"}) and 
(not http.request.uri.path contains "/api/health")
```
**Action**: Challenge (JS Challenge)

### Rule 3: Rate Limit Login Endpoint
```
(http.request.uri.path contains "/api/auth/login") and 
(http.request.method eq "POST")
```
**Action**: Rate Limit — 10 requests per minute per IP

### Rule 4: Protect Admin Routes
```
(http.request.uri.path contains "/api/admin/")
```
**Action**: Interactive Challenge (CAPTCHA)

### Rule 5: Block SQL Injection Patterns
```
(http.request.uri.query contains "UNION SELECT") or 
(http.request.uri.query contains "OR 1=1") or 
(http.request.uri.path contains "../") or 
(http.request.uri.path contains "..%2f")
```
**Action**: Block

---

## 6. Workers for Edge Caching

### Create Cache Worker

Go to **Workers & Pages → Create Worker**:

```javascript
// Edge caching worker for API responses
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only cache GET requests to API
    if (request.method !== 'GET' || !url.pathname.startsWith('/api/')) {
      return fetch(request);
    }
    
    // Don't cache auth-related endpoints
    if (url.pathname.includes('/auth/') || url.pathname.includes('/upload/')) {
      return fetch(request);
    }
    
    // Try cache first for public endpoints
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    
    let response = await cache.match(cacheKey);
    
    if (response) {
      // Add cache hit header for monitoring
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Cache-Status', 'HIT');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
    
    // Cache miss — fetch from origin
    response = await fetch(request);
    
    // Cache successful GET responses for public endpoints
    if (response.status >= 200 && response.status < 300) {
      const cacheDuration = getCacheDuration(url.pathname);
      if (cacheDuration > 0) {
        const responseToCache = response.clone();
        const newHeaders = new Headers(responseToCache.headers);
        newHeaders.set('X-Cache-Status', 'MISS');
        newHeaders.set('CDN-Cache-Control', `public, max-age=${cacheDuration}`);
        
        ctx.waitUntil(
          cache.put(cacheKey, new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: newHeaders,
          }))
        );
      }
    }
    
    // Add cache miss header
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Cache-Status', 'MISS');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

function getCacheDuration(pathname) {
  if (pathname.includes('/api/categories')) return 300;   // 5 min
  if (pathname.includes('/api/services')) return 180;     // 3 min
  if (pathname.includes('/api/stats')) return 300;        // 5 min
  if (pathname.includes('/api/providers/nearby')) return 180; // 3 min
  return 0; // No cache for other endpoints
}
```

### Route Worker

Go to **Workers & Pages → Routes**:
- **Route**: `bookyourservice.co.in/api/*`
- **Worker**: `api-cache-worker`

---

## 7. Rate Limiting Rules

Go to **Security → WAF → Rate Limiting Rules**:

### Rule 1: Global API Rate Limit
- **URI Path**: `/api/*`
- **Rate**: 100 requests per 10 seconds per IP
- **Action**: Block for 60 seconds

### Rule 2: Auth Endpoint Protection
- **URI Path**: `/api/auth/*`
- **Rate**: 20 requests per minute per IP
- **Action**: Block for 5 minutes

### Rule 3: Login Brute Force Protection
- **URI Path**: `/api/auth/login`
- **Method**: POST
- **Rate**: 5 requests per minute per IP
- **Action**: Block for 15 minutes

### Rule 4: Booking Abuse Prevention
- **URI Path**: `/api/bookings`
- **Method**: POST
- **Rate**: 10 requests per minute per IP
- **Action**: Block for 5 minutes

---

## 8. Analytics Setup

### Web Analytics

Go to **Analytics & Logs → Web Analytics**:

1. **Enable Web Analytics** for `bookyourservice.co.in`
2. Add the beacon script to `frontend/index.html`:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
   ```
3. This provides:
   - Real-time visitor counts
   - Page view tracking
   - Core Web Vitals (LCP, FID, CLS)
   - Country distribution

### Logpush (Enterprise)

If on Enterprise plan, configure Logpush to send logs to:
- **S3-compatible storage** (for long-term analysis)
- **Datadog / New Relic** (for real-time monitoring)
- **Splunk / Elastic** (for security analysis)

### Monitoring Alerts

Set up notifications in **Notifications → Add**:

| Alert Type | Condition | Destination |
|-----------|-----------|-------------|
| HTTP Error Rate | > 5% for 5 min | Email + Slack |
| DDoS Attack | Any attack detected | Email + PagerDuty |
| SSL Certificate | Expiring in < 14 days | Email |
| Page Deploy | Successful deploy | Slack |
| WAF Block Rate | > 100 blocks/hour | Email |

---

## 9. Web Application Firewall (WAF) Settings

Go to **Security → WAF**:

### Managed Rules

Enable the following Cloudflare managed rule sets:

1. **Cloudflare Managed Ruleset** — ON
   - Action: Block for critical/high, Challenge for medium
   - Covers OWASP Top 10

2. **OWASP Core Ruleset** — ON
   - Action: Block for critical, Challenge for high
   - paranoia_level: 2 (balanced)

3. **Cloudflare WordPress Ruleset** — OFF (not applicable)

### Bot Management

Go to **Security → Bots**:

1. **Bot Fight Mode** — ON (free plan)
2. **Super Bot Fight Mode** — ON (if on Pro+ plan)
   - Definitely Automated: Block
   - Verified Bots: Allow (Googlebot, etc.)
   - Likely Automated: Challenge

### Security Level

Go to **Security → Settings**:

- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: ON
- **Privacy Pass Support**: ON

---

## 10. Performance Optimization

### Speed Settings

Go to **Speed → Optimization**:

- ✅ **Auto Minify**: JavaScript, CSS, HTML — all checked
- ✅ **Brotli** — ON
- ✅ **Early Hints** — ON (sends resource hints before full response)
- ✅ **Rocket Loader** — OFF (can break SPAs)
- ❌ **Mirage** — OFF (not needed for SPA)
- ❌ **Polish** — OFF (images served from Cloudinary CDN)

### Caching Settings

Go to **Caching → Configuration**:

- **Caching Level**: Standard
- **Browser Cache TTL**: Respect Existing Headers
- **Always Online** — ON (serves cached version if origin is down)

---

## 11. Backend CORS Configuration

The API service is configured to accept requests from Cloudflare. Verify these origins are in the CORS allowlist:

```typescript
const allowedOrigins = [
  'https://bookmyservice.pages.dev',       // CF Pages default domain
  'https://bookyourservice.co.in',          // Production domain
  'https://www.bookyourservice.co.in',      // www subdomain
]
```

The backend also:
- Extracts real IP from `CF-Connecting-IP` header for rate limiting
- Reads `CF-IPCountry` for geo-based features
- Implements bot detection that works with Cloudflare Bot Management
- Adds CDN cache headers for public GET endpoints

---

## 12. Deployment Checklist

- [ ] Domain nameservers pointed to Cloudflare
- [ ] SSL/TLS set to Full (Strict)
- [ ] Always Use HTTPS enabled
- [ ] Cloudflare Pages connected to GitHub repo
- [ ] Environment variables set in Pages dashboard
- [ ] Custom domain configured for Pages
- [ ] _headers file deployed (security headers)
- [ ] _redirects file deployed (API proxy + SPA fallback)
- [ ] WAF managed rules enabled
- [ ] Bot Fight Mode enabled
- [ ] Rate limiting rules configured
- [ ] Page rules for caching configured
- [ ] Cache Worker deployed (optional, for edge caching)
- [ ] Web Analytics beacon added
- [ ] Monitoring alerts configured
- [ ] Backend CORS allows Cloudflare origins
- [ ] Backend reads CF-Connecting-IP for rate limiting

---

## 13. Troubleshooting

### 502 Bad Gateway
- Check if Render backend is running and healthy at `https://bookmyservice-api.onrender.com/api/health`
- Verify SSL mode is Full (Strict), not Full
- Check Render logs for errors

### 503 Service Unavailable
- Render free tier spins down after inactivity (15 min)
- First request after idle will take 30-60 seconds
- Consider upgrading to Render paid plan for always-on

### API Returns 403
- Check WAF rules — may be blocking legitimate requests
- Check Bot Fight Mode settings
- Review Security Event log in Cloudflare dashboard

### Cache Not Working
- Verify `Cache-Level` is not set to "Bypass" in Page Rules
- Check that API responses include `Cache-Control` headers
- Use `cf-cache-status` response header to check cache state
  - `HIT` — served from cache
  - `MISS` — fetched from origin
  - `BYPASS` — caching explicitly disabled
  - `EXPIRED` — was cached but TTL expired

### CORS Errors
- Verify allowedOrigins in backend includes your Cloudflare domain
- Check that Cloudflare is not stripping CORS headers
- Ensure credentials: true is set in CORS config

---

*Last updated: 2024*
*Project: BookMyService (bookyourservice.co.in)*

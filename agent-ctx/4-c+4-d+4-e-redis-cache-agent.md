# Task 4-c + 4-d + 4-e: Redis Caching Layer

## Summary
Added comprehensive Redis caching layer to the bookmyservice api-service with graceful in-memory fallback when REDIS_URL is not set.

## Changes Made to `/home/z/my-project/mini-services/api-service/index.ts`

### A. Redis Import (line 14)
- Added `import { redis, CacheKeys, CacheTTL } from './lib/redis'`

### B. Cache-First Pattern on 6 Read Endpoints
1. **GET /api/stats/platform** — `CacheKeys.platformStats()`, TTL LONG (5 min)
2. **GET /api/categories** — `CacheKeys.categoriesAll()`, TTL LONG (5 min)
3. **GET /api/categories/:id** — `CacheKeys.categoryDetail(id)`, TTL LONG (5 min)
4. **GET /api/services** — `CacheKeys.servicesList(limit, offset, categoryId, search)`, TTL MEDIUM (3 min)
5. **GET /api/services/:id** — `CacheKeys.serviceDetail(id)`, TTL MEDIUM (3 min)
6. **GET /api/providers/nearby** — `CacheKeys.nearbyProviders(lat, lng, radius, categoryId)`, TTL MEDIUM (3 min)

### C. Cache Invalidation on 4 Write Endpoints
1. **POST /api/services** — `redis.delByPattern('cache:services:*')` + `redis.delByPattern('cache:categories:*')`
2. **PATCH /api/services/:id** — `redis.del(CacheKeys.serviceDetail(id))` + `redis.delByPattern('cache:services:*')`
3. **POST /api/admin/categories** — `redis.delByPattern('cache:categories:*')`
4. **POST /api/bookings** — `redis.delByPattern('cache:stats:*')`

### D. Redis OTP (replaced in-memory __resetTokens)
- **POST /api/auth/forgot-password**: Uses `redis.set(resetToken:${email}, JSON, 3600000)`
- **POST /api/auth/reset-password**: Uses `redis.get(resetToken:${email})` + `redis.del(resetToken:${email})`

### E. Popular Search Tracking
- When `/api/services` is called with `search` param, calls `redis.trackSearch(search)` (non-blocking)

### F. Popular Searches Endpoint
- Added `GET /api/popular-searches` returning `{ searches, total }`

### G. Health Endpoint Cache Status
- Updated `GET /api/health` to include `cache: await redis.ping()` result

## Testing Results
- `/api/health` returns `{"status":"ok","service":"bookmyservice-api","cache":{"ok":true,"backend":"memory","latencyMs":0}}`
- `/api/popular-searches` returns `{"searches":[],"total":0}`
- `/api/stats/platform` returns fallback data with caching working
- All 15 automated checks passed

## Key Design Decisions
- All cache writes are NON-BLOCKING (fire-and-forget with `.catch(() => {})`)
- Redis reads gracefully fall back to in-memory cache when Redis is unavailable
- In-memory cache falls back to DB query when neither Redis nor memory has cached data
- No existing routes or services were deleted or restructured

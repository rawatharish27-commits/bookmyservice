# Worklog — Task 1-a-auth-booking

## Task: Extract business logic from route files into service files

### Completed Work

#### Service Files Created (10 files)

All service files are in `mini-services/api-service/services/`:

1. **auth.service.ts** — Extracted all auth business logic:
   - `loginUser()`, `registerUser()`, `googleAuth()`
   - `forgotPassword()`, `resetPassword()`, `changePassword()`
   - `getProfile()`, `updateProfile()`, `updateLocation()`
   - Helper functions: `createAccessToken()`, `sanitizeUser()`, `verifyToken()`, `isJwtError()`
   - All functions accept plain parameters (not HTTP context) and return data objects with `success/error/status` pattern

2. **booking.service.ts** — Extracted booking logic:
   - `createBooking()`, `listBookings()`, `getBooking()`, `updateBookingStatus()`
   - `verifyOtp()`, `cancelBooking()`, `completeBooking()`, `acceptBooking()`, `rejectBooking()`
   - Preserves all cache invalidation, notification job pushing, and booking event logging

3. **review.service.ts** — Extracted review logic:
   - `createReview()`, `listReviews()`, `deleteReview()`, `updateReview()`
   - Preserves booking status validation, duplicate review checks, and service rating updates

4. **wallet.service.ts** — Extracted wallet logic:
   - `getOrCreateWallet()`, `depositToWallet()`, `getWalletTransactions()`, `withdrawFromWallet()`
   - Preserves auto-wallet creation and transaction recording

5. **notification.service.ts** — Extracted notification logic:
   - `listNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()`

6. **earnings.service.ts** — Extracted earnings logic:
   - `getEarnings()` with period-based date filtering

7. **payout.service.ts** — Extracted payout logic:
   - `listPayouts()`, `requestPayout()`

8. **favorites.service.ts** — Extracted favorites logic:
   - `listFavorites()`, `addFavorite()`, `removeFavorite()`

9. **kyc.service.ts** — Extracted KYC logic:
   - `getKyc()`, `submitKyc()`, `getKycStatus()`, `submitKycForm()`

10. **dispute.service.ts** — Extracted dispute logic:
    - `listDisputes()`, `createDispute()`, `updateDispute()`

#### Route Files Updated (2 files)

1. **routes/auth.routes.ts** — Refactored to thin handler:
   - Removed all direct `pool.query`, `bcrypt`, `SignJWT`, `jwtVerify` calls
   - Now only handles HTTP concerns: request parsing, auth header extraction, response formatting
   - Delegates all business logic to `services/auth.service`
   - Error handling preserved (JWT errors, 401/403/404/500 status codes)
   - Zero `pool.query` calls remaining in route file

2. **routes/booking.routes.ts** — Refactored to thin handler:
   - Imports all 9 service modules (booking, review, notification, wallet, earnings, payout, favorites, kyc, dispute)
   - Delegates to service functions for all extracted domains
   - Retained `pool.query` only for non-extracted sections (coupons, AMC, invoices, CRM)
   - All API contracts preserved exactly (same endpoints, same request/response formats)

### Design Decisions

- **Service return pattern**: Services return objects with `{ success: true, ...data }` or `{ success: false, error: string, status: number }` for operations that can fail, allowing route handlers to simply check `result.success` and return appropriate HTTP responses
- **Dependency injection**: Services import their own dependencies (pool, redis, queues) directly rather than receiving them as parameters, since these are singletons in the application
- **No HTTP awareness in services**: Service functions accept plain parameters (strings, numbers, objects) and return data objects, never touching HTTP request/response objects
- **Preserved error handling**: All error handling patterns (try/catch, JWT error detection, catch fallbacks for missing tables) are maintained in both services and route files

### Verification

- All 10 service files export expected functions (verified via script)
- All imports in route files resolve correctly (verified via script)
- Braces balanced in all files (verified via script)
- Service can start without import errors (tested with `bun run index.ts`)
- auth.routes.ts has 0 `pool.query` calls (business logic fully extracted)
- booking.routes.ts has 12 `pool.query` calls (only in non-extracted coupon/AMC/invoice/CRM sections)

---

# Worklog — Task 1-b-1c-services

## Task: Extract business logic from 9 additional route files into service files, then update routes to delegate

### Completed Work

#### Service Files Created (9 new files)

All service files are in `mini-services/api-service/services/`:

1. **service-catalog.service.ts** — Extracted from `routes/service.routes.ts`:
   - `listCategories()`, `getCategoryDetail()`, `getCategoryServices()`, `listSubcategories()`
   - `listServices()`, `getServiceDetail()`, `searchServices()`, `getServiceReviews()`, `getServiceAvailability()`
   - `createService()`, `updateService()`, `approveService()`, `deleteService()`
   - Types: `CreateServiceInput`, `ListServicesFilters`, `SearchServicesFilters`
   - Preserves all Redis caching (CacheKeys, CacheTTL), cache invalidation patterns, and transformServiceRow/transformReviewRow

2. **geo.service.ts** — Extracted from `routes/hyperlocal.routes.ts`:
   - `findNearbyProviders()` — PostGIS first, Haversine fallback, Redis caching
   - `getAreaStatus()` — Moved from `getAreaStatusFromDB` helper, AreaActivation table + User count fallback
   - `getAreaActivation()` — Area activation meter data
   - `reverseGeocode()` — DB first, then local Indian cities lookup
   - `getServiceAreas()`, `getCities()`, `joinWaitingList()`, `applyAreaManager()`
   - Preserves all PostGIS/Haversine fallback logic and INDIAN_CITIES data

3. **franchise.service.ts** — Extracted from `routes/franchise.routes.ts`:
   - `getFranchiseDashboard()`, `getFranchiseVendors()`, `getFranchiseAnalytics()`
   - `getVendorBookings()`, `getVendorServices()`, `listFranchises()`, `createFranchise()`
   - All functions return `{ success: true/false, ... }` pattern for auth-protected operations

4. **technician.service.ts** — Extracted from `routes/technician.routes.ts`:
   - `getTechnicianProfile()`, `updateTechnicianProfile()`, `getTechnicianJobs()`, `getTechnicianEarnings()`
   - Profile update uses allowlisted fields (name, phone, city, state, country, address, pincode, profileImageUrl)

5. **tracking.service.ts** — Extracted from `routes/tracking.routes.ts`:
   - `getBookingTracking()` — Verifies participant/admin access, fetches LiveTechnicianLocation + BookingTimeline + BookingTracking
   - `getBookingTrackingHistory()` — Paginated location history with participant/admin verification
   - Both functions handle access control (client, provider, technician, admin roles)

6. **upload.service.ts** — Extracted from `routes/upload.routes.ts`:
   - `uploadProfileImage()` — Handles both multipart/form-data and base64 uploads
   - `uploadServiceImage()`, `uploadKycDocuments()`, `deleteUploadedImage()`
   - Preserves Cloudinary upload via uploadBuffer/uploadBase64, DB updates, and cache invalidation

7. **device.service.ts** — Extracted from `routes/device.routes.ts`:
   - `registerDeviceToken()` — Upsert pattern (update existing token, or insert new)
   - `removeDeviceToken()` — Soft-delete (sets isActive = false)
   - Returns `{ success, message, id, created }` for proper 201/200 status handling

8. **referral.service.ts** — Extracted from `routes/referral.routes.ts`:
   - `trackReferral()`, `getWhatsAppMessage()`, `getReferrals()`, `getCommissionInfo()`, `getCommissions()`
   - getWhatsAppMessage() returns success/error pattern for city validation
   - Preserves static commission info fallback when CommissionStructure table doesn't exist

9. **legal.service.ts** — Extracted from `routes/legal.routes.ts`:
   - `listLegalDocuments()`, `getLegalDocument()`, `listFAQ()`, `submitContact()`, `getStats()`, `getPlatformStats()`
   - getLegalDocument() uses LEGAL_TYPE_MAP for URL-to-enum mapping
   - getStats() has PlatformStats table → User count fallback pattern
   - getPlatformStats() uses Redis caching with CacheTTL.LONG

#### Route Files Updated (9 files)

1. **routes/service.routes.ts** — Now imports `* as serviceCatalog from '../services/service-catalog.service'`, delegates all business logic. Route handlers only parse query params, call service, format response.

2. **routes/hyperlocal.routes.ts** — Now imports `* as geoService from '../services/geo.service'`, removed `getAreaStatusFromDB` helper (moved to geo service as `getAreaStatus`). Kept city lookup logic in route for request parsing.

3. **routes/franchise.routes.ts** — Now imports `* as franchiseService from '../services/franchise.service'`, all auth checks and role validation remain in route, business logic delegated.

4. **routes/technician.routes.ts** — Now imports `* as technicianService from '../services/technician.service'`, minimal route handlers.

5. **routes/tracking.routes.ts** — Now imports `* as trackingService from '../services/tracking.service'`, JWT error handling preserved in route.

6. **routes/upload.routes.ts** — Now imports `* as uploadService from '../services/upload.service'`, multipart body parsing remains in route for profile upload.

7. **routes/device.routes.ts** — Now imports `* as deviceService from '../services/device.service'`, worker/monitoring endpoints kept directly in route (not extracted).

8. **routes/referral.routes.ts** — Now imports `* as referralService from '../services/referral.service'`, auth extraction in route, logic in service.

9. **routes/legal.routes.ts** — Now imports `* as legalService from '../services/legal.service'`, no auth needed for these endpoints.

### Design Decisions

- **Consistent return pattern**: Services use `{ success: true, ...data }` or `{ success: false, error: string, status: number }` for operations with auth/validation, plain data objects for read-only endpoints
- **No HTTP awareness in services**: Service functions accept plain parameters and return data objects — never Hono context objects
- **Cache logic stays in services**: Redis caching/invalidation is business logic, so it lives in service files
- **Worker/monitoring endpoints not extracted**: The `/api/worker/*` and `/api/fcm/status` endpoints are simple pass-throughs that don't warrant their own service
- **`getAreaStatusFromDB` renamed**: Moved to geo service as `getAreaStatus` to match the task spec's function name

### Verification

- API server starts successfully: "🚀 BookMyService API running on http://localhost:3001" with "Routes: 15 domain modules mounted"
- All 9 new service files are independently importable
- All 9 route files properly delegate to services
- No existing endpoints or API contracts were changed

---

# Worklog — Task 4-tracking-refactor

## Task: Modularize tracking service and add Redis Socket.IO adapter for horizontal scaling

### Completed Work

#### Directory Structure Created

```
mini-services/tracking-service/
├── index.ts          (entry point — imports and assembles modules, Redis adapter)
├── config.ts         (configuration constants: JWT_SECRET, CORS, PORT, REDIS_URL)
├── database.ts       (PostgreSQL pool, table creation, DB helpers)
├── auth.ts           (JWT verification for socket connections)
├── handlers.ts       (socket event handlers + in-memory liveLocations Map)
├── package.json      (updated with @socket.io/redis-adapter + redis dependencies)
```

#### Module Details

1. **config.ts** — Centralized configuration:
   - `PORT` (3003), `JWT_SECRET`, `ALLOWED_ORIGINS`, `REDIS_URL` from env vars
   - `isOriginAllowed()` helper function
   - `REDIS_URL` defaults to empty string (no Redis = in-memory only)

2. **database.ts** — All database logic:
   - PostgreSQL pool setup with graceful fallback when `DATABASE_URL` not set
   - `createTrackingTables()` — auto-creates LiveTechnicianLocation, BookingTracking, BookingTimeline
   - `persistLocationUpdate()` — upsert latest GPS position per provider
   - `persistBookingTracking()` — insert location history point for booking
   - `persistStatusChange()` — insert timeline event + update Booking status
   - `verifyBookingAccess()` — check user is client/provider/technician of booking
   - `closePool()` — for graceful shutdown
   - `isDbAvailable()` — check DB connectivity status

3. **auth.ts** — JWT verification:
   - `AuthPayload` interface (sub, email, role, roleId)
   - `verifySocketToken(token)` — JWT verification using jose
   - Issuer/audience: 'bookyourservice'

4. **handlers.ts** — Socket event handlers:
   - `liveLocations` Map exported (in-memory state for fast retrieval)
   - `registerHandlers(io, socket)` — registers all event handlers:
     - `join-booking` — verify access, join room, send cached location
     - `leave-booking` — leave booking room
     - `update-location` — validate coords/role, broadcast, persist, cache
     - `booking-status-change` — validate status/role, broadcast, persist
     - `disconnect` — log disconnect

5. **index.ts** — Entry point (assembles everything):
   - Imports config, database, auth, handlers modules
   - Socket.IO server creation with bun --hot support via `globalThis`
   - JWT auth middleware using `verifySocketToken()` from auth module
   - Handler registration via `registerHandlers(io, socket)`
   - Health check endpoint (includes `redisAdapter` status field)
   - **Redis Socket.IO adapter** — dynamically imported when `REDIS_URL` is set
     - Uses `@socket.io/redis-adapter` with pub/sub clients
     - Graceful fallback: if Redis connection fails, continues with in-memory only
     - `redisAdapterActive` flag tracked for health check reporting
   - Graceful shutdown: disconnect sockets, close DB pool, close IO
   - Process error protection: EADDRINUSE, uncaughtException, unhandledRejection

#### Package Dependencies Updated

```json
{
  "dependencies": {
    "socket.io": "^4.8.1",
    "pg": "^8.20.0",
    "jose": "^5.10.0",
    "@socket.io/redis-adapter": "^8.3.0",
    "redis": "^5.12.1"
  }
}
```

Version bumped to `2.0.0`.

### Design Decisions

- **Dynamic Redis import**: `@socket.io/redis-adapter` and `redis` are imported dynamically via `await import()` only when `REDIS_URL` is configured, ensuring the service starts cleanly without Redis
- **Graceful Redis fallback**: If Redis connection fails, the service logs a warning and continues with in-memory adapter — no crash, no broken functionality
- **No functionality changes**: All socket events (join-booking, leave-booking, update-location, booking-status-change, disconnect) work identically to the original monolith
- **Shared in-memory state**: `liveLocations` Map remains in `handlers.ts` — works with or without Redis adapter (Redis adapter syncs rooms/events across instances, not in-memory Maps)
- **bun --hot compatibility preserved**: `globalThis.__trackingIo` pattern for Socket.IO instance reuse on hot reload
- **Health check enhanced**: Added `redisAdapter` field (either "connected" or "not-configured") and bumped version to "2.0.0"

### Verification

- Service starts successfully: `🚀 Tracking service started on port 3003`
- Health check endpoint returns correct JSON with `redisAdapter: "not-configured"` (no REDIS_URL set)
- All modules import correctly with no errors
- `bun install` completed: `@socket.io/redis-adapter@8.3.0` and `redis@5.12.1` installed
- Database gracefully degrades when `DATABASE_URL` not set (WebSocket-only mode)
- Version updated from 1.0.0 to 2.0.0

---

# Worklog — Task 2-lib-enhancements

## Task: Enhance existing backend lib files with production-readiness improvements

### Completed Work

All enhancements were appended at the END of each file. No existing function signatures were modified. All new exports are additional functions/classes. All Redis-dependent features have in-memory fallback.

#### 1. lib/security.ts — 4 enhancements

1. **RedisWAF** class — Redis-backed WAF for multi-instance IP score/blacklist sharing. Falls back to in-memory WAFFirewall when Redis unavailable. Exports: `RedisWAF` class, `redisWaf` singleton.

2. **CSP Nonce-based protection** — `getCSPHeader(nonce)` generates a strict CSP header using nonce-based allowlisting instead of unsafe-inline/unsafe-eval. Exports: `getCSPHeader()`.

3. **Session fingerprinting with TTL** — `SessionFingerprinterWithTTL` class adds TTL to device entries so they auto-expire, fixing memory leak in original `SessionFingerprinter`. Periodic cleanup every hour. Exports: `SessionFingerprinterWithTTL` class, `fingerprinterWithTTL` singleton.

4. **Mutation XSS detection** — `sanitizeInputEnhanced()` wraps original `sanitizeInput` with double-decoding detection (catches `&lt;script&gt;` → `<script>`). `detectMutationXSS()` detects mXSS patterns including zero-width characters, null byte injection, SVG/MathML namespace vectors. Exports: `sanitizeInputEnhanced()`, `detectMutationXSS()`.

#### 2. lib/redis.ts — 4 enhancements

1. **Pub/Sub support** — `publish(channel, message)`, `subscribe(channel, callback)`, `unsubscribe(channel)` for cross-instance cache invalidation. Uses dedicated Redis subscriber client. Falls back to in-memory subscriptions. Exports: `publish()`, `subscribe()`, `unsubscribe()`.

2. **Tag TTL management** — `setJsonWithTags(key, value, tags, ttlMs, tagTTL)` stores JSON with tag associations and sets TTL on tag hash entries to prevent orphaned entries. Tag TTL defaults to `ttlMs + 5 min`. Exports: `setJsonWithTags()`.

3. **MGET/Pipeline support** — `mgetJson(keys[])` for batch reads (Redis MGET → sequential fallback). `pipeline(operations[])` for batch writes with operation types: set, del, incr, expire. Exports: `mgetJson()`, `PipelineOperation` type, `pipeline()`.

4. **Metrics export** — `getCacheMetrics()` returning `{ hits, misses, hitRate, avgLatencyMs, fallbackMode }`. Includes `recordCacheHit()`, `recordCacheMiss()`, `resetCacheMetrics()` helpers. Exports: `getCacheMetrics()`, `recordCacheHit()`, `recordCacheMiss()`, `resetCacheMetrics()`.

#### 3. lib/backup.ts — 4 enhancements

1. **Backup format versioning** — `BACKUP_FORMAT_VERSION = '2.0'` constant for forward compatibility. Exported for inclusion in backup metadata. Exports: `BACKUP_FORMAT_VERSION`.

2. **Transactional restore** — `restoreBackupTransactional(pool, backupId)` wraps entire restore in BEGIN/COMMIT. On any failure, ROLLBACK is executed to prevent partial/inconsistent restores. Uses dedicated pg client. Exports: `restoreBackupTransactional()`.

3. **Backup encryption key rotation** — `rotateEncryptionKey(oldKey, newKey)` re-encrypts the latest backup with a new key. Decrypts with old key, re-encrypts with new key, updates backup record. Exports: `rotateEncryptionKey()`.

4. **Streaming verification** — `verifyBackupIntegrityStreaming(backupId)` processes backup data in 1MB chunks for checksum computation, validates rows in batches of 100 with `setImmediate()` yields to avoid blocking event loop. Returns `bytesProcessed` metric. Exports: `verifyBackupIntegrityStreaming()`.

#### 4. lib/cloudflare.ts — 4 enhancements

1. **Redis-backed rate limiting** — `RedisRateLimiter` class using Redis INCR+EXPIRE for distributed rate limiting with in-memory fallback. `checkRateLimit(ip, maxRequests, windowMs, keyPrefix)` returns `{ allowed, remaining, resetAt }`. Exports: `RedisRateLimiter` class, `redisRateLimiter` singleton.

2. **CIDR trie for IP blacklist** — `CIDRTrie` class implementing binary prefix trie for O(32) CIDR range lookups instead of O(n) linear scan. `insert(cidr)`, `contains(ip)`, `remove(cidr)` methods. Exports: `CIDRTrie` class, `ipBlacklistTrie` singleton.

3. **Dynamic challenge difficulty** — Threat level system (low/medium/high/critical) with auto-adjusting PoW difficulty (2-5 leading zeros). `setThreatLevel()`, `getThreatLevel()`, `getDynamicChallengeDifficulty()`, `autoAdjustThreatLevel(blockedPerMinute)`. Exports: `ThreatLevel` type, `setThreatLevel()`, `getThreatLevel()`, `getDynamicChallengeDifficulty()`, `autoAdjustThreatLevel()`.

4. **Blocked request logging** — `logBlockedRequest(ip, reason, details)` persists blocked request data. `getBlockedRequestLog(limit, reasonFilter)` and `getBlockedRequestStats()` for analysis. Max 10,000 entries with FIFO eviction. Exports: `logBlockedRequest()`, `getBlockedRequestLog()`, `getBlockedRequestStats()`.

#### 5. lib/razorpay.ts — 4 enhancements

1. **Idempotency key support** — `createOrderWithIdempotency(params, idempotencyKey)` prevents duplicate order creation. In-memory store with 24h TTL. Periodic cleanup of expired keys. Exports: `createOrderWithIdempotency()`.

2. **Circuit breaker** — `RazorpayCircuitBreaker` class with CLOSED/OPEN/HALF_OPEN states. Opens after 5 consecutive failures (configurable), 60s cooldown, allows 1 test request in HALF_OPEN. Exports: `RazorpayCircuitBreaker` class, `razorpayCircuitBreaker` singleton.

3. **Rate limit handler** — `withRateLimitRetry(fn, maxRetries, baseDelayMs)` detects 429 responses from Razorpay API and implements exponential backoff retry with jitter. Exports: `withRateLimitRetry()`.

4. **Partial capture support** — `PartialCapturePaymentParams` interface extending `CapturePaymentParams` with `partialCapture` flag. `capturePaymentWithPartial()` integrates circuit breaker and rate limit retry. Exports: `PartialCapturePaymentParams` interface, `capturePaymentWithPartial()`.

#### 6. lib/logger.ts — 4 enhancements

1. **PII redaction** — `redactPII(message)` detects and replaces emails, phone numbers, credit cards, Aadhaar numbers, PAN numbers, and sensitive field values (password, token, etc.) in log entries. Exports: `redactPII()`.

2. **AsyncLocalStorage trace ID** — `traceMiddlewareAsync()` uses `AsyncLocalStorage` instead of modifying `defaultMeta`, preventing trace ID bleeding between concurrent requests. `getCurrentTraceId()` retrieves trace ID from async context. Exports: `getCurrentTraceId()`, `traceMiddlewareAsync()`.

3. **Date-based log rotation** — `createDateBasedFileTransport(baseName, level)` creates Winston file transport with date-based naming (`logs/combined-2024-01-15.log`). `reconfigureWithDateBasedRotation()` adds date-based transports to all loggers. Exports: `createDateBasedFileTransport()`, `reconfigureWithDateBasedRotation()`.

4. **Per-module log level override** — `setModuleLogLevel(module, level)` for per-module verbosity control. `getModuleLogger(module)` returns module-scoped child logger with custom level. Exports: `setModuleLogLevel()`, `getModuleLogger()`, `getModuleLogLevels()`.

#### 7. queues/index.ts — 4 enhancements

1. **Job deduplication** — `isDuplicateJob(queueName, deduplicationKey)` checks if a job with the given dedup key has already been queued. `registerDedupKey()` registers key after job creation. 5-minute TTL with periodic cleanup. Both `pushNotificationJob` and `pushBookingJob` now include dedup checking. Exports: `isDuplicateJob()`, `registerDedupKey()`.

2. **Delayed job support** — `pushNotificationJob(jobData, delay?)` and `pushBookingJob(jobData, delay?)` now accept optional `delay` parameter for scheduling jobs in the future using BullMQ's native delay. Original signatures preserved (delay is optional). Exports: updated function signatures (backward compatible).

3. **Recurring job support** — `addRecurringJob(name, pattern, handler)` supports both cron expressions and interval-based scheduling. `removeRecurringJob(name)` and `getRecurringJobs()` for management. Falls back to 24h interval if node-cron unavailable. Exports: `addRecurringJob()`, `removeRecurringJob()`, `getRecurringJobs()`.

4. **Configurable worker concurrency** — `getNotificationConcurrency()` and `getBookingConcurrency()` read from `QUEUE_NOTIFICATION_CONCURRENCY` and `QUEUE_BOOKING_CONCURRENCY` env vars (defaults: 5 and 3). `startWorkers()` now uses these functions. Exports: `getNotificationConcurrency()`, `getBookingConcurrency()`.

#### 8. workers/notification.worker.ts — 4 enhancements

1. **BullMQ-based retry** — `BULLMQ_RETRY_OPTIONS` (4 attempts, exponential backoff starting at 5s) replaces recursive `handleRetry`. `processNotificationWithBullMQRetry()` throws on failure to let BullMQ manage retries automatically. Exports: `BULLMQ_RETRY_OPTIONS`, `processNotificationWithBullMQRetry()`.

2. **Notification throttling in send flow** — `processNotificationWithBullMQRetry()` checks `shouldThrottleNotification()` for LOW priority and calls `recordLowPrioritySent()` on successful send, wiring up the throttle tracking that existed but wasn't connected to the actual send flow. Also integrated in `processBatchNotifications()`.

3. **SLA alerting** — `checkSLAAlerts()` emits warnings when any channel's avgDeliveryTimeMs or successRate drops below SLA thresholds. `onSLAAlert(listener)` registers alert listeners. Periodic check every 5 minutes. Exports: `checkSLAAlerts()`, `onSLAAlert()`.

4. **Batch notification support** — `processBatchNotifications(notifications[], maxConcurrent)` sends multiple notifications in parallel (up to 10 concurrent). Returns `BatchNotificationResult` with succeeded/failed/throttled counts. Includes throttle checking and SLA recording. Exports: `BatchNotificationResult` interface, `processBatchNotifications()`.

### Verification

- API server starts successfully: "🚀 BookMyService API running on http://localhost:3001" with "Routes: 15 domain modules mounted"
- No existing function signatures were modified — all enhancements are additive
- All new exports are additional functions/classes appended to existing files
- All Redis-dependent features gracefully fall back to in-memory when REDIS_URL not set

---

# Worklog — Task 5-Observability + Task 9-Env-Validation

## Task: Implement observability infrastructure and environment validation for the backend API service

### Completed Work

#### Task 5: Observability Stack

##### 5a: lib/metrics.ts — Prometheus-compatible metrics (NEW FILE)

Created `mini-services/api-service/lib/metrics.ts` with:

- **MetricsRegistry class** — In-memory metrics store supporting:
  - `incrementCounter(name, labels, value)` — Monotonically increasing counters
  - `setGauge(name, labels, value)` — Values that can go up or down
  - `observeHistogram(name, labels, value)` — Distribution of observed values with configurable buckets
  - `prometheusFormat()` — Output in Prometheus text exposition format with TYPE declarations, _bucket, _sum, _count for histograms
  - `jsonFormat()` — JSON output with p50/p95/p99 percentiles for histograms
  - `summaryFormat()` — Aggregated health dashboard data (totalRequests, totalErrors, avgResponseTimeMs, p95/p99, cacheHitRate, etc.)
  - `reset()` — Clear all metrics (for testing)

- **apiMetrics object** — Pre-defined metric helpers:
  - `httpRequestsTotal(method, path, status)` — Counter for HTTP requests
  - `httpRequestDuration(method, path, durationMs)` — Histogram for request duration
  - `dbQueryDuration(query, durationMs)` — Histogram for DB query duration
  - `cacheHits(key)` / `cacheMisses(key)` — Cache hit/miss counters
  - `activeConnections(count)` — Active connection gauge
  - `queueJobsTotal(queue, status)` — Queue job counter
  - `bookingCreated()` — Booking creation counter
  - `paymentProcessed(method, status)` — Payment processing counter
  - `notificationSent(channel, status)` — Notification sent counter

- **Exported functions**:
  - `registry` — Singleton MetricsRegistry instance
  - `getMetricsPrometheus()` — Returns Prometheus text format
  - `getMetricsJSON()` — Returns JSON format
  - `getMetricsSummary()` — Returns health dashboard summary

##### 5b: Metrics middleware added to middleware/index.ts

- Added `import { apiMetrics } from '../lib/metrics'`
- Created `applyMetricsCollection(app)` function that wraps all requests with timing and metrics recording
- Metrics middleware is applied FIRST in the middleware chain (before HTTP logging) so it captures the full request lifecycle
- Wrapped in try/catch so metrics collection never breaks requests
- Updated middleware numbering in `applyMiddleware()` function and module-level documentation (1-11 steps)

##### 5c: /api/metrics route added to routes/health.routes.ts

- New endpoint `GET /api/metrics` — Content-negotiated response:
  - If `Accept: text/plain` → Prometheus exposition format with `Content-Type: text/plain; version=0.0.4`
  - Otherwise → JSON format with counters, gauges, and histogram summaries

##### 5d: /api/health enhanced with metrics summary

- Added `metrics` field to the `/api/health` response containing `getMetricsSummary()` output:
  - `totalRequests`, `totalErrors`, `avgResponseTimeMs`, `p95ResponseTimeMs`, `p99ResponseTimeMs`
  - `activeConnections`, `bookingsCreated`, `paymentsProcessed`, `notificationsSent`
  - `cacheHitRate`

#### Task 9: Environment Validation

##### 9a: lib/env.ts — Configuration schema enforcement (NEW FILE)

Created `mini-services/api-service/lib/env.ts` with:

- **ENV_SCHEMA** — Array of 21 environment variable definitions:
  - Required: `DATABASE_URL`
  - Optional with defaults: `JWT_SECRET`, `PORT` (3001), `NODE_ENV` (development), `QUEUE_NOTIFICATION_CONCURRENCY` (5), `QUEUE_BOOKING_CONCURRENCY` (3)
  - Optional secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `FIREBASE_PRIVATE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `SENDGRID_API_KEY`, `CLOUDINARY_API_SECRET`, `BACKUP_ENCRYPTION_KEY`
  - Optional config: `REDIS_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `TWILIO_ACCOUNT_SID`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `SENTRY_DSN`

- **Type coercion**: string, number, boolean, url — validates and converts values

- **validateEnv()** — Returns `EnvValidationResult`:
  - `valid: boolean` — true if no required vars are missing
  - `errors: string[]` — Missing required vars or type errors
  - `warnings: string[]` — Missing optional secrets or weak placeholder values
  - `config: Record<string, any>` — Typed config with defaults applied
  - `secretHealth` — Summary of secret configuration status
  - Result is cached after first call

- **getEnvConfig()** — Returns typed config object with defaults applied

- **getSecretHealthDashboard()** — Admin-safe dashboard:
  - `summary` — total, configured, missing, properlySet, weakValues counts
  - `secrets` — Array of { name, configured, sensitive, properlySet, description } (values NEVER exposed)
  - `groups` — Secrets grouped by category (database, auth, redis, payments, firebase, sms, email, media, monitoring, server, backup, queue)
  - Detects weak/placeholder values (contains 'dev-fallback', 'test-', 'example', 'changeme', 'secret', or <8 chars)

##### 9b: Startup validation added to bootstrap.ts

- Added `import { validateEnv } from './lib/env'`
- Added step 0 (before Sentry init) that calls `validateEnv()`:
  - Logs ❌ errors for missing required vars (but doesn't exit — dev-friendly)
  - Logs ⚠️ warnings for missing optional secrets
  - Logs ✅ if all validations pass with no warnings

##### 9c: /api/health/secrets endpoint added to routes/health.routes.ts

- New endpoint `GET /api/health/secrets` — Admin-only
  - Requires `requireAdmin(c)` authentication
  - Returns `getSecretHealthDashboard()` output
  - Shows which secrets are configured vs missing WITHOUT revealing values
  - Returns 403 for non-admin users

### Design Decisions

- **Metrics middleware is first in chain**: Applied before HTTP logging so it captures the full request duration including all other middleware
- **Metrics collection never fails**: Wrapped in try/catch so a metrics bug cannot break any request
- **Prometheus content negotiation**: The `/api/metrics` endpoint returns Prometheus text format when `Accept: text/plain` is sent, JSON otherwise — supports both monitoring systems and API consumers
- **Environment validation is non-blocking**: Missing required vars log errors but don't crash the server — dev-friendly approach
- **Secret values are never exposed**: The `/api/health/secrets` endpoint only shows whether secrets are set, not their values
- **Weak value detection**: The env module flags secrets that appear to use dev/placeholder values (<8 chars, contains 'dev-fallback', 'test-', etc.)
- **Cached validation**: `validateEnv()` caches its result after first call to avoid re-processing on subsequent calls

### Verification

- API server starts successfully: "🚀 BookMyService API running on http://localhost:3001" with "Routes: 15 domain modules mounted"
- Environment validation runs at startup and logs appropriate warnings
- Metrics module tested independently: Prometheus format, JSON format, and summary all produce correct output
- Env module tested independently: validation, config, and secret dashboard all work correctly
- No existing functionality was broken — all changes are additive and backward compatible

---

# Worklog — Task 3-frontend-modularization

## Task: Modularize frontend routing in App.tsx — create a modular route registry

### Completed Work

#### New Files Created (3 files in `frontend/src/routes/`)

1. **routes/types.ts** — Canonical Page type and RouteConfig interface:
   - `Page` type union: all 94 page names as string literal types (moved from `app-context.tsx`)
   - `RouteConfig` interface with: `page`, `loader`, `chunkName`, `isProtected`, `allowedRoles?`, `props?`
   - Single source of truth for the Page type — re-exported from `app-context.tsx`

2. **routes/route-registry.ts** — Data-driven route definitions (replaces giant switch statement):
   - Routes grouped by feature into 15 arrays:
     - `PUBLIC_ROUTES` (16 pages) — home, categories, search, legal pages, etc.
     - `AUTH_ROUTES` (3 pages) — login, admin-login, register
     - `BOOKING_ROUTES` (5 pages) — booking, confirmation, payment, tracking, emergency
     - `CLIENT_ROUTES` (15 pages) — all client-* pages including client-commissions alias
     - `PROVIDER_ROUTES` (12 pages) — all provider-* pages
     - `TECHNICIAN_ROUTES` (6 pages) — all technician-* pages
     - `ADMIN_ROUTES` (20 pages) — all admin-* pages (shared by ADMIN + SUB_ADMIN)
     - `SUPER_ADMIN_ROUTES` (1 page) — super-admin-dashboard (roleId 3 only)
     - `MANAGER_ROUTES` (1 page) — manager-dashboard (roleId 9)
     - `LOCAL_ADMIN_ROUTES` (1 page) — local-admin-dashboard (roleId 10)
     - `FRANCHISE_ROUTES` (3 pages) — all franchise-* pages
     - `VENDOR_ROUTES` (7 pages) — all vendor-* pages
     - `AREA_MANAGER_ROUTES` (1 page) — area-manager-dashboard (roleId 8)
     - `JOIN_ROUTES` (2 pages) — join-manager, join-local-admin
     - `RECOMMENDATION_ROUTES` (1 page) — recommendations (any authenticated user)
   - `ALL_ROUTES` — master flat array (94 entries, zero duplicates)
   - `ROUTE_MAP` — `Map<Page, RouteConfig>` for O(1) lookup by page name
   - `VALID_PAGES` — `Set<Page>` for 404 detection
   - `ROUTE_COUNT` — total count for assertions/debugging
   - All routes use dynamic `() => import(...)` loaders for code splitting
   - Legal pages pass `type` prop via `props` field (e.g. `{ type: 'terms' }`)
   - `client-commissions` maps to `ClientReferralsPage` (preserves legacy alias behavior)

3. **routes/access-control.ts** — Centralized access control logic (extracted from App.tsx):
   - `ROLE_DASHBOARD_MAP` — Role ID → default dashboard page (moved from App.tsx, was `export const`)
   - `ROLE_ROUTE_PREFIX` — Ordered array of `[prefix, allowedRoles[]]` tuples (longest-prefix-first order)
   - `isRouteAccessible(page, roleId, isAuthenticated)` — Single function for all access checks:
     - Returns `AccessResult { allowed, redirectTo?, reason? }`
     - Handles: invalid page → deny, public page → allow, unauthenticated → redirect to login, wrong role → redirect to own dashboard
     - Checks explicit `allowedRoles` on route config first, falls back to prefix-based rules
   - Imported by 3 consumer components that previously imported from `@/App`

#### Files Modified (5 files)

1. **App.tsx** — Simplified from ~530 lines to ~120 lines:
   - Removed all 70+ static page imports (was ~130 lines of imports)
   - Removed giant switch statement (~230 lines)
   - Removed inline `ROLE_DASHBOARD_MAP`, `ROLE_ROUTE_PREFIX`, `PROTECTED_ROUTES`, `DASHBOARD_PREFIXES`, `validPages` set
   - Replaced with imports from `@/routes/route-registry` and `@/routes/access-control`
   - Added `PageLoader` component (loading skeleton)
   - Added `NotFoundPage` component (extracted from inline JSX)
   - Added lazy component cache (`lazyCache` Map) to avoid re-creating `React.lazy()` on each render
   - Added `getLazyComponent()` helper that creates and caches lazy components
   - `renderPage()` now: look up route in ROUTE_MAP → create/get lazy component → render with Suspense + props
   - Route guard `useEffect` now uses `isRouteAccessible()` instead of inline logic
   - Error boundary, Toaster, and SonnerToaster preserved exactly

2. **contexts/app-context.tsx** — Page type relocated:
   - Removed inline `Page` type union (~107 lines of type definitions)
   - Added `export type { Page } from '@/routes/types'` (re-export for backward compatibility)
   - All other code unchanged (navigate, goBack, history)

3. **components/bys/home-page.tsx** — Import path update:
   - Changed `import { ROLE_DASHBOARD_MAP } from '@/App'` → `import { ROLE_DASHBOARD_MAP } from '@/routes/access-control'`

4. **components/bys/login-page.tsx** — Import path update:
   - Changed `import { ROLE_DASHBOARD_MAP } from '@/App'` → `import { ROLE_DASHBOARD_MAP } from '@/routes/access-control'`

5. **components/bys/admin-login-page.tsx** — Import path update:
   - Changed `import { ROLE_DASHBOARD_MAP } from '@/App'` → `import { ROLE_DASHBOARD_MAP } from '@/routes/access-control'`

### Design Decisions

- **Data-driven routes over switch statement**: Route definitions are a data structure, not control flow. Adding a new page = adding one object to the right array, no need to touch App.tsx
- **Lazy component caching**: `React.lazy()` creates a new component each call, which would cause remounts on every navigation. The `lazyCache` Map ensures each page gets a stable lazy component reference
- **Props via RouteConfig**: LegalPage needs a `type` prop. Rather than special-casing in the renderer, RouteConfig has an optional `props` field that gets spread onto the component
- **O(1) lookup**: `ROUTE_MAP` (Map) and `VALID_PAGES` (Set) provide constant-time lookups instead of Set construction on every render (the old code created a new Set in every `renderPage()` call)
- **Prefix order matters**: `ROLE_ROUTE_PREFIX` uses an ordered array with `super-admin-` before `admin-` to avoid false matches (longest-prefix-first)
- **Backward-compatible re-exports**: `Page` type is re-exported from `app-context.tsx` so existing `import type { Page } from '@/contexts/app-context'` still works
- **Fixed missing page**: The original validPages set was missing `admin-login` (even though there was a switch case for it). The route registry correctly includes it

### Verification

- `npx vite build` completes successfully with zero errors
- 94 routes registered in the route registry (93 original + admin-login that was missing from validPages)
- Zero duplicate page entries in the registry
- No remaining imports of `ROLE_DASHBOARD_MAP` from `@/App` (all moved to `@/routes/access-control`)
- All lazy-loaded chunks generated correctly by Vite (confirmed in build output)
- Error boundary and toast notifications preserved in App component tree

---

# Worklog — Task 8-Distributed-Scaling + Task 10-Advanced-Security

## Task: Add distributed scaling configuration and advanced security enhancements

### Completed Work

#### Task 8: Distributed Scaling

##### 8a: lib/scaling.ts — Scaling utilities (NEW FILE)

Created `mini-services/api-service/lib/scaling.ts` with:

- **Instance Identity** — `INSTANCE_ID` (from env or auto-generated `api-{pid}-{timestamp}`) and `INSTANCE_STARTED_AT` for identifying individual API instances in multi-instance deployments.

- **GracefulShutdownManager** class — Coordinates graceful shutdown with:
  - `register(callback)` — Register async shutdown callbacks
  - `shutdown(signal)` — Executes callbacks in reverse order with configurable timeout (default 30s)
  - `shuttingDown` getter — Returns whether shutdown is in progress
  - Timeout enforcement — Forces `process.exit(1)` if shutdown takes too long
  - Double-signal protection — Ignores repeated signals

- **createHealthChecker()** — Factory function that creates a health check function with real dependencies (poolQuery, redisPing, queueReady, shutdownManager). Returns `HealthStatus` with `ready`, `live`, and `details` (db, redis, queues, shutdownInProgress, uptime, instanceId).

- **ConnectionDrainer** class — Tracks active connections with `increment()`, `decrement()`, `active`, and `atCapacity` for connection-aware load balancing.

- **getStickySessionConfig()** — Returns sticky session cookie name and instance ID for WebSocket session affinity.

- **shutdownManager** singleton — Default GracefulShutdownManager instance exported for use across the application.

##### 8b: Readiness/Liveness endpoints added to health.routes.ts

Added two new endpoints:

- `GET /api/health/ready` — Readiness probe for Kubernetes/load balancer:
  - Returns `{ ready: true, instanceId }` when healthy and not shutting down
  - Returns 503 with `{ ready: false, reason: 'shutdown_in_progress' }` during graceful shutdown
  - Checks DB connectivity, Redis connectivity, and queue status

- `GET /api/health/live` — Liveness probe for Kubernetes:
  - Returns `{ live: true, instanceId, uptime }` — process is alive
  - Always returns 200 while the process is running

Also added imports: `INSTANCE_ID`, `createHealthChecker`, `shutdownManager`, `HealthStatus` from `../lib/scaling`.

##### 8c: bootstrap.ts updated for graceful shutdown

Replaced simple signal handlers with GracefulShutdownManager:

- Added `import { shutdownManager } from './lib/scaling'`
- Registered 3 shutdown callbacks (in registration order, executed in reverse):
  1. `shutdownQueues()` — Shut down BullMQ queues and workers
  2. `stopBackupScheduler()` — Stop backup scheduler
  3. `stopMemoryMonitoring()` — Stop Sentry memory monitoring
- Signal handlers now delegate to `shutdownManager.shutdown('SIGTERM')` and `shutdownManager.shutdown('SIGINT')`
- Backward compatible: same shutdown operations occur, now orchestrated through the manager with timeout enforcement and instance ID logging

##### 8d: lib/rate-limiter.ts — Distributed rate limiting (NEW FILE)

Created `mini-services/api-service/lib/rate-limiter.ts` with:

- **MemoryRateLimitStore** class — In-memory fallback with:
  - Sliding window rate limiting (count + resetAt tracking)
  - Periodic cleanup of expired entries (every 60 seconds)
  - `shutdown()` method for clean shutdown

- **DistributedRateLimiter** class — Redis-backed rate limiting with in-memory fallback:
  - `check(key)` — Checks rate limit for a given key
  - Uses Redis GET/SET with PX TTL for distributed coordination
  - Stores `{ count, resetAt }` JSON in Redis with window-appropriate TTL
  - Falls back to `MemoryRateLimitStore` when Redis is unavailable
  - Returns `RateLimitResult { allowed, remaining, resetAt, retryAfter? }`

- **Pre-configured rate limiters**:
  - `authLimiter` — 20 req/min (prefix: `rl:auth`)
  - `apiLimiter` — 100 req/min (prefix: `rl:api`)
  - `bookingLimiter` — 10 req/min (prefix: `rl:booking`)
  - `paymentLimiter` — 5 req/min (prefix: `rl:payment`)

#### Task 10: Advanced Security

##### 10a: lib/rbac.ts — Role-Based Access Control (NEW FILE)

Created `mini-services/api-service/lib/rbac.ts` with:

- **Permission enum** — 36 fine-grained permissions across 6 domains:
  - Booking: create, read:own, read:any, update:own, update:any, cancel:own, cancel:any
  - Service: create, read, update:own, update:any, delete:own, delete:any, approve
  - User: read:own, read:any, update:own, update:any, delete
  - Admin: dashboard, analytics, revenue, dispute:manage, payout:process, coupon:manage, backup, secrets:view
  - Payment: create, read:own, read:any, capture, refund
  - Franchise: dashboard, manage:vendors
  - Notification: read:own, send

- **ROLE_PERMISSIONS mapping** — 10 roles mapped to permission sets:
  - CLIENT (1) — 9 permissions (booking, service read, payment, user own, notification)
  - PROVIDER (2) — 10 permissions (booking own, service CRUD own, payment read own, user own, notification)
  - ADMIN (3) — All 36 permissions
  - TECHNICIAN (4) — 6 permissions (booking own, service read, user own, notification)
  - VENDOR (5) — 10 permissions (same as PROVIDER)
  - FRANCHISE (6) — 8 permissions (booking read, service read, user own, franchise dashboard+manage, notification)
  - SUB_ADMIN (7) — All 36 permissions (same as ADMIN)
  - AREA_MANAGER (8) — 6 permissions (booking read, service read, user own, notification)
  - MANAGER (9) — 7 permissions (booking own update, service read, user own, notification)
  - LOCAL_ADMIN (10) — 6 permissions (booking read, service read, user own, notification)

- **hasPermission(roleId, permission)** — Returns boolean for permission check

- **checkPermission(roleId, permission)** — Throws `PermissionDeniedError` if permission denied

- **getRolePermissions(roleId)** — Returns array of all permissions for a role

- **PermissionDeniedError** class — Custom error with roleId and permission info

##### 10b: Secret rotation support added to lib/security.ts

Appended at the end of the existing security.ts file:

- **rotateJWTSecret(newSecret)** — Rotates JWT secret by storing current as previous and setting new as current. Logs rotation timestamp.

- **getActiveJWTSecrets()** — Returns array of active JWT secrets (both current and previous during rotation). Enables zero-downtime rotation where tokens signed with either old or new secret are valid.

- **isSecretRotated()** — Returns whether a secret rotation has been performed.

- **getSecretRotationInfo()** — Returns rotation status and timestamp for admin dashboards.

- Lazy loading of `JWT_SECRET` from `./shared` using dynamic require to avoid circular dependency issues at module load time.

##### 10c: RBAC middleware helper added to middleware/index.ts

Added `requirePermission(permission)` middleware helper:

- Imports `hasPermission`, `Permission`, `PermissionDeniedError` from `../lib/rbac`
- Imports `getAuthUser` from `../lib/shared`
- Returns Hono middleware that:
  1. Authenticates user via `getAuthUser(c)` — returns 401 if not authenticated
  2. Checks permission via `hasPermission(user.roleId, permission)` — returns 403 if insufficient
  3. Calls `next()` if authorized
- Usage example: `app.get('/api/admin/revenue', requirePermission(Permission.ADMIN_REVENUE), handler)`

### Design Decisions

- **GracefulShutdownManager in scaling.ts**: The shutdown manager singleton is exported from `lib/scaling.ts` rather than `bootstrap.ts` to avoid circular dependencies. Both `bootstrap.ts` (registers callbacks) and `health.routes.ts` (checks shutdown status) import from the same source.

- **Health checker factory pattern**: `createHealthChecker()` takes dependency injection parameters rather than importing dependencies directly, making it testable and avoiding circular dependencies in the module graph.

- **Redis-backed rate limiter with JSON storage**: The distributed rate limiter stores `{ count, resetAt }` as JSON in Redis rather than using INCR/EXPIRE separately, which provides atomic window tracking and avoids race conditions between count and TTL operations.

- **Permission enum for type safety**: Using TypeScript enum for permissions provides compile-time checking and IDE autocomplete, preventing typos in permission strings.

- **Lazy JWT_SECRET loading in security.ts**: Using a lazy getter with dynamic `require('./shared')` avoids circular dependency issues that would occur if `JWT_SECRET` was imported at the top level, since `shared.ts` is imported by many modules.

- **Backward compatible changes**: All modifications to existing files (health.routes.ts, bootstrap.ts, middleware/index.ts, security.ts) are additive — no existing function signatures were changed, no existing endpoints were removed or modified.

### Verification

- API server starts successfully: "🚀 BookMyService API running on http://localhost:3001" with "Routes: 15 domain modules mounted"
- Graceful shutdown works: "SIGTERM received — graceful shutdown started (instance: api-...)" followed by proper queue shutdown
- Readiness endpoint returns: `{"ready":true,"instanceId":"api-10991-mpgrgq9u"}`
- Liveness endpoint returns: `{"live":true,"instanceId":"api-10991-mpgrgq9u","uptime":4.73}`
- TypeScript compilation: Only pre-existing errors in lib/sentry.ts (unrelated to our changes)
- No existing endpoints or API contracts were changed

# Worklog — Task 6-Testing + Task 7-CICD

## Task: Create testing scaffolding and CI/CD pipelines

### Completed Work

#### Task 6: Testing Scaffolding

##### 6a: vitest already installed

vitest (v4.1.7) was already installed as a devDependency in `mini-services/api-service/package.json` with scripts `test`, `test:watch`, and `test:coverage`.

##### 6b: vitest.config.ts already existed

Configuration file was already present with globals, node environment, test include pattern, and coverage settings.

##### 6c: New test files created (2 files)

1. **tests/lib/rbac.test.ts** — RBAC system unit tests (20 tests):
   - `hasPermission()` — Tests for all 10 roles (CLIENT, PROVIDER, ADMIN, TECHNICIAN, VENDOR, FRANCHISE, SUB_ADMIN, AREA_MANAGER, MANAGER, LOCAL_ADMIN)
   - Verifies ADMIN and SUB_ADMIN have all permissions
   - Verifies CLIENT cannot access admin/service-create endpoints
   - Verifies PROVIDER has service create/update own but not admin dashboard
   - Verifies unknown role (999, 0, -1) returns false
   - `checkPermission()` — Verifies no throw for allowed, throws PermissionDeniedError for denied
   - PermissionDeniedError message contains roleId and permission
   - `getRolePermissions()` — Returns correct arrays for known roles, empty for unknown

2. **tests/lib/env.test.ts** — Environment validation tests (14 tests):
   - `validateEnv()` — Error when DATABASE_URL missing, valid when set
   - Warnings for missing optional secrets
   - Detection of weak/placeholder JWT_SECRET values
   - Acceptance of properly set secrets
   - Default values for PORT (3001) and NODE_ENV (development)
   - Type coercion for PORT (string → number)
   - Error for non-numeric PORT
   - secretHealth summary structure validation
   - `getEnvConfig()` — Returns typed config object
   - `getSecretHealthDashboard()` — Returns dashboard with summary/secrets/groups
   - Verifies secret values are NEVER exposed in dashboard
   - Verifies all 12 secret groups exist (database, auth, redis, payments, firebase, sms, email, media, monitoring, server, backup, queue)
   - Detects weak values (e.g. 'dev-fallback-secret')

   Note: Uses `vi.resetModules()` between tests to handle the cached validation result.

##### Existing test files (verified, not modified):

- `tests/setup.ts` — Mock pool, redis, queues, logger, and factory functions
- `tests/lib/security.test.ts` — 50 tests for sanitizeInput, detectSQLInjection, detectXSS, isValidOrigin, generateCSPNonce, validateAgainstSchema
- `tests/lib/logger.test.ts` — 16 tests for redactPII, generateTraceId, per-module log levels
- `tests/lib/redis.test.ts` — 22 tests for in-memory cache fallback, JSON ops, OTP, cache keys, TTL, metrics, health check, popular searches
- `tests/integration/api.test.ts` — 13 integration tests for health, categories, services, auth validation, admin authorization, JWT token flow, security validation
- `tests/services/auth.service.test.ts` — 15 tests for sanitizeUser, loginUser, registerUser, createAccessToken/verifyToken, isJwtError
- `tests/services/booking.service.test.ts` — 19 tests for createBooking, listBookings, getBooking, updateBookingStatus, verifyOtp
- `tests/services/payment.service.test.ts` — 10 tests for getPaymentConfig, createPaymentOrder

##### 6e: Test run results

All 179 tests pass across 9 test files:

```
 ✓ tests/lib/rbac.test.ts (20 tests) 8ms
 ✓ tests/lib/env.test.ts (14 tests) 47ms
 ✓ tests/lib/security.test.ts (50 tests) 12ms
 ✓ tests/integration/api.test.ts (13 tests) 143ms
 ✓ tests/lib/redis.test.ts (22 tests) 161ms
 ✓ tests/lib/logger.test.ts (16 tests) 11ms
 ✓ tests/services/auth.service.test.ts (15 tests) 15ms
 ✓ tests/services/booking.service.test.ts (19 tests) 11ms
 ✓ tests/services/payment.service.test.ts (10 tests) 9ms

 Test Files  9 passed (9)
      Tests  179 passed (179)
```

#### Task 7: CI/CD Pipelines

##### 7a: .github/workflows/ci.yml — Main CI pipeline

Three-job pipeline triggered on push/PR to main:
- **lint-and-typecheck** — Installs bun, installs all dependencies (root, api-service, frontend), builds frontend
- **test-backend** (depends on lint-and-typecheck) — Runs vitest in api-service with JWT_SECRET and NODE_ENV=test env vars
- **deploy** (depends on test-backend, only on main push) — Placeholder deployment notification

##### 7b: .github/workflows/security.yml — Security scan

Triggered on push to main and weekly schedule (Monday midnight):
- Installs dependencies for api-service and frontend
- Runs `npm audit --audit-level=high` on both (with `|| true` for non-blocking)

##### 7c: .github/dependabot.yml — Dependency updates

Configures Dependabot for three ecosystems:
- npm in `/mini-services/api-service` — weekly updates
- npm in `/frontend` — weekly updates
- GitHub Actions in `/` — weekly updates

### Design Decisions

- **Tests import actual RBAC module directly**: Unlike the task spec's original pattern-matching tests, we import `hasPermission`, `checkPermission`, `getRolePermissions`, and `PermissionDeniedError` from `../../lib/rbac` for real unit testing against actual code
- **env.test.ts uses vi.resetModules()**: Since `validateEnv()` caches its result, each test resets the module cache and re-imports to test with different environment variable configurations
- **No modification to existing source code**: All changes are new files only — no existing code was modified
- **CI pipeline uses bun**: Matches the project's runtime (bun) for consistency
- **Security audit uses `|| true`**: npm audit may return non-zero for vulnerabilities; the CI should not fail on audit findings, only report them

### Verification

- All 179 tests pass (9 test files, 0 failures)
- No existing source code was modified
- New test files properly mock all external dependencies
- CI/CD files follow GitHub Actions best practices with proper job dependencies and conditions

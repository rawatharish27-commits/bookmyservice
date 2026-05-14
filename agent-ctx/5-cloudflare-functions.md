# Task 5: Cloudflare Pages Functions

## Summary
Created 52 Cloudflare Pages Functions files to replace the deleted Next.js API routes.

## File Structure

### Shared Utilities (5 files)
- `functions/types.ts` — Env interface (DB: D1Database, JWT_SECRET: string) + JwtPayload
- `functions/_shared/db.ts` — D1 query helpers: query(), queryOne(), execute()
- `functions/_shared/auth.ts` — WebCrypto-based JWT sign/verify + requireAuth()
- `functions/_shared/response.ts` — json() and error() response helpers
- `functions/_shared/password.ts` — PBKDF2-SHA512 password hashing (copied from src/lib/password.ts)

### Middleware (1 file)
- `functions/_middleware.ts` — CORS headers on all responses + OPTIONS preflight

### Auth API (4 files)
- `functions/api/auth/login.ts` — POST: email/password login, returns JWT tokens + user
- `functions/api/auth/register.ts` — POST: registration with role, returns JWT tokens + user
- `functions/api/auth/profile.ts` — GET/PATCH: user profile read/update
- `functions/api/auth/change-password.ts` — POST: change password with current password verification

### Services API (6 files)
- `functions/api/services/index.ts` — GET: list with filters, POST: create (provider only)
- `functions/api/services/[id].ts` — GET: detail with provider/reviews/availability, PATCH/DELETE
- `functions/api/services/search.ts` — GET: search with q, category, city, price filters, sorting
- `functions/api/services/[id]/reviews.ts` — GET: service reviews
- `functions/api/services/[id]/availability.ts` — GET: service availability slots
- `functions/api/services/[id]/approve.ts` — PATCH: admin approve/reject service

### Categories API (3 files)
- `functions/api/categories/index.ts` — GET: list all with subcategories and counts
- `functions/api/categories/[id].ts` — GET: category detail with subcategories
- `functions/api/subcategories/index.ts` — GET: subcategories filtered by categoryId

### Bookings API (7 files)
- `functions/api/bookings/index.ts` — GET: list (filtered by role/status), POST: create (client only)
- `functions/api/bookings/[id].ts` — GET: booking detail with service/client/provider/payment/review
- `functions/api/bookings/[id]/accept.ts` — PATCH: provider accepts booking
- `functions/api/bookings/[id]/reject.ts` — PATCH: provider rejects booking
- `functions/api/bookings/[id]/start.ts` — PATCH: provider starts booking
- `functions/api/bookings/[id]/complete.ts` — PATCH: provider completes booking
- `functions/api/bookings/[id]/cancel.ts` — PATCH: client/provider cancels booking

### Stats API (2 files)
- `functions/api/stats/platform.ts` — GET: platform stats from PlatformStats table
- `functions/api/stats/visitor.ts` — GET: active visitor count, POST: track/update visitor

### Reviews API (2 files)
- `functions/api/reviews/index.ts` — GET: reviews (filtered by role/serviceId), POST: create review
- `functions/api/reviews/[id].ts` — PUT: update review, DELETE: delete review

### Legal API (2 files)
- `functions/api/legal/index.ts` — GET: list all legal pages
- `functions/api/legal/[type].ts` — GET: legal page by type

### FAQ API (1 file)
- `functions/api/faq/index.ts` — GET: active FAQs, optionally filtered by category

### Contact API (1 file)
- `functions/api/contact/index.ts` — POST: submit contact message

### Favorites API (2 files)
- `functions/api/favorites/index.ts` — GET: user's favorites, POST: add favorite
- `functions/api/favorites/[serviceId].ts` — DELETE: remove favorite

### Notifications API (2 files)
- `functions/api/notifications/index.ts` — GET: user notifications, PATCH: mark all read
- `functions/api/notifications/[id]/read.ts` — PATCH: mark single notification as read

### KYC API (2 files)
- `functions/api/kyc/status.ts` — GET: provider KYC status
- `functions/api/kyc/submit.ts` — POST: submit/resubmit KYC documents

### Admin API (9 files)
- `functions/api/admin/dashboard.ts` — GET: admin dashboard stats
- `functions/api/admin/users/index.ts` — GET: list users with search/filter
- `functions/api/admin/users/[userId].ts` — GET/PATCH/DELETE: user management
- `functions/api/admin/bookings.ts` — GET: all bookings with filters
- `functions/api/admin/services.ts` — GET: all services with status filter
- `functions/api/admin/categories.ts` — GET/POST: category management
- `functions/api/admin/revenue.ts` — GET: revenue breakdown and streams
- `functions/api/admin/logs.ts` — GET: admin action logs
- `functions/api/admin/faq/index.ts` — GET/POST: FAQ management
- `functions/api/admin/faq/[faqId].ts` — PATCH/DELETE: individual FAQ management

### Disputes API (2 files)
- `functions/api/disputes/index.ts` — GET: list disputes (admin)
- `functions/api/disputes/[disputeId].ts` — GET/PATCH: dispute detail and resolution

## Key Implementation Details

1. **Auth**: WebCrypto-based JWT (HS256) instead of jose library - works natively in Workers runtime
2. **CORS**: Global middleware handles OPTIONS preflight and adds CORS headers to all responses
3. **Database**: All queries use parameterized SQL with ? placeholders for SQL injection prevention
4. **Password**: PBKDF2-SHA512 with 100K iterations, backward compatible with bcrypt hashes
5. **Error handling**: Every function has try/catch with proper UNAUTHORIZED detection from requireAuth()
6. **Role-based access**: CLIENT, PROVIDER, ADMIN roles enforced per endpoint

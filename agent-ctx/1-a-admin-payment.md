# Task 1-a-admin-payment: Extract admin and payment business logic into service files

## Task Summary
Extracted all business logic from `routes/admin.routes.ts` and `routes/payment.routes.ts` into dedicated service files, then refactored the route files to become thin HTTP handlers.

## Files Created
1. **`services/admin.service.ts`** (~435 lines) — 26 exported pure business logic functions
2. **`services/payment.service.ts`** (~375 lines) — 9 exported pure business logic functions

## Files Modified
1. **`routes/admin.routes.ts`** — Refactored to thin handlers delegating to `adminService`
2. **`routes/payment.routes.ts`** — Refactored to thin handlers delegating to `paymentService`

## Key Design Decisions
- Service functions accept `pool` as the first parameter (Pool from pg) for database access
- Services import their own dependencies: `redis`, `logger`, `razorpay`, `queues`, `transformServiceRow`
- Service functions return data objects (not HTTP responses)
- Routes handle HTTP concerns only: auth checking, request parsing, response formatting, error status codes
- Error objects from services use `{ error: string }` pattern, routes map these to appropriate HTTP status codes
- All existing API contracts, response shapes, and status codes preserved exactly
- Cache invalidation patterns preserved in services
- Notification job pushing patterns preserved in payment service
- The 30+ concurrent query dashboard endpoint preserved exactly in `getDashboard()`
- The cached analytics dashboard with `calcGrowth` preserved in `getAnalyticsDashboard()`
- Backup routes left as-is in admin.routes.ts (they already delegate to lib/backup)

## Verification
- All 4 files parse successfully via TypeScript createSourceFile
- No TypeScript errors in any of the changed files
- Existing TS errors (sentry.ts, wallet.service.ts) are pre-existing and unrelated

## Exported Admin Service Functions
- listUsers, getUser, updateUser, deleteUser
- listAdminServices, updateService
- listAdminBookings
- getRevenue, getAdminLogs
- getAnalytics
- listAdminDisputes, updateDispute
- listAdminPayouts, processPayout
- listCoupons, createCoupon
- listFranchises, listInventory, listAMC, listB2B, listCRM
- getDashboard, getDashboardFallback
- getAnalyticsDashboard
- listFAQ, createFAQ, updateFAQ, deleteFAQ
- upsertCategory, updateCategory

## Exported Payment Service Functions
- getPaymentConfig
- createPaymentOrder
- verifyPayment
- capturePayment
- refundPayment
- getPaymentDetails
- getBookingPayments
- processWebhook

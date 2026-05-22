# Task 2 - Razorpay Payment Integration Agent

## Task: Add Razorpay Payment Integration to Backend

### Files Created:
- `/home/z/my-project/mini-services/api-service/lib/razorpay.ts` — Razorpay utility module

### Files Modified:
- `/home/z/my-project/mini-services/api-service/index.ts` — Added imports, Payment table, rate limiters, 8 payment endpoints, health check update
- `/home/z/my-project/worklog.md` — Updated work record

### Implementation Summary:

1. **lib/razorpay.ts** — Complete Razorpay REST API integration using native fetch (no SDK):
   - `createOrder()` — Creates Razorpay order, converts rupees to paise
   - `verifyPaymentSignature()` — HMAC-SHA256 with timing-safe comparison
   - `verifyWebhookSignature()` — Webhook payload verification
   - `capturePayment()` — Captures authorized payments
   - `refundPayment()` — Full and partial refunds
   - `getPaymentDetails()` — Fetch payment info from Razorpay
   - `mapRazorpayStatus()` — Maps Razorpay statuses to internal statuses
   - Graceful stub mode when env vars not set (like Firebase FCM pattern)

2. **Payment Table** — Auto-created on startup:
   - Fields: id, orderId, paymentId, bookingId, userId, amount, currency, status, method, signature, refundId, refundAmount, refundStatus, metadata (JSONB), createdAt, updatedAt
   - Indexes on bookingId, userId, status, orderId

3. **8 API Endpoints**:
   - `POST /api/payments/create-order` — Authenticated, 5/min rate limit
   - `POST /api/payments/verify` — Authenticated, 10/min rate limit
   - `POST /api/payments/capture/:paymentId` — Admin only
   - `POST /api/payments/refund/:paymentId` — Admin/provider
   - `GET /api/payments/:paymentId` — Authenticated with access control
   - `GET /api/payments/booking/:bookingId` — Authenticated with access control
   - `GET /api/payments/config` — Public key for frontend checkout
   - `POST /api/payments/webhook` — No auth, signature verified

4. **Webhook Events Handled**: payment.captured, payment.failed, refund.processed

5. **Integration Points**: Uses pool.query(), redis caching, pushNotificationJob(), pushBookingJob(), logger, captureApiError()

### No breaking changes to existing functionality.

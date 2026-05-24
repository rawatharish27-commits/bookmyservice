# Task IDs: 1, 7, 11, 12 — Security Fixes Agent

## Summary
Fixed 4 critical production security issues in the BookMyService API.

## Task 1: Fix price validation to ₹99-₹499
**Files Modified:**
- `validators/provider.schema.ts` — Changed `basePrice: z.number().min(0)` to `z.number().min(99, 'Price must be at least ₹99').max(499, 'Price must not exceed ₹499')` in both `createServiceSchema` and `updateServiceSchema`
- `validators/create-booking.schema.ts` — Same fix for `basePrice` in `createBookingSchema`
- Checked `finalPrice` — not present in schemas (it's computed server-side), no change needed

## Task 7: Fix booking authorization — add ownership checks
**Files Modified:**
- `routes/booking.routes.ts` — Added ownership verification:
  - `PATCH /api/bookings/:id/cancel` — verify user is the booking client or admin (roleIds 1, 3, 7)
  - `PATCH /api/bookings/:id/complete` — verify user is the booking provider or admin
  - `PATCH /api/bookings/:id/reject` — verify user is the booking provider or admin
  - `PATCH /api/bookings/:id/accept` — verify user is the booking provider or admin
  - `PATCH /api/reviews/:id` — Added auth check (was previously zero auth), now requires auth + reviewer ownership or admin
- `index.ts` — Same ownership checks applied to all duplicate route handlers

## Task 11: Fix OTP security
**Files Modified:**
- `routes/booking.routes.ts`:
  - Added `import crypto from 'crypto'`
  - Added in-memory OTP attempt tracker (`otpAttempts` Map) with max 3 attempts and 15-min lockout
  - Added `hashOtp()` function using `crypto.createHash('sha256').update(otp).digest('hex')`
  - Added `isOtpLockedOut()`, `recordOtpFailure()`, `clearOtpAttempts()` helper functions
  - Added periodic cleanup of expired OTP attempt records (every 10 min)
  - Modified booking creation to store `hashOtp(otpCode)` instead of plaintext `otpCode`
  - Modified OTP verification to hash input OTP and compare with stored hash
  - Added rate limiting: returns 429 with `attemptsRemaining` when locked out
- `index.ts` — Same OTP security changes applied (using `import { createHash } from 'crypto'`)

## Task 12: Fix wallet atomicity
**Files Modified:**
- `routes/booking.routes.ts`:
  - `POST /api/wallet/deposit` — Wrapped in SQL transaction with `BEGIN`/`COMMIT`/`ROLLBACK`, `SELECT ... FOR UPDATE` row locking, `client.release()` in finally block
  - `POST /api/wallet/withdraw` — Same transaction pattern with balance check inside locked transaction
  - `POST /api/payouts/request` — Same transaction pattern with balance check inside locked transaction
- `index.ts` — Same wallet atomicity changes applied to all duplicate route handlers

## Verification
- Price validation tested: `z.number().min(99).max(499)` correctly rejects prices < 99 and > 499, accepts 99-499 inclusive
- `crypto.createHash('sha256')` verified working in Node.js runtime
- All modified files read back and verified for syntax correctness
- No new TypeScript compilation errors introduced

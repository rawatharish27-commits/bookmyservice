# Task: Add Missing API Routes to Hono Server

## Summary of Changes

### Files Created
1. **`/home/z/my-project/backend/src/api/legal/index.ts`** - New legal route module
   - `GET /api/legal` - List all legal documents
   - `GET /api/legal/:type` - Get specific legal document by type (handles UPPERCASE, lowercase, and hyphenated type params)

### Files Modified
2. **`/home/z/my-project/backend/src/api/auth/index.ts`** - Complete rewrite with full auth implementation
   - `POST /api/auth/login` - Login with email/password, JWT token generation
   - `POST /api/auth/register` - Register new user (CLIENT/PROVIDER), with validation
   - `POST /api/auth/logout` - Logout
   - `POST /api/auth/change-password` - Change password for authenticated user (requires current + new password)
   - `POST /api/auth/forgot-password` - Generate reset token (returns token in dev mode)
   - `POST /api/auth/reset-password` - Reset password with token + email
   - `GET /api/auth/profile` - Get authenticated user profile with role name and KYC status
   - `PATCH /api/auth/profile` - Update user profile (name, phone, city, state, country, address, pincode, profileImageUrl)

3. **`/home/z/my-project/backend/src/api/faq/index.ts`** - Enhanced FAQ route
   - Added `category` query parameter support
   - Returns `faqs` (flat list), `grouped` (by category), and `total` count

4. **`/home/z/my-project/backend/src/api/contact/index.ts`** - Enhanced contact route
   - Added email format validation
   - Added field length validation
   - Returns `id` in response
   - Proper 201 status code

5. **`/home/z/my-project/backend/src/api/stats/index.ts`** - Enhanced stats route
   - `GET /api/stats/platform` - Now uses live COUNT queries instead of PlatformStats table only
   - `POST /api/stats/visitor` - NEW: Track visitor sessions (upsert, update PlatformStats)

6. **`/home/z/my-project/backend/src/shared/auth.ts`** - Bug fix
   - Fixed `getCurrentUser()`: Changed `c.req.headers.get('authorization')` to `c.req.header('authorization')` (Hono v4 API)

7. **`/home/z/my-project/backend/src/index.ts`** - Route registration
   - Added imports for `legalRoutes`, `faqRoutes`, `contactRoutes`, `statsRoutes`
   - Registered `app.route('/api/legal', legalRoutes)`
   - Registered `app.route('/api/faq', faqRoutes)`
   - Registered `app.route('/api/contact', contactRoutes)`
   - Registered `app.route('/api/stats', statsRoutes)`

## Key Implementation Details

- All routes use raw SQL via `query()` from `shared/db.ts` (pg Pool)
- Auth routes use JWT verification via `getCurrentUser()` from `shared/auth.ts`
- Password hashing uses `bcryptjs` (already in project)
- Legal route TYPE_MAP handles uppercase frontend types (TERMS, PRIVACY, REFUND, etc.)
- Forgot-password returns reset token in response (dev mode, no email sending)
- Reset-password requires email + token (simplified without dedicated reset table)
- Profile PATCH uses dynamic SQL building for flexible field updates
- Visitor stats tracking includes session upsert and PlatformStats maintenance

# Task 3-a: API Routes for Auth, Categories, Services, Subcategories

## Task Summary
Create 10 API route files for Cloudflare Pages Functions with D1 database, implementing auth, categories, services, and subcategories endpoints with proper security.

## Files Created

### Auth Routes (functions/api/auth/)
1. **register.ts** - POST /api/auth/register
   - Validates email, phone, name, password, roleId (1=CLIENT, 2=PROVIDER)
   - Password strength validation (8+ chars, uppercase, lowercase, number)
   - Duplicate email/phone check (409 Conflict)
   - PBKDF2-SHA512 password hashing
   - Creates user with ACTIVE status
   - Creates ProviderKyc placeholder for PROVIDER role
   - Returns JWT access + refresh tokens

2. **login.ts** - POST /api/auth/login
   - Email format validation
   - User lookup by email with JOIN to Role table
   - Password verification via verifyPassword()
   - Active status check (403 for non-ACTIVE accounts)
   - Updates lastLoginAt timestamp
   - Returns JWT access + refresh tokens

3. **profile.ts** - GET/PATCH /api/auth/profile
   - GET: Returns user profile + KYC status for providers
   - PATCH: Updates name, phone, city, state, country
   - Phone uniqueness check across other users
   - Dynamic SQL building for partial updates

4. **change-password.ts** - POST /api/auth/change-password
   - Verifies current password
   - Validates new password strength
   - Ensures new password differs from current
   - Hashes and updates password

### Category Routes (functions/api/categories/)
5. **index.ts** - GET /api/categories
   - Returns all active categories with subcategories count and services count
   - Uses actual ServiceCategory table (not Category)

6. **[id].ts** - GET /api/categories/:id
   - Returns single category with subcategories list
   - 404 for not found categories

### Service Routes (functions/api/services/)
7. **index.ts** - GET /api/services
   - Paginated results with limit/offset
   - Filters: categoryId, city, minPrice, maxPrice, search
   - Joins User (provider), ServiceCategory, ServiceSubcategory
   - Only returns isActive=1 AND approvalStatus='APPROVED' services
   - Structured response with nested provider/category/subcategory objects

8. **[id].ts** - GET /api/services/:id
   - Full service details with provider info + KYC status
   - Availability slots
   - Reviews with reviewer info
   - 404 for not found services

9. **search.ts** - GET /api/services/search
   - Full-text search across title and description (LIKE-based)
   - Title matches prioritized in sort order
   - Pagination with page/limit (calculates totalPages, hasMore)
   - All filter support (categoryId, city, minPrice, maxPrice)

### Subcategory Routes (functions/api/subcategories/)
10. **index.ts** - GET /api/subcategories?categoryId=X
    - Returns subcategories for a given category
    - Includes services count per subcategory
    - categoryId parameter required

## Schema Adaptations
The task description referenced simplified table names, but the actual D1 schema uses:
- `ServiceCategory` instead of `Category`
- `ServiceSubcategory` instead of `Subcategory`
- Service uses `isActive` + `approvalStatus` instead of `status`
- `ProviderKyc` table instead of `Provider` table
- Review uses `reviewerId`/`reviewedId` instead of `clientId`

All SQL queries were adapted to use the actual schema.

## Security Measures
- All SQL uses parameterized queries (D1 .bind())
- Input sanitization via sanitizeString()
- Email format validation
- Indian phone number validation (10 digits, starts with 6-9)
- Password strength validation (8+ chars, uppercase, lowercase, number)
- JWT authentication with jose library (WebCrypto-compatible)
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)

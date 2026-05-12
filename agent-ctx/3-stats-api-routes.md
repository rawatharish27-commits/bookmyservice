# Task 3 - Stats API Routes

## Summary
Created 3 API route files for the BookYourService stats/visitor tracking system.

## Files Created

### 1. `/src/app/api/stats/visitor/route.ts`
- **POST**: Track a new visitor or update existing visitor session
  - Accepts `{ sessionId, page?, referrer? }` in request body
  - Extracts IP address from `x-forwarded-for` / `x-real-ip` headers
  - Extracts user-agent from request headers
  - Runs cleanup on each POST (marks sessions inactive if lastActive > 5 min ago)
  - Uses `upsert` to create or update the VisitorSession
  - Returns `{ sessionId }`
- **GET**: Get current visitor stats
  - `activeVisitors`: count where isActive=true AND lastActive > 5 min ago
  - `todayVisitors`: count where createdAt >= start of today
  - `totalVisitors`: total count of all VisitorSession records

### 2. `/src/app/api/stats/platform/route.ts`
- **GET**: Real-time platform statistics from database
  - `totalClients`: users with role CLIENT
  - `totalProviders`: users with role PROVIDER
  - `totalServices`: services where isActive=true AND isApproved=true
  - `totalBookings`: total booking count
  - `activeVisitors`: active visitor sessions (isActive=true, lastActive > 5 min ago)
  - `totalVisitors`: total visitor sessions
  - Uses `Promise.all` for parallel DB queries

### 3. `/src/app/api/stats/cleanup/route.ts`
- **POST**: Mark inactive visitor sessions
  - Updates all VisitorSession records where isActive=true AND lastActive < now - 5 minutes
  - Returns `{ success, deactivatedCount, message }`
  - Can be called periodically from the frontend

## Technical Details
- All data comes from actual database via Prisma (`import { db } from '@/lib/db'`)
- No mock/hardcoded data
- Consistent 5-minute active threshold constant
- Proper error handling with try/catch and console.error logging
- Lint passes with 0 errors

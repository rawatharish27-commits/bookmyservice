# Task 15 — Analytics Dashboard with Real Data

## Work Summary

### Backend Changes (mini-services/api-service/index.ts)

1. **New endpoint: `GET /api/admin/analytics/dashboard`** (added before 404 handler, line ~3814)
   - Returns data in the EXACT format the frontend expects: `{ stats, monthlyRevenue, topCategories, topCities, topServices, recentBookings }`
   - Stats include: totalRevenue, totalBookings, activeUsers, activeProviders, totalFranchises, cancellationRate + 6 growth metrics
   - Growth calculations compare current month vs previous month for each metric
   - `calcGrowth()` helper handles edge case where previous month is 0 (returns 100% if current > 0, else 0%)
   - All 21 DB queries run in parallel via `Promise.all()` for maximum performance
   - Additional sequential queries for: monthlyRevenue, topCategories, topCities, topServices, recentBookings

2. **Redis caching** with 5-minute TTL:
   - Cache key: `cache:admin:analytics:dashboard`
   - Uses existing `redis.getJson()` / `redis.setJson()` with `CacheTTL.LONG`
   - Cache invalidation added to 4 booking mutation endpoints:
     - `POST /api/bookings` (create) — line 1878
     - `PATCH /api/bookings/:id/cancel` — line 3132
     - `PATCH /api/bookings/:id/complete` — line 3178
     - `PATCH /api/bookings/:id/accept` — line 3243

### Frontend Changes (frontend/src/components/bys/admin-analytics-page.tsx)

1. **Updated API endpoint** from `/api/admin/dashboard` to `/api/admin/analytics/dashboard`

2. **Added new interfaces**:
   - `TopCity { city, bookings, revenue }`
   - `TopService { id, title, bookings, revenue, category }`
   - Extended `AnalyticsData` to include `topCities` and `topServices`

3. **Replaced "Total Franchises" stat card with "Top City"** stat card showing #1 city with bookings count (using MapPin icon, amber color scheme)

4. **Added "Top Cities" section** (Row 3, left half):
   - Horizontal bar chart with animated bars (framer-motion)
   - Each city shows: rank badge, MapPin icon, city name, bookings count badge, revenue
   - Gradient progress bars (amber-to-orange)
   - Empty state with MapPin icon + "No city data available"

5. **Added "Top Services" section** (Row 3, right half):
   - Table layout with rank, service title, category badge, bookings, revenue
   - Wrench icon header, indigo/violet color scheme
   - Responsive: category column hidden on mobile
   - Empty state with Wrench icon + "No service data available"

6. **Layout** (responsive):
   - Row 1: 6 stat cards (grid-cols-2 sm:grid-cols-3 lg:grid-cols-6)
   - Row 2: Monthly Revenue (3/5) + Top Categories (2/5)
   - Row 3: Top Cities (1/2) + Top Services (1/2)
   - Row 4: Recent Bookings (full width)

7. **All sections gracefully handle empty data** with descriptive "No data available" messages

### No existing routes or services were modified or deleted — all changes are ADDITIVE.

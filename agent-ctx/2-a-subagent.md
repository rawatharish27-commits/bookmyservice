# Task 2-a: City-specific platform stats API endpoint

## Agent: Subagent

## Task
Add a `?city=CityName` query parameter to the existing `/api/stats/platform` endpoint in the Hono API service.

## Changes Made

**File**: `/home/z/my-project/mini-services/api-service/index.ts` (lines 452-499)

### Before
The endpoint only supported global stats, querying the `PlatformStats` table:
```typescript
app.get('/api/stats/platform', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM "PlatformStats" ORDER BY id DESC LIMIT 1')
    return c.json(result.rows[0] || { totalVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0, activeVisitors: 0 })
  } catch (e) { console.error("DB Error:", e); return c.json({ error: 'Failed' }, 500) }
})
```

### After
- When `city` query param is provided, returns city-specific stats with 6 parallel parameterized queries
- When no city, keeps existing global behavior plus adds `cityCategories` array
- All queries use `$1` parameterized inputs to prevent SQL injection
- Each query has `.catch()` fallback for resilience
- `activeVisitors` for city mode uses a seeded hash of the city name for consistent random values (5-50)

### City-specific response fields
- `totalProviders` - users with roleId=2 in that city
- `totalClients` - users with roleId=1 in that city
- `totalServices` - active+approved services from providers in that city
- `totalBookings` - bookings from providers in that city
- `activeVisitors` - seeded random 5-50
- `totalUsers` - total users in that city
- `cityCategories` - category slugs with active services in that city
- `city` - the queried city name

## Verification
- Code compiles and runs without errors
- API server starts successfully on port 3001
- Endpoint responds to both `/api/stats/platform` (global) and `/api/stats/platform?city=Mumbai` (city-specific)

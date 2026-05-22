// ─── routes/hyperlocal.routes.ts ────────────────────────────────────────
// All hyperlocal / geo / area activation / waiting-list / area-manager routes
// Extracted from the monolithic index.ts
// ────────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, JWT_SECRET, getAuthUser, haversineDistance, findCityByCoords, findCityByName, findCityByPincode, INDIAN_CITIES } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'
import { isPostGISAvailable, findNearbyProvidersPostGIS } from '../lib/postgis'

const router = new Hono()

// ─── Helper: get area status from DB ──────────────────────────────────────
// Used by /api/area/status and /api/area/activation

async function getAreaStatusFromDB(cityName: string, stateName?: string) {
  // Try AreaActivation table first
  try {
    const areaResult = await pool.query('SELECT * FROM "AreaActivation" WHERE city = $1 LIMIT 1', [cityName])
    if (areaResult.rows[0]) {
      const area = areaResult.rows[0]
      return {
        city: area.city,
        state: area.state || stateName || '',
        isActive: area.isActive,
        providerCount: area.providerCount || 0,
        customerCount: area.customerCount || 0,
        providerTarget: area.providerTarget || 20,
        customerTarget: area.customerTarget || 100,
        availableCategories: area.availableCategories || [],
        comingSoonCategories: area.comingSoonCategories || [],
        launchProgress: area.launchProgress || 0,
      }
    }
  } catch (e) { /* AreaActivation table may not exist */ }

  // Compute real counts from User table
  try {
    const [providerResult, customerResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 2 AND status = \'ACTIVE\' AND city ILIKE $1', [cityName]),
      pool.query('SELECT COUNT(*) as count FROM "User" WHERE "roleId" = 1 AND status = \'ACTIVE\' AND city ILIKE $1', [cityName]),
    ])
    const providerCount = parseInt(providerResult.rows[0]?.count || '0')
    const customerCount = parseInt(customerResult.rows[0]?.count || '0')
    return {
      city: cityName,
      state: stateName || '',
      isActive: providerCount >= 5, // active if at least 5 providers
      providerCount,
      customerCount,
      providerTarget: 20,
      customerTarget: 100,
      availableCategories: providerCount >= 5 ? [1, 2, 3] : [],
      comingSoonCategories: providerCount >= 5 ? [] : [1, 2, 3, 4, 5],
      launchProgress: Math.round((Math.min(providerCount / 20, 1) * 0.5 + Math.min(customerCount / 100, 1) * 0.5) * 100),
    }
  } catch (e) { /* User table query failed */ }

  // No data available
  return {
    city: cityName,
    state: stateName || '',
    isActive: false,
    providerCount: 0,
    customerCount: 0,
    providerTarget: 20,
    customerTarget: 100,
    availableCategories: [],
    comingSoonCategories: [],
    launchProgress: 0,
  }
}

// ─── 1. GET /api/providers/nearby ────────────────────────────────────────
// Find providers within radius (PostGIS first, Haversine fallback)

router.get('/api/providers/nearby', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '')
    const lng = parseFloat(c.req.query('lng') || '')
    const radius = parseFloat(c.req.query('radius') || '20')
    const categoryId = c.req.query('categoryId')

    if (isNaN(lat) || isNaN(lng)) {
      return c.json({ error: 'Valid lat and lng query parameters are required' }, 400)
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return c.json({ error: 'Invalid latitude or longitude values' }, 400)
    }

    // Try cache first
    const cacheKey = CacheKeys.nearbyProviders(lat, lng, radius, categoryId || undefined)
    const cached = await redis.getJson<{ providers: any[]; total: number; radius: number }>(cacheKey)
    if (cached) return c.json(cached)

    // ─── Try PostGIS first (fast, accurate ST_DWithin) ───────────────
    try {
      const postgisAvailable = await isPostGISAvailable(pool)
      if (postgisAvailable) {
        const radiusMeters = radius * 1000 // km → meters
        const pgRows = await findNearbyProvidersPostGIS(pool, {
          lat,
          lng,
          radiusMeters,
          categoryId: categoryId ? parseInt(categoryId) : undefined,
        })

        // Group by provider (same shape as Haversine path)
        const providerMap = new Map<string, any>()
        for (const row of pgRows) {
          if (!providerMap.has(row.id)) {
            const distanceKm = parseFloat(row.distance) / 1000 // meters → km
            providerMap.set(row.id, {
              id: row.id,
              name: row.name,
              profileImageUrl: row.profileImageUrl,
              city: row.city,
              state: row.state,
              pincode: row.pincode,
              isVerified: row.isVerified,
              averageRating: row.averageRating,
              completedJobsCount: row.completedJobsCount,
              verifiedBadge: row.verifiedBadge,
              latitude: row.latitude ? parseFloat(row.latitude) : null,
              longitude: row.longitude ? parseFloat(row.longitude) : null,
              distance: Math.round(distanceKm * 10) / 10,
              services: [],
            })
          }
          if (row.serviceId) {
            providerMap.get(row.id).services.push({
              id: row.serviceId,
              title: row.serviceName,
              categoryId: row.categoryId,
            })
          }
        }

        const providers = Array.from(providerMap.values()).sort((a, b) => a.distance - b.distance)
        const data = { providers, total: providers.length, radius }

        // Write to cache (non-blocking)
        redis.setJson(cacheKey, data, CacheTTL.MEDIUM).catch(() => {})

        return c.json(data)
      }
    } catch (postgisError: any) {
      // PostGIS query failed — fall through to Haversine
      console.warn('⚠️  PostGIS nearby query failed, falling back to Haversine:', postgisError.message)
    }

    // ─── Haversine fallback (bounding-box + JS distance calc) ────────
    try {
      let query = `
        SELECT u.id, u.name, u."profileImageUrl", u.city, u.state, u.pincode, u."isVerified", 
               u."averageRating", u."completedJobsCount", u."verifiedBadge",
               u.latitude, u.longitude,
               s.id as "serviceId", s.title as "serviceName", s."categoryId"
        FROM "User" u
        LEFT JOIN "Service" s ON s."providerId" = u.id AND s."isActive" = true AND s."isApproved" = true
        WHERE u."roleId" = 2 AND u.status = 'ACTIVE'
          AND u.latitude BETWEEN ${lat - 0.3} AND ${lat + 0.3}
          AND u.longitude BETWEEN ${lng - 0.3} AND ${lng + 0.3}
      `
      const params: any[] = []
      let paramIdx = 1

      if (categoryId) {
        query += ` AND s."categoryId" = $${paramIdx}`
        params.push(parseInt(categoryId))
        paramIdx++
      }

      const result = await pool.query(query, params)

      // Filter by Haversine distance
      const nearbyProviders: any[] = []
      const providerMap = new Map<string, any>()

      for (const row of result.rows) {
        const provLat = row.latitude ? parseFloat(row.latitude) : null
        const provLng = row.longitude ? parseFloat(row.longitude) : null

        if (provLat === null || provLng === null) continue

        const distance = haversineDistance(lat, lng, provLat, provLng)
        if (distance <= radius) {
          if (!providerMap.has(row.id)) {
            providerMap.set(row.id, {
              id: row.id,
              name: row.name,
              profileImageUrl: row.profileImageUrl,
              city: row.city,
              state: row.state,
              pincode: row.pincode,
              isVerified: row.isVerified,
              averageRating: row.averageRating,
              completedJobsCount: row.completedJobsCount,
              verifiedBadge: row.verifiedBadge,
              latitude: provLat,
              longitude: provLng,
              distance: Math.round(distance * 10) / 10,
              services: [],
            })
          }

          if (row.serviceId) {
            providerMap.get(row.id).services.push({
              id: row.serviceId,
              title: row.serviceName,
              categoryId: row.categoryId,
            })
          }
        }
      }

      const providers = Array.from(providerMap.values()).sort((a, b) => a.distance - b.distance)
      const data = { providers, total: providers.length, radius }

      // Write to cache (non-blocking)
      redis.setJson(cacheKey, data, CacheTTL.MEDIUM).catch(() => {})

      return c.json(data)
    } catch (dbError) {
      // DB tables might not have lat/lng columns - return empty result
      return c.json({
        providers: [],
        total: 0,
        radius,
      })
    }
  } catch (e) {
    console.error('Nearby providers error:', e)
    return c.json({ error: 'Failed to find nearby providers' }, 500)
  }
})

// ─── 2. GET /api/area/status ──────────────────────────────────────────────
// Get area activation status

router.get('/api/area/status', async (c) => {
  try {
    const city = c.req.query('city')
    const pincode = c.req.query('pincode')
    const lat = c.req.query('lat')
    const lng = c.req.query('lng')

    let cityInfo: typeof INDIAN_CITIES[number] | null = null

    if (city) {
      cityInfo = findCityByName(city)
    } else if (pincode) {
      cityInfo = findCityByPincode(pincode)
    } else if (lat && lng) {
      const parsedLat = parseFloat(lat)
      const parsedLng = parseFloat(lng)
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        cityInfo = findCityByCoords(parsedLat, parsedLng)
      }
    } else {
      return c.json({ error: 'Provide city, pincode, or lat+lng query parameters' }, 400)
    }

    // Try DB first for area data using shared helper
    const cityName = cityInfo?.city || city || ''
    const stateName = cityInfo?.state || ''
    if (cityName) {
      const areaStatus = await getAreaStatusFromDB(cityName, stateName)
      return c.json(areaStatus)
    }

    // No city identified
    return c.json({
      city: city || 'Unknown',
      state: stateName || 'Unknown',
      isActive: false,
      providerCount: 0,
      customerCount: 0,
      providerTarget: 20,
      customerTarget: 100,
      availableCategories: [],
      comingSoonCategories: [],
      launchProgress: 0,
    })
  } catch (e) {
    console.error('Area status error:', e)
    return c.json({ error: 'Failed to get area status' }, 500)
  }
})

// ─── 3. GET /api/area/activation ──────────────────────────────────────────
// Get activation meter data for an area

router.get('/api/area/activation', async (c) => {
  try {
    const city = c.req.query('city')

    if (!city) {
      return c.json({ error: 'city query parameter is required' }, 400)
    }

    const cityInfo = findCityByName(city)
    const stateName = cityInfo?.state || ''

    // Use shared helper to get real data from DB
    const status = await getAreaStatusFromDB(city, stateName)

    return c.json({
      city: status.city,
      state: status.state,
      isActive: status.isActive,
      providerCount: status.providerCount,
      customerCount: status.customerCount,
      providerTarget: status.providerTarget,
      customerTarget: status.customerTarget,
      launchProgress: status.launchProgress,
      activationMeter: {
        current: status.launchProgress,
        target: 100,
        providersNeeded: Math.max(0, status.providerTarget - status.providerCount),
        customersNeeded: Math.max(0, status.customerTarget - status.customerCount),
        status: status.launchProgress >= 70 ? 'LAUNCHING' : status.launchProgress >= 30 ? 'GROWING' : 'STARTING',
      },
    })
  } catch (e) {
    console.error('Area activation error:', e)
    return c.json({ error: 'Failed to get activation data' }, 500)
  }
})

// ─── 4. GET /api/location/reverse-geocode ────────────────────────────────
// Reverse geocode lat/lng to city info

router.get('/api/location/reverse-geocode', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '')
    const lng = parseFloat(c.req.query('lng') || '')

    if (isNaN(lat) || isNaN(lng)) {
      return c.json({ error: 'Valid lat and lng query parameters are required' }, 400)
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return c.json({ error: 'Invalid latitude or longitude values' }, 400)
    }

    // Try DB first for reverse geocoding
    try {
      const result = await pool.query(
        'SELECT city, state, pincode FROM "Location" WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4 LIMIT 1',
        [lat - 0.05, lat + 0.05, lng - 0.05, lng + 0.05]
      )
      if (result.rows[0]) {
        return c.json({
          city: result.rows[0].city,
          state: result.rows[0].state,
          pincode: result.rows[0].pincode,
          latitude: lat,
          longitude: lng,
          source: 'database',
        })
      }
    } catch (dbError) {
      // Table doesn't exist
    }

    // Use local Indian cities data for reverse lookup
    const cityInfo = findCityByCoords(lat, lng)

    if (cityInfo) {
      const distance = haversineDistance(lat, lng, cityInfo.lat, cityInfo.lng)
      // Pick a representative pincode from the city
      const pincode = cityInfo.pincodes[0] || ''
      return c.json({
        city: cityInfo.city,
        state: cityInfo.state,
        pincode,
        latitude: lat,
        longitude: lng,
        distanceFromCenter: Math.round(distance * 10) / 10,
        source: 'local_lookup',
      })
    }

    // Unknown location
    return c.json({
      city: null,
      state: null,
      pincode: null,
      latitude: lat,
      longitude: lng,
      source: 'unknown',
      message: 'Location not found in our database. We are currently available in major Indian cities.',
    })
  } catch (e) {
    console.error('Reverse geocode error:', e)
    return c.json({ error: 'Failed to reverse geocode' }, 500)
  }
})

// ─── 5. GET /api/service-areas ────────────────────────────────────────────
// Get service areas list

router.get('/api/service-areas', async (c) => {
  try {
    // Try DB first
    try {
      const result = await pool.query('SELECT * FROM "ServiceArea" WHERE "isActive" = true ORDER BY city')
      if (result.rows.length > 0) return c.json(result.rows)
    } catch (dbError) { /* table may not exist */ }

    // Try AreaActivation table as alternative
    try {
      const result = await pool.query('SELECT * FROM "AreaActivation" ORDER BY city')
      if (result.rows.length > 0) return c.json(result.rows)
    } catch (dbError) { /* table may not exist */ }

    // No data available
    return c.json([])
  } catch (e) {
    return c.json({ error: 'Failed to get service areas' }, 500)
  }
})

// ─── 6. GET /api/cities ──────────────────────────────────────────────────
// Get list of cities

router.get('/api/cities', async (c) => {
  try {
    try {
      const result = await pool.query('SELECT DISTINCT city, state, COUNT(*) as "serviceCount" FROM "Service" s JOIN "User" u ON s."providerId" = u.id WHERE s."isActive" = true AND s."isApproved" = true AND u.city IS NOT NULL GROUP BY city, state ORDER BY "serviceCount" DESC')
      if (result.rows.length > 0) return c.json({ cities: result.rows, total: result.rows.length })
    } catch (dbError) { /* use fallback */ }
    // Fallback to INDIAN_CITIES
    const cities = INDIAN_CITIES.map(c => ({ city: c.city, state: c.state }))
    return c.json({ cities, total: cities.length })
  } catch (e) { return c.json({ error: 'Failed to list cities' }, 500) }
})

// ─── 7. POST /api/waiting-list/join ──────────────────────────────────────
// Join the waiting list

router.post('/api/waiting-list/join', async (c) => {
  try {
    const { name, phone, email, city, pincode, serviceInterest } = await c.req.json()

    if (!name || !phone || !city) {
      return c.json({ error: 'name, phone, and city are required' }, 400)
    }

    const id = 'wl_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const entry = {
      id,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      city: String(city).trim(),
      pincode: pincode ? String(pincode).trim() : null,
      serviceInterest: serviceInterest ? String(serviceInterest).trim() : null,
      createdAt: new Date().toISOString(),
    }

    // Insert into DB (no in-memory fallback)
    await pool.query(
      'INSERT INTO "WaitingList" (id, name, phone, email, city, pincode, "serviceInterest", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [entry.id, entry.name, entry.phone, entry.email, entry.city, entry.pincode, entry.serviceInterest, entry.createdAt]
    )

    return c.json({
      success: true,
      message: `You've been added to the waiting list for ${entry.city}. We'll notify you when services launch in your area!`,
      id: entry.id,
    }, 201)
  } catch (e) {
    console.error('Waiting list join error:', e)
    return c.json({ error: 'Failed to join waiting list' }, 500)
  }
})

// ─── 8. POST /api/area-manager/apply ─────────────────────────────────────
// Apply as area manager

router.post('/api/area-manager/apply', async (c) => {
  try {
    const { name, email, phone, city, experience, message } = await c.req.json()

    if (!name || !email || !phone || !city) {
      return c.json({ error: 'name, email, phone, and city are required' }, 400)
    }

    const id = 'am_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    const application = {
      id,
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      city: String(city).trim(),
      experience: experience ? String(experience).trim() : null,
      message: message ? String(message).trim() : null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    // Insert into DB (no in-memory fallback)
    await pool.query(
      'INSERT INTO "AreaManagerApplication" (id, name, email, phone, city, experience, message, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [application.id, application.name, application.email, application.phone, application.city, application.experience, application.message, application.status, application.createdAt]
    )

    return c.json({
      success: true,
      message: `Your application to become an Area Manager for ${application.city} has been submitted. We'll review it and get back to you soon!`,
      application: {
        id: application.id,
        name: application.name,
        city: application.city,
        status: application.status,
        createdAt: application.createdAt,
      },
    }, 201)
  } catch (e) {
    console.error('Area manager apply error:', e)
    return c.json({ error: 'Failed to submit application' }, 500)
  }
})

export const hyperlocalRoutes = router

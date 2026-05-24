// ─── services/geo.service.ts ────────────────────────────────────────────
// Pure business logic extracted from routes/hyperlocal.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool, haversineDistance, findCityByCoords, findCityByName, findCityByPincode, INDIAN_CITIES } from '../lib/shared'
import { redis, CacheKeys, CacheTTL } from '../lib/redis'
import { isPostGISAvailable, findNearbyProvidersPostGIS } from '../lib/postgis'

// ─── Find Nearby Providers ───────────────────────────────────────────

export async function findNearbyProviders(lat: number, lng: number, radius: number, categoryId?: string): Promise<{
  providers: any[]; total: number; radius: number
}> {
  // Try cache first
  const cacheKey = CacheKeys.nearbyProviders(lat, lng, radius, categoryId || undefined)
  const cached = await redis.getJson<{ providers: any[]; total: number; radius: number }>(cacheKey)
  if (cached) return cached

  // Try PostGIS first (fast, accurate ST_DWithin)
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

      return data
    }
  } catch (postgisError: any) {
    console.warn('⚠️  PostGIS nearby query failed, falling back to Haversine:', postgisError.message)
  }

  // Haversine fallback (bounding-box + JS distance calc)
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

    return data
  } catch (dbError) {
    // DB tables might not have lat/lng columns - return empty result
    return { providers: [], total: 0, radius }
  }
}

// ─── Area Status ─────────────────────────────────────────────────────

export async function getAreaStatus(cityName: string, stateName?: string): Promise<{
  city: string; state: string; isActive: boolean; providerCount: number; customerCount: number;
  providerTarget: number; customerTarget: number; availableCategories: number[];
  comingSoonCategories: number[]; launchProgress: number
}> {
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
      isActive: providerCount >= 5,
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

// ─── Area Activation ─────────────────────────────────────────────────

export async function getAreaActivation(city: string): Promise<{
  city: string; state: string; isActive: boolean; providerCount: number; customerCount: number;
  providerTarget: number; customerTarget: number; launchProgress: number;
  activationMeter: { current: number; target: number; providersNeeded: number; customersNeeded: number; status: string }
}> {
  const cityInfo = findCityByName(city)
  const stateName = cityInfo?.state || ''

  const status = await getAreaStatus(city, stateName)

  return {
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
  }
}

// ─── Reverse Geocode ─────────────────────────────────────────────────

export async function reverseGeocode(lat: number, lng: number): Promise<{
  city: string | null; state: string | null; pincode: string | null;
  latitude: number; longitude: number; source: string;
  distanceFromCenter?: number; message?: string
}> {
  // Try DB first for reverse geocoding
  try {
    const result = await pool.query(
      'SELECT city, state, pincode FROM "Location" WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4 LIMIT 1',
      [lat - 0.05, lat + 0.05, lng - 0.05, lng + 0.05]
    )
    if (result.rows[0]) {
      return {
        city: result.rows[0].city,
        state: result.rows[0].state,
        pincode: result.rows[0].pincode,
        latitude: lat,
        longitude: lng,
        source: 'database',
      }
    }
  } catch (dbError) {
    // Table doesn't exist
  }

  // Use local Indian cities data for reverse lookup
  const cityInfo = findCityByCoords(lat, lng)

  if (cityInfo) {
    const distance = haversineDistance(lat, lng, cityInfo.lat, cityInfo.lng)
    const pincode = cityInfo.pincodes[0] || ''
    return {
      city: cityInfo.city,
      state: cityInfo.state,
      pincode,
      latitude: lat,
      longitude: lng,
      distanceFromCenter: Math.round(distance * 10) / 10,
      source: 'local_lookup',
    }
  }

  // Unknown location
  return {
    city: null,
    state: null,
    pincode: null,
    latitude: lat,
    longitude: lng,
    source: 'unknown',
    message: 'Location not found in our database. We are currently available in major Indian cities.',
  }
}

// ─── Service Areas ───────────────────────────────────────────────────

export async function getServiceAreas(): Promise<any[]> {
  // Try DB first
  try {
    const result = await pool.query('SELECT * FROM "ServiceArea" WHERE "isActive" = true ORDER BY city')
    if (result.rows.length > 0) return result.rows
  } catch (dbError) { /* table may not exist */ }

  // Try AreaActivation table as alternative
  try {
    const result = await pool.query('SELECT * FROM "AreaActivation" ORDER BY city')
    if (result.rows.length > 0) return result.rows
  } catch (dbError) { /* table may not exist */ }

  // No data available
  return []
}

// ─── Cities ──────────────────────────────────────────────────────────

export async function getCities(): Promise<{ cities: any[]; total: number }> {
  try {
    const result = await pool.query('SELECT DISTINCT city, state, COUNT(*) as "serviceCount" FROM "Service" s JOIN "User" u ON s."providerId" = u.id WHERE s."isActive" = true AND s."isApproved" = true AND u.city IS NOT NULL GROUP BY city, state ORDER BY "serviceCount" DESC')
    if (result.rows.length > 0) return { cities: result.rows, total: result.rows.length }
  } catch (dbError) { /* use fallback */ }

  // Fallback to INDIAN_CITIES
  const cities = INDIAN_CITIES.map(c => ({ city: c.city, state: c.state }))
  return { cities, total: cities.length }
}

// ─── Waiting List ────────────────────────────────────────────────────

export async function joinWaitingList(data: {
  name: string; phone: string; email?: string; city: string; pincode?: string; serviceInterest?: string
}): Promise<{ success: boolean; message: string; id: string }> {
  const { name, phone, email, city, pincode, serviceInterest } = data

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

  // Insert into DB
  await pool.query(
    'INSERT INTO "WaitingList" (id, name, phone, email, city, pincode, "serviceInterest", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [entry.id, entry.name, entry.phone, entry.email, entry.city, entry.pincode, entry.serviceInterest, entry.createdAt]
  )

  return {
    success: true,
    message: `You've been added to the waiting list for ${entry.city}. We'll notify you when services launch in your area!`,
    id: entry.id,
  }
}

// ─── Area Manager Application ────────────────────────────────────────

export async function applyAreaManager(data: {
  name: string; email: string; phone: string; city: string; experience?: string; message?: string
}): Promise<{
  success: boolean; message: string; application: { id: string; name: string; city: string; status: string; createdAt: string }
}> {
  const { name, email, phone, city, experience, message } = data

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

  // Insert into DB
  await pool.query(
    'INSERT INTO "AreaManagerApplication" (id, name, email, phone, city, experience, message, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [application.id, application.name, application.email, application.phone, application.city, application.experience, application.message, application.status, application.createdAt]
  )

  return {
    success: true,
    message: `Your application to become an Area Manager for ${application.city} has been submitted. We'll review it and get back to you soon!`,
    application: {
      id: application.id,
      name: application.name,
      city: application.city,
      status: application.status,
      createdAt: application.createdAt,
    },
  }
}

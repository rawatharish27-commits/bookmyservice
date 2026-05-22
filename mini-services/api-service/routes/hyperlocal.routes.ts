// ─── routes/hyperlocal.routes.ts ────────────────────────────────────────
// All hyperlocal / geo / area activation / waiting-list / area-manager routes
// Refactored: thin handlers that delegate to geo.service
// ────────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser, findCityByName, findCityByCoords, findCityByPincode, INDIAN_CITIES } from '../lib/shared'
import * as geoService from '../services/geo.service'

const router = new Hono()

// ─── 1. GET /api/providers/nearby ────────────────────────────────────────

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

    const data = await geoService.findNearbyProviders(lat, lng, radius, categoryId || undefined)
    return c.json(data)
  } catch (e) {
    console.error('Nearby providers error:', e)
    return c.json({ error: 'Failed to find nearby providers' }, 500)
  }
})

// ─── 2. GET /api/area/status ──────────────────────────────────────────────

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

    const cityName = cityInfo?.city || city || ''
    const stateName = cityInfo?.state || ''
    if (cityName) {
      const areaStatus = await geoService.getAreaStatus(cityName, stateName)
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

router.get('/api/area/activation', async (c) => {
  try {
    const city = c.req.query('city')

    if (!city) {
      return c.json({ error: 'city query parameter is required' }, 400)
    }

    const data = await geoService.getAreaActivation(city)
    return c.json(data)
  } catch (e) {
    console.error('Area activation error:', e)
    return c.json({ error: 'Failed to get activation data' }, 500)
  }
})

// ─── 4. GET /api/location/reverse-geocode ────────────────────────────────

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

    const data = await geoService.reverseGeocode(lat, lng)
    return c.json(data)
  } catch (e) {
    console.error('Reverse geocode error:', e)
    return c.json({ error: 'Failed to reverse geocode' }, 500)
  }
})

// ─── 5. GET /api/service-areas ────────────────────────────────────────────

router.get('/api/service-areas', async (c) => {
  try {
    const data = await geoService.getServiceAreas()
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to get service areas' }, 500)
  }
})

// ─── 6. GET /api/cities ──────────────────────────────────────────────────

router.get('/api/cities', async (c) => {
  try {
    const data = await geoService.getCities()
    return c.json(data)
  } catch (e) { return c.json({ error: 'Failed to list cities' }, 500) }
})

// ─── 7. POST /api/waiting-list/join ──────────────────────────────────────

router.post('/api/waiting-list/join', async (c) => {
  try {
    const { name, phone, email, city, pincode, serviceInterest } = await c.req.json()

    if (!name || !phone || !city) {
      return c.json({ error: 'name, phone, and city are required' }, 400)
    }

    const result = await geoService.joinWaitingList({ name, phone, email, city, pincode, serviceInterest })
    return c.json(result, 201)
  } catch (e) {
    console.error('Waiting list join error:', e)
    return c.json({ error: 'Failed to join waiting list' }, 500)
  }
})

// ─── 8. POST /api/area-manager/apply ─────────────────────────────────────

router.post('/api/area-manager/apply', async (c) => {
  try {
    const { name, email, phone, city, experience, message } = await c.req.json()

    if (!name || !email || !phone || !city) {
      return c.json({ error: 'name, email, phone, and city are required' }, 400)
    }

    const result = await geoService.applyAreaManager({ name, email, phone, city, experience, message })
    return c.json(result, 201)
  } catch (e) {
    console.error('Area manager apply error:', e)
    return c.json({ error: 'Failed to submit application' }, 500)
  }
})

export const hyperlocalRoutes = router

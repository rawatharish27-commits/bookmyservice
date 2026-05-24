// ─── routes/recommendation.routes.ts ────────────────────────────────────
// AI-powered recommendation endpoints
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { jwtVerify } from 'jose'
import { pool, JWT_SECRET } from '../lib/shared'
import { generatePersonalizedRecommendations, generateSimilarServices, generateSearchSuggestions, generateBookingInsights, generateTrendingServices } from '../lib/recommendations'

const router = new Hono()

// GET /api/recommendations — Personalized recommendations for logged-in user
router.get('/api/recommendations', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })

    const recommendations = await generatePersonalizedRecommendations(payload.sub as string, pool)
    return c.json({ recommendations, total: recommendations.length })
  } catch (e: any) {
    console.error('Recommendations error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to generate recommendations' }, 500)
  }
})

// GET /api/recommendations/similar/:serviceId — Get similar services
router.get('/api/recommendations/similar/:serviceId', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })

    const serviceId = c.req.param('serviceId')
    if (!serviceId) return c.json({ error: 'Service ID is required' }, 400)

    const similar = await generateSimilarServices(serviceId, pool)
    return c.json({ recommendations: similar, total: similar.length })
  } catch (e: any) {
    console.error('Similar services error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to find similar services' }, 500)
  }
})

// GET /api/recommendations/search-suggestions — Smart search suggestions (query param: q)
router.get('/api/recommendations/search-suggestions', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })

    const query = c.req.query('q')
    if (!query || query.trim().length < 1) return c.json({ error: 'Query parameter "q" is required' }, 400)

    const city = c.req.query('city') || null
    const suggestions = await generateSearchSuggestions(query, city, pool)
    return c.json({ suggestions, total: suggestions.length })
  } catch (e: any) {
    console.error('Search suggestions error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to generate search suggestions' }, 500)
  }
})

// GET /api/recommendations/insights — Booking insights for logged-in user
router.get('/api/recommendations/insights', async (c) => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Authentication required' }, 401)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(authHeader.split(' ')[1], secret, { issuer: 'bookyourservice', audience: 'bookyourservice' })

    const insights = await generateBookingInsights(payload.sub as string, pool)
    return c.json({ insights, total: insights.length })
  } catch (e: any) {
    console.error('Booking insights error:', e)
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_INVALID' || e?.code === 'ERR_JWT_INVALID') {
      return c.json({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED' }, 401)
    }
    return c.json({ error: 'Failed to generate booking insights' }, 500)
  }
})

// GET /api/recommendations/trending — Trending services (city param optional)
router.get('/api/recommendations/trending', async (c) => {
  try {
    const city = c.req.query('city') || undefined
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '10'), 1), 50)
    const trending = await generateTrendingServices(pool, city, limit)
    return c.json({ trending, total: trending.length })
  } catch (e: any) {
    console.error('Trending services error:', e)
    return c.json({ error: 'Failed to fetch trending services' }, 500)
  }
})

export const recommendationRoutes = router

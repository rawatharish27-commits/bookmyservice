/**
 * AI-Powered Recommendation Engine for BookMyService
 *
 * Uses z-ai-web-dev-sdk LLM capability to generate personalized service
 * recommendations, similar service suggestions, smart search, and booking insights.
 * Falls back to rule-based recommendations when LLM is unavailable.
 *
 * Caching: Redis with 15-minute TTL per user/query
 * Rate Limiting: Applied at the route level in index.ts
 */

import { Pool } from 'pg'
import ZAI from 'z-ai-web-dev-sdk'
import { redis, CacheTTL } from './redis'
import { logger } from './logger'

// ─── Types ────────────────────────────────────────────────────────────────

export interface RecommendedService {
  id: string
  title: string
  description: string
  basePrice: number
  averageRating: number
  totalReviews: number
  categoryId: string
  categoryName: string
  providerName: string
  providerCity: string
  images: string[]
  reason: string
  relevanceScore: number
}

export interface SearchSuggestion {
  text: string
  type: 'service' | 'category' | 'query' | 'trending'
  confidence: number
}

export interface BookingInsight {
  type: 'spending' | 'frequency' | 'timing' | 'category' | 'savings'
  title: string
  description: string
  value: string
  recommendation: string
}

export interface TrendingService {
  id: string
  title: string
  categoryName: string
  bookingCount: number
  growthRate: number
}

// ─── Cache Key Builders ───────────────────────────────────────────────────

const RecCacheKeys = {
  personalized: (userId: string) => `recommendations:user:${userId}`,
  similar: (serviceId: string) => `recommendations:similar:${serviceId}`,
  search: (hash: string) => `recommendations:search:${hash}`,
  insights: (userId: string) => `recommendations:insights:${userId}`,
  trending: (city: string) => `recommendations:trending:${city}`,
}

const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

// ─── LLM Singleton ───────────────────────────────────────────────────────

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null
let zaiInitPromise: Promise<Awaited<ReturnType<typeof ZAI.create>> | null> | null = null

async function getLLM(): Promise<Awaited<ReturnType<typeof ZAI.create>> | null> {
  if (zaiInstance) return zaiInstance

  if (zaiInitPromise) {
    return zaiInitPromise
  }

  zaiInitPromise = (async () => {
    try {
      const instance = await ZAI.create()
      zaiInstance = instance
      logger.info('AI Recommendation Engine: LLM initialized successfully')
      return instance
    } catch (err: any) {
      logger.error('AI Recommendation Engine: LLM initialization failed', {
        error: err.message,
      })
      zaiInitPromise = null
      return null
    }
  })()

  return zaiInitPromise
}

// ─── LLM Helper ──────────────────────────────────────────────────────────

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    const zai = await getLLM()
    if (!zai) return null

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    })

    const content = completion.choices?.[0]?.message?.content
    if (!content || content.trim().length === 0) {
      logger.warn('AI Recommendation Engine: Empty LLM response')
      return null
    }

    return content.trim()
  } catch (err: any) {
    logger.error('AI Recommendation Engine: LLM call failed', {
      error: err.message,
    })
    // Reset instance so we try to reinitialize next time
    zaiInstance = null
    zaiInitPromise = null
    return null
  }
}

// ─── Data Fetching Helpers ────────────────────────────────────────────────

interface UserBookingHistory {
  bookings: Array<{
    serviceId: string
    serviceTitle: string
    categoryName: string
    categoryId: string
    finalPrice: number
    status: string
    scheduledDate: string
    createdAt: string
  }>
  topCategories: Array<{ categoryId: string; categoryName: string; count: number }>
  totalSpent: number
  avgPrice: number
}

interface UserLocation {
  latitude: number | null
  longitude: number | null
  city: string | null
  state: string | null
}

async function getUserBookingHistory(
  userId: string,
  pool: Pool
): Promise<UserBookingHistory> {
  const result = await pool.query(
    `SELECT b."serviceId", b."finalPrice", b.status, b."scheduledDate", b."createdAt",
            s.title as "serviceTitle", s."categoryId",
            sc.name as "categoryName"
     FROM "Booking" b
     LEFT JOIN "Service" s ON b."serviceId" = s.id
     LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
     WHERE b."clientId" = $1
     ORDER BY b."createdAt" DESC
     LIMIT 10`,
    [userId]
  )

  const bookings = result.rows.map((r) => ({
    serviceId: r.serviceId,
    serviceTitle: r.serviceTitle || 'Unknown Service',
    categoryName: r.categoryName || 'Unknown',
    categoryId: r.categoryId || '',
    finalPrice: parseFloat(r.finalPrice) || 0,
    status: r.status,
    scheduledDate: r.scheduledDate,
    createdAt: r.createdAt,
  }))

  // Aggregate top categories
  const catMap = new Map<string, { categoryName: string; count: number }>()
  for (const b of bookings) {
    if (!b.categoryId) continue
    const existing = catMap.get(b.categoryId)
    if (existing) {
      existing.count++
    } else {
      catMap.set(b.categoryId, { categoryName: b.categoryName, count: 1 })
    }
  }

  const topCategories = [...catMap.entries()]
    .map(([categoryId, data]) => ({ categoryId, ...data }))
    .sort((a, b) => b.count - a.count)

  const totalSpent = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.finalPrice, 0)

  const avgPrice =
    bookings.length > 0 ? totalSpent / bookings.filter((b) => b.status === 'COMPLETED').length : 0

  return { bookings, topCategories, totalSpent, avgPrice }
}

async function getUserLocation(userId: string, pool: Pool): Promise<UserLocation> {
  const result = await pool.query(
    `SELECT latitude, longitude, city, state FROM "User" WHERE id = $1`,
    [userId]
  )
  if (!result.rows[0]) {
    return { latitude: null, longitude: null, city: null, state: null }
  }
  const row = result.rows[0]
  return {
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    city: row.city || null,
    state: row.state || null,
  }
}

async function getUserSearchHistory(userId: string): Promise<string[]> {
  try {
    const raw = await redis.get(`popular:services:user:${userId}`)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  // Fallback: get popular searches globally
  return redis.getPopularSearches(10)
}

async function getTrendingServices(
  pool: Pool,
  city?: string,
  limit: number = 10
): Promise<Array<Record<string, any>>> {
  let query = `
    SELECT s.id, s.title, s."basePrice", s."averageRating", s."totalReviews",
           s."categoryId", s.images,
           sc.name as "categoryName",
           u.name as "providerName", u.city as "providerCity",
           COUNT(b.id) as "bookingCount"
    FROM "Service" s
    LEFT JOIN "Booking" b ON b."serviceId" = s.id AND b."createdAt" > NOW() - INTERVAL '30 days'
    LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
    LEFT JOIN "User" u ON s."providerId" = u.id
    WHERE s."isActive" = true AND s."isApproved" = true
  `
  const values: any[] = []
  let paramIdx = 1

  if (city) {
    query += ` AND (u.city ILIKE $${paramIdx} OR s."serviceArea" ILIKE $${paramIdx})`
    values.push(`%${city}%`)
    paramIdx++
  }

  query += `
    GROUP BY s.id, sc.name, u.name, u.city
    ORDER BY "bookingCount" DESC, s."averageRating" DESC
    LIMIT $${paramIdx}
  `
  values.push(limit)

  const result = await pool.query(query, values)
  return result.rows
}

async function getServicesByCategories(
  pool: Pool,
  categoryIds: string[],
  excludeServiceIds: string[],
  limit: number = 10
): Promise<Array<Record<string, any>>> {
  if (categoryIds.length === 0) return []

  const placeholders = categoryIds.map((_, i) => `$${i + 1}`).join(',')
  let excludeClause = ''
  const values: any[] = [...categoryIds]

  if (excludeServiceIds.length > 0) {
    const excludePlaceholders = excludeServiceIds.map((_, i) => `$${categoryIds.length + i + 1}`).join(',')
    excludeClause = ` AND s.id NOT IN (${excludePlaceholders})`
    values.push(...excludeServiceIds)
  }

  values.push(limit)

  const result = await pool.query(
    `SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
            s."totalReviews", s."categoryId", s.images,
            sc.name as "categoryName",
            u.name as "providerName", u.city as "providerCity"
     FROM "Service" s
     LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
     LEFT JOIN "User" u ON s."providerId" = u.id
     WHERE s."categoryId" IN (${placeholders})
       AND s."isActive" = true AND s."isApproved" = true
       ${excludeClause}
     ORDER BY s."averageRating" DESC, s."totalReviews" DESC
     LIMIT $${values.length}`,
    values
  )
  return result.rows
}

async function getPopularServices(
  pool: Pool,
  city?: string,
  limit: number = 10
): Promise<Array<Record<string, any>>> {
  let query = `
    SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
           s."totalReviews", s."categoryId", s.images,
           sc.name as "categoryName",
           u.name as "providerName", u.city as "providerCity"
    FROM "Service" s
    LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
    LEFT JOIN "User" u ON s."providerId" = u.id
    WHERE s."isActive" = true AND s."isApproved" = true
  `
  const values: any[] = []
  let paramIdx = 1

  if (city) {
    query += ` AND u.city ILIKE $${paramIdx}`
    values.push(`%${city}%`)
    paramIdx++
  }

  query += `
    ORDER BY s."totalReviews" DESC, s."averageRating" DESC
    LIMIT $${paramIdx}
  `
  values.push(limit)

  const result = await pool.query(query, values)
  return result.rows
}

async function getHighlyRatedServices(
  pool: Pool,
  minRating: number = 4.5,
  limit: number = 10
): Promise<Array<Record<string, any>>> {
  const result = await pool.query(
    `SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
            s."totalReviews", s."categoryId", s.images,
            sc.name as "categoryName",
            u.name as "providerName", u.city as "providerCity"
     FROM "Service" s
     LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
     LEFT JOIN "User" u ON s."providerId" = u.id
     WHERE s."isActive" = true AND s."isApproved" = true
       AND s."averageRating" >= $1
     ORDER BY s."averageRating" DESC, s."totalReviews" DESC
     LIMIT $2`,
    [minRating, limit]
  )
  return result.rows
}

async function getRecentlyAddedServices(
  pool: Pool,
  limit: number = 10
): Promise<Array<Record<string, any>>> {
  const result = await pool.query(
    `SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
            s."totalReviews", s."categoryId", s.images,
            sc.name as "categoryName",
            u.name as "providerName", u.city as "providerCity"
     FROM "Service" s
     LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
     LEFT JOIN "User" u ON s."providerId" = u.id
     WHERE s."isActive" = true AND s."isApproved" = true
     ORDER BY s."createdAt" DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}

// ─── Transform DB Row to RecommendedService ──────────────────────────────

function toRecommendedService(
  row: Record<string, any>,
  reason: string,
  relevanceScore: number
): RecommendedService {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    basePrice: parseFloat(row.basePrice) || 0,
    averageRating: parseFloat(row.averageRating) || 0,
    totalReviews: parseInt(row.totalReviews) || 0,
    categoryId: row.categoryId || '',
    categoryName: row.categoryName || '',
    providerName: row.providerName || '',
    providerCity: row.providerCity || '',
    images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [],
    reason,
    relevanceScore,
  }
}

// ─── Main Recommendation Functions ────────────────────────────────────────

/**
 * Generate personalized recommendations for a user based on booking history,
 * location, preferences, and popular trends.
 */
export async function generatePersonalizedRecommendations(
  userId: string,
  pool: Pool
): Promise<RecommendedService[]> {
  // Check cache first
  const cacheKey = RecCacheKeys.personalized(userId)
  try {
    const cached = await redis.getJson<RecommendedService[]>(cacheKey)
    if (cached && cached.length > 0) {
      logger.info('Recommendations: Cache hit', { userId })
      return cached
    }
  } catch {
    // cache miss — continue
  }

  try {
    // Fetch user context in parallel
    const [bookingHistory, location, searchHistory] = await Promise.all([
      getUserBookingHistory(userId, pool).catch(() => ({
        bookings: [],
        topCategories: [],
        totalSpent: 0,
        avgPrice: 0,
      })),
      getUserLocation(userId, pool).catch(() => ({
        latitude: null,
        longitude: null,
        city: null,
        state: null,
      })),
      getUserSearchHistory(userId).catch(() => [] as string[]),
    ])

    const bookedServiceIds = bookingHistory.bookings.map((b) => b.serviceId)
    const topCategoryIds = bookingHistory.topCategories.map((c) => c.categoryId)

    // Try LLM-powered recommendations
    const llmRecommendations = await generateLLMPersonalizedRecommendations(
      userId,
      bookingHistory,
      location,
      searchHistory,
      pool
    )

    if (llmRecommendations && llmRecommendations.length > 0) {
      // Cache the result
      await redis.setJson(cacheKey, llmRecommendations, CACHE_TTL).catch(() => {})
      return llmRecommendations
    }

    // Fall back to rule-based recommendations
    logger.info('Recommendations: Using rule-based fallback', { userId })
    const ruleBased = await generateRuleBasedRecommendations(
      topCategoryIds,
      bookedServiceIds,
      location.city,
      pool
    )

    // Cache the result
    await redis.setJson(cacheKey, ruleBased, CACHE_TTL).catch(() => {})
    return ruleBased
  } catch (err: any) {
    logger.error('Recommendations: Failed to generate personalized recommendations', {
      userId,
      error: err.message,
    })
    return []
  }
}

/**
 * LLM-powered personalized recommendations
 */
async function generateLLMPersonalizedRecommendations(
  userId: string,
  bookingHistory: UserBookingHistory,
  location: UserLocation,
  searchHistory: string[],
  pool: Pool
): Promise<RecommendedService[] | null> {
  // Fetch candidate services: mix of category-matched, popular, and trending
  const [categoryServices, popularServices, trendingServices] = await Promise.all([
    getServicesByCategories(
      pool,
      bookingHistory.topCategories.map((c) => c.categoryId),
      bookingHistory.bookings.map((b) => b.serviceId),
      15
    ).catch(() => []),
    getPopularServices(pool, location.city || undefined, 10).catch(() => []),
    getTrendingServices(pool, location.city || undefined, 10).catch(() => []),
  ])

  // Deduplicate and combine candidate services
  const seenIds = new Set<string>()
  const allCandidates: Record<string, any>[] = []
  for (const svc of [...categoryServices, ...popularServices, ...trendingServices]) {
    if (!seenIds.has(svc.id)) {
      seenIds.add(svc.id)
      allCandidates.push(svc)
    }
  }

  if (allCandidates.length === 0) return null

  // Limit candidates to avoid excessive token usage
  const candidates = allCandidates.slice(0, 30)

  // Build the LLM prompt
  const systemPrompt = `You are an AI recommendation engine for a service booking platform called BookMyService. 
Your job is to analyze a user's profile, booking history, location, and search patterns, then recommend the most relevant services from the candidate list.

You MUST respond with ONLY a valid JSON array. No markdown, no explanation, just the JSON array.
Each element should have:
- "id": the service ID from the candidates
- "reason": a short personalized reason (max 100 chars) why this service is recommended
- "relevanceScore": a number from 0.0 to 1.0 indicating how relevant this is

Return at most 10 recommendations, sorted by relevanceScore descending.`

  const userPrompt = `USER PROFILE:
- Location: ${location.city || 'Unknown'}, ${location.state || 'Unknown'}
- Total spent: ₹${bookingHistory.totalSpent.toFixed(2)}
- Average booking price: ₹${bookingHistory.avgPrice.toFixed(2)}

BOOKING HISTORY (last 10):
${bookingHistory.bookings
  .map(
    (b) =>
      `- ${b.serviceTitle} (${b.categoryName}, ₹${b.finalPrice}, ${b.status}, ${new Date(b.createdAt).toLocaleDateString()})`
  )
  .join('\n')}

TOP CATEGORIES:
${bookingHistory.topCategories.map((c) => `- ${c.categoryName} (${c.count} bookings)`).join('\n')}

RECENT SEARCHES:
${searchHistory.length > 0 ? searchHistory.join(', ') : 'No recent searches'}

CANDIDATE SERVICES:
${candidates
  .map(
    (s) =>
      `- ID: ${s.id} | ${s.title} | Category: ${s.categoryName} | Price: ₹${s.basePrice} | Rating: ${s.averageRating} (${s.totalReviews} reviews) | Provider: ${s.providerName}, ${s.providerCity || 'N/A'}`
  )
  .join('\n')}

Recommend the best services for this user. Respond with ONLY the JSON array.`

  const llmResponse = await callLLM(systemPrompt, userPrompt)
  if (!llmResponse) return null

  try {
    // Parse the LLM response — handle potential markdown wrapping
    let jsonStr = llmResponse
    const jsonMatch = llmResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return null

    // Build a lookup map for candidate details
    const candidateMap = new Map<string, Record<string, any>>()
    for (const svc of candidates) {
      candidateMap.set(svc.id, svc)
    }

    // Merge LLM recommendations with service details
    const recommendations: RecommendedService[] = []
    for (const item of parsed) {
      const service = candidateMap.get(item.id)
      if (!service) continue

      recommendations.push(
        toRecommendedService(
          service,
          item.reason || 'Recommended based on your profile',
          item.relevanceScore || 0.5
        )
      )
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10)
  } catch (parseErr: any) {
    logger.error('Recommendations: Failed to parse LLM response', {
      error: parseErr.message,
      response: llmResponse.substring(0, 200),
    })
    return null
  }
}

/**
 * Rule-based fallback: recommend services from categories the user has booked
 * before, popular services in the user's city, recently added services,
 * and highly-rated services.
 */
async function generateRuleBasedRecommendations(
  topCategoryIds: string[],
  excludeServiceIds: string[],
  city: string | null,
  pool: Pool
): Promise<RecommendedService[]> {
  const recommendations: RecommendedService[] = []
  const seenIds = new Set<string>()

  // 1. Services from categories the user has booked before (highest priority)
  if (topCategoryIds.length > 0) {
    const categoryServices = await getServicesByCategories(pool, topCategoryIds, excludeServiceIds, 8)
    for (const svc of categoryServices) {
      if (!seenIds.has(svc.id)) {
        seenIds.add(svc.id)
        recommendations.push(
          toRecommendedService(
            svc,
            'Based on your booking history',
            0.9 - recommendations.length * 0.05
          )
        )
      }
    }
  }

  // 2. Popular services in user's city
  const popular = await getPopularServices(pool, city || undefined, 8)
  for (const svc of popular) {
    if (!seenIds.has(svc.id) && !excludeServiceIds.includes(svc.id)) {
      seenIds.add(svc.id)
      recommendations.push(
        toRecommendedService(
          svc,
          city ? `Popular in ${city}` : 'Popular on BookMyService',
          0.7 - (recommendations.length - seenIds.size + 8) * 0.03
        )
      )
    }
  }

  // 3. Highly rated services
  const highlyRated = await getHighlyRatedServices(pool, 4.5, 6)
  for (const svc of highlyRated) {
    if (!seenIds.has(svc.id) && !excludeServiceIds.includes(svc.id)) {
      seenIds.add(svc.id)
      recommendations.push(
        toRecommendedService(svc, 'Highly rated by users', 0.6 - recommendations.length * 0.02)
      )
    }
  }

  // 4. Recently added services
  const recent = await getRecentlyAddedServices(pool, 6)
  for (const svc of recent) {
    if (!seenIds.has(svc.id) && !excludeServiceIds.includes(svc.id)) {
      seenIds.add(svc.id)
      recommendations.push(
        toRecommendedService(svc, 'New service you might like', 0.5 - recommendations.length * 0.02)
      )
    }
  }

  return recommendations
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10)
}

/**
 * Find services similar to a given service, using LLM for ranking
 * or falling back to category + price matching.
 */
export async function generateSimilarServices(
  serviceId: string,
  pool: Pool
): Promise<RecommendedService[]> {
  // Check cache first
  const cacheKey = RecCacheKeys.similar(serviceId)
  try {
    const cached = await redis.getJson<RecommendedService[]>(cacheKey)
    if (cached && cached.length > 0) return cached
  } catch {
    // cache miss
  }

  try {
    // Get the source service details
    const sourceResult = await pool.query(
      `SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
              s."categoryId", s."providerId",
              sc.name as "categoryName"
       FROM "Service" s
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       WHERE s.id = $1`,
      [serviceId]
    )

    if (!sourceResult.rows[0]) {
      return []
    }

    const source = sourceResult.rows[0]
    const priceRange = parseFloat(source.basePrice) || 0
    const minPrice = priceRange * 0.5
    const maxPrice = priceRange * 2.0

    // Find services in same category with similar pricing
    const similarResult = await pool.query(
      `SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
              s."totalReviews", s."categoryId", s.images,
              sc.name as "categoryName",
              u.name as "providerName", u.city as "providerCity"
       FROM "Service" s
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       LEFT JOIN "User" u ON s."providerId" = u.id
       WHERE s."categoryId" = $1
         AND s.id != $2
         AND s."isActive" = true AND s."isApproved" = true
         AND s."basePrice" BETWEEN $3 AND $4
       ORDER BY s."averageRating" DESC, s."totalReviews" DESC
       LIMIT 20`,
      [source.categoryId, serviceId, minPrice, maxPrice]
    )

    const candidates = similarResult.rows
    if (candidates.length === 0) {
      // Broaden search: same category, any price
      const broadResult = await pool.query(
        `SELECT s.id, s.title, s.description, s."basePrice", s."averageRating",
                s."totalReviews", s."categoryId", s.images,
                sc.name as "categoryName",
                u.name as "providerName", u.city as "providerCity"
         FROM "Service" s
         LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
         LEFT JOIN "User" u ON s."providerId" = u.id
         WHERE s."categoryId" = $1
           AND s.id != $2
           AND s."isActive" = true AND s."isApproved" = true
         ORDER BY s."averageRating" DESC, s."totalReviews" DESC
         LIMIT 20`,
        [source.categoryId, serviceId]
      )
      candidates.push(...broadResult.rows)
    }

    if (candidates.length === 0) {
      return []
    }

    // Try LLM ranking
    const llmRanked = await generateLLMSimilarServices(source, candidates)
    if (llmRanked && llmRanked.length > 0) {
      await redis.setJson(cacheKey, llmRanked, CACHE_TTL).catch(() => {})
      return llmRanked
    }

    // Fallback: sort by rating and price similarity
    const recommendations = candidates
      .map((svc) => {
        const priceDiff = Math.abs(parseFloat(svc.basePrice) - priceRange)
        const priceProximity = 1 - Math.min(priceDiff / priceRange, 1)
        const ratingScore = parseFloat(svc.averageRating) / 5
        const relevanceScore = ratingScore * 0.6 + priceProximity * 0.4

        return toRecommendedService(
          svc,
          `Similar to ${source.title}`,
          Math.round(relevanceScore * 100) / 100
        )
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)

    await redis.setJson(cacheKey, recommendations, CACHE_TTL).catch(() => {})
    return recommendations
  } catch (err: any) {
    logger.error('Recommendations: Failed to generate similar services', {
      serviceId,
      error: err.message,
    })
    return []
  }
}

/**
 * LLM-powered similar service ranking
 */
async function generateLLMSimilarServices(
  source: Record<string, any>,
  candidates: Record<string, any>[]
): Promise<RecommendedService[] | null> {
  const systemPrompt = `You are an AI service matching engine for BookMyService.
Given a source service and a list of candidate similar services, rank them by relevance.
Consider: category match, price similarity, rating quality, and service description overlap.

Respond with ONLY a valid JSON array. Each element should have:
- "id": the candidate service ID
- "reason": a short reason (max 80 chars) why this is similar
- "relevanceScore": 0.0 to 1.0

Return at most 10, sorted by relevanceScore descending.`

  const userPrompt = `SOURCE SERVICE:
- Title: ${source.title}
- Description: ${(source.description || '').substring(0, 200)}
- Category: ${source.categoryName}
- Price: ₹${source.basePrice}
- Rating: ${source.averageRating}

CANDIDATE SIMILAR SERVICES:
${candidates
  .map(
    (s) =>
      `- ID: ${s.id} | ${s.title} | Price: ₹${s.basePrice} | Rating: ${s.averageRating} (${s.totalReviews} reviews) | Provider: ${s.providerName || 'N/A'}`
  )
  .join('\n')}

Rank these by similarity to the source. Respond with ONLY the JSON array.`

  const llmResponse = await callLLM(systemPrompt, userPrompt)
  if (!llmResponse) return null

  try {
    let jsonStr = llmResponse
    const jsonMatch = llmResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) jsonStr = jsonMatch[0]

    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return null

    const candidateMap = new Map<string, Record<string, any>>()
    for (const svc of candidates) {
      candidateMap.set(svc.id, svc)
    }

    return parsed
      .filter((item: any) => candidateMap.has(item.id))
      .map((item: any) => {
        const svc = candidateMap.get(item.id)!
        return toRecommendedService(
          svc,
          item.reason || `Similar to ${source.title}`,
          item.relevanceScore || 0.5
        )
      })
      .sort((a: RecommendedService, b: RecommendedService) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)
  } catch (parseErr: any) {
    logger.error('Recommendations: Failed to parse similar services LLM response', {
      error: parseErr.message,
    })
    return null
  }
}

/**
 * Generate context-aware search suggestions using LLM for natural language
 * understanding, with a rule-based fallback.
 */
export async function generateSearchSuggestions(
  query: string,
  city: string | null,
  pool: Pool
): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 1) {
    return []
  }

  const sanitizedQuery = query.trim().substring(0, 100)

  // Check cache
  const cacheHash = `${sanitizedQuery}:${city || 'all'}`
  const cacheKey = RecCacheKeys.search(cacheHash)
  try {
    const cached = await redis.getJson<SearchSuggestion[]>(cacheKey)
    if (cached && cached.length > 0) return cached
  } catch {
    // cache miss
  }

  try {
    // Try LLM-powered suggestions
    const llmSuggestions = await generateLLMSearchSuggestions(sanitizedQuery, city, pool)
    if (llmSuggestions && llmSuggestions.length > 0) {
      await redis.setJson(cacheKey, llmSuggestions, CACHE_TTL).catch(() => {})
      return llmSuggestions
    }

    // Fallback: database-based suggestions
    const suggestions = await generateRuleBasedSearchSuggestions(sanitizedQuery, city, pool)
    await redis.setJson(cacheKey, suggestions, CACHE_TTL).catch(() => {})
    return suggestions
  } catch (err: any) {
    logger.error('Recommendations: Failed to generate search suggestions', {
      query: sanitizedQuery,
      error: err.message,
    })
    return []
  }
}

/**
 * LLM-powered search suggestions
 */
async function generateLLMSearchSuggestions(
  query: string,
  city: string | null,
  pool: Pool
): Promise<SearchSuggestion[] | null> {
  // Fetch available categories and services for context
  const [categories, popularSearches] = await Promise.all([
    pool
      .query(
        'SELECT name, slug FROM "ServiceCategory" WHERE "isActive" = true ORDER BY name LIMIT 20'
      )
      .catch(() => ({ rows: [] })),
    redis.getPopularSearches(10).catch(() => []),
  ])

  const systemPrompt = `You are an AI search assistant for BookMyService, a service booking platform.
Given a partial search query, suggest relevant completions. Include service names, categories, and natural language queries.

Respond with ONLY a valid JSON array. Each element should have:
- "text": the suggestion text
- "type": one of "service", "category", "query", "trending"
- "confidence": 0.0 to 1.0

Return at most 8 suggestions, sorted by confidence descending.`

  const userPrompt = `PARTIAL QUERY: "${query}"
CITY: ${city || 'Not specified'}

AVAILABLE CATEGORIES:
${categories.rows.map((c: any) => `- ${c.name} (${c.slug})`).join('\n')}

TRENDING SEARCHES:
${popularSearches.join(', ')}

Suggest relevant completions. Respond with ONLY the JSON array.`

  const llmResponse = await callLLM(systemPrompt, userPrompt)
  if (!llmResponse) return null

  try {
    let jsonStr = llmResponse
    const jsonMatch = llmResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) jsonStr = jsonMatch[0]

    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return null

    return parsed
      .filter((item: any) => item.text && item.type)
      .map((item: any) => ({
        text: String(item.text).substring(0, 200),
        type: ['service', 'category', 'query', 'trending'].includes(item.type)
          ? item.type
          : 'query',
        confidence: Math.min(Math.max(parseFloat(item.confidence) || 0.5, 0), 1),
      }))
      .sort((a: SearchSuggestion, b: SearchSuggestion) => b.confidence - a.confidence)
      .slice(0, 8)
  } catch {
    return null
  }
}

/**
 * Rule-based search suggestions: match against categories and services in DB
 */
async function generateRuleBasedSearchSuggestions(
  query: string,
  city: string | null,
  pool: Pool
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = []
  const normalizedQuery = query.toLowerCase()

  // 1. Match categories
  const categoryResult = await pool.query(
    `SELECT name, slug FROM "ServiceCategory"
     WHERE "isActive" = true AND (LOWER(name) LIKE $1 OR LOWER(slug) LIKE $1)
     ORDER BY name LIMIT 5`,
    [`%${normalizedQuery}%`]
  )

  for (const cat of categoryResult.rows) {
    suggestions.push({
      text: cat.name,
      type: 'category',
      confidence: 0.9,
    })
  }

  // 2. Match services
  const serviceResult = await pool.query(
    `SELECT s.title, sc.name as "categoryName"
     FROM "Service" s
     LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
     WHERE s."isActive" = true AND s."isApproved" = true
       AND LOWER(s.title) LIKE $1
     ORDER BY s."averageRating" DESC LIMIT 5`,
    [`%${normalizedQuery}%`]
  )

  for (const svc of serviceResult.rows) {
    suggestions.push({
      text: svc.title,
      type: 'service',
      confidence: 0.8,
    })
  }

  // 3. Popular/trending searches
  const popularSearches = await redis.getPopularSearches(5).catch(() => [])
  for (const term of popularSearches) {
    if (term.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        text: term,
        type: 'trending',
        confidence: 0.6,
      })
    }
  }

  // 4. Generic query suggestions
  if (suggestions.length < 3) {
    suggestions.push({
      text: `${query} services${city ? ` in ${city}` : ''}`,
      type: 'query',
      confidence: 0.5,
    })
  }

  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8)
}

/**
 * Generate personalized booking insights: spending patterns, service frequency,
 * preferred time slots, and cost optimization suggestions.
 */
export async function generateBookingInsights(
  userId: string,
  pool: Pool
): Promise<BookingInsight[]> {
  // Check cache
  const cacheKey = RecCacheKeys.insights(userId)
  try {
    const cached = await redis.getJson<BookingInsight[]>(cacheKey)
    if (cached && cached.length > 0) return cached
  } catch {
    // cache miss
  }

  try {
    // Fetch comprehensive booking data
    const bookingData = await pool.query(
      `SELECT b."finalPrice", b.status, b."scheduledDate", b."createdAt",
             s.title as "serviceName", s."basePrice",
             sc.name as "categoryName"
       FROM "Booking" b
       LEFT JOIN "Service" s ON b."serviceId" = s.id
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       WHERE b."clientId" = $1
       ORDER BY b."createdAt" DESC`,
      [userId]
    )

    const bookings = bookingData.rows

    if (bookings.length === 0) {
      const emptyInsights: BookingInsight[] = [
        {
          type: 'frequency',
          title: 'Get Started',
          description: 'You haven\'t booked any services yet.',
          value: '0 bookings',
          recommendation: 'Browse our services and book your first service to get personalized insights.',
        },
      ]
      await redis.setJson(cacheKey, emptyInsights, CACHE_TTL).catch(() => {})
      return emptyInsights
    }

    // Try LLM insights
    const llmInsights = await generateLLMBookingInsights(bookings)
    if (llmInsights && llmInsights.length > 0) {
      await redis.setJson(cacheKey, llmInsights, CACHE_TTL).catch(() => {})
      return llmInsights
    }

    // Rule-based insights
    const insights = generateRuleBasedInsights(bookings)
    await redis.setJson(cacheKey, insights, CACHE_TTL).catch(() => {})
    return insights
  } catch (err: any) {
    logger.error('Recommendations: Failed to generate booking insights', {
      userId,
      error: err.message,
    })
    return []
  }
}

/**
 * LLM-powered booking insights
 */
async function generateLLMBookingInsights(
  bookings: Record<string, any>[]
): Promise<BookingInsight[] | null> {
  const systemPrompt = `You are a data analyst for BookMyService, a service booking platform.
Analyze the user's booking data and provide personalized insights.

Respond with ONLY a valid JSON array. Each element should have:
- "type": one of "spending", "frequency", "timing", "category", "savings"
- "title": short title (max 50 chars)
- "description": brief description (max 150 chars)
- "value": a key metric (e.g., "₹5,200", "3 bookings/month")
- "recommendation": actionable suggestion (max 200 chars)

Return at most 6 insights.`

  const userPrompt = `BOOKING DATA (${bookings.length} bookings):
${bookings
  .slice(0, 20)
  .map(
    (b) =>
      `- ${b.serviceName || 'Unknown'} | ${b.categoryName || 'Unknown'} | ₹${b.finalPrice} | ${b.status} | Scheduled: ${b.scheduledDate || 'N/A'} | Booked: ${new Date(b.createdAt).toLocaleDateString()}`
  )
  .join('\n')}

Provide personalized insights. Respond with ONLY the JSON array.`

  const llmResponse = await callLLM(systemPrompt, userPrompt)
  if (!llmResponse) return null

  try {
    let jsonStr = llmResponse
    const jsonMatch = llmResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) jsonStr = jsonMatch[0]

    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return null

    return parsed
      .filter((item: any) => item.type && item.title)
      .map((item: any) => ({
        type: ['spending', 'frequency', 'timing', 'category', 'savings'].includes(item.type)
          ? item.type
          : 'spending',
        title: String(item.title).substring(0, 50),
        description: String(item.description || '').substring(0, 150),
        value: String(item.value || ''),
        recommendation: String(item.recommendation || '').substring(0, 200),
      }))
      .slice(0, 6)
  } catch {
    return null
  }
}

/**
 * Rule-based booking insights
 */
function generateRuleBasedInsights(bookings: Record<string, any>[]): BookingInsight[] {
  const insights: BookingInsight[] = []
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED')
  const totalSpent = completedBookings.reduce((sum, b) => sum + (parseFloat(b.finalPrice) || 0), 0)

  // Spending insight
  if (completedBookings.length > 0) {
    const avgSpend = totalSpent / completedBookings.length
    insights.push({
      type: 'spending',
      title: 'Spending Overview',
      description: `You've spent ₹${totalSpent.toFixed(0)} across ${completedBookings.length} completed bookings.`,
      value: `₹${avgSpend.toFixed(0)}/booking`,
      recommendation:
        avgSpend > 2000
          ? 'Consider checking our budget-friendly options to save on future bookings.'
          : 'You\'re spending efficiently. Look out for deals to save even more!',
    })
  }

  // Frequency insight
  if (bookings.length >= 2) {
    const firstBooking = new Date(bookings[bookings.length - 1].createdAt)
    const lastBooking = new Date(bookings[0].createdAt)
    const daysDiff = Math.max(
      (lastBooking.getTime() - firstBooking.getTime()) / (1000 * 60 * 60 * 24),
      1
    )
    const bookingsPerMonth = (bookings.length / daysDiff) * 30

    insights.push({
      type: 'frequency',
      title: 'Booking Frequency',
      description: `You book approximately ${bookingsPerMonth.toFixed(1)} services per month.`,
      value: `${bookingsPerMonth.toFixed(1)}/month`,
      recommendation:
        bookingsPerMonth > 4
          ? 'You\'re a frequent user! Check for loyalty discounts or subscription plans.'
          : 'Book regularly to maintain your services and catch early issues.',
    })
  }

  // Category insight
  const catCounts = new Map<string, number>()
  for (const b of bookings) {
    const cat = b.categoryName || 'Other'
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1)
  }
  const topCat = [...catCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topCat) {
    insights.push({
      type: 'category',
      title: 'Top Category',
      description: `${topCat[0]} is your most booked category with ${topCat[1]} bookings.`,
      value: `${topCat[1]} bookings`,
      recommendation: `Explore other ${topCat[0]} providers for better prices or try related categories.`,
    })
  }

  // Timing insight
  const monthCounts = new Map<string, number>()
  for (const b of bookings) {
    const month = new Date(b.createdAt).toLocaleString('default', { month: 'long' })
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
  }
  const topMonth = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topMonth) {
    insights.push({
      type: 'timing',
      title: 'Booking Pattern',
      description: `You tend to book the most services in ${topMonth[0]} (${topMonth[1]} bookings).`,
      value: `Peak: ${topMonth[0]}`,
      recommendation: 'Book services before peak months to avoid higher demand and prices.',
    })
  }

  // Savings insight
  const pendingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
  )
  if (pendingBookings.length > 0) {
    const pendingAmount = pendingBookings.reduce(
      (sum, b) => sum + (parseFloat(b.finalPrice) || 0),
      0
    )
    insights.push({
      type: 'savings',
      title: 'Active Bookings',
      description: `You have ${pendingBookings.length} active bookings worth ₹${pendingAmount.toFixed(0)}.`,
      value: `₹${pendingAmount.toFixed(0)}`,
      recommendation: 'Track your active bookings for timely completion and potential savings.',
    })
  }

  return insights.slice(0, 6)
}

/**
 * Get trending services — services with high booking volume in the recent period
 */
export async function generateTrendingServices(
  pool: Pool,
  city?: string,
  limit: number = 10
): Promise<TrendingService[]> {
  // Check cache
  const cacheKey = RecCacheKeys.trending(city || 'all')
  try {
    const cached = await redis.getJson<TrendingService[]>(cacheKey)
    if (cached && cached.length > 0) return cached
  } catch {
    // cache miss
  }

  try {
    // Services with most bookings in the last 30 days
    let query = `
      SELECT s.id, s.title, sc.name as "categoryName",
             COUNT(b.id) as "bookingCount",
             COUNT(CASE WHEN b."createdAt" > NOW() - INTERVAL '7 days' THEN 1 END) as "recentCount",
             COUNT(CASE WHEN b."createdAt" BETWEEN NOW() - INTERVAL '30 days' AND NOW() - INTERVAL '7 days' THEN 1 END) as "prevCount"
      FROM "Service" s
      LEFT JOIN "Booking" b ON b."serviceId" = s.id AND b."createdAt" > NOW() - INTERVAL '30 days'
      LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
      LEFT JOIN "User" u ON s."providerId" = u.id
      WHERE s."isActive" = true AND s."isApproved" = true
    `
    const values: any[] = []
    let paramIdx = 1

    if (city) {
      query += ` AND u.city ILIKE $${paramIdx}`
      values.push(`%${city}%`)
      paramIdx++
    }

    query += `
      GROUP BY s.id, sc.name
      HAVING COUNT(b.id) > 0
      ORDER BY "bookingCount" DESC, "recentCount" DESC
      LIMIT $${paramIdx}
    `
    values.push(limit)

    const result = await pool.query(query, values)

    const trending: TrendingService[] = result.rows.map((row) => {
      const recentCount = parseInt(row.recentCount) || 0
      const prevCount = parseInt(row.prevCount) || 0
      const growthRate = prevCount > 0 ? ((recentCount - prevCount) / prevCount) * 100 : recentCount > 0 ? 100 : 0

      return {
        id: row.id,
        title: row.title,
        categoryName: row.categoryName || 'Unknown',
        bookingCount: parseInt(row.bookingCount) || 0,
        growthRate: Math.round(growthRate),
      }
    })

    await redis.setJson(cacheKey, trending, CACHE_TTL).catch(() => {})
    return trending
  } catch (err: any) {
    logger.error('Recommendations: Failed to generate trending services', {
      city: city || 'all',
      error: err.message,
    })
    return []
  }
}

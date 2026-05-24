import { Hono } from 'hono'
import { query } from '../../shared/db.ts'

const app = new Hono()

// Map URL type param (uppercase from frontend) to database pageType values
const TYPE_MAP: Record<string, string> = {
  // Uppercase frontend types
  'TERMS': 'TERMS',
  'PRIVACY': 'PRIVACY',
  'REFUND': 'REFUND',
  'COOKIES': 'COOKIES',
  'AUP': 'AUP',
  'PROVIDER_AGREEMENT': 'PROVIDER_AGREEMENT',
  'COMMUNITY_GUIDELINES': 'COMMUNITY_GUIDELINES',
  // Hyphenated variants (frontend may send these)
  'REFUND-POLICY': 'REFUND',
  'COOKIE-POLICY': 'COOKIES',
  'PROVIDER-AGREEMENT': 'PROVIDER_AGREEMENT',
  'COMMUNITY-GUIDELINES': 'COMMUNITY_GUIDELINES',
  // Lowercase variants for compatibility
  'terms': 'TERMS',
  'privacy': 'PRIVACY',
  'refund-policy': 'REFUND',
  'cookies': 'COOKIES',
  'aup': 'AUP',
  'provider-agreement': 'PROVIDER_AGREEMENT',
  'community-guidelines': 'COMMUNITY_GUIDELINES',
}

// GET /api/legal - List all legal documents
app.get('/', async (c) => {
  try {
    const result = await query<{
      id: number
      pageType: string
      title: string
      version: string | null
      effectiveDate: string | null
      updatedAt: string
    }>(
      'SELECT id, "pageType", title, version, "effectiveDate", "updatedAt" FROM "LegalPage" ORDER BY id ASC'
    )

    return c.json({
      documents: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error('Get legal documents error:', error)
    return c.json({ error: 'Failed to fetch legal documents' }, 500)
  }
})

// GET /api/legal/:type - Get specific legal document by type
app.get('/:type', async (c) => {
  try {
    const typeParam = c.req.param('type')

    // Map the URL-friendly type to the database pageType
    const pageType = TYPE_MAP[typeParam] || typeParam.toUpperCase()

    const result = await query<{
      id: number
      pageType: string
      title: string
      content: string
      version: string | null
      effectiveDate: string | null
      createdAt: string
      updatedAt: string
    }>(
      'SELECT * FROM "LegalPage" WHERE "pageType" = $1',
      [pageType]
    )

    const document = result.rows[0]

    if (!document) {
      return c.json({ error: `Legal document '${typeParam}' not found` }, 404)
    }

    return c.json(document)
  } catch (error) {
    console.error('Get legal document error:', error)
    return c.json({ error: 'Failed to fetch legal document' }, 500)
  }
})

export default app

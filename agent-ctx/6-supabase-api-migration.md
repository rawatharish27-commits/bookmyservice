# Task 6 - Rewrite Cloudflare Pages Functions from D1 to Supabase REST API

## Summary
Rewrote all 16 Cloudflare Pages Functions to use the new Supabase REST API client (`createSupabaseClient` / `QueryBuilder`) instead of the old D1 database helpers (`query`, `queryOne`, `execute`).

## Files Modified (16 total)

1. `functions/api/reviews/index.ts` - GET (PostgREST joins for reviewer/service + client-side avg) + POST (insert review, recalc avg, notify provider)
2. `functions/api/reviews/[id].ts` - GET single review with PostgREST joins
3. `functions/api/disputes/index.ts` - GET list with booking/service joins + POST create dispute
4. `functions/api/disputes/[disputeId].ts` - GET with messages join + PATCH add message
5. `functions/api/contact/index.ts` - POST insert ContactMessage
6. `functions/api/faq/index.ts` - GET with isActive=true filter
7. `functions/api/favorites/index.ts` - GET with service/category/provider joins + POST add
8. `functions/api/favorites/[serviceId].ts` - DELETE remove favorite
9. `functions/api/kyc/submit.ts` - POST insert/update ProviderKyc
10. `functions/api/kyc/status.ts` - GET ProviderKyc status
11. `functions/api/legal/index.ts` - GET all LegalPage
12. `functions/api/legal/[type].ts` - GET single LegalPage by pageType
13. `functions/api/notifications/index.ts` - GET with count + unread filter
14. `functions/api/notifications/[id]/read.ts` - POST mark as read
15. `functions/api/stats/visitor.ts` - POST upsert visitor + update PlatformStats
16. `functions/api/stats/platform.ts` - GET platform counts

## Key Conversions Applied

| D1 Pattern | Supabase Pattern |
|---|---|
| `query(DB, sql, params)` | `supabase.from('Table').select('*')` |
| `queryOne(DB, sql, params)` | `.maybeSingle()` |
| `execute(DB, sql, params)` | `.insert()` / `.update()` / `.delete()` |
| `{ DB: D1Database }` | `Env` (SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET) |
| `datetime('now')` | `new Date().toISOString()` |
| `1` / `0` for booleans | `true` / `false` |
| `isRead = 1` | `isRead = true` |
| SQL JOINs | PostgREST relation syntax: `reviewer:User!Fkey(name)` |
| `SELECT COUNT(*)` | `{ count: 'exact', head: true }` or `{ count: 'exact' }` |
| SQL `IN (...)` | `.in('column', [values])` |
| SQL `>=` | `.gte('column', value)` |
| SQL `!=` | `.neq('column', value)` |
| Subquery in UPDATE | Client-side fetch + separate update |
| `AVG(rating)` | Fetch all ratings, calculate in JS |

## No TODOs or Placeholders
All 16 files contain complete, production-ready code.

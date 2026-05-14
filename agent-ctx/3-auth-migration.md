# Task 3: Rewrite auth Cloudflare Pages Functions to Supabase REST API

## Summary
Migrated all 4 auth-related Cloudflare Pages Functions from D1 raw SQL queries to the new Supabase REST API (PostgREST) client.

## Files Modified
1. `/functions/api/auth/login.ts` - Login endpoint
2. `/functions/api/auth/register.ts` - Registration endpoint
3. `/functions/api/auth/profile.ts` - Profile GET and PATCH endpoints
4. `/functions/api/auth/change-password.ts` - Password change endpoint

## Key Changes Per File

### login.ts
- Import: `createSupabaseClient, Env` (was `queryOne, execute`)
- Env type: `Env` (was `{ DB: D1Database; JWT_SECRET: string }`)
- User lookup: `supabase.from('User').select('*, Role(name)').ilike('email', email).maybeSingle()`
- Last login update: `supabase.from('User').update({ lastLoginAt, updatedAt }).eq('id', userId)`
- PostgREST join flattening: `{ Role: { name } }` → `role: Role.name`

### register.ts
- Email uniqueness: `supabase.from('User').select('id').ilike('email', email).maybeSingle()`
- Phone uniqueness: `supabase.from('User').select('id').eq('phone', phone).maybeSingle()`
- User insert: `supabase.from('User').insert({...}).select().single()`
- KYC insert: `supabase.from('ProviderKyc').insert({...})`
- PostgreSQL booleans: `false` instead of `0` for emailVerified/phoneVerified

### profile.ts
- GET profile: `supabase.from('User').select('*, Role(name)').eq('id', userId).maybeSingle()`
- KYC fetch: `supabase.from('ProviderKyc').select('verificationStatus').eq('providerId', userId).maybeSingle()`
- PATCH: Dynamic update object instead of dynamic SQL
- Phone uniqueness: `.eq('phone', phone).neq('id', userId).maybeSingle()`
- Profile update: `supabase.from('User').update(updateData).eq('id', userId)`

### change-password.ts
- Hash fetch: `supabase.from('User').select('passwordHash').eq('id', userId).maybeSingle()`
- Password update: `supabase.from('User').update({ passwordHash, updatedAt }).eq('id', userId)`

## PostgreSQL Differences Handled
- Boolean fields: `true`/`false` instead of `1`/`0`
- Timestamps: `new Date().toISOString()` instead of `datetime('now')`
- Case-insensitive text: `.ilike()` for email matching instead of `eq`
- PostgREST joins: `select('*, Role(name)')` returns nested objects `{ Role: { name } }`

## Status
Complete - all 4 files rewritten with no TODOs or placeholders.

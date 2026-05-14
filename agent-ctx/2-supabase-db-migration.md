# Task 2: Rewrite db.ts for Supabase REST API + bcrypt support in password.ts

## What was done

### 1. `/functions/_shared/db.ts` — Complete rewrite

**Before:** D1 database helpers (`query`, `queryOne`, `execute`, `batch`) using `D1Database` binding with raw SQL.

**After:** Full Supabase REST API (PostgREST) client using only `fetch()` over HTTP.

#### Exports:
- **`Env`** interface: `{ SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET }`
- **`SupabaseClient`** class:
  - `constructor(url, serviceKey)` — uses `service_role` key (bypasses RLS)
  - `.from<T>(table)` → returns `QueryBuilder<T>`
  - `.rpc<T>(functionName, params?)` → calls PostgreSQL functions
  - `.url` getter for the Supabase project URL
- **`QueryBuilder<T>`** class (chainable + thenable):
  - **Select**: `.select(columns?, options?)` with optional `{ count: 'exact' }`
  - **Filters**: `.eq`, `.neq`, `.gt`, `.gte`, `.lt`, `.lte`, `.like`, `.ilike`, `.in`, `.is`
  - **Ordering**: `.order(column, { ascending?, nullsFirst? })`
  - **Pagination**: `.limit(count)`, `.range(from, to)`
  - **Single row**: `.single()`, `.maybeSingle()` (graceful PGRST116 handling)
  - **Mutations**: `.insert(data)`, `.update(data)`, `.delete()`, `.upsert(data)`
  - **Thenable**: implements `.then()`, `.catch()`, `.finally()` — can be `await`ed directly
- **`createSupabaseClient(env)`** — factory helper
- **`PostgrestError`** interface
- **`QueryResult<T>`** interface: `{ data, error, count }`

#### Key design decisions:
- Only Web APIs used: `fetch`, `Headers`, `URLSearchParams`, `URL`, `crypto` — no Node.js deps
- `Prefer: return=representation` header on mutations to return inserted/updated data
- `Prefer: count=exact` support via `.select('*', { count: 'exact' })` — parses `content-range` header
- `Accept: application/vnd.pgrst.object+json` for single/maybeSingle results
- maybeSingle gracefully handles PGRST116 error (0 rows) returning `{ data: null, error: null }`
- Multiple `Prefer` directives comma-separated via `_appendPrefer()` helper

### 2. `/functions/_shared/password.ts` — Added bcrypt support

**Before:** Only PBKDF2-SHA512 hash format (`$pbkdf2-sha512$...`).

**After:** Auto-detects hash format and routes to correct verifier.

- **`hashPassword(password)`** — still produces PBKDF2 hashes (backward compatible)
- **`verifyPassword(password, storedHash)`** — now detects format:
  - `$pbkdf2-sha512$...` → PBKDF2 verification (WebCrypto)
  - `$2a$...` / `$2b$...` / `$2y$...` → bcrypt verification (`bcryptjs.compareSync`)
- Uses `bcryptjs` package (already in `package.json`) — pure JS, Workers-compatible

### Files modified:
- `/functions/_shared/db.ts` — complete rewrite
- `/functions/_shared/password.ts` — added bcrypt path to verifyPassword

### Note for subsequent tasks:
The ~40 function files that import `{ query, queryOne, execute }` from `../../_shared/db` will need to be updated to use the new `SupabaseClient` / `QueryBuilder` API. The old exports no longer exist.

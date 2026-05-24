// ─── Database Index Migration Script ───────────────────────────────────
// Creates performance indexes for frequently queried columns.
// Run once (or on startup) — uses IF NOT EXISTS so it's safe to re-run.
//
// Indexes target the most common query patterns:
//   - Users: login by email, lookup by roleId
//   - Bookings: dashboard queries by clientId, providerId, status, createdAt
//   - Services: category filtering, active+approved status
//   - Reviews: service listing with reviews

export const DB_INDEXES = `
-- ─── Users Table ─────────────────────────────────────────────────────
-- Login lookup (most frequent query in the entire app)
CREATE INDEX IF NOT EXISTS idx_users_email ON "User" (email);

-- Role-based filtering (admin dashboards, provider lists)
CREATE INDEX IF NOT EXISTS idx_users_roleId ON "User" ("roleId");

-- Active status filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON "User" (status);

-- ─── Booking Table ───────────────────────────────────────────────────
-- Client's booking list (dashboard "My Bookings")
CREATE INDEX IF NOT EXISTS idx_bookings_clientId ON "Booking" ("clientId");

-- Provider's booking list (dashboard "Incoming Jobs")
CREATE INDEX IF NOT EXISTS idx_bookings_providerId ON "Booking" ("providerId");

-- Technician's booking list
CREATE INDEX IF NOT EXISTS idx_bookings_technicianId ON "Booking" ("technicianId");

-- Dashboard sorting + date range filters
CREATE INDEX IF NOT EXISTS idx_bookings_createdAt ON "Booking" ("createdAt" DESC);

-- Status filtering (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON "Booking" (status);

-- Scheduled date lookups (upcoming bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_scheduledDate ON "Booking" ("scheduledDate");

-- ─── Service Table ──────────────────────────────────────────────────
-- Category filtering (browse by category)
CREATE INDEX IF NOT EXISTS idx_services_categoryId ON "Service" ("categoryId");

-- Provider's service list
CREATE INDEX IF NOT EXISTS idx_services_providerId ON "Service" ("providerId");

-- Active + approved composite (homepage listing)
CREATE INDEX IF NOT EXISTS idx_services_active_approved ON "Service" ("isActive", "isApproved");

-- ─── Review Table ───────────────────────────────────────────────────
-- Service reviews (shown on service detail page)
CREATE INDEX IF NOT EXISTS idx_reviews_serviceId ON "Review" ("serviceId");

-- ─── ProviderKyc Table ─────────────────────────────────────────────
-- KYC lookup by provider
CREATE INDEX IF NOT EXISTS idx_kyc_providerId ON "ProviderKyc" ("providerId");

-- ─── ServiceCategory Table ──────────────────────────────────────────
-- Active categories ordered by display
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON "ServiceCategory" ("isActive", "displayOrder");
`

/**
 * Apply database indexes to improve query performance.
 * Safe to call multiple times — uses IF NOT EXISTS.
 * Non-fatal — errors are logged but don't crash the server.
 */
export async function applyDatabaseIndexes(pool: any): Promise<void> {
  console.log('🗄️  Applying database indexes...')
  const statements = DB_INDEXES
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('CREATE INDEX'))

  let applied = 0
  let skipped = 0
  let failed = 0

  for (const stmt of statements) {
    try {
      await pool.query(stmt)
      applied++
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        skipped++
      } else {
        failed++
        console.warn(`🗄️  Index creation failed: ${err.message}`)
      }
    }
  }

  console.log(`🗄️  Indexes: ${applied} applied, ${skipped} existing, ${failed} failed`)
}

// ─── PostGIS Geospatial Helpers ─────────────────────────────────────────
// Enables 20km radius provider search using ST_DWithin on geography columns.
// All operations are non-fatal — if PostGIS is not available the app falls
// back to the Haversine bounding-box approach in the nearby route.
//
// Key gotcha: ST_MakePoint takes (longitude, latitude) — NOT (lat, lng)!

import { Pool } from 'pg'

// ─── Extension & Column Setup ───────────────────────────────────────────

/**
 * Enable the PostGIS extension on the database.
 * Requires superuser privileges — Supabase allows this.
 * Non-fatal: logs a warning if it fails (e.g. no superuser access).
 */
export async function enablePostGIS(pool: Pool): Promise<void> {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;')
    console.log('✅ PostGIS extension enabled')
  } catch (err: any) {
    console.warn('⚠️  PostGIS extension could not be enabled (non-fatal):', err.message)
    throw err // re-throw so caller knows it failed
  }
}

/**
 * Add `location GEOGRAPHY(POINT, 4326)` column to "User" table if missing.
 * Also adds individual `latitude` and `longitude` columns if they don't exist
 * (for backwards compatibility with flat-column queries).
 * Non-fatal.
 */
export async function addLocationColumn(pool: Pool): Promise<void> {
  // Add latitude column if missing
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;')
  } catch (err: any) {
    if (!err.message?.includes('already exists')) {
      console.warn('⚠️  Could not add latitude column (non-fatal):', err.message)
    }
  }

  // Add longitude column if missing
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;')
  } catch (err: any) {
    if (!err.message?.includes('already exists')) {
      console.warn('⚠️  Could not add longitude column (non-fatal):', err.message)
    }
  }

  // Add location geography column if missing
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);')
  } catch (err: any) {
    if (!err.message?.includes('already exists')) {
      console.warn('⚠️  Could not add location column (non-fatal):', err.message)
    }
  }
}

/**
 * For existing rows that have latitude/longitude but NULL location,
 * populate the location column from the flat columns.
 * Note: ST_MakePoint takes (longitude, latitude)!
 */
export async function migrateLatLngToPostGIS(pool: Pool): Promise<void> {
  try {
    const result = await pool.query(`
      UPDATE "User"
      SET location = ST_MakePoint(longitude, latitude)::geography
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND location IS NULL;
    `)
    if (result.rowCount && result.rowCount > 0) {
      console.log(`✅ Migrated ${result.rowCount} user location(s) to PostGIS`)
    } else {
      console.log('ℹ️  No user locations needed migration to PostGIS')
    }
  } catch (err: any) {
    console.warn('⚠️  PostGIS location migration failed (non-fatal):', err.message)
    throw err
  }
}

/**
 * Create a GiST spatial index on the location column for fast geospatial lookups.
 */
export async function addSpatialIndex(pool: Pool): Promise<void> {
  try {
    await pool.query(
      'CREATE INDEX IF NOT EXISTS idx_users_location ON "User" USING GIST (location);'
    )
    console.log('✅ PostGIS spatial index ensured')
  } catch (err: any) {
    console.warn('⚠️  Spatial index creation failed (non-fatal):', err.message)
    throw err
  }
}

/**
 * Master setup function — runs all PostGIS initialisation steps in sequence.
 * Called once at server startup.
 */
export async function setupPostGIS(pool: Pool): Promise<void> {
  console.log('🗺️  Setting up PostGIS...')
  await enablePostGIS(pool)
  await addLocationColumn(pool)
  await migrateLatLngToPostGIS(pool)
  await addSpatialIndex(pool)
  console.log('🗺️  PostGIS setup complete')
}

// ─── Availability Check ─────────────────────────────────────────────────

/**
 * Check whether PostGIS is available in the current database.
 * Returns true if PostGIS extension is installed and working.
 */
export async function isPostGISAvailable(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query('SELECT PostGIS_Version();')
    return result.rows.length > 0 && !!result.rows[0].postgis_version
  } catch {
    return false
  }
}

// ─── Nearby Provider Search ─────────────────────────────────────────────

interface NearbyProvidersParams {
  lat: number
  lng: number
  radiusMeters: number
  categoryId?: number
  limit?: number
  offset?: number
}

/**
 * Find nearby providers using PostGIS ST_DWithin on the geography column.
 * This is the core spatial query — much faster and more accurate than
 * Haversine bounding-box for large datasets.
 *
 * IMPORTANT: ST_MakePoint takes (longitude, latitude), not (lat, lng)!
 * ST_DWithin on geography type uses meters for distance.
 */
export async function findNearbyProvidersPostGIS(
  pool: Pool,
  params: NearbyProvidersParams
): Promise<any[]> {
  const { lat, lng, radiusMeters, categoryId, limit, offset } = params

  let query = `
    SELECT
      u.id, u.name, u."profileImageUrl", u.city, u.state, u.pincode,
      u."isVerified", u."averageRating", u."completedJobsCount", u."verifiedBadge",
      u.latitude, u.longitude,
      ST_Distance(u.location, ST_MakePoint($2, $1)::geography) as distance,
      s.id as "serviceId", s.title as "serviceName", s."categoryId"
    FROM "User" u
    LEFT JOIN "Service" s ON s."providerId" = u.id AND s."isActive" = true AND s."isApproved" = true
    WHERE u."roleId" = 2 AND u.status = 'ACTIVE'
      AND ST_DWithin(
        u.location,
        ST_MakePoint($2, $1)::geography,
        $3
      )
  `

  const queryParams: any[] = [lat, lng, radiusMeters]
  let paramIdx = 4

  if (categoryId) {
    query += ` AND s."categoryId" = $${paramIdx}`
    queryParams.push(categoryId)
    paramIdx++
  }

  query += ' ORDER BY distance'

  if (limit) {
    query += ` LIMIT $${paramIdx}`
    queryParams.push(limit)
    paramIdx++
  }

  if (offset) {
    query += ` OFFSET $${paramIdx}`
    queryParams.push(offset)
    paramIdx++
  }

  const result = await pool.query(query, queryParams)
  return result.rows
}

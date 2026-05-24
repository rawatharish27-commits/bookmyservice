/**
 * ─── Tracking Service — Database Layer ─────────────────────────────────
 *
 * PostgreSQL pool setup, table creation, and persistence helpers.
 * Gracefully degrades when DATABASE_URL is not set — WebSocket still works.
 */

import { Pool } from 'pg'

// ─── PostgreSQL Pool ──────────────────────────────────────────────────
let pool: Pool | null = null
let dbAvailable = false

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  pool.on('error', (err) => {
    console.error('🔴 Idle pool client error:', err.message)
  })

  // Test connection and create tables
  pool.query('SELECT 1 as ok')
    .then(async () => {
      console.log('✅ Database connected successfully')
      dbAvailable = true
      await createTrackingTables()
    })
    .catch((err) => {
      console.warn('⚠️  Database connection failed (non-fatal — WebSocket will still work):', err.message)
      dbAvailable = false
    })
} else {
  console.warn('⚠️  DATABASE_URL not set — running without DB persistence (WebSocket only)')
}

// ─── Table Creation ───────────────────────────────────────────────────

/** Auto-create tracking tables on startup */
export async function createTrackingTables(): Promise<void> {
  if (!pool) return

  try {
    // LiveTechnicianLocation — stores the most recent GPS position per provider/technician
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "LiveTechnicianLocation" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        speed DOUBLE PRECISION,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_live_tech_loc_userId ON "LiveTechnicianLocation" ("userId");')
      .catch(() => {}) // index may already exist

    // BookingTracking — stores location history for a specific booking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "BookingTracking" (
        id TEXT PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        speed DOUBLE PRECISION,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_tracking_bookingId ON "BookingTracking" ("bookingId");')
      .catch(() => {})
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_tracking_createdAt ON "BookingTracking" ("createdAt" DESC);')
      .catch(() => {})

    // BookingTimeline — stores status change events per booking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "BookingTimeline" (
        id TEXT PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        status TEXT NOT NULL,
        "changedBy" TEXT NOT NULL,
        note TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_timeline_bookingId ON "BookingTimeline" ("bookingId");')
      .catch(() => {})
    await pool.query('CREATE INDEX IF NOT EXISTS idx_booking_timeline_createdAt ON "BookingTimeline" ("createdAt" DESC);')
      .catch(() => {})

    console.log('✅ Tracking tables ensured (LiveTechnicianLocation, BookingTracking, BookingTimeline)')
  } catch (err: any) {
    console.error('⚠️  Tracking table creation error (non-fatal):', err.message)
  }
}

// ─── Persistence Helpers ──────────────────────────────────────────────

/** Update LiveTechnicianLocation with latest GPS data */
export async function persistLocationUpdate(
  userId: string,
  lat: number,
  lng: number,
  accuracy?: number,
  heading?: number,
  speed?: number,
): Promise<void> {
  if (!pool || !dbAvailable) return
  try {
    const id = 'loc_' + userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    await pool.query(`
      INSERT INTO "LiveTechnicianLocation" (id, "userId", latitude, longitude, accuracy, heading, speed, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        accuracy = EXCLUDED.accuracy,
        heading = EXCLUDED.heading,
        speed = EXCLUDED.speed,
        "updatedAt" = NOW()
    `, [id, userId, lat, lng, accuracy ?? null, heading ?? null, speed ?? null])
  } catch (err: any) {
    console.error('⚠️  Failed to persist LiveTechnicianLocation:', err.message)
  }
}

/** Insert a location history point for a booking */
export async function persistBookingTracking(
  bookingId: string,
  providerId: string,
  lat: number,
  lng: number,
  accuracy?: number,
  heading?: number,
  speed?: number,
): Promise<void> {
  if (!pool || !dbAvailable) return
  try {
    const id = 'bt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(`
      INSERT INTO "BookingTracking" (id, "bookingId", "providerId", latitude, longitude, accuracy, heading, speed, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [id, bookingId, providerId, lat, lng, accuracy ?? null, heading ?? null, speed ?? null])
  } catch (err: any) {
    console.error('⚠️  Failed to persist BookingTracking:', err.message)
  }
}

/** Insert a timeline event and update Booking status */
export async function persistStatusChange(
  bookingId: string,
  status: string,
  changedBy: string,
  note?: string,
): Promise<void> {
  if (!pool || !dbAvailable) return
  try {
    // Insert timeline event
    const timelineId = 'tl_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(`
      INSERT INTO "BookingTimeline" (id, "bookingId", status, "changedBy", note, "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [timelineId, bookingId, status, changedBy, note ?? null])

    // Update Booking table status
    const updates = ['status = $1', '"updatedAt" = NOW()']
    const values: any[] = [status]
    let idx = 2

    if (status === 'COMPLETED') {
      updates.push('"completedAt" = NOW()')
    }
    if (status === 'CANCELLED') {
      updates.push('"cancelledAt" = NOW()')
    }

    values.push(bookingId)
    await pool.query(`UPDATE "Booking" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  } catch (err: any) {
    console.error('⚠️  Failed to persist status change:', err.message)
  }
}

/** Verify that a user is part of a booking (client, provider, or technician) */
export async function verifyBookingAccess(userId: string, bookingId: string): Promise<boolean> {
  if (!pool || !dbAvailable) return true // If no DB, allow access (graceful degradation)
  try {
    const result = await pool.query(
      'SELECT "clientId", "providerId", "technicianId" FROM "Booking" WHERE id = $1',
      [bookingId]
    )
    if (result.rows.length === 0) return false
    const booking = result.rows[0]
    return (
      booking.clientId === userId ||
      booking.providerId === userId ||
      booking.technicianId === userId
    )
  } catch (err: any) {
    console.error('⚠️  Failed to verify booking access:', err.message)
    return true // Graceful degradation — allow on DB error
  }
}

/** Close the database pool (for graceful shutdown) */
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end()
      console.log('✅ Database pool closed')
    } catch (err: any) {
      console.error('⚠️  Error closing database pool:', err.message)
    }
  }
}

/** Check if the database is available */
export function isDbAvailable(): boolean {
  return dbAvailable
}

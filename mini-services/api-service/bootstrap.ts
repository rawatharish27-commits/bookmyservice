import { Pool } from 'pg'
import { pool, JWT_SECRET } from './lib/shared'
import { applyDatabaseIndexes } from './lib/db-indexes'
import { setupPostGIS } from './lib/postgis'
import { initSentry, captureApiError, captureDbError, startMemoryMonitoring, stopMemoryMonitoring } from './lib/sentry'
import { initializeQueues, startWorkers, shutdownQueues } from './queues'
import { setNotificationWorkerPool } from './workers/notification-worker'
import { initBackupSystem, cleanupOldBackups, stopBackupScheduler } from './lib/backup'
import { logger } from './lib/logger'
import { validateEnv } from './lib/env'
import { shutdownManager } from './lib/scaling'

export async function bootstrap(): Promise<void> {
  // 0. Validate environment variables
  const envResult = validateEnv()
  if (!envResult.valid) {
    console.error('❌ Environment validation failed:')
    envResult.errors.forEach(e => console.error(`  - ${e}`))
    // Don't exit — log and continue (dev-friendly)
  }
  if (envResult.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    envResult.warnings.forEach(w => console.warn(`  - ${w}`))
  }
  if (envResult.valid && envResult.warnings.length === 0) {
    console.log('✅ Environment validation passed')
  }

  // 1. Initialize Sentry
  initSentry()
  startMemoryMonitoring()

  // 2. Process crash protection
  process.on('uncaughtException', (err: any) => {
    // Suppress ioredis EPIPE/ECONNRESET — these are non-fatal and auto-recovered
    if (err.code === 'EPIPE' || err.code === 'ECONNRESET') return
    logger.error('Uncaught Exception (non-fatal)', { error: err.message, stack: err.stack })
    captureApiError(err, { method: 'process', path: 'uncaughtException' })
  })
  process.on('unhandledRejection', (reason: any) => {
    // Suppress ioredis EPIPE/ECONNRESET rejections
    if (reason?.code === 'EPIPE' || reason?.code === 'ECONNRESET') return
    logger.error('Unhandled Rejection (non-fatal)', { reason: String(reason) })
    captureApiError(reason instanceof Error ? reason : new Error(String(reason)), { method: 'process', path: 'unhandledRejection' })
  })

  // 3. Pass pool to notification worker
  setNotificationWorkerPool(pool)

  // 4. Verify database connection + run migrations
  try {
    await pool.query('SELECT 1 as ok')
    console.log('✅ Database connected successfully')
    
    // Seed Role table if empty
    try {
      // First, ensure 'PROVIDER' exists in the UserRole enum (PostgreSQL)
      // Prisma creates this enum without PROVIDER, but our app uses it
      try {
        await pool.query(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PROVIDER'`)
      } catch (enumErr: any) {
        // "already exists" is fine, other errors are non-fatal
        if (!enumErr.message?.includes('already exists')) {
          console.warn('⚠️  UserRole enum update (non-fatal):', enumErr.message)
        }
      }
      
      const roleCount = await pool.query('SELECT COUNT(*) as count FROM "Role"')
      if (parseInt(roleCount.rows[0].count) === 0) {
        console.log('🔧 Seeding Role table...')
        await pool.query(`
          INSERT INTO "Role" (id, name, description, "createdAt") VALUES
          (1, 'CLIENT', 'Customer who books services', NOW()),
          (2, 'PROVIDER', 'Service provider', NOW()),
          (3, 'ADMIN', 'Platform administrator', NOW()),
          (4, 'TECHNICIAN', 'Field technician', NOW()),
          (5, 'VENDOR', 'Vendor/supplier', NOW()),
          (6, 'FRANCHISE', 'Franchise owner', NOW()),
          (7, 'SUB_ADMIN', 'Sub administrator', NOW()),
          (8, 'AREA_MANAGER', 'Area manager', NOW()),
          (9, 'MANAGER', 'Manager', NOW()),
          (10, 'LOCAL_ADMIN', 'Local administrator', NOW())
          ON CONFLICT (id) DO NOTHING
        `)
        await pool.query(`SELECT setval('"Role_id_seq"', (SELECT MAX(id) FROM "Role"))`).catch(() => {})
        console.log('✅ Role table seeded successfully')
      }
    } catch (seedError: any) {
      console.error('⚠️  Role seeding error (non-fatal):', seedError.message)
    }

    // Seed ServiceCategory table if empty (essential for the app to work)
    try {
      const catCount = await pool.query('SELECT COUNT(*) as count FROM "ServiceCategory"')
      if (parseInt(catCount.rows[0].count) === 0) {
        console.log('🔧 Seeding ServiceCategory table...')
        await pool.query(`
          INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "imageUrl", "isActive", "displayOrder", "isEmergency", "createdAt", "updatedAt") VALUES
          (1, 'Air Conditioner', 'air-conditioner', 'Professional AC repair, installation, and maintenance services for your home', 'Wind', '/images/air-conditioner.jpg', true, 1, false, NOW(), NOW()),
          (2, 'Refrigerator', 'refrigerator', 'Expert refrigerator repair and servicing for all brands and models', 'Snowflake', '/images/refrigerator.jpg', true, 2, false, NOW(), NOW()),
          (3, 'Washing Machine', 'washing-machine', 'Professional washing machine repair, installation, and servicing', 'Droplets', '/images/washing-machine.jpg', true, 3, false, NOW(), NOW()),
          (4, 'Kitchen Appliances', 'kitchen-appliances', 'Repair and servicing for kitchen appliances including microwave, chimney, dishwasher', 'UtensilsCrossed', '/images/kitchen-appliances.jpg', true, 4, false, NOW(), NOW()),
          (5, 'TV Repair', 'tv-repair', 'Expert TV repair and installation services for LED, LCD, and Smart TVs', 'Tv', '/images/tv-repair.jpg', true, 5, false, NOW(), NOW()),
          (6, 'Water Purifier', 'water-purifier', 'Water purifier installation, servicing, and filter replacement', 'GlassWater', '/images/water-purifier.jpg', true, 6, false, NOW(), NOW()),
          (7, 'Geyser', 'geyser', 'Geyser installation, repair, and maintenance services', 'Flame', '/images/geyser.jpg', true, 7, false, NOW(), NOW()),
          (8, 'Plumber', 'plumber', 'Professional plumbing services for leaks, pipes, taps, and drainage', 'Wrench', '/images/plumber.jpg', true, 8, true, NOW(), NOW()),
          (9, 'Electrician', 'electrician', 'Certified electrician services for wiring, switches, MCB, and fans', 'Zap', '/images/electrician.jpg', true, 9, true, NOW(), NOW()),
          (10, 'Water Tank Cleaning', 'water-tank-cleaning', 'Professional water tank cleaning and sanitization services', 'Container', '/images/water-tank-cleaning.jpg', true, 10, false, NOW(), NOW()),
          (11, 'Movers and Packers', 'movers-and-packers', 'Safe and reliable packing, moving, and relocation services', 'Truck', '/images/movers-and-packers.jpg', true, 11, false, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `)
        await pool.query(`SELECT setval('"ServiceCategory_id_seq"', (SELECT MAX(id) FROM "ServiceCategory"))`).catch(() => {})
        console.log('✅ ServiceCategory table seeded with 11 categories')
      }
    } catch (catSeedError: any) {
      console.error('⚠️  ServiceCategory seeding error (non-fatal):', catSeedError.message)
    }

    // Enable PostGIS FIRST (before indexes, since PostGIS adds the `location` column)
    try { await setupPostGIS(pool) } catch (pgErr: any) {
      console.error('⚠️  PostGIS setup error (non-fatal):', pgErr.message)
    }

    // Apply performance indexes (after PostGIS so location column exists for GIST index)
    try { await applyDatabaseIndexes(pool) } catch (idxError: any) {
      console.error('⚠️  Index creation error (non-fatal):', idxError.message)
    }

    // Create DeviceToken table
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS "DeviceToken" (id TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, token TEXT NOT NULL, platform TEXT DEFAULT 'unknown', "appVersion" TEXT, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`)
      await pool.query('CREATE INDEX IF NOT EXISTS idx_device_token_userId ON "DeviceToken" ("userId")')
      await pool.query('CREATE INDEX IF NOT EXISTS idx_device_token_token ON "DeviceToken" (token)')
      console.log('✅ DeviceToken table ensured')
    } catch (dtErr: any) { console.error('⚠️  DeviceToken table creation error (non-fatal):', dtErr.message) }

    // Create BackupRecord table
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS "BackupRecord" (id TEXT PRIMARY KEY, timestamp TIMESTAMP NOT NULL DEFAULT NOW(), status TEXT NOT NULL DEFAULT 'IN_PROGRESS', "totalTables" INT DEFAULT 0, "totalRows" INT DEFAULT 0, "sizeBytes" INT DEFAULT 0, duration INT DEFAULT 0, "storageLocation" TEXT DEFAULT 'database', data TEXT, error TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`)
      await pool.query('CREATE INDEX IF NOT EXISTS idx_backup_record_timestamp ON "BackupRecord" (timestamp DESC)')
      await pool.query('CREATE INDEX IF NOT EXISTS idx_backup_record_status ON "BackupRecord" (status)')
      console.log('✅ BackupRecord table ensured')
    } catch (brErr: any) { console.error('⚠️  BackupRecord table creation error (non-fatal):', brErr.message) }

    // Create Payment table (or add missing columns to existing one)
    try {
      // Create table if it doesn't exist (with core columns only)
      await pool.query(`CREATE TABLE IF NOT EXISTS "Payment" (id TEXT PRIMARY KEY, "bookingId" TEXT, amount DECIMAL(12,2) NOT NULL DEFAULT 0, currency TEXT DEFAULT 'INR', status TEXT NOT NULL DEFAULT 'PENDING', method TEXT, metadata JSONB DEFAULT '{}', "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`)
      
      // Add missing columns if the table already exists from a migration
      const addColumnIfNotExists = async (col: string, type: string) => {
        try {
          await pool.query(`ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "${col}" ${type}`)
        } catch { /* column already exists */ }
      }
      await addColumnIfNotExists('orderId', 'TEXT')
      await addColumnIfNotExists('paymentId', 'TEXT')
      await addColumnIfNotExists('userId', 'TEXT')
      await addColumnIfNotExists('signature', 'TEXT')
      await addColumnIfNotExists('refundId', 'TEXT')
      await addColumnIfNotExists('refundAmount', 'DECIMAL(12,2) DEFAULT 0')
      await addColumnIfNotExists('refundStatus', 'TEXT')
      await addColumnIfNotExists('razorpayOrderId', 'TEXT')
      await addColumnIfNotExists('razorpayPaymentId', 'TEXT')
      await addColumnIfNotExists('razorpaySignature', 'TEXT')
      await addColumnIfNotExists('providerId', 'TEXT')
      await addColumnIfNotExists('platformFee', 'DECIMAL(10,2) DEFAULT 0')
      await addColumnIfNotExists('gstAmount', 'DECIMAL(10,2) DEFAULT 0')
      await addColumnIfNotExists('netAmount', 'DECIMAL(10,2) DEFAULT 0')

      // Add foreign key for userId if not already present
      try {
        await pool.query(`ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_userId_fkey"`)
        await pool.query(`ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE`)
      } catch { /* FK already exists or userId doesn't exist */ }

      // Add foreign key for bookingId if not already present
      try {
        await pool.query(`ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_bookingId_fkey"`)
        await pool.query(`ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE SET NULL`)
      } catch { /* FK already exists or Booking table doesn't exist */ }

      // Create indexes (safe to re-run)
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_bookingId ON "Payment" ("bookingId")').catch(() => {})
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_userId ON "Payment" ("userId")').catch(() => {})
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment" (status)').catch(() => {})
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_orderId ON "Payment" ("orderId")').catch(() => {})
      console.log('✅ Payment table ensured')
    } catch (payErr: any) { console.error('⚠️  Payment table creation error (non-fatal):', payErr.message) }

    // Initialize backup system
    try {
      initBackupSystem(pool, { enabled: true, schedule: '0 2 * * *', retentionDays: 30, compression: true })
      console.log('✅ Backup system initialized — daily at 2:00 AM')
      const cleaned = await cleanupOldBackups(pool)
      if (cleaned > 0) console.log(`🧹 Cleaned up ${cleaned} old backup(s) on startup`)
    } catch (backupErr: any) { console.error('⚠️  Backup system initialization error (non-fatal):', backupErr.message) }

  } catch (e: any) {
    logger.error('Database connection failed', { error: e.message })
    captureDbError(e, { operation: 'startup_connection' })
  }

  // 5. Initialize Queue System
  try {
    await initializeQueues()
    await startWorkers()
    console.log('✅ Queue system started')
  } catch (err: any) {
    console.warn('📮 Queue system initialization failed (non-fatal):', err.message)
  }

  // 6. Graceful shutdown with GracefulShutdownManager
  // Register shutdown callbacks (executed in reverse order on signal)
  shutdownManager.register(async () => {
    await shutdownQueues()
  })
  shutdownManager.register(async () => {
    stopBackupScheduler()
  })
  shutdownManager.register(async () => {
    stopMemoryMonitoring()
  })

  process.on('SIGTERM', () => shutdownManager.shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdownManager.shutdown('SIGINT'))
}

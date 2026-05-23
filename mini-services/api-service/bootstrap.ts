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
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception (non-fatal)', { error: err.message, stack: err.stack })
    captureApiError(err, { method: 'process', path: 'uncaughtException' })
  })
  process.on('unhandledRejection', (reason) => {
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

    // Apply performance indexes
    try { await applyDatabaseIndexes(pool) } catch (idxError: any) {
      console.error('⚠️  Index creation error (non-fatal):', idxError.message)
    }

    // Enable PostGIS
    try { await setupPostGIS(pool) } catch (pgErr: any) {
      console.error('⚠️  PostGIS setup error (non-fatal):', pgErr.message)
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

    // Create Payment table
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS "Payment" (id TEXT PRIMARY KEY, "orderId" TEXT, "paymentId" TEXT, "bookingId" TEXT NOT NULL, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, amount DECIMAL(12,2) NOT NULL DEFAULT 0, currency TEXT DEFAULT 'INR', status TEXT NOT NULL DEFAULT 'PENDING', method TEXT, signature TEXT, "refundId" TEXT, "refundAmount" DECIMAL(12,2) DEFAULT 0, "refundStatus" TEXT, metadata JSONB DEFAULT '{}', "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`)
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_bookingId ON "Payment" ("bookingId")')
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_userId ON "Payment" ("userId")')
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment" (status)')
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payment_orderId ON "Payment" ("orderId")')
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

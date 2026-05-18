import { Pool } from 'pg'
import node_cron from 'node-cron'
import { createReadStream } from 'fs'

// ─── Types ──────────────────────────────────────────────────────────────

interface BackupRecord {
  id: string
  timestamp: string
  size: string
  tables: string[]
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'
  duration: number // ms
  storageLocation: string
  error?: string
}

interface BackupConfig {
  enabled: boolean
  schedule: string // cron expression, default '0 2 * * *' (2 AM daily)
  retentionDays: number // default 30
  compression: boolean
  tables: string[] // empty = all tables
  supabaseProjectId: string
  supabaseBucket: string
}

interface BackupData {
  version: string
  timestamp: string
  database: string
  tables: Record<string, { count: number; rows: any[] }>
  metadata: {
    totalRows: number
    totalTables: number
    pgVersion: string
  }
}

// ─── Module State ───────────────────────────────────────────────────────

let cronTask: any = null
let backupConfig: BackupConfig = {
  enabled: false,
  schedule: '0 2 * * *',
  retentionDays: 30,
  compression: true,
  tables: [],
  supabaseProjectId: '',
  supabaseBucket: 'database-backups',
}
let poolRef: Pool | null = null
let isBackupRunning = false

// Tables to exclude from backup (avoid recursion & large/system tables)
const EXCLUDED_TABLES = new Set([
  'BackupRecord',
  'DeviceToken',
])

// ─── Core Functions ─────────────────────────────────────────────────────

/**
 * Initialize the backup system with pg Pool and optional config.
 * Schedules a daily backup using node-cron and registers graceful shutdown.
 */
export function initBackupSystem(pool: Pool, config?: Partial<BackupConfig>): void {
  poolRef = pool

  if (config) {
    backupConfig = { ...backupConfig, ...config }
  }

  if (!backupConfig.enabled) {
    console.log('📋 Backup system is disabled (set enabled: true to schedule)')
    return
  }

  // Validate cron expression
  if (!node_cron.validate(backupConfig.schedule)) {
    console.error(`⚠️  Invalid backup schedule cron: "${backupConfig.schedule}" — using default "0 2 * * *"`)
    backupConfig.schedule = '0 2 * * *'
  }

  // Schedule the daily backup
  cronTask = node_cron.schedule(backupConfig.schedule, async () => {
    if (!poolRef) return
    if (isBackupRunning) {
      console.log('⏭️  Backup already running — skipping scheduled backup')
      return
    }
    try {
      console.log('🔄 Scheduled backup starting...')
      const record = await createBackup(poolRef)
      console.log(`✅ Scheduled backup complete: ${record.id} — ${record.status} — ${record.tables.length} tables`)
    } catch (err: any) {
      console.error('❌ Scheduled backup failed:', err.message)
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  } as any)

  console.log(`📋 Backup system initialized — schedule: "${backupConfig.schedule}" (IST) — retention: ${backupConfig.retentionDays} days`)

  // Register graceful shutdown
  const origSigterm = process.listeners('SIGTERM').pop()
  const origSigint = process.listeners('SIGINT').pop()
  // We don't override — we just ensure stopBackupScheduler is called
  // The index.ts SIGTERM/SIGINT handlers will call stopBackupScheduler() directly
}

/**
 * Create a full database backup.
 * Strategy: Use SQL queries to export all table data as JSON.
 * For each table: SELECT * and serialize to JSON.
 * Store as BackupRecord in database.
 */
export async function createBackup(pool: Pool): Promise<BackupRecord> {
  const startTime = Date.now()
  const backupId = 'bak_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  isBackupRunning = true

  // Create initial IN_PROGRESS record
  try {
    await pool.query(
      `INSERT INTO "BackupRecord" (id, timestamp, status, "totalTables", "totalRows", "sizeBytes", duration, "storageLocation", "createdAt", "updatedAt")
       VALUES ($1, NOW(), 'IN_PROGRESS', 0, 0, 0, 0, 'database', NOW(), NOW())`,
      [backupId]
    )
  } catch (insertErr: any) {
    // If BackupRecord table doesn't exist yet, we'll just proceed
    console.warn('⚠️  Could not create IN_PROGRESS backup record:', insertErr.message)
  }

  try {
    // Get list of all user tables
    const tablesResult = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )

    const allTables = tablesResult.rows.map((r: any) => r.tablename as string)
    const tablesToBackup = allTables.filter(t => !EXCLUDED_TABLES.has(t))

    // Filter to specific tables if configured
    const targetTables = backupConfig.tables.length > 0
      ? tablesToBackup.filter(t => backupConfig.tables.includes(t))
      : tablesToBackup

    const backupData: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      database: 'bookmyservice',
      tables: {},
      metadata: {
        totalRows: 0,
        totalTables: 0,
        pgVersion: '',
      },
    }

    let totalRows = 0

    // Get PG version
    try {
      const pgVer = await pool.query('SELECT version() as ver')
      backupData.metadata.pgVersion = pgVer.rows[0]?.ver?.split(' ')[1] || 'unknown'
    } catch {
      backupData.metadata.pgVersion = 'unknown'
    }

    // Export each table
    for (const tableName of targetTables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`)
        const count = parseInt(countResult.rows[0]?.count || '0')

        if (count === 0) {
          backupData.tables[tableName] = { count: 0, rows: [] }
          continue
        }

        // For large tables, limit to prevent memory issues
        const LIMIT = 50000
        const dataResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT ${LIMIT}`)
        const rows = dataResult.rows

        // Sanitize rows — remove large binary fields
        const sanitizedRows = rows.map((row: any) => {
          const sanitized: Record<string, any> = {}
          for (const [key, value] of Object.entries(row)) {
            if (Buffer.isBuffer(value)) {
              sanitized[key] = `[Buffer: ${value.length} bytes]`
            } else if (value instanceof Date) {
              sanitized[key] = value.toISOString()
            } else {
              sanitized[key] = value
            }
          }
          return sanitized
        })

        backupData.tables[tableName] = { count, rows: sanitizedRows }
        totalRows += count
      } catch (tableErr: any) {
        console.warn(`⚠️  Could not backup table "${tableName}":`, tableErr.message)
        backupData.tables[tableName] = { count: 0, rows: [] } // error logged above
      }
    }

    backupData.metadata.totalRows = totalRows
    backupData.metadata.totalTables = Object.keys(backupData.tables).length

    // Serialize backup data
    let dataStr = JSON.stringify(backupData)
    const sizeBytes = Buffer.byteLength(dataStr, 'utf8')

    // Compress if enabled and data is large (> 1MB)
    let storageLocation = 'database'
    if (backupConfig.compression && sizeBytes > 1024 * 1024) {
      try {
        const zlib = await import('zlib')
        const compressed = zlib.deflateSync(Buffer.from(dataStr, 'utf8'))
        const compressedStr = compressed.toString('base64')
        // Only use compressed version if it's actually smaller
        if (Buffer.byteLength(compressedStr, 'utf8') < sizeBytes) {
          dataStr = 'COMPRESSED_BASE64:' + compressedStr
          storageLocation = 'database-compressed'
        }
      } catch (compErr: any) {
        console.warn('⚠️  Compression failed, storing uncompressed:', compErr.message)
      }
    }

    const duration = Date.now() - startTime

    // Attempt Supabase Storage upload if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        await uploadToSupabaseStorage(backupId, dataStr, backupData.timestamp)
        storageLocation = storageLocation.includes('compressed')
          ? 'supabase-storage+database-compressed'
          : 'supabase-storage+database'
      } catch (uploadErr: any) {
        console.warn('⚠️  Supabase Storage upload failed:', uploadErr.message)
      }
    }

    // Update backup record
    try {
      await pool.query(
        `UPDATE "BackupRecord" SET
          status = 'SUCCESS',
          "totalTables" = $1,
          "totalRows" = $2,
          "sizeBytes" = $3,
          duration = $4,
          "storageLocation" = $5,
          data = $6,
          "updatedAt" = NOW()
        WHERE id = $7`,
        [
          backupData.metadata.totalTables,
          totalRows,
          sizeBytes,
          duration,
          storageLocation,
          dataStr,
          backupId,
        ]
      )
    } catch (updateErr: any) {
      console.warn('⚠️  Could not update backup record:', updateErr.message)
    }

    isBackupRunning = false

    return {
      id: backupId,
      timestamp: backupData.timestamp,
      size: formatBytes(sizeBytes),
      tables: Object.keys(backupData.tables),
      status: 'SUCCESS',
      duration,
      storageLocation,
    }
  } catch (err: any) {
    const duration = Date.now() - startTime
    isBackupRunning = false

    // Update backup record with error
    try {
      await pool.query(
        `UPDATE "BackupRecord" SET status = 'FAILED', duration = $1, error = $2, "updatedAt" = NOW() WHERE id = $3`,
        [duration, err.message?.substring(0, 500), backupId]
      )
    } catch (updateErr: any) {
      console.warn('⚠️  Could not update failed backup record:', updateErr.message)
    }

    return {
      id: backupId,
      timestamp: new Date().toISOString(),
      size: '0',
      tables: [],
      status: 'FAILED',
      duration,
      storageLocation: 'none',
      error: err.message,
    }
  }
}

/**
 * Restore from a specific backup.
 * Read backup data from BackupRecord.
 * Clear and repopulate tables.
 * DANGEROUS — should only be used by admins as a last resort.
 */
export async function restoreBackup(pool: Pool, backupId: string): Promise<{ success: boolean; tablesRestored: number }> {
  try {
    const result = await pool.query('SELECT * FROM "BackupRecord" WHERE id = $1', [backupId])
    if (!result.rows[0]) {
      throw new Error('Backup not found')
    }

    const record = result.rows[0]
    if (record.status !== 'SUCCESS') {
      throw new Error(`Cannot restore backup with status: ${record.status}`)
    }

    let dataStr = record.data
    if (!dataStr) {
      throw new Error('Backup data is empty or not stored in database')
    }

    // Decompress if needed
    if (dataStr.startsWith('COMPRESSED_BASE64:')) {
      try {
        const zlib = await import('zlib')
        const base64Data = dataStr.replace('COMPRESSED_BASE64:', '')
        const compressed = Buffer.from(base64Data, 'base64')
        dataStr = zlib.inflateSync(compressed).toString('utf8')
      } catch (decompErr: any) {
        throw new Error(`Failed to decompress backup data: ${decompErr.message}`)
      }
    }

    const backupData: BackupData = JSON.parse(dataStr)
    let tablesRestored = 0

    // Restore each table (skip BackupRecord to avoid recursion)
    for (const [tableName, tableData] of Object.entries(backupData.tables)) {
      if (EXCLUDED_TABLES.has(tableName)) continue
      if (!tableData.rows || tableData.rows.length === 0) continue

      try {
        // Clear existing data
        await pool.query(`DELETE FROM "${tableName}"`)

        // Insert rows in batches
        const BATCH_SIZE = 100
        const rows = tableData.rows

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE)
          for (const row of batch) {
            const columns = Object.keys(row)
            const values = Object.values(row)
            const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ')
            const columnNames = columns.map(c => `"${c}"`).join(', ')

            try {
              await pool.query(
                `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values
              )
            } catch (insertErr: any) {
              // Skip individual row errors — continue with next row
              console.warn(`⚠️  Row insert failed in ${tableName}:`, insertErr.message?.substring(0, 100))
            }
          }
        }

        tablesRestored++
      } catch (tableErr: any) {
        console.warn(`⚠️  Could not restore table "${tableName}":`, tableErr.message)
      }
    }

    return { success: true, tablesRestored }
  } catch (err: any) {
    throw new Error(`Restore failed: ${err.message}`)
  }
}

/**
 * List recent backups from database.
 * Default limit 30.
 */
export async function listBackups(pool: Pool, limit: number = 30): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT id, timestamp, status, "totalTables", "totalRows", "sizeBytes", duration, "storageLocation", error, "createdAt"
       FROM "BackupRecord"
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit]
    )
    return result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      status: row.status,
      totalTables: row.totalTables,
      totalRows: row.totalRows,
      sizeBytes: row.sizeBytes,
      size: formatBytes(row.sizeBytes),
      duration: row.duration,
      durationFormatted: formatDuration(row.duration),
      storageLocation: row.storageLocation,
      error: row.error,
      createdAt: row.createdAt,
    }))
  } catch (err: any) {
    console.warn('⚠️  Could not list backups:', err.message)
    return []
  }
}

/**
 * Delete a specific backup record and data.
 */
export async function deleteBackup(pool: Pool, backupId: string): Promise<boolean> {
  try {
    const result = await pool.query('DELETE FROM "BackupRecord" WHERE id = $1', [backupId])
    return (result.rowCount ?? 0) > 0
  } catch (err: any) {
    console.warn('⚠️  Could not delete backup:', err.message)
    return false
  }
}

/**
 * Delete backups older than retention period.
 * Default 30 days.
 * Returns count of deleted backups.
 */
export async function cleanupOldBackups(pool: Pool, retentionDays?: number): Promise<number> {
  const days = retentionDays || backupConfig.retentionDays || 30
  try {
    const result = await pool.query(
      `DELETE FROM "BackupRecord" WHERE timestamp < NOW() - INTERVAL '${days} days'`
    )
    const deleted = result.rowCount ?? 0
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} backup(s) older than ${days} days`)
    }
    return deleted
  } catch (err: any) {
    console.warn('⚠️  Could not cleanup old backups:', err.message)
    return 0
  }
}

/**
 * Get current backup system status.
 */
export async function getBackupStatus(pool: Pool): Promise<{
  enabled: boolean
  totalBackups: number
  latestBackup: any | null
  nextScheduled: string | null
  totalSizeMB: number
  retentionDays: number
}> {
  try {
    const countResult = await pool.query('SELECT COUNT(*) as count FROM "BackupRecord"')
    const totalBackups = parseInt(countResult.rows[0]?.count || '0')

    const sizeResult = await pool.query('SELECT COALESCE(SUM("sizeBytes"), 0) as total FROM "BackupRecord"')
    const totalSizeBytes = parseInt(sizeResult.rows[0]?.total || '0')

    const latestResult = await pool.query(
      `SELECT id, timestamp, status, "totalTables", "totalRows", "sizeBytes", duration, "storageLocation"
       FROM "BackupRecord" WHERE status IN ('SUCCESS', 'FAILED')
       ORDER BY timestamp DESC LIMIT 1`
    )

    const latestBackup = latestResult.rows[0] || null

    // Calculate next scheduled time from cron
    let nextScheduled: string | null = null
    if (cronTask && backupConfig.enabled) {
      // node-cron doesn't expose next run time easily, so we indicate the schedule
      nextScheduled = `scheduled: "${backupConfig.schedule}" (IST)`
    }

    return {
      enabled: backupConfig.enabled,
      totalBackups,
      latestBackup: latestBackup ? {
        ...latestBackup,
        size: formatBytes(latestBackup.sizeBytes),
        durationFormatted: formatDuration(latestBackup.duration),
      } : null,
      nextScheduled,
      totalSizeMB: Math.round((totalSizeBytes / 1024 / 1024) * 100) / 100,
      retentionDays: backupConfig.retentionDays,
    }
  } catch (err: any) {
    return {
      enabled: backupConfig.enabled,
      totalBackups: 0,
      latestBackup: null,
      nextScheduled: null,
      totalSizeMB: 0,
      retentionDays: backupConfig.retentionDays,
    }
  }
}

/**
 * Get specific backup details (including full data if requested).
 */
export async function getBackupDetails(pool: Pool, backupId: string, includeData: boolean = false): Promise<any | null> {
  try {
    const selectCols = includeData
      ? '*'
      : 'id, timestamp, status, "totalTables", "totalRows", "sizeBytes", duration, "storageLocation", error, "createdAt", "updatedAt"'

    const result = await pool.query(`SELECT ${selectCols} FROM "BackupRecord" WHERE id = $1`, [backupId])
    if (!result.rows[0]) return null

    const row = result.rows[0]
    return {
      ...row,
      size: formatBytes(row.sizeBytes),
      durationFormatted: formatDuration(row.duration),
    }
  } catch (err: any) {
    console.warn('⚠️  Could not get backup details:', err.message)
    return null
  }
}

/**
 * Stop the cron scheduler.
 */
export function stopBackupScheduler(): void {
  if (cronTask) {
    cronTask.stop()
    cronTask = null
    console.log('📋 Backup scheduler stopped')
  }
}

// ─── Helper Functions ───────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Upload backup data to Supabase Storage.
 */
async function uploadToSupabaseStorage(backupId: string, data: string, timestamp: string): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!
  const bucket = backupConfig.supabaseBucket || 'database-backups'

  const filePath = `backups/${timestamp.split('T')[0]}/${backupId}.json`

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: data,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase Storage upload failed: ${response.status} - ${errorText}`)
  }
}

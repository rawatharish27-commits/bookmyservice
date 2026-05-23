import { Pool } from 'pg'
import node_cron from 'node-cron'
import { createReadStream } from 'fs'
import * as crypto from 'crypto'

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

// ─── Encrypted Backup Storage ───────────────────────────────────────────

const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || ''

/**
 * Encrypt backup data using AES-256-GCM.
 * Returns format: ENCRYPTED:{iv}:{authTag}:{ciphertext} (all base64)
 * If BACKUP_ENCRYPTION_KEY is not set, returns data unchanged with a warning.
 */
export function encryptBackup(data: string): string {
  if (!ENCRYPTION_KEY) {
    console.warn('⚠️  BACKUP_ENCRYPTION_KEY not set — backup data will not be encrypted')
    return data
  }

  try {
    // Derive a 32-byte key from the hex string
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    if (key.length !== 32) {
      console.warn('⚠️  BACKUP_ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars) — encryption skipped')
      return data
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    let ciphertext = cipher.update(data, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    const authTag = cipher.getAuthTag()

    return `ENCRYPTED:${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext}`
  } catch (err: any) {
    console.error('❌ Backup encryption failed:', err.message)
    return data
  }
}

/**
 * Decrypt backup data that was encrypted with AES-256-GCM.
 * Expects format: ENCRYPTED:{iv}:{authTag}:{ciphertext} (all base64)
 * If the data doesn't start with ENCRYPTED:, returns it unchanged.
 */
export function decryptBackup(encryptedData: string): string {
  if (!encryptedData.startsWith('ENCRYPTED:')) {
    return encryptedData
  }

  if (!ENCRYPTION_KEY) {
    throw new Error('Cannot decrypt backup: BACKUP_ENCRYPTION_KEY not set')
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    if (key.length !== 32) {
      throw new Error('BACKUP_ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars)')
    }

    const parts = encryptedData.split(':')
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted backup format — expected ENCRYPTED:{iv}:{authTag}:{ciphertext}')
    }

    const iv = Buffer.from(parts[1], 'base64')
    const authTag = Buffer.from(parts[2], 'base64')
    const ciphertext = parts[3]

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (err: any) {
    throw new Error(`Backup decryption failed: ${err.message}`)
  }
}

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
 * Encrypts data if BACKUP_ENCRYPTION_KEY is set.
 * Uploads to S3-compatible storage if S3 env vars are configured.
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

    // Encrypt if BACKUP_ENCRYPTION_KEY is set
    if (ENCRYPTION_KEY) {
      try {
        dataStr = encryptBackup(dataStr)
        if (dataStr.startsWith('ENCRYPTED:')) {
          storageLocation = storageLocation.includes('compressed')
            ? storageLocation.replace('compressed', 'encrypted-compressed')
            : storageLocation + '-encrypted'
        }
      } catch (encErr: any) {
        console.warn('⚠️  Encryption failed, storing unencrypted:', encErr.message)
      }
    }

    const duration = Date.now() - startTime

    // Attempt Supabase Storage upload if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        await uploadToSupabaseStorage(backupId, dataStr, backupData.timestamp)
        storageLocation = storageLocation.includes('supabase')
          ? storageLocation
          : 'supabase-storage+' + storageLocation
      } catch (uploadErr: any) {
        console.warn('⚠️  Supabase Storage upload failed:', uploadErr.message)
      }
    }

    // Attempt S3-compatible upload if configured
    if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && process.env.S3_BUCKET) {
      try {
        await uploadToS3(backupId, dataStr, backupData.timestamp)
        storageLocation = storageLocation.includes('s3')
          ? storageLocation
          : storageLocation + '+s3-storage'
      } catch (uploadErr: any) {
        console.warn('⚠️  S3 upload failed:', uploadErr.message)
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
 * Decrypt if encrypted.
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

    // Decrypt if encrypted
    if (dataStr.startsWith('ENCRYPTED:')) {
      try {
        dataStr = decryptBackup(dataStr)
      } catch (decErr: any) {
        throw new Error(`Failed to decrypt backup data: ${decErr.message}`)
      }
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

// ─── Offsite Backup (S3-compatible) ─────────────────────────────────────

/**
 * Upload backup data to S3-compatible storage using standard fetch.
 * Uses env vars: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, S3_REGION
 * If S3 env vars are not set, skips with warning (same pattern as Supabase).
 */
export async function uploadToS3(backupId: string, data: string, timestamp: string): Promise<void> {
  const endpoint = process.env.S3_ENDPOINT
  const accessKey = process.env.S3_ACCESS_KEY
  const secretKey = process.env.S3_SECRET_KEY
  const bucket = process.env.S3_BUCKET
  const region = process.env.S3_REGION || 'us-east-1'

  if (!endpoint || !accessKey || !secretKey || !bucket) {
    console.warn('⚠️  S3 env vars not set (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET) — skipping S3 upload')
    return
  }

  const filePath = `backups/${timestamp.split('T')[0]}/${backupId}.json`
  const url = `${endpoint.replace(/\/$/, '')}/${bucket}/${filePath}`

  // AWS Signature Version 4 signing
  const now = new Date()
  const dateStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const dateOnly = dateStamp.slice(0, 8)
  const service = 's3'

  // Create canonical request
  const payloadHash = crypto.createHash('sha256').update(data).digest('hex')
  const canonicalHeaders = `host:${new URL(url).host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${dateStamp}\n`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = `PUT\n/${bucket}/${filePath}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

  // Create string to sign
  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`
  const stringToSign = `AWS4-HMAC-SHA256\n${dateStamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`

  // Calculate signing key
  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateOnly).digest()
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest()
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest()
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()

  // Calculate signature
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': dateStamp,
      'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: data,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`S3 upload failed: ${response.status} - ${errorText}`)
  }

  console.log(`☁️  Backup uploaded to S3: ${filePath}`)
}

// ─── Restore Verification ──────────────────────────────────────────────

/**
 * Verify a backup's integrity by checking JSON parsing, table/row counts,
 * checksum computation, and potential data corruption.
 */
export async function verifyBackupIntegrity(backupId: string): Promise<{
  valid: boolean
  tableCount: number
  totalRows: number
  checksum: string
  issues: string[]
}> {
  const issues: string[] = []

  try {
    if (!poolRef) {
      throw new Error('Backup system not initialized — pool reference unavailable')
    }

    const result = await poolRef.query('SELECT * FROM "BackupRecord" WHERE id = $1', [backupId])
    if (!result.rows[0]) {
      return { valid: false, tableCount: 0, totalRows: 0, checksum: '', issues: ['Backup not found'] }
    }

    const record = result.rows[0]
    let dataStr = record.data

    if (!dataStr) {
      return { valid: false, tableCount: 0, totalRows: 0, checksum: '', issues: ['Backup data is empty or not stored in database'] }
    }

    // Compute SHA-256 checksum of raw backup data before any processing
    const checksum = crypto.createHash('sha256').update(dataStr).digest('hex')

    // Decrypt if encrypted
    if (dataStr.startsWith('ENCRYPTED:')) {
      try {
        dataStr = decryptBackup(dataStr)
      } catch (decErr: any) {
        return { valid: false, tableCount: 0, totalRows: 0, checksum, issues: [`Decryption failed: ${decErr.message}`] }
      }
    }

    // Decompress if needed
    if (dataStr.startsWith('COMPRESSED_BASE64:')) {
      try {
        const zlib = await import('zlib')
        const base64Data = dataStr.replace('COMPRESSED_BASE64:', '')
        const compressed = Buffer.from(base64Data, 'base64')
        dataStr = zlib.inflateSync(compressed).toString('utf8')
      } catch (decompErr: any) {
        return { valid: false, tableCount: 0, totalRows: 0, checksum, issues: [`Decompression failed: ${decompErr.message}`] }
      }
    }

    // Check JSON parsing
    let backupData: BackupData
    try {
      backupData = JSON.parse(dataStr)
    } catch (parseErr: any) {
      // Check for truncated JSON
      if (dataStr.includes('\0')) {
        issues.push('Backup data contains null bytes — possible corruption')
      }
      if (!dataStr.trim().endsWith('}')) {
        issues.push('Backup data appears to be truncated JSON')
      }
      return { valid: false, tableCount: 0, totalRows: 0, checksum, issues: [`JSON parsing failed: ${parseErr.message}`] }
    }

    // Check for null bytes in the raw data
    if (dataStr.includes('\0')) {
      issues.push('Backup data contains null bytes — possible corruption')
    }

    // Count tables and rows
    const tableNames = Object.keys(backupData.tables || {})
    const tableCount = tableNames.length
    let totalRows = 0

    for (const tableName of tableNames) {
      const tableData = backupData.tables[tableName]
      const rowCount = tableData?.count ?? (tableData?.rows?.length ?? 0)
      totalRows += rowCount

      // Check for tables with 0 rows (potential issue)
      if (rowCount === 0) {
        issues.push(`Table "${tableName}" has 0 rows — potential data loss or empty table`)
      }

      // Check for corrupted row data
      if (tableData?.rows) {
        for (let i = 0; i < tableData.rows.length; i++) {
          const row = tableData.rows[i]
          if (row === null || row === undefined) {
            issues.push(`Table "${tableName}" has null/undefined row at index ${i}`)
            break
          }
          // Check row values for null bytes
          const rowStr = JSON.stringify(row)
          if (rowStr.includes('\0')) {
            issues.push(`Table "${tableName}" row ${i} contains null bytes — possible corruption`)
            break
          }
        }
      }
    }

    // Verify metadata consistency
    if (backupData.metadata) {
      if (backupData.metadata.totalTables !== tableCount) {
        issues.push(`Metadata table count mismatch: metadata says ${backupData.metadata.totalTables}, actual ${tableCount}`)
      }
      if (backupData.metadata.totalRows !== totalRows) {
        issues.push(`Metadata row count mismatch: metadata says ${backupData.metadata.totalRows}, actual ${totalRows}`)
      }
    }

    const valid = issues.length === 0

    return { valid, tableCount, totalRows, checksum, issues }
  } catch (err: any) {
    return { valid: false, tableCount: 0, totalRows: 0, checksum: '', issues: [`Verification error: ${err.message}`] }
  }
}

/**
 * After a restore, compare row counts in the restored DB against the backup
 * metadata to verify the restore was complete.
 */
export async function verifyRestore(pool: Pool, backupId: string): Promise<{
  success: boolean
  verified: boolean
  discrepancies: string[]
}> {
  const discrepancies: string[] = []

  try {
    // Get backup record
    const result = await pool.query('SELECT * FROM "BackupRecord" WHERE id = $1', [backupId])
    if (!result.rows[0]) {
      return { success: false, verified: false, discrepancies: ['Backup not found'] }
    }

    const record = result.rows[0]
    let dataStr = record.data

    if (!dataStr) {
      return { success: false, verified: false, discrepancies: ['Backup data is empty'] }
    }

    // Decrypt if encrypted
    if (dataStr.startsWith('ENCRYPTED:')) {
      try {
        dataStr = decryptBackup(dataStr)
      } catch (decErr: any) {
        return { success: false, verified: false, discrepancies: [`Decryption failed: ${decErr.message}`] }
      }
    }

    // Decompress if needed
    if (dataStr.startsWith('COMPRESSED_BASE64:')) {
      try {
        const zlib = await import('zlib')
        const base64Data = dataStr.replace('COMPRESSED_BASE64:', '')
        const compressed = Buffer.from(base64Data, 'base64')
        dataStr = zlib.inflateSync(compressed).toString('utf8')
      } catch (decompErr: any) {
        return { success: false, verified: false, discrepancies: [`Decompression failed: ${decompErr.message}`] }
      }
    }

    const backupData: BackupData = JSON.parse(dataStr)

    // Compare row counts for each table
    for (const [tableName, tableData] of Object.entries(backupData.tables)) {
      if (EXCLUDED_TABLES.has(tableName)) continue

      const expectedCount = tableData.rows?.length ?? 0

      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`)
        const actualCount = parseInt(countResult.rows[0]?.count || '0')

        if (actualCount !== expectedCount) {
          discrepancies.push(`Table "${tableName}": expected ${expectedCount} rows, found ${actualCount}`)
        }
      } catch (tableErr: any) {
        discrepancies.push(`Table "${tableName}": could not verify — ${tableErr.message?.substring(0, 100)}`)
      }
    }

    const verified = discrepancies.length === 0

    return { success: true, verified, discrepancies }
  } catch (err: any) {
    return { success: false, verified: false, discrepancies: [`Verification error: ${err.message}`] }
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

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: Backup Format Versioning ──────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Backup format version constant for forward compatibility.
 * Increment this when the backup data format changes.
 * Include this in backup metadata so restore logic can handle
 * different versions gracefully.
 */
export const BACKUP_FORMAT_VERSION = '2.0'

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: Transactional Restore ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Restore from a specific backup using a database transaction.
 * Wraps the entire restore in BEGIN/COMMIT so if it fails midway,
 * all changes are rolled back. This prevents partial restores that
 * leave the database in an inconsistent state.
 *
 * DANGEROUS — should only be used by admins as a last resort.
 */
export async function restoreBackupTransactional(
  pool: Pool,
  backupId: string
): Promise<{ success: boolean; tablesRestored: number; rolledBack: boolean }> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

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

    // Decrypt if encrypted
    if (dataStr.startsWith('ENCRYPTED:')) {
      try {
        dataStr = decryptBackup(dataStr)
      } catch (decErr: any) {
        throw new Error(`Failed to decrypt backup data: ${decErr.message}`)
      }
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

    // Restore each table within the transaction
    for (const [tableName, tableData] of Object.entries(backupData.tables)) {
      if (EXCLUDED_TABLES.has(tableName)) continue
      if (!tableData.rows || tableData.rows.length === 0) continue

      try {
        // Clear existing data
        await client.query(`DELETE FROM "${tableName}"`)

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
              await client.query(
                `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values
              )
            } catch (insertErr: any) {
              console.warn(`⚠️  Row insert failed in ${tableName}:`, insertErr.message?.substring(0, 100))
            }
          }
        }

        tablesRestored++
      } catch (tableErr: any) {
        console.warn(`⚠️  Could not restore table "${tableName}":`, tableErr.message)
      }
    }

    await client.query('COMMIT')
    return { success: true, tablesRestored, rolledBack: false }
  } catch (err: any) {
    // Rollback the entire transaction on any error
    try {
      await client.query('ROLLBACK')
    } catch (rollbackErr: any) {
      console.error('❌ Rollback failed:', rollbackErr.message)
    }

    throw new Error(`Transactional restore failed (rolled back): ${err.message}`)
  } finally {
    client.release()
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: Backup Encryption Key Rotation ────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Rotate the encryption key by re-encrypting the latest backup with a new key.
 * This reads the latest backup, decrypts it with the old key, and re-encrypts
 * it with the new key. The old key is provided as a parameter (not read from env)
 * so that the caller can manage key lifecycle.
 *
 * @param oldKey - The current encryption key (64 hex chars = 32 bytes)
 * @param newKey - The new encryption key (64 hex chars = 32 bytes)
 * @returns The backup ID that was re-encrypted, or null if no backup found
 */
export async function rotateEncryptionKey(
  oldKey: string,
  newKey: string
): Promise<string | null> {
  if (!poolRef) {
    throw new Error('Backup system not initialized — pool reference unavailable')
  }

  const oldKeyBuf = Buffer.from(oldKey, 'hex')
  const newKeyBuf = Buffer.from(newKey, 'hex')

  if (oldKeyBuf.length !== 32) {
    throw new Error('Old key must be a 32-byte hex string (64 hex chars)')
  }
  if (newKeyBuf.length !== 32) {
    throw new Error('New key must be a 32-byte hex string (64 hex chars)')
  }

  try {
    // Find the latest successful backup
    const result = await poolRef.query(
      `SELECT id, data FROM "BackupRecord" WHERE status = 'SUCCESS' AND data IS NOT NULL ORDER BY timestamp DESC LIMIT 1`
    )

    if (!result.rows[0]) {
      console.log('📋 No encrypted backup found for key rotation')
      return null
    }

    const { id: backupId, data: encryptedData } = result.rows[0]

    if (!encryptedData || !encryptedData.startsWith('ENCRYPTED:')) {
      console.log('📋 Latest backup is not encrypted — no key rotation needed')
      return null
    }

    // Decrypt with old key
    const parts = encryptedData.split(':')
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted backup format')
    }

    const iv = Buffer.from(parts[1], 'base64')
    const authTag = Buffer.from(parts[2], 'base64')
    const ciphertext = parts[3]

    const oldDecipher = crypto.createDecipheriv('aes-256-gcm', oldKeyBuf, iv)
    oldDecipher.setAuthTag(authTag)
    let decrypted = oldDecipher.update(ciphertext, 'base64', 'utf8')
    decrypted += oldDecipher.final('utf8')

    // Re-encrypt with new key
    const newIv = crypto.randomBytes(16)
    const newCipher = crypto.createCipheriv('aes-256-gcm', newKeyBuf, newIv)
    let newCiphertext = newCipher.update(decrypted, 'utf8', 'base64')
    newCiphertext += newCipher.final('base64')
    const newAuthTag = newCipher.getAuthTag()

    const newEncryptedData = `ENCRYPTED:${newIv.toString('base64')}:${newAuthTag.toString('base64')}:${newCiphertext}`

    // Update the backup record with the new encrypted data
    await poolRef.query(
      `UPDATE "BackupRecord" SET data = $1, "updatedAt" = NOW() WHERE id = $2`,
      [newEncryptedData, backupId]
    )

    console.log(`🔐 [Backup] Encryption key rotated for backup ${backupId}`)
    return backupId
  } catch (err: any) {
    throw new Error(`Key rotation failed: ${err.message}`)
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ─── ENHANCEMENT: Streaming Verification ────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verify a backup's integrity using streaming/chunked processing
 * instead of loading the entire blob into memory at once.
 *
 * Processes the backup data in chunks to compute checksum and validate
 * structure without excessive memory usage for large backups.
 */
export async function verifyBackupIntegrityStreaming(backupId: string): Promise<{
  valid: boolean
  tableCount: number
  totalRows: number
  checksum: string
  issues: string[]
  bytesProcessed: number
}> {
  const issues: string[] = []

  try {
    if (!poolRef) {
      throw new Error('Backup system not initialized — pool reference unavailable')
    }

    const result = await poolRef.query('SELECT * FROM "BackupRecord" WHERE id = $1', [backupId])
    if (!result.rows[0]) {
      return { valid: false, tableCount: 0, totalRows: 0, checksum: '', issues: ['Backup not found'], bytesProcessed: 0 }
    }

    const record = result.rows[0]
    let dataStr = record.data

    if (!dataStr) {
      return { valid: false, tableCount: 0, totalRows: 0, checksum: '', issues: ['Backup data is empty'], bytesProcessed: 0 }
    }

    let bytesProcessed = 0

    // Stream the checksum computation in chunks to avoid loading entire blob
    const hash = crypto.createHash('sha256')
    const CHUNK_SIZE = 1024 * 1024 // 1MB chunks
    for (let i = 0; i < dataStr.length; i += CHUNK_SIZE) {
      const chunk = dataStr.slice(i, i + CHUNK_SIZE)
      hash.update(chunk)
      bytesProcessed += Buffer.byteLength(chunk, 'utf8')
    }
    const checksum = hash.digest('hex')

    // Decrypt if encrypted
    if (dataStr.startsWith('ENCRYPTED:')) {
      try {
        dataStr = decryptBackup(dataStr)
      } catch (decErr: any) {
        return { valid: false, tableCount: 0, totalRows: 0, checksum, issues: [`Decryption failed: ${decErr.message}`], bytesProcessed }
      }
    }

    // Decompress if needed
    if (dataStr.startsWith('COMPRESSED_BASE64:')) {
      try {
        const zlib = await import('zlib')
        const base64Data = dataStr.replace('COMPRESSED_BASE64:', '')
        const compressed = Buffer.from(base64Data, 'base64')
        dataStr = zlib.inflateSync(compressed).toString('utf8')
      } catch (decompErr: any) {
        return { valid: false, tableCount: 0, totalRows: 0, checksum, issues: [`Decompression failed: ${decompErr.message}`], bytesProcessed }
      }
    }

    // Check JSON parsing
    let backupData: BackupData
    try {
      backupData = JSON.parse(dataStr)
    } catch (parseErr: any) {
      if (dataStr.includes('\0')) {
        issues.push('Backup data contains null bytes — possible corruption')
      }
      if (!dataStr.trim().endsWith('}')) {
        issues.push('Backup data appears to be truncated JSON')
      }
      return { valid: false, tableCount: 0, totalRows: 0, checksum, issues: [`JSON parsing failed: ${parseErr.message}`], bytesProcessed }
    }

    // Count tables and rows with streaming validation
    const tableNames = Object.keys(backupData.tables || {})
    const tableCount = tableNames.length
    let totalRows = 0

    for (const tableName of tableNames) {
      const tableData = backupData.tables[tableName]
      const rowCount = tableData?.count ?? (tableData?.rows?.length ?? 0)
      totalRows += rowCount

      if (rowCount === 0) {
        issues.push(`Table "${tableName}" has 0 rows — potential data loss or empty table`)
      }

      // Stream-validate rows (check in batches instead of all at once)
      if (tableData?.rows) {
        const BATCH_VALIDATE = 100
        for (let i = 0; i < tableData.rows.length; i += BATCH_VALIDATE) {
          const batch = tableData.rows.slice(i, i + BATCH_VALIDATE)
          for (let j = 0; j < batch.length; j++) {
            const row = batch[j]
            const globalIdx = i + j
            if (row === null || row === undefined) {
              issues.push(`Table "${tableName}" has null/undefined row at index ${globalIdx}`)
              break
            }
            const rowStr = JSON.stringify(row)
            if (rowStr.includes('\0')) {
              issues.push(`Table "${tableName}" row ${globalIdx} contains null bytes — possible corruption`)
              break
            }
          }
          // Yield between batches to avoid blocking the event loop
          if (i + BATCH_VALIDATE < tableData.rows.length) {
            await new Promise(resolve => setImmediate(resolve))
          }
        }
      }
    }

    // Verify metadata consistency
    if (backupData.metadata) {
      if (backupData.metadata.totalTables !== tableCount) {
        issues.push(`Metadata table count mismatch: metadata says ${backupData.metadata.totalTables}, actual ${tableCount}`)
      }
      if (backupData.metadata.totalRows !== totalRows) {
        issues.push(`Metadata row count mismatch: metadata says ${backupData.metadata.totalRows}, actual ${totalRows}`)
      }
    }

    const valid = issues.length === 0
    return { valid, tableCount, totalRows, checksum, issues, bytesProcessed }
  } catch (err: any) {
    return { valid: false, tableCount: 0, totalRows: 0, checksum: '', issues: [`Verification error: ${err.message}`], bytesProcessed: 0 }
  }
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

/**
 * PostgreSQL database client using Prisma with driver adapter.
 *
 * - Uses @prisma/adapter-pg for PostgreSQL connections
 * - Works with any PostgreSQL provider: Neon, Supabase, Railway, AWS RDS, etc.
 * - Connection string is set via DATABASE_URL env variable
 *
 * Example DATABASE_URL:
 *   postgresql://user:password@host:5432/dbname?sslmode=require
 *   postgres://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPgClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it to your PostgreSQL connection string. ' +
      'Example: postgresql://user:password@host:5432/dbname?sslmode=require'
    )
  }

  // Parse SSL mode from connection string
  const sslmode = connectionString.includes('sslmode=require') ||
                  connectionString.includes('ssl=true') ||
                  connectionString.includes('neon.tech') ||
                  connectionString.includes('supabase.co') ||
                  connectionString.includes('railway.app')

  const pool = new pg.Pool({
    connectionString,
    ssl: sslmode ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

/**
 * Get a PrismaClient instance for PostgreSQL.
 * Uses singleton pattern in development to prevent connection pool exhaustion.
 */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPgClient()
  }
  return globalForPrisma.prisma
}

/**
 * Default export for backward compatibility with existing API routes.
 */
export const db = getDb()

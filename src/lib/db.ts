import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

/**
 * Cloudflare-aware database client.
 *
 * - On Cloudflare Workers: Uses D1 adapter (env.DB binding)
 * - On local dev / Node.js: Uses standard PrismaClient with SQLite
 *
 * In Cloudflare Pages, the D1 binding is accessed via:
 *   process.env.DB  (OpenNext injects it)
 */

export type EnvBindings = {
  DB?: D1Database
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createD1Client(d1Database: D1Database): PrismaClient {
  const adapter = new PrismaD1(d1Database)
  return new PrismaClient({ adapter })
}

function createLocalClient(): PrismaClient {
  return new PrismaClient({
    log: ['query'],
  })
}

/**
 * Get a PrismaClient instance.
 * - If a D1 binding is provided, uses the D1 adapter (Cloudflare Workers)
 * - Otherwise falls back to standard SQLite PrismaClient (local dev)
 */
export function getDb(env?: EnvBindings): PrismaClient {
  // Cloudflare Workers with D1 binding
  if (env?.DB) {
    return createD1Client(env.DB)
  }

  // Check for D1 in process.env (injected by OpenNext/Cloudflare)
  if (typeof process !== 'undefined' && (process.env as Record<string, unknown>).DB) {
    return createD1Client((process.env as Record<string, unknown>).DB as D1Database)
  }

  // Local development - use standard SQLite PrismaClient (singleton)
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createLocalClient()
  }
  return globalForPrisma.prisma
}

/**
 * Default export for backward compatibility with existing API routes.
 * In Cloudflare Workers, this will attempt to use D1 if available,
 * otherwise falls back to SQLite (which only works locally).
 */
export const db = getDb()

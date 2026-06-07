import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Lazily instantiates PrismaClient so the module can be imported at build time
 * (when DATABASE_URL is not available) without throwing. The client is created
 * the first time a property is accessed at runtime.
 */
function createPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

// Proxy-based lazy client: behaves exactly like PrismaClient but defers
// instantiation until the first property access (query, $connect, etc.)
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return (createPrismaClient() as any)[prop]
  },
})

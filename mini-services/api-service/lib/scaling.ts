/**
 * Distributed scaling utilities for BookMyService API
 * Provides multi-instance coordination, health-based load balancing,
 * and graceful shutdown handling
 */

// ─── Instance Identity ─────────────────────────────────────────────
export const INSTANCE_ID = process.env.INSTANCE_ID || `api-${process.pid}-${Date.now().toString(36)}`
export const INSTANCE_STARTED_AT = new Date().toISOString()

// ─── Graceful Shutdown Manager ─────────────────────────────────────
export class GracefulShutdownManager {
  private shutdownCallbacks: Array<() => Promise<void>> = []
  private isShuttingDown = false
  private shutdownTimeoutMs: number
  
  constructor(timeoutMs = 30000) {
    this.shutdownTimeoutMs = timeoutMs
  }
  
  register(callback: () => Promise<void>) { this.shutdownCallbacks.push(callback) }
  
  async shutdown(signal: string) {
    if (this.isShuttingDown) return
    this.isShuttingDown = true
    console.log(`\n${signal} received — graceful shutdown started (instance: ${INSTANCE_ID})`)
    
    // Stop accepting new connections
    // Wait for in-flight requests to complete
    const timeout = setTimeout(() => {
      console.error('⏰ Shutdown timeout — forcing exit')
      process.exit(1)
    }, this.shutdownTimeoutMs)
    
    // Run callbacks in reverse order
    for (const cb of this.shutdownCallbacks.reverse()) {
      try { await cb() } catch (e) { console.error('Shutdown callback error:', e) }
    }
    
    clearTimeout(timeout)
    console.log('✅ Graceful shutdown complete')
    process.exit(0)
  }
  
  get shuttingDown() { return this.isShuttingDown }
}

// ─── Readiness/Liveness Probes ─────────────────────────────────────
export interface HealthStatus {
  ready: boolean
  live: boolean
  details: {
    db: boolean
    redis: boolean
    queues: boolean
    shutdownInProgress: boolean
    uptime: number
    instanceId: string
  }
}

export function createHealthChecker(deps: {
  poolQuery: () => Promise<boolean>
  redisPing: () => Promise<boolean>
  queueReady: () => boolean
  shutdownManager: GracefulShutdownManager
}) {
  return async function checkHealth(): Promise<HealthStatus> {
    const [dbOk, redisOk] = await Promise.all([
      deps.poolQuery().catch(() => false),
      deps.redisPing().catch(() => false),
    ])
    const queueOk = deps.queueReady()
    const shuttingDown = deps.shutdownManager.shuttingDown
    
    return {
      ready: !shuttingDown, // Accepting traffic
      live: true, // Process is alive
      details: {
        db: dbOk,
        redis: redisOk,
        queues: queueOk,
        shutdownInProgress: shuttingDown,
        uptime: process.uptime(),
        instanceId: INSTANCE_ID,
      },
    }
  }
}

// ─── Connection Draining ───────────────────────────────────────────
export class ConnectionDrainer {
  private activeConnections = 0
  private maxConnections: number
  
  constructor(maxConnections = 1000) {
    this.maxConnections = maxConnections
  }
  
  increment() {
    if (this.activeConnections >= this.maxConnections) return false
    this.activeConnections++
    return true
  }
  
  decrement() { this.activeConnections = Math.max(0, this.activeConnections - 1) }
  
  get active() { return this.activeConnections }
  get atCapacity() { return this.activeConnections >= this.maxConnections }
}

// ─── Sticky Session Config ─────────────────────────────────────────
export function getStickySessionConfig() {
  return {
    cookieName: 'bys_instance',
    // For WebSocket connections, include instance ID in handshake
    instanceId: INSTANCE_ID,
  }
}

// ─── Default Singleton ──────────────────────────────────────────────
/** Default GracefulShutdownManager instance for the API service */
export const shutdownManager = new GracefulShutdownManager()

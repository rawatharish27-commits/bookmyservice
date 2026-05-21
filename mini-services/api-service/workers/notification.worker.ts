// ─── Notification Worker with Retry Logic ────────────────────────────────
// Enhanced notification worker that listens to queue jobs, sends notifications,
// and handles retry logic for failed jobs with dead-letter queue support.
//
// Flow:
//   Queue Job → Process → Success ✅
//                       → Failure → Retry (exponential backoff)
//                                 → Max retries exceeded → Dead Letter Queue
//
// Features:
//   - Configurable max retries per job type
//   - Exponential backoff between retries
//   - Dead letter queue for permanently failed jobs
//   - Job status tracking (pending, processing, succeeded, failed, dead)
//   - Failed job recovery endpoint
//   - Job metrics and monitoring
//   - Notification prioritization (URGENT/HIGH/NORMAL/LOW)
//   - Throttle for LOW priority notifications
//   - Provider SLA tracking with automatic fallback

import type { NotificationJobData } from '../queues'

// ─── Retry Configuration ───────────────────────────────────────────────
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 5_000,         // 5 seconds
  maxDelayMs: 60_000,         // 1 minute
  backoffMultiplier: 2,       // exponential
  deadLetterQueuePrefix: 'dlq:notifications',
} as const

// ─── Job Status Types ──────────────────────────────────────────────────
export type JobStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'retrying' | 'dead'

export interface TrackedJob {
  id: string
  type: NotificationJobData['type']
  template: string
  recipient: NotificationJobData['recipient']
  status: JobStatus
  attempts: number
  maxAttempts: number
  createdAt: number
  lastAttemptAt: number | null
  nextRetryAt: number | null
  lastError: string | null
  completedAt: number | null
}

// ─── In-Memory Job Tracker ─────────────────────────────────────────────
// Tracks job status for monitoring and recovery.
// In production with Redis, this would use a Redis hash for persistence.
class JobTracker {
  private jobs = new Map<string, TrackedJob>()
  private deadLetterQueue: TrackedJob[] = []
  private metrics = {
    totalProcessed: 0,
    totalSucceeded: 0,
    totalFailed: 0,
    totalDeadLettered: 0,
    totalRetries: 0,
  }

  track(jobData: NotificationJobData, jobId?: string): TrackedJob {
    const id = jobId || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const tracked: TrackedJob = {
      id,
      type: jobData.type,
      template: jobData.template,
      recipient: jobData.recipient,
      status: 'pending',
      attempts: 0,
      maxAttempts: RETRY_CONFIG.maxRetries + 1,
      createdAt: Date.now(),
      lastAttemptAt: null,
      nextRetryAt: null,
      lastError: null,
      completedAt: null,
    }
    this.jobs.set(id, tracked)
    return tracked
  }

  updateStatus(jobId: string, status: JobStatus, error?: string): void {
    const job = this.jobs.get(jobId)
    if (!job) return

    job.status = status
    job.lastAttemptAt = Date.now()

    if (status === 'processing') {
      job.attempts++
    } else if (status === 'succeeded') {
      job.completedAt = Date.now()
      this.metrics.totalSucceeded++
      this.metrics.totalProcessed++
    } else if (status === 'retrying') {
      job.nextRetryAt = Date.now() + this.calculateBackoff(job.attempts)
      this.metrics.totalRetries++
    } else if (status === 'dead') {
      job.completedAt = Date.now()
      job.lastError = error || 'Max retries exceeded'
      this.deadLetterQueue.push(job)
      this.metrics.totalDeadLettered++
      this.metrics.totalProcessed++
    } else if (status === 'failed') {
      job.lastError = error || null
      this.metrics.totalFailed++
    }
  }

  private calculateBackoff(attempt: number): number {
    const delay = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1)
    return Math.min(delay, RETRY_CONFIG.maxDelayMs)
  }

  getJob(jobId: string): TrackedJob | undefined {
    return this.jobs.get(jobId)
  }

  getDeadLetterJobs(): TrackedJob[] {
    return this.deadLetterQueue
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeJobs: [...this.jobs.values()].filter(j => j.status === 'processing' || j.status === 'retrying').length,
      pendingJobs: [...this.jobs.values()].filter(j => j.status === 'pending').length,
      deadLetterCount: this.deadLetterQueue.length,
    }
  }

  getRecentJobs(limit: number = 50): TrackedJob[] {
    return [...this.jobs.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  }

  // Recover a dead-lettered job by re-queuing it
  recoverJob(jobId: string): { success: boolean; message: string } {
    const dlqIndex = this.deadLetterQueue.findIndex(j => j.id === jobId)
    if (dlqIndex === -1) {
      return { success: false, message: 'Job not found in dead letter queue' }
    }

    const job = this.deadLetterQueue.splice(dlqIndex, 1)[0]
    job.status = 'pending'
    job.attempts = 0
    job.lastError = null
    job.nextRetryAt = null
    job.completedAt = null
    this.jobs.set(job.id, job)

    return { success: true, message: `Job ${jobId} recovered and re-queued` }
  }

  // Purge old completed/dead jobs from memory (keep last 1000)
  purge(): number {
    const completedJobs = [...this.jobs.values()]
      .filter(j => j.status === 'succeeded' || j.status === 'dead')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))

    if (completedJobs.length > 1000) {
      const toRemove = completedJobs.slice(1000)
      for (const job of toRemove) {
        this.jobs.delete(job.id)
      }
      return toRemove.length
    }
    return 0
  }
}

// ─── Singleton Job Tracker ─────────────────────────────────────────────
export const jobTracker = new JobTracker()

// ─── Notification Worker Processors ────────────────────────────────────
// Import the actual notification senders from the existing worker
import {
  sendWhatsAppNotification,
  sendSMSNotification,
  sendEmailNotification,
  sendPushNotification,
} from './notification-worker'

// ─── Process Notification with Retry ───────────────────────────────────
export async function processNotificationWithRetry(
  jobData: NotificationJobData,
  jobId?: string
): Promise<{ success: boolean; trackedJob: TrackedJob }> {
  const tracked = jobTracker.track(jobData, jobId)

  try {
    jobTracker.updateStatus(tracked.id, 'processing')

    const result = await dispatchNotification(jobData)

    if (result.success) {
      jobTracker.updateStatus(tracked.id, 'succeeded')
      return { success: true, trackedJob: tracked }
    }

    // First attempt failed — schedule retry
    return await handleRetry(tracked.id, jobData)

  } catch (err: any) {
    jobTracker.updateStatus(tracked.id, 'failed', err.message)
    return await handleRetry(tracked.id, jobData)
  }
}

// ─── Dispatch to Correct Channel ───────────────────────────────────────
async function dispatchNotification(
  jobData: NotificationJobData
): Promise<{ success: boolean; messageId?: string }> {
  const { type, recipient, template, data } = jobData

  // Check if channel is degraded and try fallback
  const primaryChannel = channelTypeToSLAKey(type)
  if (slaTracker.isChannelDegraded(primaryChannel)) {
    const fallbackChannel = slaTracker.getFallbackChannel(primaryChannel)
    if (fallbackChannel) {
      console.warn(`🔔 [WORKER] Channel ${primaryChannel} degraded — trying fallback ${fallbackChannel}`)
      const fallbackResult = await dispatchToChannel(fallbackChannel, recipient, template, data)
      if (fallbackResult.success) {
        return fallbackResult
      }
      // If fallback also fails, continue with original channel
      console.warn(`🔔 [WORKER] Fallback ${fallbackChannel} also failed — trying original ${primaryChannel}`)
    }
  }

  switch (type) {
    case 'WHATSAPP':
      return sendWhatsAppNotification(recipient, template, data)
    case 'SMS':
      return sendSMSNotification(recipient, template, data)
    case 'EMAIL':
      return sendEmailNotification(recipient, template, data)
    case 'PUSH':
      return sendPushNotification(recipient, template, data)
    default:
      console.warn(`🔔 [WORKER] Unknown notification type: ${type}`)
      return { success: false }
  }
}

// ─── Dispatch to a specific channel by name ────────────────────────────
async function dispatchToChannel(
  channel: string,
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string }> {
  switch (channel.toUpperCase()) {
    case 'WHATSAPP':
      return sendWhatsAppNotification(recipient, template, data)
    case 'SMS':
      return sendSMSNotification(recipient, template, data)
    case 'EMAIL':
      return sendEmailNotification(recipient, template, data)
    case 'PUSH':
      return sendPushNotification(recipient, template, data)
    default:
      return { success: false }
  }
}

// ─── Handle Retry Logic ────────────────────────────────────────────────
async function handleRetry(
  trackedJobId: string,
  jobData: NotificationJobData
): Promise<{ success: boolean; trackedJob: TrackedJob }> {
  const tracked = jobTracker.getJob(trackedJobId)
  if (!tracked) {
    return { success: false, trackedJob: tracked }
  }

  if (tracked.attempts >= tracked.maxAttempts) {
    // Max retries exceeded — move to dead letter queue
    jobTracker.updateStatus(trackedJobId, 'dead', tracked.lastError || 'Max retries exceeded')
    console.error(`🔔 [WORKER] Job ${trackedJobId} moved to DLQ after ${tracked.attempts} attempts`)

    return {
      success: false,
      trackedJob: jobTracker.getJob(trackedJobId)!,
    }
  }

  // Schedule retry with exponential backoff
  jobTracker.updateStatus(trackedJobId, 'retrying')
  const backoffMs = calculateBackoffDelay(tracked.attempts)

  console.log(`🔔 [WORKER] Retrying job ${trackedJobId} in ${backoffMs}ms (attempt ${tracked.attempts + 1}/${tracked.maxAttempts})`)

  // Wait for backoff period
  await sleep(backoffMs)

  try {
    jobTracker.updateStatus(trackedJobId, 'processing')
    const result = await dispatchNotification(jobData)

    if (result.success) {
      jobTracker.updateStatus(trackedJobId, 'succeeded')
      return { success: true, trackedJob: jobTracker.getJob(trackedJobId)! }
    }

    // Retry failed again — recurse
    return handleRetry(trackedJobId, jobData)

  } catch (err: any) {
    jobTracker.updateStatus(trackedJobId, 'failed', err.message)
    return handleRetry(trackedJobId, jobData)
  }
}

// ─── Utility Functions ─────────────────────────────────────────────────
function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1)
  // Add jitter (±20%) to avoid thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)
  return Math.min(Math.round(delay + jitter), RETRY_CONFIG.maxDelayMs)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Periodic Purge ────────────────────────────────────────────────────
// Purge old job records every 10 minutes to prevent memory leaks
setInterval(() => {
  const purged = jobTracker.purge()
  if (purged > 0) {
    console.log(`🔔 [WORKER] Purged ${purged} old job records`)
  }
}, 10 * 60 * 1000)

// ─── Export Worker Status ──────────────────────────────────────────────
export function getWorkerStatus() {
  const metrics = jobTracker.getMetrics()
  return {
    status: 'running',
    config: {
      maxRetries: RETRY_CONFIG.maxRetries,
      baseDelayMs: RETRY_CONFIG.baseDelayMs,
      maxDelayMs: RETRY_CONFIG.maxDelayMs,
      backoffMultiplier: RETRY_CONFIG.backoffMultiplier,
    },
    metrics,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ─── NOTIFICATION PRIORITIZATION ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// Priority levels
export const NOTIFICATION_PRIORITY = {
  URGENT: 1,  // OTP, security alerts
  HIGH: 2,    // Booking confirmations
  NORMAL: 3,  // General notifications
  LOW: 4,     // Marketing, promotions
} as const

export type NotificationPriorityLevel = typeof NOTIFICATION_PRIORITY[keyof typeof NOTIFICATION_PRIORITY]

// Template → Priority mapping
const TEMPLATE_PRIORITY_MAP: Record<string, number> = {
  // URGENT (1)
  otp_verification: NOTIFICATION_PRIORITY.URGENT,
  security_alert: NOTIFICATION_PRIORITY.URGENT,

  // HIGH (2)
  booking_confirmation: NOTIFICATION_PRIORITY.HIGH,
  booking_cancelled: NOTIFICATION_PRIORITY.HIGH,
  provider_assigned: NOTIFICATION_PRIORITY.HIGH,

  // NORMAL (3)
  booking_reminder: NOTIFICATION_PRIORITY.NORMAL,
  review_request: NOTIFICATION_PRIORITY.NORMAL,
  payment_received: NOTIFICATION_PRIORITY.NORMAL,

  // LOW (4)
  promotional_offer: NOTIFICATION_PRIORITY.LOW,
  newsletter: NOTIFICATION_PRIORITY.LOW,
  feature_update: NOTIFICATION_PRIORITY.LOW,
}

/**
 * Maps templates to priorities.
 * Returns NORMAL (3) for unknown templates.
 */
export function getPriorityForTemplate(template: string): number {
  return TEMPLATE_PRIORITY_MAP[template] || NOTIFICATION_PRIORITY.NORMAL
}

// ─── Throttle State ────────────────────────────────────────────────────
interface ThrottleState {
  lowPrioritySentToday: number
  limit: number
  nextResetAt: number
}

// In-memory throttle tracking: recipientId → { count, resetAt }
const throttleMap = new Map<string, { count: number; resetAt: number }>()
const LOW_PRIORITY_DAILY_LIMIT = 3

/**
 * Check if a LOW priority notification should be throttled for a recipient.
 * Rate limits LOW priority notifications to max 3 per day per user.
 */
export function shouldThrottleNotification(template: string, recipientId: string): boolean {
  const priority = getPriorityForTemplate(template)

  // Only throttle LOW priority notifications
  if (priority !== NOTIFICATION_PRIORITY.LOW) {
    return false
  }

  const now = Date.now()
  const state = throttleMap.get(recipientId)

  // If no state or reset window has passed, allow
  if (!state || now >= state.resetAt) {
    return false // Will be allowed; count will be updated on send
  }

  // Within current window — check count
  return state.count >= LOW_PRIORITY_DAILY_LIMIT
}

/**
 * Check throttle status for a recipient.
 */
export function getThrottleState(recipientId: string): ThrottleState {
  const now = Date.now()
  const state = throttleMap.get(recipientId)

  // Calculate next reset: midnight of next day
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const nextResetAt = tomorrow.getTime()

  if (!state || now >= state.resetAt) {
    return {
      lowPrioritySentToday: 0,
      limit: LOW_PRIORITY_DAILY_LIMIT,
      nextResetAt,
    }
  }

  return {
    lowPrioritySentToday: state.count,
    limit: LOW_PRIORITY_DAILY_LIMIT,
    nextResetAt: state.resetAt,
  }
}

/**
 * Record that a LOW priority notification was sent for a recipient.
 * Called internally after successful send.
 */
export function recordLowPrioritySent(recipientId: string): void {
  const now = Date.now()
  const state = throttleMap.get(recipientId)

  // Calculate next reset: midnight of next day
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const resetAt = tomorrow.getTime()

  if (!state || now >= state.resetAt) {
    throttleMap.set(recipientId, { count: 1, resetAt })
  } else {
    state.count++
  }
}

// Periodic cleanup of expired throttle entries (every hour)
setInterval(() => {
  const now = Date.now()
  for (const [key, state] of throttleMap.entries()) {
    if (now >= state.resetAt) {
      throttleMap.delete(key)
    }
  }
}, 60 * 60 * 1000)

// ═══════════════════════════════════════════════════════════════════════
// ─── PROVIDER SLA TRACKING ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export interface NotificationSLA {
  channel: string
  maxDeliveryTimeMs: number
  targetSuccessRate: number
  retryStrategy: string
}

// Default SLAs per channel
const NOTIFICATION_SLAS: Record<string, NotificationSLA> = {
  WHATSAPP: {
    channel: 'whatsapp',
    maxDeliveryTimeMs: 30_000,
    targetSuccessRate: 0.95,
    retryStrategy: 'exponential',
  },
  SMS: {
    channel: 'sms',
    maxDeliveryTimeMs: 15_000,
    targetSuccessRate: 0.99,
    retryStrategy: 'exponential',
  },
  EMAIL: {
    channel: 'email',
    maxDeliveryTimeMs: 60_000,
    targetSuccessRate: 0.98,
    retryStrategy: 'linear',
  },
  PUSH: {
    channel: 'push',
    maxDeliveryTimeMs: 10_000,
    targetSuccessRate: 0.90,
    retryStrategy: 'fixed',
  },
}

// Fallback channel mapping
const FALLBACK_CHANNELS: Record<string, string> = {
  WHATSAPP: 'SMS',
  SMS: 'EMAIL',
  PUSH: 'EMAIL',
  EMAIL: 'SMS',  // Email falls back to SMS
}

/**
 * Map notification type to SLA key
 */
function channelTypeToSLAKey(type: NotificationJobData['type']): string {
  return type // WHATSAPP, SMS, EMAIL, PUSH — same keys as NOTIFICATION_SLAS
}

/**
 * SLA Tracker class that tracks delivery times and success rates per channel.
 */
export class SLATracker {
  // Per-channel delivery tracking
  private channelStats = new Map<string, {
    deliveryTimes: number[]   // Last N delivery times in ms
    successCount: number
    failureCount: number
    totalSamples: number
  }>()

  private readonly MAX_SAMPLES_PER_CHANNEL = 500

  /**
   * Record a delivery attempt result for a channel.
   */
  recordDelivery(channel: string, deliveryTimeMs: number, success: boolean): void {
    const key = channel.toUpperCase()
    let stats = this.channelStats.get(key)

    if (!stats) {
      stats = {
        deliveryTimes: [],
        successCount: 0,
        failureCount: 0,
        totalSamples: 0,
      }
      this.channelStats.set(key, stats)
    }

    stats.deliveryTimes.push(deliveryTimeMs)
    stats.totalSamples++

    if (success) {
      stats.successCount++
    } else {
      stats.failureCount++
    }

    // Keep only recent samples
    if (stats.deliveryTimes.length > this.MAX_SAMPLES_PER_CHANNEL) {
      stats.deliveryTimes.shift()
    }
  }

  /**
   * Get SLA status for all channels.
   */
  getSLAStatus(): Record<string, {
    avgDeliveryTimeMs: number
    successRate: number
    meetsSLA: boolean
    samples: number
  }> {
    const result: Record<string, {
      avgDeliveryTimeMs: number
      successRate: number
      meetsSLA: boolean
      samples: number
    }> = {}

    for (const [channel, stats] of this.channelStats.entries()) {
      const avgDeliveryTimeMs = stats.deliveryTimes.length > 0
        ? Math.round(stats.deliveryTimes.reduce((a, b) => a + b, 0) / stats.deliveryTimes.length)
        : 0

      const successRate = stats.totalSamples > 0
        ? stats.successCount / stats.totalSamples
        : 1.0

      const sla = NOTIFICATION_SLAS[channel]
      const meetsSLA = sla
        ? avgDeliveryTimeMs <= sla.maxDeliveryTimeMs && successRate >= sla.targetSuccessRate
        : true

      result[channel] = {
        avgDeliveryTimeMs,
        successRate: Math.round(successRate * 1000) / 1000, // 3 decimal places
        meetsSLA,
        samples: stats.totalSamples,
      }
    }

    // Include channels with no data yet
    for (const channel of Object.keys(NOTIFICATION_SLAS)) {
      if (!result[channel]) {
        const sla = NOTIFICATION_SLAS[channel]
        result[channel] = {
          avgDeliveryTimeMs: 0,
          successRate: 1.0,
          meetsSLA: true,
          samples: 0,
        }
      }
    }

    return result
  }

  /**
   * Returns true if success rate drops below SLA target for the channel.
   * Requires at least 10 samples before declaring degradation.
   */
  isChannelDegraded(channel: string): boolean {
    const key = channel.toUpperCase()
    const stats = this.channelStats.get(key)
    const sla = NOTIFICATION_SLAS[key]

    if (!stats || !sla) return false

    // Need at least 10 samples before declaring degradation
    if (stats.totalSamples < 10) return false

    const successRate = stats.successCount / stats.totalSamples
    return successRate < sla.targetSuccessRate
  }

  /**
   * Returns a fallback channel if primary is degraded.
   * Returns null if no fallback is available or primary is not degraded.
   */
  getFallbackChannel(primaryChannel: string): string | null {
    const key = primaryChannel.toUpperCase()

    if (!this.isChannelDegraded(key)) {
      return null
    }

    const fallback = FALLBACK_CHANNELS[key]
    if (!fallback) return null

    // Check if fallback is also degraded
    if (this.isChannelDegraded(fallback)) {
      // Try second-level fallback
      const secondFallback = FALLBACK_CHANNELS[fallback]
      if (secondFallback && !this.isChannelDegraded(secondFallback)) {
        return secondFallback
      }
      return null
    }

    return fallback
  }

  /**
   * Get the SLA definition for a channel.
   */
  getSLADefinition(channel: string): NotificationSLA | undefined {
    return NOTIFICATION_SLAS[channel.toUpperCase()]
  }

  /**
   * Get all SLA definitions.
   */
  getAllSLAs(): Record<string, NotificationSLA> {
    return { ...NOTIFICATION_SLAS }
  }
}

// ─── Singleton SLA Tracker ─────────────────────────────────────────────
export const slaTracker = new SLATracker()

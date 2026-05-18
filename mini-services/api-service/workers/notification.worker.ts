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

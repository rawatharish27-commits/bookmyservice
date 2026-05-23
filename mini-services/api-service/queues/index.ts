import { Queue, QueueEvents, Worker, Job } from 'bullmq'

// ─── Queue System Configuration ────────────────────────────────────────
// BullMQ queue system for async processing of heavy tasks.
// Keeps the API fast by offloading notifications, emails, invoices,
// referral rewards, and analytics to background workers.
//
// Architecture:
//   API Route → Save to DB → Push Queue Job → Return Success
//                                       ↓
//                               Worker Processes Job
//
// IMPORTANT: BullMQ requires a real Redis connection.
// If REDIS_URL is not set, jobs are processed synchronously (fallback).

const REDIS_URL = process.env.REDIS_URL
const redisConnection = REDIS_URL ? {
  host: new URL(REDIS_URL).hostname,
  port: parseInt(new URL(REDIS_URL).port || '6379'),
  password: new URL(REDIS_URL).password || undefined,
  db: parseInt(new URL(REDIS_URL).pathname.slice(1) || '0'),
} : null

// ─── Queue Names ───────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  NOTIFICATION: 'bys:notifications',
  BOOKING_PROCESSING: 'bys:booking-processing',
} as const

// ─── Job Types ─────────────────────────────────────────────────────────
export interface NotificationJobData {
  type: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH'
  recipient: {
    userId?: string
    email?: string
    phone?: string
    name?: string
  }
  template: string
  data: Record<string, any>
  priority?: number // 1 = highest, 5 = lowest
}

export interface BookingProcessingJobData {
  type: 'INVOICE' | 'REFERRAL_REWARD' | 'ANALYTICS' | 'BOOKING_CONFIRMATION'
  bookingId: string
  data: Record<string, any>
  priority?: number
}

// ─── Queue Instances (lazy initialization) ─────────────────────────────
let notificationQueue: Queue<NotificationJobData> | null = null
let bookingQueue: Queue<BookingProcessingJobData> | null = null
let notificationWorker: Worker<NotificationJobData> | null = null
let bookingWorker: Worker<BookingProcessingJobData> | null = null
let isQueueSystemReady = false

function getConnectionConfig() {
  if (!redisConnection) return null
  return {
    connection: {
      host: redisConnection.host,
      port: redisConnection.port,
      password: redisConnection.password,
      db: redisConnection.db,
    },
  }
}

// ─── Initialize Queues ─────────────────────────────────────────────────
export async function initializeQueues(): Promise<void> {
  const config = getConnectionConfig()
  if (!config) {
    console.log('📮 Queue system: REDIS_URL not set — jobs will be processed synchronously (fallback)')
    isQueueSystemReady = false
    return
  }

  try {
    // Create notification queue
    notificationQueue = new Queue<NotificationJobData>(QUEUE_NAMES.NOTIFICATION, config)

    // Create booking processing queue
    bookingQueue = new Queue<BookingProcessingJobData>(QUEUE_NAMES.BOOKING_PROCESSING, config)

    // Create dead letter queue
    deadLetterQueue = new Queue(DEAD_LETTER_QUEUE_NAME, config)

    isQueueSystemReady = true
    console.log('📮 Queue system: Connected to Redis — async processing enabled')
  } catch (err: any) {
    console.warn('📮 Queue system: Failed to connect — falling back to sync processing:', err.message)
    isQueueSystemReady = false
  }
}

// ─── Queue Status ──────────────────────────────────────────────────────
export function getQueueStatus(): { ready: boolean; backend: string } {
  return {
    ready: isQueueSystemReady,
    backend: isQueueSystemReady ? 'bullmq-redis' : 'synchronous-fallback',
  }
}

// ─── Push Notification Job ─────────────────────────────────────────────
export async function pushNotificationJob(jobData: NotificationJobData): Promise<void> {
  if (isQueueSystemReady && notificationQueue) {
    // Async: Push to BullMQ queue
    await notificationQueue.add(jobData.type, jobData, {
      priority: jobData.priority || 3,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
      ...(deadLetterQueue ? {
        deadLetterQueue: { queue: deadLetterQueue, maxRetries: 3 },
      } : {}),
    })
  } else {
    // Sync fallback: Process immediately
    await processNotificationJob(jobData)
  }
}

// ─── Push Booking Processing Job ───────────────────────────────────────
export async function pushBookingJob(jobData: BookingProcessingJobData): Promise<void> {
  if (isQueueSystemReady && bookingQueue) {
    // Async: Push to BullMQ queue
    await bookingQueue.add(jobData.type, jobData, {
      priority: jobData.priority || 3,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
      ...(deadLetterQueue ? {
        deadLetterQueue: { queue: deadLetterQueue, maxRetries: 3 },
      } : {}),
    })
  } else {
    // Sync fallback: Process immediately
    await processBookingJob(jobData)
  }
}

// ─── Notification Job Processor ────────────────────────────────────────
export async function processNotificationJob(job: NotificationJobData): Promise<void> {
  const { type, recipient, template, data } = job

  switch (type) {
    case 'WHATSAPP':
      await sendWhatsApp(recipient, template, data)
      break
    case 'SMS':
      await sendSMS(recipient, template, data)
      break
    case 'EMAIL':
      await sendEmail(recipient, template, data)
      break
    case 'PUSH':
      await sendPushNotification(recipient, template, data)
      break
    default:
      console.warn(`📮 Unknown notification type: ${type}`)
  }
}

// ─── Booking Job Processor ─────────────────────────────────────────────
export async function processBookingJob(job: BookingProcessingJobData): Promise<void> {
  const { type, bookingId, data } = job

  switch (type) {
    case 'INVOICE':
      await generateInvoice(bookingId, data)
      break
    case 'REFERRAL_REWARD':
      await processReferralReward(bookingId, data)
      break
    case 'ANALYTICS':
      await updateAnalytics(bookingId, data)
      break
    case 'BOOKING_CONFIRMATION':
      await sendBookingConfirmation(bookingId, data)
      break
    default:
      console.warn(`📮 Unknown booking job type: ${type}`)
  }
}

// ─── Notification Senders (Stub Implementations) ───────────────────────
// These are placeholder implementations. Replace with real integrations:
//   - WhatsApp: Twilio API / WhatsApp Business API
//   - SMS: Twilio / MSG91 / AWS SNS
//   - Email: SendGrid / AWS SES / Nodemailer
//   - Push: Firebase Cloud Messaging / OneSignal

async function sendWhatsApp(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<void> {
  // TODO: Integrate with WhatsApp Business API (Twilio, etc.)
  console.log(`📮 [WHATSAPP] To: ${recipient.phone || recipient.userId} | Template: ${template}`, {
    name: recipient.name,
    ...data,
  })
}

async function sendSMS(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<void> {
  // TODO: Integrate with SMS provider (Twilio, MSG91, etc.)
  console.log(`📮 [SMS] To: ${recipient.phone || recipient.userId} | Template: ${template}`, {
    name: recipient.name,
    ...data,
  })
}

async function sendEmail(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<void> {
  // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
  console.log(`📮 [EMAIL] To: ${recipient.email || recipient.userId} | Template: ${template}`, {
    name: recipient.name,
    ...data,
  })
}

async function sendPushNotification(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<void> {
  // TODO: Integrate with FCM / OneSignal
  console.log(`📮 [PUSH] To: ${recipient.userId} | Template: ${template}`, data)
}

// ─── Booking Processors ────────────────────────────────────────────────

async function generateInvoice(bookingId: string, data: Record<string, any>): Promise<void> {
  // TODO: Generate PDF invoice and store in cloud storage
  console.log(`📮 [INVOICE] Booking: ${bookingId}`, data)
}

async function processReferralReward(bookingId: string, data: Record<string, any>): Promise<void> {
  // TODO: Check if booking came from referral, credit rewards
  console.log(`📮 [REFERRAL] Booking: ${bookingId}`, data)
}

async function updateAnalytics(bookingId: string, data: Record<string, any>): Promise<void> {
  // TODO: Update platform analytics, category stats, provider metrics
  console.log(`📮 [ANALYTICS] Booking: ${bookingId}`, data)
}

async function sendBookingConfirmation(bookingId: string, data: Record<string, any>): Promise<void> {
  // Send multi-channel confirmation
  const { clientName, clientEmail, clientPhone, providerName, serviceName, scheduledDate } = data

  // Email to client
  if (clientEmail) {
    await sendEmail(
      { email: clientEmail, name: clientName },
      'booking_confirmation',
      { serviceName, providerName, scheduledDate, bookingId }
    )
  }

  // SMS to client
  if (clientPhone) {
    await sendSMS(
      { phone: clientPhone, name: clientName },
      'booking_confirmation',
      { serviceName, providerName, scheduledDate, bookingId }
    )
  }

  // WhatsApp to client
  if (clientPhone) {
    await sendWhatsApp(
      { phone: clientPhone, name: clientName },
      'booking_confirmation',
      { serviceName, providerName, scheduledDate, bookingId }
    )
  }

  console.log(`📮 [BOOKING_CONFIRMATION] Booking: ${bookingId} — notifications dispatched`)
}

// ─── Start Workers (if Redis available) ────────────────────────────────
export async function startWorkers(): Promise<void> {
  const config = getConnectionConfig()
  if (!config || !isQueueSystemReady) return

  try {
    // Notification worker
    notificationWorker = new Worker<NotificationJobData>(
      QUEUE_NAMES.NOTIFICATION,
      async (job: Job<NotificationJobData>) => {
        await processNotificationJob(job.data)
      },
      {
        connection: config.connection,
        concurrency: getNotificationConcurrency(),
      }
    )

    notificationWorker.on('completed', (job) => {
      console.log(`📮 [NOTIFICATION] Job ${job.id} completed: ${job.data.type}`)
    })

    notificationWorker.on('failed', (job, err) => {
      console.warn(`📮 [NOTIFICATION] Job ${job?.id} failed:`, err.message)
    })

    // Booking processing worker
    const bookingConcurrency = getBookingConcurrency()
    bookingWorker = new Worker<BookingProcessingJobData>(
      QUEUE_NAMES.BOOKING_PROCESSING,
      async (job: Job<BookingProcessingJobData>) => {
        await processBookingJob(job.data)
      },
      {
        connection: config.connection,
        concurrency: bookingConcurrency,
      }
    )

    bookingWorker.on('completed', (job) => {
      console.log(`📮 [BOOKING] Job ${job.id} completed: ${job.data.type}`)
    })

    bookingWorker.on('failed', (job, err) => {
      console.warn(`📮 [BOOKING] Job ${job?.id} failed:`, err.message)
    })

    console.log(`📮 Workers started: notifications (concurrency: ${getNotificationConcurrency()}), bookings (concurrency: ${getBookingConcurrency()})`)
  } catch (err: any) {
    console.warn('📮 Workers failed to start:', err.message)
  }
}

// ─── Graceful Shutdown ─────────────────────────────────────────────────
export async function shutdownQueues(): Promise<void> {
  console.log('📮 Shutting down queue system...')
  await notificationWorker?.close()
  await bookingWorker?.close()
  await notificationQueue?.close()
  await bookingQueue?.close()
  await deadLetterQueue?.close()
  console.log('📮 Queue system shut down')
}

// ═══════════════════════════════════════════════════════════════════════
// ─── DEAD LETTER QUEUE ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export const DEAD_LETTER_QUEUE_NAME = 'bys:dead-letter'

export let deadLetterQueue: Queue | null = null

/**
 * Processes DLQ entries, logs them, and optionally retries them.
 * DLQ jobs are inspected, logged, and can be retried based on error type.
 */
export async function processDeadLetterQueue(): Promise<void> {
  if (!deadLetterQueue || !isQueueSystemReady) {
    console.log('📮 DLQ: Not available (no Redis connection)')
    return
  }

  try {
    const failedJobs = await deadLetterQueue.getFailed()
    console.log(`📮 DLQ: Processing ${failedJobs.length} dead letter entries`)

    for (const job of failedJobs) {
      const jobData = job.data
      console.warn(`📮 DLQ: Job ${job.id} in DLQ — ${job.failedReason || 'unknown reason'}`, {
        jobId: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
        data: typeof jobData === 'object' ? JSON.stringify(jobData).slice(0, 500) : jobData,
      })
    }
  } catch (err: any) {
    console.error('📮 DLQ: Error processing dead letter queue:', err.message)
  }
}

/**
 * Returns count of DLQ entries.
 */
export async function getDeadLetterCount(): Promise<number> {
  if (!deadLetterQueue || !isQueueSystemReady) return 0

  try {
    const counts = await deadLetterQueue.getJobCounts('failed', 'waiting', 'active', 'delayed')
    return counts.failed + counts.waiting + counts.active + counts.delayed
  } catch (err: any) {
    console.error('📮 DLQ: Error getting count:', err.message)
    return 0
  }
}

/**
 * Removes all DLQ entries. Returns the number of entries purged.
 */
export async function purgeDeadLetterQueue(): Promise<number> {
  if (!deadLetterQueue || !isQueueSystemReady) return 0

  try {
    const failedJobs = await deadLetterQueue.getFailed()
    const waitingJobs = await deadLetterQueue.getWaiting()
    const allJobs = [...failedJobs, ...waitingJobs]
    let purged = 0

    for (const job of allJobs) {
      await job.remove()
      purged++
    }

    // Also obliterate completed jobs
    await deadLetterQueue.obliterate({ force: true })

    console.log(`📮 DLQ: Purged ${purged} entries`)
    return purged
  } catch (err: any) {
    console.error('📮 DLQ: Error purging:', err.message)
    return 0
  }
}

/**
 * Re-queues a specific DLQ job by moving it back to its original queue.
 * Returns true if the job was successfully retried.
 */
export async function retryDeadLetterJob(jobId: string): Promise<boolean> {
  if (!deadLetterQueue || !isQueueSystemReady) return false

  try {
    const job = await deadLetterQueue.getJob(jobId)
    if (!job) {
      console.warn(`📮 DLQ: Job ${jobId} not found`)
      return false
    }

    const jobData = job.data
    const jobName = job.name

    // Determine which queue to re-queue to based on job name
    if (notificationQueue && (jobName === 'WHATSAPP' || jobName === 'SMS' || jobName === 'EMAIL' || jobName === 'PUSH')) {
      await notificationQueue.add(jobName, jobData as NotificationJobData, {
        priority: 3,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      })
    } else if (bookingQueue) {
      await bookingQueue.add(jobName, jobData as BookingProcessingJobData, {
        priority: 3,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      })
    } else {
      console.warn(`📮 DLQ: No target queue available for retry of job ${jobId}`)
      return false
    }

    // Remove from DLQ after successful re-queue
    await job.remove()
    console.log(`📮 DLQ: Job ${jobId} re-queued successfully`)
    return true
  } catch (err: any) {
    console.error(`📮 DLQ: Error retrying job ${jobId}:`, err.message)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ─── RETRY POLICY TUNING ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export interface RetryPolicy {
  maxRetries: number
  backoffType: 'exponential' | 'linear' | 'fixed'
  initialDelayMs: number
  maxDelayMs: number
  jitterMs: number
}

// Default retry policies for each job type
const DEFAULT_RETRY_POLICIES: Record<string, RetryPolicy> = {
  NOTIFICATION: {
    maxRetries: 5,
    backoffType: 'exponential',
    initialDelayMs: 5000,
    maxDelayMs: 300000,
    jitterMs: 1000,
  },
  BOOKING: {
    maxRetries: 3,
    backoffType: 'exponential',
    initialDelayMs: 2000,
    maxDelayMs: 60000,
    jitterMs: 500,
  },
}

// Runtime mutable retry policies (starts with defaults)
const runtimeRetryPolicies: Record<string, RetryPolicy> = { ...DEFAULT_RETRY_POLICIES }

/**
 * Update retry policy at runtime for a given job type.
 */
export function setRetryPolicy(jobType: string, policy: RetryPolicy): void {
  runtimeRetryPolicies[jobType] = { ...policy }
  console.log(`📮 Retry policy updated for ${jobType}:`, policy)
}

/**
 * Get current retry policy for a given job type.
 * Falls back to NOTIFICATION policy if the job type has no specific policy.
 */
export function getRetryPolicy(jobType: string): RetryPolicy {
  return runtimeRetryPolicies[jobType] || runtimeRetryPolicies['NOTIFICATION'] || {
    maxRetries: 3,
    backoffType: 'exponential' as const,
    initialDelayMs: 5000,
    maxDelayMs: 300000,
    jitterMs: 1000,
  }
}

/**
 * Calculates the backoff delay for a given attempt based on the retry policy.
 */
export function calculateBackoffDelayForPolicy(attempt: number, policy: RetryPolicy): number {
  let delay: number

  switch (policy.backoffType) {
    case 'exponential':
      delay = policy.initialDelayMs * Math.pow(2, attempt - 1)
      break
    case 'linear':
      delay = policy.initialDelayMs * attempt
      break
    case 'fixed':
    default:
      delay = policy.initialDelayMs
      break
  }

  // Cap at max delay
  delay = Math.min(delay, policy.maxDelayMs)

  // Add jitter to avoid thundering herd
  if (policy.jitterMs > 0) {
    const jitter = Math.random() * policy.jitterMs * 2 - policy.jitterMs
    delay = Math.max(0, delay + jitter)
  }

  return Math.round(delay)
}

// ═══════════════════════════════════════════════════════════════════════
// ─── QUEUE METRICS DASHBOARD ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export interface QueueMetricsDetail {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  dlqCount: number
}

export interface QueueMetrics {
  notification: QueueMetricsDetail
  booking: QueueMetricsDetail
  totalProcessed: number
  totalFailed: number
  avgProcessingTimeMs: number
  isHealthy: boolean
}

// In-memory metrics tracking for processing time
const processingTimeSamples: number[] = []
const MAX_PROCESSING_SAMPLES = 1000

/**
 * Record a processing time sample for metrics calculation.
 */
export function recordProcessingTime(durationMs: number): void {
  processingTimeSamples.push(durationMs)
  if (processingTimeSamples.length > MAX_PROCESSING_SAMPLES) {
    processingTimeSamples.shift()
  }
}

/**
 * Returns comprehensive metrics for all queues.
 * Uses BullMQ's built-in queue.getJobCounts() for queue-level metrics.
 */
export async function getQueueMetrics(): Promise<QueueMetrics> {
  const emptyDetail: QueueMetricsDetail = {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    dlqCount: 0,
  }

  if (!isQueueSystemReady || !notificationQueue || !bookingQueue) {
    return {
      notification: { ...emptyDetail },
      booking: { ...emptyDetail },
      totalProcessed: 0,
      totalFailed: 0,
      avgProcessingTimeMs: 0,
      isHealthy: false,
    }
  }

  try {
    // Get job counts for each queue
    const [notifCounts, bookingCounts, dlqCount] = await Promise.all([
      notificationQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      bookingQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      getDeadLetterCount(),
    ])

    const notificationDetail: QueueMetricsDetail = {
      waiting: notifCounts.waiting || 0,
      active: notifCounts.active || 0,
      completed: notifCounts.completed || 0,
      failed: notifCounts.failed || 0,
      delayed: notifCounts.delayed || 0,
      dlqCount,
    }

    const bookingDetail: QueueMetricsDetail = {
      waiting: bookingCounts.waiting || 0,
      active: bookingCounts.active || 0,
      completed: bookingCounts.completed || 0,
      failed: bookingCounts.failed || 0,
      delayed: bookingCounts.delayed || 0,
      dlqCount,
    }

    const totalProcessed = notificationDetail.completed + bookingDetail.completed
    const totalFailed = notificationDetail.failed + bookingDetail.failed
    const avgProcessingTimeMs = processingTimeSamples.length > 0
      ? Math.round(processingTimeSamples.reduce((a, b) => a + b, 0) / processingTimeSamples.length)
      : 0

    // Health check: unhealthy if too many failed or if queues are overwhelmed
    const isHealthy = totalFailed < 100
      && notificationDetail.waiting < 5000
      && bookingDetail.waiting < 5000

    return {
      notification: notificationDetail,
      booking: bookingDetail,
      totalProcessed,
      totalFailed,
      avgProcessingTimeMs,
      isHealthy,
    }
  } catch (err: any) {
    console.error('📮 Metrics: Error collecting queue metrics:', err.message)
    return {
      notification: { ...emptyDetail },
      booking: { ...emptyDetail },
      totalProcessed: 0,
      totalFailed: 0,
      avgProcessingTimeMs: 0,
      isHealthy: false,
    }
  }
}

// Metrics collection interval handle
let metricsCollectionInterval: ReturnType<typeof setInterval> | null = null

/**
 * Starts periodic metrics collection (default: every 30 seconds).
 * Stores metrics in Redis key bys:queue:metrics:{timestamp}.
 */
export function startMetricsCollection(intervalMs: number = 30_000): void {
  if (metricsCollectionInterval) {
    clearInterval(metricsCollectionInterval)
  }

  metricsCollectionInterval = setInterval(async () => {
    try {
      const metrics = await getQueueMetrics()
      const timestamp = Date.now()

      // If we have Redis, store metrics
      if (isQueueSystemReady && notificationQueue) {
        const redis = (notificationQueue as any).client
        if (redis && typeof redis.set === 'function') {
          const key = `bys:queue:metrics:${timestamp}`
          await redis.set(key, JSON.stringify(metrics), 'EX', 3600) // TTL: 1 hour
        }
      }
    } catch (err: any) {
      console.error('📮 Metrics collection error:', err.message)
    }
  }, intervalMs)

  console.log(`📮 Metrics collection started (every ${intervalMs}ms)`)
}

/**
 * Stops periodic metrics collection.
 */
export function stopMetricsCollection(): void {
  if (metricsCollectionInterval) {
    clearInterval(metricsCollectionInterval)
    metricsCollectionInterval = null
    console.log('📮 Metrics collection stopped')
  }
}

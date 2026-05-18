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
        concurrency: 5,
      }
    )

    notificationWorker.on('completed', (job) => {
      console.log(`📮 [NOTIFICATION] Job ${job.id} completed: ${job.data.type}`)
    })

    notificationWorker.on('failed', (job, err) => {
      console.warn(`📮 [NOTIFICATION] Job ${job?.id} failed:`, err.message)
    })

    // Booking processing worker
    bookingWorker = new Worker<BookingProcessingJobData>(
      QUEUE_NAMES.BOOKING_PROCESSING,
      async (job: Job<BookingProcessingJobData>) => {
        await processBookingJob(job.data)
      },
      {
        connection: config.connection,
        concurrency: 3,
      }
    )

    bookingWorker.on('completed', (job) => {
      console.log(`📮 [BOOKING] Job ${job.id} completed: ${job.data.type}`)
    })

    bookingWorker.on('failed', (job, err) => {
      console.warn(`📮 [BOOKING] Job ${job?.id} failed:`, err.message)
    })

    console.log('📮 Workers started: notifications (concurrency: 5), bookings (concurrency: 3)')
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
  console.log('📮 Queue system shut down')
}

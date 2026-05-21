// ─── Firebase Cloud Messaging (FCM) Integration ─────────────────────────
// Handles push notification delivery via Firebase Cloud Messaging.
// Supports both single-device and multi-device (topic) messaging.
//
// Setup:
//   1. Create a Firebase project at https://console.firebase.google.com
//   2. Enable Cloud Messaging in the Firebase console
//   3. Generate a private key (Service Account) from Project Settings
//   4. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars
//   5. Frontend registers for push and sends the FCM token to /api/devices/token
//
// Fallback:
//   If Firebase credentials are not configured, push notifications are logged
//   as stubs — the app continues to work normally.

import * as admin from 'firebase-admin'

// ─── Firebase App Initialization ────────────────────────────────────────
let firebaseApp: admin.app.App | null = null
let messagingInstance: admin.messaging.Messaging | null = null
let isInitialized = false
let initError: string | null = null

function initializeFirebase(): void {
  if (isInitialized) return

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    initError = 'Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY env vars'
    console.log(`🔔 [FCM] Not configured — push notifications will be logged as stubs. Set Firebase env vars to enable.`)
    isInitialized = true
    return
  }

  try {
    // Handle escaped newlines in private key (common with env vars)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    })

    messagingInstance = admin.messaging()
    isInitialized = true
    console.log('🔔 [FCM] Firebase Cloud Messaging initialized successfully')
  } catch (err: any) {
    initError = err.message
    console.warn('🔔 [FCM] Initialization failed — push will be stubs:', err.message)
    isInitialized = true
  }
}

// Initialize on module load
initializeFirebase()

// ─── FCM Status ────────────────────────────────────────────────────────
export function getFCMStatus(): { initialized: boolean; error: string | null } {
  return {
    initialized: messagingInstance !== null,
    error: initError,
  }
}

// ─── Send Push to Single Device ────────────────────────────────────────
export interface PushMessage {
  token: string                    // FCM device token
  title: string                    // Notification title
  body: string                     // Notification body
  icon?: string                    // Icon URL
  image?: string                   // Image URL for rich notifications
  clickAction?: string             // URL to open on click
  data?: Record<string, string>    // Custom key-value data payload
  tag?: string                     // Notification group tag (replaces previous)
  badge?: string                   // iOS badge count
}

export interface PushResult {
  success: boolean
  messageId?: string
  error?: string
  invalidToken?: boolean           // True if token should be removed
}

export async function sendPushToDevice(message: PushMessage): Promise<PushResult> {
  if (!messagingInstance) {
    // Stub mode — no Firebase credentials
    console.log(`🔔 [PUSH STUB] To: ${message.token?.slice(0, 20)}... | ${message.title}: ${message.body}`)
    return { success: true, messageId: `stub-push-${Date.now()}` }
  }

  try {
    const messageId = await messagingInstance.send({
      token: message.token,
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.image,
      },
      android: {
        priority: 'high',
        notification: {
          icon: message.icon || 'ic_notification',
          clickAction: message.clickAction,
          tag: message.tag,
          channelId: 'bookmyservice_notifications',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: message.badge ? parseInt(message.badge) : undefined,
            sound: 'default',
            category: message.clickAction,
          },
        },
      },
      webpush: {
        notification: {
          icon: message.icon,
          image: message.image,
          clickAction: message.clickAction,
          badge: message.badge,
        },
      },
      data: message.data || {},
    })

    return { success: true, messageId }
  } catch (err: any) {
    const errorCode = err.code || err.errorInfo?.code || ''

    // Check if the token is invalid/unregistered — should be removed from DB
    const isInvalidToken =
      errorCode === 'messaging/invalid-registration-token' ||
      errorCode === 'messaging/registration-token-not-registered' ||
      err.message?.includes('NotRegistered') ||
      err.message?.includes('InvalidRegistration')

    console.error(`🔔 [FCM] Send failed: ${err.message}`, { token: message.token?.slice(0, 20), errorCode })

    return {
      success: false,
      error: err.message,
      invalidToken: isInvalidToken,
    }
  }
}

// ─── Send Push to Multiple Devices ─────────────────────────────────────
export interface MulticastResult {
  successCount: number
  failureCount: number
  invalidTokens: string[]         // Tokens that should be removed
}

export async function sendPushToDevices(
  tokens: string[],
  message: Omit<PushMessage, 'token'>
): Promise<MulticastResult> {
  if (!messagingInstance || tokens.length === 0) {
    // Stub mode
    console.log(`🔔 [PUSH STUB] To ${tokens.length} device(s) | ${message.title}: ${message.body}`)
    return { successCount: tokens.length, failureCount: 0, invalidTokens: [] }
  }

  try {
    const response = await messagingInstance.sendEachForMulticast({
      tokens,
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.image,
      },
      android: {
        priority: 'high',
        notification: {
          icon: message.icon || 'ic_notification',
          clickAction: message.clickAction,
          tag: message.tag,
          channelId: 'bookmyservice_notifications',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: message.badge ? parseInt(message.badge) : undefined,
            sound: 'default',
          },
        },
      },
      data: message.data || {},
    })

    const invalidTokens: string[] = []
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code || ''
        const isInvalid =
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'

        if (isInvalid) {
          invalidTokens.push(tokens[idx])
        }
      }
    })

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    }
  } catch (err: any) {
    console.error(`🔔 [FCM] Multicast failed:`, err.message)
    return { successCount: 0, failureCount: tokens.length, invalidTokens: [] }
  }
}

// ─── Send Push to Topic (e.g., providers in a city) ───────────────────
export async function sendPushToTopic(
  topic: string,
  message: Omit<PushMessage, 'token'>
): Promise<PushResult> {
  if (!messagingInstance) {
    console.log(`🔔 [PUSH STUB] To topic: ${topic} | ${message.title}: ${message.body}`)
    return { success: true, messageId: `stub-topic-${Date.now()}` }
  }

  try {
    const messageId = await messagingInstance.send({
      topic,
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.image,
      },
      android: {
        priority: 'high',
        notification: {
          icon: message.icon || 'ic_notification',
          clickAction: message.clickAction,
          channelId: 'bookmyservice_notifications',
          sound: 'default',
        },
      },
      data: message.data || {},
    })

    return { success: true, messageId }
  } catch (err: any) {
    console.error(`🔔 [FCM] Topic send failed:`, err.message)
    return { success: false, error: err.message }
  }
}

// ─── Subscribe/Unsubscribe Tokens to Topic ─────────────────────────────
export async function subscribeToTopic(tokens: string[], topic: string): Promise<number> {
  if (!messagingInstance || tokens.length === 0) return 0

  try {
    const result = await messagingInstance.subscribeToTopic(tokens, topic)
    return result.successCount
  } catch (err: any) {
    console.error(`🔔 [FCM] Subscribe failed:`, err.message)
    return 0
  }
}

export async function unsubscribeFromTopic(tokens: string[], topic: string): Promise<number> {
  if (!messagingInstance || tokens.length === 0) return 0

  try {
    const result = await messagingInstance.unsubscribeFromTopic(tokens, topic)
    return result.successCount
  } catch (err: any) {
    console.error(`🔔 [FCM] Unsubscribe failed:`, err.message)
    return 0
  }
}

// ─── Booking Event Push Notification Templates ─────────────────────────
// Pre-built notification templates for booking lifecycle events

export const BookingPushTemplates = {
  bookingConfirmed: (data: {
    serviceName: string
    providerName: string
    scheduledDate: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '✅ Booking Confirmed!',
    body: `${data.serviceName} with ${data.providerName} on ${data.scheduledDate}`,
    data: {
      type: 'BOOKING_CONFIRMED',
      bookingId: data.bookingId,
      clickAction: '/bookings/' + data.bookingId,
    },
    tag: `booking-${data.bookingId}`,
    clickAction: '/bookings/' + data.bookingId,
  }),

  providerAccepted: (data: {
    providerName: string
    serviceName: string
    scheduledDate: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '🎉 Provider Accepted!',
    body: `${data.providerName} accepted your ${data.serviceName} booking`,
    data: {
      type: 'PROVIDER_ACCEPTED',
      bookingId: data.bookingId,
      clickAction: '/bookings/' + data.bookingId,
    },
    tag: `booking-${data.bookingId}`,
    clickAction: '/bookings/' + data.bookingId,
  }),

  providerArriving: (data: {
    providerName: string
    serviceName: string
    eta: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '🚶 Provider is on the way!',
    body: `${data.providerName} is arriving in ${data.eta} for your ${data.serviceName}`,
    data: {
      type: 'PROVIDER_ARRIVING',
      bookingId: data.bookingId,
      clickAction: '/bookings/' + data.bookingId,
    },
    tag: `booking-${data.bookingId}`,
    clickAction: '/bookings/' + data.bookingId,
  }),

  bookingCompleted: (data: {
    serviceName: string
    providerName: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '🎉 Service Completed!',
    body: `${data.serviceName} by ${data.providerName} is done. Rate your experience!`,
    data: {
      type: 'BOOKING_COMPLETED',
      bookingId: data.bookingId,
      clickAction: '/bookings/' + data.bookingId + '/review',
    },
    tag: `booking-${data.bookingId}`,
    clickAction: '/bookings/' + data.bookingId + '/review',
  }),

  bookingCancelled: (data: {
    serviceName: string
    reason: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '❌ Booking Cancelled',
    body: `Your ${data.serviceName} booking has been cancelled. ${data.reason}`,
    data: {
      type: 'BOOKING_CANCELLED',
      bookingId: data.bookingId,
      clickAction: '/bookings/' + data.bookingId,
    },
    tag: `booking-${data.bookingId}`,
    clickAction: '/bookings/' + data.bookingId,
  }),

  // Provider-side notifications
  newBookingForProvider: (data: {
    clientName: string
    serviceName: string
    scheduledDate: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '🔔 New Booking Request!',
    body: `${data.clientName} booked ${data.serviceName} for ${data.scheduledDate}`,
    data: {
      type: 'NEW_BOOKING',
      bookingId: data.bookingId,
      clickAction: '/provider/bookings/' + data.bookingId,
    },
    tag: `new-booking-${data.bookingId}`,
    clickAction: '/provider/bookings/' + data.bookingId,
  }),

  bookingOTP: (data: {
    otp: string
    serviceName: string
    bookingId: string
  }): Omit<PushMessage, 'token'> => ({
    title: '🔐 Your Booking OTP',
    body: `OTP: ${data.otp} for ${data.serviceName}. Share with provider at service time.`,
    data: {
      type: 'BOOKING_OTP',
      bookingId: data.bookingId,
      otp: data.otp,
      clickAction: '/bookings/' + data.bookingId,
    },
    tag: `otp-${data.bookingId}`,
    clickAction: '/bookings/' + data.bookingId,
  }),
}

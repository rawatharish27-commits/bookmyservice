// ─── Notification Worker ────────────────────────────────────────────────
// Processes notification jobs from the BullMQ queue.
// Handles: WhatsApp, SMS, Email, Push notifications
//
// Integration Points (replace stubs with real APIs):
//   - WhatsApp: Twilio WhatsApp Business API
//   - SMS: Twilio / MSG91 / AWS SNS
//   - Email: SendGrid / AWS SES / Nodemailer
//   - Push: Firebase Cloud Messaging / OneSignal

import type { NotificationJobData } from '../queues'

// ─── WhatsApp Notification ─────────────────────────────────────────────
export async function sendWhatsAppNotification(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string }> {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER

  if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
    // Stub: Log the notification for development
    console.log(`📱 [WHATSAPP STUB] To: ${recipient.phone} | Template: ${template}`, data)
    return { success: true, messageId: `stub-wa-${Date.now()}` }
  }

  try {
    // Real Twilio WhatsApp API integration
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const body = new URLSearchParams({
      From: `whatsapp:${twilioWhatsAppNumber}`,
      To: `whatsapp:${recipient.phone}`,
      Body: formatWhatsAppMessage(template, data),
    })

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const result = await response.json() as { sid?: string; error_code?: string }
    if (result.error_code) {
      console.error(`📱 [WHATSAPP] Error: ${result.error_code}`)
      return { success: false }
    }

    return { success: true, messageId: result.sid }
  } catch (err: any) {
    console.error(`📱 [WHATSAPP] Failed:`, err.message)
    return { success: false }
  }
}

// ─── SMS Notification ──────────────────────────────────────────────────
export async function sendSMSNotification(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string }> {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log(`📲 [SMS STUB] To: ${recipient.phone} | Template: ${template}`, data)
    return { success: true, messageId: `stub-sms-${Date.now()}` }
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const body = new URLSearchParams({
      From: twilioPhoneNumber,
      To: recipient.phone || '',
      Body: formatSMSMessage(template, data),
    })

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const result = await response.json() as { sid?: string; error_code?: string }
    return { success: !result.error_code, messageId: result.sid }
  } catch (err: any) {
    console.error(`📲 [SMS] Failed:`, err.message)
    return { success: false }
  }
}

// ─── Email Notification ────────────────────────────────────────────────
export async function sendEmailNotification(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string }> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  const emailFrom = process.env.EMAIL_FROM || 'noreply@bookyourservice.co.in'

  if (!sendgridApiKey) {
    console.log(`📧 [EMAIL STUB] To: ${recipient.email} | Template: ${template}`, data)
    return { success: true, messageId: `stub-email-${Date.now()}` }
  }

  try {
    const emailData = formatEmailMessage(template, data, recipient.name || 'User')

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipient.email, name: recipient.name }] }],
        from: { email: emailFrom, name: 'BookMyService' },
        subject: emailData.subject,
        content: [
          { type: 'text/plain', value: emailData.textBody },
          { type: 'text/html', value: emailData.htmlBody },
        ],
      }),
    })

    const messageId = response.headers.get('X-Message-Id')
    return { success: response.ok, messageId: messageId || undefined }
  } catch (err: any) {
    console.error(`📧 [EMAIL] Failed:`, err.message)
    return { success: false }
  }
}

// ─── Push Notification (Firebase Cloud Messaging) ──────────────────────
import { sendPushToDevice, sendPushToDevices, BookingPushTemplates, getFCMStatus } from '../lib/firebase'
import type { PushMessage } from '../lib/firebase'

// Pool is passed from index.ts context — we need it to look up device tokens
// For the notification worker, we accept pool as a module-level reference
let _pool: any = null

export function setNotificationWorkerPool(pool: any): void {
  _pool = pool
}

// Get FCM device tokens for a user from the DeviceToken table
async function getUserDeviceTokens(userId: string): Promise<string[]> {
  if (!_pool) return []
  try {
    const result = await _pool.query(
      'SELECT "token" FROM "DeviceToken" WHERE "userId" = $1 AND "isActive" = true',
      [userId]
    )
    return result.rows.map((r: any) => r.token)
  } catch {
    // DeviceToken table may not exist yet
    return []
  }
}

// Remove invalid FCM tokens from the database
async function removeInvalidTokens(tokens: string[]): Promise<void> {
  if (!_pool || tokens.length === 0) return
  try {
    await _pool.query(
      'UPDATE "DeviceToken" SET "isActive" = false, "updatedAt" = NOW() WHERE token = ANY($1)',
      [tokens]
    )
  } catch {
    // Non-fatal
  }
}

export async function sendPushNotification(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string }> {
  const fcmStatus = getFCMStatus()

  // If no userId, we can't look up device tokens
  if (!recipient.userId) {
    console.log(`🔔 [PUSH] No userId provided — cannot look up device tokens. Template: ${template}`)
    return { success: false }
  }

  // Build the push message using pre-built templates
  const pushMessage = buildPushMessage(template, data)

  if (!pushMessage) {
    // No template match — send a generic push
    const genericMessage: Omit<PushMessage, 'token'> = {
      title: 'BookMyService',
      body: data.message || data.body || `You have a new notification`,
      data: {
        type: template.toUpperCase(),
        ...Object.fromEntries(
          Object.entries(data).filter(([k, v]) => typeof v === 'string').slice(0, 8)
        ),
      },
    }

    // Get device tokens for this user
    const tokens = await getUserDeviceTokens(recipient.userId)

    if (tokens.length === 0) {
      console.log(`🔔 [PUSH] No device tokens found for user ${recipient.userId}`)
      if (!fcmStatus.initialized) {
        console.log(`🔔 [PUSH STUB] To: ${recipient.userId} | Template: ${template}`, data)
        return { success: true, messageId: `stub-push-${Date.now()}` }
      }
      return { success: false }
    }

    if (tokens.length === 1) {
      const result = await sendPushToDevice({ ...genericMessage, token: tokens[0] })
      if (result.invalidToken) {
        await removeInvalidTokens([tokens[0]])
      }
      return { success: result.success, messageId: result.messageId }
    }

    // Multiple tokens — use multicast
    const result = await sendPushToDevices(tokens, genericMessage)
    if (result.invalidTokens.length > 0) {
      await removeInvalidTokens(result.invalidTokens)
    }
    return { success: result.successCount > 0 }
  }

  // Template-based push
  const tokens = await getUserDeviceTokens(recipient.userId)

  if (tokens.length === 0) {
    console.log(`🔔 [PUSH] No device tokens found for user ${recipient.userId}`)
    if (!fcmStatus.initialized) {
      console.log(`🔔 [PUSH STUB] To: ${recipient.userId} | Template: ${template}`, data)
      return { success: true, messageId: `stub-push-${Date.now()}` }
    }
    return { success: false }
  }

  if (tokens.length === 1) {
    const result = await sendPushToDevice({ ...pushMessage, token: tokens[0] })
    if (result.invalidToken) {
      await removeInvalidTokens([tokens[0]])
    }
    return { success: result.success, messageId: result.messageId }
  }

  // Multiple tokens — use multicast
  const result = await sendPushToDevices(tokens, pushMessage)
  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens)
  }
  return { success: result.successCount > 0 }
}

// ─── Build Push Message from Template ──────────────────────────────────
function buildPushMessage(
  template: string,
  data: Record<string, any>
): Omit<PushMessage, 'token'> | null {
  switch (template) {
    case 'booking_confirmation':
    case 'booking_confirmed':
      return BookingPushTemplates.bookingConfirmed({
        serviceName: data.serviceName || 'Service',
        providerName: data.providerName || 'Provider',
        scheduledDate: data.scheduledDate || 'TBD',
        bookingId: data.bookingId || '',
      })

    case 'provider_accepted':
      return BookingPushTemplates.providerAccepted({
        providerName: data.providerName || 'Provider',
        serviceName: data.serviceName || 'Service',
        scheduledDate: data.scheduledDate || 'TBD',
        bookingId: data.bookingId || '',
      })

    case 'provider_arriving':
      return BookingPushTemplates.providerArriving({
        providerName: data.providerName || 'Provider',
        serviceName: data.serviceName || 'Service',
        eta: data.eta || '15 min',
        bookingId: data.bookingId || '',
      })

    case 'booking_completed':
      return BookingPushTemplates.bookingCompleted({
        serviceName: data.serviceName || 'Service',
        providerName: data.providerName || 'Provider',
        bookingId: data.bookingId || '',
      })

    case 'booking_cancelled':
      return BookingPushTemplates.bookingCancelled({
        serviceName: data.serviceName || 'Service',
        reason: data.reason || '',
        bookingId: data.bookingId || '',
      })

    case 'new_booking':
      return BookingPushTemplates.newBookingForProvider({
        clientName: data.clientName || 'Customer',
        serviceName: data.serviceName || 'Service',
        scheduledDate: data.scheduledDate || 'TBD',
        bookingId: data.bookingId || '',
      })

    case 'booking_otp':
      return BookingPushTemplates.bookingOTP({
        otp: data.otp || '',
        serviceName: data.serviceName || 'Service',
        bookingId: data.bookingId || '',
      })

    default:
      return null
  }
}

// ─── Message Formatters ────────────────────────────────────────────────

function formatWhatsAppMessage(template: string, data: Record<string, any>): string {
  const templates: Record<string, string> = {
    booking_confirmation: `✅ *Booking Confirmed!*\n\nService: ${data.serviceName}\nProvider: ${data.providerName}\nDate: ${data.scheduledDate}\nBooking ID: ${data.bookingId}\n\nThank you for choosing BookMyService! 🙏`,
    booking_reminder: `⏰ *Booking Reminder*\n\nYour service "${data.serviceName}" is scheduled for tomorrow.\nProvider: ${data.providerName}\n\nPlease be available at the scheduled time.`,
    otp_verification: `🔐 *Your OTP is: ${data.otp}*\n\nValid for 5 minutes. Do not share with anyone.\n\n- BookMyService`,
    booking_cancelled: `❌ *Booking Cancelled*\n\nService: ${data.serviceName}\nDate: ${data.scheduledDate}\nReason: ${data.reason || 'N/A'}\n\nWe apologize for the inconvenience.`,
    booking_completed: `🎉 *Service Completed!*\n\nService: ${data.serviceName}\nProvider: ${data.providerName}\n\nHow was your experience? Rate us now! ⭐`,
    welcome: `🎉 *Welcome to BookMyService!*\n\nHi ${data.name}, your account has been created successfully.\n\nExplore our services and book your first appointment! 🏠`,
  }
  return templates[template] || `BookMyService: ${template} - ${JSON.stringify(data)}`
}

function formatSMSMessage(template: string, data: Record<string, any>): string {
  const templates: Record<string, string> = {
    booking_confirmation: `BookMyService: Booking confirmed! ${data.serviceName} on ${data.scheduledDate}. ID: ${data.bookingId}`,
    otp_verification: `BookMyService OTP: ${data.otp}. Valid for 5 minutes. Do not share.`,
    booking_reminder: `BookMyService: Reminder - ${data.serviceName} scheduled for tomorrow with ${data.providerName}.`,
    booking_cancelled: `BookMyService: Booking for ${data.serviceName} cancelled. ${data.reason || ''}`,
  }
  return templates[template] || `BookMyService: ${template}`
}

function formatEmailMessage(
  template: string,
  data: Record<string, any>,
  recipientName: string
): { subject: string; textBody: string; htmlBody: string } {
  const templates: Record<string, { subject: string; textBody: string; htmlBody: string }> = {
    booking_confirmation: {
      subject: `Booking Confirmed - ${data.serviceName}`,
      textBody: `Hi ${recipientName},\n\nYour booking has been confirmed!\n\nService: ${data.serviceName}\nProvider: ${data.providerName}\nDate: ${data.scheduledDate}\nBooking ID: ${data.bookingId}\n\nThank you for choosing BookMyService!`,
      htmlBody: `<h2>Booking Confirmed! ✅</h2><p>Hi ${recipientName},</p><p>Your booking has been confirmed!</p><ul><li><strong>Service:</strong> ${data.serviceName}</li><li><strong>Provider:</strong> ${data.providerName}</li><li><strong>Date:</strong> ${data.scheduledDate}</li><li><strong>Booking ID:</strong> ${data.bookingId}</li></ul><p>Thank you for choosing BookMyService! 🙏</p>`,
    },
    otp_verification: {
      subject: 'Your OTP Code',
      textBody: `Your OTP is: ${data.otp}\nValid for 5 minutes. Do not share with anyone.`,
      htmlBody: `<h2>OTP Verification</h2><p>Your OTP is: <strong style="font-size:24px">${data.otp}</strong></p><p>Valid for 5 minutes. Do not share with anyone.</p>`,
    },
    welcome: {
      subject: 'Welcome to BookMyService!',
      textBody: `Hi ${recipientName},\n\nWelcome to BookMyService! Your account has been created.\n\nExplore our services and book your first appointment.`,
      htmlBody: `<h2>Welcome to BookMyService! 🎉</h2><p>Hi ${recipientName},</p><p>Your account has been created successfully.</p><p>Explore our services and book your first appointment!</p>`,
    },
    password_reset: {
      subject: 'Password Reset Request',
      textBody: `Hi ${recipientName},\n\nWe received a password reset request. If this was you, use the following token:\n\n${data.token}\n\nThis token expires in 1 hour.`,
      htmlBody: `<h2>Password Reset</h2><p>Hi ${recipientName},</p><p>We received a password reset request. Use this token:</p><p><code style="font-size:18px">${data.token}</code></p><p>This token expires in 1 hour.</p>`,
    },
  }

  return templates[template] || {
    subject: `BookMyService: ${template}`,
    textBody: JSON.stringify(data),
    htmlBody: `<p>${JSON.stringify(data)}</p>`,
  }
}

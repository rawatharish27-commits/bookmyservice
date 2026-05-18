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

// ─── Push Notification ─────────────────────────────────────────────────
export async function sendPushNotification(
  recipient: NotificationJobData['recipient'],
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean }> {
  // TODO: Integrate with FCM / OneSignal
  console.log(`🔔 [PUSH STUB] To: ${recipient.userId} | Template: ${template}`, data)
  return { success: true }
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

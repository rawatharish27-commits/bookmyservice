// ─── Booking Processing Worker ──────────────────────────────────────────
// Processes booking-related jobs from the BullMQ queue.
// Handles: Invoice generation, Referral rewards, Analytics updates,
//          Booking confirmations
//
// These tasks are CPU/IO-heavy and should NOT run inside API handlers.
// Instead, the API pushes a job and returns immediately.

import type { BookingProcessingJobData } from '../queues'
import { pushNotificationJob } from '../queues'
import type { NotificationJobData } from '../queues'

// ─── Invoice Generation ────────────────────────────────────────────────
export async function generateInvoice(
  bookingId: string,
  data: Record<string, any>
): Promise<{ success: boolean; invoiceUrl?: string }> {
  try {
    // In production, invoice generation must be properly configured
    // For now, this is a placeholder — fail in production if not implemented
    if (process.env.NODE_ENV === 'production') {
      console.error(`📄 [INVOICE] Invoice generation is not yet implemented. Cannot generate invoice for booking ${bookingId} in production.`)
      return { success: false }
    }

    // Development mode: create a mock invoice record
    const invoiceId = `inv_${Date.now()}_${bookingId.slice(-6)}`
    const invoiceUrl = `/invoices/${invoiceId}.pdf`

    console.log(`📄 [INVOICE] Generated (mock): ${invoiceId} for booking: ${bookingId}`, {
      amount: data.finalPrice || data.basePrice,
      service: data.serviceName,
      client: data.clientName,
    })

    // In production, this would:
    // 1. Generate PDF with booking details, amounts, GST
    // 2. Upload to cloud storage (S3/Cloudinary)
    // 3. Store invoice URL in database
    // 4. Send invoice via email

    return { success: true, invoiceUrl }
  } catch (err: any) {
    console.error(`📄 [INVOICE] Failed for booking ${bookingId}:`, err.message)
    return { success: false }
  }
}

// ─── Referral Reward Processing ────────────────────────────────────────
export async function processReferralReward(
  bookingId: string,
  data: Record<string, any>
): Promise<{ success: boolean; rewardAmount?: number }> {
  try {
    const { clientId, referrerId, basePrice } = data

    if (!referrerId) {
      // No referrer — skip reward processing
      return { success: true, rewardAmount: 0 }
    }

    // Calculate referral reward (e.g., 5% of booking value, max ₹100)
    const rewardRate = 0.05
    const maxReward = 100
    const rewardAmount = Math.min(
      Math.round((basePrice || 0) * rewardRate),
      maxReward
    )

    console.log(`🎁 [REFERRAL] Processing reward: ₹${rewardAmount}`, {
      bookingId,
      clientId,
      referrerId,
      basePrice,
    })

    // In production, this would:
    // 1. Verify the referral exists and is valid
    // 2. Credit the referrer's wallet
    // 3. Create a transaction record
    // 4. Notify the referrer about their reward

    // Send notification to referrer
    await pushNotificationJob({
      type: 'WHATSAPP',
      recipient: { userId: referrerId },
      template: 'referral_reward',
      data: {
        rewardAmount,
        bookingId,
        friendName: data.clientName || 'Your friend',
      },
      priority: 4,
    })

    return { success: true, rewardAmount }
  } catch (err: any) {
    console.error(`🎁 [REFERRAL] Failed for booking ${bookingId}:`, err.message)
    return { success: false }
  }
}

// ─── Analytics Update ──────────────────────────────────────────────────
export async function updateAnalytics(
  bookingId: string,
  data: Record<string, any>
): Promise<{ success: boolean }> {
  try {
    const { categoryId, providerId, status } = data

    console.log(`📊 [ANALYTICS] Updating for booking: ${bookingId}`, {
      categoryId,
      providerId,
      status,
    })

    // In production, this would:
    // 1. Update PlatformStats table (total bookings, revenue)
    // 2. Update provider's completedJobsCount, averageRating
    // 3. Update category booking counts
    // 4. Track conversion metrics
    // 5. Update real-time dashboards

    // These are all database updates that can be batched/deferred
    // to avoid blocking the API response

    return { success: true }
  } catch (err: any) {
    console.error(`📊 [ANALYTICS] Failed for booking ${bookingId}:`, err.message)
    return { success: false }
  }
}

// ─── Booking Confirmation ──────────────────────────────────────────────
export async function sendBookingConfirmation(
  bookingId: string,
  data: Record<string, any>
): Promise<{ success: boolean }> {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      providerName,
      providerPhone,
      serviceName,
      scheduledDate,
      scheduledTime,
      otp,
    } = data

    console.log(`✅ [CONFIRMATION] Booking: ${bookingId}`, {
      client: clientName,
      provider: providerName,
      service: serviceName,
    })

    // Send multi-channel confirmation to CLIENT
    const clientNotifications: Promise<void>[] = []

    if (clientEmail) {
      clientNotifications.push(
        pushNotificationJob({
          type: 'EMAIL',
          recipient: { email: clientEmail, name: clientName },
          template: 'booking_confirmation',
          data: { serviceName, providerName, scheduledDate, scheduledTime, bookingId },
          priority: 2,
        })
      )
    }

    if (clientPhone) {
      clientNotifications.push(
        pushNotificationJob({
          type: 'SMS',
          recipient: { phone: clientPhone, name: clientName },
          template: 'booking_confirmation',
          data: { serviceName, providerName, scheduledDate, bookingId },
          priority: 2,
        })
      )

      // WhatsApp with OTP
      clientNotifications.push(
        pushNotificationJob({
          type: 'WHATSAPP',
          recipient: { phone: clientPhone, name: clientName },
          template: 'booking_confirmation',
          data: { serviceName, providerName, scheduledDate, scheduledTime, bookingId, otp },
          priority: 3,
        })
      )
    }

    // Send notification to PROVIDER
    if (providerPhone) {
      clientNotifications.push(
        pushNotificationJob({
          type: 'SMS',
          recipient: { phone: providerPhone, name: providerName },
          template: 'new_booking',
          data: { clientName, serviceName, scheduledDate, bookingId },
          priority: 2,
        })
      )
    }

    // Wait for all notifications to be dispatched (or queued)
    await Promise.allSettled(clientNotifications)

    return { success: true }
  } catch (err: any) {
    console.error(`✅ [CONFIRMATION] Failed for booking ${bookingId}:`, err.message)
    return { success: false }
  }
}

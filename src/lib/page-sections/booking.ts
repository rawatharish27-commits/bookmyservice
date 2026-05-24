import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'booking-checkout': () => import('@/components/pages/booking/booking-checkout-page').then(m => ({ default: m.BookingCheckoutPage })),
  'booking-datetime': () => import('@/components/pages/booking/booking-datetime-page').then(m => ({ default: m.BookingDatetimePage })),
  'booking-summary': () => import('@/components/pages/booking/booking-summary-page').then(m => ({ default: m.BookingSummaryPage })),
  'booking-payment': () => import('@/components/pages/booking/booking-payment-page').then(m => ({ default: m.BookingPaymentPage })),
  'booking-razorpay': () => import('@/components/pages/booking/booking-razorpay-page').then(m => ({ default: m.BookingRazorpayPage })),
  'payment-success': () => import('@/components/pages/booking/payment-success-page').then(m => ({ default: m.PaymentSuccessPage })),
  'payment-failed': () => import('@/components/pages/booking/payment-failed-page').then(m => ({ default: m.PaymentFailedPage })),
  'booking-confirmation': () => import('@/components/pages/booking/booking-confirmation-page').then(m => ({ default: m.BookingConfirmationPage })),
  'booking-cancellation': () => import('@/components/pages/booking/booking-cancellation-page').then(m => ({ default: m.BookingCancellationPage })),
  'booking-reschedule': () => import('@/components/pages/booking/booking-reschedule-page').then(m => ({ default: m.BookingReschedulePage })),
}

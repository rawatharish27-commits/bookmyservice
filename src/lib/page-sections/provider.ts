import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'provider-dashboard': () => import('@/components/pages/provider/provider-dashboard-page').then(m => ({ default: m.ProviderDashboardPage })),
  'provider-profile': () => import('@/components/pages/provider/provider-profile-page').then(m => ({ default: m.ProviderProfilePage })),
  'provider-edit-profile': () => import('@/components/pages/provider/provider-edit-profile-page').then(m => ({ default: m.ProviderEditProfilePage })),
  'provider-kyc': () => import('@/components/pages/provider/provider-kyc-page').then(m => ({ default: m.ProviderKycPage })),
  'provider-upload-docs': () => import('@/components/pages/provider/provider-upload-docs-page').then(m => ({ default: m.ProviderUploadDocsPage })),
  'provider-services': () => import('@/components/pages/provider/provider-services-page').then(m => ({ default: m.ProviderServicesPage })),
  'provider-add-service': () => import('@/components/pages/provider/provider-add-service-page').then(m => ({ default: m.ProviderAddServicePage })),
  'provider-edit-service': () => import('@/components/pages/provider/provider-edit-service-page').then(m => ({ default: m.ProviderEditServicePage })),
  'provider-delete-service': () => import('@/components/pages/provider/provider-delete-service-page').then(m => ({ default: m.ProviderDeleteServicePage })),
  'provider-bookings': () => import('@/components/pages/provider/provider-bookings-page').then(m => ({ default: m.ProviderBookingsPage })),
  'provider-booking-requests': () => import('@/components/pages/provider/provider-booking-requests-page').then(m => ({ default: m.ProviderBookingRequestsPage })),
  'provider-active-jobs': () => import('@/components/pages/provider/provider-active-jobs-page').then(m => ({ default: m.ProviderActiveJobsPage })),
  'provider-completed-jobs': () => import('@/components/pages/provider/provider-completed-jobs-page').then(m => ({ default: m.ProviderCompletedJobsPage })),
  'provider-cancelled-jobs': () => import('@/components/pages/provider/provider-cancelled-jobs-page').then(m => ({ default: m.ProviderCancelledJobsPage })),
  'provider-earnings': () => import('@/components/pages/provider/provider-earnings-page').then(m => ({ default: m.ProviderEarningsPage })),
  'provider-payouts': () => import('@/components/pages/provider/provider-payouts-page').then(m => ({ default: m.ProviderPayoutsPage })),
  'provider-withdraw': () => import('@/components/pages/provider/provider-withdraw-page').then(m => ({ default: m.ProviderWithdrawPage })),
  'provider-wallet': () => import('@/components/pages/provider/provider-wallet-page').then(m => ({ default: m.ProviderWalletPage })),
  'provider-reviews': () => import('@/components/pages/provider/provider-reviews-page').then(m => ({ default: m.ProviderReviewsPage })),
  'provider-schedule': () => import('@/components/pages/provider/provider-schedule-page').then(m => ({ default: m.ProviderSchedulePage })),
  'provider-availability': () => import('@/components/pages/provider/provider-availability-page').then(m => ({ default: m.ProviderAvailabilityPage })),
  'provider-notifications': () => import('@/components/pages/provider/provider-notifications-page').then(m => ({ default: m.ProviderNotificationsPage })),
  'provider-chat': () => import('@/components/pages/provider/provider-chat-page').then(m => ({ default: m.ProviderChatPage })),
  'provider-analytics': () => import('@/components/pages/provider/provider-analytics-page').then(m => ({ default: m.ProviderAnalyticsPage })),
  'provider-support': () => import('@/components/pages/provider/provider-support-page').then(m => ({ default: m.ProviderSupportPage })),
  'provider-subscription': () => import('@/components/pages/provider/provider-subscription-page').then(m => ({ default: m.ProviderSubscriptionPage })),
  'provider-settings': () => import('@/components/pages/provider/provider-settings-page').then(m => ({ default: m.ProviderSettingsPage })),
}

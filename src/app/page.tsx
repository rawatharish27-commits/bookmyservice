'use client'

import React, { useState, Suspense } from 'react'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { ClientDashboard } from '@/components/dashboards/client-dashboard'
import { ProviderDashboard } from '@/components/dashboards/provider-dashboard'

// Helper: create lazy-loaded component from a named export
const lazyPage = <T extends React.ComponentType>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string
) => React.lazy(() => importFn().then(m => ({ default: m[exportName] as T })))

// ─── Public Pages (lazy) ───────────────────────────────────────────────────────
const HomePage = lazyPage(() => import('@/components/pages/public/home-page'), 'HomePage')
const CategoriesPage = lazyPage(() => import('@/components/pages/public/categories-page'), 'CategoriesPage')
const ServiceListingPage = lazyPage(() => import('@/components/pages/public/service-listing-page'), 'ServiceListingPage')
const ServiceDetailPage = lazyPage(() => import('@/components/pages/public/service-detail-page'), 'ServiceDetailPage')
const SearchPage = lazyPage(() => import('@/components/pages/public/search-page'), 'SearchPage')
const NearbyProvidersPage = lazyPage(() => import('@/components/pages/public/nearby-providers-page'), 'NearbyProvidersPage')
const FeaturedServicesPage = lazyPage(() => import('@/components/pages/public/featured-services-page'), 'FeaturedServicesPage')
const TrendingServicesPage = lazyPage(() => import('@/components/pages/public/trending-services-page'), 'TrendingServicesPage')
const OffersDealsPage = lazyPage(() => import('@/components/pages/public/offers-deals-page'), 'OffersDealsPage')
const PopularProvidersPage = lazyPage(() => import('@/components/pages/public/popular-providers-page'), 'PopularProvidersPage')

// ─── Auth Pages (lazy) ─────────────────────────────────────────────────────────
const LoginPage = lazyPage(() => import('@/components/pages/auth/login-page'), 'LoginPage')
const SignupPage = lazyPage(() => import('@/components/pages/auth/signup-page'), 'SignupPage')
const ForgotPasswordPage = lazyPage(() => import('@/components/pages/auth/forgot-password-page'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyPage(() => import('@/components/pages/auth/reset-password-page'), 'ResetPasswordPage')
const OtpVerificationPage = lazyPage(() => import('@/components/pages/auth/otp-verification-page'), 'OtpVerificationPage')
const EmailVerificationPage = lazyPage(() => import('@/components/pages/auth/email-verification-page'), 'EmailVerificationPage')
const PhoneVerificationPage = lazyPage(() => import('@/components/pages/auth/phone-verification-page'), 'PhoneVerificationPage')
const RoleSelectionPage = lazyPage(() => import('@/components/pages/auth/role-selection-page'), 'RoleSelectionPage')
const SocialCallbackPage = lazyPage(() => import('@/components/pages/auth/social-callback-page'), 'SocialCallbackPage')

// ─── Customer Pages (lazy) ─────────────────────────────────────────────────────
const ClientDashboardPage = lazyPage(() => import('@/components/pages/customer/client-dashboard-page'), 'ClientDashboardPage')
const ClientProfilePage = lazyPage(() => import('@/components/pages/customer/client-profile-page'), 'ClientProfilePage')
const ClientEditProfilePage = lazyPage(() => import('@/components/pages/customer/client-edit-profile-page'), 'ClientEditProfilePage')
const ClientAddressesPage = lazyPage(() => import('@/components/pages/customer/client-addresses-page'), 'ClientAddressesPage')
const ClientSavedAddressesPage = lazyPage(() => import('@/components/pages/customer/client-saved-addresses-page'), 'ClientSavedAddressesPage')
const ClientBookingsPage = lazyPage(() => import('@/components/pages/customer/client-bookings-page'), 'ClientBookingsPage')
const ClientBookingDetailPage = lazyPage(() => import('@/components/pages/customer/client-booking-detail-page'), 'ClientBookingDetailPage')
const ClientUpcomingPage = lazyPage(() => import('@/components/pages/customer/client-upcoming-page'), 'ClientUpcomingPage')
const ClientCompletedPage = lazyPage(() => import('@/components/pages/customer/client-completed-page'), 'ClientCompletedPage')
const ClientCancelledPage = lazyPage(() => import('@/components/pages/customer/client-cancelled-page'), 'ClientCancelledPage')
const ClientBookingTrackingPage = lazyPage(() => import('@/components/pages/customer/client-booking-tracking-page'), 'ClientBookingTrackingPage')
const ClientRebookPage = lazyPage(() => import('@/components/pages/customer/client-rebook-page'), 'ClientRebookPage')
const ClientInvoicePage = lazyPage(() => import('@/components/pages/customer/client-invoice-page'), 'ClientInvoicePage')
const ClientBookingReviewPage = lazyPage(() => import('@/components/pages/customer/client-booking-review-page'), 'ClientBookingReviewPage')
const ClientFavoritesPage = lazyPage(() => import('@/components/pages/customer/client-favorites-page'), 'ClientFavoritesPage')
const ClientWalletPage = lazyPage(() => import('@/components/pages/customer/client-wallet-page'), 'ClientWalletPage')
const ClientWalletTransactionsPage = lazyPage(() => import('@/components/pages/customer/client-wallet-transactions-page'), 'ClientWalletTransactionsPage')
const ClientAddMoneyPage = lazyPage(() => import('@/components/pages/customer/client-add-money-page'), 'ClientAddMoneyPage')
const ClientCouponsPage = lazyPage(() => import('@/components/pages/customer/client-coupons-page'), 'ClientCouponsPage')
const ClientReferralPage = lazyPage(() => import('@/components/pages/customer/client-referral-page'), 'ClientReferralPage')
const ClientAmcPage = lazyPage(() => import('@/components/pages/customer/client-amc-page'), 'ClientAmcPage')
const ClientAmcDetailPage = lazyPage(() => import('@/components/pages/customer/client-amc-detail-page'), 'ClientAmcDetailPage')
const ClientNotificationsPage = lazyPage(() => import('@/components/pages/customer/client-notifications-page'), 'ClientNotificationsPage')
const ClientNotificationDetailPage = lazyPage(() => import('@/components/pages/customer/client-notification-detail-page'), 'ClientNotificationDetailPage')
const ClientSupportPage = lazyPage(() => import('@/components/pages/customer/client-support-page'), 'ClientSupportPage')
const ClientSupportDetailPage = lazyPage(() => import('@/components/pages/customer/client-support-detail-page'), 'ClientSupportDetailPage')
const ClientChatPage = lazyPage(() => import('@/components/pages/customer/client-chat-page'), 'ClientChatPage')
const ClientSettingsPage = lazyPage(() => import('@/components/pages/customer/client-settings-page'), 'ClientSettingsPage')
const ClientPrivacyPage = lazyPage(() => import('@/components/pages/customer/client-privacy-page'), 'ClientPrivacyPage')
const ClientPaymentMethodsPage = lazyPage(() => import('@/components/pages/customer/client-payment-methods-page'), 'ClientPaymentMethodsPage')
const ClientTransactionsPage = lazyPage(() => import('@/components/pages/customer/client-transactions-page'), 'ClientTransactionsPage')

// ─── Booking Pages (lazy) ──────────────────────────────────────────────────────
const BookingCheckoutPage = lazyPage(() => import('@/components/pages/booking/booking-checkout-page'), 'BookingCheckoutPage')
const BookingDatetimePage = lazyPage(() => import('@/components/pages/booking/booking-datetime-page'), 'BookingDatetimePage')
const BookingSummaryPage = lazyPage(() => import('@/components/pages/booking/booking-summary-page'), 'BookingSummaryPage')
const BookingPaymentPage = lazyPage(() => import('@/components/pages/booking/booking-payment-page'), 'BookingPaymentPage')
const BookingRazorpayPage = lazyPage(() => import('@/components/pages/booking/booking-razorpay-page'), 'BookingRazorpayPage')
const PaymentSuccessPage = lazyPage(() => import('@/components/pages/booking/payment-success-page'), 'PaymentSuccessPage')
const PaymentFailedPage = lazyPage(() => import('@/components/pages/booking/payment-failed-page'), 'PaymentFailedPage')
const BookingConfirmationPage = lazyPage(() => import('@/components/pages/booking/booking-confirmation-page'), 'BookingConfirmationPage')
const BookingCancellationPage = lazyPage(() => import('@/components/pages/booking/booking-cancellation-page'), 'BookingCancellationPage')
const BookingReschedulePage = lazyPage(() => import('@/components/pages/booking/booking-reschedule-page'), 'BookingReschedulePage')

// ─── Tracking Pages (lazy) ─────────────────────────────────────────────────────
const LiveTrackingPage = lazyPage(() => import('@/components/pages/tracking/live-tracking-page'), 'LiveTrackingPage')
const TechnicianEtaPage = lazyPage(() => import('@/components/pages/tracking/technician-eta-page'), 'TechnicianEtaPage')
const RouteVisualizationPage = lazyPage(() => import('@/components/pages/tracking/route-visualization-page'), 'RouteVisualizationPage')
const BookingTimelinePage = lazyPage(() => import('@/components/pages/tracking/booking-timeline-page'), 'BookingTimelinePage')
const TechnicianContactPage = lazyPage(() => import('@/components/pages/tracking/technician-contact-page'), 'TechnicianContactPage')

// ─── Provider Pages (lazy) ─────────────────────────────────────────────────────
const ProviderDashboardPage = lazyPage(() => import('@/components/pages/provider/provider-dashboard-page'), 'ProviderDashboardPage')
const ProviderProfilePage = lazyPage(() => import('@/components/pages/provider/provider-profile-page'), 'ProviderProfilePage')
const ProviderEditProfilePage = lazyPage(() => import('@/components/pages/provider/provider-edit-profile-page'), 'ProviderEditProfilePage')
const ProviderKycPage = lazyPage(() => import('@/components/pages/provider/provider-kyc-page'), 'ProviderKycPage')
const ProviderUploadDocsPage = lazyPage(() => import('@/components/pages/provider/provider-upload-docs-page'), 'ProviderUploadDocsPage')
const ProviderServicesPage = lazyPage(() => import('@/components/pages/provider/provider-services-page'), 'ProviderServicesPage')
const ProviderAddServicePage = lazyPage(() => import('@/components/pages/provider/provider-add-service-page'), 'ProviderAddServicePage')
const ProviderEditServicePage = lazyPage(() => import('@/components/pages/provider/provider-edit-service-page'), 'ProviderEditServicePage')
const ProviderDeleteServicePage = lazyPage(() => import('@/components/pages/provider/provider-delete-service-page'), 'ProviderDeleteServicePage')
const ProviderBookingsPage = lazyPage(() => import('@/components/pages/provider/provider-bookings-page'), 'ProviderBookingsPage')
const ProviderBookingRequestsPage = lazyPage(() => import('@/components/pages/provider/provider-booking-requests-page'), 'ProviderBookingRequestsPage')
const ProviderActiveJobsPage = lazyPage(() => import('@/components/pages/provider/provider-active-jobs-page'), 'ProviderActiveJobsPage')
const ProviderCompletedJobsPage = lazyPage(() => import('@/components/pages/provider/provider-completed-jobs-page'), 'ProviderCompletedJobsPage')
const ProviderCancelledJobsPage = lazyPage(() => import('@/components/pages/provider/provider-cancelled-jobs-page'), 'ProviderCancelledJobsPage')
const ProviderEarningsPage = lazyPage(() => import('@/components/pages/provider/provider-earnings-page'), 'ProviderEarningsPage')
const ProviderPayoutsPage = lazyPage(() => import('@/components/pages/provider/provider-payouts-page'), 'ProviderPayoutsPage')
const ProviderWithdrawPage = lazyPage(() => import('@/components/pages/provider/provider-withdraw-page'), 'ProviderWithdrawPage')
const ProviderWalletPage = lazyPage(() => import('@/components/pages/provider/provider-wallet-page'), 'ProviderWalletPage')
const ProviderReviewsPage = lazyPage(() => import('@/components/pages/provider/provider-reviews-page'), 'ProviderReviewsPage')
const ProviderSchedulePage = lazyPage(() => import('@/components/pages/provider/provider-schedule-page'), 'ProviderSchedulePage')
const ProviderAvailabilityPage = lazyPage(() => import('@/components/pages/provider/provider-availability-page'), 'ProviderAvailabilityPage')
const ProviderNotificationsPage = lazyPage(() => import('@/components/pages/provider/provider-notifications-page'), 'ProviderNotificationsPage')
const ProviderChatPage = lazyPage(() => import('@/components/pages/provider/provider-chat-page'), 'ProviderChatPage')
const ProviderAnalyticsPage = lazyPage(() => import('@/components/pages/provider/provider-analytics-page'), 'ProviderAnalyticsPage')
const ProviderSupportPage = lazyPage(() => import('@/components/pages/provider/provider-support-page'), 'ProviderSupportPage')
const ProviderSubscriptionPage = lazyPage(() => import('@/components/pages/provider/provider-subscription-page'), 'ProviderSubscriptionPage')
const ProviderSettingsPage = lazyPage(() => import('@/components/pages/provider/provider-settings-page'), 'ProviderSettingsPage')

// ─── Admin Pages (lazy) ────────────────────────────────────────────────────────
const AdminDashboardPage = lazyPage(() => import('@/components/pages/admin/admin-dashboard-page'), 'AdminDashboardPage')
const AdminAnalyticsPage = lazyPage(() => import('@/components/pages/admin/admin-analytics-page'), 'AdminAnalyticsPage')
const AdminRevenueAnalyticsPage = lazyPage(() => import('@/components/pages/admin/admin-revenue-analytics-page'), 'AdminRevenueAnalyticsPage')
const AdminBookingAnalyticsPage = lazyPage(() => import('@/components/pages/admin/admin-booking-analytics-page'), 'AdminBookingAnalyticsPage')
const AdminUserAnalyticsPage = lazyPage(() => import('@/components/pages/admin/admin-user-analytics-page'), 'AdminUserAnalyticsPage')
const AdminProviderAnalyticsPage = lazyPage(() => import('@/components/pages/admin/admin-provider-analytics-page'), 'AdminProviderAnalyticsPage')
const AdminCustomersPage = lazyPage(() => import('@/components/pages/admin/admin-customers-page'), 'AdminCustomersPage')
const AdminProvidersPage = lazyPage(() => import('@/components/pages/admin/admin-providers-page'), 'AdminProvidersPage')
const AdminAdminsPage = lazyPage(() => import('@/components/pages/admin/admin-admins-page'), 'AdminAdminsPage')
const AdminRolesPage = lazyPage(() => import('@/components/pages/admin/admin-roles-page'), 'AdminRolesPage')
const AdminBookingsPage = lazyPage(() => import('@/components/pages/admin/admin-bookings-page'), 'AdminBookingsPage')
const AdminBookingDetailPage = lazyPage(() => import('@/components/pages/admin/admin-booking-detail-page'), 'AdminBookingDetailPage')
const AdminCategoriesPage = lazyPage(() => import('@/components/pages/admin/admin-categories-page'), 'AdminCategoriesPage')
const AdminCouponsPage = lazyPage(() => import('@/components/pages/admin/admin-coupons-page'), 'AdminCouponsPage')
const AdminWalletsPage = lazyPage(() => import('@/components/pages/admin/admin-wallets-page'), 'AdminWalletsPage')
const AdminPaymentsPage = lazyPage(() => import('@/components/pages/admin/admin-payments-page'), 'AdminPaymentsPage')
const AdminRefundsPage = lazyPage(() => import('@/components/pages/admin/admin-refunds-page'), 'AdminRefundsPage')
const AdminAmcPage = lazyPage(() => import('@/components/pages/admin/admin-amc-page'), 'AdminAmcPage')
const AdminReferralsPage = lazyPage(() => import('@/components/pages/admin/admin-referrals-page'), 'AdminReferralsPage')
const AdminNotificationsPage = lazyPage(() => import('@/components/pages/admin/admin-notifications-page'), 'AdminNotificationsPage')
const AdminReviewsPage = lazyPage(() => import('@/components/pages/admin/admin-reviews-page'), 'AdminReviewsPage')
const AdminReportsPage = lazyPage(() => import('@/components/pages/admin/admin-reports-page'), 'AdminReportsPage')
const AdminFraudPage = lazyPage(() => import('@/components/pages/admin/admin-fraud-page'), 'AdminFraudPage')
const AdminSupportPage = lazyPage(() => import('@/components/pages/admin/admin-support-page'), 'AdminSupportPage')
const AdminChatMonitoringPage = lazyPage(() => import('@/components/pages/admin/admin-chat-monitoring-page'), 'AdminChatMonitoringPage')
const AdminCmsPage = lazyPage(() => import('@/components/pages/admin/admin-cms-page'), 'AdminCmsPage')
const AdminSeoPage = lazyPage(() => import('@/components/pages/admin/admin-seo-page'), 'AdminSeoPage')
const AdminSystemSettingsPage = lazyPage(() => import('@/components/pages/admin/admin-system-settings-page'), 'AdminSystemSettingsPage')
const AdminApiSettingsPage = lazyPage(() => import('@/components/pages/admin/admin-api-settings-page'), 'AdminApiSettingsPage')
const AdminEmailTemplatesPage = lazyPage(() => import('@/components/pages/admin/admin-email-templates-page'), 'AdminEmailTemplatesPage')
const AdminSmsTemplatesPage = lazyPage(() => import('@/components/pages/admin/admin-sms-templates-page'), 'AdminSmsTemplatesPage')
const AdminPushNotificationsPage = lazyPage(() => import('@/components/pages/admin/admin-push-notifications-page'), 'AdminPushNotificationsPage')
const AdminAuditLogsPage = lazyPage(() => import('@/components/pages/admin/admin-audit-logs-page'), 'AdminAuditLogsPage')
const AdminSecurityPage = lazyPage(() => import('@/components/pages/admin/admin-security-page'), 'AdminSecurityPage')
const AdminBackupPage = lazyPage(() => import('@/components/pages/admin/admin-backup-page'), 'AdminBackupPage')
const AdminFeatureFlagsPage = lazyPage(() => import('@/components/pages/admin/admin-feature-flags-page'), 'AdminFeatureFlagsPage')
const AdminProfilePage = lazyPage(() => import('@/components/pages/admin/admin-profile-page'), 'AdminProfilePage')

// ─── Communication Pages (lazy) ────────────────────────────────────────────────
const ChatInboxPage = lazyPage(() => import('@/components/pages/communication/chat-inbox-page'), 'ChatInboxPage')
const ProviderCustomerChatPage = lazyPage(() => import('@/components/pages/communication/provider-customer-chat-page'), 'ProviderCustomerChatPage')
const AdminSupportChatPage = lazyPage(() => import('@/components/pages/communication/admin-support-chat-page'), 'AdminSupportChatPage')
const AttachmentPreviewPage = lazyPage(() => import('@/components/pages/communication/attachment-preview-page'), 'AttachmentPreviewPage')
const VideoConsultationPage = lazyPage(() => import('@/components/pages/communication/video-consultation-page'), 'VideoConsultationPage')
const CallHistoryPage = lazyPage(() => import('@/components/pages/communication/call-history-page'), 'CallHistoryPage')

// ─── Marketing Pages (lazy) ────────────────────────────────────────────────────
const AboutPage = lazyPage(() => import('@/components/pages/marketing/about-page'), 'AboutPage')
const ContactPage = lazyPage(() => import('@/components/pages/marketing/contact-page'), 'ContactPage')
const FaqPage = lazyPage(() => import('@/components/pages/marketing/faq-page'), 'FaqPage')
const HowItWorksPage = lazyPage(() => import('@/components/pages/marketing/how-it-works-page'), 'HowItWorksPage')
const BecomeProviderPage = lazyPage(() => import('@/components/pages/marketing/become-provider-page'), 'BecomeProviderPage')
const CareersPage = lazyPage(() => import('@/components/pages/marketing/careers-page'), 'CareersPage')
const BlogPage = lazyPage(() => import('@/components/pages/marketing/blog-page'), 'BlogPage')
const BlogDetailPage = lazyPage(() => import('@/components/pages/marketing/blog-detail-page'), 'BlogDetailPage')
const PressPage = lazyPage(() => import('@/components/pages/marketing/press-page'), 'PressPage')
const TestimonialsPage = lazyPage(() => import('@/components/pages/marketing/testimonials-page'), 'TestimonialsPage')
const PartnerProgramPage = lazyPage(() => import('@/components/pages/marketing/partner-program-page'), 'PartnerProgramPage')

// ─── Legal Pages (lazy) ────────────────────────────────────────────────────────
const PrivacyPolicyPage = lazyPage(() => import('@/components/pages/legal/privacy-policy-page'), 'PrivacyPolicyPage')
const TermsPage = lazyPage(() => import('@/components/pages/legal/terms-page'), 'TermsPage')
const RefundPolicyPage = lazyPage(() => import('@/components/pages/legal/refund-policy-page'), 'RefundPolicyPage')
const CancellationPolicyPage = lazyPage(() => import('@/components/pages/legal/cancellation-policy-page'), 'CancellationPolicyPage')
const CookiePolicyPage = lazyPage(() => import('@/components/pages/legal/cookie-policy-page'), 'CookiePolicyPage')
const GDPRPage = lazyPage(() => import('@/components/pages/legal/gdpr-page'), 'GDPRPage')

// ─── Advanced Pages (lazy) ─────────────────────────────────────────────────────
const FranchiseDashboardPage = lazyPage(() => import('@/components/pages/advanced/franchise-dashboard-page'), 'FranchiseDashboardPage')
const FranchiseManagementPage = lazyPage(() => import('@/components/pages/advanced/franchise-management-page'), 'FranchiseManagementPage')
const CRMDashboardPage = lazyPage(() => import('@/components/pages/advanced/crm-dashboard-page'), 'CRMDashboardPage')
const LeadManagementPage = lazyPage(() => import('@/components/pages/advanced/lead-management-page'), 'LeadManagementPage')
const VendorManagementPage = lazyPage(() => import('@/components/pages/advanced/vendor-management-page'), 'VendorManagementPage')
const InventoryManagementPage = lazyPage(() => import('@/components/pages/advanced/inventory-management-page'), 'InventoryManagementPage')
const EscrowManagementPage = lazyPage(() => import('@/components/pages/advanced/escrow-management-page'), 'EscrowManagementPage')
const DynamicPricingPage = lazyPage(() => import('@/components/pages/advanced/dynamic-pricing-page'), 'DynamicPricingPage')
const RecommendationEnginePage = lazyPage(() => import('@/components/pages/advanced/recommendation-engine-page'), 'RecommendationEnginePage')
const AISuggestionsPage = lazyPage(() => import('@/components/pages/advanced/ai-suggestions-page'), 'AISuggestionsPage')
const LoyaltyRewardsPage = lazyPage(() => import('@/components/pages/advanced/loyalty-rewards-page'), 'LoyaltyRewardsPage')

// ─── Error Pages (lazy) ────────────────────────────────────────────────────────
const NotFoundPage = lazyPage(() => import('@/components/pages/error/not-found-page'), 'NotFoundPage')
const ServerErrorPage = lazyPage(() => import('@/components/pages/error/server-error-page'), 'ServerErrorPage')
const MaintenancePage = lazyPage(() => import('@/components/pages/error/maintenance-page'), 'MaintenancePage')
const NoInternetPage = lazyPage(() => import('@/components/pages/error/no-internet-page'), 'NoInternetPage')
const AccessDeniedPage = lazyPage(() => import('@/components/pages/error/access-denied-page'), 'AccessDeniedPage')
const SessionExpiredPage = lazyPage(() => import('@/components/pages/error/session-expired-page'), 'SessionExpiredPage')

// ─── PWA Pages (lazy) ──────────────────────────────────────────────────────────
const InstallAppPage = lazyPage(() => import('@/components/pages/pwa/install-app-page'), 'InstallAppPage')
const OfflineSyncPage = lazyPage(() => import('@/components/pages/pwa/offline-sync-page'), 'OfflineSyncPage')
const PushPermissionPage = lazyPage(() => import('@/components/pages/pwa/push-permission-page'), 'PushPermissionPage')
const DeviceSessionsPage = lazyPage(() => import('@/components/pages/pwa/device-sessions-page'), 'DeviceSessionsPage')

import {
  Shield, User, Wrench, ChevronDown, X, Menu, Globe, Lock, Home as HomeIcon,
  LayoutDashboard, Settings, BarChart3, Briefcase, Calendar, Smartphone,
  Megaphone, Scale, MessageSquare, Cpu, AlertTriangle, ShoppingCart, MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function PageLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning ring */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
        {/* Shimmer bars */}
        <div className="w-64 space-y-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
          <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Loading page…</p>
      </div>
    </div>
  )
}

type DashboardRole = 'admin' | 'client' | 'provider'
type PageSection = 'dashboards' | 'public' | 'auth' | 'customer' | 'booking' | 'tracking' | 'provider' | 'admin' | 'communication' | 'marketing' | 'legal' | 'advanced' | 'error' | 'pwa'

const dashboardRoles: { key: DashboardRole; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600' },
  { key: 'client', label: 'Client', icon: User, color: 'text-blue-600' },
  { key: 'provider', label: 'Service Provider', icon: Wrench, color: 'text-emerald-600' },
]

const publicPages = [
  { key: 'home', label: 'Home' },
  { key: 'categories', label: 'Categories' },
  { key: 'service-listing', label: 'Service Listing' },
  { key: 'service-detail', label: 'Service Detail' },
  { key: 'search', label: 'Search' },
  { key: 'nearby-providers', label: 'Nearby Providers' },
  { key: 'featured-services', label: 'Featured Services' },
  { key: 'trending-services', label: 'Trending Services' },
  { key: 'offers-deals', label: 'Offers & Deals' },
  { key: 'popular-providers', label: 'Popular Providers' },
]

const authPages = [
  { key: 'login', label: 'Login' },
  { key: 'signup', label: 'Signup' },
  { key: 'forgot-password', label: 'Forgot Password' },
  { key: 'reset-password', label: 'Reset Password' },
  { key: 'otp-verification', label: 'OTP Verification' },
  { key: 'email-verification', label: 'Email Verification' },
  { key: 'phone-verification', label: 'Phone Verification' },
  { key: 'role-selection', label: 'Role Selection' },
  { key: 'social-callback', label: 'Social Callback' },
]

const customerPages = [
  { key: 'client-dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'client-profile', label: 'Profile', group: 'Main' },
  { key: 'client-edit-profile', label: 'Edit Profile', group: 'Main' },
  { key: 'client-addresses', label: 'Addresses', group: 'Main' },
  { key: 'client-saved-addresses', label: 'Saved Addresses', group: 'Main' },
  { key: 'client-bookings', label: 'Bookings', group: 'Bookings' },
  { key: 'client-booking-detail', label: 'Booking Detail', group: 'Bookings' },
  { key: 'client-upcoming', label: 'Upcoming', group: 'Bookings' },
  { key: 'client-completed', label: 'Completed', group: 'Bookings' },
  { key: 'client-cancelled', label: 'Cancelled', group: 'Bookings' },
  { key: 'client-booking-tracking', label: 'Booking Tracking', group: 'Bookings' },
  { key: 'client-rebook', label: 'Rebook', group: 'Bookings' },
  { key: 'client-invoice', label: 'Invoice', group: 'Bookings' },
  { key: 'client-booking-review', label: 'Booking Review', group: 'Bookings' },
  { key: 'client-favorites', label: 'Favorites', group: 'Finance' },
  { key: 'client-wallet', label: 'Wallet', group: 'Finance' },
  { key: 'client-wallet-transactions', label: 'Wallet Transactions', group: 'Finance' },
  { key: 'client-add-money', label: 'Add Money', group: 'Finance' },
  { key: 'client-coupons', label: 'Coupons', group: 'Finance' },
  { key: 'client-referral', label: 'Referral', group: 'Finance' },
  { key: 'client-amc', label: 'AMC Plans', group: 'Finance' },
  { key: 'client-amc-detail', label: 'AMC Detail', group: 'Finance' },
  { key: 'client-payment-methods', label: 'Payment Methods', group: 'Finance' },
  { key: 'client-transactions', label: 'Transactions', group: 'Finance' },
  { key: 'client-notifications', label: 'Notifications', group: 'Other' },
  { key: 'client-notification-detail', label: 'Notification Detail', group: 'Other' },
  { key: 'client-support', label: 'Support', group: 'Other' },
  { key: 'client-support-detail', label: 'Support Detail', group: 'Other' },
  { key: 'client-chat', label: 'Chat', group: 'Other' },
  { key: 'client-settings', label: 'Settings', group: 'Other' },
  { key: 'client-privacy', label: 'Privacy', group: 'Other' },
]

const bookingPages = [
  { key: 'booking-checkout', label: 'Checkout', group: 'Flow' },
  { key: 'booking-datetime', label: 'Date & Time', group: 'Flow' },
  { key: 'booking-summary', label: 'Summary', group: 'Flow' },
  { key: 'booking-payment', label: 'Payment', group: 'Flow' },
  { key: 'booking-razorpay', label: 'Razorpay', group: 'Flow' },
  { key: 'payment-success', label: 'Payment Success', group: 'Result' },
  { key: 'payment-failed', label: 'Payment Failed', group: 'Result' },
  { key: 'booking-confirmation', label: 'Confirmation', group: 'Result' },
  { key: 'booking-cancellation', label: 'Cancellation', group: 'Result' },
  { key: 'booking-reschedule', label: 'Reschedule', group: 'Result' },
]

const trackingPages = [
  { key: 'live-tracking', label: 'Live Tracking' },
  { key: 'technician-eta', label: 'Technician ETA' },
  { key: 'route-visualization', label: 'Route Visualization' },
  { key: 'booking-timeline', label: 'Booking Timeline' },
  { key: 'technician-contact', label: 'Technician Contact' },
]

const providerPages = [
  { key: 'provider-dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'provider-profile', label: 'Profile', group: 'Main' },
  { key: 'provider-edit-profile', label: 'Edit Profile', group: 'Main' },
  { key: 'provider-kyc', label: 'KYC', group: 'Main' },
  { key: 'provider-upload-docs', label: 'Upload Docs', group: 'Main' },
  { key: 'provider-services', label: 'Services', group: 'Services' },
  { key: 'provider-add-service', label: 'Add Service', group: 'Services' },
  { key: 'provider-edit-service', label: 'Edit Service', group: 'Services' },
  { key: 'provider-delete-service', label: 'Delete Service', group: 'Services' },
  { key: 'provider-bookings', label: 'Bookings', group: 'Bookings' },
  { key: 'provider-booking-requests', label: 'Booking Requests', group: 'Bookings' },
  { key: 'provider-active-jobs', label: 'Active Jobs', group: 'Bookings' },
  { key: 'provider-completed-jobs', label: 'Completed Jobs', group: 'Bookings' },
  { key: 'provider-cancelled-jobs', label: 'Cancelled Jobs', group: 'Bookings' },
  { key: 'provider-earnings', label: 'Earnings', group: 'Finance' },
  { key: 'provider-payouts', label: 'Payouts', group: 'Finance' },
  { key: 'provider-withdraw', label: 'Withdraw', group: 'Finance' },
  { key: 'provider-wallet', label: 'Wallet', group: 'Finance' },
  { key: 'provider-reviews', label: 'Reviews', group: 'Other' },
  { key: 'provider-schedule', label: 'Schedule', group: 'Other' },
  { key: 'provider-availability', label: 'Availability', group: 'Other' },
  { key: 'provider-notifications', label: 'Notifications', group: 'Other' },
  { key: 'provider-chat', label: 'Chat', group: 'Other' },
  { key: 'provider-analytics', label: 'Analytics', group: 'Other' },
  { key: 'provider-support', label: 'Support', group: 'Other' },
  { key: 'provider-subscription', label: 'Subscription', group: 'Other' },
  { key: 'provider-settings', label: 'Settings', group: 'Other' },
]

const communicationPages = [
  { key: 'chat-inbox', label: 'Chat Inbox' },
  { key: 'provider-customer-chat', label: 'Provider-Customer Chat' },
  { key: 'admin-support-chat', label: 'Admin Support Chat' },
  { key: 'attachment-preview', label: 'Attachment Preview' },
  { key: 'video-consultation', label: 'Video Consultation' },
  { key: 'call-history', label: 'Call History' },
]

const marketingPages = [
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
  { key: 'faq', label: 'FAQ' },
  { key: 'how-it-works', label: 'How It Works' },
  { key: 'become-provider', label: 'Become Provider' },
  { key: 'careers', label: 'Careers' },
  { key: 'blog', label: 'Blog' },
  { key: 'blog-detail', label: 'Blog Detail' },
  { key: 'press', label: 'Press' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'partner-program', label: 'Partner Program' },
]

const legalPages = [
  { key: 'privacy-policy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms of Service' },
  { key: 'refund-policy', label: 'Refund Policy' },
  { key: 'cancellation-policy', label: 'Cancellation Policy' },
  { key: 'cookie-policy', label: 'Cookie Policy' },
  { key: 'gdpr', label: 'GDPR' },
]

const advancedPages = [
  { key: 'franchise-dashboard', label: 'Franchise Dashboard', group: 'Franchise' },
  { key: 'franchise-management', label: 'Franchise Management', group: 'Franchise' },
  { key: 'crm-dashboard', label: 'CRM Dashboard', group: 'CRM' },
  { key: 'lead-management', label: 'Lead Management', group: 'CRM' },
  { key: 'vendor-management', label: 'Vendor Management', group: 'Operations' },
  { key: 'inventory-management', label: 'Inventory Management', group: 'Operations' },
  { key: 'escrow-management', label: 'Escrow Management', group: 'Finance' },
  { key: 'dynamic-pricing', label: 'Dynamic Pricing', group: 'Finance' },
  { key: 'recommendation-engine', label: 'Recommendation Engine', group: 'AI' },
  { key: 'ai-suggestions', label: 'AI Suggestions', group: 'AI' },
  { key: 'loyalty-rewards', label: 'Loyalty & Rewards', group: 'AI' },
]

const errorPages = [
  { key: 'not-found', label: '404 Not Found' },
  { key: 'server-error', label: '500 Server Error' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'no-internet', label: 'No Internet' },
  { key: 'access-denied', label: 'Access Denied' },
  { key: 'session-expired', label: 'Session Expired' },
]

const pwaPages = [
  { key: 'install-app', label: 'Install App' },
  { key: 'offline-sync', label: 'Offline & Sync' },
  { key: 'push-permission', label: 'Push Permissions' },
  { key: 'device-sessions', label: 'Device Sessions' },
]

const adminPages = [
  { key: 'admin-dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'admin-analytics', label: 'System Analytics', group: 'Analytics' },
  { key: 'admin-revenue-analytics', label: 'Revenue Analytics', group: 'Analytics' },
  { key: 'admin-booking-analytics', label: 'Booking Analytics', group: 'Analytics' },
  { key: 'admin-user-analytics', label: 'User Analytics', group: 'Analytics' },
  { key: 'admin-provider-analytics', label: 'Provider Analytics', group: 'Analytics' },
  { key: 'admin-customers', label: 'Customers', group: 'Management' },
  { key: 'admin-providers', label: 'Providers', group: 'Management' },
  { key: 'admin-admins', label: 'Admins', group: 'Management' },
  { key: 'admin-roles', label: 'Roles & Permissions', group: 'Management' },
  { key: 'admin-bookings', label: 'Bookings', group: 'Management' },
  { key: 'admin-booking-detail', label: 'Booking Detail', group: 'Management' },
  { key: 'admin-categories', label: 'Categories', group: 'Management' },
  { key: 'admin-coupons', label: 'Coupons', group: 'Management' },
  { key: 'admin-wallets', label: 'Wallets', group: 'Finance' },
  { key: 'admin-payments', label: 'Payments', group: 'Finance' },
  { key: 'admin-refunds', label: 'Refunds', group: 'Finance' },
  { key: 'admin-amc', label: 'AMC Plans', group: 'Finance' },
  { key: 'admin-referrals', label: 'Referrals', group: 'Finance' },
  { key: 'admin-notifications', label: 'Notifications', group: 'Communication' },
  { key: 'admin-reviews', label: 'Reviews', group: 'Communication' },
  { key: 'admin-reports', label: 'Reports', group: 'Communication' },
  { key: 'admin-fraud', label: 'Fraud Detection', group: 'Communication' },
  { key: 'admin-support', label: 'Support', group: 'Communication' },
  { key: 'admin-chat-monitoring', label: 'Chat Monitoring', group: 'Communication' },
  { key: 'admin-cms', label: 'CMS', group: 'System' },
  { key: 'admin-seo', label: 'SEO', group: 'System' },
  { key: 'admin-system-settings', label: 'System Settings', group: 'System' },
  { key: 'admin-api-settings', label: 'API Settings', group: 'System' },
  { key: 'admin-email-templates', label: 'Email Templates', group: 'System' },
  { key: 'admin-sms-templates', label: 'SMS Templates', group: 'System' },
  { key: 'admin-push-notifications', label: 'Push Notifications', group: 'System' },
  { key: 'admin-audit-logs', label: 'Audit Logs', group: 'System' },
  { key: 'admin-security', label: 'Security', group: 'System' },
  { key: 'admin-backup', label: 'Backup', group: 'System' },
  { key: 'admin-feature-flags', label: 'Feature Flags', group: 'System' },
  { key: 'admin-profile', label: 'Profile', group: 'System' },
]

const pageComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // Public
  home: HomePage,
  categories: CategoriesPage,
  'service-listing': ServiceListingPage,
  'service-detail': ServiceDetailPage,
  search: SearchPage,
  'nearby-providers': NearbyProvidersPage,
  'featured-services': FeaturedServicesPage,
  'trending-services': TrendingServicesPage,
  'offers-deals': OffersDealsPage,
  'popular-providers': PopularProvidersPage,
  // Auth
  login: LoginPage,
  signup: SignupPage,
  'forgot-password': ForgotPasswordPage,
  'reset-password': ResetPasswordPage,
  'otp-verification': OtpVerificationPage,
  'email-verification': EmailVerificationPage,
  'phone-verification': PhoneVerificationPage,
  'role-selection': RoleSelectionPage,
  'social-callback': SocialCallbackPage,
  // Customer
  'client-dashboard': ClientDashboardPage,
  'client-profile': ClientProfilePage,
  'client-edit-profile': ClientEditProfilePage,
  'client-addresses': ClientAddressesPage,
  'client-saved-addresses': ClientSavedAddressesPage,
  'client-bookings': ClientBookingsPage,
  'client-booking-detail': ClientBookingDetailPage,
  'client-upcoming': ClientUpcomingPage,
  'client-completed': ClientCompletedPage,
  'client-cancelled': ClientCancelledPage,
  'client-booking-tracking': ClientBookingTrackingPage,
  'client-rebook': ClientRebookPage,
  'client-invoice': ClientInvoicePage,
  'client-booking-review': ClientBookingReviewPage,
  'client-favorites': ClientFavoritesPage,
  'client-wallet': ClientWalletPage,
  'client-wallet-transactions': ClientWalletTransactionsPage,
  'client-add-money': ClientAddMoneyPage,
  'client-coupons': ClientCouponsPage,
  'client-referral': ClientReferralPage,
  'client-amc': ClientAmcPage,
  'client-amc-detail': ClientAmcDetailPage,
  'client-notifications': ClientNotificationsPage,
  'client-notification-detail': ClientNotificationDetailPage,
  'client-support': ClientSupportPage,
  'client-support-detail': ClientSupportDetailPage,
  'client-chat': ClientChatPage,
  'client-settings': ClientSettingsPage,
  'client-privacy': ClientPrivacyPage,
  'client-payment-methods': ClientPaymentMethodsPage,
  'client-transactions': ClientTransactionsPage,
  // Booking
  'booking-checkout': BookingCheckoutPage,
  'booking-datetime': BookingDatetimePage,
  'booking-summary': BookingSummaryPage,
  'booking-payment': BookingPaymentPage,
  'booking-razorpay': BookingRazorpayPage,
  'payment-success': PaymentSuccessPage,
  'payment-failed': PaymentFailedPage,
  'booking-confirmation': BookingConfirmationPage,
  'booking-cancellation': BookingCancellationPage,
  'booking-reschedule': BookingReschedulePage,
  // Tracking
  'live-tracking': LiveTrackingPage,
  'technician-eta': TechnicianEtaPage,
  'route-visualization': RouteVisualizationPage,
  'booking-timeline': BookingTimelinePage,
  'technician-contact': TechnicianContactPage,
  // Provider
  'provider-dashboard': ProviderDashboardPage,
  'provider-profile': ProviderProfilePage,
  'provider-edit-profile': ProviderEditProfilePage,
  'provider-kyc': ProviderKycPage,
  'provider-upload-docs': ProviderUploadDocsPage,
  'provider-services': ProviderServicesPage,
  'provider-add-service': ProviderAddServicePage,
  'provider-edit-service': ProviderEditServicePage,
  'provider-delete-service': ProviderDeleteServicePage,
  'provider-bookings': ProviderBookingsPage,
  'provider-booking-requests': ProviderBookingRequestsPage,
  'provider-active-jobs': ProviderActiveJobsPage,
  'provider-completed-jobs': ProviderCompletedJobsPage,
  'provider-cancelled-jobs': ProviderCancelledJobsPage,
  'provider-earnings': ProviderEarningsPage,
  'provider-payouts': ProviderPayoutsPage,
  'provider-withdraw': ProviderWithdrawPage,
  'provider-wallet': ProviderWalletPage,
  'provider-reviews': ProviderReviewsPage,
  'provider-schedule': ProviderSchedulePage,
  'provider-availability': ProviderAvailabilityPage,
  'provider-notifications': ProviderNotificationsPage,
  'provider-chat': ProviderChatPage,
  'provider-analytics': ProviderAnalyticsPage,
  'provider-support': ProviderSupportPage,
  'provider-subscription': ProviderSubscriptionPage,
  'provider-settings': ProviderSettingsPage,
  // Admin
  'admin-dashboard': AdminDashboardPage,
  'admin-analytics': AdminAnalyticsPage,
  'admin-revenue-analytics': AdminRevenueAnalyticsPage,
  'admin-booking-analytics': AdminBookingAnalyticsPage,
  'admin-user-analytics': AdminUserAnalyticsPage,
  'admin-provider-analytics': AdminProviderAnalyticsPage,
  'admin-customers': AdminCustomersPage,
  'admin-providers': AdminProvidersPage,
  'admin-admins': AdminAdminsPage,
  'admin-roles': AdminRolesPage,
  'admin-bookings': AdminBookingsPage,
  'admin-booking-detail': AdminBookingDetailPage,
  'admin-categories': AdminCategoriesPage,
  'admin-coupons': AdminCouponsPage,
  'admin-wallets': AdminWalletsPage,
  'admin-payments': AdminPaymentsPage,
  'admin-refunds': AdminRefundsPage,
  'admin-amc': AdminAmcPage,
  'admin-referrals': AdminReferralsPage,
  'admin-notifications': AdminNotificationsPage,
  'admin-reviews': AdminReviewsPage,
  'admin-reports': AdminReportsPage,
  'admin-fraud': AdminFraudPage,
  'admin-support': AdminSupportPage,
  'admin-chat-monitoring': AdminChatMonitoringPage,
  'admin-cms': AdminCmsPage,
  'admin-seo': AdminSeoPage,
  'admin-system-settings': AdminSystemSettingsPage,
  'admin-api-settings': AdminApiSettingsPage,
  'admin-email-templates': AdminEmailTemplatesPage,
  'admin-sms-templates': AdminSmsTemplatesPage,
  'admin-push-notifications': AdminPushNotificationsPage,
  'admin-audit-logs': AdminAuditLogsPage,
  'admin-security': AdminSecurityPage,
  'admin-backup': AdminBackupPage,
  'admin-feature-flags': AdminFeatureFlagsPage,
  'admin-profile': AdminProfilePage,
  // Communication
  'chat-inbox': ChatInboxPage,
  'provider-customer-chat': ProviderCustomerChatPage,
  'admin-support-chat': AdminSupportChatPage,
  'attachment-preview': AttachmentPreviewPage,
  'video-consultation': VideoConsultationPage,
  'call-history': CallHistoryPage,
  // Marketing
  about: AboutPage,
  contact: ContactPage,
  faq: FaqPage,
  'how-it-works': HowItWorksPage,
  'become-provider': BecomeProviderPage,
  careers: CareersPage,
  blog: BlogPage,
  'blog-detail': BlogDetailPage,
  press: PressPage,
  testimonials: TestimonialsPage,
  'partner-program': PartnerProgramPage,
  // Legal
  'privacy-policy': PrivacyPolicyPage,
  terms: TermsPage,
  'refund-policy': RefundPolicyPage,
  'cancellation-policy': CancellationPolicyPage,
  'cookie-policy': CookiePolicyPage,
  gdpr: GDPRPage,
  // Advanced
  'franchise-dashboard': FranchiseDashboardPage,
  'franchise-management': FranchiseManagementPage,
  'crm-dashboard': CRMDashboardPage,
  'lead-management': LeadManagementPage,
  'vendor-management': VendorManagementPage,
  'inventory-management': InventoryManagementPage,
  'escrow-management': EscrowManagementPage,
  'dynamic-pricing': DynamicPricingPage,
  'recommendation-engine': RecommendationEnginePage,
  'ai-suggestions': AISuggestionsPage,
  'loyalty-rewards': LoyaltyRewardsPage,
  // Error
  'not-found': NotFoundPage,
  'server-error': ServerErrorPage,
  maintenance: MaintenancePage,
  'no-internet': NoInternetPage,
  'access-denied': AccessDeniedPage,
  'session-expired': SessionExpiredPage,
  // PWA
  'install-app': InstallAppPage,
  'offline-sync': OfflineSyncPage,
  'push-permission': PushPermissionPage,
  'device-sessions': DeviceSessionsPage,
}

function groupPages(pages: { key: string; label: string; group: string }[]) {
  const groups: Record<string, typeof pages> = {}
  for (const page of pages) {
    if (!groups[page.group]) groups[page.group] = []
    groups[page.group].push(page)
  }
  return groups
}

interface SidebarSection {
  id: PageSection
  label: string
  icon: React.ElementType
  count: number
  color: string
  defaultPage: string
}

const sidebarSections: SidebarSection[] = [
  { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard, count: 3, color: 'blue', defaultPage: '' },
  { id: 'public', label: 'Public', icon: Globe, count: 10, color: 'blue', defaultPage: 'home' },
  { id: 'auth', label: 'Auth', icon: Lock, count: 9, color: 'blue', defaultPage: 'login' },
  { id: 'customer', label: 'Customer', icon: User, count: 31, color: 'cyan', defaultPage: 'client-dashboard' },
  { id: 'booking', label: 'Booking', icon: ShoppingCart, count: 10, color: 'purple', defaultPage: 'booking-checkout' },
  { id: 'tracking', label: 'Tracking', icon: MapPin, count: 5, color: 'orange', defaultPage: 'live-tracking' },
  { id: 'provider', label: 'Provider', icon: Wrench, count: 27, color: 'emerald', defaultPage: 'provider-dashboard' },
  { id: 'admin', label: 'Admin', icon: Shield, count: 37, color: 'red', defaultPage: 'admin-dashboard' },
  { id: 'communication', label: 'Communication', icon: MessageSquare, count: 6, color: 'teal', defaultPage: 'chat-inbox' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, count: 11, color: 'amber', defaultPage: 'about' },
  { id: 'legal', label: 'Legal', icon: Scale, count: 6, color: 'slate', defaultPage: 'privacy-policy' },
  { id: 'advanced', label: 'Advanced', icon: Cpu, count: 11, color: 'violet', defaultPage: 'franchise-dashboard' },
  { id: 'error', label: 'Error', icon: AlertTriangle, count: 6, color: 'rose', defaultPage: 'not-found' },
  { id: 'pwa', label: 'PWA', icon: Smartphone, count: 4, color: 'indigo', defaultPage: 'install-app' },
]

const sectionColorMap: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', activeBg: 'bg-blue-100', activeText: 'text-blue-700' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', activeBg: 'bg-cyan-100', activeText: 'text-cyan-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', activeBg: 'bg-purple-100', activeText: 'text-purple-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', activeBg: 'bg-orange-100', activeText: 'text-orange-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-100', activeText: 'text-emerald-700' },
  red: { bg: 'bg-red-50', text: 'text-red-600', activeBg: 'bg-red-100', activeText: 'text-red-700' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', activeBg: 'bg-teal-100', activeText: 'text-teal-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', activeBg: 'bg-amber-100', activeText: 'text-amber-700' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', activeBg: 'bg-slate-200', activeText: 'text-slate-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', activeBg: 'bg-violet-100', activeText: 'text-violet-700' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', activeBg: 'bg-rose-100', activeText: 'text-rose-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-100', activeText: 'text-indigo-700' },
}

export default function Home() {
  const [activeDashboardRole, setActiveDashboardRole] = useState<DashboardRole>('admin')
  const [activeSection, setActiveSection] = useState<PageSection>('dashboards')
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentRole = dashboardRoles.find(r => r.key === activeDashboardRole)!

  const getPageList = (section: PageSection) => {
    switch (section) {
      case 'public': return publicPages
      case 'auth': return authPages
      case 'customer': return customerPages
      case 'booking': return bookingPages
      case 'tracking': return trackingPages
      case 'provider': return providerPages
      case 'admin': return adminPages
      case 'communication': return communicationPages
      case 'marketing': return marketingPages
      case 'legal': return legalPages
      case 'advanced': return advancedPages
      case 'error': return errorPages
      case 'pwa': return pwaPages
      default: return []
    }
  }

  const getCurrentPageLabel = () => {
    if (activeSection === 'dashboards') return `${currentRole.label} Dashboard`
    const pages = getPageList(activeSection) as { key: string; label: string; group?: string }[]
    return pages.find(p => p.key === activePage)?.label || ''
  }

  const getSectionLabel = () => {
    const section = sidebarSections.find(s => s.id === activeSection)
    return section?.label || ''
  }

  const renderPageList = (section: PageSection) => {
    const pages = getPageList(section)
    const colors = sectionColorMap[sidebarSections.find(s => s.id === section)?.color || 'blue']

    if ('group' in pages[0] && pages[0].group) {
      const grouped = groupPages(pages as { key: string; label: string; group: string }[])
      return (
        <div className="ml-4 mt-1 space-y-1">
          {Object.entries(grouped).map(([group, groupPages]) => (
            <div key={group}>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{group}</p>
              {groupPages.map((page) => (
                <button key={page.key} onClick={() => setActivePage(page.key)}
                  className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                    activePage === page.key ? `${colors.activeBg} ${colors.activeText} font-semibold` : 'text-slate-500 hover:bg-slate-50')}>
                  {page.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="ml-4 mt-1 space-y-0.5">
        {(pages as { key: string; label: string }[]).map((page) => (
          <button key={page.key} onClick={() => setActivePage(page.key)}
            className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
              activePage === page.key ? `${colors.activeBg} ${colors.activeText} font-semibold` : 'text-slate-500 hover:bg-slate-50')}>
            {page.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className={cn(
        'bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0 z-50',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">B</div>
            <span className="font-bold text-slate-900">BookMyService</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          {sidebarSections.map((section) => {
            const colors = sectionColorMap[section.color]
            const isActive = activeSection === section.id
            return (
              <div key={section.id}>
                <button
                  onClick={() => {
                    setActiveSection(section.id)
                    if (section.id !== 'dashboards' && section.defaultPage) setActivePage(section.defaultPage)
                  }}
                  className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? `${colors.bg} ${colors.text}` : 'text-slate-600 hover:bg-slate-50')}
                >
                  <section.icon className="size-4" />
                  <span className="flex-1 text-left">{section.label}</span>
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                    isActive ? `${colors.activeBg} ${colors.activeText}` : 'bg-slate-100 text-slate-400'
                  )}>
                    {section.count}
                  </span>
                </button>
                {isActive && section.id === 'dashboards' && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {dashboardRoles.map((role) => (
                      <button key={role.key} onClick={() => setActiveDashboardRole(role.key)}
                        className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors',
                          activeDashboardRole === role.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50')}>
                        <role.icon className="size-3.5" /> {role.label}
                      </button>
                    ))}
                  </div>
                )}
                {isActive && section.id !== 'dashboards' && renderPageList(section.id)}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">174 Pages • 3 Dashboards • 14 Sections</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            {sidebarOpen ? <X className="size-5 text-slate-500" /> : <Menu className="size-5 text-slate-500" />}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">{getSectionLabel()}</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{getCurrentPageLabel()}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {activeSection === 'dashboards' && (
            <div className="transition-opacity duration-300">
              {activeDashboardRole === 'admin' && <AdminDashboard />}
              {activeDashboardRole === 'client' && <ClientDashboard />}
              {activeDashboardRole === 'provider' && <ProviderDashboard />}
            </div>
          )}
          {activeSection !== 'dashboards' && (
            <Suspense fallback={<PageLoadingSkeleton />}>
              {(() => {
                const PageComponent = pageComponents[activePage]
                return PageComponent ? <PageComponent /> : <div className="p-8 text-center text-slate-400">Page not found</div>
              })()}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  )
}

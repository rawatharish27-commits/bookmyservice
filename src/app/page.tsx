'use client'

import { useState } from 'react'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { ClientDashboard } from '@/components/dashboards/client-dashboard'
import { ProviderDashboard } from '@/components/dashboards/provider-dashboard'
import { HomePage } from '@/components/pages/public/home-page'
import { CategoriesPage } from '@/components/pages/public/categories-page'
import { ServiceListingPage } from '@/components/pages/public/service-listing-page'
import { ServiceDetailPage } from '@/components/pages/public/service-detail-page'
import { SearchPage } from '@/components/pages/public/search-page'
import { NearbyProvidersPage } from '@/components/pages/public/nearby-providers-page'
import { FeaturedServicesPage } from '@/components/pages/public/featured-services-page'
import { TrendingServicesPage } from '@/components/pages/public/trending-services-page'
import { OffersDealsPage } from '@/components/pages/public/offers-deals-page'
import { PopularProvidersPage } from '@/components/pages/public/popular-providers-page'
import { LoginPage } from '@/components/pages/auth/login-page'
import { SignupPage } from '@/components/pages/auth/signup-page'
import { ForgotPasswordPage } from '@/components/pages/auth/forgot-password-page'
import { ResetPasswordPage } from '@/components/pages/auth/reset-password-page'
import { OtpVerificationPage } from '@/components/pages/auth/otp-verification-page'
import { EmailVerificationPage } from '@/components/pages/auth/email-verification-page'
import { PhoneVerificationPage } from '@/components/pages/auth/phone-verification-page'
import { RoleSelectionPage } from '@/components/pages/auth/role-selection-page'
import { SocialCallbackPage } from '@/components/pages/auth/social-callback-page'
// Provider Pages
import { ProviderDashboardPage } from '@/components/pages/provider/provider-dashboard-page'
import { ProviderProfilePage } from '@/components/pages/provider/provider-profile-page'
import { ProviderEditProfilePage } from '@/components/pages/provider/provider-edit-profile-page'
import { ProviderKycPage } from '@/components/pages/provider/provider-kyc-page'
import { ProviderUploadDocsPage } from '@/components/pages/provider/provider-upload-docs-page'
import { ProviderServicesPage } from '@/components/pages/provider/provider-services-page'
import { ProviderAddServicePage } from '@/components/pages/provider/provider-add-service-page'
import { ProviderEditServicePage } from '@/components/pages/provider/provider-edit-service-page'
import { ProviderDeleteServicePage } from '@/components/pages/provider/provider-delete-service-page'
import { ProviderBookingsPage } from '@/components/pages/provider/provider-bookings-page'
import { ProviderBookingRequestsPage } from '@/components/pages/provider/provider-booking-requests-page'
import { ProviderActiveJobsPage } from '@/components/pages/provider/provider-active-jobs-page'
import { ProviderCompletedJobsPage } from '@/components/pages/provider/provider-completed-jobs-page'
import { ProviderCancelledJobsPage } from '@/components/pages/provider/provider-cancelled-jobs-page'
import { ProviderEarningsPage } from '@/components/pages/provider/provider-earnings-page'
import { ProviderPayoutsPage } from '@/components/pages/provider/provider-payouts-page'
import { ProviderWithdrawPage } from '@/components/pages/provider/provider-withdraw-page'
import { ProviderWalletPage } from '@/components/pages/provider/provider-wallet-page'
import { ProviderReviewsPage } from '@/components/pages/provider/provider-reviews-page'
import { ProviderSchedulePage } from '@/components/pages/provider/provider-schedule-page'
import { ProviderAvailabilityPage } from '@/components/pages/provider/provider-availability-page'
import { ProviderNotificationsPage } from '@/components/pages/provider/provider-notifications-page'
import { ProviderChatPage } from '@/components/pages/provider/provider-chat-page'
import { ProviderAnalyticsPage } from '@/components/pages/provider/provider-analytics-page'
import { ProviderSupportPage } from '@/components/pages/provider/provider-support-page'
import { ProviderSubscriptionPage } from '@/components/pages/provider/provider-subscription-page'
import { ProviderSettingsPage } from '@/components/pages/provider/provider-settings-page'
// Admin Pages
import { AdminDashboardPage } from '@/components/pages/admin/admin-dashboard-page'
import { AdminAnalyticsPage } from '@/components/pages/admin/admin-analytics-page'
import { AdminRevenueAnalyticsPage } from '@/components/pages/admin/admin-revenue-analytics-page'
import { AdminBookingAnalyticsPage } from '@/components/pages/admin/admin-booking-analytics-page'
import { AdminUserAnalyticsPage } from '@/components/pages/admin/admin-user-analytics-page'
import { AdminProviderAnalyticsPage } from '@/components/pages/admin/admin-provider-analytics-page'
import { AdminCustomersPage } from '@/components/pages/admin/admin-customers-page'
import { AdminProvidersPage } from '@/components/pages/admin/admin-providers-page'
import { AdminAdminsPage } from '@/components/pages/admin/admin-admins-page'
import { AdminRolesPage } from '@/components/pages/admin/admin-roles-page'
import { AdminBookingsPage } from '@/components/pages/admin/admin-bookings-page'
import { AdminBookingDetailPage } from '@/components/pages/admin/admin-booking-detail-page'
import { AdminCategoriesPage } from '@/components/pages/admin/admin-categories-page'
import { AdminCouponsPage } from '@/components/pages/admin/admin-coupons-page'
import { AdminWalletsPage } from '@/components/pages/admin/admin-wallets-page'
import { AdminPaymentsPage } from '@/components/pages/admin/admin-payments-page'
import { AdminRefundsPage } from '@/components/pages/admin/admin-refunds-page'
import { AdminAmcPage } from '@/components/pages/admin/admin-amc-page'
import { AdminReferralsPage } from '@/components/pages/admin/admin-referrals-page'
import { AdminNotificationsPage } from '@/components/pages/admin/admin-notifications-page'
import { AdminReviewsPage } from '@/components/pages/admin/admin-reviews-page'
import { AdminReportsPage } from '@/components/pages/admin/admin-reports-page'
import { AdminFraudPage } from '@/components/pages/admin/admin-fraud-page'
import { AdminSupportPage } from '@/components/pages/admin/admin-support-page'
import { AdminChatMonitoringPage } from '@/components/pages/admin/admin-chat-monitoring-page'
import { AdminCmsPage } from '@/components/pages/admin/admin-cms-page'
import { AdminSeoPage } from '@/components/pages/admin/admin-seo-page'
import { AdminSystemSettingsPage } from '@/components/pages/admin/admin-system-settings-page'
import { AdminApiSettingsPage } from '@/components/pages/admin/admin-api-settings-page'
import { AdminEmailTemplatesPage } from '@/components/pages/admin/admin-email-templates-page'
import { AdminSmsTemplatesPage } from '@/components/pages/admin/admin-sms-templates-page'
import { AdminPushNotificationsPage } from '@/components/pages/admin/admin-push-notifications-page'
import { AdminAuditLogsPage } from '@/components/pages/admin/admin-audit-logs-page'
import { AdminSecurityPage } from '@/components/pages/admin/admin-security-page'
import { AdminBackupPage } from '@/components/pages/admin/admin-backup-page'
import { AdminFeatureFlagsPage } from '@/components/pages/admin/admin-feature-flags-page'
import { AdminProfilePage } from '@/components/pages/admin/admin-profile-page'
import { Shield, User, Wrench, ChevronDown, X, Menu, Globe, Lock, Home as HomeIcon, LayoutDashboard, Settings, BarChart3, Briefcase, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

type DashboardRole = 'admin' | 'client' | 'provider'
type PageSection = 'dashboards' | 'public' | 'auth' | 'provider' | 'admin'

const dashboardRoles: { key: DashboardRole; label: string; icon: React.ElementType; color: string; bgGradient: string }[] = [
  { key: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600', bgGradient: 'from-red-500 to-orange-500' },
  { key: 'client', label: 'Client', icon: User, color: 'text-blue-600', bgGradient: 'from-blue-500 to-cyan-500' },
  { key: 'provider', label: 'Service Provider', icon: Wrench, color: 'text-emerald-600', bgGradient: 'from-emerald-500 to-teal-500' },
]

const publicPages = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'categories', label: 'Categories', icon: Globe },
  { key: 'service-listing', label: 'Service Listing', icon: Globe },
  { key: 'service-detail', label: 'Service Detail', icon: Globe },
  { key: 'search', label: 'Search', icon: Globe },
  { key: 'nearby-providers', label: 'Nearby Providers', icon: Globe },
  { key: 'featured-services', label: 'Featured Services', icon: Globe },
  { key: 'trending-services', label: 'Trending Services', icon: Globe },
  { key: 'offers-deals', label: 'Offers & Deals', icon: Globe },
  { key: 'popular-providers', label: 'Popular Providers', icon: Globe },
]

const authPages = [
  { key: 'login', label: 'Login', icon: Lock },
  { key: 'signup', label: 'Signup', icon: Lock },
  { key: 'forgot-password', label: 'Forgot Password', icon: Lock },
  { key: 'reset-password', label: 'Reset Password', icon: Lock },
  { key: 'otp-verification', label: 'OTP Verification', icon: Lock },
  { key: 'email-verification', label: 'Email Verification', icon: Lock },
  { key: 'phone-verification', label: 'Phone Verification', icon: Lock },
  { key: 'role-selection', label: 'Role Selection', icon: Lock },
  { key: 'social-callback', label: 'Social Callback', icon: Lock },
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

const pageComponents: Record<string, React.ComponentType> = {
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
  login: LoginPage,
  signup: SignupPage,
  'forgot-password': ForgotPasswordPage,
  'reset-password': ResetPasswordPage,
  'otp-verification': OtpVerificationPage,
  'email-verification': EmailVerificationPage,
  'phone-verification': PhoneVerificationPage,
  'role-selection': RoleSelectionPage,
  'social-callback': SocialCallbackPage,
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
}

function groupPages(pages: { key: string; label: string; group: string }[]) {
  const groups: Record<string, typeof pages> = {}
  for (const page of pages) {
    if (!groups[page.group]) groups[page.group] = []
    groups[page.group].push(page)
  }
  return groups
}

export default function Home() {
  const [activeDashboardRole, setActiveDashboardRole] = useState<DashboardRole>('admin')
  const [activeSection, setActiveSection] = useState<PageSection>('dashboards')
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentRole = dashboardRoles.find(r => r.key === activeDashboardRole)!

  const getCurrentPageLabel = () => {
    if (activeSection === 'dashboards') return `${currentRole.label} Dashboard`
    if (activeSection === 'provider') return providerPages.find(p => p.key === activePage)?.label || ''
    if (activeSection === 'admin') return adminPages.find(p => p.key === activePage)?.label || ''
    const pages = activeSection === 'public' ? publicPages : authPages
    return pages.find(p => p.key === activePage)?.label || ''
  }

  const getSectionLabel = () => {
    if (activeSection === 'dashboards') return 'Dashboards'
    if (activeSection === 'provider') return 'Provider'
    if (activeSection === 'admin') return 'Admin'
    if (activeSection === 'public') return 'Public'
    return 'Auth'
  }

  const providerGroups = groupPages(providerPages)
  const adminGroups = groupPages(adminPages)

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="font-bold text-slate-900">ServiceHub</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Dashboards Section */}
          <div>
            <button onClick={() => setActiveSection('dashboards')}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'dashboards' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50')}>
              <LayoutDashboard className="size-4" /> Dashboards
            </button>
            {activeSection === 'dashboards' && (
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
          </div>

          {/* Public Pages */}
          <div>
            <button onClick={() => { setActiveSection('public'); setActivePage('home') }}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'public' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50')}>
              <Globe className="size-4" /> Public Pages
            </button>
            {activeSection === 'public' && (
              <div className="ml-4 mt-1 space-y-0.5">
                {publicPages.map((page) => (
                  <button key={page.key} onClick={() => setActivePage(page.key)}
                    className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                      activePage === page.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50')}>
                    {page.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Pages */}
          <div>
            <button onClick={() => { setActiveSection('auth'); setActivePage('login') }}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'auth' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50')}>
              <Lock className="size-4" /> Auth Pages
            </button>
            {activeSection === 'auth' && (
              <div className="ml-4 mt-1 space-y-0.5">
                {authPages.map((page) => (
                  <button key={page.key} onClick={() => setActivePage(page.key)}
                    className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                      activePage === page.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50')}>
                    {page.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Provider Pages */}
          <div>
            <button onClick={() => { setActiveSection('provider'); setActivePage('provider-dashboard') }}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'provider' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50')}>
              <Wrench className="size-4" /> Provider (27)
            </button>
            {activeSection === 'provider' && (
              <div className="ml-4 mt-1 space-y-1">
                {Object.entries(providerGroups).map(([group, pages]) => (
                  <div key={group}>
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{group}</p>
                    {pages.map((page) => (
                      <button key={page.key} onClick={() => setActivePage(page.key)}
                        className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                          activePage === page.key ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'text-slate-500 hover:bg-slate-50')}>
                        {page.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Pages */}
          <div>
            <button onClick={() => { setActiveSection('admin'); setActivePage('admin-dashboard') }}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'admin' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50')}>
              <Shield className="size-4" /> Admin (37)
            </button>
            {activeSection === 'admin' && (
              <div className="ml-4 mt-1 space-y-1">
                {Object.entries(adminGroups).map(([group, pages]) => (
                  <div key={group}>
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{group}</p>
                    {pages.map((page) => (
                      <button key={page.key} onClick={() => setActivePage(page.key)}
                        className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                          activePage === page.key ? 'bg-red-100 text-red-700 font-semibold' : 'text-slate-500 hover:bg-slate-50')}>
                        {page.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">83 Pages • 3 Dashboards</p>
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
          {(activeSection === 'public' || activeSection === 'auth' || activeSection === 'provider' || activeSection === 'admin') && (() => {
            const PageComponent = pageComponents[activePage]
            return PageComponent ? <PageComponent /> : <div className="p-8 text-center text-slate-400">Page not found</div>
          })()}
        </main>
      </div>
    </div>
  )
}

/**
 * Modular route registry for the BookMyService application.
 *
 * All route definitions live here as a data structure, replacing the giant
 * switch statement that was previously in App.tsx.  Each entry carries its
 * own dynamic-import loader so that code-splitting / lazy loading is
 * preserved on a per-route basis.
 *
 * Routes are grouped by feature for readability, but the master registry
 * (`ALL_ROUTES`) and the O(1) lookup map (`ROUTE_MAP`) are what the
 * renderer actually consumes.
 */

import type { RouteConfig, Page } from './types';

// ---------------------------------------------------------------------------
// Public pages — no authentication required
// ---------------------------------------------------------------------------
export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    page: 'home',
    loader: () => import('@/components/bys/home-page').then(m => ({ default: m.HomePage })),
    chunkName: 'public-home',
    isProtected: false,
  },
  {
    page: 'categories',
    loader: () => import('@/components/bys/categories-page').then(m => ({ default: m.CategoriesPage })),
    chunkName: 'public-categories',
    isProtected: false,
  },
  {
    page: 'category-detail',
    loader: () => import('@/components/bys/category-detail-page').then(m => ({ default: m.CategoryDetailPage })),
    chunkName: 'public-category-detail',
    isProtected: false,
  },
  {
    page: 'service-detail',
    loader: () => import('@/components/bys/service-detail-page').then(m => ({ default: m.ServiceDetailPage })),
    chunkName: 'public-service-detail',
    isProtected: false,
  },
  {
    page: 'search',
    loader: () => import('@/components/bys/search-page').then(m => ({ default: m.SearchPage })),
    chunkName: 'public-search',
    isProtected: false,
  },
  {
    page: 'about',
    loader: () => import('@/components/bys/about-page').then(m => ({ default: m.AboutPage })),
    chunkName: 'public-about',
    isProtected: false,
  },
  {
    page: 'how-it-works',
    loader: () => import('@/components/bys/how-it-works-page').then(m => ({ default: m.HowItWorksPage })),
    chunkName: 'public-how-it-works',
    isProtected: false,
  },
  {
    page: 'faq',
    loader: () => import('@/components/bys/faq-page').then(m => ({ default: m.FaqPage })),
    chunkName: 'public-faq',
    isProtected: false,
  },
  {
    page: 'contact',
    loader: () => import('@/components/bys/contact-page').then(m => ({ default: m.ContactPage })),
    chunkName: 'public-contact',
    isProtected: false,
  },
  // Legal / static pages — all rendered by LegalPage with a `type` prop
  {
    page: 'terms',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'terms' },
  },
  {
    page: 'privacy',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'privacy' },
  },
  {
    page: 'refund-policy',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'refund-policy' },
  },
  {
    page: 'cookie-policy',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'cookie-policy' },
  },
  {
    page: 'aup',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'aup' },
  },
  {
    page: 'provider-agreement',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'provider-agreement' },
  },
  {
    page: 'community-guidelines',
    loader: () => import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
    chunkName: 'public-legal',
    isProtected: false,
    props: { type: 'community-guidelines' },
  },
];

// ---------------------------------------------------------------------------
// Auth pages — login / register (no authentication required)
// ---------------------------------------------------------------------------
export const AUTH_ROUTES: RouteConfig[] = [
  {
    page: 'login',
    loader: () => import('@/components/bys/login-page').then(m => ({ default: m.LoginPage })),
    chunkName: 'auth-login',
    isProtected: false,
  },
  {
    page: 'admin-login',
    loader: () => import('@/components/bys/admin-login-page').then(m => ({ default: m.AdminLoginPage })),
    chunkName: 'auth-admin-login',
    isProtected: false,
  },
  {
    page: 'register',
    loader: () => import('@/components/bys/register-page').then(m => ({ default: m.RegisterPage })),
    chunkName: 'auth-register',
    isProtected: false,
  },
];

// ---------------------------------------------------------------------------
// Booking pages — require authentication
// ---------------------------------------------------------------------------
export const BOOKING_ROUTES: RouteConfig[] = [
  {
    page: 'booking',
    loader: () => import('@/components/bys/booking-page').then(m => ({ default: m.BookingPage })),
    chunkName: 'booking',
    isProtected: true,
  },
  {
    page: 'booking-confirmation',
    loader: () => import('@/components/bys/booking-confirmation-page').then(m => ({ default: m.BookingConfirmationPage })),
    chunkName: 'booking-confirmation',
    isProtected: true,
  },
  {
    page: 'client-payment',
    loader: () => import('@/components/bys/payment-page').then(m => ({ default: m.PaymentPage })),
    chunkName: 'booking-payment',
    isProtected: true,
  },
  {
    page: 'booking-tracking',
    loader: () => import('@/components/bys/booking-tracking-page').then(m => ({ default: m.BookingTrackingPage })),
    chunkName: 'booking-tracking',
    isProtected: true,
  },
  {
    page: 'emergency-booking',
    loader: () => import('@/components/bys/emergency-booking-page').then(m => ({ default: m.EmergencyBookingPage })),
    chunkName: 'booking-emergency',
    isProtected: true,
  },
];

// ---------------------------------------------------------------------------
// Client pages — roleId 1
// ---------------------------------------------------------------------------
export const CLIENT_ROUTES: RouteConfig[] = [
  {
    page: 'client-dashboard',
    loader: () => import('@/components/bys/client-dashboard-page').then(m => ({ default: m.ClientDashboardPage })),
    chunkName: 'client-dashboard',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-bookings',
    loader: () => import('@/components/bys/client-bookings-page').then(m => ({ default: m.ClientBookingsPage })),
    chunkName: 'client-bookings',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-booking-detail',
    loader: () => import('@/components/bys/client-booking-detail-page').then(m => ({ default: m.ClientBookingDetailPage })),
    chunkName: 'client-booking-detail',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-profile',
    loader: () => import('@/components/bys/client-profile-page').then(m => ({ default: m.ClientProfilePage })),
    chunkName: 'client-profile',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-reviews',
    loader: () => import('@/components/bys/client-reviews-page').then(m => ({ default: m.ClientReviewsPage })),
    chunkName: 'client-reviews',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-favorites',
    loader: () => import('@/components/bys/client-favorites-page').then(m => ({ default: m.ClientFavoritesPage })),
    chunkName: 'client-favorites',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-notifications',
    loader: () => import('@/components/bys/client-notifications-page').then(m => ({ default: m.ClientNotificationsPage })),
    chunkName: 'client-notifications',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-wallet',
    loader: () => import('@/components/bys/client-wallet-page').then(m => ({ default: m.ClientWalletPage })),
    chunkName: 'client-wallet',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-amc',
    loader: () => import('@/components/bys/client-amc-page').then(m => ({ default: m.ClientAmcPage })),
    chunkName: 'client-amc',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-amc-detail',
    loader: () => import('@/components/bys/client-amc-detail-page').then(m => ({ default: m.ClientAmcDetailPage })),
    chunkName: 'client-amc-detail',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-coupons',
    loader: () => import('@/components/bys/client-coupons-page').then(m => ({ default: m.ClientCouponsPage })),
    chunkName: 'client-coupons',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-referrals',
    loader: () => import('@/components/bys/client-referrals-page').then(m => ({ default: m.ClientReferralsPage })),
    chunkName: 'client-referrals',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-invoices',
    loader: () => import('@/components/bys/client-invoices-page').then(m => ({ default: m.ClientInvoicesPage })),
    chunkName: 'client-invoices',
    isProtected: true,
    allowedRoles: [1],
  },
  {
    page: 'client-invoice-detail',
    loader: () => import('@/components/bys/client-invoice-detail-page').then(m => ({ default: m.ClientInvoiceDetailPage })),
    chunkName: 'client-invoice-detail',
    isProtected: true,
    allowedRoles: [1],
  },
  // client-commissions renders ClientReferralsPage (legacy alias, Old #7/#30/#57 fix)
  {
    page: 'client-commissions',
    loader: () => import('@/components/bys/client-referrals-page').then(m => ({ default: m.ClientReferralsPage })),
    chunkName: 'client-referrals',
    isProtected: true,
    allowedRoles: [1],
  },
];

// ---------------------------------------------------------------------------
// Provider pages — roleId 2
// ---------------------------------------------------------------------------
export const PROVIDER_ROUTES: RouteConfig[] = [
  {
    page: 'provider-dashboard',
    loader: () => import('@/components/bys/provider-dashboard-page').then(m => ({ default: m.ProviderDashboardPage })),
    chunkName: 'provider-dashboard',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-services',
    loader: () => import('@/components/bys/provider-services-page').then(m => ({ default: m.ProviderServicesPage })),
    chunkName: 'provider-services',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-create-service',
    loader: () => import('@/components/bys/provider-create-service-page').then(m => ({ default: m.ProviderCreateServicePage })),
    chunkName: 'provider-create-service',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-bookings',
    loader: () => import('@/components/bys/provider-bookings-page').then(m => ({ default: m.ProviderBookingsPage })),
    chunkName: 'provider-bookings',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-booking-detail',
    loader: () => import('@/components/bys/provider-booking-detail-page').then(m => ({ default: m.ProviderBookingDetailPage })),
    chunkName: 'provider-booking-detail',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-earnings',
    loader: () => import('@/components/bys/provider-earnings-page').then(m => ({ default: m.ProviderEarningsPage })),
    chunkName: 'provider-earnings',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-reviews',
    loader: () => import('@/components/bys/provider-reviews-page').then(m => ({ default: m.ProviderReviewsPage })),
    chunkName: 'provider-reviews',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-profile',
    loader: () => import('@/components/bys/provider-profile-page').then(m => ({ default: m.ProviderProfilePage })),
    chunkName: 'provider-profile',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-kyc',
    loader: () => import('@/components/bys/provider-kyc-page').then(m => ({ default: m.ProviderKycPage })),
    chunkName: 'provider-kyc',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-wallet',
    loader: () => import('@/components/bys/provider-wallet-page').then(m => ({ default: m.ProviderWalletPage })),
    chunkName: 'provider-wallet',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-payouts',
    loader: () => import('@/components/bys/provider-payouts-page').then(m => ({ default: m.ProviderPayoutsPage })),
    chunkName: 'provider-payouts',
    isProtected: true,
    allowedRoles: [2],
  },
  {
    page: 'provider-invoices',
    loader: () => import('@/components/bys/provider-invoices-page').then(m => ({ default: m.ProviderInvoicesPage })),
    chunkName: 'provider-invoices',
    isProtected: true,
    allowedRoles: [2],
  },
];

// ---------------------------------------------------------------------------
// Technician pages — roleId 4
// ---------------------------------------------------------------------------
export const TECHNICIAN_ROUTES: RouteConfig[] = [
  {
    page: 'technician-dashboard',
    loader: () => import('@/components/bys/technician-dashboard-page').then(m => ({ default: m.TechnicianDashboardPage })),
    chunkName: 'technician-dashboard',
    isProtected: true,
    allowedRoles: [4],
  },
  {
    page: 'technician-jobs',
    loader: () => import('@/components/bys/technician-jobs-page').then(m => ({ default: m.TechnicianJobsPage })),
    chunkName: 'technician-jobs',
    isProtected: true,
    allowedRoles: [4],
  },
  {
    page: 'technician-job-detail',
    loader: () => import('@/components/bys/technician-job-detail-page').then(m => ({ default: m.TechnicianJobDetailPage })),
    chunkName: 'technician-job-detail',
    isProtected: true,
    allowedRoles: [4],
  },
  {
    page: 'technician-earnings',
    loader: () => import('@/components/bys/technician-earnings-page').then(m => ({ default: m.TechnicianEarningsPage })),
    chunkName: 'technician-earnings',
    isProtected: true,
    allowedRoles: [4],
  },
  {
    page: 'technician-profile',
    loader: () => import('@/components/bys/technician-profile-page').then(m => ({ default: m.TechnicianProfilePage })),
    chunkName: 'technician-profile',
    isProtected: true,
    allowedRoles: [4],
  },
  {
    page: 'technician-availability',
    loader: () => import('@/components/bys/technician-availability-page').then(m => ({ default: m.TechnicianAvailabilityPage })),
    chunkName: 'technician-availability',
    isProtected: true,
    allowedRoles: [4],
  },
];

// ---------------------------------------------------------------------------
// Admin pages — roleId 3 (SUPER_ADMIN) and 7 (SUB_ADMIN)
// ---------------------------------------------------------------------------
export const ADMIN_ROUTES: RouteConfig[] = [
  {
    page: 'admin-dashboard',
    loader: () => import('@/components/bys/admin-dashboard-page').then(m => ({ default: m.AdminDashboardPage })),
    chunkName: 'admin-dashboard',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-users',
    loader: () => import('@/components/bys/admin-users-page').then(m => ({ default: m.AdminUsersPage })),
    chunkName: 'admin-users',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-user-detail',
    loader: () => import('@/components/bys/admin-user-detail-page').then(m => ({ default: m.AdminUserDetailPage })),
    chunkName: 'admin-user-detail',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-services',
    loader: () => import('@/components/bys/admin-services-page').then(m => ({ default: m.AdminServicesPage })),
    chunkName: 'admin-services',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-bookings',
    loader: () => import('@/components/bys/admin-bookings-page').then(m => ({ default: m.AdminBookingsPage })),
    chunkName: 'admin-bookings',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-disputes',
    loader: () => import('@/components/bys/admin-disputes-page').then(m => ({ default: m.AdminDisputesPage })),
    chunkName: 'admin-disputes',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-categories',
    loader: () => import('@/components/bys/admin-categories-page').then(m => ({ default: m.AdminCategoriesPage })),
    chunkName: 'admin-categories',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-faq',
    loader: () => import('@/components/bys/admin-faq-page').then(m => ({ default: m.AdminFaqPage })),
    chunkName: 'admin-faq',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-revenue',
    loader: () => import('@/components/bys/admin-revenue-page').then(m => ({ default: m.AdminRevenuePage })),
    chunkName: 'admin-revenue',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-logs',
    loader: () => import('@/components/bys/admin-logs-page').then(m => ({ default: m.AdminLogsPage })),
    chunkName: 'admin-logs',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-analytics',
    loader: () => import('@/components/bys/admin-analytics-page').then(m => ({ default: m.AdminAnalyticsPage })),
    chunkName: 'admin-analytics',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-analytics-dashboard',
    loader: () => import('@/components/bys/admin-analytics-dashboard-page').then(m => ({ default: m.AdminAnalyticsDashboardPage })),
    chunkName: 'admin-analytics-dashboard',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-franchises',
    loader: () => import('@/components/bys/admin-franchises-page').then(m => ({ default: m.AdminFranchisesPage })),
    chunkName: 'admin-franchises',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-franchise-detail',
    loader: () => import('@/components/bys/admin-franchise-detail-page').then(m => ({ default: m.AdminFranchiseDetailPage })),
    chunkName: 'admin-franchise-detail',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-crm',
    loader: () => import('@/components/bys/admin-crm-page').then(m => ({ default: m.AdminCrmPage })),
    chunkName: 'admin-crm',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-payouts',
    loader: () => import('@/components/bys/admin-payouts-page').then(m => ({ default: m.AdminPayoutsPage })),
    chunkName: 'admin-payouts',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-inventory',
    loader: () => import('@/components/bys/admin-inventory-page').then(m => ({ default: m.AdminInventoryPage })),
    chunkName: 'admin-inventory',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-coupons',
    loader: () => import('@/components/bys/admin-coupons-page').then(m => ({ default: m.AdminCouponsPage })),
    chunkName: 'admin-coupons',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-amc',
    loader: () => import('@/components/bys/admin-amc-page').then(m => ({ default: m.AdminAmcPage })),
    chunkName: 'admin-amc',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-b2b',
    loader: () => import('@/components/bys/admin-b2b-page').then(m => ({ default: m.AdminB2bPage })),
    chunkName: 'admin-b2b',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-profile',
    loader: () => import('@/components/bys/admin-profile-page').then(m => ({ default: m.AdminProfilePage })),
    chunkName: 'admin-profile',
    isProtected: true,
    allowedRoles: [3, 7],
  },
  {
    page: 'admin-job-applications',
    loader: () => import('@/components/bys/admin-job-applications-page').then(m => ({ default: m.AdminJobApplicationsPage })),
    chunkName: 'admin-job-applications',
    isProtected: true,
    allowedRoles: [3, 7],
  },
];

// ---------------------------------------------------------------------------
// Super Admin / Manager / Local Admin dashboard pages
// These have specific single-role access
// ---------------------------------------------------------------------------
export const SUPER_ADMIN_ROUTES: RouteConfig[] = [
  {
    page: 'super-admin-dashboard',
    loader: () => import('@/components/bys/super-admin-dashboard-page').then(m => ({ default: m.SuperAdminDashboardPage })),
    chunkName: 'super-admin-dashboard',
    isProtected: true,
    allowedRoles: [3],
  },
];

export const MANAGER_ROUTES: RouteConfig[] = [
  {
    page: 'manager-dashboard',
    loader: () => import('@/components/bys/manager-dashboard-page').then(m => ({ default: m.ManagerDashboardPage })),
    chunkName: 'manager-dashboard',
    isProtected: true,
    allowedRoles: [9],
  },
];

export const LOCAL_ADMIN_ROUTES: RouteConfig[] = [
  {
    page: 'local-admin-dashboard',
    loader: () => import('@/components/bys/local-admin-dashboard-page').then(m => ({ default: m.LocalAdminDashboardPage })),
    chunkName: 'local-admin-dashboard',
    isProtected: true,
    allowedRoles: [10],
  },
];

// ---------------------------------------------------------------------------
// Franchise pages — roleId 6
// ---------------------------------------------------------------------------
export const FRANCHISE_ROUTES: RouteConfig[] = [
  {
    page: 'franchise-dashboard',
    loader: () => import('@/components/bys/franchise-dashboard-page').then(m => ({ default: m.FranchiseDashboardPage })),
    chunkName: 'franchise-dashboard',
    isProtected: true,
    allowedRoles: [6],
  },
  {
    page: 'franchise-vendors',
    loader: () => import('@/components/bys/franchise-vendors-page').then(m => ({ default: m.FranchiseVendorsPage })),
    chunkName: 'franchise-vendors',
    isProtected: true,
    allowedRoles: [6],
  },
  {
    page: 'franchise-analytics',
    loader: () => import('@/components/bys/franchise-analytics-page').then(m => ({ default: m.FranchiseAnalyticsPage })),
    chunkName: 'franchise-analytics',
    isProtected: true,
    allowedRoles: [6],
  },
];

// ---------------------------------------------------------------------------
// Vendor pages — roleId 5
// ---------------------------------------------------------------------------
export const VENDOR_ROUTES: RouteConfig[] = [
  {
    page: 'vendor-dashboard',
    loader: () => import('@/components/bys/vendor-dashboard-page').then(m => ({ default: m.VendorDashboardPage })),
    chunkName: 'vendor-dashboard',
    isProtected: true,
    allowedRoles: [5],
  },
  {
    page: 'vendor-bookings',
    loader: () => import('@/components/bys/vendor-bookings-page').then(m => ({ default: m.VendorBookingsPage })),
    chunkName: 'vendor-bookings',
    isProtected: true,
    allowedRoles: [5],
  },
  {
    page: 'vendor-services',
    loader: () => import('@/components/bys/vendor-services-page').then(m => ({ default: m.VendorServicesPage })),
    chunkName: 'vendor-services',
    isProtected: true,
    allowedRoles: [5],
  },
  {
    page: 'vendor-profile',
    loader: () => import('@/components/bys/vendor-profile-page').then(m => ({ default: m.VendorProfilePage })),
    chunkName: 'vendor-profile',
    isProtected: true,
    allowedRoles: [5],
  },
  {
    page: 'vendor-kyc',
    loader: () => import('@/components/bys/vendor-kyc-page').then(m => ({ default: m.VendorKycPage })),
    chunkName: 'vendor-kyc',
    isProtected: true,
    allowedRoles: [5],
  },
  {
    page: 'vendor-wallet',
    loader: () => import('@/components/bys/vendor-wallet-page').then(m => ({ default: m.VendorWalletPage })),
    chunkName: 'vendor-wallet',
    isProtected: true,
    allowedRoles: [5],
  },
  {
    page: 'vendor-payouts',
    loader: () => import('@/components/bys/vendor-payouts-page').then(m => ({ default: m.VendorPayoutsPage })),
    chunkName: 'vendor-payouts',
    isProtected: true,
    allowedRoles: [5],
  },
];

// ---------------------------------------------------------------------------
// Area Manager pages — roleId 8
// ---------------------------------------------------------------------------
export const AREA_MANAGER_ROUTES: RouteConfig[] = [
  {
    page: 'area-manager-dashboard',
    loader: () => import('@/components/bys/area-manager-dashboard-page').then(m => ({ default: m.AreaManagerDashboardPage })),
    chunkName: 'area-manager-dashboard',
    isProtected: true,
    allowedRoles: [8],
  },
];

// ---------------------------------------------------------------------------
// Join pages — public (registration flows for specific roles)
// ---------------------------------------------------------------------------
export const JOIN_ROUTES: RouteConfig[] = [
  {
    page: 'join-manager',
    loader: () => import('@/components/bys/join-manager-page').then(m => ({ default: m.JoinManagerPage })),
    chunkName: 'join-manager',
    isProtected: false,
  },
  {
    page: 'join-local-admin',
    loader: () => import('@/components/bys/join-local-admin-page').then(m => ({ default: m.JoinLocalAdminPage })),
    chunkName: 'join-local-admin',
    isProtected: false,
  },
];

// ---------------------------------------------------------------------------
// AI Recommendations — any authenticated user
// ---------------------------------------------------------------------------
export const RECOMMENDATION_ROUTES: RouteConfig[] = [
  {
    page: 'recommendations',
    loader: () => import('@/components/bys/recommendations-page').then(m => ({ default: m.RecommendationsPage })),
    chunkName: 'recommendations',
    isProtected: true,
    // allowedRoles undefined = any authenticated user
  },
];

// ---------------------------------------------------------------------------
// Master registry — flat list of every route
// ---------------------------------------------------------------------------
export const ALL_ROUTES: RouteConfig[] = [
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...BOOKING_ROUTES,
  ...CLIENT_ROUTES,
  ...PROVIDER_ROUTES,
  ...TECHNICIAN_ROUTES,
  ...ADMIN_ROUTES,
  ...SUPER_ADMIN_ROUTES,
  ...MANAGER_ROUTES,
  ...LOCAL_ADMIN_ROUTES,
  ...FRANCHISE_ROUTES,
  ...VENDOR_ROUTES,
  ...AREA_MANAGER_ROUTES,
  ...JOIN_ROUTES,
  ...RECOMMENDATION_ROUTES,
];

// O(1) lookup by page name
export const ROUTE_MAP = new Map<Page, RouteConfig>(
  ALL_ROUTES.map(r => [r.page, r]),
);

// Set of valid page names for 404 detection
export const VALID_PAGES = new Set<Page>(ALL_ROUTES.map(r => r.page));

// Total route count (useful for assertions / debugging)
export const ROUTE_COUNT = ALL_ROUTES.length;

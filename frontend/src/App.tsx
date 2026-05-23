import React, { Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider, useAuth, ROLE_ID_MAP } from '@/contexts/auth-context';
import { AppProvider, useApp } from '@/contexts/app-context';
import { Header } from '@/components/bys/header';
import { Footer } from '@/components/bys/footer';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { PageLoader } from '@/components/page-loader';

/* ---------------------------------------------------------------------------
 * Lazy-loaded page components
 *
 * Every page component from the bys/ folder is loaded on-demand via
 * React.lazy().  Named exports are re-mapped to `default` so that
 * React.lazy() can consume them.
 *
 * Groups match the route areas for readability.
 * --------------------------------------------------------------------------- */

// ── Public pages ──────────────────────────────────────────────────────────────
const HomePage = React.lazy(() =>
  import('@/components/bys/home-page').then(m => ({ default: m.HomePage })),
);
const CategoriesPage = React.lazy(() =>
  import('@/components/bys/categories-page').then(m => ({ default: m.CategoriesPage })),
);
const CategoryDetailPage = React.lazy(() =>
  import('@/components/bys/category-detail-page').then(m => ({ default: m.CategoryDetailPage })),
);
const ServiceDetailPage = React.lazy(() =>
  import('@/components/bys/service-detail-page').then(m => ({ default: m.ServiceDetailPage })),
);
const SearchPage = React.lazy(() =>
  import('@/components/bys/search-page').then(m => ({ default: m.SearchPage })),
);
const AboutPage = React.lazy(() =>
  import('@/components/bys/about-page').then(m => ({ default: m.AboutPage })),
);
const HowItWorksPage = React.lazy(() =>
  import('@/components/bys/how-it-works-page').then(m => ({ default: m.HowItWorksPage })),
);
const FaqPage = React.lazy(() =>
  import('@/components/bys/faq-page').then(m => ({ default: m.FaqPage })),
);
const ContactPage = React.lazy(() =>
  import('@/components/bys/contact-page').then(m => ({ default: m.ContactPage })),
);
const LegalPage = React.lazy(() =>
  import('@/components/bys/legal-page').then(m => ({ default: m.LegalPage })),
);

// ── Auth pages ────────────────────────────────────────────────────────────────
const LoginPage = React.lazy(() =>
  import('@/components/bys/login-page').then(m => ({ default: m.LoginPage })),
);
const AdminLoginPage = React.lazy(() =>
  import('@/components/bys/admin-login-page').then(m => ({ default: m.AdminLoginPage })),
);
const RegisterPage = React.lazy(() =>
  import('@/components/bys/register-page').then(m => ({ default: m.RegisterPage })),
);

// ── Client pages ──────────────────────────────────────────────────────────────
const ClientDashboardPage = React.lazy(() =>
  import('@/components/bys/client-dashboard-page').then(m => ({ default: m.ClientDashboardPage })),
);
const ClientBookingsPage = React.lazy(() =>
  import('@/components/bys/client-bookings-page').then(m => ({ default: m.ClientBookingsPage })),
);
const ClientBookingDetailPage = React.lazy(() =>
  import('@/components/bys/client-booking-detail-page').then(m => ({ default: m.ClientBookingDetailPage })),
);
const ClientProfilePage = React.lazy(() =>
  import('@/components/bys/client-profile-page').then(m => ({ default: m.ClientProfilePage })),
);
const ClientReviewsPage = React.lazy(() =>
  import('@/components/bys/client-reviews-page').then(m => ({ default: m.ClientReviewsPage })),
);
const ClientFavoritesPage = React.lazy(() =>
  import('@/components/bys/client-favorites-page').then(m => ({ default: m.ClientFavoritesPage })),
);
const ClientNotificationsPage = React.lazy(() =>
  import('@/components/bys/client-notifications-page').then(m => ({ default: m.ClientNotificationsPage })),
);

// ── Client enhanced pages ─────────────────────────────────────────────────────
const ClientWalletPage = React.lazy(() =>
  import('@/components/bys/client-wallet-page').then(m => ({ default: m.ClientWalletPage })),
);
const ClientAmcPage = React.lazy(() =>
  import('@/components/bys/client-amc-page').then(m => ({ default: m.ClientAmcPage })),
);
const ClientAmcDetailPage = React.lazy(() =>
  import('@/components/bys/client-amc-detail-page').then(m => ({ default: m.ClientAmcDetailPage })),
);
const ClientCouponsPage = React.lazy(() =>
  import('@/components/bys/client-coupons-page').then(m => ({ default: m.ClientCouponsPage })),
);
const ClientReferralsPage = React.lazy(() =>
  import('@/components/bys/client-referrals-page').then(m => ({ default: m.ClientReferralsPage })),
);
const ClientInvoicesPage = React.lazy(() =>
  import('@/components/bys/client-invoices-page').then(m => ({ default: m.ClientInvoicesPage })),
);
const ClientInvoiceDetailPage = React.lazy(() =>
  import('@/components/bys/client-invoice-detail-page').then(m => ({ default: m.ClientInvoiceDetailPage })),
);

// ── Booking pages ─────────────────────────────────────────────────────────────
const BookingPage = React.lazy(() =>
  import('@/components/bys/booking-page').then(m => ({ default: m.BookingPage })),
);
const BookingConfirmationPage = React.lazy(() =>
  import('@/components/bys/booking-confirmation-page').then(m => ({ default: m.BookingConfirmationPage })),
);
const PaymentPage = React.lazy(() =>
  import('@/components/bys/payment-page').then(m => ({ default: m.PaymentPage })),
);
const BookingTrackingPage = React.lazy(() =>
  import('@/components/bys/booking-tracking-page').then(m => ({ default: m.BookingTrackingPage })),
);

// ── Emergency booking page ────────────────────────────────────────────────────
const EmergencyBookingPage = React.lazy(() =>
  import('@/components/bys/emergency-booking-page').then(m => ({ default: m.EmergencyBookingPage })),
);

// ── Provider pages ────────────────────────────────────────────────────────────
const ProviderDashboardPage = React.lazy(() =>
  import('@/components/bys/provider-dashboard-page').then(m => ({ default: m.ProviderDashboardPage })),
);
const ProviderServicesPage = React.lazy(() =>
  import('@/components/bys/provider-services-page').then(m => ({ default: m.ProviderServicesPage })),
);
const ProviderCreateServicePage = React.lazy(() =>
  import('@/components/bys/provider-create-service-page').then(m => ({ default: m.ProviderCreateServicePage })),
);
const ProviderBookingsPage = React.lazy(() =>
  import('@/components/bys/provider-bookings-page').then(m => ({ default: m.ProviderBookingsPage })),
);
const ProviderBookingDetailPage = React.lazy(() =>
  import('@/components/bys/provider-booking-detail-page').then(m => ({ default: m.ProviderBookingDetailPage })),
);
const ProviderEarningsPage = React.lazy(() =>
  import('@/components/bys/provider-earnings-page').then(m => ({ default: m.ProviderEarningsPage })),
);
const ProviderReviewsPage = React.lazy(() =>
  import('@/components/bys/provider-reviews-page').then(m => ({ default: m.ProviderReviewsPage })),
);
const ProviderProfilePage = React.lazy(() =>
  import('@/components/bys/provider-profile-page').then(m => ({ default: m.ProviderProfilePage })),
);
const ProviderKycPage = React.lazy(() =>
  import('@/components/bys/provider-kyc-page').then(m => ({ default: m.ProviderKycPage })),
);

// ── Provider enhanced pages ───────────────────────────────────────────────────
const ProviderWalletPage = React.lazy(() =>
  import('@/components/bys/provider-wallet-page').then(m => ({ default: m.ProviderWalletPage })),
);
const ProviderPayoutsPage = React.lazy(() =>
  import('@/components/bys/provider-payouts-page').then(m => ({ default: m.ProviderPayoutsPage })),
);
const ProviderInvoicesPage = React.lazy(() =>
  import('@/components/bys/provider-invoices-page').then(m => ({ default: m.ProviderInvoicesPage })),
);

// ── Technician pages ──────────────────────────────────────────────────────────
const TechnicianDashboardPage = React.lazy(() =>
  import('@/components/bys/technician-dashboard-page').then(m => ({ default: m.TechnicianDashboardPage })),
);
const TechnicianJobsPage = React.lazy(() =>
  import('@/components/bys/technician-jobs-page').then(m => ({ default: m.TechnicianJobsPage })),
);
const TechnicianJobDetailPage = React.lazy(() =>
  import('@/components/bys/technician-job-detail-page').then(m => ({ default: m.TechnicianJobDetailPage })),
);
const TechnicianEarningsPage = React.lazy(() =>
  import('@/components/bys/technician-earnings-page').then(m => ({ default: m.TechnicianEarningsPage })),
);
const TechnicianProfilePage = React.lazy(() =>
  import('@/components/bys/technician-profile-page').then(m => ({ default: m.TechnicianProfilePage })),
);
const TechnicianAvailabilityPage = React.lazy(() =>
  import('@/components/bys/technician-availability-page').then(m => ({ default: m.TechnicianAvailabilityPage })),
);

// ── Admin pages ───────────────────────────────────────────────────────────────
const AdminDashboardPage = React.lazy(() =>
  import('@/components/bys/admin-dashboard-page').then(m => ({ default: m.AdminDashboardPage })),
);
const AdminUsersPage = React.lazy(() =>
  import('@/components/bys/admin-users-page').then(m => ({ default: m.AdminUsersPage })),
);
const AdminUserDetailPage = React.lazy(() =>
  import('@/components/bys/admin-user-detail-page').then(m => ({ default: m.AdminUserDetailPage })),
);
const AdminServicesPage = React.lazy(() =>
  import('@/components/bys/admin-services-page').then(m => ({ default: m.AdminServicesPage })),
);
const AdminBookingsPage = React.lazy(() =>
  import('@/components/bys/admin-bookings-page').then(m => ({ default: m.AdminBookingsPage })),
);
const AdminDisputesPage = React.lazy(() =>
  import('@/components/bys/admin-disputes-page').then(m => ({ default: m.AdminDisputesPage })),
);
const AdminCategoriesPage = React.lazy(() =>
  import('@/components/bys/admin-categories-page').then(m => ({ default: m.AdminCategoriesPage })),
);
const AdminFaqPage = React.lazy(() =>
  import('@/components/bys/admin-faq-page').then(m => ({ default: m.AdminFaqPage })),
);
const AdminRevenuePage = React.lazy(() =>
  import('@/components/bys/admin-revenue-page').then(m => ({ default: m.AdminRevenuePage })),
);
const AdminLogsPage = React.lazy(() =>
  import('@/components/bys/admin-logs-page').then(m => ({ default: m.AdminLogsPage })),
);

// ── Admin enhanced pages ──────────────────────────────────────────────────────
const AdminAnalyticsPage = React.lazy(() =>
  import('@/components/bys/admin-analytics-page').then(m => ({ default: m.AdminAnalyticsPage })),
);
const AdminAnalyticsDashboardPage = React.lazy(() =>
  import('@/components/bys/admin-analytics-dashboard-page').then(m => ({ default: m.AdminAnalyticsDashboardPage })),
);
const AdminFranchisesPage = React.lazy(() =>
  import('@/components/bys/admin-franchises-page').then(m => ({ default: m.AdminFranchisesPage })),
);
const AdminFranchiseDetailPage = React.lazy(() =>
  import('@/components/bys/admin-franchise-detail-page').then(m => ({ default: m.AdminFranchiseDetailPage })),
);
const AdminCrmPage = React.lazy(() =>
  import('@/components/bys/admin-crm-page').then(m => ({ default: m.AdminCrmPage })),
);
const AdminPayoutsPage = React.lazy(() =>
  import('@/components/bys/admin-payouts-page').then(m => ({ default: m.AdminPayoutsPage })),
);
const AdminInventoryPage = React.lazy(() =>
  import('@/components/bys/admin-inventory-page').then(m => ({ default: m.AdminInventoryPage })),
);
const AdminCouponsPage = React.lazy(() =>
  import('@/components/bys/admin-coupons-page').then(m => ({ default: m.AdminCouponsPage })),
);
const AdminAmcPage = React.lazy(() =>
  import('@/components/bys/admin-amc-page').then(m => ({ default: m.AdminAmcPage })),
);
const AdminB2bPage = React.lazy(() =>
  import('@/components/bys/admin-b2b-page').then(m => ({ default: m.AdminB2bPage })),
);

// ── AI Recommendations ───────────────────────────────────────────────────────
const RecommendationsPage = React.lazy(() =>
  import('@/components/bys/recommendations-page').then(m => ({ default: m.RecommendationsPage })),
);

// ── Franchise pages ──────────────────────────────────────────────────────────
const FranchiseDashboardPage = React.lazy(() =>
  import('@/components/bys/franchise-dashboard-page').then(m => ({ default: m.FranchiseDashboardPage })),
);
const FranchiseVendorsPage = React.lazy(() =>
  import('@/components/bys/franchise-vendors-page').then(m => ({ default: m.FranchiseVendorsPage })),
);
const FranchiseAnalyticsPage = React.lazy(() =>
  import('@/components/bys/franchise-analytics-page').then(m => ({ default: m.FranchiseAnalyticsPage })),
);

// ── Vendor pages ─────────────────────────────────────────────────────────────
const VendorDashboardPage = React.lazy(() =>
  import('@/components/bys/vendor-dashboard-page').then(m => ({ default: m.VendorDashboardPage })),
);
const VendorBookingsPage = React.lazy(() =>
  import('@/components/bys/vendor-bookings-page').then(m => ({ default: m.VendorBookingsPage })),
);
const VendorServicesPage = React.lazy(() =>
  import('@/components/bys/vendor-services-page').then(m => ({ default: m.VendorServicesPage })),
);
const VendorProfilePage = React.lazy(() =>
  import('@/components/bys/vendor-profile-page').then(m => ({ default: m.VendorProfilePage })),
);
const VendorKycPage = React.lazy(() =>
  import('@/components/bys/vendor-kyc-page').then(m => ({ default: m.VendorKycPage })),
);
const VendorWalletPage = React.lazy(() =>
  import('@/components/bys/vendor-wallet-page').then(m => ({ default: m.VendorWalletPage })),
);
const VendorPayoutsPage = React.lazy(() =>
  import('@/components/bys/vendor-payouts-page').then(m => ({ default: m.VendorPayoutsPage })),
);

// ── Area Manager pages ───────────────────────────────────────────────────────
const AreaManagerDashboardPage = React.lazy(() =>
  import('@/components/bys/area-manager-dashboard-page').then(m => ({ default: m.AreaManagerDashboardPage })),
);

// ── Join pages ───────────────────────────────────────────────────────────────
const JoinManagerPage = React.lazy(() =>
  import('@/components/bys/join-manager-page').then(m => ({ default: m.JoinManagerPage })),
);
const JoinLocalAdminPage = React.lazy(() =>
  import('@/components/bys/join-local-admin-page').then(m => ({ default: m.JoinLocalAdminPage })),
);

// ── Missing dashboards ───────────────────────────────────────────────────────
const SuperAdminDashboardPage = React.lazy(() =>
  import('@/components/bys/super-admin-dashboard-page').then(m => ({ default: m.SuperAdminDashboardPage })),
);
const ManagerDashboardPage = React.lazy(() =>
  import('@/components/bys/manager-dashboard-page').then(m => ({ default: m.ManagerDashboardPage })),
);
const LocalAdminDashboardPage = React.lazy(() =>
  import('@/components/bys/local-admin-dashboard-page').then(m => ({ default: m.LocalAdminDashboardPage })),
);

/* ---------------------------------------------------------------------------
 * Role / routing constants (unchanged)
 * --------------------------------------------------------------------------- */

// Single source of truth for role → dashboard mapping (Old #28 fix)
export const ROLE_DASHBOARD_MAP: Record<number, string> = {
  1: 'client-dashboard',
  2: 'provider-dashboard',
  3: 'super-admin-dashboard',
  4: 'technician-dashboard',
  5: 'vendor-dashboard',
  6: 'franchise-dashboard',
  7: 'admin-dashboard', // SUB_ADMIN shares admin dashboard (Old #31)
  8: 'area-manager-dashboard',
  9: 'manager-dashboard',
  10: 'local-admin-dashboard',
};

const ROLE_ROUTE_PREFIX: Record<string, number[]> = {
  'admin-': [3, 7],        // ADMIN + SUB_ADMIN
  'super-admin-': [3],     // SUPER_ADMIN only
  'provider-': [2],
  'technician-': [4],
  'vendor-': [5],
  'franchise-': [6],
  'area-manager-': [8],
  'manager-': [9],
  'local-admin-': [10],
  'client-': [1],
};

// Pages that require authentication (all dashboard pages)
const DASHBOARD_PREFIXES = ['client-', 'provider-', 'technician-', 'admin-', 'vendor-', 'franchise-', 'area-manager-', 'super-admin-', 'manager-', 'local-admin-'];

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  'booking',
  'booking-confirmation',
  'client-payment',
  'booking-tracking',
  'client-dashboard',
  'provider-dashboard',
  'technician-dashboard',
  'manager-dashboard',
  'local-admin-dashboard',
  'super-admin-dashboard',
  'admin-dashboard',
];

// ---------------------------------------------------------------------------
// Main router component
// ---------------------------------------------------------------------------
function AppRouter() {
  const { nav, navigate } = useApp();
  const { user, token } = useAuth();
  const lastRedirectRef = useRef<string>('');

  // Derive role ID from user object (mirrors the logic previously inline)
  const userRoleId = user
    ? (user.roleId ?? ROLE_ID_MAP[user.role ?? ''] ?? 0)
    : undefined;

  // Route guard: check role-based access before rendering
  useEffect(() => {
    const page = nav.page;
    const isAuthenticated = !!token;
    const access = isRouteAccessible(page, userRoleId, isAuthenticated);

    if (!access.allowed && access.redirectTo) {
      const redirectKey = access.reason === 'unauthenticated'
        ? `auth:${page}`
        : `role:${page}:${userRoleId}`;

      if (lastRedirectRef.current !== redirectKey) {
        lastRedirectRef.current = redirectKey;
        navigate(access.redirectTo);
      }
    } else if (access.allowed) {
      // Valid access, reset redirect ref
      lastRedirectRef.current = '';
    }
  }, [nav.page, userRoleId, token, navigate]);

  const renderPage = () => {
    // All valid page names for 404 detection
    const validPages = new Set([
      'home', 'login', 'admin-login', 'register', 'categories', 'category-detail', 'service-detail',
      'search', 'booking', 'booking-confirmation', 'about', 'how-it-works', 'faq',
      'contact', 'terms', 'privacy', 'refund-policy', 'cookie-policy', 'aup',
      'provider-agreement', 'community-guidelines', 'emergency-booking',
      'client-dashboard', 'client-bookings', 'client-booking-detail', 'client-profile',
      'client-reviews', 'client-favorites', 'client-notifications', 'client-wallet',
      'client-amc', 'client-amc-detail', 'client-coupons', 'client-referrals',
      'client-invoices', 'client-invoice-detail', 'client-payment', 'booking-tracking',
      'provider-dashboard', 'provider-services', 'provider-create-service',
      'provider-bookings', 'provider-booking-detail', 'provider-earnings',
      'provider-reviews', 'provider-profile', 'provider-kyc', 'provider-wallet',
      'provider-payouts', 'provider-invoices',
      'technician-dashboard', 'technician-jobs', 'technician-job-detail',
      'technician-earnings', 'technician-profile', 'technician-availability',
      'admin-dashboard', 'admin-users', 'admin-user-detail', 'admin-services',
      'admin-bookings', 'admin-disputes', 'admin-categories', 'admin-faq',
      'admin-revenue', 'admin-logs', 'admin-analytics', 'admin-franchises',
      'admin-franchise-detail', 'admin-crm', 'admin-payouts', 'admin-inventory',
      'admin-coupons', 'admin-amc', 'admin-b2b', 'admin-analytics-dashboard',
      'recommendations',
      'franchise-dashboard', 'franchise-vendors', 'franchise-analytics',
      'vendor-dashboard', 'vendor-bookings', 'vendor-services', 'vendor-profile',
      'vendor-kyc', 'vendor-wallet', 'vendor-payouts',
      'area-manager-dashboard', 'join-manager', 'join-local-admin',
      'super-admin-dashboard', 'manager-dashboard', 'local-admin-dashboard',
      'client-commissions',
    ]);

  // Resolve extra props from route config (e.g. `type` for LegalPage)
  const routeProps = useMemo(() => {
    const route = ROUTE_MAP.get(nav.page);
    return route?.props ?? {};
  }, [nav.page]);

  function renderPage() {
    // Invalid page → 404
    if (!VALID_PAGES.has(nav.page) || !LazyComponent) {
      return <NotFoundPage />;
    }

    return (
      <Suspense fallback={<PageLoader />}>
        <LazyComponent {...routeProps} />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// App root — providers, error boundary, toast notifications
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
        <Toaster />
        <SonnerToaster />
      </AppProvider>
    </AuthProvider>
  );
}

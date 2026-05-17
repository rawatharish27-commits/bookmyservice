import React, { Component, useEffect, useRef } from 'react';
import { AuthProvider, useAuth, ROLE_IDS, ROLE_ID_MAP } from '@/contexts/auth-context';
import { AppProvider, useApp } from '@/contexts/app-context';
import { Header } from '@/components/bys/header';
import { Footer } from '@/components/bys/footer';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

// Public pages
import { HomePage } from '@/components/bys/home-page';
import { CategoriesPage } from '@/components/bys/categories-page';
import { CategoryDetailPage } from '@/components/bys/category-detail-page';
import { ServiceDetailPage } from '@/components/bys/service-detail-page';
import { SearchPage } from '@/components/bys/search-page';
import { AboutPage } from '@/components/bys/about-page';
import { HowItWorksPage } from '@/components/bys/how-it-works-page';
import { FaqPage } from '@/components/bys/faq-page';
import { ContactPage } from '@/components/bys/contact-page';
import { LegalPage } from '@/components/bys/legal-page';

// Auth pages
import { LoginPage } from '@/components/bys/login-page';
import { RegisterPage } from '@/components/bys/register-page';

// Client pages
import { ClientDashboardPage } from '@/components/bys/client-dashboard-page';
import { ClientBookingsPage } from '@/components/bys/client-bookings-page';
import { ClientBookingDetailPage } from '@/components/bys/client-booking-detail-page';
import { ClientProfilePage } from '@/components/bys/client-profile-page';
import { ClientReviewsPage } from '@/components/bys/client-reviews-page';
import { ClientFavoritesPage } from '@/components/bys/client-favorites-page';
import { ClientNotificationsPage } from '@/components/bys/client-notifications-page';

// Client enhanced pages
import { ClientWalletPage } from '@/components/bys/client-wallet-page';
import { ClientAmcPage } from '@/components/bys/client-amc-page';
import { ClientAmcDetailPage } from '@/components/bys/client-amc-detail-page';
import { ClientCouponsPage } from '@/components/bys/client-coupons-page';
import { ClientReferralsPage } from '@/components/bys/client-referrals-page';
import { ClientInvoicesPage } from '@/components/bys/client-invoices-page';
import { ClientInvoiceDetailPage } from '@/components/bys/client-invoice-detail-page';

// Booking pages
import { BookingPage } from '@/components/bys/booking-page';
import { BookingConfirmationPage } from '@/components/bys/booking-confirmation-page';

// Emergency booking page
import { EmergencyBookingPage } from '@/components/bys/emergency-booking-page';

// Provider pages
import { ProviderDashboardPage } from '@/components/bys/provider-dashboard-page';
import { ProviderServicesPage } from '@/components/bys/provider-services-page';
import { ProviderCreateServicePage } from '@/components/bys/provider-create-service-page';
import { ProviderBookingsPage } from '@/components/bys/provider-bookings-page';
import { ProviderBookingDetailPage } from '@/components/bys/provider-booking-detail-page';
import { ProviderEarningsPage } from '@/components/bys/provider-earnings-page';
import { ProviderReviewsPage } from '@/components/bys/provider-reviews-page';
import { ProviderProfilePage } from '@/components/bys/provider-profile-page';
import { ProviderKycPage } from '@/components/bys/provider-kyc-page';

// Provider enhanced pages
import { ProviderWalletPage } from '@/components/bys/provider-wallet-page';
import { ProviderPayoutsPage } from '@/components/bys/provider-payouts-page';
import { ProviderInvoicesPage } from '@/components/bys/provider-invoices-page';

// Technician pages
import { TechnicianDashboardPage } from '@/components/bys/technician-dashboard-page';
import { TechnicianJobsPage } from '@/components/bys/technician-jobs-page';
import { TechnicianJobDetailPage } from '@/components/bys/technician-job-detail-page';
import { TechnicianEarningsPage } from '@/components/bys/technician-earnings-page';
import { TechnicianProfilePage } from '@/components/bys/technician-profile-page';
import { TechnicianAvailabilityPage } from '@/components/bys/technician-availability-page';

// Admin pages
import { AdminDashboardPage } from '@/components/bys/admin-dashboard-page';
import { AdminUsersPage } from '@/components/bys/admin-users-page';
import { AdminUserDetailPage } from '@/components/bys/admin-user-detail-page';
import { AdminServicesPage } from '@/components/bys/admin-services-page';
import { AdminBookingsPage } from '@/components/bys/admin-bookings-page';
import { AdminDisputesPage } from '@/components/bys/admin-disputes-page';
import { AdminCategoriesPage } from '@/components/bys/admin-categories-page';
import { AdminFaqPage } from '@/components/bys/admin-faq-page';
import { AdminRevenuePage } from '@/components/bys/admin-revenue-page';
import { AdminLogsPage } from '@/components/bys/admin-logs-page';

// Admin enhanced pages
import { AdminAnalyticsPage } from '@/components/bys/admin-analytics-page';
import { AdminFranchisesPage } from '@/components/bys/admin-franchises-page';
import { AdminFranchiseDetailPage } from '@/components/bys/admin-franchise-detail-page';
import { AdminCrmPage } from '@/components/bys/admin-crm-page';
import { AdminPayoutsPage } from '@/components/bys/admin-payouts-page';
import { AdminInventoryPage } from '@/components/bys/admin-inventory-page';
import { AdminCouponsPage } from '@/components/bys/admin-coupons-page';
import { AdminAmcPage } from '@/components/bys/admin-amc-page';
import { AdminB2bPage } from '@/components/bys/admin-b2b-page';

// Franchise pages
import { FranchiseDashboardPage } from '@/components/bys/franchise-dashboard-page';
import { FranchiseVendorsPage } from '@/components/bys/franchise-vendors-page';
import { FranchiseAnalyticsPage } from '@/components/bys/franchise-analytics-page';

// Vendor pages
import { VendorDashboardPage } from '@/components/bys/vendor-dashboard-page';
import { VendorBookingsPage } from '@/components/bys/vendor-bookings-page';
import { VendorServicesPage } from '@/components/bys/vendor-services-page';
import { VendorProfilePage } from '@/components/bys/vendor-profile-page';
import { VendorKycPage } from '@/components/bys/vendor-kyc-page';
import { VendorWalletPage } from '@/components/bys/vendor-wallet-page';
import { VendorPayoutsPage } from '@/components/bys/vendor-payouts-page';

// Area Manager pages
import { AreaManagerDashboardPage } from '@/components/bys/area-manager-dashboard-page';

// Join pages
import { JoinManagerPage } from '@/components/bys/join-manager-page';
import { JoinLocalAdminPage } from '@/components/bys/join-local-admin-page';

// Missing dashboards
import { SuperAdminDashboardPage } from '@/components/bys/super-admin-dashboard-page';
import { ManagerDashboardPage } from '@/components/bys/manager-dashboard-page';
import { LocalAdminDashboardPage } from '@/components/bys/local-admin-dashboard-page';

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
  'client-dashboard',
  'provider-dashboard',
  'technician-dashboard',
  'manager-dashboard',
  'local-admin-dashboard',
  'super-admin-dashboard',
  'admin-dashboard',
];

function AppRouter() {
  const { nav, navigate } = useApp();
  const { user, token } = useAuth();
  const lastRedirectRef = useRef<string>('');

  // Route guard: check role-based access before rendering
  useEffect(() => {
    const page = nav.page;

    // Check if the page requires authentication
    const isDashboardPage = DASHBOARD_PREFIXES.some(prefix => page.startsWith(prefix));
    const isProtectedRoute = PROTECTED_ROUTES.includes(page);

    // If not logged in and trying to access a protected page, redirect to login
    if ((isDashboardPage || isProtectedRoute) && !token) {
      const redirectKey = `auth:${page}`;
      if (lastRedirectRef.current !== redirectKey) {
        lastRedirectRef.current = redirectKey;
        navigate('login');
      }
      return;
    }

    // If logged in, check role-based access
    if (user && isDashboardPage) {
      // Use shared ROLE_ID_MAP instead of duplicating (Old #28 fix)
      const userRoleId = user.roleId ?? ROLE_ID_MAP[user.role ?? ''] ?? 0;

      for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTE_PREFIX)) {
        if (page.startsWith(prefix)) {
          if (!allowedRoles.includes(userRoleId)) {
            // User doesn't have the right role, redirect to their own dashboard
            const dashboard = ROLE_DASHBOARD_MAP[userRoleId] || 'home';
            const redirectKey = `role:${page}:${userRoleId}`;
            if (lastRedirectRef.current !== redirectKey) {
              lastRedirectRef.current = redirectKey;
              navigate(dashboard as any);
            }
          } else {
            // Valid access, reset redirect ref
            lastRedirectRef.current = '';
          }
          break;
        }
      }
    }

    // Reset redirect ref for public pages (no redirect triggered)
    if (!isDashboardPage && !isProtectedRoute) {
      lastRedirectRef.current = '';
    }
  }, [nav.page, user, token, navigate]);

  const renderPage = () => {
    // All valid page names for 404 detection
    const validPages = new Set([
      'home', 'login', 'register', 'categories', 'category-detail', 'service-detail',
      'search', 'booking', 'booking-confirmation', 'about', 'how-it-works', 'faq',
      'contact', 'terms', 'privacy', 'refund-policy', 'cookie-policy', 'aup',
      'provider-agreement', 'community-guidelines', 'emergency-booking',
      'client-dashboard', 'client-bookings', 'client-booking-detail', 'client-profile',
      'client-reviews', 'client-favorites', 'client-notifications', 'client-wallet',
      'client-amc', 'client-amc-detail', 'client-coupons', 'client-referrals',
      'client-invoices', 'client-invoice-detail',
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
      'admin-coupons', 'admin-amc', 'admin-b2b',
      'franchise-dashboard', 'franchise-vendors', 'franchise-analytics',
      'vendor-dashboard', 'vendor-bookings', 'vendor-services', 'vendor-profile',
      'vendor-kyc', 'vendor-wallet', 'vendor-payouts',
      'area-manager-dashboard', 'join-manager', 'join-local-admin',
      'super-admin-dashboard', 'manager-dashboard', 'local-admin-dashboard',
      'client-commissions',
    ]);

    if (!validPages.has(nav.page)) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a1628]/10 to-[#2d5a8e]/10">
            <span className="text-4xl font-black text-[#1e3a5f]">404</span>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <button onClick={() => navigate('home')} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] px-6 py-3 text-white shadow-lg transition-opacity hover:opacity-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Go Home
          </button>
        </div>
      );
    }

    switch (nav.page) {
      // Public pages
      case 'home':
        return <HomePage />;
      case 'categories':
        return <CategoriesPage />;
      case 'category-detail':
        return <CategoryDetailPage />;
      case 'service-detail':
        return <ServiceDetailPage />;
      case 'search':
        return <SearchPage />;
      case 'about':
        return <AboutPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'faq':
        return <FaqPage />;
      case 'contact':
        return <ContactPage />;
      case 'terms':
        return <LegalPage type="terms" />;
      case 'privacy':
        return <LegalPage type="privacy" />;
      case 'refund-policy':
        return <LegalPage type="refund-policy" />;
      case 'cookie-policy':
        return <LegalPage type="cookie-policy" />;
      case 'aup':
        return <LegalPage type="aup" />;
      case 'provider-agreement':
        return <LegalPage type="provider-agreement" />;
      case 'community-guidelines':
        return <LegalPage type="community-guidelines" />;

      // Auth pages
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;

      // Client pages
      case 'client-dashboard':
        return <ClientDashboardPage />;
      case 'client-bookings':
        return <ClientBookingsPage />;
      case 'client-booking-detail':
        return <ClientBookingDetailPage />;
      case 'client-profile':
        return <ClientProfilePage />;
      case 'client-reviews':
        return <ClientReviewsPage />;
      case 'client-favorites':
        return <ClientFavoritesPage />;
      case 'client-notifications':
        return <ClientNotificationsPage />;

      // Client enhanced pages
      case 'client-wallet':
        return <ClientWalletPage />;
      case 'client-amc':
        return <ClientAmcPage />;
      case 'client-amc-detail':
        return <ClientAmcDetailPage />;
      case 'client-coupons':
        return <ClientCouponsPage />;
      case 'client-referrals':
        return <ClientReferralsPage />;
      case 'client-invoices':
        return <ClientInvoicesPage />;
      case 'client-invoice-detail':
        return <ClientInvoiceDetailPage />;

      // Booking pages
      case 'booking':
        return <BookingPage />;
      case 'booking-confirmation':
        return <BookingConfirmationPage />;

      // Emergency booking
      case 'emergency-booking':
        return <EmergencyBookingPage />;

      // Provider pages
      case 'provider-dashboard':
        return <ProviderDashboardPage />;
      case 'provider-services':
        return <ProviderServicesPage />;
      case 'provider-create-service':
        return <ProviderCreateServicePage />;
      case 'provider-bookings':
        return <ProviderBookingsPage />;
      case 'provider-booking-detail':
        return <ProviderBookingDetailPage />;
      case 'provider-earnings':
        return <ProviderEarningsPage />;
      case 'provider-reviews':
        return <ProviderReviewsPage />;
      case 'provider-profile':
        return <ProviderProfilePage />;
      case 'provider-kyc':
        return <ProviderKycPage />;

      // Provider enhanced pages
      case 'provider-wallet':
        return <ProviderWalletPage />;
      case 'provider-payouts':
        return <ProviderPayoutsPage />;
      case 'provider-invoices':
        return <ProviderInvoicesPage />;

      // Technician pages
      case 'technician-dashboard':
        return <TechnicianDashboardPage />;
      case 'technician-jobs':
        return <TechnicianJobsPage />;
      case 'technician-job-detail':
        return <TechnicianJobDetailPage />;
      case 'technician-earnings':
        return <TechnicianEarningsPage />;
      case 'technician-profile':
        return <TechnicianProfilePage />;
      case 'technician-availability':
        return <TechnicianAvailabilityPage />;

      // Admin pages
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case 'admin-user-detail':
        return <AdminUserDetailPage />;
      case 'admin-services':
        return <AdminServicesPage />;
      case 'admin-bookings':
        return <AdminBookingsPage />;
      case 'admin-disputes':
        return <AdminDisputesPage />;
      case 'admin-categories':
        return <AdminCategoriesPage />;
      case 'admin-faq':
        return <AdminFaqPage />;
      case 'admin-revenue':
        return <AdminRevenuePage />;
      case 'admin-logs':
        return <AdminLogsPage />;

      // Admin enhanced pages
      case 'admin-analytics':
        return <AdminAnalyticsPage />;
      case 'admin-franchises':
        return <AdminFranchisesPage />;
      case 'admin-franchise-detail':
        return <AdminFranchiseDetailPage />;
      case 'admin-crm':
        return <AdminCrmPage />;
      case 'admin-payouts':
        return <AdminPayoutsPage />;
      case 'admin-inventory':
        return <AdminInventoryPage />;
      case 'admin-coupons':
        return <AdminCouponsPage />;
      case 'admin-amc':
        return <AdminAmcPage />;
      case 'admin-b2b':
        return <AdminB2bPage />;

      // Franchise pages
      case 'franchise-dashboard':
        return <FranchiseDashboardPage />;
      case 'franchise-vendors':
        return <FranchiseVendorsPage />;
      case 'franchise-analytics':
        return <FranchiseAnalyticsPage />;

      // Vendor pages
      case 'vendor-dashboard':
        return <VendorDashboardPage />;
      case 'vendor-bookings':
        return <VendorBookingsPage />;
      case 'vendor-services':
        return <VendorServicesPage />;
      case 'vendor-profile':
        return <VendorProfilePage />;
      case 'vendor-kyc':
        return <VendorKycPage />;
      case 'vendor-wallet':
        return <VendorWalletPage />;
      case 'vendor-payouts':
        return <VendorPayoutsPage />;

      // Area Manager pages
      case 'area-manager-dashboard':
        return <AreaManagerDashboardPage />;

      // Client commissions page (Old #7, #30, #57 fix)
      case 'client-commissions':
        return <ClientReferralsPage />;

      // Join pages
      case 'join-manager':
        return <JoinManagerPage />;
      case 'join-local-admin':
        return <JoinLocalAdminPage />;

      // New Dashboard pages
      case 'super-admin-dashboard':
        return <SuperAdminDashboardPage />;
      case 'manager-dashboard':
        return <ManagerDashboardPage />;
      case 'local-admin-dashboard':
        return <LocalAdminDashboardPage />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

// Error Boundary component (N5 fix — prevents white screen on render errors)
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="mt-2 max-w-md text-muted-foreground">An unexpected error occurred. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] px-6 py-3 text-white shadow-lg transition-opacity hover:opacity-90">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

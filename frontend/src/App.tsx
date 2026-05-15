import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
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

// Area Manager pages
import { AreaManagerDashboardPage } from '@/components/bys/area-manager-dashboard-page';

function AppRouter() {
  const { nav } = useApp();

  const renderPage = () => {
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
        return <LegalPage />;
      case 'privacy':
        return <LegalPage />;
      case 'refund-policy':
        return <LegalPage />;
      case 'cookie-policy':
        return <LegalPage />;
      case 'aup':
        return <LegalPage />;
      case 'provider-agreement':
        return <LegalPage />;
      case 'community-guidelines':
        return <LegalPage />;

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

      // Area Manager pages
      case 'area-manager-dashboard':
        return <AreaManagerDashboardPage />;
      case 'client-commissions':
        return <ClientReferralsPage />;

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

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
        <Toaster />
        <SonnerToaster />
      </AppProvider>
    </AuthProvider>
  );
}

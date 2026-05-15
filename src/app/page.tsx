'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { AppProvider, useApp } from '@/contexts/app-context';
import { Header } from '@/components/bys/header';
import { Footer } from '@/components/bys/footer';
import { HomePage } from '@/components/bys/home-page';

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-800" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Simple page map using dynamic imports only when needed
const pageCache: Record<string, React.ComponentType> = {};

async function loadPage(page: string): Promise<React.ComponentType | null> {
  if (pageCache[page]) return pageCache[page];
  
  const pageModules: Record<string, () => Promise<Record<string, any>>> = {
    'categories': () => import('@/components/bys/categories-page'),
    'category-detail': () => import('@/components/bys/category-detail-page'),
    'service-detail': () => import('@/components/bys/service-detail-page'),
    'search': () => import('@/components/bys/search-page'),
    'about': () => import('@/components/bys/about-page'),
    'how-it-works': () => import('@/components/bys/how-it-works-page'),
    'faq': () => import('@/components/bys/faq-page'),
    'contact': () => import('@/components/bys/contact-page'),
    'terms': () => import('@/components/bys/legal-page'),
    'privacy': () => import('@/components/bys/legal-page'),
    'refund-policy': () => import('@/components/bys/legal-page'),
    'cookie-policy': () => import('@/components/bys/legal-page'),
    'login': () => import('@/components/bys/login-page'),
    'register': () => import('@/components/bys/register-page'),
    'client-dashboard': () => import('@/components/bys/client-dashboard-page'),
    'client-bookings': () => import('@/components/bys/client-bookings-page'),
    'client-booking-detail': () => import('@/components/bys/client-booking-detail-page'),
    'client-profile': () => import('@/components/bys/client-profile-page'),
    'client-reviews': () => import('@/components/bys/client-reviews-page'),
    'client-favorites': () => import('@/components/bys/client-favorites-page'),
    'client-notifications': () => import('@/components/bys/client-notifications-page'),
    'booking': () => import('@/components/bys/booking-page'),
    'booking-confirmation': () => import('@/components/bys/booking-confirmation-page'),
    'provider-dashboard': () => import('@/components/bys/provider-dashboard-page'),
    'provider-services': () => import('@/components/bys/provider-services-page'),
    'provider-create-service': () => import('@/components/bys/provider-create-service-page'),
    'provider-bookings': () => import('@/components/bys/provider-bookings-page'),
    'provider-booking-detail': () => import('@/components/bys/provider-booking-detail-page'),
    'provider-earnings': () => import('@/components/bys/provider-earnings-page'),
    'provider-reviews': () => import('@/components/bys/provider-reviews-page'),
    'provider-profile': () => import('@/components/bys/provider-profile-page'),
    'provider-kyc': () => import('@/components/bys/provider-kyc-page'),
    'admin-dashboard': () => import('@/components/bys/admin-dashboard-page'),
    'admin-users': () => import('@/components/bys/admin-users-page'),
    'admin-user-detail': () => import('@/components/bys/admin-user-detail-page'),
    'admin-services': () => import('@/components/bys/admin-services-page'),
    'admin-bookings': () => import('@/components/bys/admin-bookings-page'),
    'admin-disputes': () => import('@/components/bys/admin-disputes-page'),
    'admin-categories': () => import('@/components/bys/admin-categories-page'),
    'admin-faq': () => import('@/components/bys/admin-faq-page'),
    'admin-revenue': () => import('@/components/bys/admin-revenue-page'),
    'admin-logs': () => import('@/components/bys/admin-logs-page'),
    'client-referrals': () => import('@/components/bys/client-referrals-page'),
    'area-manager-dashboard': () => import('@/components/bys/area-manager-dashboard-page'),
    'client-commissions': () => import('@/components/bys/client-commissions-page'),
    'client-wallet': () => import('@/components/bys/client-wallet-page'),
    'client-amc': () => import('@/components/bys/client-amc-page'),
    'client-coupons': () => import('@/components/bys/client-coupons-page'),
    'client-invoices': () => import('@/components/bys/client-invoices-page'),
    'emergency-booking': () => import('@/components/bys/emergency-booking-page'),
    'technician-dashboard': () => import('@/components/bys/technician-dashboard-page'),
    'technician-jobs': () => import('@/components/bys/technician-jobs-page'),
    'technician-earnings': () => import('@/components/bys/technician-earnings-page'),
    'technician-profile': () => import('@/components/bys/technician-profile-page'),
    'technician-availability': () => import('@/components/bys/technician-availability-page'),
    'vendor-dashboard': () => import('@/components/bys/vendor-dashboard-page'),
    'vendor-bookings': () => import('@/components/bys/vendor-bookings-page'),
    'vendor-services': () => import('@/components/bys/vendor-services-page'),
    'vendor-profile': () => import('@/components/bys/vendor-profile-page'),
    'vendor-kyc': () => import('@/components/bys/vendor-kyc-page'),
    'vendor-wallet': () => import('@/components/bys/vendor-wallet-page'),
    'vendor-payouts': () => import('@/components/bys/vendor-payouts-page'),
    'franchise-dashboard': () => import('@/components/bys/franchise-dashboard-page'),
    'franchise-vendors': () => import('@/components/bys/franchise-vendors-page'),
    'franchise-analytics': () => import('@/components/bys/franchise-analytics-page'),
    'admin-analytics': () => import('@/components/bys/admin-analytics-page'),
    'admin-franchises': () => import('@/components/bys/admin-franchises-page'),
    'admin-crm': () => import('@/components/bys/admin-crm-page'),
    'admin-payouts': () => import('@/components/bys/admin-payouts-page'),
    'admin-inventory': () => import('@/components/bys/admin-inventory-page'),
    'admin-coupons': () => import('@/components/bys/admin-coupons-page'),
    'admin-amc': () => import('@/components/bys/admin-amc-page'),
  };

  const loader = pageModules[page];
  if (!loader) return null;

  try {
    const mod = await loader();
    // Find the exported component (first exported function that's a component)
    const Comp = Object.values(mod).find(v => typeof v === 'function') as React.ComponentType;
    if (Comp) {
      pageCache[page] = Comp;
      return Comp;
    }
  } catch (e) {
    console.error('Failed to load page:', page, e);
  }
  return null;
}

function DynamicPage({ page }: { page: string }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadPage(page).then(comp => {
      setComponent(() => comp);
      setLoading(false);
    });
  }, [page]);

  if (loading || !Component) {
    return <PageLoader />;
  }

  return <Component />;
}

function AppRouter() {
  const { nav } = useApp();

  // Home page is loaded eagerly, everything else is lazy
  if (nav.page === 'home') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <DynamicPage page={nav.page} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AuthProvider>
  );
}

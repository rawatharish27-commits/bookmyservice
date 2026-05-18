import React, { createContext, useContext, useState, useCallback } from 'react';

export type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'categories'
  | 'category-detail'
  | 'service-detail'
  | 'search'
  | 'booking'
  | 'booking-confirmation'
  | 'client-payment'
  | 'booking-tracking'
  // Client pages
  | 'client-dashboard'
  | 'client-bookings'
  | 'client-booking-detail'
  | 'client-profile'
  | 'client-reviews'
  | 'client-favorites'
  | 'client-notifications'
  | 'client-wallet'
  | 'client-amc'
  | 'client-amc-detail'
  | 'client-coupons'
  | 'client-referrals'
  | 'client-invoices'
  | 'client-invoice-detail'
  // Provider pages
  | 'provider-dashboard'
  | 'provider-services'
  | 'provider-create-service'
  | 'provider-bookings'
  | 'provider-booking-detail'
  | 'provider-earnings'
  | 'provider-reviews'
  | 'provider-profile'
  | 'provider-kyc'
  | 'provider-wallet'
  | 'provider-payouts'
  | 'provider-invoices'
  // Technician pages
  | 'technician-dashboard'
  | 'technician-jobs'
  | 'technician-job-detail'
  | 'technician-earnings'
  | 'technician-profile'
  | 'technician-availability'
  // Admin pages
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-user-detail'
  | 'admin-services'
  | 'admin-bookings'
  | 'admin-disputes'
  | 'admin-categories'
  | 'admin-faq'
  | 'admin-revenue'
  | 'admin-logs'
  | 'admin-analytics'
  | 'admin-franchises'
  | 'admin-franchise-detail'
  | 'admin-crm'
  | 'admin-payouts'
  | 'admin-inventory'
  | 'admin-coupons'
  | 'admin-amc'
  | 'admin-b2b'
  | 'admin-analytics-dashboard'
  // Emergency booking
  | 'emergency-booking'
  // Franchise pages
  | 'franchise-dashboard'
  | 'franchise-vendors'
  | 'franchise-analytics'
  // Vendor pages
  | 'vendor-dashboard'
  | 'vendor-bookings'
  | 'vendor-services'
  | 'vendor-profile'
  | 'vendor-kyc'
  | 'vendor-wallet'
  | 'vendor-payouts'
  // Area Manager pages
  | 'area-manager-dashboard'
  | 'client-commissions'
  // Join pages
  | 'join-manager'
  | 'join-local-admin'
  // New Dashboard pages
  | 'super-admin-dashboard'
  | 'manager-dashboard'
  | 'local-admin-dashboard'
  // AI Recommendations
  | 'recommendations'
  // Legal / static pages
  | 'about'
  | 'how-it-works'
  | 'faq'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'refund-policy'
  | 'cookie-policy'
  | 'aup'
  | 'provider-agreement'
  | 'community-guidelines';

interface NavigationState {
  page: Page;
  params: Record<string, string>;
}

interface AppContextType {
  nav: NavigationState;
  navigate: (page: Page, params?: Record<string, string>) => void;
  goBack: () => void;
  history: NavigationState[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavigationState[]>([{ page: 'home', params: {} }]);
  const [nav, setNav] = useState<NavigationState>({ page: 'home', params: {} });

  const navigate = useCallback((page: Page, params: Record<string, string> = {}) => {
    setHistory(prev => {
      const newHistory = [...prev, nav];
      // Cap history to prevent memory leak (N42 fix)
      return newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
    });
    setNav({ page, params });
    window.scrollTo(0, 0);
  }, [nav]);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev];
      const last = newHistory.pop();
      if (newHistory.length === 0 || !last) {
        // Will set nav to home below (N12 fix — no side effects in updater)
        return [];
      }
      return newHistory;
    });
    // Set nav independently (N12 fix — don't call setNav inside setHistory updater)
    setHistory(prev => {
      if (prev.length === 0) {
        setNav({ page: 'home', params: {} });
      } else {
        setNav(prev[prev.length - 1]);
      }
      return prev;
    });
  }, []);

  return (
    <AppContext.Provider value={{ nav, navigate, goBack, history }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

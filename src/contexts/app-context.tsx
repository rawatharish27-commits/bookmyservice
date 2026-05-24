'use client';

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
  | 'client-dashboard'
  | 'client-bookings'
  | 'client-booking-detail'
  | 'client-profile'
  | 'client-reviews'
  | 'client-favorites'
  | 'client-notifications'
  | 'provider-dashboard'
  | 'provider-services'
  | 'provider-create-service'
  | 'provider-bookings'
  | 'provider-booking-detail'
  | 'provider-earnings'
  | 'provider-reviews'
  | 'provider-profile'
  | 'provider-kyc'
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
  | 'about'
  | 'how-it-works'
  | 'faq'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'refund-policy'
  | 'cookie-policy'
  | 'client-referrals'
  | 'area-manager-dashboard'
  | 'client-commissions'
  | 'client-wallet'
  | 'client-amc'
  | 'client-coupons'
  | 'client-invoices'
  | 'emergency-booking'
  | 'technician-dashboard'
  | 'technician-jobs'
  | 'technician-earnings'
  | 'technician-profile'
  | 'technician-availability'
  | 'vendor-dashboard'
  | 'vendor-bookings'
  | 'vendor-services'
  | 'vendor-profile'
  | 'vendor-kyc'
  | 'vendor-wallet'
  | 'vendor-payouts'
  | 'franchise-dashboard'
  | 'franchise-vendors'
  | 'franchise-analytics'
  | 'admin-analytics'
  | 'admin-franchises'
  | 'admin-crm'
  | 'admin-payouts'
  | 'admin-inventory'
  | 'admin-coupons'
  | 'admin-amc';

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
    setHistory(prev => [...prev, nav]);
    setNav({ page, params });
    window.scrollTo(0, 0);
  }, [nav]);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev];
      const last = newHistory.pop();
      if (last) {
        setNav(last);
      }
      return newHistory;
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

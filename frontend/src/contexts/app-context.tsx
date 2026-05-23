import React, { createContext, useContext, useState, useCallback } from 'react';

// Re-export Page type from the canonical location
export type { Page } from '@/routes/types';
import type { Page } from '@/routes/types';

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

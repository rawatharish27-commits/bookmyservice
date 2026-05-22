import React, { Suspense, lazy, useEffect, useRef, useMemo } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider, useAuth, ROLE_ID_MAP } from '@/contexts/auth-context';
import { AppProvider, useApp } from '@/contexts/app-context';
import { Header } from '@/components/bys/header';
import { Footer } from '@/components/bys/footer';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ROUTE_MAP, VALID_PAGES } from '@/routes/route-registry';
import { isRouteAccessible, ROLE_DASHBOARD_MAP } from '@/routes/access-control';
import type { Page } from '@/routes/types';

// ---------------------------------------------------------------------------
// Page-loader skeleton shown while a lazy component is being fetched
// ---------------------------------------------------------------------------
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 404 page shown when the page name is not in the registry
// ---------------------------------------------------------------------------
function NotFoundPage() {
  const { navigate } = useApp();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a1628]/10 to-[#2d5a8e]/10">
        <span className="text-4xl font-black text-[#1e3a5f]">404</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">Page Not Found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <button
        onClick={() => navigate('home')}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] px-6 py-3 text-white shadow-lg transition-opacity hover:opacity-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Go Home
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cache for already-created lazy components so we don't re-create on every
// render (React.lazy must be called outside of render, and the module
// promise is cached by the browser / bundler anyway).
// ---------------------------------------------------------------------------
const lazyCache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();

function getLazyComponent(page: Page): React.LazyExoticComponent<React.ComponentType<any>> | null {
  const route = ROUTE_MAP.get(page);
  if (!route) return null;

  let LazyComp = lazyCache.get(page);
  if (!LazyComp) {
    LazyComp = lazy(route.loader);
    lazyCache.set(page, LazyComp);
  }
  return LazyComp;
}

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

  // Resolve the lazy component for the current page
  const LazyComponent = useMemo(() => {
    if (!VALID_PAGES.has(nav.page)) return null;
    return getLazyComponent(nav.page);
  }, [nav.page]);

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
        {renderPage()}
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

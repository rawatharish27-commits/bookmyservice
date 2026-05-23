import React, { Suspense, useEffect, useRef, useMemo } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider, useAuth, ROLE_ID_MAP } from '@/contexts/auth-context';
import { AppProvider, useApp } from '@/contexts/app-context';
import { Header } from '@/components/bys/header';
import { Footer } from '@/components/bys/footer';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { PageLoader } from '@/components/page-loader';
import { ROUTE_MAP, VALID_PAGES } from '@/routes/route-registry';
import { isRouteAccessible, ROLE_DASHBOARD_MAP } from '@/routes/access-control';
import type { Page } from '@/routes/types';

// ---------------------------------------------------------------------------
// 404 / Not Found component (inline, avoids an extra file)
// ---------------------------------------------------------------------------
function NotFoundPage() {
  const { navigate } = useApp();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <button
        onClick={() => navigate('home')}
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Go Home
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main router component
// ---------------------------------------------------------------------------
function AppRouter() {
  const { nav, navigate } = useApp();
  const { user, token } = useAuth();
  const lastRedirectRef = useRef<string>('');

  // Derive role ID from user object
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
      lastRedirectRef.current = '';
    }
  }, [nav.page, userRoleId, token, navigate]);

  // Resolve the route config for the current page
  const routeConfig = useMemo(() => {
    return ROUTE_MAP.get(nav.page as Page) ?? null;
  }, [nav.page]);

  // Resolve extra props from route config (e.g. `type` for LegalPage)
  const routeProps = useMemo(() => {
    return routeConfig?.props ?? {};
  }, [routeConfig]);

  // Lazy-load the component for the current route
  const LazyComponent = useMemo(() => {
    if (!routeConfig) return null;
    return React.lazy(routeConfig.loader);
  }, [routeConfig]);

  function renderPage() {
    // Invalid page or missing component → 404
    if (!VALID_PAGES.has(nav.page as Page) || !LazyComponent) {
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
// Re-export ROLE_DASHBOARD_MAP for external consumers (e.g. auth-context)
// ---------------------------------------------------------------------------
export { ROLE_DASHBOARD_MAP };

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

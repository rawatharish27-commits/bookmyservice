/**
 * Access control utilities for the BookMyService application.
 *
 * Extracted from the inline logic previously in App.tsx so that
 * route guarding can be tested and reused independently.
 */

import { ROLE_IDS, ROLE_ID_MAP } from '@/contexts/auth-context';
import type { Page } from './types';
import { ROUTE_MAP, VALID_PAGES } from './route-registry';

// ---------------------------------------------------------------------------
// Role → default dashboard mapping (single source of truth)
// ---------------------------------------------------------------------------
export const ROLE_DASHBOARD_MAP: Record<number, Page> = {
  [ROLE_IDS.CLIENT]: 'client-dashboard',
  [ROLE_IDS.PROVIDER]: 'provider-dashboard',
  [ROLE_IDS.ADMIN]: 'super-admin-dashboard',
  [ROLE_IDS.TECHNICIAN]: 'technician-dashboard',
  [ROLE_IDS.VENDOR]: 'vendor-dashboard',
  [ROLE_IDS.FRANCHISE]: 'franchise-dashboard',
  [ROLE_IDS.SUB_ADMIN]: 'admin-dashboard',       // SUB_ADMIN shares admin dashboard (Old #31)
  [ROLE_IDS.AREA_MANAGER]: 'area-manager-dashboard',
  [ROLE_IDS.MANAGER]: 'manager-dashboard',
  [ROLE_IDS.LOCAL_ADMIN]: 'local-admin-dashboard',
};

// ---------------------------------------------------------------------------
// Page prefix → allowed role IDs (used for role-based access checks)
// The order matters: longer prefixes must come before shorter ones that
// share the same root (e.g. "super-admin-" before "admin-").
// ---------------------------------------------------------------------------
export const ROLE_ROUTE_PREFIX: [string, number[]][] = [
  ['super-admin-', [ROLE_IDS.ADMIN]],               // SUPER_ADMIN only (roleId 3)
  ['admin-', [ROLE_IDS.ADMIN, ROLE_IDS.SUB_ADMIN]], // ADMIN + SUB_ADMIN (roleId 3, 7)
  ['provider-', [ROLE_IDS.PROVIDER]],
  ['technician-', [ROLE_IDS.TECHNICIAN]],
  ['vendor-', [ROLE_IDS.VENDOR]],
  ['franchise-', [ROLE_IDS.FRANCHISE]],
  ['area-manager-', [ROLE_IDS.AREA_MANAGER]],
  ['manager-', [ROLE_IDS.MANAGER]],
  ['local-admin-', [ROLE_IDS.LOCAL_ADMIN]],
  ['client-', [ROLE_IDS.CLIENT]],
];

// Dashboard prefixes — pages whose name starts with one of these are
// considered "dashboard" pages that enforce role-based access.
const DASHBOARD_PREFIXES = [
  'client-',
  'provider-',
  'technician-',
  'admin-',
  'super-admin-',
  'vendor-',
  'franchise-',
  'area-manager-',
  'manager-',
  'local-admin-',
];

// ---------------------------------------------------------------------------
// Access check result
// ---------------------------------------------------------------------------
export interface AccessResult {
  /** Whether the user is allowed to view the page */
  allowed: boolean;
  /** If not allowed, the page the user should be redirected to */
  redirectTo?: Page;
  /** Reason for denial (useful for logging / debugging) */
  reason?: 'unauthenticated' | 'wrong_role' | 'invalid_page';
}

// ---------------------------------------------------------------------------
// isRouteAccessible — the single function that encapsulates all access logic
// ---------------------------------------------------------------------------
export function isRouteAccessible(
  page: string,
  roleId: number | undefined,
  isAuthenticated: boolean,
): AccessResult {
  // 1. Invalid page?
  if (!VALID_PAGES.has(page as Page)) {
    return { allowed: false, reason: 'invalid_page' };
  }

  const route = ROUTE_MAP.get(page as Page);

  // 2. Public page — always accessible
  if (route && !route.isProtected) {
    return { allowed: true };
  }

  // 3. Protected page but not authenticated → redirect to login
  if (!isAuthenticated) {
    return { allowed: false, redirectTo: 'login', reason: 'unauthenticated' };
  }

  // 4. Authenticated — check role-based access
  //    First check the explicit allowedRoles on the route config
  if (route?.allowedRoles) {
    const userRoleId = roleId ?? 0;
    if (!route.allowedRoles.includes(userRoleId)) {
      const dashboard = ROLE_DASHBOARD_MAP[userRoleId] || 'home';
      return { allowed: false, redirectTo: dashboard, reason: 'wrong_role' };
    }
    return { allowed: true };
  }

  // 5. Route is protected but has no explicit allowedRoles (any authenticated
  //    user may access, e.g. booking, recommendations). Also check dashboard
  //    prefix rules for pages that don't have an explicit allowedRoles entry
  //    but whose name starts with a role prefix.
  const isDashboardPage = DASHBOARD_PREFIXES.some(prefix => page.startsWith(prefix));
  if (isDashboardPage) {
    const userRoleId = roleId ?? 0;
    for (const [prefix, allowedRoles] of ROLE_ROUTE_PREFIX) {
      if (page.startsWith(prefix)) {
        if (!allowedRoles.includes(userRoleId)) {
          const dashboard = ROLE_DASHBOARD_MAP[userRoleId] || 'home';
          return { allowed: false, redirectTo: dashboard, reason: 'wrong_role' };
        }
        return { allowed: true };
      }
    }
    // Page starts with a dashboard prefix but no matching rule found — deny
    const dashboard = ROLE_DASHBOARD_MAP[userRoleId] || 'home';
    return { allowed: false, redirectTo: dashboard, reason: 'wrong_role' };
  }

  // 6. Protected route, authenticated, no role restriction → allow
  return { allowed: true };
}

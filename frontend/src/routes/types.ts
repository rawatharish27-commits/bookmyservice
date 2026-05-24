/**
 * Route type definitions for the BookMyService application.
 * Single source of truth for the Page type union used across the app.
 */

export type Page =
  // Public pages
  | 'home'
  | 'categories'
  | 'category-detail'
  | 'service-detail'
  | 'search'
  | 'about'
  | 'how-it-works'
  | 'faq'
  | 'contact'
  // Legal / static pages
  | 'terms'
  | 'privacy'
  | 'refund-policy'
  | 'cookie-policy'
  | 'aup'
  | 'provider-agreement'
  | 'community-guidelines'
  // Auth pages
  | 'login'
  | 'admin-login'
  | 'register'
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
  | 'client-commissions'
  // Booking pages
  | 'booking'
  | 'booking-confirmation'
  | 'client-payment'
  | 'booking-tracking'
  | 'emergency-booking'
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
  | 'admin-analytics-dashboard'
  | 'admin-franchises'
  | 'admin-franchise-detail'
  | 'admin-crm'
  | 'admin-payouts'
  | 'admin-inventory'
  | 'admin-coupons'
  | 'admin-amc'
  | 'admin-b2b'
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
  // Join pages
  | 'join-manager'
  | 'join-local-admin'
  // New Dashboard pages
  | 'super-admin-dashboard'
  | 'manager-dashboard'
  | 'local-admin-dashboard'
  // AI Recommendations
  | 'recommendations';

export interface RouteConfig {
  /** Unique page identifier matching the Page type */
  page: Page;
  /** Dynamic import loader for code-splitting */
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  /** Chunk name for webpack/vite bundle analysis */
  chunkName: string;
  /** Whether the route requires authentication */
  isProtected: boolean;
  /** Role IDs allowed to access this route. undefined = any authenticated user */
  allowedRoles?: number[];
  /** Optional props to pass to the rendered component */
  props?: Record<string, unknown>;
}

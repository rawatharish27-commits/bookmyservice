// ─── Page Type — All 174 pages ─────────────────────────────────────────
export type Page =
  // Public (1-10)
  | 'home' | 'categories' | 'service-listing' | 'service-detail' | 'search'
  | 'nearby-providers' | 'featured-services' | 'trending-services' | 'offers-deals' | 'popular-providers'
  // Auth (11-19)
  | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'otp-verification'
  | 'email-verification' | 'phone-verification' | 'role-selection' | 'social-callback'
  // Customer (20-50)
  | 'client-dashboard' | 'client-profile' | 'client-edit-profile' | 'client-addresses' | 'client-saved-addresses'
  | 'client-bookings' | 'client-booking-detail' | 'client-upcoming' | 'client-completed' | 'client-cancelled'
  | 'client-booking-tracking' | 'client-rebook' | 'client-invoice' | 'client-booking-review'
  | 'client-favorites' | 'client-wallet' | 'client-wallet-transactions' | 'client-add-money'
  | 'client-coupons' | 'client-referral' | 'client-amc' | 'client-amc-detail'
  | 'client-notifications' | 'client-notification-detail'
  | 'client-support' | 'client-support-detail' | 'client-chat'
  | 'client-settings' | 'client-privacy' | 'client-payment-methods' | 'client-transactions'
  // Booking Flow (51-60)
  | 'booking-checkout' | 'booking-datetime' | 'booking-summary' | 'booking-payment'
  | 'booking-razorpay' | 'payment-success' | 'payment-failed'
  | 'booking-confirmation' | 'booking-cancellation' | 'booking-reschedule'
  // Tracking (61-65)
  | 'live-tracking' | 'technician-eta' | 'route-visualization' | 'booking-timeline' | 'technician-contact'
  // Provider (66-92)
  | 'provider-dashboard' | 'provider-profile' | 'provider-edit-profile'
  | 'provider-kyc' | 'provider-upload-docs'
  | 'provider-services' | 'provider-add-service' | 'provider-edit-service' | 'provider-delete-service'
  | 'provider-bookings' | 'provider-booking-requests' | 'provider-active-jobs' | 'provider-completed-jobs' | 'provider-cancelled-jobs'
  | 'provider-earnings' | 'provider-payouts' | 'provider-withdraw' | 'provider-wallet'
  | 'provider-reviews' | 'provider-schedule' | 'provider-availability' | 'provider-notifications'
  | 'provider-chat' | 'provider-analytics' | 'provider-support' | 'provider-subscription' | 'provider-settings'
  // Admin (93-129)
  | 'admin-dashboard' | 'admin-analytics' | 'admin-revenue-analytics' | 'admin-booking-analytics'
  | 'admin-user-analytics' | 'admin-provider-analytics'
  | 'admin-customers' | 'admin-providers' | 'admin-admins' | 'admin-roles'
  | 'admin-bookings' | 'admin-booking-detail'
  | 'admin-categories' | 'admin-coupons' | 'admin-wallets' | 'admin-payments'
  | 'admin-refunds' | 'admin-amc' | 'admin-referrals'
  | 'admin-notifications' | 'admin-reviews' | 'admin-reports' | 'admin-fraud'
  | 'admin-support' | 'admin-chat-monitoring'
  | 'admin-cms' | 'admin-seo' | 'admin-system-settings' | 'admin-api-settings'
  | 'admin-email-templates' | 'admin-sms-templates' | 'admin-push-notifications'
  | 'admin-audit-logs' | 'admin-security' | 'admin-backup' | 'admin-feature-flags' | 'admin-profile'
  // Communication (130-136)
  | 'chat' | 'chat-inbox' | 'provider-customer-chat' | 'admin-support-chat'
  | 'attachment-preview' | 'video-consultation' | 'call-history'
  // Marketing (137-147)
  | 'about' | 'contact' | 'faq' | 'how-it-works' | 'become-provider'
  | 'careers' | 'blog' | 'blog-detail' | 'press' | 'testimonials' | 'partner-program'
  // Legal (148-153)
  | 'privacy-policy' | 'terms' | 'refund-policy' | 'cancellation-policy' | 'cookie-policy' | 'gdpr'
  // Advanced (154-164)
  | 'franchise-dashboard' | 'franchise-management'
  | 'crm-dashboard' | 'lead-management'
  | 'vendor-management' | 'inventory-management'
  | 'escrow-management' | 'dynamic-pricing' | 'recommendation-engine'
  | 'ai-suggestions' | 'loyalty-rewards'
  // Error (165-170)
  | '404' | '500' | 'maintenance' | 'no-internet' | 'access-denied' | 'session-expired'
  // PWA (171-174)
  | 'install-app' | 'offline-sync' | 'push-permission' | 'device-sessions'

export interface NavigationState {
  page: Page
  params: Record<string, string>
}

export const PAGE_GROUPS: Record<string, Page[]> = {
  public: ['home', 'categories', 'service-listing', 'service-detail', 'search', 'nearby-providers', 'featured-services', 'trending-services', 'offers-deals', 'popular-providers'],
  auth: ['login', 'signup', 'forgot-password', 'reset-password', 'otp-verification', 'email-verification', 'phone-verification', 'role-selection', 'social-callback'],
  customer: ['client-dashboard', 'client-profile', 'client-edit-profile', 'client-addresses', 'client-saved-addresses', 'client-bookings', 'client-booking-detail', 'client-upcoming', 'client-completed', 'client-cancelled', 'client-booking-tracking', 'client-rebook', 'client-invoice', 'client-booking-review', 'client-favorites', 'client-wallet', 'client-wallet-transactions', 'client-add-money', 'client-coupons', 'client-referral', 'client-amc', 'client-amc-detail', 'client-notifications', 'client-notification-detail', 'client-support', 'client-support-detail', 'client-chat', 'client-settings', 'client-privacy', 'client-payment-methods', 'client-transactions'],
  booking: ['booking-checkout', 'booking-datetime', 'booking-summary', 'booking-payment', 'booking-razorpay', 'payment-success', 'payment-failed', 'booking-confirmation', 'booking-cancellation', 'booking-reschedule'],
  tracking: ['live-tracking', 'technician-eta', 'route-visualization', 'booking-timeline', 'technician-contact'],
  provider: ['provider-dashboard', 'provider-profile', 'provider-edit-profile', 'provider-kyc', 'provider-upload-docs', 'provider-services', 'provider-add-service', 'provider-edit-service', 'provider-delete-service', 'provider-bookings', 'provider-booking-requests', 'provider-active-jobs', 'provider-completed-jobs', 'provider-cancelled-jobs', 'provider-earnings', 'provider-payouts', 'provider-withdraw', 'provider-wallet', 'provider-reviews', 'provider-schedule', 'provider-availability', 'provider-notifications', 'provider-chat', 'provider-analytics', 'provider-support', 'provider-subscription', 'provider-settings'],
  admin: ['admin-dashboard', 'admin-analytics', 'admin-revenue-analytics', 'admin-booking-analytics', 'admin-user-analytics', 'admin-provider-analytics', 'admin-customers', 'admin-providers', 'admin-admins', 'admin-roles', 'admin-bookings', 'admin-booking-detail', 'admin-categories', 'admin-coupons', 'admin-wallets', 'admin-payments', 'admin-refunds', 'admin-amc', 'admin-referrals', 'admin-notifications', 'admin-reviews', 'admin-reports', 'admin-fraud', 'admin-support', 'admin-chat-monitoring', 'admin-cms', 'admin-seo', 'admin-system-settings', 'admin-api-settings', 'admin-email-templates', 'admin-sms-templates', 'admin-push-notifications', 'admin-audit-logs', 'admin-security', 'admin-backup', 'admin-feature-flags', 'admin-profile'],
  communication: ['chat', 'chat-inbox', 'provider-customer-chat', 'admin-support-chat', 'attachment-preview', 'video-consultation', 'call-history'],
  marketing: ['about', 'contact', 'faq', 'how-it-works', 'become-provider', 'careers', 'blog', 'blog-detail', 'press', 'testimonials', 'partner-program'],
  legal: ['privacy-policy', 'terms', 'refund-policy', 'cancellation-policy', 'cookie-policy', 'gdpr'],
  advanced: ['franchise-dashboard', 'franchise-management', 'crm-dashboard', 'lead-management', 'vendor-management', 'inventory-management', 'escrow-management', 'dynamic-pricing', 'recommendation-engine', 'ai-suggestions', 'loyalty-rewards'],
  error: ['404', '500', 'maintenance', 'no-internet', 'access-denied', 'session-expired'],
  pwa: ['install-app', 'offline-sync', 'push-permission', 'device-sessions'],
}

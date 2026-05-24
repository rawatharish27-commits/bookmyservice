// ─── Shared Page Component Helpers ──────────────────────────────────
// Used by all page generators for consistent design language

import { type Page, PAGE_GROUPS } from '@/lib/navigation'

// ─── Color Palette ──────────────────────────────────────────────────
export const colors = {
  navy: '#1e293b',
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  red: '#ef4444',
  cyan: '#06b6d4',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
}

// ─── Status Badge Config ────────────────────────────────────────────
export const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  Completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  Pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  Upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  InProgress: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  Refunded: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  Failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  Verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Unverified: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  Open: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  Resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Unpaid: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  Partial: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
}

// ─── Sidebar Navigation Groups ──────────────────────────────────────
export const adminSidebarNav = [
  { section: 'Main', items: [
    { label: 'Dashboard', page: 'admin-dashboard' as Page, icon: 'LayoutDashboard' },
  ]},
  { section: 'Analytics', items: [
    { label: 'System Analytics', page: 'admin-analytics' as Page, icon: 'BarChart3' },
    { label: 'Revenue', page: 'admin-revenue-analytics' as Page, icon: 'TrendingUp' },
    { label: 'Bookings', page: 'admin-booking-analytics' as Page, icon: 'Calendar' },
    { label: 'Users', page: 'admin-user-analytics' as Page, icon: 'Users' },
    { label: 'Providers', page: 'admin-provider-analytics' as Page, icon: 'Briefcase' },
  ]},
  { section: 'Management', items: [
    { label: 'Customers', page: 'admin-customers' as Page, icon: 'UserCheck' },
    { label: 'Providers', page: 'admin-providers' as Page, icon: 'Briefcase' },
    { label: 'Admins', page: 'admin-admins' as Page, icon: 'Shield' },
    { label: 'Roles & Permissions', page: 'admin-roles' as Page, icon: 'Lock' },
    { label: 'Bookings', page: 'admin-bookings' as Page, icon: 'Calendar' },
    { label: 'Categories', page: 'admin-categories' as Page, icon: 'LayoutGrid' },
    { label: 'Coupons', page: 'admin-coupons' as Page, icon: 'Tag' },
    { label: 'Wallets', page: 'admin-wallets' as Page, icon: 'Wallet' },
    { label: 'Payments', page: 'admin-payments' as Page, icon: 'CreditCard' },
    { label: 'Refunds', page: 'admin-refunds' as Page, icon: 'RotateCcw' },
    { label: 'AMC', page: 'admin-amc' as Page, icon: 'ShieldCheck' },
    { label: 'Referrals', page: 'admin-referrals' as Page, icon: 'Users' },
    { label: 'Reviews', page: 'admin-reviews' as Page, icon: 'Star' },
  ]},
  { section: 'System', items: [
    { label: 'Notifications', page: 'admin-notifications' as Page, icon: 'Bell' },
    { label: 'Reports', page: 'admin-reports' as Page, icon: 'FileText' },
    { label: 'Fraud Detection', page: 'admin-fraud' as Page, icon: 'AlertTriangle' },
    { label: 'Support', page: 'admin-support' as Page, icon: 'Headphones' },
    { label: 'Chat Monitor', page: 'admin-chat-monitoring' as Page, icon: 'MessageSquare' },
    { label: 'CMS', page: 'admin-cms' as Page, icon: 'FileEdit' },
    { label: 'SEO', page: 'admin-seo' as Page, icon: 'Search' },
    { label: 'Settings', page: 'admin-system-settings' as Page, icon: 'Settings' },
    { label: 'API Settings', page: 'admin-api-settings' as Page, icon: 'Code' },
    { label: 'Email Templates', page: 'admin-email-templates' as Page, icon: 'Mail' },
    { label: 'SMS Templates', page: 'admin-sms-templates' as Page, icon: 'Smartphone' },
    { label: 'Push Notifications', page: 'admin-push-notifications' as Page, icon: 'BellRing' },
    { label: 'Audit Logs', page: 'admin-audit-logs' as Page, icon: 'ScrollText' },
    { label: 'Security', page: 'admin-security' as Page, icon: 'ShieldAlert' },
    { label: 'Backup', page: 'admin-backup' as Page, icon: 'HardDrive' },
    { label: 'Feature Flags', page: 'admin-feature-flags' as Page, icon: 'ToggleRight' },
  ]},
]

export const clientSidebarNav = [
  { label: 'Dashboard', page: 'client-dashboard' as Page, icon: 'LayoutDashboard' },
  { label: 'My Bookings', page: 'client-bookings' as Page, icon: 'Calendar' },
  { label: 'Upcoming', page: 'client-upcoming' as Page, icon: 'Clock' },
  { label: 'My Wallet', page: 'client-wallet' as Page, icon: 'Wallet' },
  { label: 'My AMC', page: 'client-amc' as Page, icon: 'Shield' },
  { label: 'Favorites', page: 'client-favorites' as Page, icon: 'Heart' },
  { label: 'Coupons', page: 'client-coupons' as Page, icon: 'Tag' },
  { label: 'Reviews', page: 'client-booking-review' as Page, icon: 'Star' },
  { label: 'Referral', page: 'client-referral' as Page, icon: 'Users' },
  { label: 'Notifications', page: 'client-notifications' as Page, icon: 'Bell', badge: '3' },
  { label: 'Support', page: 'client-support' as Page, icon: 'HelpCircle' },
  { label: 'Settings', page: 'client-settings' as Page, icon: 'Settings' },
]

export const providerSidebarNav = [
  { label: 'Dashboard', page: 'provider-dashboard' as Page, icon: 'LayoutDashboard', active: true },
  { label: 'Bookings', page: 'provider-bookings' as Page, icon: 'Calendar', badge: '8' },
  { label: 'My Services', page: 'provider-services' as Page, icon: 'Briefcase' },
  { label: 'Earnings', page: 'provider-earnings' as Page, icon: 'IndianRupee' },
  { label: 'Schedule', page: 'provider-schedule' as Page, icon: 'CalendarClock' },
  { label: 'Profile', page: 'provider-profile' as Page, icon: 'User' },
  { label: 'Reviews', page: 'provider-reviews' as Page, icon: 'Star' },
  { label: 'Wallet', page: 'provider-wallet' as Page, icon: 'Wallet' },
  { label: 'Payouts', page: 'provider-payouts' as Page, icon: 'CreditCard' },
  { label: 'Notifications', page: 'provider-notifications' as Page, icon: 'Bell', badge: '3' },
  { label: 'Analytics', page: 'provider-analytics' as Page, icon: 'BarChart3' },
  { label: 'Settings', page: 'provider-settings' as Page, icon: 'Settings' },
  { label: 'Support', page: 'provider-support' as Page, icon: 'Headphones' },
]

// ─── Format Helpers ─────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

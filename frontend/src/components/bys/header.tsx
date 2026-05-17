import React, { useState, useEffect, useRef } from 'react';
import { useAuth, ROLE_IDS } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/lib/api-url';
import {
  Wrench,
  Menu,
  User,
  LogOut,
  Bell,
  Home,
  Grid3X3,
  CalendarCheck,
  LayoutDashboard,
  HelpCircle,
  Phone,
  Shield,
  Users,
  Briefcase,
  FileWarning,
  DollarSign,
  Star,
  Heart,
  Settings,
  ChevronRight,
  LogIn,
  UserPlus,
  Wallet,
  Ticket,
  Gift,
  FileText,
  Clock,
  BarChart3,
  Building2,
  Contact,
  Banknote,
  Package,
  ShieldCheck,
  Siren,
  CheckCircle2,
  ScrollText,
  Tag,
} from 'lucide-react';

interface NavLink {
  label: string;
  page: Page;
  icon: React.ReactNode;
  badge?: number;
}

// ─── Role-based Navigation Config ──────────────────────────────────────────

function getNavLinks(roleId: number | undefined, unreadCount: number): NavLink[] {
  // Unauthenticated users
  if (!roleId) {
    return [
      { label: 'Home', page: 'home', icon: <Home className="size-4" /> },
      { label: 'Services', page: 'categories', icon: <Grid3X3 className="size-4" /> },
      { label: 'How It Works', page: 'how-it-works', icon: <HelpCircle className="size-4" /> },
      { label: 'Contact', page: 'contact', icon: <Phone className="size-4" /> },
    ];
  }

  // CLIENT (roleId=1)
  if (roleId === ROLE_IDS.CLIENT) {
    return [
      { label: 'Dashboard', page: 'client-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Bookings', page: 'client-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Wallet', page: 'client-wallet', icon: <Wallet className="size-4" /> },
      { label: 'AMC Plans', page: 'client-amc', icon: <ShieldCheck className="size-4" /> },
      { label: 'Coupons', page: 'client-coupons', icon: <Tag className="size-4" /> },
      { label: 'Referrals', page: 'client-referrals', icon: <Gift className="size-4" /> },
      { label: 'Invoices', page: 'client-invoices', icon: <FileText className="size-4" /> },
    ];
  }

  // TECHNICIAN (roleId=4)
  if (roleId === ROLE_IDS.TECHNICIAN) {
    return [
      { label: 'Dashboard', page: 'technician-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Jobs', page: 'technician-jobs', icon: <Briefcase className="size-4" /> },
      { label: 'Earnings', page: 'technician-earnings', icon: <DollarSign className="size-4" /> },
      { label: 'Profile', page: 'technician-profile', icon: <User className="size-4" /> },
      { label: 'Availability', page: 'technician-availability', icon: <Clock className="size-4" /> },
    ];
  }

  // PROVIDER (roleId=2)
  if (roleId === ROLE_IDS.PROVIDER) {
    return [
      { label: 'Dashboard', page: 'provider-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Services', page: 'provider-services', icon: <Briefcase className="size-4" /> },
      { label: 'Bookings', page: 'provider-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Earnings', page: 'provider-earnings', icon: <DollarSign className="size-4" /> },
      { label: 'Reviews', page: 'provider-reviews', icon: <Star className="size-4" /> },
      { label: 'Profile', page: 'provider-profile', icon: <User className="size-4" /> },
      { label: 'KYC', page: 'provider-kyc', icon: <Shield className="size-4" /> },
      { label: 'Wallet', page: 'provider-wallet', icon: <Wallet className="size-4" /> },
    ];
  }

  // VENDOR (roleId=5)
  if (roleId === ROLE_IDS.VENDOR) {
    return [
      { label: 'Dashboard', page: 'vendor-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Bookings', page: 'vendor-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Services', page: 'vendor-services', icon: <Briefcase className="size-4" /> },
      { label: 'Profile', page: 'vendor-profile', icon: <User className="size-4" /> },
      { label: 'KYC', page: 'vendor-kyc', icon: <Shield className="size-4" /> },
      { label: 'Wallet', page: 'vendor-wallet', icon: <Wallet className="size-4" /> },
    ];
  }

  // FRANCHISE (roleId=6)
  if (roleId === ROLE_IDS.FRANCHISE) {
    return [
      { label: 'Dashboard', page: 'franchise-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Vendors', page: 'franchise-vendors', icon: <Users className="size-4" /> },
      { label: 'Analytics', page: 'franchise-analytics', icon: <BarChart3 className="size-4" /> },
    ];
  }

  // AREA_MANAGER (roleId=8)
  if (roleId === ROLE_IDS.AREA_MANAGER) {
    return [
      { label: 'Dashboard', page: 'area-manager-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Commissions', page: 'area-manager-dashboard', icon: <DollarSign className="size-4" /> },
      { label: 'Referrals', page: 'area-manager-dashboard', icon: <Gift className="size-4" /> },
    ];
  }

  // SUB_ADMIN (roleId=7)
  if (roleId === ROLE_IDS.SUB_ADMIN) {
    return [
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Users', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Services', page: 'admin-services', icon: <Briefcase className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Categories', page: 'admin-categories', icon: <Grid3X3 className="size-4" /> },
    ];
  }

  // ADMIN (roleId=3)
  if (roleId === ROLE_IDS.ADMIN) {
    return [
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Users', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Services', page: 'admin-services', icon: <Briefcase className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Disputes', page: 'admin-disputes', icon: <FileWarning className="size-4" /> },
      { label: 'Categories', page: 'admin-categories', icon: <Grid3X3 className="size-4" /> },
      { label: 'FAQ', page: 'admin-faq', icon: <HelpCircle className="size-4" /> },
      { label: 'Revenue', page: 'admin-revenue', icon: <DollarSign className="size-4" /> },
      { label: 'Logs', page: 'admin-logs', icon: <ScrollText className="size-4" /> },
      { label: 'Analytics', page: 'admin-analytics', icon: <BarChart3 className="size-4" /> },
      { label: 'Franchises', page: 'admin-franchises', icon: <Building2 className="size-4" /> },
      { label: 'CRM', page: 'admin-crm', icon: <Contact className="size-4" /> },
      { label: 'Payouts', page: 'admin-payouts', icon: <Banknote className="size-4" /> },
      { label: 'Inventory', page: 'admin-inventory', icon: <Package className="size-4" /> },
      { label: 'Coupons', page: 'admin-coupons', icon: <Ticket className="size-4" /> },
      { label: 'AMC', page: 'admin-amc', icon: <ShieldCheck className="size-4" /> },
    ];
  }

  // MANAGER (roleId=9)
  if (roleId === ROLE_IDS.MANAGER) {
    return [
      { label: 'Dashboard', page: 'manager-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Providers', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Revenue', page: 'admin-revenue', icon: <DollarSign className="size-4" /> },
    ];
  }

  // LOCAL_ADMIN (roleId=10)
  if (roleId === ROLE_IDS.LOCAL_ADMIN) {
    return [
      { label: 'Dashboard', page: 'local-admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Providers', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Services', page: 'admin-services', icon: <Shield className="size-4" /> },
    ];
  }

  // Fallback for unknown roles
  return [
    { label: 'Home', page: 'home', icon: <Home className="size-4" /> },
    { label: 'Services', page: 'categories', icon: <Grid3X3 className="size-4" /> },
  ];
}

function getUserDropdownLinks(roleId: number | undefined): { label: string; page: Page; icon: React.ReactNode }[] {
  if (!roleId) return [];

  // CLIENT
  if (roleId === ROLE_IDS.CLIENT) {
    return [
      { label: 'Profile', page: 'client-profile', icon: <User className="size-4" /> },
      { label: 'Dashboard', page: 'client-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Bookings', page: 'client-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Wallet', page: 'client-wallet', icon: <Wallet className="size-4" /> },
      { label: 'Favorites', page: 'client-favorites', icon: <Heart className="size-4" /> },
      { label: 'Reviews', page: 'client-reviews', icon: <Star className="size-4" /> },
      { label: 'Coupons', page: 'client-coupons', icon: <Tag className="size-4" /> },
    ];
  }

  // TECHNICIAN
  if (roleId === ROLE_IDS.TECHNICIAN) {
    return [
      { label: 'Profile', page: 'technician-profile', icon: <User className="size-4" /> },
      { label: 'Dashboard', page: 'technician-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Jobs', page: 'technician-jobs', icon: <Briefcase className="size-4" /> },
      { label: 'Earnings', page: 'technician-earnings', icon: <DollarSign className="size-4" /> },
      { label: 'Availability', page: 'technician-availability', icon: <Clock className="size-4" /> },
    ];
  }

  // PROVIDER
  if (roleId === ROLE_IDS.PROVIDER) {
    return [
      { label: 'Profile', page: 'provider-profile', icon: <User className="size-4" /> },
      { label: 'Dashboard', page: 'provider-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Services', page: 'provider-services', icon: <Briefcase className="size-4" /> },
      { label: 'Earnings', page: 'provider-earnings', icon: <DollarSign className="size-4" /> },
      { label: 'Reviews', page: 'provider-reviews', icon: <Star className="size-4" /> },
      { label: 'KYC', page: 'provider-kyc', icon: <Shield className="size-4" /> },
      { label: 'Wallet', page: 'provider-wallet', icon: <Wallet className="size-4" /> },
    ];
  }

  // VENDOR
  if (roleId === ROLE_IDS.VENDOR) {
    return [
      { label: 'Profile', page: 'vendor-profile', icon: <User className="size-4" /> },
      { label: 'Dashboard', page: 'vendor-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Bookings', page: 'vendor-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Services', page: 'vendor-services', icon: <Briefcase className="size-4" /> },
      { label: 'KYC', page: 'vendor-kyc', icon: <Shield className="size-4" /> },
      { label: 'Wallet', page: 'vendor-wallet', icon: <Wallet className="size-4" /> },
    ];
  }

  // FRANCHISE
  if (roleId === ROLE_IDS.FRANCHISE) {
    return [
      { label: 'Dashboard', page: 'franchise-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Vendors', page: 'franchise-vendors', icon: <Users className="size-4" /> },
      { label: 'Analytics', page: 'franchise-analytics', icon: <BarChart3 className="size-4" /> },
    ];
  }

  // AREA_MANAGER
  if (roleId === ROLE_IDS.AREA_MANAGER) {
    return [
      { label: 'Dashboard', page: 'area-manager-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Commissions', page: 'area-manager-dashboard', icon: <DollarSign className="size-4" /> },
      { label: 'Referrals', page: 'area-manager-dashboard', icon: <Gift className="size-4" /> },
    ];
  }

  // SUB_ADMIN
  if (roleId === ROLE_IDS.SUB_ADMIN) {
    return [
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Users', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Services', page: 'admin-services', icon: <Briefcase className="size-4" /> },
    ];
  }

  // ADMIN
  if (roleId === ROLE_IDS.ADMIN) {
    return [
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Users', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Categories', page: 'admin-categories', icon: <Settings className="size-4" /> },
    ];
  }

  // MANAGER
  if (roleId === ROLE_IDS.MANAGER) {
    return [
      { label: 'Dashboard', page: 'manager-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Providers', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
    ];
  }

  // LOCAL_ADMIN
  if (roleId === ROLE_IDS.LOCAL_ADMIN) {
    return [
      { label: 'Dashboard', page: 'local-admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Providers', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
    ];
  }

  return [];
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  const initials = parts.map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return initials || '?';
}

function getRoleBadgeStyle(roleId: number | undefined): string {
  if (!roleId) return 'bg-gradient-to-r from-blue-800 to-blue-500 text-white';
  switch (roleId) {
    case ROLE_IDS.ADMIN:
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/30';
    case ROLE_IDS.SUB_ADMIN:
      return 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/30';
    case ROLE_IDS.PROVIDER:
      return 'bg-gradient-to-r from-blue-800 to-blue-500 text-white shadow-sm shadow-blue-500/30';
    case ROLE_IDS.TECHNICIAN:
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/30';
    case ROLE_IDS.VENDOR:
      return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/30';
    case ROLE_IDS.FRANCHISE:
      return 'bg-gradient-to-r from-slate-600 to-zinc-700 text-white shadow-sm shadow-slate-500/30';
    case ROLE_IDS.AREA_MANAGER:
      return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm shadow-teal-500/30';
    case ROLE_IDS.MANAGER:
      return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/30';
    case ROLE_IDS.LOCAL_ADMIN:
      return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30';
    case ROLE_IDS.CLIENT:
    default:
      return 'bg-gradient-to-r from-blue-800 to-sky-500 text-white shadow-sm shadow-blue-500/30';
  }
}

function getRoleLabel(roleId: number | undefined): string {
  if (!roleId) return 'User';
  switch (roleId) {
    case ROLE_IDS.ADMIN: return 'Admin';
    case ROLE_IDS.SUB_ADMIN: return 'Sub Admin';
    case ROLE_IDS.PROVIDER: return 'Provider';
    case ROLE_IDS.TECHNICIAN: return 'Technician';
    case ROLE_IDS.VENDOR: return 'Vendor';
    case ROLE_IDS.FRANCHISE: return 'Franchise';
    case ROLE_IDS.AREA_MANAGER: return 'Area Manager';
    case ROLE_IDS.MANAGER: return 'Manager';
    case ROLE_IDS.LOCAL_ADMIN: return 'Local Admin';
    case ROLE_IDS.CLIENT: return 'Client';
    default: return 'User';
  }
}

// ─── Active Nav Indicator (Premium Pill Bar) ─────────────────────────────────

function ActiveIndicator() {
  return (
    <>
      {/* Bottom gradient bar */}
      <motion.div
        layoutId="activeNavIndicator"
        className="absolute -bottom-[1px] left-3 right-3 h-[2.5px] rounded-full bg-gradient-to-r from-blue-900 via-blue-600 to-sky-400"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
      {/* Subtle glow */}
      <motion.div
        layoutId="activeNavGlow"
        className="absolute -bottom-1 left-4 right-4 h-3 rounded-full bg-gradient-to-r from-blue-400/30 via-blue-400/20 to-sky-400/30 blur-sm"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    </>
  );
}

// ─── Notification Badge with Animated Pulse ──────────────────────────────────

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="relative flex items-center justify-center">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-sky-400 opacity-60" />
      <span className="relative flex size-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 text-[9px] font-bold text-white shadow-md shadow-blue-500/40 ring-[1.5px] ring-white/30">
        {count > 9 ? '9+' : count}
      </span>
    </span>
  );
}

// ─── Verified Badge ──────────────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center" title="Verified account">
      <CheckCircle2 className="size-3.5 fill-blue-500 text-white" />
    </span>
  );
}

// ─── Emergency Booking Button (Deep Red) ─────────────────────────────────────

function EmergencyBookingButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="sm"
        onClick={onClick}
        className="group relative gap-1.5 overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 hover:from-red-800 hover:via-red-700 hover:to-red-600 hover:shadow-xl hover:shadow-red-500/40"
      >
        {/* Animated shimmer */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <Siren className="relative size-4 animate-pulse" />
        <span className="relative hidden sm:inline">Emergency Booking</span>
        <span className="relative sm:hidden">SOS</span>
      </Button>
    </motion.div>
  );
}

// ─── Main Header Component ───────────────────────────────────────────────────

export function Header() {
  const { user, logout, token } = useAuth();
  const { navigate, nav } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const roleId = user?.roleId;

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch unread notification count for authenticated users
  useEffect(() => {
    if (!user) {
      return;
    }

    setUnreadCount(0);

    const fetchUnread = async () => {
      try {
        const res = await fetch(apiUrl('/api/notifications'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const notifications = data.notifications || data || [];
          const count = Array.isArray(notifications)
            ? notifications.filter((n: { isRead?: boolean }) => !n.isRead).length
            : 0;
          setUnreadCount(count);
        }
      } catch {
        // Silently ignore
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Effective unread count: 0 when not logged in
  const effectiveUnreadCount = user ? unreadCount : 0;

  const links = getNavLinks(roleId, effectiveUnreadCount);
  const dropdownLinks = getUserDropdownLinks(roleId);

  const handleNavigate = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  const isActive = (page: Page) => nav.page === page;

  // Determine wallet page based on role
  const getWalletPage = (): Page | null => {
    if (roleId === ROLE_IDS.CLIENT) return 'client-wallet';
    if (roleId === ROLE_IDS.PROVIDER) return 'provider-wallet';
    if (roleId === ROLE_IDS.VENDOR) return 'vendor-wallet';
    if (roleId === ROLE_IDS.TECHNICIAN) return 'technician-dashboard';
    return null;
  };

  // Determine notification page based on role
  const getNotificationPage = (): Page => {
    if (roleId === ROLE_IDS.PROVIDER) return 'provider-reviews';
    if (roleId === ROLE_IDS.TECHNICIAN) return 'technician-dashboard';
    if (roleId === ROLE_IDS.VENDOR) return 'vendor-dashboard';
    if (roleId === ROLE_IDS.FRANCHISE) return 'franchise-dashboard';
    if (roleId === ROLE_IDS.ADMIN) return 'admin-dashboard';
    return 'client-notifications';
  };

  // Check if user should see notification bell (all roles except admin and sub-admin)
  const showNotifications = user && roleId !== ROLE_IDS.ADMIN && roleId !== ROLE_IDS.SUB_ADMIN;

  // Check if user should see emergency booking (only clients)
  const showEmergencyBooking = user && roleId === ROLE_IDS.CLIENT;

  // Check if user has wallet balance to show
  const showWalletIndicator = user && user.walletBalance !== undefined && user.walletBalance !== null && getWalletPage() !== null;

  // Determine how many nav items to show on desktop before truncating
  const maxDesktopNavItems = roleId === ROLE_IDS.ADMIN ? 8 : links.length;
  const desktopLinks = links.slice(0, maxDesktopNavItems);
  const overflowLinks = links.slice(maxDesktopNavItems);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 relative ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.04] border-b border-blue-100/50'
          : 'bg-white/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      {/* Animated gradient line at bottom on scroll */}
      {scrolled && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-600/60 to-transparent"
        />
      )}

      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <motion.button
          onClick={() => handleNavigate('home')}
          className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          aria-label="Go to home page"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-sky-400 shadow-lg shadow-blue-500/30 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-sky-400/40">
            <Wrench className="size-[18px] text-white drop-shadow-sm" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-400/20 to-sky-400/20 blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 bg-clip-text text-transparent">BookYour</span>
            <span className="text-foreground">Service</span>
          </span>
        </motion.button>

        {/* ── Desktop Navigation ────────────────────────────────────────── */}
        <nav
          ref={navRef}
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {desktopLinks.map((link, idx) => {
            const active = isActive(link.page);
            return (
              <motion.button
                key={`${link.page}-${idx}`}
                onClick={() => handleNavigate(link.page)}
                className={`relative inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-blue-50/50 text-blue-600'
                    : 'text-muted-foreground hover:bg-blue-50/30 hover:text-foreground'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {active && <ActiveIndicator />}
                <span className={`transition-colors duration-200 ${active ? 'text-blue-600' : ''}`}>
                  {link.icon}
                </span>
                {link.label}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-1">
                    <NotificationBadge count={link.badge > 99 ? 99 : link.badge} />
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* Overflow items for roles with many nav items (e.g., Admin) */}
          {overflowLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="relative inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-muted-foreground transition-all hover:bg-blue-50/30 hover:text-foreground"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Grid3X3 className="size-4" />
                  More
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-xl shadow-black/10 border-blue-100/50">
                {overflowLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.page}
                    onClick={() => handleNavigate(link.page)}
                    className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:bg-blue-50 focus:text-blue-700"
                  >
                    <span className="mr-2.5 text-muted-foreground">{link.icon}</span>
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* ── Right Section ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">
          {/* Emergency Booking (CLIENT only) */}
          {showEmergencyBooking && (
            <EmergencyBookingButton onClick={() => handleNavigate('emergency-booking')} />
          )}

          {/* Wallet Balance Indicator (Refined with gradient border) */}
          {showWalletIndicator && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <button
                onClick={() => handleNavigate(getWalletPage()!)}
                className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-sky-50/70 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all duration-300 hover:from-blue-100 hover:to-sky-100 hover:shadow-md hover:shadow-blue-500/10 lg:inline-flex ring-1 ring-inset ring-blue-200/60 hover:ring-blue-300/80"
              >
                <Wallet className="size-3.5 text-blue-600" />
                <span>₹{user!.walletBalance!.toLocaleString('en-IN')}</span>
              </button>
            </motion.div>
          )}

          {user ? (
            <>
              {/* Notification Bell (desktop) */}
              {showNotifications && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hidden h-9 w-9 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 lg:inline-flex"
                    onClick={() => handleNavigate(getNotificationPage())}
                    aria-label={`Notifications${effectiveUnreadCount > 0 ? `, ${effectiveUnreadCount} unread` : ''}`}
                  >
                    <Bell className="size-[18px]" />
                    {effectiveUnreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5">
                        <NotificationBadge count={effectiveUnreadCount > 99 ? 99 : effectiveUnreadCount} />
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="hidden items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:bg-blue-50/50 lg:inline-flex"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="User menu"
                  >
                    {/* Avatar with gradient ring */}
                    <div className="rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-sky-400 p-[2.5px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/30">
                      <Avatar className="size-8 ring-2 ring-white ring-offset-0">
                        {user.profileImageUrl && (
                          <AvatarImage src={user.profileImageUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 text-xs font-bold text-white" role="img" aria-label={user.name}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="flex max-w-[120px] items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                      {user.name}
                      {user.verifiedBadge && <VerifiedBadge />}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 overflow-hidden rounded-2xl p-1.5 shadow-xl shadow-black/10 border-blue-100/50"
                  align="end"
                >
                  <DropdownMenuLabel className="font-normal px-2 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-sky-400 p-[2.5px]">
                        <Avatar className="size-11 ring-2 ring-white">
                          {user.profileImageUrl && (
                            <AvatarImage src={user.profileImageUrl} alt={user.name} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 text-sm font-bold text-white" role="img" aria-label={user.name}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-semibold leading-none">
                          {user.name}
                          {user.verifiedBadge && <VerifiedBadge />}
                        </p>
                        <p className="mt-1.5 truncate text-xs text-muted-foreground">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            className={`border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${getRoleBadgeStyle(roleId)}`}
                          >
                            {getRoleLabel(roleId)}
                          </Badge>
                          {user.walletBalance !== undefined && user.walletBalance !== null && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                              <Wallet className="size-3" />
                              ₹{user.walletBalance.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-blue-100/50" />
                  <DropdownMenuGroup>
                    {dropdownLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.page}
                        onClick={() => handleNavigate(link.page)}
                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:bg-blue-50 focus:text-blue-700"
                      >
                        <span className="mr-2.5 text-muted-foreground">{link.icon}</span>
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-1 bg-blue-100/50" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all duration-200 focus:bg-red-50 focus:text-destructive"
                  >
                    <LogOut className="mr-2.5 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2.5 lg:flex">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('login')}
                  className="gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <LogIn className="size-4" />
                  Login
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="sm"
                  onClick={() => handleNavigate('register')}
                  className="gap-1.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-950 hover:via-blue-800 hover:to-sky-600 hover:shadow-xl hover:shadow-blue-500/35"
                >
                  <UserPlus className="size-4" />
                  Sign up
                </Button>
              </motion.div>
            </div>
          )}

          {/* ── Mobile Menu Trigger ─────────────────────────────────────── */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[340px] overflow-y-auto border-l border-blue-200/30 p-0 shadow-2xl shadow-blue-900/10 bg-gradient-to-b from-blue-50/60 via-white/80 to-sky-50/60 backdrop-blur-xl"
            >
              {/* ── Mobile Header ────────────────────────────────────────── */}
              <SheetHeader className="border-b border-blue-200/50 px-6 py-5 bg-gradient-to-r from-blue-50/60 via-white/40 to-sky-50/40">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-sky-400 shadow-lg shadow-blue-500/30">
                    <Wrench className="size-[18px] text-white" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-white/5 to-transparent" />
                  </div>
                  <span className="text-2xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 bg-clip-text text-transparent">BookYour</span>
                    <span className="text-foreground">Service</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* ── Mobile User Info ─────────────────────────────────────── */}
              {user && (
                <div className="border-b border-blue-200/50 px-6 py-5 bg-gradient-to-r from-blue-50/30 via-white/20 to-sky-50/20">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar with premium gradient ring */}
                    <div className="rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-sky-400 p-[2.5px] shadow-md shadow-blue-400/20">
                      <Avatar className="size-12 ring-2 ring-white">
                        {user.profileImageUrl && (
                          <AvatarImage src={user.profileImageUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 text-sm font-bold text-white" role="img" aria-label={user.name}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-bold text-foreground">
                        {user.name}
                        {user.verifiedBadge && <VerifiedBadge />}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          className={`border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${getRoleBadgeStyle(roleId)}`}
                        >
                          {getRoleLabel(roleId)}
                        </Badge>
                        {user.walletBalance !== undefined && user.walletBalance !== null && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                            <Wallet className="size-3" />
                            ₹{user.walletBalance.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Booking in mobile for CLIENT */}
                  {showEmergencyBooking && (
                    <div className="mt-4">
                      <SheetClose asChild>
                        <Button
                          className="group relative w-full gap-2 overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:from-red-800 hover:via-red-700 hover:to-red-600"
                          onClick={() => handleNavigate('emergency-booking')}
                        >
                          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          <Siren className="relative size-4 animate-pulse" />
                          <span className="relative">Emergency Booking</span>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              )}

              {/* ── Mobile Nav Links ─────────────────────────────────────── */}
              <nav className="flex flex-col gap-0.5 px-3 py-4" aria-label="Mobile navigation">
                {links.map((link, idx) => {
                  const active = isActive(link.page);
                  return (
                    <SheetClose asChild key={`${link.page}-${idx}`}>
                      <motion.button
                        onClick={() => handleNavigate(link.page)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all duration-300 ${
                          active
                            ? 'bg-gradient-to-r from-blue-50 via-sky-50/60 to-blue-50/40 text-blue-700 shadow-sm shadow-blue-500/10 ring-1 ring-blue-200/50'
                            : 'text-muted-foreground hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/30 hover:text-foreground'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.3 }}
                      >
                        <span className={`flex size-8 items-center justify-center rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-blue-100/80 text-blue-600'
                            : 'text-muted-foreground'
                        }`}>
                          {link.icon}
                        </span>
                        {link.label}
                        {link.badge !== undefined && link.badge > 0 && (
                          <span className="ml-auto">
                            <NotificationBadge count={link.badge > 99 ? 99 : link.badge} />
                          </span>
                        )}
                      </motion.button>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* ── Mobile Footer ────────────────────────────────────────── */}
              <div className="border-t border-blue-100/50 px-6 py-4">
                {!user && (
                  <div className="flex flex-col gap-2.5">
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 text-white shadow-lg shadow-blue-500/20 hover:from-blue-950 hover:via-blue-800 hover:to-sky-600"
                      onClick={() => { handleNavigate('register'); setMobileOpen(false); }}
                    >
                      <UserPlus className="size-4" />
                      Sign up
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => { handleNavigate('login'); setMobileOpen(false); }}
                    >
                      <LogIn className="size-4" />
                      Login
                    </Button>
                  </div>
                )}
                {user && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-red-100 hover:bg-red-50 hover:text-destructive"
                    onClick={() => { logout(); setMobileOpen(false); }}
                  >
                    <LogOut className="size-4" />
                    Log out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

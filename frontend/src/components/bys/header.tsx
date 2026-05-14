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
  Droplets,
  Zap,
  Wind,
  Sparkles,
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
      { label: 'Plumbing', page: 'categories', icon: <Droplets className="size-4" /> },
      { label: 'Electrical', page: 'categories', icon: <Zap className="size-4" /> },
      { label: 'AC & HVAC', page: 'categories', icon: <Wind className="size-4" /> },
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

  // ADMIN
  if (roleId === ROLE_IDS.ADMIN) {
    return [
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Users', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Settings', page: 'admin-dashboard', icon: <Settings className="size-4" /> },
    ];
  }

  return [];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeStyle(roleId: number | undefined): string {
  if (!roleId) return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
  switch (roleId) {
    case ROLE_IDS.ADMIN:
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white';
    case ROLE_IDS.PROVIDER:
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    case ROLE_IDS.TECHNICIAN:
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
    case ROLE_IDS.VENDOR:
      return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white';
    case ROLE_IDS.FRANCHISE:
      return 'bg-gradient-to-r from-slate-600 to-zinc-700 text-white';
    case ROLE_IDS.CLIENT:
    default:
      return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
  }
}

function getRoleLabel(roleId: number | undefined): string {
  if (!roleId) return 'User';
  switch (roleId) {
    case ROLE_IDS.ADMIN: return 'Admin';
    case ROLE_IDS.PROVIDER: return 'Provider';
    case ROLE_IDS.TECHNICIAN: return 'Technician';
    case ROLE_IDS.VENDOR: return 'Vendor';
    case ROLE_IDS.FRANCHISE: return 'Franchise';
    case ROLE_IDS.CLIENT: return 'Client';
    default: return 'User';
  }
}

// ─── Active Nav Indicator ────────────────────────────────────────────────────

function ActiveIndicator() {
  return (
    <motion.div
      layoutId="activeNavIndicator"
      className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    />
  );
}

// ─── Notification Badge with Pulse ───────────────────────────────────────────

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="relative flex items-center justify-center">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 opacity-50" />
      <span className="relative flex size-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-[9px] font-bold text-white shadow-sm">
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

// ─── Wallet Balance Indicator ────────────────────────────────────────────────

function WalletIndicator({ balance }: { balance: number }) {
  return (
    <motion.button
      onClick={() => {
        // Will be overridden by parent context; this is a visual indicator
      }}
      className="hidden items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:from-emerald-100 hover:to-teal-100 hover:shadow-sm lg:inline-flex"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Wallet className="size-3.5" />
      <span>₹{balance.toLocaleString('en-IN')}</span>
    </motion.button>
  );
}

// ─── Emergency Booking Button ────────────────────────────────────────────────

function EmergencyBookingButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Button
        size="sm"
        onClick={onClick}
        className="gap-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-md shadow-red-500/25 hover:from-red-700 hover:via-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-red-500/35"
      >
        <Siren className="size-4 animate-pulse" />
        <span className="hidden sm:inline">Emergency Booking</span>
        <span className="sm:hidden">SOS</span>
      </Button>
    </motion.div>
  );
}

// ─── Main Header Component ───────────────────────────────────────────────────

export function Header() {
  const { user, logout } = useAuth();
  const { navigate, nav } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const roleId = user?.roleId;

  // Track scroll for shadow effect
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

    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('bys_token');
        const res = await fetch('/api/notifications', {
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

  // Check if user should see notification bell (all roles except admin)
  const showNotifications = user && roleId !== ROLE_IDS.ADMIN;

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 relative after:absolute after:bottom-0 after:inset-x-0 after:h-px after:transition-colors after:duration-500 ${
        scrolled
          ? 'glass shadow-lg shadow-black/[0.06] after:bg-gradient-to-r after:from-transparent after:via-emerald-400/60 after:to-transparent'
          : 'glass after:bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.button
          onClick={() => handleNavigate('home')}
          className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          aria-label="Go to home page"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 via-teal-500 to-cyan-400 shadow-md shadow-emerald-500/25 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/30">
            <Wrench className="size-4 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-white/5 to-transparent" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-gradient">BookYour</span>
            <span className="text-foreground">Service</span>
          </span>
        </motion.button>

        {/* Desktop Navigation */}
        <nav
          ref={navRef}
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Main navigation"
        >
          {desktopLinks.map((link, idx) => (
            <motion.button
              key={`${link.page}-${idx}`}
              onClick={() => handleNavigate(link.page)}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                isActive(link.page)
                  ? 'text-emerald-700'
                  : 'text-muted-foreground hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-cyan-50/40 hover:text-foreground'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isActive(link.page) && <ActiveIndicator />}
              <span className={`transition-colors duration-200 ${isActive(link.page) ? 'text-emerald-600' : ''}`}>
                {link.icon}
              </span>
              {link.label}
              {link.badge !== undefined && link.badge > 0 && (
                <span className="ml-1">
                  <NotificationBadge count={link.badge > 99 ? 99 : link.badge} />
                </span>
              )}
            </motion.button>
          ))}

          {/* Overflow items for roles with many nav items (e.g., Admin) */}
          {overflowLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="relative inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-cyan-50/40 hover:text-foreground"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Grid3X3 className="size-4" />
                  More
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
                {overflowLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.page}
                    onClick={() => handleNavigate(link.page)}
                    className="cursor-pointer rounded-lg px-2 py-2 transition-colors focus:bg-emerald-50 focus:text-emerald-700"
                  >
                    <span className="mr-2 text-muted-foreground">{link.icon}</span>
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Emergency Booking (CLIENT only) */}
          {showEmergencyBooking && (
            <EmergencyBookingButton onClick={() => handleNavigate('emergency-booking')} />
          )}

          {/* Wallet Balance Indicator */}
          {showWalletIndicator && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate(getWalletPage()!)}
                className="hidden items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:from-emerald-100 hover:to-teal-100 hover:shadow-sm lg:inline-flex"
              >
                <Wallet className="size-3.5" />
                <span>₹{user.walletBalance!.toLocaleString('en-IN')}</span>
              </Button>
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
                    className="relative hidden lg:inline-flex hover:bg-emerald-50"
                    onClick={() => handleNavigate(getNotificationPage())}
                    aria-label={`Notifications${effectiveUnreadCount > 0 ? `, ${effectiveUnreadCount} unread` : ''}`}
                  >
                    <Bell className="size-[18px] text-muted-foreground" />
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
                    className="hidden items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-200 hover:bg-emerald-50/60 lg:inline-flex"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="User menu"
                  >
                    <div className="rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[2px] transition-all duration-300 hover:shadow-md hover:shadow-emerald-400/30">
                    <Avatar className="size-8 ring-0 ring-offset-0 transition-all duration-200">
                      {user.profileImageUrl && (
                        <AvatarImage src={user.profileImageUrl} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-xs font-bold text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    </div>
                    <span className="flex max-w-[120px] items-center gap-1 truncate text-sm font-medium text-foreground">
                      {user.name}
                      {user.verifiedBadge && <VerifiedBadge />}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 overflow-hidden rounded-xl p-1 shadow-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal px-2 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[2px]">
                      <Avatar className="size-10 ring-0 ring-offset-0">
                        {user.profileImageUrl && (
                          <AvatarImage src={user.profileImageUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-sm font-bold text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 text-sm font-semibold leading-none">
                          {user.name}
                          {user.verifiedBadge && <VerifiedBadge />}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge
                            className={`border-0 px-2 py-0.5 text-[10px] font-semibold ${getRoleBadgeStyle(roleId)}`}
                          >
                            {getRoleLabel(roleId)}
                          </Badge>
                          {user.walletBalance !== undefined && user.walletBalance !== null && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                              <Wallet className="size-3" />
                              ₹{user.walletBalance.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuGroup>
                    {dropdownLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.page}
                        onClick={() => handleNavigate(link.page)}
                        className="cursor-pointer rounded-lg px-2 py-2 transition-colors focus:bg-emerald-50 focus:text-emerald-700"
                      >
                        <span className="mr-2 text-muted-foreground">{link.icon}</span>
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer rounded-lg px-2 py-2 text-destructive focus:bg-red-50 focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('login')}
                  className="gap-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <LogIn className="size-4" />
                  Login
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="sm"
                  onClick={() => handleNavigate('register')}
                  className="gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  <UserPlus className="size-4" />
                  Sign up
                </Button>
              </motion.div>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-emerald-50"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="glass-emerald w-[320px] overflow-y-auto border-l border-emerald-200/30 p-0 shadow-2xl shadow-emerald-900/10 bg-gradient-to-b from-emerald-50/80 via-white/90 to-teal-50/80"
            >
              {/* Mobile Header */}
              <SheetHeader className="border-b border-emerald-200/60 px-5 py-5 bg-gradient-to-r from-emerald-50/50 to-cyan-50/30">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 via-teal-500 to-cyan-400 shadow-md shadow-emerald-500/25">
                    <Wrench className="size-4 text-white" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight">
                    <span className="text-gradient">BookYour</span>
                    <span className="text-foreground">Service</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile User Info */}
              {user && (
                <div className="border-b border-emerald-200/60 px-5 py-4 bg-gradient-to-r from-emerald-50/30 to-teal-50/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[2px]">
                    <Avatar className="size-11 ring-0 ring-offset-0">
                      {user.profileImageUrl && (
                        <AvatarImage src={user.profileImageUrl} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-sm font-bold text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                        {user.name}
                        {user.verifiedBadge && <VerifiedBadge />}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge
                          className={`border-0 px-2 py-0.5 text-[10px] font-semibold ${getRoleBadgeStyle(roleId)}`}
                        >
                          {getRoleLabel(roleId)}
                        </Badge>
                        {user.walletBalance !== undefined && user.walletBalance !== null && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                            <Wallet className="size-3" />
                            ₹{user.walletBalance.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Booking in mobile for CLIENT */}
                  {showEmergencyBooking && (
                    <div className="mt-3">
                      <SheetClose asChild>
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-md shadow-red-500/25 hover:from-red-700 hover:via-orange-600 hover:to-amber-600"
                          onClick={() => handleNavigate('emergency-booking')}
                        >
                          <Siren className="size-4 animate-pulse" />
                          Emergency Booking
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-0.5 px-3 py-3" aria-label="Mobile navigation">
                {links.map((link, idx) => (
                  <SheetClose asChild key={`${link.page}-${idx}`}>
                    <motion.button
                      onClick={() => handleNavigate(link.page)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive(link.page)
                          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 text-emerald-700 shadow-sm shadow-emerald-500/10'
                          : 'text-muted-foreground hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-cyan-50/30 hover:text-foreground'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                    >
                      <span className={`transition-colors duration-200 ${isActive(link.page) ? 'text-emerald-600' : ''}`}>
                        {link.icon}
                      </span>
                      {link.label}
                      {link.badge !== undefined && link.badge > 0 && (
                        <span className="ml-auto">
                          <NotificationBadge count={link.badge > 99 ? 99 : link.badge} />
                        </span>
                      )}
                      {isActive(link.page) && (
                        <ChevronRight className="ml-auto size-4 text-emerald-500" />
                      )}
                    </motion.button>
                  </SheetClose>
                ))}
              </nav>

              {/* Mobile Auth Section */}
              {user ? (
                <>
                  <div className="border-t border-emerald-200/60 px-3 py-3">
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Account
                    </p>
                    {dropdownLinks.map((link, idx) => (
                      <SheetClose asChild key={link.page}>
                        <motion.button
                          onClick={() => handleNavigate(link.page)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-emerald-50/50 hover:text-foreground"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 + 0.2, duration: 0.3 }}
                        >
                          {link.icon}
                          {link.label}
                        </motion.button>
                      </SheetClose>
                    ))}
                  </div>
                  <div className="border-t border-emerald-200/60 px-3 py-3">
                    <SheetClose asChild>
                      <motion.button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive transition-all duration-200 hover:bg-red-50"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        <LogOut className="size-4" />
                        Log out
                      </motion.button>
                    </SheetClose>
                  </div>
                </>
              ) : (
                <div className="border-t border-emerald-200/60 px-5 py-5 bg-gradient-to-b from-emerald-50/30 to-transparent">
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-600"
                          onClick={() => handleNavigate('login')}
                        >
                          <LogIn className="size-4" />
                          Login
                        </Button>
                      </motion.div>
                    </SheetClose>
                    <SheetClose asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full border-emerald-300/80 text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:text-emerald-800"
                          onClick={() => handleNavigate('register')}
                        >
                          <UserPlus className="mr-2 size-4" />
                          Sign up
                        </Button>
                      </motion.div>
                    </SheetClose>

                    {/* Role options preview for unauthenticated mobile users */}
                    <div className="mt-2 flex flex-col gap-1.5">
                      <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Join as
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Client', roleId: ROLE_IDS.CLIENT, icon: <User className="size-3.5" /> },
                          { label: 'Technician', roleId: ROLE_IDS.TECHNICIAN, icon: <Wrench className="size-3.5" /> },
                          { label: 'Provider', roleId: ROLE_IDS.PROVIDER, icon: <Briefcase className="size-3.5" /> },
                          { label: 'Vendor', roleId: ROLE_IDS.VENDOR, icon: <Package className="size-3.5" /> },
                          { label: 'Franchise', roleId: ROLE_IDS.FRANCHISE, icon: <Building2 className="size-3.5" /> },
                        ].map((roleOption) => (
                          <SheetClose key={roleOption.roleId}>
                            <motion.button
                              onClick={() => handleNavigate('register')}
                              className="flex w-full items-center gap-1.5 rounded-lg border border-emerald-200/50 bg-white/60 px-2.5 py-2 text-xs font-medium text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-50/80"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {roleOption.icon}
                              {roleOption.label}
                            </motion.button>
                          </SheetClose>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

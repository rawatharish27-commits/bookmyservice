import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
  ClipboardList,
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
} from 'lucide-react';

interface NavLink {
  label: string;
  page: Page;
  icon: React.ReactNode;
  badge?: number;
}

function getNavLinks(role: string | null, unreadCount: number): NavLink[] {
  if (!role) {
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

  if (role === 'admin') {
    return [
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Users', page: 'admin-users', icon: <Users className="size-4" /> },
      { label: 'Services', page: 'admin-services', icon: <Briefcase className="size-4" /> },
      { label: 'Bookings', page: 'admin-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Disputes', page: 'admin-disputes', icon: <FileWarning className="size-4" /> },
      { label: 'Revenue', page: 'admin-revenue', icon: <DollarSign className="size-4" /> },
    ];
  }

  if (role === 'provider') {
    return [
      { label: 'Home', page: 'home', icon: <Home className="size-4" /> },
      { label: 'My Services', page: 'provider-services', icon: <Briefcase className="size-4" /> },
      { label: 'Bookings', page: 'provider-bookings', icon: <CalendarCheck className="size-4" /> },
      { label: 'Dashboard', page: 'provider-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Notifications', page: 'provider-reviews', icon: <Bell className="size-4" />, badge: unreadCount },
    ];
  }

  // Client
  return [
    { label: 'Home', page: 'home', icon: <Home className="size-4" /> },
    { label: 'Services', page: 'categories', icon: <Grid3X3 className="size-4" /> },
    { label: 'My Bookings', page: 'client-bookings', icon: <CalendarCheck className="size-4" /> },
    { label: 'Dashboard', page: 'client-dashboard', icon: <LayoutDashboard className="size-4" /> },
    { label: 'Notifications', page: 'client-notifications', icon: <Bell className="size-4" />, badge: unreadCount },
  ];
}

function getUserDropdownLinks(role: string | null): { label: string; page: Page; icon: React.ReactNode }[] {
  if (role === 'admin') {
    return [
      { label: 'Profile', page: 'admin-dashboard', icon: <User className="size-4" /> },
      { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'Settings', page: 'admin-dashboard', icon: <Settings className="size-4" /> },
    ];
  }

  if (role === 'provider') {
    return [
      { label: 'Profile', page: 'provider-profile', icon: <User className="size-4" /> },
      { label: 'Dashboard', page: 'provider-dashboard', icon: <LayoutDashboard className="size-4" /> },
      { label: 'My Services', page: 'provider-services', icon: <Briefcase className="size-4" /> },
      { label: 'Earnings', page: 'provider-earnings', icon: <DollarSign className="size-4" /> },
      { label: 'Reviews', page: 'provider-reviews', icon: <Star className="size-4" /> },
      { label: 'KYC', page: 'provider-kyc', icon: <Shield className="size-4" /> },
    ];
  }

  // Client
  return [
    { label: 'Profile', page: 'client-profile', icon: <User className="size-4" /> },
    { label: 'Dashboard', page: 'client-dashboard', icon: <LayoutDashboard className="size-4" /> },
    { label: 'My Bookings', page: 'client-bookings', icon: <CalendarCheck className="size-4" /> },
    { label: 'Favorites', page: 'client-favorites', icon: <Heart className="size-4" /> },
    { label: 'Reviews', page: 'client-reviews', icon: <Star className="size-4" /> },
  ];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeStyle(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white';
    case 'provider':
    case 'PROVIDER':
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    default:
      return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
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

// ─── Main Header Component ───────────────────────────────────────────────────

export function Header() {
  const { user, logout } = useAuth();
  const { navigate, nav } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

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

  const links = getNavLinks(user?.role || null, effectiveUnreadCount);
  const dropdownLinks = getUserDropdownLinks(user?.role || null);

  const handleNavigate = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  const isActive = (page: Page) => nav.page === page;

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
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
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
          {links.map((link, idx) => (
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
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Bell (desktop) */}
              {user.role !== 'admin' && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hidden lg:inline-flex hover:bg-emerald-50"
                    onClick={() =>
                      handleNavigate(
                        user.role === 'provider' ? 'provider-reviews' : 'client-notifications'
                      )
                    }
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
                    <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                      {user.name}
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
                        <p className="text-sm font-semibold leading-none">{user.name}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                        <Badge
                          className={`mt-1.5 border-0 px-2 py-0.5 text-[10px] font-semibold capitalize ${getRoleBadgeStyle(user.role)}`}
                        >
                          {user.role === 'PROVIDER' ? 'Provider' : user.role}
                        </Badge>
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
                  Client Login
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
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <Badge
                        className={`mt-1 border-0 px-2 py-0.5 text-[10px] font-semibold capitalize ${getRoleBadgeStyle(user.role)}`}
                      >
                        {user.role === 'PROVIDER' ? 'Provider' : user.role}
                      </Badge>
                    </div>
                  </div>
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
                          Client Login
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

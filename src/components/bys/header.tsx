'use client';

import React, { useState, useEffect } from 'react';
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
  Info,
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
      { label: 'Categories', page: 'categories', icon: <Grid3X3 className="size-4" /> },
      { label: 'How It Works', page: 'how-it-works', icon: <Info className="size-4" /> },
      { label: 'FAQ', page: 'faq', icon: <HelpCircle className="size-4" /> },
      { label: 'About', page: 'about', icon: <Info className="size-4" /> },
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
    { label: 'Categories', page: 'categories', icon: <Grid3X3 className="size-4" /> },
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

export function Header() {
  const { user, logout } = useAuth();
  const { navigate, nav } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Go to home page"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Wrench className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Book<span className="text-emerald-600">Your</span>Service
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavigate(link.page)}
              className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(link.page)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {link.icon}
              {link.label}
              {link.badge !== undefined && link.badge > 0 && (
                <Badge className="ml-1 size-5 min-w-5 rounded-full bg-emerald-600 px-1.5 text-[10px] font-semibold text-white hover:bg-emerald-600">
                  {link.badge > 99 ? '99+' : link.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Bell (desktop) */}
              {user.role !== 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden lg:inline-flex"
                  onClick={() =>
                    handleNavigate(
                      user.role === 'provider' ? 'provider-reviews' : 'client-notifications'
                    )
                  }
                  aria-label={`Notifications${effectiveUnreadCount > 0 ? `, ${effectiveUnreadCount} unread` : ''}`}
                >
                  <Bell className="size-4" />
                  {effectiveUnreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {effectiveUnreadCount > 9 ? '9+' : effectiveUnreadCount}
                    </span>
                  )}
                </Button>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden gap-2 lg:inline-flex"
                    aria-label="User menu"
                  >
                    <Avatar className="size-7">
                      {user.profileImageUrl && (
                        <AvatarImage src={user.profileImageUrl} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-emerald-100 text-xs font-medium text-emerald-700">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 w-fit text-[10px] capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {dropdownLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.page}
                        onClick={() => handleNavigate(link.page)}
                        className="cursor-pointer"
                      >
                        {link.icon}
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('login')}
                className="text-sm"
              >
                Log in
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigate('register')}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Sign up
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Wrench className="size-4" />
                  </div>
                  <span className="text-lg font-bold">
                    Book<span className="text-emerald-600">Your</span>Service
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile User Info */}
              {user && (
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      {user.profileImageUrl && (
                        <AvatarImage src={user.profileImageUrl} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-emerald-100 text-sm font-medium text-emerald-700">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Nav Links */}
              <nav className="flex flex-col px-2 py-2" aria-label="Mobile navigation">
                {links.map((link) => (
                  <SheetClose asChild key={link.page}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive(link.page)
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {link.icon}
                      {link.label}
                      {link.badge !== undefined && link.badge > 0 && (
                        <Badge className="ml-auto bg-emerald-600 px-1.5 text-[10px] font-semibold text-white hover:bg-emerald-600">
                          {link.badge > 99 ? '99+' : link.badge}
                        </Badge>
                      )}
                      {isActive(link.page) && (
                        <ChevronRight className="ml-auto size-4 text-emerald-600" />
                      )}
                    </button>
                  </SheetClose>
                ))}
              </nav>

              {/* Mobile Auth Section */}
              {user ? (
                <>
                  <div className="border-t px-2 py-2">
                    <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Account
                    </p>
                    {dropdownLinks.map((link) => (
                      <SheetClose asChild key={link.page}>
                        <button
                          onClick={() => handleNavigate(link.page)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {link.icon}
                          {link.label}
                        </button>
                      </SheetClose>
                    ))}
                  </div>
                  <div className="border-t px-2 py-2">
                    <SheetClose asChild>
                      <button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </SheetClose>
                  </div>
                </>
              ) : (
                <div className="border-t px-4 py-4">
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleNavigate('login')}
                      >
                        Log in
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => handleNavigate('register')}
                      >
                        Sign up
                      </Button>
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

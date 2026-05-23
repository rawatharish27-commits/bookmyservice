'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  CalendarCheck,
  CheckCircle2,
  Heart,
  DollarSign,
  Briefcase,
  CalendarDays,
  Star,
  ArrowRight,
  Droplets,
  Zap,
  Wind,
  User,
  Sparkles,
  Wallet,
  Ticket,
  Shield,
  ShieldCheck,
  Clock,
  TrendingUp,
  Activity,
  MapPin,
  Award,
  Eye,
  CreditCard,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Users,
  IndianRupee,
  Timer,
  Flame,
  ChevronRight,
  CircleDot,
  Receipt,
  MessageSquare,
  Banknote,
} from 'lucide-react';

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/* ================================================================
   TYPES
   ================================================================ */
interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  basePrice: number;
  finalPrice: number;
  createdAt: string;
  service?: { id: string; title: string; category?: { name: string } };
  provider?: { id: string; name: string };
}

interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  service?: { title: string };
  reviewed?: { name: string };
}

interface WalletData {
  balance: number;
  cashbackBalance: number;
  promoBalance: number;
  totalCredited: number;
  totalDebited: number;
}

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  category: string;
  amount: number;
  description: string;
  createdAt: string;
  status?: string;
}

interface AMCSubscription {
  id: string;
  plan?: { name: string };
  status: string;
  startDate: string;
  endDate: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  validUntil: string;
  isActive: boolean;
}

/* ================================================================
   HELPER COMPONENTS
   ================================================================ */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-cyan-400' },
    ACCEPTED: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-400' },
    IN_PROGRESS: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-sky-400' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
    REFUNDED: { className: 'bg-gray-50 text-gray-700 border-gray-200', dotColor: 'bg-gray-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge className="gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
      <ShieldCheck className="size-3.5" />
      Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 font-semibold text-xs">
      <Shield className="size-3.5" />
      Unverified
    </Badge>
  );
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function daysBetween(a: string | Date, b: Date = new Date()) {
  const d1 = new Date(a);
  return Math.floor((b.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

/* ================================================================
   CHART CONFIG
   ================================================================ */
const pieChartConfig: ChartConfig = {
  COMPLETED: { label: 'Completed', color: '#10b981' },
  CANCELLED: { label: 'Cancelled', color: '#f43f5e' },
  PENDING: { label: 'Pending', color: '#06b6d4' },
  ACCEPTED: { label: 'Accepted', color: '#0ea5e9' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6' },
  REFUNDED: { label: 'Refunded', color: '#6b7280' },
};

const PIE_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  CANCELLED: '#f43f5e',
  PENDING: '#06b6d4',
  ACCEPTED: '#0ea5e9',
  IN_PROGRESS: '#3b82f6',
  REFUNDED: '#6b7280',
};

const spendingChartConfig: ChartConfig = {
  amount: { label: 'Spent', color: '#14b8a6' },
};

const frequencyChartConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: '#0ea5e9' },
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export function ClientDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();

  // Data fetching
  const { data: bookingsData, loading: bookingsLoading } = useApi<{ bookings: Booking[] }>('/api/bookings');
  const { data: reviewsData, loading: reviewsLoading } = useApi<{ reviews: ReviewData[] }>('/api/reviews');
  const { data: walletData, loading: walletLoading } = useApi<WalletData>('/api/wallet');
  const { data: txData, loading: txLoading } = useApi<{ transactions: Transaction[] }>('/api/wallet/transactions');
  const { data: amcData, loading: amcLoading } = useApi<{ subscriptions: AMCSubscription[] }>('/api/amc/subscriptions');
  const { data: couponsData, loading: couponsLoading } = useApi<{ coupons: Coupon[] }>('/api/coupons');

  // Derived data
  const bookings = bookingsData?.bookings || [];
  const reviews = reviewsData?.reviews || [];
  const wallet = walletData || { balance: 0, cashbackBalance: 0, promoBalance: 0, totalCredited: 0, totalDebited: 0 };
  const transactions = txData?.transactions || [];
  const amcSubs = amcData?.subscriptions || [];
  const coupons = couponsData?.coupons || [];

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status))
        .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
        .slice(0, 3),
    [bookings]
  );

  const completedCount = useMemo(() => bookings.filter((b) => b.status === 'COMPLETED').length, [bookings]);
  const totalSpent = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.finalPrice || 0), 0),
    [bookings]
  );
  const recentReviews = useMemo(() => reviews.slice(0, 3), [reviews]);
  const activeAmcCount = useMemo(() => amcSubs.filter((s) => s.status === 'ACTIVE').length, [amcSubs]);
  const availableCouponsCount = useMemo(
    () => coupons.filter((c) => c.isActive && new Date(c.validUntil) > new Date()).length,
    [coupons]
  );

  /* ---------- Journey computations ---------- */
  const memberSince = user?.createdAt || '';
  const daysOnPlatform = memberSince ? daysBetween(memberSince) : 0;

  const firstBookingDate = useMemo(() => {
    if (!bookings.length) return null;
    const sorted = [...bookings].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[0].createdAt;
  }, [bookings]);

  // Most used category
  const mostUsedCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const cat = b.service?.category?.name || b.service?.title || 'Other';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || null;
  }, [bookings]);

  // Favorite providers
  const favoriteProviders = useMemo(() => {
    const provMap: Record<string, { name: string; count: number }> = {};
    bookings.forEach((b) => {
      if (b.provider?.id && b.provider.name) {
        if (!provMap[b.provider.id]) provMap[b.provider.id] = { name: b.provider.name, count: 0 };
        provMap[b.provider.id].count++;
      }
    });
    return Object.entries(provMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([, v]) => v);
  }, [bookings]);

  // Review summary
  const reviewSummary = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    return { total, avg };
  }, [reviews]);

  // Booking frequency (last 6 months)
  const bookingFrequency = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    // init 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    bookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([month, bookings]) => ({ month, bookings }));
  }, [bookings]);

  // Monthly spending (last 6 months)
  const monthlySpending = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    bookings
      .filter((b) => b.status === 'COMPLETED')
      .forEach((b) => {
        const d = new Date(b.createdAt);
        const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (key in months) months[key] += b.finalPrice || 0;
      });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  }, [bookings]);

  // Booking status breakdown for pie chart
  const bookingStatusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      map[b.status] = (map[b.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      status,
      count,
      fill: PIE_COLORS[status] || '#94a3b8',
    }));
  }, [bookings]);

  // Activity feed
  const activityFeed = useMemo(() => {
    const items: { id: string; type: string; icon: typeof Activity; iconBg: string; title: string; subtitle: string; date: string }[] = [];

    bookings.slice(0, 5).forEach((b) => {
      const iconMap: Record<string, { icon: typeof Activity; bg: string }> = {
        COMPLETED: { icon: CheckCircle2, bg: 'from-emerald-400 to-teal-500' },
        CANCELLED: { icon: Receipt, bg: 'from-red-400 to-rose-500' },
        PENDING: { icon: Clock, bg: 'from-sky-400 to-blue-500' },
        ACCEPTED: { icon: CheckCircle2, bg: 'from-sky-400 to-blue-500' },
        IN_PROGRESS: { icon: Timer, bg: 'from-cyan-400 to-blue-500' },
      };
      const cfg = iconMap[b.status] || iconMap.PENDING;
      items.push({
        id: `booking-${b.id}`,
        type: 'booking',
        icon: cfg.icon,
        iconBg: cfg.bg,
        title: `${b.service?.title || 'Service'} - ${b.status.replace(/_/g, ' ')}`,
        subtitle: `${b.provider?.name || 'Provider'} · ${formatCurrency(b.finalPrice)}`,
        date: b.createdAt,
      });
    });

    reviews.slice(0, 3).forEach((r) => {
      items.push({
        id: `review-${r.id}`,
        type: 'review',
        icon: MessageSquare,
        iconBg: 'from-cyan-400 to-blue-500',
        title: `Rated ${r.rating} ★ for ${r.service?.title || 'Service'}`,
        subtitle: r.comment ? r.comment.slice(0, 60) : 'No comment',
        date: r.createdAt,
      });
    });

    transactions.slice(0, 5).forEach((tx) => {
      const isCredit = tx.type === 'CREDIT';
      items.push({
        id: `tx-${tx.id}`,
        type: 'payment',
        icon: isCredit ? ArrowDownLeft : ArrowUpRight,
        iconBg: isCredit ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-pink-500',
        title: `${isCredit ? 'Received' : 'Spent'} ${formatCurrency(tx.amount)}`,
        subtitle: tx.description || tx.category,
        date: tx.createdAt,
      });
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 10);
  }, [bookings, reviews, transactions]);

  /* ---------- Overview stats ---------- */
  const overviewStats = [
    {
      title: 'Upcoming Bookings',
      value: upcomingBookings.length,
      icon: CalendarCheck,
      gradient: 'from-sky-400 to-blue-500',
      bgGlow: 'bg-sky-500/10',
    },
    {
      title: 'Completed Services',
      value: completedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-400 to-teal-500',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      gradient: 'from-cyan-400 to-blue-500',
      bgGlow: 'bg-sky-500/10',
    },
    {
      title: 'Wallet Balance',
      value: formatCurrency(wallet.balance || 0),
      icon: Wallet,
      gradient: 'from-teal-400 to-emerald-500',
      bgGlow: 'bg-teal-500/10',
    },
    {
      title: 'Active AMC Plans',
      value: activeAmcCount,
      icon: Shield,
      gradient: 'from-cyan-400 to-teal-500',
      bgGlow: 'bg-cyan-500/10',
    },
    {
      title: 'Available Coupons',
      value: availableCouponsCount,
      icon: Ticket,
      gradient: 'from-pink-400 to-rose-500',
      bgGlow: 'bg-pink-500/10',
    },
  ];

  const quickActions = [
    { icon: Briefcase, label: 'Book Service', nav: 'categories', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    { icon: CalendarCheck, label: 'View Bookings', nav: 'client-bookings', gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/25' },
    { icon: Wallet, label: 'Add Money', nav: 'client-wallet', gradient: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/25' },
    { icon: Ticket, label: 'Apply Coupon', nav: 'client-coupons', gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/25' },
  ];

  const SERVICE_ICONS = [
    { icon: Droplets, color: 'from-blue-400 to-cyan-400', label: 'Plumbing' },
    { icon: Zap, color: 'from-cyan-400 to-yellow-400', label: 'Electrical' },
    { icon: Wind, color: 'from-teal-400 to-emerald-400', label: 'Air Conditioner' },
  ];

  /* ================================================================
   RENDER
   ================================================================ */
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab Navigation */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <BarChart3 className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Your complete service journey</p>
              </div>
            </div>
          </motion.div>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="gap-1.5">
              <Eye className="size-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-1.5">
              <Flame className="size-4" />
              <span className="hidden sm:inline">My Journey</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5">
              <Activity className="size-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============================================================
            TAB 1: OVERVIEW
            ============================================================ */}
        <TabsContent value="overview">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="size-14 shrink-0 border-2 border-white/30 shadow-lg">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-white/20 text-lg font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-200" />
                    <span className="text-sm font-medium text-emerald-100">Welcome back</span>
                  </div>
                  <h1 className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">
                    {user?.name?.split(' ')[0] || 'Client'}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <VerifiedBadge verified={!!user?.isVerified} />
                    <span className="text-xs text-emerald-200/80">
                      Member since {formatDate(memberSince, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="shimmer bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 border border-white/20"
                  onClick={() => navigate('categories')}
                >
                  <Briefcase className="mr-2 size-4" />
                  Book Service
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => navigate('client-bookings')}
                >
                  View Bookings
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Overview Stats Grid */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          >
            {overviewStats.map((stat) => (
              <motion.div key={stat.title} variants={fadeUp}>
                <div className="glass group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
                  <div className="relative flex items-center gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <stat.icon className="size-4.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-muted-foreground">{stat.title}</p>
                      <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Upcoming Bookings */}
            <motion.div className="lg:col-span-2" {...fadeUp}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
                  <CardTitle className="text-lg font-semibold">Upcoming Bookings</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('client-bookings')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    View All <ArrowRight className="ml-1 size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
                      ))}
                    </div>
                  ) : upcomingBookings.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                        <CalendarDays className="size-8 text-emerald-300" />
                      </div>
                      <p className="mt-3 font-medium text-muted-foreground">No upcoming bookings</p>
                      <p className="mt-1 text-sm text-muted-foreground/70">Book a service to get started</p>
                      <Button
                        className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        size="sm"
                        onClick={() => navigate('categories')}
                      >
                        Browse Services
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.map((booking, idx) => (
                        <motion.button
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          onClick={() => navigate('client-booking-detail', { bookingId: booking.id })}
                          className="group flex w-full items-center gap-4 rounded-xl border border-transparent p-4 text-left transition-all hover:border-emerald-100 hover:bg-emerald-50/50 hover:shadow-sm"
                        >
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
                            <Briefcase className="size-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {booking.service?.title || 'Service'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.provider?.name || 'Provider'} &middot;{' '}
                              {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}{' '}
                              at {booking.scheduledTime}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <StatusBadge status={booking.status} />
                            <span className="text-xs font-semibold text-emerald-600">₹{booking.finalPrice?.toLocaleString()}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sky-50/80 to-blue-50/50 pb-3">
                  <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('client-reviews')} className="text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  {reviewsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                      ))}
                    </div>
                  ) : recentReviews.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-50">
                        <Star className="size-7 text-sky-300" />
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentReviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-transparent p-3 transition-colors hover:border-sky-100 hover:bg-sky-50/30">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${i < review.rating ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.4)]' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium">{review.service?.title || 'Service'}</p>
                          {review.comment && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.nav as Page)}
                  className={`flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br ${action.gradient} p-5 text-white shadow-lg ${action.shadow} transition-shadow hover:shadow-xl`}
                >
                  <action.icon className="size-6" />
                  <span className="text-sm font-semibold">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Explore Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Explore Services</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('categories')} className="text-emerald-600 hover:text-emerald-700">
                See All <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {SERVICE_ICONS.map((svc, idx) => (
                <motion.button
                  key={svc.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('categories')}
                  className="group flex min-w-[180px] flex-col items-center gap-3 rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-all hover:border-emerald-100 hover:shadow-md"
                >
                  <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${svc.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <svc.icon className="size-7 text-white" />
                  </div>
                  <span className="font-semibold text-sm">{svc.label}</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ============================================================
            TAB 2: MY JOURNEY
            ============================================================ */}
        <TabsContent value="journey">
          <div className="space-y-6">
            {/* Journey Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 p-6 sm:p-8"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
              <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-white/5 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-teal-100">
                  <Flame className="size-5" />
                  <span className="text-sm font-medium">Your Service Journey</span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {daysOnPlatform} Days on BookYourService
                </h2>
                <p className="mt-1 text-teal-100/80">
                  Since {formatDate(memberSince, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </motion.div>

            {/* Journey Key Metrics */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                {
                  icon: CalendarDays,
                  label: 'Account Created',
                  value: formatDate(memberSince, { month: 'short', year: 'numeric' }),
                  gradient: 'from-teal-400 to-cyan-500',
                  bgGlow: 'bg-teal-500/10',
                },
                {
                  icon: Clock,
                  label: 'Days on Platform',
                  value: daysOnPlatform,
                  gradient: 'from-cyan-400 to-sky-500',
                  bgGlow: 'bg-cyan-500/10',
                },
                {
                  icon: CalendarCheck,
                  label: 'First Booking',
                  value: firstBookingDate ? formatDate(firstBookingDate, { month: 'short', year: 'numeric' }) : 'N/A',
                  gradient: 'from-sky-400 to-blue-500',
                  bgGlow: 'bg-sky-500/10',
                },
                {
                  icon: Briefcase,
                  label: 'Total Bookings',
                  value: bookings.length,
                  gradient: 'from-emerald-400 to-teal-500',
                  bgGlow: 'bg-emerald-500/10',
                },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUp}>
                  <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
                    <div className="relative flex items-center gap-4">
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <stat.icon className="size-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Service Insights + Favorite Providers */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Service Insights */}
              <motion.div {...fadeUp}>
                <Card className="h-full rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-teal-50/80 to-cyan-50/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Award className="size-5 text-teal-600" />
                      Service Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-4 rounded-xl bg-teal-50/50 p-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-md">
                        <TrendingUp className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Most Used Category</p>
                        <p className="text-base font-bold">{mostUsedCategory || 'N/A'}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-sky-50/50 p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Total Amount Spent</p>
                      </div>
                      <div className="rounded-xl bg-cyan-50/50 p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="size-4 fill-cyan-400 text-cyan-400" />
                          <span className="text-2xl font-bold text-cyan-600">{reviewSummary.avg.toFixed(1)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Avg Rating Given</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between rounded-xl bg-sky-50/50 p-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="size-4 text-sky-600" />
                        <span className="text-sm font-medium">Reviews Written</span>
                      </div>
                      <span className="text-lg font-bold text-sky-600">{reviewSummary.total}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Favorite Providers */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <Card className="h-full rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-cyan-50/80 to-sky-50/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="size-5 text-cyan-600" />
                      Favorite Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    {favoriteProviders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-50">
                          <Heart className="size-7 text-cyan-300" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No favorite providers yet</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">Book more services to discover favorites</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {favoriteProviders.map((prov, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-all hover:border-cyan-100 hover:bg-cyan-50/30"
                          >
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 shadow-md text-white font-bold">
                              {prov.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{prov.name}</p>
                              <p className="text-xs text-muted-foreground">{prov.count} booking{prov.count > 1 ? 's' : ''}</p>
                            </div>
                            <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 text-xs">
                              #{idx + 1}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Booking Frequency Trend */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-sky-50/80 to-blue-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="size-5 text-sky-600" />
                    Booking Frequency Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {bookings.length === 0 ? (
                    <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                      <BarChart3 className="mb-2 size-10 opacity-40" />
                      <p className="text-sm">No booking data yet</p>
                    </div>
                  ) : (
                    <ChartContainer config={frequencyChartConfig} className="h-[260px] w-full">
                      <BarChart data={bookingFrequency} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 3: ACTIVITY
            ============================================================ */}
        <TabsContent value="activity">
          <div className="space-y-6">
            {/* Activity Feed */}
            <motion.div {...fadeUp}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Activity className="size-5 text-emerald-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {bookingsLoading && reviewsLoading && txLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="size-11 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : activityFeed.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                        <Activity className="size-8 text-emerald-300" />
                      </div>
                      <p className="mt-3 font-medium text-muted-foreground">No activity yet</p>
                      <p className="mt-1 text-sm text-muted-foreground/70">Your recent activity will show here</p>
                      <Button
                        className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        size="sm"
                        onClick={() => navigate('categories')}
                      >
                        Book a Service
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-96">
                      <div className="space-y-1">
                        {activityFeed.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-gray-50/80"
                          >
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconBg} shadow-md`}>
                              <item.icon className="size-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{item.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(item.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Booking Status Breakdown */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <Card className="h-full rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-cyan-50/80 to-sky-50/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <CircleDot className="size-5 text-cyan-600" />
                      Booking Status Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {bookings.length === 0 ? (
                      <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                        <CircleDot className="mb-2 size-10 opacity-40" />
                        <p className="text-sm">No booking data</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ChartContainer config={pieChartConfig} className="h-[240px] w-full">
                          <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                            <Pie
                              data={bookingStatusBreakdown}
                              dataKey="count"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                              strokeWidth={2}
                              stroke="hsl(var(--background))"
                            >
                              {bookingStatusBreakdown.map((entry) => (
                                <Cell key={entry.status} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                          </PieChart>
                        </ChartContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Spending Chart */}
              <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                <Card className="h-full rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-teal-50/80 to-emerald-50/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <IndianRupee className="size-5 text-teal-600" />
                      Monthly Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {bookings.filter((b) => b.status === 'COMPLETED').length === 0 ? (
                      <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                        <IndianRupee className="mb-2 size-10 opacity-40" />
                        <p className="text-sm">No spending data</p>
                      </div>
                    ) : (
                      <ChartContainer config={spendingChartConfig} className="h-[240px] w-full">
                        <AreaChart data={monthlySpending} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                          <defs>
                            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₹${v}`} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name, item, index, payload) => [formatCurrency(Number(value)), 'Spent']}
                              />
                            }
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--color-amount)"
                            strokeWidth={2.5}
                            fill="url(#spendGradient)"
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

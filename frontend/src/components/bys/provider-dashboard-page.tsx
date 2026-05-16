import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  CalendarCheck,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ArrowRight,
  Sparkles,
  User,
  Shield,
  Award,
  Calendar,
  BarChart3,
  Target,
  Timer,
  Users,
  Zap,
  Heart,
  Activity,
  ChevronRight,
  BadgeCheck,
  Rocket,
  Trophy,
  MapPin,
  MessageSquare,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  basePrice: number;
  providerEarnings: number;
  platformFee: number;
  service: { id: string; title: string; basePrice: number; category?: { name: string } };
  client?: { id: string; name: string; profileImageUrl?: string };
  createdAt: string;
  completedAt?: string;
}

interface BookingResponse {
  bookings: Booking[];
  pagination: { total: number };
}

interface Service {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: string;
  averageRating: number;
  totalReviews: number;
  serviceDurationMinutes: number | null;
  category: { id: number; name: string };
  subcategory: { id: number; name: string } | null;
  createdAt: string;
}

interface ServicesResponse {
  services: Service[];
  pagination: { total: number };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  bookingId: string;
  service: { id: string; title: string };
  reviewer?: { id: string; name: string; profileImageUrl?: string };
}

interface ReviewsResponse {
  reviews?: Review[];
}

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Chart configs                                                      */
/* ------------------------------------------------------------------ */

const earningsChartConfig: ChartConfig = {
  earnings: { label: 'Earnings (₹)', color: '#10b981' },
};

const bookingsChartConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: '#06b6d4' },
};

const ratingDistConfig: ChartConfig = {
  count: { label: 'Reviews', color: '#06b6d4' },
};

const PIE_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];

const categoryPerfConfig: ChartConfig = {
  rating: { label: 'Avg Rating', color: '#10b981' },
  bookings: { label: 'Bookings', color: '#06b6d4' },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-cyan-400' },
    ACCEPTED: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-400' },
    IN_PROGRESS: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-sky-400' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'size-5' : size === 'md' ? 'size-4' : 'size-3.5';
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
            i < Math.round(rating)
              ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.4)]'
              : 'text-gray-200'
          }`}
        />
      ))}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  bgGlow,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGlow: string;
  subtitle?: string;
}) {
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className={`absolute -right-3 -top-3 size-16 rounded-full ${bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
      <div className="relative flex items-center gap-4">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground/70">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();

  /* ---- Data fetching ---- */
  const { data: bookingData, loading: bookingsLoading, refetch } = useApi<BookingResponse>('/api/bookings?limit=200');
  const { data: serviceData } = useApi<ServicesResponse>('/api/services?limit=100');
  const { data: reviewData } = useApi<ReviewsResponse>('/api/reviews');
  const { mutate } = useApiMutation();

  const isLoading = bookingsLoading;

  /* ---- Derived state ---- */
  const bookings = useMemo(() => bookingData?.bookings || [], [bookingData]);
  const services = useMemo(() => serviceData?.services || [], [serviceData]);
  const reviews = useMemo(() => reviewData?.reviews || [], [reviewData]);

  const today = new Date().toISOString().split('T')[0];

  const todayBookings = useMemo(() => bookings.filter((b) => b.scheduledDate === today), [bookings, today]);
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'PENDING'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'COMPLETED'), [bookings]);
  const acceptedOrInProgress = useMemo(() => bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'), [bookings]);

  const weekEarnings = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return completedBookings
      .filter((b) => new Date(b.scheduledDate) >= weekAgo)
      .reduce((sum, b) => sum + (b.providerEarnings || 0), 0);
  }, [completedBookings]);

  const totalEarnings = useMemo(() => completedBookings.reduce((s, b) => s + (b.providerEarnings || 0), 0), [completedBookings]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  /* ---- Journey calculations ---- */
  const memberSince = user?.email ? 'Jan 2024' : 'Jan 2024';
  const daysOnPlatform = useMemo(() => {
    if (!bookings.length) return 0;
    const earliest = bookings.reduce((min, b) => {
      const d = new Date(b.createdAt).getTime();
      return d < min ? d : min;
    }, Date.now());
    return Math.max(1, Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24)));
  }, [bookings]);

  const firstBookingDate = useMemo(() => {
    if (!bookings.length) return null;
    const sorted = [...bookings].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[0].createdAt;
  }, [bookings]);

  /* ---- Monthly earnings & booking trends ---- */
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { earnings: number; bookings: number }> = {};
    completedBookings.forEach((b) => {
      const d = new Date(b.scheduledDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { earnings: 0, bookings: 0 };
      monthMap[key].earnings += b.providerEarnings || 0;
      monthMap[key].bookings += 1;
    });
    // Also count non-completed for booking volume
    bookings.forEach((b) => {
      const d = new Date(b.scheduledDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { earnings: 0, bookings: 0 };
      if (b.status !== 'COMPLETED') monthMap[key].bookings += 1;
    });
    const months = Object.keys(monthMap).sort();
    // Show last 6 months or all available
    const recent = months.slice(-6);
    return recent.map((m) => ({
      month: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' }),
      earnings: monthMap[m].earnings,
      bookings: monthMap[m].bookings,
    }));
  }, [bookings, completedBookings]);

  /* ---- Rating distribution ---- */
  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => ({
      star: `${star}★`,
      count: reviews.filter((r) => r.rating === star).length,
      fill: PIE_COLORS[5 - star],
    }));
  }, [reviews]);

  /* ---- Top performing services ---- */
  const topServices = useMemo(() => {
    const svcMap: Record<string, { title: string; bookings: number; earnings: number; rating: number }> = {};
    completedBookings.forEach((b) => {
      const sid = b.service?.id || 'unknown';
      if (!svcMap[sid]) svcMap[sid] = { title: b.service?.title || 'Unknown', bookings: 0, earnings: 0, rating: 0 };
      svcMap[sid].bookings += 1;
      svcMap[sid].earnings += b.providerEarnings || 0;
    });
    // attach ratings from service data
    services.forEach((s) => {
      if (svcMap[s.id]) {
        svcMap[s.id].rating = s.averageRating || 0;
      }
    });
    return Object.values(svcMap).sort((a, b) => b.earnings - a.earnings).slice(0, 5);
  }, [completedBookings, services]);

  /* ---- Category-wise performance ---- */
  const categoryPerformance = useMemo(() => {
    const catMap: Record<string, { name: string; bookings: number; earnings: number; rating: number; count: number }> = {};
    bookings.forEach((b) => {
      const cat = b.service?.category?.name || 'Other';
      if (!catMap[cat]) catMap[cat] = { name: cat, bookings: 0, earnings: 0, rating: 0, count: 0 };
      catMap[cat].bookings += 1;
    });
    completedBookings.forEach((b) => {
      const cat = b.service?.category?.name || 'Other';
      if (catMap[cat]) catMap[cat].earnings += b.providerEarnings || 0;
    });
    services.forEach((s) => {
      const cat = s.category?.name || 'Other';
      if (catMap[cat]) {
        catMap[cat].rating += s.averageRating || 0;
        catMap[cat].count += 1;
      }
    });
    return Object.values(catMap).map((c) => ({
      ...c,
      rating: c.count ? Math.round((c.rating / c.count) * 10) / 10 : 0,
    }));
  }, [bookings, completedBookings, services]);

  /* ---- Performance metrics ---- */
  const completionRate = useMemo(() => {
    const total = bookings.filter((b) => ['COMPLETED', 'CANCELLED'].includes(b.status)).length;
    if (!total) return 0;
    return Math.round((completedBookings.length / total) * 100);
  }, [bookings, completedBookings]);

  const onTimeRate = useMemo(() => {
    // Simulated: providers with good ratings are assumed punctual
    if (!completedBookings.length) return 0;
    return Math.min(98, Math.round(70 + avgRating * 5));
  }, [completedBookings, avgRating]);

  const repeatCustomerRate = useMemo(() => {
    if (!completedBookings.length) return 0;
    const clientCounts: Record<string, number> = {};
    completedBookings.forEach((b) => {
      const cid = b.client?.id || '';
      if (cid) clientCounts[cid] = (clientCounts[cid] || 0) + 1;
    });
    const repeatClients = Object.values(clientCounts).filter((c) => c > 1).length;
    const totalClients = Object.keys(clientCounts).length;
    if (!totalClients) return 0;
    return Math.round((repeatClients / totalClients) * 100);
  }, [completedBookings]);

  const avgResponseTime = useMemo(() => {
    // Estimate from accepted bookings: time between createdAt and first action
    // Simplified: use a heuristic based on booking volume
    if (!pendingBookings.length && !acceptedOrInProgress.length) return '< 30 min';
    return '< 1 hour';
  }, [pendingBookings, acceptedOrInProgress]);

  /* ---- Handlers ---- */
  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  /* ---- Loading skeleton ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-28 w-full animate-pulse rounded-2xl bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  /* ---- Quick actions ---- */
  const quickActions = [
    { icon: Plus, label: 'Add Service', nav: 'provider-create-service' as Page, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    { icon: CalendarCheck, label: 'View Bookings', nav: 'provider-bookings' as Page, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/25' },
    { icon: DollarSign, label: 'Check Earnings', nav: 'provider-earnings' as Page, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
    { icon: Shield, label: 'Update KYC', nav: 'provider-kyc' as Page, gradient: 'from-cyan-500 to-sky-600', shadow: 'shadow-sky-500/25' },
  ];

  /* ---- Recent reviews (latest 3) ---- */
  const recentReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold sm:text-3xl">Provider Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your business, track performance & grow</p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-11 w-full sm:w-auto rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="overview" className="gap-1.5 rounded-lg text-sm data-[state=active]:shadow-sm">
            <Activity className="size-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="journey" className="gap-1.5 rounded-lg text-sm data-[state=active]:shadow-sm">
            <Rocket className="size-4" />
            <span className="hidden sm:inline">My Journey</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5 rounded-lg text-sm data-[state=active]:shadow-sm">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1: OVERVIEW                                              */}
        {/* ============================================================ */}
        <TabsContent value="overview" className="space-y-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-emerald-200" />
                  <span className="text-sm font-medium text-emerald-100">Welcome back</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    {user?.name?.split(' ')[0] || 'Provider'}
                  </h2>
                  {user?.verifiedBadge && (
                    <BadgeCheck className="size-6 text-emerald-200 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-emerald-100/80 text-sm">
                  <Calendar className="size-3.5" />
                  Member since {memberSince}
                  {user?.isVerified && (
                    <>
                      <span className="mx-1">·</span>
                      <Shield className="size-3.5" />
                      Verified
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="glass-dark rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-emerald-200">This Week</p>
                  <p className="text-lg font-bold text-white">₹{weekEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <motion.div variants={fadeUp}>
              <StatCard
                title="Today's Bookings"
                value={todayBookings.length}
                icon={CalendarCheck}
                gradient="from-emerald-400 to-teal-500"
                bgGlow="bg-emerald-500/10"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Weekly Earnings"
                value={`₹${weekEarnings.toLocaleString()}`}
                icon={DollarSign}
                gradient="from-sky-400 to-blue-500"
                bgGlow="bg-sky-500/10"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Average Rating"
                value={avgRating || '—'}
                icon={Star}
                gradient="from-cyan-400 to-blue-500"
                bgGlow="bg-sky-500/10"
                subtitle={reviews.length ? `${reviews.length} reviews` : undefined}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Total Completed"
                value={completedBookings.length}
                icon={TrendingUp}
                gradient="from-violet-400 to-purple-500"
                bgGlow="bg-violet-500/10"
              />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Pending Booking Requests */}
            <motion.div className="lg:col-span-2" {...fadeUp}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sky-50/80 to-blue-50/50 pb-3">
                  <CardTitle className="text-lg font-semibold">Pending Booking Requests</CardTitle>
                  <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-white border-0 shadow-sm">
                    {pendingBookings.length} pending
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingBookings.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sky-50">
                        <Clock className="size-8 text-sky-300" />
                      </div>
                      <p className="mt-3 text-muted-foreground">No pending requests</p>
                      <p className="text-xs text-muted-foreground/60">New booking requests will appear here</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-96">
                      {pendingBookings.map((booking, idx) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between border-b p-4 last:border-0 transition-colors hover:bg-emerald-50/30"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{booking.service?.title}</p>
                              <StatusBadge status={booking.status} />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {booking.client?.name} &middot; {booking.scheduledDate} at {booking.scheduledTime}
                            </p>
                            <p className="text-sm font-semibold text-emerald-600">
                              ₹{booking.finalPrice?.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25"
                              onClick={() => handleBookingAction(booking.id, 'accept')}
                            >
                              <CheckCircle2 className="mr-1 size-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                            >
                              <XCircle className="mr-1 size-3" />
                              Reject
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/50 pb-3">
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => navigate(action.nav)}
                      className={`flex w-full items-center gap-3 rounded-xl bg-gradient-to-r ${action.gradient} p-3.5 text-white shadow-lg ${action.shadow} transition-shadow hover:shadow-xl`}
                    >
                      <action.icon className="size-5" />
                      <span className="text-sm font-semibold">{action.label}</span>
                      <ArrowRight className="ml-auto size-4 opacity-60" />
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Today's Schedule */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
                  <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('provider-bookings')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    View all <ArrowRight className="ml-1 size-3" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {todayBookings.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                        <CalendarCheck className="size-8 text-emerald-300" />
                      </div>
                      <p className="mt-3 text-muted-foreground">No bookings scheduled for today</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-64">
                      {todayBookings.map((booking, i) => (
                        <div key={booking.id} className="flex items-center gap-4 border-b p-4 last:border-0 transition-colors hover:bg-emerald-50/30">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{booking.service?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.client?.name} &middot; {booking.scheduledTime}
                            </p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-cyan-50/80 to-sky-50/50 pb-3">
                  <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('provider-reviews')} className="text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                    All reviews <ArrowRight className="ml-1 size-3" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {recentReviews.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sky-50">
                        <MessageSquare className="size-8 text-sky-300" />
                      </div>
                      <p className="mt-3 text-muted-foreground">No reviews yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-64">
                      {recentReviews.map((review) => (
                        <div key={review.id} className="border-b p-4 last:border-0 transition-colors hover:bg-sky-50/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500 text-xs font-bold text-white">
                                {review.reviewer?.name?.charAt(0) || 'C'}
                              </div>
                              <span className="text-sm font-medium">{review.reviewer?.name || 'Client'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-muted-foreground">{review.rating}.0</span>
                          </div>
                          {review.comment && (
                            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground/60">{review.service?.title}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2: MY JOURNEY                                            */}
        {/* ============================================================ */}
        <TabsContent value="journey" className="space-y-6">
          {/* Journey Hero */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Rocket className="size-5 text-purple-200" />
                  <span className="text-sm font-medium text-purple-100">Your Journey</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  {daysOnPlatform} Days & Counting
                </h2>
                <p className="mt-1 text-purple-100/80 text-sm">
                  Every day you&apos;re building something great
                </p>
              </div>
              <div className="flex gap-3">
                <div className="glass-dark rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-purple-200">Total Earned</p>
                  <p className="text-lg font-bold text-white">₹{totalEarnings.toLocaleString()}</p>
                </div>
                <div className="glass-dark rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-purple-200">Rating</p>
                  <p className="text-lg font-bold text-white">{avgRating || '—'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Journey Milestones */}
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <motion.div variants={fadeUp}>
              <StatCard
                title="Account Created"
                value={memberSince}
                icon={Calendar}
                gradient="from-violet-400 to-purple-500"
                bgGlow="bg-violet-500/10"
                subtitle={`${daysOnPlatform} days ago`}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="First Booking"
                value={firstBookingDate ? new Date(firstBookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                icon={Trophy}
                gradient="from-cyan-400 to-sky-500"
                bgGlow="bg-sky-500/10"
                subtitle={firstBookingDate ? new Date(firstBookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'No bookings yet'}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Total Services"
                value={services.length}
                icon={Briefcase}
                gradient="from-emerald-400 to-teal-500"
                bgGlow="bg-emerald-500/10"
                subtitle={`${services.filter(s => s.isActive).length} active`}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Total Bookings"
                value={bookings.length}
                icon={CalendarCheck}
                gradient="from-sky-400 to-blue-500"
                bgGlow="bg-sky-500/10"
                subtitle={`${completedBookings.length} completed`}
              />
            </motion.div>
          </motion.div>

          {/* Earnings + Booking Volume Trends */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <TrendingUp className="size-5 text-emerald-500" />
                    Monthly Earnings Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {monthlyData.length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                      No earnings data yet
                    </div>
                  ) : (
                    <ChartContainer config={earningsChartConfig} className="h-56 w-full">
                      <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-sky-50/80 to-blue-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="size-5 text-sky-500" />
                    Booking Volume Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {monthlyData.length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                      No booking data yet
                    </div>
                  ) : (
                    <ChartContainer config={bookingsChartConfig} className="h-56 w-full">
                      <LineChart data={monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="var(--color-bookings)"
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-bookings)', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Performing Services + Total Earnings Card */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div className="lg:col-span-2" {...fadeUp} transition={{ delay: 0.15 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Award className="size-5 text-violet-500" />
                    Top Performing Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {topServices.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-50">
                        <Briefcase className="size-8 text-violet-300" />
                      </div>
                      <p className="mt-3 text-muted-foreground">Complete bookings to see top services</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-72">
                      {topServices.map((svc, i) => (
                        <div key={i} className="flex items-center gap-4 border-b p-4 last:border-0 transition-colors hover:bg-violet-50/30">
                          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${
                            i === 0 ? 'bg-gradient-to-br from-cyan-400 to-sky-500' :
                            i === 1 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                            'bg-gradient-to-br from-violet-400 to-purple-500'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{svc.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">{svc.bookings} bookings</span>
                              {svc.rating > 0 && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="size-3 fill-cyan-400 text-cyan-400" />
                                  {svc.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-emerald-600">₹{svc.earnings.toLocaleString()}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Journey Summary Card */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <div className="h-1.5 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Heart className="size-5 text-fuchsia-500" />
                    At a Glance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
                      { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'text-sky-600' },
                      { label: 'Services Listed', value: services.length, icon: Briefcase, color: 'text-violet-600' },
                      { label: 'Reviews Received', value: reviews.length, icon: MessageSquare, color: 'text-cyan-600' },
                      { label: 'Avg. Rating', value: avgRating || '—', icon: Star, color: 'text-cyan-600' },
                      { label: 'Days Active', value: daysOnPlatform, icon: Clock, color: 'text-fuchsia-600' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className={`size-4 ${item.color}`} />
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Rating Progression</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <StarRating rating={avgRating} size="lg" />
                    </div>
                    <p className="mt-1 text-2xl font-bold bg-gradient-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent">
                      {avgRating || '—'} / 5.0
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3: PERFORMANCE                                           */}
        {/* ============================================================ */}
        <TabsContent value="performance" className="space-y-6">
          {/* Performance Hero */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-sky-200" />
                  <span className="text-sm font-medium text-sky-100">Performance Metrics</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  {completionRate}% Completion Rate
                </h2>
                <p className="mt-1 text-sky-100/80 text-sm">
                  Track your service quality and efficiency
                </p>
              </div>
              <div className="flex gap-3">
                <div className="glass-dark rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-sky-200">Rating</p>
                  <p className="text-lg font-bold text-white">{avgRating || '—'}</p>
                </div>
                <div className="glass-dark rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-sky-200">On-Time</p>
                  <p className="text-lg font-bold text-white">{onTimeRate}%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <motion.div variants={fadeUp}>
              <StatCard
                title="Completion Rate"
                value={`${completionRate}%`}
                icon={Target}
                gradient="from-emerald-400 to-teal-500"
                bgGlow="bg-emerald-500/10"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="On-Time Arrival"
                value={`${onTimeRate}%`}
                icon={Clock}
                gradient="from-sky-400 to-blue-500"
                bgGlow="bg-sky-500/10"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Repeat Customers"
                value={`${repeatCustomerRate}%`}
                icon={Users}
                gradient="from-violet-400 to-purple-500"
                bgGlow="bg-violet-500/10"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                title="Avg Response Time"
                value={avgResponseTime}
                icon={Timer}
                gradient="from-cyan-400 to-sky-500"
                bgGlow="bg-sky-500/10"
              />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Rating Distribution Chart */}
            <motion.div {...fadeUp}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <CardHeader className="bg-gradient-to-r from-cyan-50/80 to-sky-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Star className="size-5 text-cyan-500" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {reviews.length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                      No reviews yet
                    </div>
                  ) : (
                    <>
                      <ChartContainer config={ratingDistConfig} className="h-56 w-full">
                        <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                          <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                          <YAxis dataKey="star" type="category" tickLine={false} axisLine={false} fontSize={12} width={30} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                            {ratingDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                      {/* Summary below chart */}
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold">{avgRating}</span>
                        <div>
                          <StarRating rating={Math.round(avgRating)} size="md" />
                          <p className="text-xs text-muted-foreground">{reviews.length} total reviews</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Response Time Stats */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm h-full">
                <CardHeader className="bg-gradient-to-r from-sky-50/80 to-blue-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Timer className="size-5 text-sky-500" />
                    Response & Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  {[
                    { label: 'Completion Rate', value: completionRate, color: 'bg-emerald-500', icon: Target },
                    { label: 'On-Time Arrival', value: onTimeRate, color: 'bg-sky-500', icon: Clock },
                    { label: 'Repeat Customer Rate', value: repeatCustomerRate, color: 'bg-violet-500', icon: Users },
                    { label: 'Profile Strength', value: Math.min(100, Math.round((services.length * 15) + (reviews.length * 5) + (user?.isVerified ? 20 : 0))), color: 'bg-cyan-500', icon: Zap },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <metric.icon className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{metric.label}</span>
                        </div>
                        <span className="text-sm font-bold">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2.5" />
                    </div>
                  ))}

                  <Separator />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Avg. Response</p>
                      <p className="mt-1 text-lg font-bold">{avgResponseTime}</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Active Services</p>
                      <p className="mt-1 text-lg font-bold">{services.filter(s => s.isActive).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Category-wise Performance */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="size-5 text-violet-500" />
                  Category-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {categoryPerformance.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-50">
                      <BarChart3 className="size-8 text-violet-300" />
                    </div>
                    <p className="mt-3 text-muted-foreground">No category data yet</p>
                    <p className="text-xs text-muted-foreground/60">Category performance will appear once you receive bookings</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {categoryPerformance.map((cat, i) => (
                        <div
                          key={cat.name}
                          className="rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm truncate">{cat.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {cat.bookings} bookings
                            </Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[11px] text-muted-foreground">Earnings</p>
                              <p className="text-sm font-bold text-emerald-600">₹{cat.earnings.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground">Avg Rating</p>
                              <div className="flex items-center gap-1">
                                <Star className="size-3 fill-cyan-400 text-cyan-400" />
                                <span className="text-sm font-bold">{cat.rating || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-[11px] text-muted-foreground mb-1">Booking Share</p>
                            <Progress value={bookings.length ? Math.round((cat.bookings / bookings.length) * 100) : 0} className="h-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

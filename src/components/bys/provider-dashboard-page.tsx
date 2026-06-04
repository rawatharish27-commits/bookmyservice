import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  providerEarnings: number;
  service: { id: string; title: string; basePrice: number };
  client: { id: string; name: string; profileImageUrl?: string };
}

interface BookingResponse {
  bookings: Booking[];
  pagination: { total: number };
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-400' },
    ACCEPTED: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    IN_PROGRESS: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    COMPLETED: { className: 'bg-[#FFD54F]/10 text-emerald-700 border-[#0A1F44]/20', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<BookingResponse>('/api/bookings?limit=50');
  const { mutate } = useApiMutation();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-muted/50" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded-lg bg-muted/50" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  const bookings = data?.bookings || [];
  const today = new Date().toISOString().split('T')[0];

  const todayBookings = bookings.filter((b) => b.scheduledDate === today);
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const weekEarnings = completedBookings
    .filter((b) => {
      const d = new Date(b.scheduledDate);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    })
    .reduce((sum, b) => sum + (b.providerEarnings || 0), 0);
  const avgRating = 4.5;

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const stats = [
    {
      title: "Today's Bookings",
      value: todayBookings.length,
      icon: CalendarCheck,
      gradient: '[#0A1F44] to-[#132D5E]',
      bgGlow: 'bg-[#0A1F44]/10',
    },
    {
      title: 'This Week Earnings',
      value: `₹${weekEarnings.toLocaleString()}`,
      icon: DollarSign,
      gradient: '[#0A1F44] to-[#132D5E]',
      bgGlow: 'bg-[#0A1F44]/10',
    },
    {
      title: 'Average Rating',
      value: avgRating,
      icon: Star,
      gradient: '[#D4A017] to-[#0A1F44]',
      bgGlow: 'bg-[#D4A017]/10',
    },
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: TrendingUp,
      gradient: '[#0A1F44] to-[#132D5E]',
      bgGlow: 'bg-[#0A1F44]/10',
    },
  ];

  const quickActions = [
    { icon: Plus, label: 'Create Service', nav: 'provider-create-service', gradient: '[#0A1F44] to-[#132D5E]', shadow: 'shadow-[#0A1F44]/25' },
    { icon: DollarSign, label: 'View Earnings', nav: 'provider-earnings', gradient: '[#0A1F44] to-[#132D5E]', shadow: 'shadow-[#0A1F44]/25' },
    { icon: Star, label: 'View Reviews', nav: 'provider-reviews', gradient: '[#D4A017] to-[#0A1F44]', shadow: 'shadow-[#D4A017]/25' },
    { icon: CalendarCheck, label: 'All Bookings', nav: 'provider-bookings', gradient: '[#0A1F44] to-[#132D5E]', shadow: 'shadow-[#0A1F44]/25' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r [#0A1F44] p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#FFD54F]" />
              <span className="text-sm font-medium text-[#E0B84C]">Welcome back</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {user?.name?.split(' ')[0] || 'Provider'} 👋
            </h1>
            <p className="mt-1 text-[#E0B84C]/80">Here&apos;s an overview of your business today</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-dark rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-[#FFD54F]">This Week</p>
              <p className="text-lg font-bold text-white">₹{weekEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* New Booking Requests */}
        <motion.div className="lg:col-span-2" {...fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r [#0A1F44] pb-3">
              <CardTitle className="text-lg font-semibold">New Booking Requests</CardTitle>
              <Badge className="bg-gradient-to-r [#D4A017] to-[#0A1F44] text-white border-0 shadow-sm">
                {pendingBookings.length} pending
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {pendingBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50">
                    <Clock className="size-8 text-[#D4A017]/50" />
                  </div>
                  <p className="mt-3 text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  {pendingBookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between border-b p-4 last:border-0 transition-colors hover:bg-[#FFD54F]/10/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{booking.service?.title}</p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {booking.client?.name} &middot; {booking.scheduledDate} at {booking.scheduledTime}
                        </p>
                        <p className="text-sm font-semibold text-[#0A1F44]">
                          ₹{booking.finalPrice?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r [#0A1F44] to-[#132D5E] text-white shadow-sm shadow-[#0A1F44]/25"
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
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r [#0A1F44] pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {quickActions.map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(action.nav as Page)}
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

      {/* Today's Schedule */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r [#0A1F44] pb-3">
            <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('provider-bookings')} className="text-[#0A1F44] hover:text-[#132D5E] hover:bg-[#FFD54F]/10">
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {todayBookings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#FFD54F]/10">
                  <CalendarCheck className="size-8 text-[#0A1F44]/40" />
                </div>
                <p className="mt-3 text-muted-foreground">No bookings scheduled for today</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                {todayBookings.map((booking, i) => (
                  <div key={booking.id} className="flex items-center gap-4 border-b p-4 last:border-0 transition-colors hover:bg-[#FFD54F]/10/30">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br [#0A1F44] to-[#132D5E] text-sm font-bold text-white shadow-sm`}>
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

      {/* Earnings Summary */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r [#0A1F44] pb-3">
            <CardTitle className="text-lg font-semibold">Earnings Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('provider-earnings')} className="text-[#0A1F44] hover:text-[#132D5E] hover:bg-[#FFD54F]/10">
              Details <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Today', value: `₹${todayBookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.providerEarnings || 0), 0).toLocaleString()}`, gradient: '[#0A1F44] to-[#132D5E]' },
                { label: 'This Week', value: `₹${weekEarnings.toLocaleString()}`, gradient: '[#0A1F44] to-[#132D5E]' },
                { label: 'Total', value: `₹${completedBookings.reduce((s, b) => s + (b.providerEarnings || 0), 0).toLocaleString()}`, gradient: '[#0A1F44] to-[#132D5E]' },
                { label: 'In Progress', value: `${bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length}`, gradient: '[#0A1F44] to-[#D4A017]' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-muted/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`mt-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-lg font-bold text-transparent`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

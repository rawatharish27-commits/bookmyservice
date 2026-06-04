import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-400' },
    ACCEPTED: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    IN_PROGRESS: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#132D5E]' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
    REFUNDED: { className: 'bg-gray-50 text-gray-700 border-gray-200', dotColor: 'bg-gray-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace('_', ' ')}
    </Badge>
  );
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  basePrice: number;
  finalPrice: number;
  service?: { id: string; title: string };
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

const SERVICE_ICONS = [
  { icon: Droplets, color: 'from-[#0A1F44] to-[#132D5E]', label: 'Plumbing' },
  { icon: Zap, color: 'from-[#D4A017] to-[#C99700]', label: 'Electrical' },
  { icon: Wind, color: 'from-[#0A1F44] to-[#D4A017]', label: 'AC & HVAC' },
];

export function ClientDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data: bookingsData, loading: bookingsLoading } = useApi<{ bookings: Booking[] }>('/api/bookings');
  const { data: reviewsData, loading: reviewsLoading } = useApi<{ reviews: ReviewData[] }>('/api/reviews');

  const bookings = bookingsData?.bookings || [];
  const reviews = reviewsData?.reviews || [];

  const upcomingBookings = bookings
    .filter((b) => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status))
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
    .slice(0, 3);

  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.finalPrice || 0), 0);

  const recentReviews = reviews.slice(0, 2);

  const stats = [
    {
      title: 'Upcoming Bookings',
      value: upcomingBookings.length,
      icon: CalendarCheck,
      gradient: 'from-[#0A1F44] to-[#132D5E]',
      bgGlow: 'bg-[#0A1F44]/10',
    },
    {
      title: 'Completed Services',
      value: completedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      title: 'Favorite Providers',
      value: 0,
      icon: Heart,
      gradient: 'from-pink-500 to-rose-600',
      bgGlow: 'bg-pink-500/10',
    },
    {
      title: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-[#D4A017] to-[#C99700]',
      bgGlow: 'bg-[#D4A017]/10',
    },
  ];

  const quickActions = [
    { icon: Briefcase, label: 'Book a Service', nav: 'categories', gradient: 'from-[#0A1F44] to-[#132D5E]', shadow: 'shadow-[#0A1F44]/25' },
    { icon: CalendarCheck, label: 'My Bookings', nav: 'client-bookings', gradient: 'from-[#0A1F44] to-[#132D5E]', shadow: 'shadow-[#0A1F44]/25' },
    { icon: Heart, label: 'Favorites', nav: 'client-favorites', gradient: 'from-[#D4A017] to-[#C99700]', shadow: 'shadow-[#D4A017]/25' },
    { icon: User, label: 'My Profile', nav: 'client-profile', gradient: 'from-[#0A1F44] to-[#D4A017]', shadow: 'shadow-[#0A1F44]/25' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-2xl bg-[#0A1F44] p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[#FFD54F]/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-[#FFD54F]/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#FFD54F]" />
              <span className="text-sm font-medium text-[#E0B84C]">Welcome back</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-[#FFD54F] sm:text-3xl">
              {user?.name?.split(' ')[0] || 'Client'} 👋
            </h1>
            <p className="mt-1 text-[#E0B84C]/80">Here&apos;s an overview of your activity</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="shimmer bg-[#FFD54F]/15 text-[#FFD54F] backdrop-blur-sm hover:bg-[#FFD54F]/25 border border-[#FFD54F]/20"
              onClick={() => navigate('categories')}
            >
              <Briefcase className="mr-2 size-4" />
              Book Service
            </Button>
            <Button
              variant="outline"
              className="border-[#FFD54F]/30 bg-transparent text-[#FFD54F] hover:bg-[#FFD54F]/10 hover:text-[#FFD54F]"
              onClick={() => navigate('client-bookings')}
            >
              View Bookings
            </Button>
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
            <div className="group relative overflow-hidden rounded-2xl bg-[#0A1F44] p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="size-5 text-[#FFD54F]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-[#E0B84C]">{stat.title}</p>
                  <p className="text-xl font-bold text-[#FFD54F]">{stat.value}</p>
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
            <CardHeader className="flex flex-row items-center justify-between bg-[#0A1F44] pb-3">
              <CardTitle className="text-lg font-semibold text-[#FFD54F]">Upcoming Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('client-bookings')} className="text-[#FFD54F] hover:text-[#FFD54F] hover:bg-[#FFD54F]/10">
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
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#0A1F44]/5">
                    <CalendarDays className="size-8 text-[#0A1F44]/30" />
                  </div>
                  <p className="mt-3 font-medium text-muted-foreground">No upcoming bookings</p>
                  <p className="mt-1 text-sm text-muted-foreground/70">Book a service to get started</p>
                  <Button
                    className="mt-4 bg-[#0A1F44] text-[#FFD54F] shadow-lg shadow-[#0A1F44]/25 hover:bg-[#132D5E]"
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
                      className="group flex w-full items-center gap-4 rounded-xl border border-transparent p-4 text-left transition-all hover:border-[#0A1F44]/10 hover:bg-[#FFD54F]/5 hover:shadow-sm"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] shadow-md shadow-[#0A1F44]/20">
                        <Briefcase className="size-5 text-[#FFD54F]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0A1F44]">
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
                        <span className="text-xs font-semibold text-[#0A1F44]">₹{booking.finalPrice?.toLocaleString()}</span>
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
            <CardHeader className="flex flex-row items-center justify-between bg-[#0A1F44] pb-3">
              <CardTitle className="text-lg font-semibold text-[#FFD54F]">Recent Reviews</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('client-reviews')} className="text-[#FFD54F] hover:text-[#FFD54F] hover:bg-[#FFD54F]/10">
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                  ))}
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#D4A017]/10">
                    <Star className="size-7 text-[#D4A017]/50" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-transparent p-3 transition-colors hover:border-[#0A1F44]/10 hover:bg-[#FFD54F]/5">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${i < review.rating ? 'fill-[#D4A017] text-[#D4A017] drop-shadow-[0_0_3px_rgba(212,160,23,0.4)]' : 'text-gray-200'}`}
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
                      <p className="mt-1 text-sm font-medium text-[#0A1F44]">{review.service?.title || 'Service'}</p>
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
        <h2 className="mb-4 text-lg font-semibold text-[#0A1F44]">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.nav as Page)}
              className={`flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br ${action.gradient} p-5 text-[#FFD54F] shadow-lg ${action.shadow} transition-shadow hover:shadow-xl`}
            >
              <action.icon className="size-6" />
              <span className="text-sm font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recommended Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0A1F44]">Explore Services</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('categories')} className="text-[#0A1F44] hover:text-[#132D5E] hover:bg-[#FFD54F]/10">
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
              className="group flex min-w-[180px] flex-col items-center gap-3 rounded-2xl border border-[#0A1F44]/10 bg-[#F2C94C] p-6 shadow-sm transition-all hover:border-[#0A1F44]/20 hover:shadow-md"
            >
              <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${svc.color} shadow-lg transition-transform group-hover:scale-110`}>
                <svc.icon className="size-7 text-[#FFD54F]" />
              </div>
              <span className="font-semibold text-sm text-[#0A1F44]">{svc.label}</span>
              <span className="flex items-center gap-1 text-xs text-[#0A1F44]/70 font-medium group-hover:gap-2 transition-all">
                Explore <ArrowRight className="size-3" />
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

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
  { icon: Droplets, color: 'from-blue-400 to-cyan-400', label: 'Plumbing' },
  { icon: Zap, color: 'from-cyan-400 to-yellow-400', label: 'Electrical' },
  { icon: Wind, color: 'from-teal-400 to-emerald-400', label: 'AC & HVAC' },
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
      title: 'Favorite Providers',
      value: 0,
      icon: Heart,
      gradient: 'from-pink-400 to-rose-500',
      bgGlow: 'bg-pink-500/10',
    },
    {
      title: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-cyan-400 to-blue-500',
      bgGlow: 'bg-sky-500/10',
    },
  ];

  const quickActions = [
    { icon: Briefcase, label: 'Book a Service', nav: 'categories', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    { icon: CalendarCheck, label: 'My Bookings', nav: 'client-bookings', gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/25' },
    { icon: Heart, label: 'Favorites', nav: 'client-favorites', gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/25' },
    { icon: User, label: 'My Profile', nav: 'client-profile', gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/25' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-200" />
              <span className="text-sm font-medium text-emerald-100">Welcome back</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {user?.name?.split(' ')[0] || 'Client'} 👋
            </h1>
            <p className="mt-1 text-emerald-100/80">Here&apos;s an overview of your activity</p>
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
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
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
                  {[1, 2].map((i) => (
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

      {/* Recommended Services */}
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
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  ArrowLeft,
  Building2,
  Activity,
  Clock,
  Star,
  MapPin,
  Wrench,
} from 'lucide-react';

interface VendorSummary {
  id: string;
  name: string;
  specialization?: string;
  status: string;
  totalBookings: number;
  rating: number;
}

interface BookingSummary {
  id: string;
  clientName: string;
  serviceName: string;
  status: string;
  amount: number;
  scheduledDate: string;
}

interface FranchiseStats {
  totalVendors: number;
  activeVendors: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string }> = {
    PENDING: { className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    CONFIRMED: { className: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { className: 'bg-sky-50 text-sky-700 border-sky-200' },
    COMPLETED: { className: 'bg-green-50 text-green-700 border-green-200' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200' },
    ACTIVE: { className: 'bg-green-50 text-green-700 border-green-200' },
    INACTIVE: { className: 'bg-gray-50 text-gray-600 border-gray-200' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} text-xs font-semibold`}>
      {status}
    </Badge>
  );
}

export function FranchiseDashboardPage() {
  const { user } = useAuth();
  const { goBack } = useApp();
  const { data: statsData, loading: statsLoading } = useApi<FranchiseStats>('/api/franchise/stats');
  const { data: vendorsData, loading: vendorsLoading } = useApi<VendorSummary[]>('/api/franchise/vendors');
  const { data: bookingsData, loading: bookingsLoading } = useApi<BookingSummary[]>('/api/franchise/bookings');

  const stats = statsData || {
    totalVendors: 0,
    activeVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
  };

  const recentVendors = (Array.isArray(vendorsData) ? vendorsData : []).slice(0, 5);
  const recentBookings = (Array.isArray(bookingsData) ? bookingsData : []).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0a1628] sm:text-3xl">Franchise Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your franchise operations & track performance</p>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] p-6 sm:p-8"
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-sky-300" />
              <span className="text-sm font-medium text-sky-200">Franchise Owner</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {user?.name?.split(' ')[0] || 'Franchise'} 👋
            </h2>
            <p className="mt-1 text-sky-100/80">Your franchise at a glance</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="border-l-4 border-l-[#2d5a8e] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">Total Vendors</p>
                  <p className="mt-1 text-2xl font-bold">
                    {statsLoading ? <Skeleton className="h-7 w-12" /> : stats.totalVendors}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0a1628]/10 p-2.5 text-[#2d5a8e]">
                  <Users className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">Active Vendors</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {statsLoading ? <Skeleton className="h-7 w-12" /> : stats.activeVendors}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                  <Activity className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#1e3a5f] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">Total Bookings</p>
                  <p className="mt-1 text-2xl font-bold">
                    {statsLoading ? <Skeleton className="h-7 w-12" /> : stats.totalBookings}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0a1628]/10 p-2.5 text-[#1e3a5f]">
                  <CalendarCheck className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">Total Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {statsLoading ? <Skeleton className="h-7 w-16" /> : `₹${stats.totalRevenue.toLocaleString()}`}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                  <IndianRupee className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">
                    {statsLoading ? <Skeleton className="h-7 w-8" /> : stats.pendingBookings}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                  <Clock className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-teal-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="mt-1 text-2xl font-bold text-teal-700">
                    {statsLoading ? <Skeleton className="h-7 w-8" /> : stats.completedBookings}
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
                  <TrendingUp className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Two column layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Vendors */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <Users className="size-5 text-sky-300" />
                Recent Vendors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {vendorsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : recentVendors.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No vendors yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-sky-50/30"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md">
                        <Wrench className="size-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.specialization || 'General'} &middot; {vendor.totalBookings} bookings
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={vendor.status} />
                        <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
                <CalendarCheck className="size-5 text-[#2d5a8e]" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarCheck className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-sky-50/30"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md">
                        <CalendarCheck className="size-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{booking.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.serviceName} &middot; {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={booking.status} />
                        <span className="text-xs font-semibold text-[#2d5a8e]">₹{booking.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Franchise Coverage */}
      <div className="mt-6">
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
                <MapPin className="size-5 text-[#2d5a8e]" />
                Franchise Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-sky-50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Franchise Zone</p>
                  <p className="mt-1 text-lg font-bold text-[#0a1628]">{user?.city || 'Not Assigned'}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Active Status</p>
                  <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">Active</Badge>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Commission Rate</p>
                  <p className="mt-1 text-lg font-bold text-amber-700">5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

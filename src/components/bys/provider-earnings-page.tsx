'use client';

import { motion } from 'framer-motion';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/separator';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, TrendingUp, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  finalPrice: number;
  basePrice: number;
  providerEarnings: number;
  platformFee: number;
  service: { id: string; title: string };
  client: { id: string; name: string };
  createdAt: string;
}

interface BookingResponse {
  bookings: Booking[];
  pagination: { total: number };
}

export function ProviderEarningsPage() {
  const { data, loading } = useApi<BookingResponse>('/api/bookings?limit=100');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/50" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  const bookings = data?.bookings || [];
  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completed.reduce((s, b) => s + (b.providerEarnings || 0), 0);
  const pendingPayout = bookings
    .filter((b) => b.status === 'IN_PROGRESS')
    .reduce((s, b) => s + (b.providerEarnings || 0), 0);

  const now = new Date();
  const thisMonth = completed.filter((b) => {
    const d = new Date(b.scheduledDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarnings = thisMonth.reduce((s, b) => s + (b.providerEarnings || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your revenue and payouts</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-400 to-teal-500', bgGlow: 'bg-emerald-500/10' },
          { label: 'Pending Payout', value: `₹${pendingPayout.toLocaleString()}`, icon: Clock, gradient: 'from-orange-400 to-amber-500', bgGlow: 'bg-orange-500/10' },
          { label: 'This Month', value: `₹${thisMonthEarnings.toLocaleString()}`, icon: TrendingUp, gradient: 'from-sky-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-2xl font-bold text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="size-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Completed Bookings', value: completed.length },
          { label: 'This Month Bookings', value: thisMonth.length },
          { label: 'Avg. Earning/Booking', value: `₹${completed.length ? Math.round(totalEarnings / completed.length).toLocaleString() : 0}` },
          { label: 'Platform Fees Paid', value: `₹${completed.reduce((s, b) => s + (b.platformFee || 0), 0).toLocaleString()}` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
            <CardTitle className="text-lg font-semibold">Earnings History</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {completed.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="size-8 text-emerald-300" />
                </div>
                <p className="mt-3 text-muted-foreground">No completed bookings yet</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                {completed.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b p-4 last:border-0 transition-colors hover:bg-emerald-50/30">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{booking.service?.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        #{booking.bookingNumber} &middot; {booking.client?.name} &middot; {booking.scheduledDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600 flex items-center gap-1">
                        <ArrowUpRight className="size-3.5" />
                        +₹{booking.providerEarnings?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">of ₹{booking.finalPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Wallet,
  ArrowUpRight,
  Banknote,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';

/* ---------- types ---------- */
interface EarningsData {
  today: number;
  week: number;
  month: number;
  allTime: number;
  weeklyBreakdown: { day: string; amount: number }[];
  recentTransactions: {
    id: string;
    bookingNumber: string;
    serviceTitle: string;
    amount: number;
    platformFee: number;
    netEarning: number;
    date: string;
    status: string;
    clientName?: string;
  }[];
}

/* ---------- animation ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ==================== MAIN COMPONENT ==================== */
export function TechnicianEarningsPage() {
  const { navigate } = useApp();
  const { data, loading } = useApi<EarningsData>('/api/technician/earnings');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/50" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  const earnings = data || {
    today: 0,
    week: 0,
    month: 0,
    allTime: 0,
    weeklyBreakdown: DAYS_ORDER.map((d) => ({ day: d, amount: 0 })),
    recentTransactions: [],
  };

  const weeklyBreakdown = earnings.weeklyBreakdown?.length > 0
    ? earnings.weeklyBreakdown
    : DAYS_ORDER.map((d) => ({ day: d, amount: 0 }));

  const maxChartValue = Math.max(...weeklyBreakdown.map((d) => d.amount), 1);

  const recentTransactions = earnings.recentTransactions || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-sm text-muted-foreground">Track your earnings and payment history</p>
        </div>
        <Button
          className="self-start rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
          onClick={() => navigate('provider-wallet')}
        >
          <Banknote className="mr-2 size-4" />
          Withdraw Funds
        </Button>
      </motion.div>

      {/* Earnings Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Today', value: earnings.today, icon: Zap, gradient: 'from-emerald-400 to-teal-500', bgGlow: 'bg-emerald-500/10' },
          { label: 'This Week', value: earnings.week, icon: Calendar, gradient: 'from-sky-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
          { label: 'This Month', value: earnings.month, icon: TrendingUp, gradient: 'from-amber-400 to-blue-500', bgGlow: 'bg-amber-500/10' },
          { label: 'All Time', value: earnings.allTime, icon: DollarSign, gradient: 'from-violet-400 to-purple-500', bgGlow: 'bg-violet-500/10' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-xl sm:text-2xl font-bold text-transparent`}>
                    ₹{stat.value?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
                  <stat.icon className="size-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Weekly Earnings</CardTitle>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                This Week
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height: '200px' }}>
              {weeklyBreakdown.map((day, idx) => {
                const barHeight = maxChartValue > 0 ? (day.amount / maxChartValue) * 100 : 0;
                const isToday = new Date().getDay() === (idx + 1) % 7;
                return (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      ₹{day.amount > 999 ? `${(day.amount / 1000).toFixed(1)}k` : day.amount}
                    </span>
                    <div className="relative w-full flex justify-center" style={{ height: '140px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(barHeight, 4)}%` }}
                        transition={{ delay: idx * 0.08, duration: 0.5, ease: 'easeOut' }}
                        className={`w-full max-w-[48px] rounded-t-lg ${
                          isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/25'
                            : 'bg-gradient-to-t from-emerald-300/60 to-teal-200/60'
                        }`}
                        style={{ position: 'absolute', bottom: 0 }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-emerald-700 font-bold' : 'text-muted-foreground'}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Avg. Per Job', value: `₹${recentTransactions.length ? Math.round(recentTransactions.reduce((s, t) => s + t.netEarning, 0) / recentTransactions.length).toLocaleString('en-IN') : '0'}` },
          { label: 'Platform Fees', value: `₹${recentTransactions.reduce((s, t) => s + (t.platformFee || 0), 0).toLocaleString('en-IN')}` },
          { label: 'Jobs Completed', value: recentTransactions.length.toString() },
          { label: 'Pending Payout', value: `₹${recentTransactions.filter((t) => t.status === 'PENDING').reduce((s, t) => s + t.netEarning, 0).toLocaleString('en-IN')}` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Earnings</CardTitle>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                View All <ArrowRight className="ml-1 size-3" />
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="size-8 text-emerald-300" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No earnings yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Complete jobs to start earning
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  size="sm"
                  onClick={() => navigate('technician-jobs')}
                >
                  View Available Jobs
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                {recentTransactions.map((tx, idx) => {
                  const isCompleted = tx.status === 'COMPLETED' || tx.status === 'PAID';
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group flex items-center gap-4 border-b p-4 last:border-0 transition-colors hover:bg-emerald-50/30"
                    >
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-br from-amber-400 to-blue-500'
                      }`}>
                        <Briefcase className="size-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{tx.serviceTitle || 'Service'}</p>
                          <Badge
                            variant="outline"
                            className={`shrink-0 gap-1 text-[10px] font-semibold ${
                              isCompleted
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>#{tx.bookingNumber}</span>
                          {tx.clientName && (
                            <>
                              <span>·</span>
                              <span>{tx.clientName}</span>
                            </>
                          )}
                          <span>·</span>
                          <Clock className="size-3" />
                          <span>
                            {new Date(tx.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <ArrowUpRight className="size-3.5" />
                          +₹{tx.netEarning?.toLocaleString('en-IN')}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          of ₹{tx.amount?.toLocaleString('en-IN')} · Fee ₹{tx.platformFee?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdraw CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Wallet className="size-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Ready to Withdraw?</h3>
                <p className="text-sm text-emerald-100">Transfer your earnings to your bank account or UPI</p>
              </div>
            </div>
            <Button
              className="shrink-0 rounded-xl bg-white text-emerald-700 font-semibold shadow-lg hover:bg-emerald-50"
              onClick={() => navigate('provider-wallet')}
            >
              <Banknote className="mr-2 size-4" />
              Go to Wallet
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

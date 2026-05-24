'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Users,
  UserPlus,
  IndianRupee,
  TrendingUp,
  MessageCircle,
  Briefcase,
  CalendarDays,
  ArrowLeft,
  Zap,
  Shield,
  BarChart3,
  Eye,
  Plus,
  Wrench,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function AnimatedProgress({ value, color = 'bg-sky-400' }: { value: number; color?: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[#0a1628]/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function ReferralStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-400' },
    REGISTERED: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-400' },
    ACTIVE: { className: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-400' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400' },
    EXPIRED: { className: 'bg-gray-50 text-gray-500 border-gray-200', dotColor: 'bg-gray-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status}
    </Badge>
  );
}

interface ServiceArea {
  id: string;
  city: string;
  pincode: string;
  isActive: boolean;
  providerCount: number;
  customerCount: number;
  targetProviders: number;
  targetCustomers: number;
  radiusKm: number;
  latitude: number;
  longitude: number;
  providerProgress: number;
  customerProgress: number;
  overallProgress: number;
  areaManager?: {
    id: string;
    status: string;
    user: { id: string; name: string; profileImageUrl?: string };
  };
}

interface Referral {
  id: string;
  referralCode: string;
  referralType: string;
  status: string;
  referredName?: string;
  totalEarnings: number;
  createdAt: string;
}

interface CommissionSummary {
  totalEarnings: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  totalCount: number;
}

export function AreaManagerDashboardPage() {
  const { user } = useAuth();
  const { navigate, goBack } = useApp();
  const { data: areasData, loading: areasLoading } = useApi<ServiceArea[]>('/api/service-areas');
  const { data: referralsData, loading: referralsLoading } = useApi<Referral[]>('/api/referrals');
  const { data: commissionsData, loading: commissionsLoading } = useApi<{ summary: CommissionSummary }>('/api/commissions');

  // Find the area assigned to this manager (or default to first active area)
  const myArea = areasData?.find((a) => a.areaManager?.user?.id === user?.id) || areasData?.find((a) => a.isActive) || areasData?.[0];
  const recentReferrals = (referralsData || []).slice(0, 5);
  const commissionSummary = commissionsData?.summary;

  const providerTarget = myArea?.targetProviders || 20;
  const customerTarget = myArea?.targetCustomers || 100;
  const providerCount = myArea?.providerCount || 0;
  const customerCount = myArea?.customerCount || 0;
  const providerPercent = Math.min(100, Math.round((providerCount / providerTarget) * 100));
  const customerPercent = Math.min(100, Math.round((customerCount / customerTarget) * 100));

  const handleWhatsAppProvider = useCallback(() => {
    const message = `Hey! 🛠️ BookYourService pe Provider bano! Apni service offer karo - AC repair, plumbing, electrical, aur bahut kuch. Aaj hi join karo aur customers paao! Sign up: https://bookyourservice.app/register`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0a1628] sm:text-3xl">Area Manager Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your area & track activation progress</p>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-sky-300" />
              <span className="text-sm font-medium text-sky-200">Area Manager</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {user?.name?.split(' ')[0] || 'Manager'} 👋
            </h2>
            <p className="mt-1 text-sky-100/80">
              {myArea ? `${myArea.city} area` : 'Loading area details...'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 border border-white/20"
              onClick={handleWhatsAppProvider}
            >
              <MessageCircle className="mr-2 size-4" />
              Refer Provider
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate('register' as Page)}
            >
              <Plus className="mr-2 size-4" />
              Add Provider
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Area Overview + Activation Meter */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Area Overview */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin className="size-5 text-sky-300" />
                Area Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {areasLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ) : myArea ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#0a1628]/5">
                      <MapPin className="size-6 text-[#2d5a8e]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0a1628]">{myArea.city}</h3>
                      <p className="text-sm text-muted-foreground">
                        {myArea.pincode || 'All pincodes'} &middot; {myArea.radiusKm}km radius
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-sky-50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className={`mt-1 ${myArea.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {myArea.isActive ? 'Active' : 'Not Active'}
                      </Badge>
                    </div>
                    <div className="rounded-xl bg-sky-50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Activation</p>
                      <p className="mt-1 text-lg font-bold text-[#0a1628]">{myArea.overallProgress}%</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#0a1628]/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commission Rate</span>
                      <span className="font-bold text-[#1e3a5f]">3%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MapPin className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No area assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activation Meter */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
                <Zap className="size-5 text-[#2d5a8e]" />
                Activation Meter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {areasLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Provider Activation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="size-4 text-sky-400" />
                        <span className="text-sm font-medium text-[#0a1628]">Providers</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e3a5f]">
                        {providerCount}/{providerTarget}
                      </span>
                    </div>
                    <AnimatedProgress value={providerPercent} color="bg-gradient-to-r from-[#1e3a5f] to-sky-400" />
                    <p className="text-xs text-muted-foreground">
                      {providerPercent}% activated &middot; {providerTarget - providerCount} more needed
                    </p>
                  </div>

                  {/* Customer Activation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-emerald-400" />
                        <span className="text-sm font-medium text-[#0a1628]">Customers</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e3a5f]">
                        {customerCount}/{customerTarget}
                      </span>
                    </div>
                    <AnimatedProgress value={customerPercent} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
                    <p className="text-xs text-muted-foreground">
                      {customerPercent}% activated &middot; {customerTarget - customerCount} more needed
                    </p>
                  </div>

                  {/* Overall Progress */}
                  <div className="rounded-xl bg-[#0a1628] p-4 text-center">
                    <p className="text-xs text-sky-300">Overall Activation</p>
                    <p className="mt-1 text-3xl font-bold text-white">{myArea?.overallProgress || 0}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Commission Balance + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Commission Balance */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <IndianRupee className="size-5 text-sky-300" />
                Commission Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {commissionsLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-[#0a1628]/5 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="mt-1 text-2xl font-bold text-[#0a1628]">
                      ₹{(commissionSummary?.pendingAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="mt-1 text-2xl font-bold text-green-700">
                      ₹{(commissionSummary?.totalEarnings || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-sky-50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Commission Rate</p>
                    <p className="mt-1 text-2xl font-bold text-[#1e3a5f]">3%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
              <CardTitle className="text-lg font-semibold text-[#0a1628]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <Button
                onClick={handleWhatsAppProvider}
                className="w-full justify-start gap-3 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
              >
                <MessageCircle className="size-4" />
                Refer Provider via WhatsApp
              </Button>
              <Button
                onClick={() => navigate('register' as Page)}
                className="w-full justify-start gap-3 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/20"
              >
                <Plus className="size-4" />
                Add Provider
              </Button>
              <Button
                onClick={() => navigate('client-commissions' as Page)}
                variant="outline"
                className="w-full justify-start gap-3 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-sky-50 hover:text-[#0a1628]"
              >
                <Eye className="size-4" />
                View Earnings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Referrals + Area Stats */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Referrals */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
                <UserPlus className="size-5 text-[#2d5a8e]" />
                Recent Referrals
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('client-referrals' as Page)}
                className="text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {referralsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : recentReferrals.length === 0 ? (
                <div className="py-8 text-center">
                  <UserPlus className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No referrals in your area yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReferrals.map((ref, idx) => (
                    <motion.div
                      key={ref.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-all hover:border-sky-100 hover:bg-sky-50/30"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md shadow-[#1e3a5f]/20">
                        <Users className="size-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {ref.referredName || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ref.referralType} &middot;{' '}
                          {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <ReferralStatusBadge status={ref.status} />
                        <span className="text-xs font-medium text-[#2d5a8e]">₹{ref.totalEarnings.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Area Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <BarChart3 className="size-5 text-sky-300" />
                Area Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {areasLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]">
                      <Wrench className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Providers</p>
                      <p className="text-lg font-bold text-[#0a1628]">{providerCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Users className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Customers</p>
                      <p className="text-lg font-bold text-[#0a1628]">{customerCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a1628]/5 p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0a1628] to-[#1e3a5f]">
                      <CalendarDays className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bookings in Area</p>
                      <p className="text-lg font-bold text-[#0a1628]">{(providerCount * customerCount) > 0 ? Math.round(providerCount * customerCount * 0.3) : 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

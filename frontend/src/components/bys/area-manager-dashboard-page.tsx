import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin,
  Users,
  UserPlus,
  TrendingUp,
  MessageCircle,
  CalendarDays,
  ArrowLeft,
  Zap,
  Shield,
  BarChart3,
  Eye,
  Plus,
  Wrench,
  IndianRupee,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
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
  overallProgress: number;
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

  const myArea = areasData?.find(() => true) || areasData?.[0];
  const recentReferrals = (referralsData || []).slice(0, 5);
  const commissionSummary = commissionsData?.summary;

  const providerTarget = myArea?.targetProviders || 20;
  const customerTarget = myArea?.targetCustomers || 100;
  const providerCount = myArea?.providerCount || 0;
  const customerCount = myArea?.customerCount || 0;
  const providerPercent = Math.min(100, Math.round((providerCount / providerTarget) * 100));
  const customerPercent = Math.min(100, Math.round((customerCount / customerTarget) * 100));

  const handleWhatsAppProvider = useCallback(() => {
    const message = `Hey! 🛠️ BookYourService pe Provider bano! Apni service offer karo - AC repair, plumbing, electrical, aur bahut kuch. Aaj hi join karo aur customers paao!`;
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

      {/* Commission Balance */}
      <div className="mt-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
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
      </div>

      {/* Recent Referrals */}
      <div className="mt-6">
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
                <UserPlus className="size-5 text-[#2d5a8e]" />
                Recent Referrals
              </CardTitle>
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
                  <p className="mt-2 text-sm text-muted-foreground">No referrals yet. Start referring providers!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReferrals.map((ref, idx) => (
                    <motion.div
                      key={ref.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-sky-50/30"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md">
                        <Users className="size-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{ref.referredName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {ref.referralType} &middot; {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
      </div>
    </div>
  );
}

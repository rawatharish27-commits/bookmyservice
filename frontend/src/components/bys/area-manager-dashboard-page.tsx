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

function AnimatedProgress({ value, color = 'bg-[#E0B84C]' }: { value: number; color?: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[#0A1F44]/10">
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
    REGISTERED: { className: 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/20', dotColor: 'bg-[#FFD54F]' },
    ACTIVE: { className: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-400' },
    COMPLETED: { className: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', dotColor: 'bg-[#FFD54F]' },
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
  managerId?: string;
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
  rate?: number;
}

export function AreaManagerDashboardPage() {
  const { user } = useAuth();
  const { navigate, goBack } = useApp();
  const { data: areasData, loading: areasLoading } = useApi<ServiceArea[]>('/api/service-areas');
  const { data: referralsData, loading: referralsLoading } = useApi<Referral[]>('/api/referrals');
  const { data: commissionsData, loading: commissionsLoading } = useApi<{ summary: CommissionSummary }>('/api/commissions');

  const myArea = areasData?.find((a: any) => a.managerId === user?.id) || areasData?.[0];
  const recentReferrals = (Array.isArray(referralsData) ? referralsData : []).slice(0, 5);
  // Handle different possible API response shapes for commissions
  const commissionSummary = commissionsData?.summary ||
    (Array.isArray(commissionsData) ? { totalCommission: commissionsData.reduce((sum: number, c: any) => sum + (c.totalCommission || 0), 0), totalEarnings: commissionsData.reduce((sum: number, c: any) => sum + (c.totalEarnings || c.totalCommission || 0), 0), pendingAmount: commissionsData.reduce((sum: number, c: any) => sum + (c.pendingAmount || 0), 0), approvedAmount: commissionsData.reduce((sum: number, c: any) => sum + (c.approvedAmount || 0), 0), paidAmount: commissionsData.reduce((sum: number, c: any) => sum + (c.paidAmount || 0), 0), totalCount: commissionsData.length, rate: undefined as number | undefined } : undefined);

  const providerTarget = myArea?.targetProviders || 20;
  const customerTarget = myArea?.targetCustomers || 100;
  const providerCount = myArea?.providerCount || 0;
  const customerCount = myArea?.customerCount || 0;
  const providerPercent = Math.min(100, Math.round((providerCount / providerTarget) * 100));
  const customerPercent = Math.min(100, Math.round((customerCount / customerTarget) * 100));

  const handleWhatsAppProvider = useCallback(() => {
    const message = user?.referralCode
      ? `Hi! I'm inviting you to join BookYourService as a service provider. Use my referral code: ${user.referralCode}\nVisit: https://bookyourservice.co.in/?ref=${user.referralCode}`
      : 'Hi! Join BookYourService as a service provider. Visit: https://bookyourservice.co.in';
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }, [user?.referralCode]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#FFD54F] hover:text-[#132D5E] hover:bg-[#FFD54F]/5">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0A1F44] sm:text-3xl">Area Manager Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your area & track activation progress</p>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F] p-6 sm:p-8"
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-[#FFD54F]" />
              <span className="text-sm font-medium text-[#F2C94C]">Area Manager</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {user?.name?.split(' ')[0] || 'Manager'} 👋
            </h2>
            <p className="mt-1 text-[#F2C94C]/80">
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
            <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#132D5E] pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin className="size-5 text-[#FFD54F]" />
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
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#0A1F44]/5">
                      <MapPin className="size-6 text-[#FFD54F]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1F44]">{myArea.city}</h3>
                      <p className="text-sm text-muted-foreground">
                        {myArea.pincode || 'All pincodes'} &middot; {myArea.radiusKm}km radius
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#FFD54F]/5 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className={`mt-1 ${myArea.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {myArea.isActive ? 'Active' : 'Not Active'}
                      </Badge>
                    </div>
                    <div className="rounded-xl bg-[#FFD54F]/5 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Activation</p>
                      <p className="mt-1 text-lg font-bold text-[#0A1F44]">{myArea.overallProgress}%</p>
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
            <CardHeader className="bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0A1F44]">
                <Zap className="size-5 text-[#FFD54F]" />
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
                        <Wrench className="size-4 text-[#E0B84C]" />
                        <span className="text-sm font-medium text-[#0A1F44]">Providers</span>
                      </div>
                      <span className="text-sm font-bold text-[#132D5E]">
                        {providerCount}/{providerTarget}
                      </span>
                    </div>
                    <AnimatedProgress value={providerPercent} color="bg-gradient-to-r from-[#132D5E] to-[#E0B84C]" />
                    <p className="text-xs text-muted-foreground">
                      {providerPercent}% activated &middot; {providerTarget - providerCount} more needed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-[#FFD54F]" />
                        <span className="text-sm font-medium text-[#0A1F44]">Customers</span>
                      </div>
                      <span className="text-sm font-bold text-[#132D5E]">
                        {customerCount}/{customerTarget}
                      </span>
                    </div>
                    <AnimatedProgress value={customerPercent} color="bg-gradient-to-r from-[#E0B84C] to-[#FFD54F]" />
                    <p className="text-xs text-muted-foreground">
                      {customerPercent}% activated &middot; {customerTarget - customerCount} more needed
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0A1F44] p-4 text-center">
                    <p className="text-xs text-[#FFD54F]">Overall Activation</p>
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
            <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#132D5E] pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <IndianRupee className="size-5 text-[#FFD54F]" />
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
                  <div className="rounded-xl bg-[#0A1F44]/5 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="mt-1 text-2xl font-bold text-[#0A1F44]">
                      ₹{(commissionSummary?.pendingAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="mt-1 text-2xl font-bold text-green-700">
                      ₹{(commissionSummary?.totalEarnings || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFD54F]/5 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Commission Rate</p>
                    <p className="mt-1 text-2xl font-bold text-[#132D5E]">{commissionSummary?.rate || '3'}%</p>
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
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0A1F44]">
                <UserPlus className="size-5 text-[#FFD54F]" />
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
                      className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-[#FFD54F]/5/30"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#132D5E] to-[#FFD54F] shadow-md">
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
                        <span className="text-xs font-medium text-[#FFD54F]">₹{ref.totalEarnings.toLocaleString()}</span>
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

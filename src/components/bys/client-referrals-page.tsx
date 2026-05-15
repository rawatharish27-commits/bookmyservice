'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { apiUrl } from '@/lib/api-url';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Plus,
  Gift,
  TrendingUp,
  UserPlus,
  IndianRupee,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Zap,
  UserCheck,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
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

interface Referral {
  id: string;
  referralCode: string;
  referralType: string;
  source: string;
  status: string;
  referredName?: string;
  referredEmail?: string;
  referredPhone?: string;
  commissionRate: number;
  totalEarnings: number;
  totalBookings: number;
  expiresAt: string;
  createdAt: string;
  referredUser?: { id: string; name: string; email: string; phone: string; profileImageUrl?: string };
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  registeredReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  expiredReferrals: number;
  totalEarnings: number;
  totalBookings: number;
  providerReferrals: number;
  customerReferrals: number;
  areaManagerReferrals: number;
  bySource: Record<string, number>;
  totalCommissionEarned: number;
  pendingCommission: number;
  paidCommission: number;
  defaultCommissionRate: number;
}

export function ClientReferralsPage() {
  const { user } = useAuth();
  const { navigate, goBack } = useApp();
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useApi<ReferralStats>('/api/referrals/stats');
  const { data: referralsData, loading: referralsLoading, refetch: refetchReferrals } = useApi<Referral[]>('/api/referrals');
  const { mutate: createReferral, loading: creating } = useApiMutation();

  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    referredName: '',
    referredPhone: '',
    referredEmail: '',
    referralType: 'PROVIDER',
  });

  const stats = statsData;
  const referrals = referralsData || [];

  const referralCode = user?.referralCode || 'BYREF' + (user?.id?.slice(0, 6) || '000000').toUpperCase();

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [referralCode]);

  const handleWhatsAppShare = useCallback(() => {
    const message = `Hey! 🎉 BookYourService pe join karo! Best home service app hai - AC repair, plumbing, electrical, sab kuch ek click mein. Mera referral code use karo: *${referralCode}* aur special discount pao! Download karo ab: https://bookyourservice.app`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [referralCode]);

  const handleCreateReferral = useCallback(async () => {
    try {
      await createReferral(apiUrl('/api/referrals'), {
        method: 'POST',
        body: JSON.stringify({
          referredName: formData.referredName,
          referredPhone: formData.referredPhone,
          referredEmail: formData.referredEmail,
          referralType: formData.referralType,
          source: 'WEBSITE',
        }),
      });
      setDialogOpen(false);
      setFormData({ referredName: '', referredPhone: '', referredEmail: '', referralType: 'PROVIDER' });
      refetchStats();
      refetchReferrals();
    } catch (err) {
      console.error('Failed to create referral:', err);
    }
  }, [createReferral, formData, refetchStats, refetchReferrals]);

  const statCards = [
    {
      title: 'Total Referrals',
      value: stats?.totalReferrals || 0,
      icon: Users,
      gradient: 'from-[#1e3a5f] to-[#2d5a8e]',
      bgGlow: 'bg-sky-500/10',
    },
    {
      title: 'Active',
      value: stats?.activeReferrals || 0,
      icon: Zap,
      gradient: 'from-green-500 to-emerald-600',
      bgGlow: 'bg-green-500/10',
    },
    {
      title: 'Registered',
      value: stats?.registeredReferrals || 0,
      icon: UserCheck,
      gradient: 'from-sky-400 to-blue-500',
      bgGlow: 'bg-sky-400/10',
    },
    {
      title: 'Earnings',
      value: stats?.totalCommissionEarned || 0,
      icon: IndianRupee,
      gradient: 'from-[#1e3a5f] to-sky-500',
      bgGlow: 'bg-sky-300/10',
      isCurrency: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0a1628] sm:text-3xl">Referral Program</h1>
        <p className="mt-1 text-sm text-muted-foreground">Refer friends & earn commissions on every booking</p>
      </motion.div>

      {/* Referral Stats Cards */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">
                    {statsLoading ? (
                      <Skeleton className="inline-block h-7 w-12" />
                    ) : stat.isCurrency ? (
                      <>₹<AnimatedCounter value={stat.value} /></>
                    ) : (
                      <AnimatedCounter value={stat.value} />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Referral Code + Share */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gift className="size-5 text-[#2d5a8e]" />
                  <h3 className="font-semibold text-[#0a1628]">Your Referral Code</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-[#0a1628] px-5 py-3">
                    <span className="font-mono text-lg font-bold tracking-wider text-sky-300">{referralCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="ml-2 rounded-lg p-1.5 transition-colors hover:bg-white/10"
                      aria-label="Copy referral code"
                    >
                      {copied ? (
                        <Check className="size-4 text-green-400" />
                      ) : (
                        <Copy className="size-4 text-sky-300" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with friends. They get discount & you earn commission!
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleWhatsAppShare}
                  className="gap-2 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp Share
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/25 hover:shadow-xl">
                      <Plus className="size-4" />
                      Add Referral
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-[#0a1628]">Create Referral</DialogTitle>
                      <DialogDescription>Manually add someone to your referral network</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="ref-name">Name</Label>
                        <Input
                          id="ref-name"
                          placeholder="Friend ka naam"
                          value={formData.referredName}
                          onChange={(e) => setFormData((p) => ({ ...p, referredName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ref-phone">Phone</Label>
                        <Input
                          id="ref-phone"
                          placeholder="+91 9876543210"
                          value={formData.referredPhone}
                          onChange={(e) => setFormData((p) => ({ ...p, referredPhone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ref-email">Email</Label>
                        <Input
                          id="ref-email"
                          type="email"
                          placeholder="friend@email.com"
                          value={formData.referredEmail}
                          onChange={(e) => setFormData((p) => ({ ...p, referredEmail: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Referral Type</Label>
                        <Select
                          value={formData.referralType}
                          onValueChange={(val) => setFormData((p) => ({ ...p, referralType: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROVIDER">Provider</SelectItem>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="AREA_MANAGER">Area Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button
                        onClick={handleCreateReferral}
                        disabled={creating || (!formData.referredName && !formData.referredPhone && !formData.referredEmail)}
                        className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white"
                      >
                        {creating ? 'Creating...' : 'Create Referral'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission Summary */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
              <IndianRupee className="size-5 text-sky-300" />
              Commission Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#0a1628]/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="mt-1 text-xl font-bold text-[#0a1628]">₹{(stats?.totalCommissionEarned || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-yellow-50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="mt-1 text-xl font-bold text-yellow-700">₹{(stats?.pendingCommission || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 text-xl font-bold text-green-700">₹{(stats?.paidCommission || 0).toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral List */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
              <UserPlus className="size-5 text-[#2d5a8e]" />
              Your Referrals
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('client-commissions' as Page)}
              className="text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50"
            >
              <IndianRupee className="mr-1 size-4" /> View Earnings
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {referralsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#0a1628]/5">
                  <Users className="size-8 text-[#2d5a8e]/40" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No referrals yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Start referring friends and earn commissions!</p>
                <Button
                  className="mt-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/25"
                  size="sm"
                  onClick={handleWhatsAppShare}
                >
                  <MessageCircle className="mr-2 size-4" />
                  Share on WhatsApp
                </Button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {referrals.map((ref, idx) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex items-center gap-4 rounded-xl border border-transparent p-4 transition-all hover:border-sky-100 hover:bg-sky-50/30 hover:shadow-sm"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md shadow-[#1e3a5f]/20">
                      <Users className="size-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {ref.referredUser?.name || ref.referredName || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ref.referredEmail || ref.referredPhone || 'No contact info'} &middot;{' '}
                        {ref.referralType}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <ReferralStatusBadge status={ref.status} />
                      <span className="text-xs font-medium text-[#2d5a8e]">
                        ₹{ref.totalEarnings.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

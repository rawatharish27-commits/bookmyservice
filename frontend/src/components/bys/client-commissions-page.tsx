import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IndianRupee,
  TrendingUp,
  Users,
  Gift,
  Copy,
  Share2,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CommissionSummary {
  totalEarnings: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  totalCount: number;
}

interface CommissionEntry {
  id: string;
  referralType: string;
  referredName?: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface CommissionsData {
  summary: CommissionSummary;
  entries: CommissionEntry[];
  referralCode: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ClientCommissionsPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data, loading } = useApi<CommissionsData>('/api/commissions');

  const summary = data?.summary || {
    totalEarnings: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    totalCount: 0,
  };

  const entries = data?.entries || [];
  const referralCode = data?.referralCode || user?.id?.slice(0, 8).toUpperCase() || 'BYS00000';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1628] sm:text-3xl">My Commissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your referral earnings and commission history</p>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="mb-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e]" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="size-5 text-[#2d5a8e]" />
                  <h2 className="text-lg font-bold text-[#0a1628]">Your Referral Code</h2>
                </div>
                <div className="flex items-center gap-3">
                  <code className="rounded-lg bg-[#0a1628]/5 px-4 py-2 text-lg font-bold tracking-widest text-[#1e3a5f]">
                    {referralCode}
                  </code>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={handleCopyCode}>
                    <Copy className="mr-1 size-3" /> Copy
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Share this code with providers and customers to earn commissions
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg rounded-xl"
                onClick={() => {
                  const msg = `Join BookYourService! Use my referral code ${referralCode} to sign up. 🛠️`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              >
                <Share2 className="mr-2 size-4" />
                Share Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission Summary Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Earned', value: summary.totalEarnings, icon: IndianRupee, gradient: 'from-emerald-500 to-teal-500', bgGlow: 'bg-emerald-500/10' },
            { label: 'Pending', value: summary.pendingAmount, icon: Clock, gradient: 'from-amber-500 to-yellow-500', bgGlow: 'bg-amber-500/10' },
            { label: 'Approved', value: summary.approvedAmount, icon: CheckCircle2, gradient: 'from-sky-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
            { label: 'Paid Out', value: summary.paidAmount, icon: DollarSign, gradient: 'from-violet-400 to-purple-500', bgGlow: 'bg-violet-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="glass group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
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
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mb-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
              <TrendingUp className="size-5 text-[#2d5a8e]" />
              How Commissions Work
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: '1', title: 'Refer', desc: 'Share your referral code with providers or customers via WhatsApp, SMS, or social media', icon: UserPlus },
                { step: '2', title: 'Earn', desc: 'When your referral signs up and completes their first booking, you earn a commission of 3%', icon: IndianRupee },
                { step: '3', title: 'Get Paid', desc: 'Commissions are approved monthly and transferred directly to your bank account or wallet', icon: DollarSign },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center rounded-xl bg-[#0a1628]/5 p-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md mb-3">
                    <item.icon className="size-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-[#0a1628]">{item.step}. {item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission History */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
              <IndianRupee className="size-4 text-sky-300" />
              Commission History
              <Badge className="ml-auto bg-sky-500/20 text-sky-200 border-0">
                {summary.totalCount} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sky-50">
                  <Users className="size-8 text-sky-300" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No commissions yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Start referring providers and customers to earn commissions
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg rounded-xl"
                  size="sm"
                  onClick={() => {
                    const msg = `Join BookYourService! Use my referral code ${referralCode} to sign up. 🛠️`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                >
                  <Share2 className="mr-2 size-3" />
                  Share Referral Code
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {entries.map((entry, idx) => {
                  const isPaid = entry.status === 'PAID' || entry.status === 'COMPLETED';
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-sky-50/30"
                    >
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md ${
                        isPaid
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                      }`}>
                        <IndianRupee className="size-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {entry.referredName || entry.referralType || 'Referral'}
                          </p>
                          <Badge
                            variant="outline"
                            className={`shrink-0 gap-1 text-[10px] font-semibold ${
                              isPaid
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isPaid ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-emerald-600">+₹{entry.amount?.toLocaleString('en-IN')}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

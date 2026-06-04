'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  CircleDot,
  Wallet,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  Banknote,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function CommissionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-400' },
    APPROVED: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    PAID: { className: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status}
    </Badge>
  );
}

function CommissionTypeBadge({ type }: { type: string }) {
  const config: Record<string, { className: string }> = {
    REFERRAL: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20' },
    AREA_MANAGER: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20' },
    PLATFORM: { className: 'bg-[#FFD54F]/10 text-emerald-700 border-[#0A1F44]/20' },
  };
  const c = config[type] || config.REFERRAL;
  return (
    <Badge variant="outline" className={`${c.className} gap-1 text-xs font-semibold`}>
      {type.replace('_', ' ')}
    </Badge>
  );
}

interface Commission {
  id: string;
  amount: number;
  rate: number;
  commissionType: string;
  status: string;
  description?: string;
  createdAt: string;
  referral?: {
    id: string;
    referralCode: string;
    referredName?: string;
    referredEmail?: string;
  };
}

interface CommissionsResponse {
  commissions: Commission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalEarnings: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    paidCount: number;
  };
}

export function ClientCommissionsPage() {
  const { user } = useAuth();
  const { goBack } = useApp();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '10');
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (typeFilter !== 'ALL') params.set('commissionType', typeFilter);
    return `/api/commissions?${params.toString()}`;
  }, [page, statusFilter, typeFilter]);

  const { data, loading, error } = useApi<CommissionsResponse>(buildUrl());

  const commissions = data?.commissions || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  const summaryCards = [
    {
      title: 'Total Earned',
      value: summary?.totalEarnings || 0,
      icon: IndianRupee,
      gradient: 'from-[#0A1F44] to-[#132D5E]',
      bgGlow: 'bg-[#0A1F44]/10',
      color: 'text-[#0A1F44]',
    },
    {
      title: 'Pending',
      value: summary?.pendingAmount || 0,
      icon: Clock,
      gradient: 'from-yellow-400 to-amber-500',
      bgGlow: 'bg-[#D4A017]/10',
      color: 'text-yellow-700',
    },
    {
      title: 'Approved',
      value: summary?.approvedAmount || 0,
      icon: CheckCircle2,
      gradient: '[#0A1F44] to-[#132D5E]',
      bgGlow: 'bg-[#0A1F44]/10',
      color: 'text-[#0A1F44]',
    },
    {
      title: 'Paid',
      value: summary?.paidAmount || 0,
      icon: Wallet,
      gradient: 'from-emerald-400 to-green-500',
      bgGlow: 'bg-[#0A1F44]/10',
      color: 'text-green-700',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#132D5E] hover:text-[#0A1F44] hover:bg-[#FFD54F]/10">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0A1F44] sm:text-3xl">Commissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your earnings from referrals & area management</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <motion.div key={card.title} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${card.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{card.title}</p>
                  <p className={`text-xl font-bold ${card.color}`}>
                    {loading ? (
                      <Skeleton className="inline-block h-7 w-16" />
                    ) : (
                      <>₹{card.value.toLocaleString()}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-[#132D5E]" />
                <span className="text-sm font-medium text-[#0A1F44]">Filters</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="AREA_MANAGER">Area Manager</SelectItem>
                    <SelectItem value="PLATFORM">Platform</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#0A1F44] pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
              <Banknote className="size-5 text-[#FFD54F]" />
              Commission History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-muted/50 p-4">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : commissions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#0A1F44]/5">
                  <IndianRupee className="size-8 text-[#132D5E]/40" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No commissions found</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {statusFilter !== 'ALL' || typeFilter !== 'ALL'
                    ? 'Try changing your filters'
                    : 'Start referring to earn commissions!'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-muted/50 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Booking/Referral</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Rate</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((commission, idx) => (
                        <motion.tr
                          key={commission.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b border-muted/30 transition-colors hover:bg-[#FFD54F]/10/30"
                        >
                          <TableCell className="py-3 text-sm">
                            {new Date(commission.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="py-3">
                            <CommissionTypeBadge type={commission.commissionType} />
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {commission.referral?.referredName || commission.referral?.referralCode || commission.description || '—'}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium">
                            {(commission.rate * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="py-3 text-sm font-bold text-[#0A1F44]">
                            ₹{commission.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3">
                            <CommissionStatusBadge status={commission.status} />
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-0 sm:hidden">
                  {commissions.map((commission, idx) => (
                    <motion.div
                      key={commission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-4 border-b border-muted/30 p-4"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] shadow-md shadow-[#0A1F44]/20">
                        <IndianRupee className="size-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {commission.referral?.referredName || commission.referral?.referralCode || 'Commission'}
                          </p>
                          <CommissionTypeBadge type={commission.commissionType} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(commission.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} &middot; Rate: {(commission.rate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-bold text-[#0A1F44]">₹{commission.amount.toLocaleString()}</span>
                        <CommissionStatusBadge status={commission.status} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="h-8 gap-1 border-[#0A1F44]/20 text-[#0A1F44]"
                      >
                        <ChevronLeft className="size-3" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-8 gap-1 border-[#0A1F44]/20 text-[#0A1F44]"
                      >
                        Next
                        <ChevronRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

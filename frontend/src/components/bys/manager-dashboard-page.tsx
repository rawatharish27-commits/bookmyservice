'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Users,
  CalendarCheck,
  IndianRupee,
  UserCheck,
  UserX,
  Wrench,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CityAnalytics {
  city: string;
  providers: number;
  bookings: number;
  revenue: number;
  growth: number;
}

interface PendingProvider {
  id: string;
  name: string;
  service: string;
  city: string;
  appliedAt: string;
}

interface ActiveTechnician {
  id: string;
  name: string;
  status: 'On Job' | 'Available' | 'Break' | 'Offline';
  currentJob: string;
  rating: number;
}

interface OpenComplaint {
  id: string;
  client: string;
  provider: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

interface RevenueTracking {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayouts: number;
  commissionEarned: number;
}

interface ManagerDashboardData {
  cityAnalytics: CityAnalytics;
  pendingProviders: PendingProvider[];
  activeTechnicians: ActiveTechnician[];
  openComplaints: OpenComplaint[];
  revenueTracking: RevenueTracking;
}

// ─── Empty Data (no mock data) ────────────────────────────────────────────────

const EMPTY_MANAGER_DATA: ManagerDashboardData = {
  cityAnalytics: {
    city: '—',
    providers: 0,
    bookings: 0,
    revenue: 0,
    growth: 0,
  },
  pendingProviders: [],
  activeTechnicians: [],
  openComplaints: [],
  revenueTracking: {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    pendingPayouts: 0,
    commissionEarned: 0,
  },
};

// ─── Helper Components ────────────────────────────────────────────────────────

function TechnicianStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    'On Job': { className: 'bg-[#1D63FF]/10 text-[#1D63FF] border-[#1D63FF]/20', dotColor: 'bg-[#7DB0FF]' },
    'Available': { className: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-400' },
    'Break': { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-400' },
    'Offline': { className: 'bg-gray-50 text-gray-500 border-gray-200', dotColor: 'bg-gray-400' },
  };
  const c = config[status] || config['Offline'];
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <Badge variant="outline" className={colors[priority] || 'bg-gray-100 text-gray-800'}>
      {priority}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ManagerDashboardPage() {
  const { navigate, goBack } = useApp();
  const { data: apiData, loading } = useApi<ManagerDashboardData>('/api/manager/dashboard');
  const { mutate } = useApiMutation();

  const data: ManagerDashboardData = apiData ?? EMPTY_MANAGER_DATA;

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const handleProviderAction = async (providerId: string, action: 'approve' | 'reject') => {
    try {
      await mutate(`/api/providers/${providerId}/${action}`, { method: 'POST' });
    } catch {
      // Silently handle - empty data will persist
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('manager-dashboard')} className="mb-3 text-[#1D63FF] hover:text-[#0D3B7A] hover:bg-[#1D63FF]/5">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0A2463] sm:text-3xl">Manager Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Oversee city operations, manage providers & track performance</p>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A2463] via-[#0D3B7A] to-[#1D63FF] p-6 sm:p-8"
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-[#FFCE32]" />
              <span className="text-sm font-medium text-[#FFE066]">Area Manager</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {data.cityAnalytics.city === '—' ? 'Area' : data.cityAnalytics.city} Operations
            </h2>
            <p className="mt-1 text-[#FFE066]/80">
              Managing {data.cityAnalytics.providers} provider{data.cityAnalytics.providers !== 1 ? 's' : ''} across the city
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <TrendingUp className="size-4 text-green-300" />
              <span className="text-sm text-white">+{data.cityAnalytics.growth}% growth</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* City Analytics Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="border-l-4 border-l-[#1D63FF] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">City</p>
                  <p className="mt-1 text-lg font-bold text-[#0A2463]">{data.cityAnalytics.city}</p>
                </div>
                <div className="rounded-lg bg-[#0A2463]/10 p-2.5 text-[#1D63FF]">
                  <MapPin className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#0D3B7A] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Providers</p>
                  <p className="mt-1 text-lg font-bold">{data.cityAnalytics.providers}</p>
                </div>
                <div className="rounded-lg bg-[#0A2463]/10 p-2.5 text-[#0D3B7A]">
                  <Users className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#1D63FF] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Bookings</p>
                  <p className="mt-1 text-lg font-bold">{data.cityAnalytics.bookings.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-[#FFCE32]/10 p-2.5 text-[#1D63FF]">
                  <CalendarCheck className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                  <p className="mt-1 text-lg font-bold">{`₹${(data.cityAnalytics.revenue / 100000).toFixed(1)}L`}</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-2.5 text-yellow-600">
                  <IndianRupee className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Growth</p>
                  <p className="mt-1 text-lg font-bold text-green-600">{`+${data.cityAnalytics.growth}%`}</p>
                </div>
                <div className="rounded-lg bg-green-100 p-2.5 text-green-600">
                  <TrendingUp className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Provider Approval + Revenue Tracking */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Provider Approval */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0A2463] to-[#0D3B7A] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <UserCheck className="size-4 text-[#FFCE32]" />
                Provider Approval
                <Badge className="ml-auto bg-[#1D63FF]/20 text-[#FFE066] border-0">
                  {data.pendingProviders.length} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {data.pendingProviders.map((provider) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 rounded-xl bg-[#0A2463]/5 p-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D3B7A] to-[#1D63FF] text-white shadow-md">
                        <Users className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0A2463]">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {provider.service} &middot; {provider.appliedAt}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          className="h-8 rounded-lg bg-[#1D63FF] text-white hover:bg-[#0D3B7A]"
                          onClick={() => handleProviderAction(provider.id, 'approve')}
                        >
                          <CheckCircle2 className="mr-1 size-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleProviderAction(provider.id, 'reject')}
                        >
                          <XCircle className="mr-1 size-3" /> Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Tracking */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0D3B7A] to-[#1D63FF] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <IndianRupee className="size-4 text-[#FFCE32]" />
                Revenue Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#0A2463]/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="mt-1 text-xl font-bold text-[#0A2463]">₹{data.revenueTracking.today.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-[#0A2463]/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="mt-1 text-xl font-bold text-[#0A2463]">₹{(data.revenueTracking.thisWeek / 1000).toFixed(0)}k</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#0A2463] to-[#0D3B7A] p-4 text-center">
                  <p className="text-xs text-[#FFCE32]">This Month</p>
                  <p className="mt-1 text-xl font-bold text-white">₹{(data.revenueTracking.thisMonth / 100000).toFixed(1)}L</p>
                </div>
                <div className="rounded-xl bg-[#FFCE32]/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Commission Earned</p>
                  <p className="mt-1 text-xl font-bold text-[#0D3B7A]">₹{(data.revenueTracking.commissionEarned / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-orange-50 p-4 text-center">
                <p className="text-xs text-muted-foreground">Pending Payouts</p>
                <p className="mt-1 text-xl font-bold text-orange-700">₹{data.revenueTracking.pendingPayouts.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Technician Monitoring + Complaint Handling */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Technician Monitoring */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0A2463] to-[#0D3B7A] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <Wrench className="size-4 text-[#FFCE32]" />
                Technician Monitoring
                <Badge className="ml-auto bg-[#1D63FF]/20 text-[#FFE066] border-0">
                  {data.activeTechnicians.filter((t) => t.status === 'On Job' || t.status === 'Available').length} active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {data.activeTechnicians.map((tech) => (
                    <div key={tech.id} className="flex items-center gap-3 rounded-xl bg-[#0A2463]/5 p-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D63FF] to-[#4D8AFF] text-white shadow-md">
                        <Wrench className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0A2463]">{tech.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tech.currentJob !== '-' ? tech.currentJob : 'No active job'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <TechnicianStatusBadge status={tech.status} />
                        <div className="flex items-center gap-0.5">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{tech.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complaint Handling */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0D3B7A] to-[#1D63FF] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageSquare className="size-4 text-[#FFCE32]" />
                Open Complaints
                <Badge className="ml-auto bg-red-500/20 text-red-200 border-0">
                  {data.openComplaints.length} open
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {data.openComplaints.map((complaint) => (
                    <div key={complaint.id} className="rounded-xl bg-[#0A2463]/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-[#1D63FF]" />
                          <span className="text-xs font-medium text-muted-foreground">{complaint.id}</span>
                        </div>
                        <PriorityBadge priority={complaint.priority} />
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-[#0A2463]">{complaint.issue}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Client: {complaint.client} &middot; Provider: {complaint.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">{complaint.createdAt}</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="h-7 rounded-lg bg-[#0D3B7A] text-white hover:bg-[#0A2463] text-xs">
                          <Eye className="mr-1 size-3" /> Review
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 rounded-lg border-[#1D63FF] text-[#0D3B7A] text-xs hover:bg-[#1D63FF]/5">
                          <MessageSquare className="mr-1 size-3" /> Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

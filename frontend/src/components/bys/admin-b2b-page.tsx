'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/bys/shared/status-badge';
import {
  Building2,
  Users,
  IndianRupee,
  Briefcase,
  ArrowLeft,
  Package,
  Handshake,
  FileText,
  Phone,
  Mail,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';

interface B2BPartner {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  totalBookings: number;
  totalSpent: number;
}


const b2bPlans = [
  {
    name: 'Starter',
    price: '₹4,999/mo',
    features: ['Up to 10 bookings/month', 'Email support', 'Basic analytics', 'Single location'],
    icon: Package,
    color: 'from-sky-500 to-blue-600',
  },
  {
    name: 'Business',
    price: '₹14,999/mo',
    features: ['Up to 50 bookings/month', 'Priority support', 'Advanced analytics', 'Multi-location', 'Dedicated account manager'],
    icon: Briefcase,
    color: 'from-[#1e3a5f] to-[#2d5a8e]',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited bookings', '24/7 support', 'Custom integrations', 'API access', 'SLA guarantee', 'Bulk discount'],
    icon: Building2,
    color: 'from-violet-500 to-purple-600',
  },
];

export function AdminB2bPage() {
  const { goBack } = useApp();
  const { data: apiPartners, loading: apiLoading, error: apiError } = useApi<B2BPartner[]>('/api/admin/b2b');

  const partners = apiPartners || [];

  // Compute stats from data source
  const activePartners = partners.filter(p => p.status === 'ACTIVE').length;
  const totalBookings = partners.reduce((sum, p) => sum + p.totalBookings, 0);
  const totalRevenue = partners.reduce((sum, p) => sum + p.totalSpent, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0a1628] sm:text-3xl">B2B Partnerships</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage corporate accounts & business partnerships</p>
      </motion.div>

      {/* Loading state */}
      {apiLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading partner data…
        </div>
      )}

      {/* API Error */}
      {apiError && !apiLoading && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load live data: {apiError}.
        </div>
      )}

      {/* Overview Banner */}
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
              <Handshake className="size-5 text-sky-300" />
              <span className="text-sm font-medium text-sky-200">B2B Program</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">Corporate Partnerships</h2>
            <p className="mt-1 text-sky-100/80">Empower businesses with reliable home services</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row — values computed from data source */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="border-l-4 border-l-[#2d5a8e] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Partners</p>
                  <p className="mt-1 text-2xl font-bold">{activePartners}</p>
                </div>
                <div className="rounded-lg bg-[#0a1628]/10 p-2.5 text-[#2d5a8e]">
                  <Building2 className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Corporate Bookings</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{totalBookings}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                  <Briefcase className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">B2B Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                  <IndianRupee className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-teal-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Partners</p>
                  <p className="mt-1 text-2xl font-bold text-teal-700">{partners.length}</p>
                </div>
                <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
                  <TrendingUp className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* B2B Plans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-[#0a1628]">Corporate Plans</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {b2bPlans.map((plan) => (
            <Card key={plan.name} className="overflow-hidden rounded-2xl border-0 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} shadow-md`}>
                    <plan.icon className="size-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                    <p className="text-sm font-semibold text-[#2d5a8e]">{plan.price}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Corporate Partners List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
              <Users className="size-5 text-sky-300" />
              Corporate Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:bg-sky-50/20 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] shadow-md">
                    <Building2 className="size-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{partner.companyName}</p>
                      <StatusBadge status={partner.status} />
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs">
                        {partner.plan}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" /> {partner.contactPerson}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" /> {partner.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" /> {partner.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-6 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Bookings</p>
                      <p className="text-sm font-bold">{partner.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="text-sm font-bold text-emerald-700">₹{(partner.totalSpent / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Booking Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0a1628]/5 to-sky-50/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0a1628]">
              <Package className="size-5 text-[#2d5a8e]" />
              Bulk Booking Program
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-sky-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="size-4 text-[#2d5a8e]" />
                  <h4 className="text-sm font-semibold text-[#0a1628]">Volume Discounts</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get up to 30% off on bulk bookings. Discounts apply automatically based on monthly volume.
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-[#0a1628]">Priority Scheduling</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Corporate partners get priority access to service slots with guaranteed turnaround times.
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-[#0a1628]">Consolidated Billing</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Single monthly invoice for all bookings. Simplified GST-compliant billing for businesses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

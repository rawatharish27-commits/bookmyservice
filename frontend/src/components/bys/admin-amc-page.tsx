'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Repeat,
  ArrowRight,
  Tag,
  Settings,
} from 'lucide-react';

/* ---------- types ---------- */
interface AmcPlan {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in months
  visitsPerYear: number;
  isActive: boolean;
  description?: string;
  features?: string[];
  subscriberCount?: number;
}

interface AmcSubscription {
  id: string;
  planId: string;
  planName: string;
  clientName: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  price: number;
  visitsUsed: number;
  visitsTotal: number;
  nextVisitDate?: string;
}

interface PlansResponse {
  plans: AmcPlan[];
}

interface SubscriptionsResponse {
  subscriptions: AmcSubscription[];
}

/* ---------- subscription status config ---------- */
const SUB_STATUS_CONFIG: Record<string, { className: string; dotColor: string; label: string }> = {
  ACTIVE: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400', label: 'Active' },
  EXPIRED: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-cyan-400', label: 'Expired' },
  CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400', label: 'Cancelled' },
};

/* ---------- animation ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

/* ==================== MAIN COMPONENT ==================== */
export function AdminAmcPage() {
  const { data: plansData, loading: plansLoading } = useApi<PlansResponse>('/api/amc/plans');
  const { data: subsData, loading: subsLoading } = useApi<SubscriptionsResponse>('/api/amc/subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('plans');

  const plans = plansData?.plans || [];
  const subscriptions = subsData?.subscriptions || [];

  // Stats
  const activePlans = plans.filter((p) => p.isActive).length;
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const totalRevenue = subscriptions.filter((s) => s.status === 'ACTIVE').reduce((s, sub) => s + sub.price, 0);

  const filteredPlans = plans.filter((plan) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      plan.name.toLowerCase().includes(q) ||
      plan.category?.toLowerCase().includes(q)
    );
  });

  const filteredSubs = subscriptions.filter((sub) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.planName.toLowerCase().includes(q) ||
      sub.clientName.toLowerCase().includes(q) ||
      sub.clientEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">AMC Management</h1>
          <p className="text-sm text-muted-foreground">Manage Annual Maintenance Contract plans and subscriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plans or subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-muted-foreground/20 focus:border-emerald-400"
            />
          </div>
          <Button className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <Plus className="mr-2 size-4" />
            New Plan
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Total Plans', value: plans.length, icon: Shield, gradient: 'from-emerald-400 to-teal-500', bgGlow: 'bg-emerald-500/10' },
          { label: 'Active Plans', value: activePlans, icon: CheckCircle2, gradient: 'from-sky-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
          { label: 'Active Subs', value: activeSubs, icon: Users, gradient: 'from-cyan-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
          { label: 'Revenue (Active)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, gradient: 'from-violet-400 to-purple-500', bgGlow: 'bg-violet-500/10' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-xl sm:text-2xl font-bold text-transparent`}>
                    {stat.value}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <Shield className="mr-2 size-4" />
            Plans ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <Repeat className="mr-2 size-4" />
            Subscriptions ({subscriptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <AnimatePresence mode="wait">
            {plansLoading ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-16 text-center mt-4"
              >
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50">
                  <Shield className="size-10 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No AMC plans found</h3>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {searchQuery ? 'Try a different search term' : 'Create your first AMC plan'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredPlans.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md h-full">
                      <div className={`h-2 ${plan.isActive ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`} />
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`flex size-10 items-center justify-center rounded-xl ${
                              plan.isActive
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md'
                                : 'bg-gradient-to-br from-gray-300 to-gray-400'
                            }`}>
                              <Shield className="size-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold">{plan.name}</h3>
                              {plan.category && (
                                <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 mt-0.5">
                                  <Tag className="size-2.5 mr-0.5" />
                                  {plan.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 gap-1 text-[10px] font-semibold ${
                              plan.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 bg-gray-50 text-gray-500'
                            }`}
                          >
                            {plan.isActive ? <CheckCircle2 className="size-2.5" /> : <XCircle className="size-2.5" />}
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {plan.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{plan.description}</p>
                        )}

                        <div className="grid grid-cols-3 gap-2 mt-auto mb-3">
                          <div className="rounded-lg bg-emerald-50/80 p-2 text-center">
                            <IndianRupeeIcon className="size-3.5 text-emerald-600 mx-auto" />
                            <p className="text-sm font-bold text-emerald-700">₹{plan.price?.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-muted-foreground">Price</p>
                          </div>
                          <div className="rounded-lg bg-teal-50/80 p-2 text-center">
                            <Calendar className="size-3.5 text-teal-600 mx-auto" />
                            <p className="text-sm font-bold text-teal-700">{plan.duration}mo</p>
                            <p className="text-[10px] text-muted-foreground">Duration</p>
                          </div>
                          <div className="rounded-lg bg-cyan-50/80 p-2 text-center">
                            <Wrench className="size-3.5 text-cyan-600 mx-auto" />
                            <p className="text-sm font-bold text-cyan-700">{plan.visitsPerYear}</p>
                            <p className="text-[10px] text-muted-foreground">Visits/yr</p>
                          </div>
                        </div>

                        {plan.subscriberCount !== undefined && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {plan.subscriberCount} subscribers
                            </span>
                          </div>
                        )}

                        <Separator className="my-3" />

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs">
                            <Settings className="mr-1 size-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className={`flex-1 rounded-lg text-xs ${
                              plan.isActive
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200'
                            }`}
                            variant="outline"
                          >
                            {plan.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <AnimatePresence mode="wait">
            {subsLoading ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/50" />
                ))}
              </div>
            ) : filteredSubs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-16 text-center mt-4"
              >
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50">
                  <Repeat className="size-10 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No subscriptions found</h3>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {searchQuery ? 'Try a different search term' : 'Active subscriptions will appear here'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4"
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Repeat className="size-4 text-emerald-600" />
                      Active Subscriptions ({filteredSubs.length})
                    </CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-[500px]">
                      {filteredSubs.map((sub, idx) => {
                        const statusConf = SUB_STATUS_CONFIG[sub.status] || SUB_STATUS_CONFIG.ACTIVE;
                        const progress = sub.visitsTotal > 0 ? (sub.visitsUsed / sub.visitsTotal) * 100 : 0;
                        return (
                          <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex flex-col gap-3 border-b p-4 last:border-0 transition-colors hover:bg-emerald-50/30 sm:flex-row sm:items-center sm:gap-6"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                sub.status === 'ACTIVE'
                                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md'
                                  : 'bg-gradient-to-br from-gray-300 to-gray-400'
                              }`}>
                                <Repeat className="size-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold truncate">{sub.planName}</p>
                                  <Badge variant="outline" className={`${statusConf.className} gap-1 text-[10px] font-semibold shrink-0`}>
                                    <span className={`size-1.5 rounded-full ${statusConf.dotColor}`} />
                                    {statusConf.label}
                                  </Badge>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{sub.clientName}</span>
                                  <span>·</span>
                                  <span>{sub.clientEmail}</span>
                                </div>
                              </div>
                            </div>

                            {/* Visit Progress */}
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="w-32">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Visits</span>
                                  <span className="font-medium">{sub.visitsUsed}/{sub.visitsTotal}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      progress > 80 ? 'bg-red-400' : progress > 50 ? 'bg-cyan-400' : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="text-right min-w-[80px]">
                                <p className="text-sm font-bold">₹{sub.price?.toLocaleString('en-IN')}</p>
                                <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  <span>
                                    {new Date(sub.endDate).toLocaleDateString('en-IN', {
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <Button variant="ghost" size="sm" className="shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                <ArrowRight className="size-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- helper component ---------- */
function IndianRupeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 3c3 2 5 6 5 10" />
      <path d="M12 13c0 4-2 8-6 10" />
    </svg>
  );
}

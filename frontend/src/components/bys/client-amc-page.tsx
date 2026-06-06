'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  ShieldCheck,
  CalendarClock,
  CheckCircle2,
  Wrench,
  Zap,
  Droplets,
  Wind,
  IndianRupee,
  ArrowRight,
  Loader2,
  CheckCircle,
  Sparkles,
  Package,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

/* ---------- animation variants ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/* ---------- types ---------- */
interface AMCSubscription {
  id: string;
  planId: string;
  planName: string;
  category: string;
  status: string;
  price: number;
  totalVisits: number;
  usedVisits: number;
  startDate: string;
  endDate: string;
  features?: string[];
}

interface AMCPlan {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  durationUnit: string;
  totalVisits: number;
  features: string[];
  description?: string;
  popular?: boolean;
}

/* ---------- category config ---------- */
const CATEGORY_ICONS: Record<string, { icon: typeof Wrench; gradient: string }> = {
  AIR_CONDITIONER: { icon: Wind, gradient: 'from-[#FFD54F] to-[#E0B84C]' },
  PLUMBING: { icon: Droplets, gradient: 'from-[#FFD54F] to-[#E0B84C]' },
  ELECTRICAL: { icon: Zap, gradient: 'from-[#F2C94C] to-yellow-500' },
  REFRIGERATOR: { icon: Wrench, gradient: 'from-[#E0B84C] to-[#FFD54F]' },
  WASHING_MACHINE: { icon: Wrench, gradient: 'from-violet-400 to-purple-500' },
  KITCHEN_APPLIANCES: { icon: Wrench, gradient: 'from-amber-400 to-orange-500' },
  TV_REPAIR: { icon: Wrench, gradient: 'from-rose-400 to-pink-500' },
  WATER_PURIFIER: { icon: Droplets, gradient: 'from-[#F2C94C] to-[#E0B84C]' },
  GEYSER: { icon: Wrench, gradient: 'from-red-400 to-orange-500' },
  WATER_TANK_CLEANING: { icon: Droplets, gradient: 'from-[#FFD54F] to-indigo-500' },
  MOVERS_AND_PACKERS: { icon: Wrench, gradient: 'from-[#FFD54F] to-green-500' },
  APPLIANCE: { icon: Wrench, gradient: 'from-violet-400 to-purple-500' },
  GENERAL: { icon: Shield, gradient: 'from-[#FFD54F] to-[#E0B84C]' },
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || { icon: Shield, gradient: 'from-gray-400 to-gray-500' };
}

/* ---------- subscription status config ---------- */
const STATUS_CONFIG: Record<string, { className: string; dotColor: string; label: string }> = {
  ACTIVE: { className: 'bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20', dotColor: 'bg-[#FFD54F]', label: 'Active' },
  EXPIRED: { className: 'bg-gray-50 text-gray-600 border-gray-200', dotColor: 'bg-gray-400', label: 'Expired' },
  CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400', label: 'Cancelled' },
  PENDING: { className: 'bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20', dotColor: 'bg-[#F2C94C]', label: 'Pending' },
};

/* ==================== MAIN COMPONENT ==================== */
export function ClientAmcPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data: subsData, loading: subsLoading, refetch: refetchSubs } = useApi<{ subscriptions: AMCSubscription[] }>('/api/amc/subscriptions');
  const { data: plansData, loading: plansLoading } = useApi<{ plans: AMCPlan[] }>('/api/amc/plans');
  const { mutate, loading: subscribing } = useApiMutation();

  const [subscribeDialog, setSubscribeDialog] = useState<AMCPlan | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const subscriptions = subsData?.subscriptions || [];
  const plans = plansData?.plans || [];

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE');
  const pastSubscriptions = subscriptions.filter((s) => s.status !== 'ACTIVE');

  const handleSubscribe = async () => {
    if (!subscribeDialog) return;
    try {
      await mutate('/api/amc/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId: subscribeDialog.id }),
      });
      setSubscribeSuccess(true);
      refetchSubs();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const resetSubscribeForm = () => {
    setSubscribeDialog(null);
    setSubscribeSuccess(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">AMC Plans</h1>
        <p className="text-sm text-muted-foreground">Manage your Annual Maintenance Contracts and subscribe to new plans</p>
      </motion.div>

      {/* AMC Banner */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFD54F] via-[#E0B84C] to-[#F2C94C] p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwQTFGNDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[#0A1F44]/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-[#0A1F44]/5 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#0A1F44]/70" />
              <span className="text-sm font-medium text-[#0A1F44]/80">Protect Your Home</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-[#0A1F44] sm:text-2xl">
              Annual Maintenance Contracts
            </h2>
            <p className="mt-1 text-[#0A1F44]/80">
              Get unlimited service visits, priority support & exclusive discounts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-center rounded-xl bg-[#0A1F44]/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl font-bold text-[#0A1F44]">{activeSubscriptions.length}</span>
              <span className="text-xs text-[#0A1F44]/70">Active Plans</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Subscriptions</h2>
          {activeSubscriptions.length > 0 && (
            <Badge className="bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10">
              {activeSubscriptions.length} Active
            </Badge>
          )}
        </div>

        {subsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : activeSubscriptions.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#FFD54F]/20 bg-[#FFD54F]/5 py-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/5">
              <Shield className="size-8 text-[#E0B84C]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Active Subscriptions</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">Subscribe to an AMC plan below for hassle-free maintenance</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeSubscriptions.map((sub) => {
              const catConfig = getCategoryIcon(sub.category);
              const visitPercent = sub.totalVisits > 0 ? (sub.usedVisits / sub.totalVisits) * 100 : 0;
              const nowMs = new Date().getTime();
              const isExpiringSoon = new Date(sub.endDate).getTime() - nowMs < 30 * 24 * 60 * 60 * 1000;
              const daysRemaining = Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - nowMs) / (1000 * 60 * 60 * 24)));

              return (
                <motion.div key={sub.id} variants={fadeUp}>
                  <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md">
                    {/* Top gradient bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${catConfig.gradient}`} />

                    <CardContent className="p-5">
                      {/* Plan header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${catConfig.gradient} shadow-md`}>
                            <catConfig.icon className="size-5 text-[#0A1F44]" />
                          </div>
                          <div>
                            <p className="font-semibold">{sub.planName}</p>
                            <p className="text-xs text-muted-foreground">{sub.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="gap-1 text-[10px] font-semibold bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20">
                          <span className="size-1.5 rounded-full bg-[#FFD54F]" />
                          Active
                        </Badge>
                      </div>

                      {/* Visit progress */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Service Visits</span>
                          <span className="font-semibold">
                            {sub.usedVisits} / {sub.totalVisits}
                          </span>
                        </div>
                        <Progress
                          value={visitPercent}
                          className="mt-2 h-2"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {sub.totalVisits - sub.usedVisits} visits remaining
                        </p>
                      </div>

                      <Separator className="my-4" />

                      {/* Expiry info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                          <span>
                            Expires {new Date(sub.endDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {isExpiringSoon && (
                          <Badge variant="outline" className="gap-1 text-[10px] font-semibold border-[#FFD54F]/20 bg-[#FFD54F]/5 text-[#132D5E]">
                            <AlertTriangle className="size-2.5" />
                            {daysRemaining}d left
                          </Badge>
                        )}
                      </div>

                      {/* View details button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full text-[#FFD54F] hover:text-[#132D5E] hover:bg-[#FFD54F]/5"
                        onClick={() => navigate('client-amc-detail', { subscriptionId: sub.id })}
                      >
                        View Details <ChevronRight className="ml-1 size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Past Subscriptions (collapsible) */}
      {pastSubscriptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Past Subscriptions</h2>
          </div>
          <div className="space-y-3">
            {pastSubscriptions.map((sub) => {
              const catConfig = getCategoryIcon(sub.category);
              const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.EXPIRED;
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white/50 p-4 transition-all hover:bg-gray-50/80"
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${catConfig.gradient} opacity-70`}>
                    <catConfig.icon className="size-4.5 text-[#0A1F44]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground">{sub.planName}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {sub.usedVisits}/{sub.totalVisits} visits · Expired {new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${statusConf.className} gap-1 text-[10px] font-semibold shrink-0`}>
                    <span className={`size-1.5 rounded-full ${statusConf.dotColor}`} />
                    {statusConf.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <Badge className="bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10">
            {plans.length} Plans
          </Badge>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#FFD54F]/20 bg-[#FFD54F]/5 py-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/5">
              <Package className="size-8 text-[#E0B84C]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Plans Available</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">New AMC plans will be added soon. Stay tuned!</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const catConfig = getCategoryIcon(plan.category);
              const isAlreadySubscribed = activeSubscriptions.some((s) => s.planId === plan.id);
              return (
                <motion.div key={plan.id} variants={fadeUp}>
                  <Card className={`group relative flex flex-col overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-lg ${
                    plan.popular ? 'ring-2 ring-[#E0B84C]' : ''
                  }`}>
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute right-4 top-4 z-10">
                        <Badge className="bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] border-0 shadow-md">
                          <Sparkles className="mr-1 size-3" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Top gradient bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${catConfig.gradient}`} />

                    <CardContent className="flex flex-1 flex-col p-6">
                      {/* Plan icon & name */}
                      <div className="flex items-center gap-3">
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${catConfig.gradient} shadow-lg`}>
                          <catConfig.icon className="size-6 text-[#0A1F44]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{plan.name}</h3>
                          <p className="text-xs text-muted-foreground">{plan.category} · {plan.duration} {plan.durationUnit}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-5 flex items-baseline gap-1">
                        <IndianRupee className="size-5 text-[#FFD54F]" />
                        <span className="text-3xl font-bold text-[#FFD54F]">{plan.price?.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-muted-foreground">/{plan.durationUnit}</span>
                      </div>

                      {/* Visits included */}
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#FFD54F]/5 p-2.5">
                        <Wrench className="size-4 text-[#FFD54F]" />
                        <span className="text-sm font-medium text-[#132D5E]">
                          {plan.totalVisits} service visits included
                        </span>
                      </div>

                      {/* Features list */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-4 flex-1 space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="mt-0.5 size-4 shrink-0 text-[#E0B84C]" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      {plan.description && (
                        <p className="mt-3 text-xs text-muted-foreground/70 line-clamp-2">{plan.description}</p>
                      )}

                      {/* Subscribe button */}
                      <div className="mt-5">
                        <Button
                          className={`w-full rounded-xl shadow-lg ${
                            isAlreadySubscribed
                              ? 'bg-gray-100 text-gray-500 shadow-none hover:bg-gray-100 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-[#E0B84C]/25 hover:shadow-xl hover:shadow-[#E0B84C]/30'
                          }`}
                          disabled={isAlreadySubscribed}
                          onClick={() => {
                            if (!isAlreadySubscribed) {
                              resetSubscribeForm();
                              setSubscribeDialog(plan);
                            }
                          }}
                        >
                          {isAlreadySubscribed ? (
                            <>
                              <CheckCircle2 className="mr-2 size-4" />
                              Subscribed
                            </>
                          ) : (
                            <>
                              Subscribe Now
                              <ArrowRight className="ml-2 size-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Subscribe Confirmation Dialog */}
      <Dialog open={!!subscribeDialog} onOpenChange={(open) => { if (!open) { setSubscribeDialog(null); setSubscribeSuccess(false); } }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {subscribeSuccess ? (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Subscribed Successfully</DialogTitle>
                <DialogDescription>You have been enrolled in the plan</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex size-20 items-center justify-center rounded-full bg-[#FFD54F]/10"
              >
                <ShieldCheck className="size-10 text-[#FFD54F]" />
              </motion.div>
              <h3 className="mt-4 text-lg font-bold">Subscribed Successfully!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;re now enrolled in the <strong>{subscribeDialog?.name}</strong> plan. Enjoy {subscribeDialog?.totalVisits} service visits and priority support!
              </p>
              <Button
                className="mt-6 bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/25"
                onClick={() => { setSubscribeDialog(null); setSubscribeSuccess(false); }}
              >
                View My Plans
              </Button>
            </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="size-5 text-[#FFD54F]" />
                  Subscribe to Plan
                </DialogTitle>
                <DialogDescription>
                  Review the plan details before subscribing.
                </DialogDescription>
              </DialogHeader>

              {subscribeDialog && (
                <div className="space-y-5 pt-2">
                  {/* Plan summary card */}
                  <div className="rounded-xl border border-[#FFD54F]/20 bg-[#FFD54F]/5 p-5">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const catConfig = getCategoryIcon(subscribeDialog.category);
                        return (
                          <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${catConfig.gradient} shadow-lg`}>
                            <catConfig.icon className="size-6 text-[#0A1F44]" />
                          </div>
                        );
                      })()}
                      <div>
                        <h4 className="font-bold">{subscribeDialog.name}</h4>
                        <p className="text-xs text-muted-foreground">{subscribeDialog.category}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-bold text-[#FFD54F]">₹{subscribeDialog.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{subscribeDialog.duration} {subscribeDialog.durationUnit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Service Visits</span>
                        <span className="font-medium">{subscribeDialog.totalVisits} visits</span>
                      </div>
                    </div>

                    {/* Features */}
                    {subscribeDialog.features && subscribeDialog.features.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          {subscribeDialog.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-[#E0B84C]" />
                              <span className="text-xs text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                          {subscribeDialog.features.length > 4 && (
                            <p className="text-xs text-muted-foreground/60">+{subscribeDialog.features.length - 4} more benefits</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info note */}
                  <div className="flex items-start gap-3 rounded-xl bg-[#FFD54F]/5 p-4">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#FFD54F]" />
                    <p className="text-xs text-[#132D5E]">
                      The subscription amount will be deducted from your wallet balance. Make sure you have sufficient funds.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => { setSubscribeDialog(null); setSubscribeSuccess(false); }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/25"
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 size-4" />
                      Confirm Subscription
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

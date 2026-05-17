'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import {
  DollarSign,
  Star,
  Briefcase,
  MapPin,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Truck,
  DoorOpen,
  PlayCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Wallet,
  User,
  CalendarCheck,
  ChevronRight,
  CircleDot,
  Timer,
} from 'lucide-react';

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface TechnicianProfile {
  id: string;
  specialization: string;
  experienceYears: number;
  certifications: string[];
  availabilityStatus: 'available' | 'busy' | 'offline';
  rating: number;
  currentLat?: number;
  currentLng?: number;
  locationUpdatedAt?: string;
}

interface Job {
  id: string;
  bookingNumber: string;
  status: 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  technicianEarnings: number;
  otp?: string;
  service: { id: string; title: string; basePrice: number };
  client?: { id: string; name: string; phone?: string; profileImageUrl?: string; address?: string };
}

interface JobsResponse {
  jobs: Job[];
  pagination?: { total: number };
}

interface EarningsResponse {
  // API may return either camelCase or short form
  todayEarnings?: number;
  totalEarnings?: number;
  thisWeekEarnings?: number;
  thisMonthEarnings?: number;
  today?: number;
  week?: number;
  month?: number;
  allTime?: number;
}

interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImageUrl?: string;
    technicianProfile?: TechnicianProfile;
  };
}

// ─── Status Badge Component ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-cyan-400' },
    ASSIGNED: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-400' },
    ACCEPTED: { className: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotColor: 'bg-indigo-400' },
    ON_THE_WAY: { className: 'bg-cyan-50 text-cyan-700 border-cyan-200', dotColor: 'bg-cyan-400' },
    ARRIVED: { className: 'bg-teal-50 text-teal-700 border-teal-200', dotColor: 'bg-teal-400' },
    IN_PROGRESS: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-sky-400' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

// ─── Star Rating Component ───────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'md' ? 'size-5' : 'size-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < Math.floor(rating)
              ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.4)]'
              : i < rating
                ? 'fill-sky-200 text-cyan-400'
                : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Job Action Button Helper ────────────────────────────────────────────────

function getJobAction(
  status: Job['status'],
  onAction: (action: string) => void,
  onComplete: () => void,
  loading: boolean,
): { label: string; icon: React.ElementType; action?: string; variant?: 'default' | 'outline'; className: string; onCompleteAction?: boolean }[] {
  switch (status) {
    case 'PENDING':
    case 'ASSIGNED':
      return [
        { label: 'Accept', icon: CheckCircle2, action: 'accept', variant: 'default' as const, className: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25 hover:shadow-md' },
        { label: 'Reject', icon: XCircle, action: 'reject', variant: 'outline' as const, className: 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700' },
      ];
    case 'ACCEPTED':
      return [{ label: 'On the Way', icon: Truck, action: 'start-travel', variant: 'default' as const, className: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-sm shadow-cyan-500/25 hover:shadow-md' }];
    case 'ON_THE_WAY':
      return [{ label: 'Arrived', icon: DoorOpen, action: 'arrive', variant: 'default' as const, className: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/25 hover:shadow-md' }];
    case 'ARRIVED':
      return [{ label: 'Start Work', icon: PlayCircle, action: 'start', variant: 'default' as const, className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/25 hover:shadow-md' }];
    case 'IN_PROGRESS':
      return [{ label: 'Complete', icon: CheckCircle2, action: undefined, variant: 'default' as const, className: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-600/25 hover:shadow-md', onCompleteAction: true }];
    default:
      return [];
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TechnicianDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { mutate, loading: mutationLoading } = useApiMutation();

  // ── Fetch profile ──
  const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useApi<ProfileResponse>('/api/technician/profile');

  // ── Fetch active jobs ──
  const { data: activeJobsData, loading: activeJobsLoading, refetch: refetchActiveJobs } = useApi<JobsResponse>('/api/technician/jobs?status=ASSIGNED');

  // ── Fetch completed jobs ──
  const { data: completedJobsData, loading: completedJobsLoading, refetch: refetchCompletedJobs } = useApi<JobsResponse>('/api/technician/jobs?status=COMPLETED');

  // ── Fetch earnings ──
  const { data: earningsData, loading: earningsLoading } = useApi<EarningsResponse>('/api/technician/earnings');

  // ── Local state ──
  const [otpValue, setOtpValue] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingJobId, setCompletingJobId] = useState<string | null>(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  // ── Derived data ──
  const profile = profileData?.user?.technicianProfile;
  const isOnline = profile?.availabilityStatus === 'available';
  const activeJobs = activeJobsData?.jobs || [];
  const completedJobs = (completedJobsData?.jobs || []).slice(0, 5);
  const todayEarnings = earningsData?.todayEarnings ?? earningsData?.today ?? 0;
  const weekEarnings = earningsData?.thisWeekEarnings ?? earningsData?.week ?? 0;
  const monthEarnings = earningsData?.thisMonthEarnings ?? earningsData?.month ?? 0;
  const totalEarnings = earningsData?.totalEarnings ?? earningsData?.allTime ?? 0;
  const completedCount = completedJobsData?.pagination?.total || completedJobsData?.jobs?.length || 0;
  const avgRating = profile?.rating || 0;

  // ── Location status ──
  const locationUpdatedAt = profile?.locationUpdatedAt;
  const locationStatus = useMemo(() => {
    if (!locationUpdatedAt) return 'unknown';
    const ageMs = new Date().getTime() - new Date(locationUpdatedAt).getTime();
    const ageMin = Math.round(ageMs / 60000);
    return ageMin < 30 ? 'current' : 'stale';
  }, [locationUpdatedAt]);
  const locationAge = useMemo(() => {
    if (!locationUpdatedAt) return null;
    return Math.round((new Date().getTime() - new Date(locationUpdatedAt).getTime()) / 60000);
  }, [locationUpdatedAt]);

  // ── Toggle availability ──
  const handleToggleAvailability = useCallback(async () => {
    setIsTogglingAvailability(true);
    try {
      const newStatus = isOnline ? 'offline' : 'available';
      await mutate('/api/technician/profile', {
        method: 'PATCH',
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      refetchProfile();
    } catch {
      // Error handled by mutation
    } finally {
      setIsTogglingAvailability(false);
    }
  }, [isOnline, mutate, refetchProfile]);

  // ── Job action handler ──
  const handleJobAction = useCallback(async (jobId: string, action: string) => {
    try {
      await mutate(`/api/bookings/${jobId}/${action}`, { method: 'PATCH' });
      refetchActiveJobs();
      refetchCompletedJobs();
    } catch {
      // Error handled by mutation
    }
  }, [mutate, refetchActiveJobs, refetchCompletedJobs]);

  // ── Complete with OTP ──
  const handleOpenComplete = useCallback((jobId: string) => {
    setCompletingJobId(jobId);
    setOtpValue('');
    setCompleteDialogOpen(true);
  }, []);

  const handleCompleteJob = useCallback(async () => {
    if (!completingJobId || otpValue.length < 4) return;
    try {
      await mutate(`/api/bookings/${completingJobId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ otp: otpValue }),
      });
      setCompleteDialogOpen(false);
      setCompletingJobId(null);
      setOtpValue('');
      refetchActiveJobs();
      refetchCompletedJobs();
    } catch {
      // Error handled by mutation
    }
  }, [completingJobId, otpValue, mutate, refetchActiveJobs, refetchCompletedJobs]);

  // ── Render action buttons for a job ──
  const renderJobActions = (job: Job) => {
    const actions = getJobAction(job.status, (action) => handleJobAction(job.id, action), () => handleOpenComplete(job.id), mutationLoading);

    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex gap-2">
        {actions.map((act) => (
          <Button
            key={act.label}
            size="sm"
            variant={act.variant}
            className={act.className}
            onClick={() => act.onCompleteAction ? handleOpenComplete(job.id) : act.action && handleJobAction(job.id, act.action)}
            disabled={mutationLoading}
          >
            <act.icon className="mr-1 size-3.5" />
            {act.label}
          </Button>
        ))}
      </div>
    );
  };

  // ── Stats config ──
  const stats = [
    {
      title: "Today's Earnings",
      value: `₹${todayEarnings.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-emerald-400 to-teal-500',
      bgGlow: 'bg-emerald-500/10',
      valueColor: 'text-emerald-600',
    },
    {
      title: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString()}`,
      icon: Wallet,
      gradient: 'from-teal-400 to-cyan-500',
      bgGlow: 'bg-teal-500/10',
      valueColor: 'text-teal-600',
    },
    {
      title: 'Jobs Completed',
      value: completedCount,
      icon: Briefcase,
      gradient: 'from-sky-400 to-blue-500',
      bgGlow: 'bg-sky-500/10',
      valueColor: 'text-sky-600',
    },
    {
      title: 'Average Rating',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      icon: Star,
      gradient: 'from-cyan-400 to-blue-500',
      bgGlow: 'bg-sky-500/10',
      valueColor: 'text-sky-600',
    },
  ];

  // ── Quick actions config ──
  const quickActions = [
    { icon: Wallet, label: 'Earnings', nav: 'technician-earnings' as Page, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    { icon: User, label: 'My Profile', nav: 'technician-profile' as Page, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/25' },
    { icon: CalendarCheck, label: 'Availability', nav: 'technician-availability' as Page, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/25' },
    { icon: Briefcase, label: 'All Jobs', nav: 'technician-jobs' as Page, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/25' },
  ];

  // ── Loading state ──
  if (profileLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-28 w-full animate-pulse rounded-2xl bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Welcome Banner with Availability ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-200" />
              <span className="text-sm font-medium text-emerald-100">Welcome back</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {user?.name?.split(' ')[0] || 'Technician'} 👋
            </h1>
            <p className="mt-1 text-emerald-100/80">Manage your jobs and stay on track</p>
            {/* Location status */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <MapPin className="size-3.5 text-emerald-200" />
                <span className="text-xs font-medium text-emerald-100">
                  {locationStatus === 'current'
                    ? `Location updated ${locationAge}m ago`
                    : locationStatus === 'stale'
                      ? `Location ${locationAge}m old`
                      : 'Location not shared'}
                </span>
                {locationStatus === 'current' && (
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:min-w-[180px]">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="size-4 text-emerald-300" />
              ) : (
                <WifiOff className="size-4 text-gray-300" />
              )}
              <span className={`text-sm font-semibold ${isOnline ? 'text-emerald-200' : 'text-gray-300'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleAvailability}
                disabled={isTogglingAvailability}
                className="data-[state=checked]:bg-emerald-400 data-[state=unchecked]:bg-gray-400/50 h-7 w-14 [&>span]:size-6 [&>span]:data-[state=checked]:translate-x-[calc(100%-2px)]"
              />
            </div>
            <span className="text-xs text-emerald-200/70">
              {isOnline ? 'Receiving jobs' : 'Not receiving jobs'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{stat.title}</p>
                  <p className={`text-xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Active Jobs ── */}
        <motion.div className="lg:col-span-2" {...fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">Active Jobs</CardTitle>
                {activeJobs.length > 0 && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
                    {activeJobs.length} active
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('technician-jobs')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                View All <ArrowRight className="ml-1 size-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {activeJobsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />
                  ))}
                </div>
              ) : activeJobs.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <CircleDot className="size-8 text-emerald-300" />
                  </div>
                  <p className="mt-3 font-medium text-muted-foreground">No active jobs</p>
                  <p className="mt-1 text-sm text-muted-foreground/70">
                    {isOnline ? 'New jobs will appear here when assigned' : 'Go online to start receiving jobs'}
                  </p>
                  {!isOnline && (
                    <Button
                      className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                      size="sm"
                      onClick={handleToggleAvailability}
                      disabled={isTogglingAvailability}
                    >
                      <Wifi className="mr-2 size-4" />
                      Go Online
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="max-h-[480px]">
                  <div className="divide-y divide-border/50">
                    {activeJobs.map((job, idx) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 transition-colors hover:bg-emerald-50/30"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{job.service?.title || 'Service'}</p>
                              <StatusBadge status={job.status} />
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="size-3" />
                                {job.client?.name || 'Client'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {new Date(job.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {job.scheduledTime}
                              </span>
                              {job.client?.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-3" />
                                  <span className="truncate max-w-[200px]">{job.client?.address}</span>
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-600">₹{job.finalPrice?.toLocaleString()}</span>
                              {job.technicianEarnings > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  (Earnings: ₹{job.technicianEarnings.toLocaleString()})
                                </span>
                              )}
                            </div>
                            {/* Progress indicator for multi-step statuses */}
                            <div className="mt-2 flex items-center gap-1">
                              {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].map((step, i) => {
                                const stepOrder = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'];
                                const currentIndex = stepOrder.indexOf(job.status);
                                const stepIndex = stepOrder.indexOf(step);
                                const isActive = stepIndex === currentIndex;
                                const isDone = stepIndex < currentIndex;
                                return (
                                  <div key={step} className="flex items-center gap-1">
                                    <div className={`size-2 rounded-full transition-all ${
                                      isDone ? 'bg-emerald-500'
                                        : isActive ? 'bg-emerald-400 ring-2 ring-emerald-200 animate-pulse'
                                          : 'bg-gray-200'
                                    }`} />
                                    {i < 3 && <div className={`h-0.5 w-4 ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="shrink-0 sm:text-right">
                            {renderJobActions(job)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right Sidebar: Quick Actions + Availability ── */}
        <div className="flex flex-col gap-6">
          {/* Availability Card */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-teal-50/80 to-emerald-50/50 pb-3">
                <CardTitle className="text-lg font-semibold">Availability</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex flex-col items-center gap-4">
                  <div className={`relative flex size-24 items-center justify-center rounded-full ${
                    isOnline
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg shadow-gray-400/30'
                  } transition-all duration-500`}>
                    {isOnline ? (
                      <Wifi className="size-10 text-white" />
                    ) : (
                      <WifiOff className="size-10 text-white" />
                    )}
                    {isOnline && (
                      <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-emerald-300 shadow-md">
                        <span className="size-2 rounded-full bg-white animate-ping" />
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${isOnline ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {isOnline ? 'You are Online' : 'You are Offline'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isOnline ? 'Jobs can be assigned to you' : 'Go online to receive new jobs'}
                    </p>
                  </div>
                  <Button
                    className={`w-full font-semibold shadow-lg transition-all ${
                      isOnline
                        ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-red-500/25 hover:shadow-xl'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 hover:shadow-xl'
                    }`}
                    onClick={handleToggleAvailability}
                    disabled={isTogglingAvailability}
                  >
                    {isOnline ? (
                      <>
                        <WifiOff className="mr-2 size-4" />
                        Go Offline
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 size-4" />
                        Go Online
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-sky-50/80 to-blue-50/50 pb-3">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 p-4">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(action.nav)}
                    className={`flex w-full items-center gap-3 rounded-xl bg-gradient-to-r ${action.gradient} p-3.5 text-white shadow-lg ${action.shadow} transition-shadow hover:shadow-xl`}
                  >
                    <action.icon className="size-5" />
                    <span className="text-sm font-semibold">{action.label}</span>
                    <ChevronRight className="ml-auto size-4 opacity-60" />
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ── Recent Job History ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
            <CardTitle className="text-lg font-semibold">Recent Completed Jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('technician-jobs')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              View All <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {completedJobsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            ) : completedJobs.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Timer className="size-8 text-emerald-300" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No completed jobs yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Your completed jobs will appear here</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="divide-y divide-border/50">
                  {completedJobs.map((job, idx) => (
                    <motion.button
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate('technician-job-detail', { jobId: job.id })}
                      className="group flex w-full items-center gap-4 p-4 text-left transition-all hover:bg-emerald-50/30"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
                        <CheckCircle2 className="size-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {job.service?.title || 'Service'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.client?.name || 'Client'} &middot;{' '}
                          {new Date(job.scheduledDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-bold text-emerald-600">₹{job.finalPrice?.toLocaleString()}</span>
                        <StatusBadge status="COMPLETED" />
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-emerald-500 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Earnings Summary ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-teal-50/80 to-cyan-50/50 pb-3">
            <CardTitle className="text-lg font-semibold">Earnings Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('technician-earnings')} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
              Details <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {earningsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Today', value: `₹${todayEarnings.toLocaleString()}`, gradient: 'from-emerald-400 to-teal-500' },
                  { label: 'This Week', value: `₹${weekEarnings.toLocaleString()}`, gradient: 'from-sky-400 to-blue-500' },
                  { label: 'This Month', value: `₹${monthEarnings.toLocaleString()}`, gradient: 'from-cyan-400 to-blue-500' },
                  { label: 'All Time', value: `₹${totalEarnings.toLocaleString()}`, gradient: 'from-rose-400 to-pink-500' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/30 p-4 text-center transition-colors hover:bg-muted/50">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`mt-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-lg font-bold text-transparent`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Complete Job OTP Dialog ── */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-500" />
              Complete Job
            </DialogTitle>
            <DialogDescription>
              Enter the OTP provided by the client to mark this job as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="rounded-2xl bg-emerald-50 p-6 text-center">
              <p className="text-sm text-emerald-700 font-medium">Enter 4-digit OTP</p>
              <InputOTP
                maxLength={4}
                value={otpValue}
                onChange={setOtpValue}
                className="mt-4"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="size-12 text-lg font-bold border-emerald-200 data-[active=true]:border-emerald-400 data-[active=true]:ring-emerald-200/50" />
                  <InputOTPSlot index={1} className="size-12 text-lg font-bold border-emerald-200 data-[active=true]:border-emerald-400 data-[active=true]:ring-emerald-200/50" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={2} className="size-12 text-lg font-bold border-emerald-200 data-[active=true]:border-emerald-400 data-[active=true]:ring-emerald-200/50" />
                  <InputOTPSlot index={3} className="size-12 text-lg font-bold border-emerald-200 data-[active=true]:border-emerald-400 data-[active=true]:ring-emerald-200/50" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Ask the client for the OTP shown on their booking confirmation
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              disabled={mutationLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
              onClick={handleCompleteJob}
              disabled={otpValue.length < 4 || mutationLoading}
            >
              {mutationLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Complete Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  CalendarDays,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Truck,
  Navigation,
  Wrench,
  CircleDot,
  CircleCheck,
  Hash,
  Loader2,
  Check,
  Circle,
  Clock4,
  CreditCard,
  Banknote,
  AlertTriangle,
  Shield,
  Route,
  Zap,
  MessageSquare,
  KeyRound,
} from 'lucide-react';

/* ─── Status Configuration ──────────────────────────────────────────────── */

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pending', icon: Clock4, description: 'Booking placed' },
  { key: 'ASSIGNED', label: 'Assigned', icon: User, description: 'Provider assigned' },
  { key: 'ACCEPTED', label: 'Accepted', icon: CircleCheck, description: 'You accepted' },
  { key: 'ON_THE_WAY', label: 'On the Way', icon: Truck, description: 'En route to client' },
  { key: 'ARRIVED', label: 'Arrived', icon: Navigation, description: 'At service location' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench, description: 'Service in progress' },
  { key: 'COMPLETED', label: 'Completed', icon: CircleDot, description: 'Service completed' },
] as const;

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/30', dotColor: 'bg-[#FFD54F]' },
    ASSIGNED: { className: 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/30', dotColor: 'bg-[#E0B84C]' },
    ACCEPTED: { className: 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/30', dotColor: 'bg-[#FFD54F]' },
    ON_THE_WAY: { className: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-400' },
    ARRIVED: { className: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotColor: 'bg-indigo-400' },
    IN_PROGRESS: { className: 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/30', dotColor: 'bg-[#E0B84C]' },
    COMPLETED: { className: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', dotColor: 'bg-[#E0B84C]' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
    REJECTED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

/* ─── Live Tracking Timeline (shared with client) ───────────────────────── */

function LiveTrackingTimeline({ status, statusHistory }: { status: string; statusHistory?: Record<string, string> }) {
  const isCancelled = ['CANCELLED', 'REJECTED'].includes(status);
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
          <XCircle className="size-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-red-700">Booking {status === 'REJECTED' ? 'Rejected' : 'Cancelled'}</p>
          <p className="text-sm text-red-600">This booking was not completed</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        const timestamp = statusHistory?.[step.key];

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Vertical connector line */}
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`absolute left-[17px] top-[36px] h-[calc(100%-28px)] w-0.5 transition-colors duration-500 ${
                  isCompleted ? 'bg-[#E0B84C]' : isCurrent ? 'bg-gradient-to-b from-[#E0B84C] to-gray-200' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Icon circle */}
            <div className="relative z-10 shrink-0">
              {isCompleted ? (
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-md shadow-[#FFD54F]/25">
                  <Check className="size-4 text-[#0A1F44]" />
                </div>
              ) : isCurrent ? (
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#E0B84C] opacity-30" />
                  <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E0B84C] to-[#FFD54F] shadow-lg shadow-[#FFD54F]/30">
                    <step.icon className="size-4 text-[#0A1F44]" />
                  </div>
                </div>
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50">
                  <Circle className="size-3 text-gray-300" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isCompleted ? 'text-[#132D5E]' : isCurrent ? 'text-[#FFD54F]' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-[#FFD54F]/10 px-2 py-0.5 text-[10px] font-bold text-[#132D5E]">
                    CURRENT
                  </span>
                )}
              </div>
              <p className={`text-xs ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>
                {step.description}
              </p>
              {timestamp && (
                <p className="mt-0.5 text-[11px] font-medium text-[#FFD54F]/70">
                  {new Date(timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Booking Interface ─────────────────────────────────────────────────── */

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  bookingType?: 'NORMAL' | 'EMERGENCY';
  otp?: string;
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  basePrice: number;
  platformFee: number;
  emergencyCharge?: number;
  weekendCharge?: number;
  distanceCharge?: number;
  providerEarnings: number;
  serviceAddress: string;
  specialInstructions?: string;
  distanceKm?: number;
  contactShared?: boolean;
  paymentStatus?: string;
  service: { id: string; title: string; basePrice: number; images?: string };
  client?: { id: string; name: string; profileImageUrl?: string; phone?: string; email?: string };
  provider?: { id: string; name: string; profileImageUrl?: string };
  statusHistory?: Record<string, string>;
  createdAt: string;
}

/* ─── OTP Verification Component ────────────────────────────────────────── */

function OTPVerification({
  onVerify,
  loading,
}: {
  onVerify: (otp: string) => void;
  loading: boolean;
}) {
  const [otpValue, setOtpValue] = useState('');
  const isComplete = otpValue.length === 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <KeyRound className="size-4" />
        <span>Enter the 4-digit OTP provided by the client to complete the service</span>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <InputOTP maxLength={4} value={otpValue} onChange={setOtpValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="size-12 text-lg font-bold rounded-l-xl" />
            <InputOTPSlot index={1} className="size-12 text-lg font-bold" />
            <InputOTPSlot index={2} className="size-12 text-lg font-bold" />
            <InputOTPSlot index={3} className="size-12 text-lg font-bold rounded-r-xl" />
          </InputOTPGroup>
        </InputOTP>
        <Button
          className="w-full rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 sm:w-auto"
          onClick={() => onVerify(otpValue)}
          disabled={!isComplete || loading}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 size-4" />
          )}
          Verify & Complete
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function ProviderBookingDetailPage() {
  const { navigate, nav, goBack } = useApp();
  const bookingId = nav.params.bookingId;
  const { data: booking, loading, refetch } = useApi<Booking>(bookingId ? `/api/bookings/${bookingId}` : null);
  const { mutate, loading: actionLoading } = useApiMutation();

  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleAction = async (action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // handled
    }
  };

  const handleReject = async () => {
    try {
      await mutate(`/api/bookings/${bookingId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectDialog(false);
      setRejectReason('');
      refetch();
    } catch {
      // handled
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setVerifyLoading(true);
    try {
      await mutate(`/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ otp }),
      });
      setOtpMode(false);
      refetch();
    } catch {
      // handled
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48 rounded-xl" />
        <Skeleton className="mb-4 h-48 rounded-2xl" />
        <Skeleton className="mb-4 h-32 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/5">
          <AlertTriangle className="size-8 text-[#FFD54F]" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">Booking not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('provider-bookings')}>
          <ArrowLeft className="mr-2 size-4" /> Back to Bookings
        </Button>
      </div>
    );
  }

  const isActive = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status);
  const contactShared = booking.contactShared ?? isActive;

  const getActionButtons = () => {
    switch (booking.status) {
      case 'PENDING':
      case 'ASSIGNED':
        return (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25"
              onClick={() => handleAction('accept')}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Accept Booking
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setRejectDialog(true)}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 size-4" /> Reject
            </Button>
          </div>
        );
      case 'ACCEPTED':
        return (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25 sm:w-auto"
            onClick={() => handleAction('on-the-way')}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Truck className="mr-2 size-4" />}
            On the Way
          </Button>
        );
      case 'ON_THE_WAY':
        return (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 sm:w-auto"
            onClick={() => handleAction('arrived')}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Navigation className="mr-2 size-4" />}
            Arrived at Location
          </Button>
        );
      case 'ARRIVED':
        return (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 sm:w-auto"
            onClick={() => handleAction('start')}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wrench className="mr-2 size-4" />}
            Start Work
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <div className="space-y-4">
            {!otpMode ? (
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 sm:w-auto"
                onClick={() => setOtpMode(true)}
              >
                <CheckCircle2 className="mr-2 size-4" /> Complete Service
              </Button>
            ) : (
              <OTPVerification onVerify={handleOTPVerify} loading={verifyLoading} />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back" className="shrink-0 rounded-xl">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold sm:text-2xl">#{booking.bookingNumber}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Emergency Banner */}
      {booking.bookingType === 'EMERGENCY' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-[#FFD54F]/10 p-4"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <Zap className="size-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-red-700">Emergency Booking</p>
            <p className="text-sm text-red-600">Priority service — respond quickly</p>
          </div>
        </motion.div>
      )}

      {/* Live Tracking Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#FFD54F] via-[#E0B84C] to-[#FFD54F]" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                <Navigation className="size-4 text-[#0A1F44]" />
              </div>
              Live Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <LiveTrackingTimeline status={booking.status} statusHistory={booking.statusHistory} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Client Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                <User className="size-4 text-[#0A1F44]" />
              </div>
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FFD54F]/10">
                <User className="size-6 text-[#FFD54F]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{booking.client?.name}</p>
                {booking.client?.email && (
                  <p className="text-sm text-muted-foreground">{booking.client?.email}</p>
                )}
              </div>
            </div>

            {/* Client Address */}
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                <MapPin className="size-5 text-pink-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Service Address</p>
                <p className="font-medium">{booking.serviceAddress || 'Address not provided'}</p>
                {booking.distanceKm && (
                  <p className="text-xs text-muted-foreground">{booking.distanceKm} km away</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Client */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {contactShared && booking.client?.phone ? (
          <div className="mb-6 rounded-2xl border border-[#FFD54F]/30 bg-gradient-to-r from-[#FFD54F]/10 to-[#FFD54F]/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0B84C] to-[#FFD54F] shadow-md shadow-[#FFD54F]/25">
                <Phone className="size-5 text-[#0A1F44]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#FFD54F]">Client Contact</p>
                <a href={`tel:${booking.client?.phone}`} className="text-lg font-bold text-[#0A1F44] hover:underline">
                  {booking.client?.phone}
                </a>
              </div>
              <Button
                size="sm"
                className="shrink-0 rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25"
                asChild
              >
                <a href={`tel:${booking.client?.phone}`}>
                  <Phone className="mr-1.5 size-3.5" /> Call
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-[#FFD54F]/30 bg-[#FFD54F]/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                <Shield className="size-5 text-[#FFD54F]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#FFD54F]">Client contact will be available after you accept the booking</p>
                <p className="text-xs text-[#FFD54F]">Accept the booking to view client details</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Service Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                <Briefcase className="size-4 text-[#0A1F44]" />
              </div>
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-[#FFD54F]" />
              <span className="font-semibold">{booking.service?.title}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span>{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span>{booking.scheduledTime}</span>
              </div>
            </div>
            {booking.specialInstructions && (
              <>
                <Separator />
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Special Instructions</p>
                    <p className="text-sm">{booking.specialInstructions}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                <Banknote className="size-4 text-[#0A1F44]" />
              </div>
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Banknote className="size-4" /> Base Price
                </span>
                <span className="font-medium">₹{booking.basePrice?.toLocaleString()}</span>
              </div>
              {booking.emergencyCharge && booking.emergencyCharge > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-red-600">
                    <Zap className="size-4" /> Emergency Charge
                  </span>
                  <span className="font-medium text-red-600">+₹{booking.emergencyCharge.toLocaleString()}</span>
                </div>
              )}
              {booking.weekendCharge && booking.weekendCharge > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" /> Weekend Charge
                  </span>
                  <span className="font-medium">+₹{booking.weekendCharge.toLocaleString()}</span>
                </div>
              )}
              {booking.distanceCharge && booking.distanceCharge > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Route className="size-4" /> Distance Charge
                  </span>
                  <span className="font-medium">+₹{booking.distanceCharge.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="size-4" /> Platform Fee
                </span>
                <span className="font-medium">+₹{booking.platformFee?.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-gradient">₹{booking.finalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[#FFD54F]">
                <span className="flex items-center gap-2 font-medium">
                  <Banknote className="size-4" /> Your Earnings
                </span>
                <span className="font-bold">₹{booking.providerEarnings?.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <AnimatePresence>
        {getActionButtons() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm border-l-4 border-l-[#E0B84C]">
              <CardContent className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</p>
                {getActionButtons()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation back */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => navigate('provider-bookings')}
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Bookings
        </Button>
      </motion.div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject booking #{booking.bookingNumber}? The client will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection (optional)</Label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Schedule conflict, too far away..."
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading} className="rounded-xl">
              {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

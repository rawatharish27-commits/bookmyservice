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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Star,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Check,
  Phone,
  FileText,
  Shield,
  Zap,
  Navigation,
  Clock4,
  Truck,
  Wrench,
  CircleCheck,
  CircleDot,
  Circle,
  CreditCard,
  Hash,
  Banknote,
  Tag,
  Route,
  Receipt,
} from 'lucide-react';

/* ─── Status Configuration ──────────────────────────────────────────────── */

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pending', icon: Clock4, description: 'Booking placed' },
  { key: 'ASSIGNED', label: 'Assigned', icon: User, description: 'Provider assigned' },
  { key: 'ACCEPTED', label: 'Accepted', icon: CircleCheck, description: 'Provider accepted' },
  { key: 'ON_THE_WAY', label: 'On the Way', icon: Truck, description: 'Provider en route' },
  { key: 'ARRIVED', label: 'Arrived', icon: Navigation, description: 'Provider at location' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench, description: 'Service in progress' },
  { key: 'COMPLETED', label: 'Completed', icon: CircleDot, description: 'Service completed' },
] as const;

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-400' },
    ASSIGNED: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    ACCEPTED: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    ON_THE_WAY: { className: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-400' },
    ARRIVED: { className: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotColor: 'bg-indigo-400' },
    IN_PROGRESS: { className: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20', dotColor: 'bg-[#0A1F44]' },
    COMPLETED: { className: 'bg-[#FFD54F]/10 text-emerald-700 border-[#0A1F44]/20', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
    REFUNDED: { className: 'bg-gray-50 text-gray-700 border-gray-200', dotColor: 'bg-gray-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

/* ─── Live Tracking Timeline ────────────────────────────────────────────── */

function LiveTrackingTimeline({ status, statusHistory }: { status: string; statusHistory?: Record<string, string> }) {
  const isCancelled = ['CANCELLED', 'REFUNDED'].includes(status);
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-r [#8B0000]/10 to-[#8B0000]/5 p-4"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
          <XCircle className="size-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-red-700">Booking {status === 'REFUNDED' ? 'Refunded' : 'Cancelled'}</p>
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
                  isCompleted ? 'bg-emerald-400' : isCurrent ? 'bg-gradient-to-b from-emerald-400 to-gray-200' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Icon circle */}
            <div className="relative z-10 shrink-0">
              {isCompleted ? (
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br [#0A1F44] to-[#132D5E] shadow-md shadow-[#0A1F44]/25">
                  <Check className="size-4 text-white" />
                </div>
              ) : isCurrent ? (
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30" />
                  <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br [#0A1F44] to-[#132D5E] shadow-lg shadow-[#0A1F44]/30">
                    <step.icon className="size-4 text-white" />
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
                <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-[#0A1F44]' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-[#0A1F44]/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    CURRENT
                  </span>
                )}
              </div>
              <p className={`text-xs ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>
                {step.description}
              </p>
              {timestamp && (
                <p className="mt-0.5 text-[11px] font-medium text-[#0A1F44]/70">
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

/* ─── Booking Detail Interface ──────────────────────────────────────────── */

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  bookingType?: 'NORMAL' | 'EMERGENCY';
  otp?: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceAddress: string;
  basePrice: number;
  emergencyCharge?: number;
  weekendCharge?: number;
  distanceCharge?: number;
  platformFee: number;
  couponDiscount?: number;
  finalPrice: number;
  negotiatedPrice?: number;
  specialInstructions?: string;
  cancellationReason?: string;
  paymentStatus: string;
  escrowStatus?: string;
  contactShared?: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  statusHistory?: Record<string, string>;
  service?: {
    id: string;
    title: string;
    description: string;
    basePrice: number;
    provider?: { id: string; name: string; phone: string; profileImageUrl?: string };
  };
  provider?: { id: string; name: string; phone: string; profileImageUrl?: string };
  review?: { id: string; rating: number; comment?: string };
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function ClientBookingDetailPage() {
  const { nav, goBack, navigate } = useApp();
  const bookingId = nav.params?.bookingId;
  const { data, loading, refetch } = useApi<BookingDetail>(bookingId ? `/api/bookings/${bookingId}` : null);
  const { mutate: cancelBooking, loading: cancelling } = useApiMutation();
  const { mutate: submitReview, loading: submittingReview } = useApiMutation();

  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const booking = data as BookingDetail | null;

  const handleCancel = async () => {
    if (!bookingId) return;
    try {
      await cancelBooking(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setCancelDialog(false);
      setCancelReason('');
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const handleReview = async () => {
    if (!booking) return;
    try {
      await submitReview('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking.id,
          serviceId: booking.service?.id,
          reviewedId: booking.provider?.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      setReviewDialog(false);
      setReviewComment('');
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-40 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-60 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br [#0A1F44]/10 to-[#132D5E]/5">
          <AlertTriangle className="size-8 text-[#D4A017]" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">Booking not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const canCancel = ['PENDING', 'ASSIGNED', 'ACCEPTED'].includes(booking.status);
  const canReview = booking.status === 'COMPLETED' && !booking.review;
  const provider = booking.service?.provider || booking.provider;
  const isActive = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status);
  const contactShared = booking.contactShared ?? isActive;

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
          <h1 className="truncate text-xl font-bold sm:text-2xl">Booking {booking.bookingNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </motion.div>

      {/* Emergency Banner */}
      {booking.bookingType === 'EMERGENCY' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-r [#8B0000]/10 to-[#0A1F44]/5 p-4"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <Zap className="size-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-red-700">Emergency Booking</p>
            <p className="text-sm text-red-600">Priority service with fastest response time</p>
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
          <div className="h-1.5 bg-gradient-to-r [#0A1F44] via-[#132D5E] to-[#0A1F44]" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br [#0A1F44] to-[#132D5E]">
                <Navigation className="size-4 text-white" />
              </div>
              Live Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <LiveTrackingTimeline status={booking.status} statusHistory={booking.statusHistory} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br [#0A1F44] to-[#132D5E]">
                <Briefcase className="size-4 text-white" />
              </div>
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{booking.service?.title || 'Service'}</p>
              <p className="text-sm text-muted-foreground">{booking.service?.description}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Provider */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0A1F44]/10">
                  <User className="size-5 text-[#0A1F44]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="truncate font-medium">{provider?.name || 'Provider'}</p>
                </div>
              </div>
              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0A1F44]/10">
                  <CalendarDays className="size-5 text-[#0A1F44]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="truncate font-medium">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                  <Clock className="size-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium">{booking.scheduledTime}</p>
                </div>
              </div>
              {/* Booking Type */}
              <div className="flex items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${booking.bookingType === 'EMERGENCY' ? 'bg-red-100' : 'bg-[#0A1F44]/10'}`}>
                  {booking.bookingType === 'EMERGENCY' ? (
                    <Zap className="size-5 text-red-600" />
                  ) : (
                    <Briefcase className="size-5 text-[#0A1F44]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{booking.bookingType || 'NORMAL'}</p>
                </div>
              </div>
            </div>
            <Separator />
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                <MapPin className="size-5 text-pink-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Service Address</p>
                <p className="font-medium">{booking.serviceAddress}</p>
              </div>
            </div>
            {/* OTP Display */}
            {booking.otp && ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status) && (
              <>
                <Separator />
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#D4A017]/10">
                      <Hash className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-600">Service OTP</p>
                      <p className="text-sm text-amber-800">Share with provider on arrival</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 font-mono text-2xl font-bold tracking-widest text-amber-700 shadow-sm">
                    {booking.otp}
                  </div>
                </div>
              </>
            )}
            {/* Special Instructions */}
            {booking.specialInstructions && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
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

      {/* Contact Provider */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {contactShared && provider?.phone ? (
          <div className="mb-6 rounded-2xl border border-[#0A1F44]/20 bg-gradient-to-r [#FFD54F]/10 to-[#0A1F44]/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br [#0A1F44] to-[#132D5E] shadow-md shadow-[#0A1F44]/25">
                <Phone className="size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#0A1F44]">Provider Contact</p>
                <a href={`tel:${provider.phone}`} className="text-lg font-bold text-[#0A1F44] hover:underline">
                  {provider.phone}
                </a>
              </div>
              <Button
                size="sm"
                className="shrink-0 rounded-xl bg-gradient-to-r [#0A1F44] to-[#132D5E] text-white shadow-lg shadow-[#0A1F44]/25"
                asChild
              >
                <a href={`tel:${provider.phone}`}>
                  <Phone className="mr-1.5 size-3.5" /> Call
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#D4A017]/10">
                <Shield className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Contact will be available after provider accepts</p>
                <p className="text-xs text-amber-600">Provider details are shared once the booking is confirmed</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Price Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br [#0A1F44] to-[#132D5E]">
                <Receipt className="size-4 text-white" />
              </div>
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            {booking.couponDiscount && booking.couponDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#0A1F44]">
                  <Tag className="size-4" /> Coupon Discount
                </span>
                <span className="font-medium text-[#0A1F44]">-₹{booking.couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-gradient">₹{booking.finalPrice?.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment & Escrow Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br [#0A1F44] to-[#132D5E]">
                <CreditCard className="size-4 text-white" />
              </div>
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment</span>
              <Badge
                variant="outline"
                className={
                  booking.paymentStatus === 'PAID'
                    ? 'bg-[#FFD54F]/10 text-emerald-700 border-[#0A1F44]/20'
                    : booking.paymentStatus === 'REFUNDED'
                    ? 'bg-gray-50 text-gray-700 border-gray-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }
              >
                {booking.paymentStatus}
              </Badge>
            </div>
            {booking.escrowStatus && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Escrow</span>
                <Badge
                  variant="outline"
                  className={
                    booking.escrowStatus === 'RELEASED'
                      ? 'bg-[#FFD54F]/10 text-emerald-700 border-[#0A1F44]/20'
                      : booking.escrowStatus === 'HELD'
                      ? 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {booking.escrowStatus}
                </Badge>
              </div>
            )}
            {/* Trust badge */}
            <div className="flex items-center gap-2 rounded-xl bg-[#FFD54F]/10/50 px-3 py-2">
              <Shield className="size-4 text-[#0A1F44]" />
              <span className="text-xs font-medium text-emerald-700">Your payment is protected by our escrow system</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice Link */}
      <AnimatePresence>
        {booking.invoiceId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.35 }}
          >
            <button
              onClick={() => navigate('client-invoice-detail', { invoiceId: booking.invoiceId! })}
              className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-[#0A1F44]/20 bg-gradient-to-r [#FFD54F]/10 to-[#0A1F44]/5 p-4 text-left transition-all hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br [#0A1F44] to-[#132D5E] shadow-md shadow-[#0A1F44]/25">
                <FileText className="size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#0A1F44]/90">View Invoice</p>
                <p className="text-sm text-[#0A1F44]">
                  {booking.invoiceNumber || `Invoice #${booking.invoiceId}`}
                </p>
              </div>
              <ArrowLeft className="size-5 rotate-180 text-[#D4A017]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Review */}
      {booking.review && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br [#D4A017] to-[#0A1F44]">
                  <Star className="size-4 text-white" />
                </div>
                Your Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${i < booking.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              {booking.review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{booking.review.comment}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Review Section - Leave a Review */}
      <AnimatePresence>
        {canReview && !reviewDialog && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm border-l-4 border-l-[#D4A017]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br [#D4A017] to-[#0A1F44]">
                    <Star className="size-4 text-white" />
                  </div>
                  Leave a Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  How was your experience with {booking.service?.title}?
                </p>
                {/* Star Rating */}
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(i + 1)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="transition-colors"
                    >
                      <Star
                        className={`size-8 ${i < reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    </motion.button>
                  ))}
                </div>
                {/* Comment */}
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience... (optional)"
                  rows={3}
                  className="rounded-xl resize-none"
                />
                <Button
                  className="w-full rounded-xl bg-gradient-to-r [#0A1F44] to-[#132D5E] text-white shadow-lg shadow-[#0A1F44]/25"
                  onClick={handleReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Star className="mr-2 size-4" />
                  )}
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardContent className="flex flex-wrap gap-3 p-4">
            {canCancel && (
              <Button
                variant="outline"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setCancelDialog(true)}
              >
                <XCircle className="mr-2 size-4" />
                Cancel Booking
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate('client-bookings')}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Bookings
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#FFD54F]/10"
              onClick={() => navigate('home', {})}
            >
              <AlertTriangle className="mr-2 size-4" />
              Raise Dispute
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {booking.bookingNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for cancellation (optional)</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling..."
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)} className="rounded-xl">
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling} className="rounded-xl">
              {cancelling && <Loader2 className="mr-2 size-4 animate-spin" />}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

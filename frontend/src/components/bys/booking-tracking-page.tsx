'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { useTracking } from '@/hooks/use-tracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Navigation,
  Clock,
  User,
  Star,
  Truck,
  MapPin,
  Wifi,
  WifiOff,
  Loader2,
  Phone,
  CheckCircle2,
  Circle,
  CircleDot,
  Wrench,
  Clock4,
  RefreshCw,
  Crosshair,
  Route,
  Activity,
} from 'lucide-react';

/* ─── Status Configuration ──────────────────────────────────────────────── */

const TRACKING_STEPS = [
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2, description: 'Provider accepted' },
  { key: 'ON_THE_WAY', label: 'On the Way', icon: Truck, description: 'Provider en route' },
  { key: 'ARRIVED', label: 'Arrived', icon: Navigation, description: 'Provider at location' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench, description: 'Service in progress' },
  { key: 'COMPLETED', label: 'Completed', icon: CircleDot, description: 'Service completed' },
] as const;

function TrackingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    ACCEPTED: { className: 'bg-[#1D63FF]/10 text-[#0D3B7A] border-[#1D63FF]/30', dotColor: 'bg-[#4D8AFF]' },
    ON_THE_WAY: { className: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-400' },
    ARRIVED: { className: 'bg-[#FFCE32]/10 text-[#0D3B7A] border-[#FFCE32]/30', dotColor: 'bg-[#4D8AFF]' },
    IN_PROGRESS: { className: 'bg-[#1D63FF]/10 text-[#1D63FF] border-[#1D63FF]/30', dotColor: 'bg-[#7DB0FF]' },
    COMPLETED: { className: 'bg-[#FFCE32]/10 text-[#0D3B7A] border-[#FFCE32]/30', dotColor: 'bg-[#7DB0FF]' },
    PENDING: { className: 'bg-gray-50 text-gray-700 border-gray-200', dotColor: 'bg-gray-400' },
    ASSIGNED: { className: 'bg-[#1D63FF]/10 text-[#0D3B7A] border-[#1D63FF]/30', dotColor: 'bg-[#4D8AFF]' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

/* ─── Booking Detail Interface ──────────────────────────────────────────── */

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceAddress: string;
  finalPrice: number;
  service?: {
    id: string;
    title: string;
    provider?: { id: string; name: string; phone: string; profileImageUrl?: string };
  };
  provider?: { id: string; name: string; phone: string; profileImageUrl?: string };
  statusHistory?: Record<string, string>;
}

interface TrackingData {
  bookingId: string;
  bookingStatus: string;
  providerLocation?: { lat: number; lng: number; accuracy?: number; timestamp: string };
  timeline?: Array<{ status: string; timestamp: string; note?: string }>;
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function BookingTrackingPage() {
  const { nav, goBack, navigate } = useApp();
  const bookingId = nav.params?.bookingId;

  const { data: booking, loading } = useApi<BookingDetail>(bookingId ? `/api/bookings/${bookingId}` : null);
  const { data: trackingData } = useApi<TrackingData>(bookingId ? `/api/tracking/${bookingId}?XTransformPort=3001` : null);

  const {
    isConnected,
    location,
    bookingStatus: liveBookingStatus,
    eta,
    notifications,
    joinBooking,
    leaveBooking,
  } = useTracking();

  // Join booking room on mount, leave on unmount
  useEffect(() => {
    if (bookingId && isConnected) {
      joinBooking(bookingId);
    }
    return () => {
      if (bookingId) {
        leaveBooking(bookingId);
      }
    };
  }, [bookingId, isConnected, joinBooking, leaveBooking]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-64 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-40 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFCE32]/10 to-[#FFCE32]/5">
          <Navigation className="size-8 text-[#7DB0FF]" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">Booking not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const provider = booking.service?.provider || booking.provider;
  const currentStatus = liveBookingStatus || trackingData?.bookingStatus || booking.status;
  const providerLocation = location || trackingData?.providerLocation || null;
  const timeline = trackingData?.timeline || [];

  // Derive a pulse key from location data to trigger CSS animation on change
  const locationKey = providerLocation
    ? `${providerLocation.lat.toFixed(6)}-${providerLocation.lng.toFixed(6)}`
    : '';

  // Merge status history with live timeline
  const mergedHistory: Record<string, string> = {};
  if (booking.statusHistory) {
    Object.assign(mergedHistory, booking.statusHistory);
  }
  for (const entry of timeline) {
    if (entry.status && entry.timestamp) {
      mergedHistory[entry.status] = entry.timestamp;
    }
  }

  const isTrackable = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(currentStatus);

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
          <h1 className="truncate text-xl font-bold sm:text-2xl">Live Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Booking {booking.bookingNumber}
          </p>
        </div>
        <TrackingStatusBadge status={currentStatus} />
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className={`mb-4 flex items-center gap-2 rounded-xl p-2.5 text-sm ${
          isConnected
            ? 'bg-[#FFCE32]/10 text-[#0D3B7A]'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="size-4" />
              <span className="font-medium">Connected</span>
              <span className="text-xs opacity-70">- Receiving live updates</span>
            </>
          ) : (
            <>
              <WifiOff className="size-4" />
              <span className="font-medium">Reconnecting</span>
              <span className="text-xs opacity-70">- Updates may be delayed</span>
              <Loader2 className="ml-auto size-3.5 animate-spin" />
            </>
          )}
        </div>
      </motion.div>

      {/* Not Trackable Notice */}
      {!isTrackable && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm border-l-4 border-l-amber-400">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <Clock4 className="size-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Tracking Not Available Yet</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Live tracking will be available once the provider accepts your booking and is on the way.
                    You can stay on this page to get real-time updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Live Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF]">
                <MapPin className="size-4 text-white" />
              </div>
              Provider Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-56 overflow-hidden rounded-xl bg-gradient-to-br from-[#FFCE32]/10 via-[#1D63FF]/5 to-[#FFCE32]/5 sm:h-72">
              {/* Grid lines for map effect */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute h-px w-full bg-[#7DB0FF]"
                    style={{ top: `${(i + 1) * 12.5}%` }}
                  />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full w-px bg-[#7DB0FF]"
                    style={{ left: `${(i + 1) * 12.5}%` }}
                  />
                ))}
              </div>

              {/* Map label */}
              <div className="absolute left-3 top-3 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-[#0D3B7A] backdrop-blur-sm">
                Live Map
              </div>

              {/* Provider location dot */}
              {providerLocation ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Pulse ring - key remount triggers CSS ping animation */}
                  <div key={`pulse-${locationKey}`} className="absolute animate-ping">
                    <div className="size-20 rounded-full bg-[#7DB0FF]/20" />
                  </div>
                  {/* Static ring */}
                  <div className="absolute">
                    <div className="size-12 rounded-full bg-[#7DB0FF]/30" />
                  </div>
                  {/* Center dot */}
                  <div className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] shadow-lg shadow-[#1D63FF]/40">
                    <Navigation className="size-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/60">
                    <Crosshair className="size-6 text-[#7DB0FF]" />
                  </div>
                  <p className="text-sm font-medium text-[#1D63FF]">Waiting for location data</p>
                </div>
              )}

              {/* Coordinates display */}
              {providerLocation && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs backdrop-blur-sm">
                  <Crosshair className="size-3.5 shrink-0 text-[#4D8AFF]" />
                  <span className="font-mono text-[#0A2463]">
                    Lat: {providerLocation.lat.toFixed(6)}, Lng: {providerLocation.lng.toFixed(6)}
                  </span>
                  {providerLocation.accuracy && (
                    <span className="ml-auto text-muted-foreground">
                      ~{Math.round(providerLocation.accuracy)}m accuracy
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ETA & Provider Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ETA Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-md shadow-purple-500/25">
                <Clock className="size-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Estimated Arrival</p>
                {eta != null ? (
                  <p className="text-2xl font-bold">{eta} min</p>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground">Calculating...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Provider Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF] shadow-md shadow-[#1D63FF]/25">
                  {provider?.profileImageUrl ? (
                    <img
                      src={provider.profileImageUrl}
                      alt={provider.name}
                      className="size-12 rounded-xl object-cover"
                    />
                  ) : (
                    <User className="size-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{provider?.name || 'Provider'}</p>
                  <div className="flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Service Provider</span>
                  </div>
                </div>
                {provider?.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 rounded-xl"
                    asChild
                  >
                    <a href={`tel:${provider.phone}`}>
                      <Phone className="size-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Booking Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#7DB0FF] via-[#4D8AFF] to-[#FFCE32]" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF]">
                <Route className="size-4 text-white" />
              </div>
              Booking Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="relative space-y-0">
              {TRACKING_STEPS.map((step, i) => {
                const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === currentStatus);
                const isCompleted = i < currentIndex;
                const isCurrent = i === currentIndex;
                const timestamp = mergedHistory[step.key];

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* Vertical connector line */}
                    {i < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[17px] top-[36px] h-[calc(100%-28px)] w-0.5 transition-colors duration-500 ${
                          isCompleted ? 'bg-[#7DB0FF]' : isCurrent ? 'bg-gradient-to-b from-[#7DB0FF] to-gray-200' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Icon circle */}
                    <div className="relative z-10 shrink-0">
                      {isCompleted ? (
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF] shadow-md shadow-[#1D63FF]/25">
                          <CheckCircle2 className="size-4 text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="relative">
                          <div className="absolute inset-0 animate-ping rounded-full bg-[#7DB0FF] opacity-30" />
                          <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] shadow-lg shadow-[#1D63FF]/30">
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
                        <p className={`text-sm font-semibold ${isCompleted ? 'text-[#0D3B7A]' : isCurrent ? 'text-[#1D63FF]' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-[#FFCE32]/10 px-2 py-0.5 text-[10px] font-bold text-[#0D3B7A]">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>
                        {step.description}
                      </p>
                      {timestamp && (
                        <p className="mt-0.5 text-[11px] font-medium text-[#1D63FF]/70">
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Notifications */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF]">
                  <Activity className="size-4 text-white" />
                </div>
                Live Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {notifications.slice().reverse().map((notif, i) => (
                  <motion.div
                    key={`${notif.timestamp}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 rounded-lg bg-[#1D63FF]/10/50 p-2.5"
                  >
                    <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#4D8AFF]" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#0A2463]">{notif.message}</p>
                      <p className="text-[10px] text-[#1D63FF]/70">
                        {new Date(notif.timestamp).toLocaleString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Service Location Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                <MapPin className="size-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Service Address</p>
                <p className="font-medium">{booking.serviceAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#1D63FF]/25 rounded-xl h-11"
            onClick={() => navigate('client-booking-detail', { bookingId: bookingId || '' })}
          >
            View Booking Details
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

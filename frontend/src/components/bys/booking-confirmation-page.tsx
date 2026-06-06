import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  MapPin,
  Briefcase,
  User,
  Home,
  ArrowRight,
  Shield,
  Sparkles,
  PartyPopper,
  CreditCard,
} from 'lucide-react';

interface BookingData {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceAddress: string;
  basePrice: number;
  platformFee: number;
  finalPrice: number;
  service?: {
    id: string;
    title: string;
    provider?: { name: string };
  };
  provider?: { name: string };
}

// Confetti particles
function ConfettiParticle({ delay, x, index }: { delay: number; x: number; index: number }) {
  const colors = ['#FFD54F', '#E0B84C', '#FFD54F', '#FFD54F', '#ef4444', '#8b5cf6', '#ec4899'];
  const color = colors[index % colors.length];
  // Deterministic pseudo-random values based on index to avoid hydration mismatch
  const seed = (index * 2654435761) >>> 0;
  const yAnim = -200 - (seed % 200);
  const xAnim = x + ((seed * 7 % 400) - 200);
  const rotate = seed % 720;
  const dur = 1.5 + (seed % 100) / 100;
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
      animate={{
        opacity: 0,
        y: yAnim,
        x: xAnim,
        rotate: rotate,
      }}
      transition={{ duration: dur, delay, ease: 'easeOut' }}
      className="absolute size-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function SuccessCheckmark() {
  return (
    <div className="relative flex size-24 items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] opacity-20"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1.5 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] opacity-10"
      />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-xl shadow-[#E0B84C]/30"
      >
        <motion.div
          initial={{ scale: 0, pathLength: 0 }}
          animate={{ scale: 1, pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <CheckCircle2 className="size-10 text-[#0A1F44]" />
        </motion.div>
      </motion.div>
      {/* Confetti */}
      {Array.from({ length: 12 }).map((_, i) => {
        const seed = ((i + 30) * 2654435761) >>> 0;
        const xPos = ((seed * 13) % 200) - 100;
        return (
          <ConfettiParticle key={i} delay={0.4 + i * 0.05} x={xPos} index={i} />
        );
      })}
    </div>
  );
}

export function BookingConfirmationPage() {
  const { nav, navigate } = useApp();
  const bookingId = nav.params?.bookingId;
  const { data: booking, loading } = useApi<BookingData>(bookingId ? `/api/bookings/${bookingId}` : null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="mx-auto mb-6 size-20 animate-pulse rounded-full bg-muted/50" />
        <div className="mx-auto mb-2 h-8 w-64 animate-pulse rounded-xl bg-muted/50" />
        <div className="mx-auto mb-8 h-4 w-48 animate-pulse rounded-lg bg-muted/50" />
        <div className="mb-4 h-40 w-full animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      {/* Success Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 text-center"
      >
        <div className="flex justify-center">
          <SuccessCheckmark />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="mt-4 text-2xl font-bold">
            <span className="text-gradient">Booking Confirmed!</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your booking has been placed successfully
          </p>
          {booking?.bookingNumber && (
            <div className="mt-3">
              <Badge className="bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] border-0 text-base px-4 py-1.5 shadow-lg shadow-[#E0B84C]/25">
                <Sparkles className="mr-1.5 size-3.5" />
                {booking.bookingNumber}
              </Badge>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Booking Summary Card */}
      <AnimatePresence>
        {showContent && booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#FFD54F] via-[#E0B84C] to-[#FFD54F]" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Briefcase, label: 'Service', value: booking.service?.title || 'Service', gradient: 'from-[#FFD54F] to-[#E0B84C]' },
                  { icon: User, label: 'Provider', value: booking.service?.provider?.name || booking.provider?.name || 'Provider', gradient: 'from-[#E0B84C] to-[#FFD54F]' },
                  { icon: CalendarDays, label: 'Date', value: new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), gradient: 'from-[#F2C94C] to-[#E0B84C]' },
                  { icon: Clock, label: 'Time', value: booking.scheduledTime, gradient: 'from-violet-400 to-purple-500' },
                  { icon: MapPin, label: 'Address', value: booking.serviceAddress, gradient: 'from-pink-400 to-rose-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient}`}>
                      <item.icon className="size-4 text-[#0A1F44]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>₹{booking.basePrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>₹{booking.platformFee?.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-gradient">₹{booking.finalPrice?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Steps */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm border-l-4 border-l-[#E0B84C]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                    <PartyPopper className="size-5 text-[#FFD54F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1F44]">What&apos;s next?</p>
                    <p className="mt-1 text-sm text-[#132D5E]/80">
                      The service provider will review and accept your booking.
                      You&apos;ll receive a notification once confirmed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badge */}
            <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-[#FFD54F]/5 p-3">
              <Shield className="size-4 text-[#FFD54F]" />
              <span className="text-xs text-[#132D5E] font-medium">Your booking is protected by our platform guarantee</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl h-11"
                onClick={() => navigate('client-payment', { bookingId: bookingId || '' })}
              >
                <CreditCard className="mr-2 size-4" /> Pay Now
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/25 rounded-xl h-11"
                onClick={() => navigate('client-booking-detail', { bookingId: bookingId || '' })}
              >
                View Booking <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => navigate('client-dashboard')}
              >
                <Home className="mr-2 size-4" />
                Back to Home
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-[#FFD54F] hover:text-[#132D5E] hover:bg-[#FFD54F]/5 rounded-xl"
                onClick={() => navigate('categories')}
              >
                Book Another Service
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { useRazorpay } from '@/hooks/use-razorpay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Clock,
  MapPin,
  User,
  CreditCard,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Lock,
  Banknote,
  Receipt,
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
  paymentStatus: string;
  service?: {
    id: string;
    title: string;
    provider?: { name: string; profileImageUrl?: string };
  };
  provider?: { name: string; profileImageUrl?: string };
}

type PaymentStep = 'summary' | 'processing' | 'success' | 'failed';

export function PaymentPage() {
  const { nav, goBack, navigate } = useApp();
  const { user } = useAuth();
  const bookingId = nav.params?.bookingId;

  const { data: booking, loading } = useApi<BookingData>(bookingId ? `/api/bookings/${bookingId}` : null);
  const { initiatePayment, isProcessing, error: paymentError, isScriptLoaded } = useRazorpay();

  const [step, setStep] = useState<PaymentStep>('summary');
  const [retryCount, setRetryCount] = useState(0);

  // Derive effective step: if already paid, show success regardless of local state
  const effectiveStep: PaymentStep = booking?.paymentStatus === 'PAID' ? 'success' : step;

  const handlePayNow = async () => {
    if (!booking || !user) return;

    setStep('processing');

    const success = await initiatePayment({
      bookingId: booking.id,
      amount: booking.finalPrice,
      currency: 'INR',
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    if (success) {
      setStep('success');
    } else {
      setStep('failed');
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setStep('summary');
  };

  const handleViewBooking = () => {
    navigate('client-booking-detail', { bookingId: bookingId || '' });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-60 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-40 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D63FF]/10 to-[#1D63FF]/5">
          <Receipt className="size-8 text-[#7DB0FF]" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">Booking not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const provider = booking.service?.provider || booking.provider;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-8">
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
          <h1 className="truncate text-xl font-bold sm:text-2xl">Payment</h1>
          <p className="text-sm text-muted-foreground">
            Complete your payment for booking {booking.bookingNumber}
          </p>
        </div>
      </motion.div>

      {/* Success State */}
      <AnimatePresence>
        {effectiveStep === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF] shadow-xl shadow-[#4D8AFF]/30">
              <CheckCircle2 className="size-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful</h2>
            <p className="mt-2 text-muted-foreground">
              Your payment has been processed successfully
            </p>
            <Badge className="mt-3 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white border-0 px-4 py-1.5">
              {booking.bookingNumber}
            </Badge>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25 rounded-xl h-11"
                onClick={handleViewBooking}
              >
                View Booking
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => navigate('client-dashboard')}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary & Payment Form */}
      {effectiveStep !== 'success' && (
        <>
          {/* Booking Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#7DB0FF] via-[#4D8AFF] to-[#FFCE32]" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF]">
                    <Receipt className="size-4 text-white" />
                  </div>
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Briefcase, label: 'Service', value: booking.service?.title || 'Service', gradient: 'from-[#7DB0FF] to-[#4D8AFF]' },
                  { icon: User, label: 'Provider', value: provider?.name || 'Provider', gradient: 'from-[#4D8AFF] to-[#4D8AFF]' },
                  { icon: CalendarDays, label: 'Date', value: new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }), gradient: 'from-[#FFE066] to-[#4D8AFF]' },
                  { icon: Clock, label: 'Time', value: booking.scheduledTime, gradient: 'from-violet-400 to-purple-500' },
                  { icon: MapPin, label: 'Address', value: booking.serviceAddress, gradient: 'from-pink-400 to-rose-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient}`}>
                      <item.icon className="size-4 text-white" />
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
                  <span>{'\u20B9'}{booking.basePrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>{'\u20B9'}{booking.platformFee?.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-gradient">{'\u20B9'}{booking.finalPrice?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4D8AFF] to-[#4D8AFF]">
                    <CreditCard className="size-4 text-white" />
                  </div>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-xl border border-[#1D63FF]/20 bg-[#1D63FF]/5 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D63FF] to-[#1D63FF] shadow-md shadow-[#1D63FF]/25">
                    <Banknote className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Razorpay Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">
                      Pay with UPI, Cards, Net Banking, or Wallets
                    </p>
                  </div>
                  <Lock className="size-4 text-[#1D63FF]" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Processing State */}
          <AnimatePresence>
            {effectiveStep === 'processing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm border-l-4 border-l-[#4D8AFF]">
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <Loader2 className="size-8 animate-spin text-[#1D63FF]" />
                    <p className="font-semibold text-[#0A2463]">Processing Payment</p>
                    <p className="text-sm text-[#1D63FF] text-center">
                      Please complete the payment in the Razorpay checkout window.
                      Do not close this page or press back.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Failed State */}
          <AnimatePresence>
            {effectiveStep === 'failed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm border-l-4 border-l-red-400">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                        <XCircle className="size-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-700">Payment Failed</p>
                        <p className="mt-1 text-sm text-red-600">
                          {paymentError || 'The payment could not be processed. Please try again.'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                          onClick={handleRetry}
                        >
                          <RefreshCw className="mr-1.5 size-3.5" />
                          Retry Payment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#1D63FF]/5 p-3"
          >
            <Shield className="size-4 text-[#1D63FF]" />
            <span className="text-xs text-[#0D3B7A] font-medium">
              Your payment is secured with 256-bit SSL encryption
            </span>
          </motion.div>

          {/* Pay Now Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              className="w-full bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25 rounded-xl h-12 text-base font-semibold"
              onClick={handlePayNow}
              disabled={isProcessing || !isScriptLoaded || effectiveStep === 'processing'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Processing...
                </>
              ) : !isScriptLoaded ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Loading Payment Gateway...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 size-5" />
                  Pay {'\u20B9'}{booking.finalPrice?.toLocaleString()} Now
                </>
              )}
            </Button>
          </motion.div>

          {/* Error display at bottom if present */}
          {paymentError && effectiveStep !== 'failed' && (
            <p className="mt-3 text-center text-sm text-red-500">{paymentError}</p>
          )}
        </>
      )}
    </div>
  );
}

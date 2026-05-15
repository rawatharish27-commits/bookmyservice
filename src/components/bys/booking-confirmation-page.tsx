'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  MapPin,
  Briefcase,
  User,
  Home,
  ArrowRight,
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

export function BookingConfirmationPage() {
  const { nav, navigate } = useApp();
  const bookingId = nav.params?.bookingId;
  const { data: booking, loading } = useApi<BookingData>(bookingId ? `/api/bookings/${bookingId}` : null);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <Skeleton className="mx-auto mb-6 size-20 rounded-full" />
        <Skeleton className="mx-auto mb-2 h-8 w-64" />
        <Skeleton className="mx-auto mb-8 h-4 w-48" />
        <Skeleton className="mb-4 h-40 w-full" />
        <Skeleton className="mb-4 h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      {/* Success Icon */}
      <div className="mb-6 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-emerald-700">Booking Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Your booking has been placed successfully
        </p>
        {booking?.bookingNumber && (
          <div className="mt-3">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-base px-4 py-1">
              {booking.bookingNumber}
            </Badge>
          </div>
        )}
      </div>

      {/* Booking Summary */}
      {booking && (
        <Card className="mb-6 gap-4">
          <CardHeader>
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 size-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{booking.service?.title || 'Service'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-0.5 size-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="font-medium">{booking.service?.provider?.name || booking.provider?.name || 'Provider'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{booking.scheduledTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{booking.serviceAddress}</p>
              </div>
            </div>

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
              <span className="text-emerald-600">₹{booking.finalPrice?.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50 gap-4">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>What&apos;s next?</strong> The service provider will review and accept your booking.
            You&apos;ll receive a notification once confirmed.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate('client-booking-detail', { bookingId: bookingId || '' })}
        >
          View Booking <ArrowRight className="ml-2 size-4" />
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('client-dashboard')}
        >
          <Home className="mr-2 size-4" />
          Back to Home
        </Button>
      </div>

      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          className="text-emerald-600 hover:text-emerald-700"
          onClick={() => navigate('categories')}
        >
          Book Another Service
        </Button>
      </div>
    </div>
  );
}

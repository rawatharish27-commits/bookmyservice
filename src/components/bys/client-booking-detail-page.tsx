'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string }> = {
    PENDING: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    ACCEPTED: { className: 'bg-blue-100 text-blue-800 border-blue-200' },
    IN_PROGRESS: { className: 'bg-orange-100 text-orange-800 border-orange-200' },
    COMPLETED: { className: 'bg-green-100 text-green-800 border-green-200' },
    CANCELLED: { className: 'bg-red-100 text-red-800 border-red-200' },
    REFUNDED: { className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} text-sm`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

function StatusTimeline({ status }: { status: string }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  const isCancelled = ['CANCELLED', 'REFUNDED'].includes(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <XCircle className="size-5 text-red-500" />
        <div>
          <p className="font-medium text-red-700">Booking {status === 'REFUNDED' ? 'Refunded' : 'Cancelled'}</p>
          <p className="text-sm text-red-600">This booking was not completed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'border-blue-600 bg-blue-800 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                } ${isCurrent ? 'ring-2 ring-blue-200' : ''}`}
              >
                {isCompleted ? <Check className="size-4" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <span className={`mt-1 text-[10px] font-medium ${isCompleted ? 'text-blue-800' : 'text-gray-400'}`}>
                {step.replace('_', ' ')}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? 'bg-blue-800' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceAddress: string;
  basePrice: number;
  platformFee: number;
  finalPrice: number;
  negotiatedPrice?: number;
  specialInstructions?: string;
  cancellationReason?: string;
  paymentStatus: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
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

export function ClientBookingDetailPage() {
  const { nav, navigate, goBack } = useApp();
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
        <Skeleton className="mb-4 h-40 w-full" />
        <Skeleton className="mb-4 h-60 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">Booking not found</p>
        <Button variant="outline" className="mt-4" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const canCancel = ['PENDING', 'ACCEPTED'].includes(booking.status);
  const canReview = booking.status === 'COMPLETED' && !booking.review;
  const provider = booking.service?.provider || booking.provider;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold sm:text-2xl">Booking {booking.bookingNumber}</h1>
          <p className="text-sm text-muted-foreground">Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Status Timeline */}
      <Card className="mb-6 gap-4">
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h2>
          <StatusTimeline status={booking.status} />
        </CardContent>
      </Card>

      {/* Service & Provider Info */}
      <Card className="mb-6 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="size-5 text-blue-700" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-semibold">{booking.service?.title || 'Service'}</p>
            <p className="text-sm text-muted-foreground">{booking.service?.description}</p>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
              <User className="size-6 text-blue-700" />
            </div>
            <div>
              <p className="font-medium">{provider?.name || 'Provider'}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                {provider?.phone || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Address */}
      <Card className="mb-6 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-blue-700" />
            Schedule & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
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
              <Clock className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{booking.scheduledTime}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Service Address</p>
              <p className="text-sm text-muted-foreground">{booking.serviceAddress}</p>
            </div>
          </div>
          {booking.specialInstructions && (
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Special Instructions</p>
                <p className="text-sm text-muted-foreground">{booking.specialInstructions}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card className="mb-6 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-lg">💰</span>
            Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price</span>
            <span>₹{booking.basePrice?.toLocaleString()}</span>
          </div>
          {booking.negotiatedPrice && booking.negotiatedPrice !== booking.basePrice && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Negotiated Price</span>
              <span>₹{booking.negotiatedPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee</span>
            <span>₹{booking.platformFee?.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-blue-700">₹{booking.finalPrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status</span>
            <Badge variant="outline" className={booking.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
              {booking.paymentStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Existing Review */}
      {booking.review && (
        <Card className="mb-6 gap-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5 text-amber-500" />
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
      )}

      {/* Action Buttons */}
      <Card className="gap-4">
        <CardContent className="flex flex-wrap gap-3 p-4">
          {canCancel && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setCancelDialog(true)}
            >
              <XCircle className="mr-2 size-4" />
              Cancel Booking
            </Button>
          )}
          {canReview && (
            <Button
              className="bg-blue-800 hover:bg-[#1e3a5f]"
              onClick={() => setReviewDialog(true)}
            >
              <Star className="mr-2 size-4" />
              Leave Review
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('categories')}
          >
            <MessageSquare className="mr-2 size-4" />
            Contact Provider
          </Button>
          <Button
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
            onClick={() => navigate('home', {})}
          >
            <AlertTriangle className="mr-2 size-4" />
            Raise Dispute
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {booking.bookingNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for cancellation (optional)</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling && <Loader2 className="mr-2 size-4 animate-spin" />}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              How was your experience with {booking.service?.title}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-8 ${i < reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>Cancel</Button>
            <Button className="bg-blue-800 hover:bg-[#1e3a5f]" onClick={handleReview} disabled={submittingReview}>
              {submittingReview && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

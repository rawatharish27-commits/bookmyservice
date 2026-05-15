'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  CalendarDays,
  XCircle,
  Loader2,
  Search,
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
    <Badge variant="outline" className={c.className}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  basePrice: number;
  finalPrice: number;
  platformFee: number;
  service?: { id: string; title: string };
  provider?: { id: string; name: string };
}

export function ClientBookingsPage() {
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<{ bookings: Booking[] }>('/api/bookings');
  const { mutate, loading: cancelling } = useApiMutation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const bookings = data?.bookings || [];

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Tab filter
    if (activeTab === 'upcoming') {
      filtered = filtered.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status));
    } else if (activeTab === 'in_progress') {
      filtered = filtered.filter((b) => b.status === 'IN_PROGRESS');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((b) => b.status === 'COMPLETED');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter((b) => ['CANCELLED', 'REFUNDED'].includes(b.status));
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(q) ||
          b.service?.title?.toLowerCase().includes(q) ||
          b.provider?.name?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [bookings, activeTab, searchQuery]);

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await mutate(`/api/bookings/${cancelDialog.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setCancelDialog(null);
      setCancelReason('');
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const tabCounts = useMemo(() => ({
    all: bookings.length,
    upcoming: bookings.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status)).length,
    in_progress: bookings.filter((b) => b.status === 'IN_PROGRESS').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => ['CANCELLED', 'REFUNDED'].includes(b.status)).length,
  }), [bookings]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage and track your service bookings</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex w-full flex-wrap sm:w-auto">
          <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({tabCounts.upcoming})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({tabCounts.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({tabCounts.cancelled})</TabsTrigger>
        </TabsList>

        {['all', 'upcoming', 'in_progress', 'completed', 'cancelled'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center">
                <CalendarDays className="mx-auto size-12 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">No bookings found</p>
                <Button
                  variant="outline"
                  className="mt-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => navigate('categories')}
                >
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="gap-0 py-0 overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        onClick={() => navigate('client-booking-detail', { bookingId: booking.id })}
                        className="flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:gap-6"
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                          <Briefcase className="size-6 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{booking.service?.title || 'Service'}</p>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {booking.bookingNumber} &middot; {booking.provider?.name || 'Provider'}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            at {booking.scheduledTime}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">₹{booking.finalPrice?.toLocaleString()}</p>
                          {['PENDING', 'ACCEPTED'].includes(booking.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelDialog(booking);
                              }}
                            >
                              <XCircle className="mr-1 size-3.5" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => !open && setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {cancelDialog?.bookingNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for cancellation (optional)</label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

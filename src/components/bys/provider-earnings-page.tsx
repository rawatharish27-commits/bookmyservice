'use client';

import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  finalPrice: number;
  basePrice: number;
  providerEarnings: number;
  platformFee: number;
  service: { id: string; title: string };
  client: { id: string; name: string };
  createdAt: string;
}

interface BookingResponse {
  bookings: Booking[];
  pagination: { total: number };
}

export function ProviderEarningsPage() {
  const { data, loading } = useApi<BookingResponse>('/api/bookings?limit=100');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const bookings = data?.bookings || [];
  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completed.reduce((s, b) => s + (b.providerEarnings || 0), 0);
  const pendingPayout = bookings
    .filter((b) => b.status === 'IN_PROGRESS')
    .reduce((s, b) => s + (b.providerEarnings || 0), 0);

  const now = new Date();
  const thisMonth = completed.filter((b) => {
    const d = new Date(b.scheduledDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarnings = thisMonth.reduce((s, b) => s + (b.providerEarnings || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your revenue and payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">₹{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                <DollarSign className="size-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">₹{pendingPayout.toLocaleString()}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
                <Clock className="size-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">₹{thisMonthEarnings.toLocaleString()}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="size-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Completed Bookings</p>
          <p className="mt-1 text-lg font-bold">{completed.length}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">This Month Bookings</p>
          <p className="mt-1 text-lg font-bold">{thisMonth.length}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Avg. Earning/Booking</p>
          <p className="mt-1 text-lg font-bold">
            ₹{completed.length ? Math.round(totalEarnings / completed.length).toLocaleString() : 0}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Platform Fees Paid</p>
          <p className="mt-1 text-lg font-bold">
            ₹{completed.reduce((s, b) => s + (b.platformFee || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Earnings History</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {completed.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 size-8 opacity-50" />
                <p>No completed bookings yet</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                {completed.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b p-4 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{booking.service?.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        #{booking.bookingNumber} • {booking.client?.name} • {booking.scheduledDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-700">+₹{booking.providerEarnings?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">of ₹{booking.finalPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

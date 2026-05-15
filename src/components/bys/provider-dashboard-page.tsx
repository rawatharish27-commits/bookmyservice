'use client';

import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CalendarCheck,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  providerEarnings: number;
  service: { id: string; title: string; basePrice: number };
  client: { id: string; name: string; profileImageUrl?: string };
}

interface BookingResponse {
  bookings: Booking[];
  pagination: { total: number };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-orange-100 text-orange-800 border-orange-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<BookingResponse>('/api/bookings?limit=50');
  const { mutate } = useApiMutation();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const bookings = data?.bookings || [];
  const today = new Date().toISOString().split('T')[0];

  const todayBookings = bookings.filter((b) => b.scheduledDate === today);
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const weekEarnings = completedBookings
    .filter((b) => {
      const d = new Date(b.scheduledDate);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    })
    .reduce((sum, b) => sum + (b.providerEarnings || 0), 0);
  const avgRating = 4.5; // Placeholder since we need separate API

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome back, {user?.name?.split(' ')[0] || 'Provider'}!
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your business today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Bookings</p>
                <p className="mt-1 text-2xl font-bold">{todayBookings.length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                <CalendarCheck className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week Earnings</p>
                <p className="mt-1 text-2xl font-bold">₹{weekEarnings.toLocaleString()}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                <DollarSign className="size-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="mt-1 text-2xl font-bold">{avgRating}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100">
                <Star className="size-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="mt-1 text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp className="size-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* New Booking Requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">New Booking Requests</CardTitle>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                {pendingBookings.length} pending
              </Badge>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {pendingBookings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="mx-auto mb-2 size-8 opacity-50" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between border-b p-4 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{booking.service?.title}</p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {booking.client?.name} • {booking.scheduledDate} at {booking.scheduledTime}
                        </p>
                        <p className="text-sm font-semibold text-emerald-600">
                          ₹{booking.finalPrice?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                        >
                          <CheckCircle2 className="mr-1 size-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                        >
                          <XCircle className="mr-1 size-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3 pt-4">
              <Button
                className="w-full justify-start bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => navigate('provider-create-service')}
              >
                <Plus className="mr-2 size-4" />
                Create Service
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('provider-earnings')}
              >
                <DollarSign className="mr-2 size-4" />
                View Earnings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('provider-reviews')}
              >
                <Star className="mr-2 size-4" />
                View Reviews
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('provider-bookings')}
              >
                <CalendarCheck className="mr-2 size-4" />
                All Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('provider-bookings')}>
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {todayBookings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CalendarCheck className="mx-auto mb-2 size-8 opacity-50" />
                <p>No bookings scheduled for today</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                {todayBookings.map((booking, i) => (
                  <div key={booking.id} className="flex items-center gap-4 border-b p-4 last:border-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{booking.service?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.client?.name} • {booking.scheduledTime}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings Summary */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Earnings Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('provider-earnings')}>
              Details <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">
                  ₹{todayBookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.providerEarnings || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="mt-1 text-lg font-bold text-blue-600">
                  ₹{weekEarnings.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="mt-1 text-lg font-bold text-purple-600">
                  ₹{completedBookings.reduce((s, b) => s + (b.providerEarnings || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-1 text-lg font-bold text-orange-600">
                  {bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

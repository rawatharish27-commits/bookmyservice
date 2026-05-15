'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  CalendarCheck,
  CheckCircle2,
  Heart,
  DollarSign,
  Briefcase,
  CalendarDays,
  Star,
  ArrowRight,
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
  service?: { id: string; title: string };
  provider?: { id: string; name: string };
}

interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  service?: { title: string };
  reviewed?: { name: string };
}

export function ClientDashboardPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data: bookingsData, loading: bookingsLoading } = useApi<{ bookings: Booking[] }>('/api/bookings');
  const { data: reviewsData, loading: reviewsLoading } = useApi<{ reviews: ReviewData[] }>('/api/reviews');

  const bookings = bookingsData?.bookings || [];
  const reviews = reviewsData?.reviews || [];

  const upcomingBookings = bookings
    .filter((b) => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status))
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
    .slice(0, 3);

  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.finalPrice || 0), 0);

  const recentReviews = reviews.slice(0, 2);

  const stats = [
    {
      title: 'Upcoming Bookings',
      value: upcomingBookings.length,
      icon: <CalendarCheck className="size-5" />,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Completed Services',
      value: completedCount,
      icon: <CheckCircle2 className="size-5" />,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      title: 'Favorite Providers',
      value: 0,
      icon: <Heart className="size-5" />,
      color: 'text-pink-600 bg-pink-50',
    },
    {
      title: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      icon: <DollarSign className="size-5" />,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back, <span className="text-blue-700">{user?.name || 'Client'}</span>!
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="gap-4 py-5">
            <CardContent className="flex items-center gap-4 p-0 px-5">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('client-bookings')} className="text-blue-700">
                View All <ArrowRight className="ml-1 size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarDays className="mx-auto size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No upcoming bookings</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate('categories')}
                  >
                    Browse Services
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => navigate('client-booking-detail', { bookingId: booking.id })}
                      className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Briefcase className="size-5 text-blue-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {booking.service?.title || 'Service'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.provider?.name || 'Provider'} &middot;{' '}
                          {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          at {booking.scheduledTime}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('client-reviews')} className="text-blue-700">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="py-6 text-center">
                  <Star className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium">{review.service?.title || 'Service'}</p>
                      {review.comment && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
            onClick={() => navigate('categories')}
          >
            <Briefcase className="size-5" />
            <span className="text-sm">Book a Service</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => navigate('client-bookings')}
          >
            <CalendarCheck className="size-5" />
            <span className="text-sm">View All Bookings</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:bg-pink-50 hover:text-pink-700"
            onClick={() => navigate('client-favorites')}
          >
            <Heart className="size-5" />
            <span className="text-sm">Favorites</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:bg-amber-50 hover:text-amber-700"
            onClick={() => navigate('client-profile')}
          >
            <DollarSign className="size-5" />
            <span className="text-sm">My Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

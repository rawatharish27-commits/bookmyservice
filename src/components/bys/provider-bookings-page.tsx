'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarCheck, User, Briefcase, Clock, CheckCircle2, XCircle, Play, Eye } from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  basePrice: number;
  platformFee: number;
  providerEarnings: number;
  serviceAddress: string;
  specialInstructions?: string;
  service: { id: string; title: string; basePrice: number };
  client: { id: string; name: string; profileImageUrl?: string };
  createdAt: string;
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

const TABS = [
  { key: 'PENDING', label: 'New Requests' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export function ProviderBookingsPage() {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState('PENDING');
  const { data, loading, refetch } = useApi<BookingResponse>(`/api/bookings?status=${activeTab}&limit=50`);
  const { mutate } = useApiMutation();

  const bookings = data?.bookings || [];

  const handleAction = async (bookingId: string, action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // handled
    }
  };

  const getActions = (booking: Booking) => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handleAction(booking.id, 'accept')}
            >
              <CheckCircle2 className="mr-1 size-3" /> Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleAction(booking.id, 'reject')}>
              <XCircle className="mr-1 size-3" /> Reject
            </Button>
          </>
        );
      case 'ACCEPTED':
        return (
          <Button
            size="sm"
            className="bg-orange-600 text-white hover:bg-orange-700"
            onClick={() => handleAction(booking.id, 'start')}
          >
            <Play className="mr-1 size-3" /> Start Service
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => handleAction(booking.id, 'complete')}
          >
            <CheckCircle2 className="mr-1 size-3" /> Mark Complete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your service bookings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <CalendarCheck className="mb-4 size-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">No {tab.label.toLowerCase()}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tab.key === 'PENDING'
                      ? 'New booking requests will appear here'
                      : `No ${tab.label.toLowerCase()} bookings found`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                #{booking.bookingNumber}
                              </span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Briefcase className="size-4 text-emerald-600" />
                              <span className="font-medium">{booking.service?.title}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="size-3" />
                              {booking.client?.name}
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {booking.scheduledDate} at {booking.scheduledTime}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-lg font-bold text-emerald-600">
                              ₹{booking.finalPrice?.toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              {getActions(booking)}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate('provider-booking-detail', { bookingId: booking.id })}
                              >
                                <Eye className="mr-1 size-3" /> Detail
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

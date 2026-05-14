import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, XCircle, Play, MapPin, Clock, User, Phone, Briefcase } from 'lucide-react';

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
  distanceKm?: number;
  service: { id: string; title: string; basePrice: number; images?: string };
  client: { id: string; name: string; profileImageUrl?: string; phone?: string; email?: string };
  provider: { id: string; name: string; profileImageUrl?: string };
  createdAt: string;
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

export function ProviderBookingDetailPage() {
  const { navigate, nav } = useApp();
  const bookingId = nav.params.bookingId;
  const { data: booking, loading, refetch } = useApi<Booking>(bookingId ? `/api/bookings/${bookingId}` : null);
  const { mutate } = useApiMutation();

  const handleAction = async (action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // handled
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('provider-bookings')}>
          <ArrowLeft className="mr-2 size-4" /> Back to Bookings
        </Button>
        <p className="mt-8 text-center text-muted-foreground">Booking not found</p>
      </div>
    );
  }

  const getActions = () => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <div className="flex gap-3">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleAction('accept')}>
              <CheckCircle2 className="mr-2 size-4" /> Accept Booking
            </Button>
            <Button variant="destructive" onClick={() => handleAction('reject')}>
              <XCircle className="mr-2 size-4" /> Reject
            </Button>
          </div>
        );
      case 'ACCEPTED':
        return (
          <Button className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => handleAction('start')}>
            <Play className="mr-2 size-4" /> Start Service
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleAction('complete')}>
            <CheckCircle2 className="mr-2 size-4" /> Mark Complete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('provider-bookings')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">#{booking.bookingNumber}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Booked on {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Client Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                <User className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">{booking.client?.name}</p>
                {booking.client?.phone && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="size-3" /> {booking.client.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-emerald-600" />
              <span className="font-medium">{booking.service?.title}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              <span>{booking.scheduledDate} at {booking.scheduledTime}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{booking.serviceAddress || 'Address not provided'}</span>
            </div>
            {booking.distanceKm && (
              <p className="text-sm text-muted-foreground">{booking.distanceKm} km away</p>
            )}
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price</span>
                <span>₹{booking.basePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee</span>
                <span>₹{booking.platformFee?.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-emerald-600">₹{booking.finalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Your Earnings</span>
                <span>₹{booking.providerEarnings?.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{booking.specialInstructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {getActions() && (
          <Card>
            <CardContent className="pt-6">
              {getActions()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

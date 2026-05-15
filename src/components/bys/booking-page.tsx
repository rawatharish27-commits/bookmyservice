'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  CalendarDays,
  Clock,
  Loader2,
  User,
  Check,
} from 'lucide-react';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  priceNegotiable: boolean;
  serviceDurationMinutes?: number;
  city?: string;
  provider?: {
    id: string;
    name: string;
    averageRating?: number;
  };
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function BookingPage() {
  const { user } = useAuth();
  const { nav, navigate, goBack } = useApp();
  const serviceId = nav.params?.serviceId;

  const { data: service, loading: serviceLoading } = useApi<ServiceData>(serviceId ? `/api/services/${serviceId}` : null);
  const { data: availData, loading: availLoading } = useApi<{ availability: AvailabilitySlot[] }>(
    serviceId ? `/api/services/${serviceId}/availability` : null
  );
  const { mutate: createBooking, loading: creating } = useApiMutation();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [negotiatePrice, setNegotiatePrice] = useState('');
  const [error, setError] = useState('');

  const availability = availData?.availability || [];

  // Compute available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const slots = availability.filter((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);
    if (slots.length === 0) return [];

    // Generate 1-hour time slots
    const timeSlots: string[] = [];
    for (const slot of slots) {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      let currentH = startH;
      let currentM = startM;
      while (currentH < endH || (currentH === endH && currentM < endM)) {
        const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
        timeSlots.push(timeStr);
        currentM += 60;
        if (currentM >= 60) {
          currentH += Math.floor(currentM / 60);
          currentM = currentM % 60;
        }
      }
    }
    return timeSlots;
  }, [selectedDate, availability]);

  // Available days (days of week that have availability)
  const availableDayIndices = useMemo(() => {
    return new Set(availability.filter((a) => a.isAvailable).map((a) => a.dayOfWeek));
  }, [availability]);

  // Disable dates that are not available or in the past
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return !availableDayIndices.has(date.getDay());
  };

  const platformFee = service ? Math.max(5, service.basePrice * 0.05) : 0;
  const totalPrice = service ? service.basePrice + platformFee : 0;

  const handleBooking = async () => {
    if (!service || !selectedDate || !selectedTime || !address) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    try {
      const body: Record<string, unknown> = {
        serviceId: service.id,
        providerId: service.provider?.id,
        scheduledDate: selectedDate.toISOString().split('T')[0],
        scheduledTime: selectedTime,
        serviceAddress: address,
        specialInstructions,
      };
      if (service.priceNegotiable && negotiatePrice) {
        body.proposedPrice = parseFloat(negotiatePrice);
      }
      const result = await createBooking('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const bookingId = (result as { booking?: { id: string }; id?: string })?.booking?.id || (result as { id?: string })?.id;
      if (bookingId) {
        navigate('booking-confirmation', { bookingId });
      } else {
        navigate('client-bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  // Auth check
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <Card className="gap-4">
          <CardContent className="py-8">
            <User className="mx-auto size-12 text-muted-foreground/40" />
            <h2 className="mt-4 text-lg font-semibold">Login Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to book a service</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={goBack}>Go Back</Button>
              <Button className="bg-blue-800 hover:bg-[#1e3a5f]" onClick={() => navigate('login')}>
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (serviceLoading || availLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="mb-4 h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">Service not found</p>
        <Button variant="outline" className="mt-4" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  const steps = [
    { number: 1, label: 'Date' },
    { number: 2, label: 'Time' },
    { number: 3, label: 'Address' },
    { number: 4, label: 'Review' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Book Service</h1>
          <p className="text-sm text-muted-foreground">{service.title} by {service.provider?.name}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s.number}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                  step > s.number
                    ? 'border-blue-600 bg-blue-800 text-white'
                    : step === s.number
                    ? 'border-blue-600 bg-white text-blue-700 ring-2 ring-blue-200'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {step > s.number ? <Check className="size-4" /> : s.number}
              </div>
              <span className={`mt-1 text-xs ${step >= s.number ? 'text-blue-800 font-medium' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${step > s.number ? 'bg-blue-800' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Date */}
      {step === 1 && (
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="size-5 text-blue-700" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableDayIndices.size === 0 ? (
              <div className="py-8 text-center">
                <CalendarDays className="mx-auto size-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No availability configured for this service</p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Available on: {Array.from(availableDayIndices).sort().map((d) => DAY_NAMES[d]).join(', ')}
                </p>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    className="rounded-md border"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              className="bg-blue-800 hover:bg-[#1e3a5f]"
              disabled={!selectedDate}
              onClick={() => setStep(2)}
            >
              Next <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Select Time */}
      {step === 2 && (
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="size-5 text-blue-700" />
              Select Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableSlots.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="mx-auto size-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No available time slots for {selectedDate && new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long' })}
                </p>
                <Button variant="outline" className="mt-3" onClick={() => setStep(1)}>
                  Choose Another Date
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button
              className="bg-blue-800 hover:bg-[#1e3a5f]"
              disabled={!selectedTime}
              onClick={() => setStep(3)}
            >
              Next <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Address & Instructions */}
      {step === 3 && (
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5 text-blue-700" />
              Service Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address including flat/house no, street, area..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions (optional)</Label>
              <Textarea
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any specific instructions for the service provider..."
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button
              className="bg-blue-800 hover:bg-[#1e3a5f]"
              disabled={!address.trim()}
              onClick={() => setStep(4)}
            >
              Next <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="size-5 text-blue-700" />
              Review & Confirm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
            )}

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{service.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{service.provider?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedDate?.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="max-w-[60%] text-right font-medium">{address}</span>
              </div>
              {specialInstructions && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Instructions</span>
                  <span className="max-w-[60%] text-right font-medium">{specialInstructions}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <h3 className="font-semibold">Price Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span>₹{service.basePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-blue-700">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Negotiate Price */}
            {service.priceNegotiable && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">Negotiable</Badge>
                  <span className="text-sm font-medium">This service allows price negotiation</span>
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="negotiate-price">Propose a different price (₹)</Label>
                  <Input
                    id="negotiate-price"
                    type="number"
                    min="1"
                    placeholder="Enter your proposed price"
                    value={negotiatePrice}
                    onChange={(e) => setNegotiatePrice(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">The provider will review your proposed price</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button
              className="bg-blue-800 hover:bg-[#1e3a5f]"
              onClick={handleBooking}
              disabled={creating}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  Confirm Booking <Check className="ml-2 size-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

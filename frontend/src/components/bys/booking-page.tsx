import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  Shield,
  Zap,
  Navigation,
  RefreshCw,
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

const STEPS = [
  { number: 1, label: 'Select Date', icon: CalendarDays },
  { number: 2, label: 'Choose Time', icon: Clock },
  { number: 3, label: 'Address', icon: MapPin },
  { number: 4, label: 'Review', icon: Check },
];

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
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [negotiatePrice, setNegotiatePrice] = useState('');
  const [error, setError] = useState('');

  const { latitude, longitude, city: detectedCity, loading: geoLoading, error: geoError, refreshLocation } = useGeolocation();

  // Auto-fill city when geolocation detects it and step reaches address
  useEffect(() => {
    if (detectedCity && !city) {
      setCity(detectedCity);
    }
  }, [detectedCity, city]);

  const availability = availData?.availability || [];

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const slots = availability.filter((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);
    if (slots.length === 0) return [];
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

  const availableDayIndices = useMemo(() => {
    return new Set(availability.filter((a) => a.isAvailable).map((a) => a.dayOfWeek));
  }, [availability]);

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
        city,
        pincode,
        specialInstructions,
        latitude,
        longitude,
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

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-8">
            <User className="mx-auto size-12 text-muted-foreground/40" />
            <h2 className="mt-4 text-lg font-semibold">Login Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to book a service</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={goBack} className="rounded-xl">Go Back</Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl" onClick={() => navigate('login')}>
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
        <div className="mb-6 h-8 w-64 animate-pulse rounded-xl bg-muted/50" />
        <div className="mb-4 h-16 w-full animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">Service not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back" className="rounded-xl hover:bg-emerald-50">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Book Service</h1>
          <p className="text-sm text-muted-foreground">{service.title} by {service.provider?.name}</p>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const isCompleted = step > s.number;
            const isCurrent = step === s.number;
            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    className={`flex size-10 items-center justify-center rounded-xl border-2 text-sm font-medium transition-all ${
                      isCompleted
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                        : isCurrent
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100'
                        : 'border-gray-200 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="size-5" /> : <s.icon className="size-4" />}
                  </motion.div>
                  <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-2 flex-1">
                    <div className="relative h-0.5 bg-gray-200 rounded-full">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: step > s.number ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Service Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Briefcase className="size-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{service.title}</p>
              <p className="text-sm text-muted-foreground">{service.provider?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-gradient text-lg font-bold">₹{service.basePrice?.toLocaleString()}</p>
              {service.priceNegotiable && (
                <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-[10px]">Negotiable</Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Select Date */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                    <CalendarDays className="size-4 text-white" />
                  </div>
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableDayIndices.size === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                      <CalendarDays className="size-8 text-emerald-300" />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">No availability configured for this service</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {Array.from(availableDayIndices).sort().map((d) => (
                        <Badge key={d} variant="secondary" className="bg-emerald-50 text-emerald-700 rounded-lg">
                          {DAY_NAMES[d]}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        className="rounded-xl border"
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="justify-end p-4">
                <Button
                  className="shimmer bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl"
                  disabled={!selectedDate}
                  onClick={() => setStep(2)}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-500">
                    <Clock className="size-4 text-white" />
                  </div>
                  Select Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableSlots.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sky-50">
                      <Clock className="size-8 text-sky-300" />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      No available time slots for {selectedDate && new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long' })}
                    </p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => setStep(1)}>
                      Choose Another Date
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableSlots.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-md shadow-emerald-500/10'
                            : 'border-gray-100 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                      >
                        <Clock className="mx-auto mb-1 size-3.5 opacity-50" />
                        {time}
                      </motion.button>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="shimmer bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl"
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-sky-500">
                    <MapPin className="size-4 text-white" />
                  </div>
                  Service Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Detection Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {geoLoading ? (
                      <Badge variant="secondary" className="gap-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        <Loader2 className="size-3 animate-spin" /> Detecting location...
                      </Badge>
                    ) : detectedCity && !geoError ? (
                      <Badge variant="secondary" className="gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Navigation className="size-3" /> Location Detected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                        <MapPin className="size-3" /> Location unavailable
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-emerald-600"
                    onClick={refreshLocation}
                    disabled={geoLoading}
                  >
                    <RefreshCw className={`size-3 ${geoLoading ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete address including flat/house no, street, area..."
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Area pincode"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions (optional)</Label>
                  <Textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any specific instructions for the service provider..."
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="shimmer bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl"
                  disabled={!address.trim()}
                  onClick={() => setStep(4)}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                    <Check className="size-4 text-white" />
                  </div>
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="glass space-y-3 rounded-xl p-4">
                  {[
                    { label: 'Service', value: service.title },
                    { label: 'Provider', value: service.provider?.name },
                    { label: 'Date', value: selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                    { label: 'Time', value: selectedTime },
                    { label: 'Address', value: address, truncate: true },
                    ...(specialInstructions ? [{ label: 'Instructions', value: specialInstructions, truncate: true }] : []),
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`max-w-[60%] text-right font-medium ${item.truncate ? 'line-clamp-2' : ''}`}>{item.value}</span>
                    </div>
                  ))}
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
                    <span className="text-gradient">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Negotiate Price */}
                {service.priceNegotiable && (
                  <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-sky-100 text-sky-800 border-sky-200">Negotiable</Badge>
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
                        className="rounded-xl h-11"
                      />
                      <p className="text-xs text-muted-foreground">The provider will review your proposed price</p>
                    </div>
                  </div>
                )}

                {/* Trust Badge */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50/50 p-3">
                  <Shield className="size-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-medium">Secure booking with platform protection</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={() => setStep(3)} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="shimmer bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl h-11 px-8"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

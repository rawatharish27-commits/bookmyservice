'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { apiUrl } from '@/lib/api-url';
import { COMPANY_INFO } from '@/config/company';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
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
  Navigation,
  RefreshCw,
  Star,
  Phone,
  Award,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  Tag,
  CircleCheckBig,
  Home,
  MapPinned,
  Search,
  Users,
  Wrench,
  Ticket,
  Eye,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceData {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  category?: {
    id: string;
    name: string;
  };
  priceNegotiable: boolean;
  serviceDurationMinutes?: number;
  city?: string;
  provider?: {
    id: string;
    name: string;
    averageRating?: number;
    profileImageUrl?: string;
    completedJobsCount?: number;
  };
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface NearbyProvider {
  id: string;
  name: string;
  profileImageUrl?: string;
  averageRating: number;
  completedJobsCount: number;
  distance: number;
  price: number;
  specialization?: string;
}

interface TechnicianInfo {
  id: string;
  name: string;
  profileImageUrl?: string;
  rating: number;
  experienceYears: number;
  phone: string;
  specialization: string;
  certifications?: string[];
}

interface BookingResult {
  id?: string;
  booking?: { id: string };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STEPS = [
  { number: 1, label: 'Service Details', icon: Briefcase },
  { number: 2, label: 'Address', icon: MapPin },
  { number: 3, label: 'Date & Time', icon: CalendarDays },
  { number: 4, label: 'Provider', icon: Search },
  { number: 5, label: 'Technician', icon: Wrench },
  { number: 6, label: 'Payment', icon: CreditCard },
  { number: 7, label: 'Confirmed', icon: CircleCheckBig },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00',
];

const TIME_LABELS: Record<string, string> = {
  '09:00': '9:00 AM',
  '10:00': '10:00 AM',
  '11:00': '11:00 AM',
  '12:00': '12:00 PM',
  '13:00': '1:00 PM',
  '14:00': '2:00 PM',
  '15:00': '3:00 PM',
  '16:00': '4:00 PM',
  '17:00': '5:00 PM',
  '18:00': '6:00 PM',
  '19:00': '7:00 PM',
};

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'cash', label: 'Cash', icon: Banknote },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value'];

/* ------------------------------------------------------------------ */
/*  Helper: format time                                               */
/* ------------------------------------------------------------------ */
function formatTime(t: string): string {
  return TIME_LABELS[t] || t;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookingPage() {
  const { user, authFetch } = useAuth();
  const { nav, navigate, goBack } = useApp();
  const serviceId = nav.params?.serviceId;

  const { data: service, loading: serviceLoading } = useApi<ServiceData>(
    serviceId ? `/api/services/${serviceId}` : null
  );
  const { data: availData, loading: availLoading } = useApi<{ availability: AvailabilitySlot[] }>(
    serviceId ? `/api/services/${serviceId}/availability` : null
  );
  const { mutate: createBooking, loading: creating } = useApiMutation();

  /* ---- Wizard state ---- */
  const [step, setStep] = useState(1);

  /* ---- Step 2: Address ---- */
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressError, setAddressError] = useState('');

  /* ---- Step 3: Date / Time ---- */
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [dateError, setDateError] = useState('');

  /* ---- Step 4: Provider ---- */
  const [providers, setProviders] = useState<NearbyProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState('');

  /* ---- Step 5: Technician ---- */
  const [technician, setTechnician] = useState<TechnicianInfo | null>(null);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [technicianLoading, setTechnicianLoading] = useState(false);
  const [technicianError, setTechnicianError] = useState('');

  /* ---- Step 6: Payment ---- */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  /* ---- Step 7: Confirmation ---- */
  const [bookingId, setBookingId] = useState('');
  const [bookingError, setBookingError] = useState('');

  /* ---- Geolocation ---- */
  const {
    latitude,
    longitude,
    city: detectedCity,
    loading: geoLoading,
    error: geoError,
    refreshLocation,
  } = useGeolocation();

  /* Auto-fill city from geolocation */
  useEffect(() => {
    if (detectedCity && !city) {
      queueMicrotask(() => setCity(detectedCity));
    }
  }, [detectedCity, city]);

  /* ---- Availability helpers ---- */
  const availability = availData?.availability || [];

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const slots = availability.filter((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);
    if (slots.length === 0) return TIME_SLOTS;
    const timeSlots: string[] = [];
    for (const slot of slots) {
      const [startH] = slot.startTime.split(':').map(Number);
      const [endH] = slot.endTime.split(':').map(Number);
      for (let h = startH; h < endH; h++) {
        const timeStr = `${String(h).padStart(2, '0')}:00`;
        if (TIME_SLOTS.includes(timeStr)) {
          timeSlots.push(timeStr);
        }
      }
    }
    return timeSlots.length > 0 ? timeSlots : TIME_SLOTS;
  }, [selectedDate, availability]);

  const availableDayIndices = useMemo(() => {
    const indices = new Set(availability.filter((a) => a.isAvailable).map((a) => a.dayOfWeek));
    return indices.size > 0 ? indices : new Set([1, 2, 3, 4, 5, 6]);
  }, [availability]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return !availableDayIndices.has(date.getDay());
  };

  /* ---- Price calculations ---- */
  const basePrice = service?.basePrice ?? 0;
  const emergencyCharge = nav.params?.emergency === 'true' ? Math.round(basePrice * 0.25) : 0;
  const platformFee = 5; // TODO: Fetch platform fee from API/config
  const distanceCharge = useMemo(() => {
    if (!latitude || !longitude) return 0;
    const selectedProvider = providers.find(p => p.id === selectedProviderId);
    const dist = selectedProvider?.distance ?? 0;
    if (dist <= 5) return 0;
    if (dist <= 10) return 15;
    if (dist <= 20) return 25;
    return 35;
  }, [latitude, longitude, providers, selectedProviderId]);
  const subtotal = basePrice + emergencyCharge + platformFee + distanceCharge;
  const totalPrice = Math.max(0, subtotal - couponDiscount);

  /* ---- Fetch nearby providers when reaching step 4 ---- */
  useEffect(() => {
    if (step !== 4 || !serviceId) return;
    let cancelled = false;
    const fetchProviders = async () => {
      setProvidersLoading(true);
      try {
        const params = new URLSearchParams({ serviceId, lat: String(latitude ?? 0), lng: String(longitude ?? 0) });
        const res = await authFetch(`/api/providers/nearby?${params}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setProviders(data);
          if (data.length > 0) setSelectedProviderId(data[0].id);
        } else if (!cancelled && Array.isArray(data.providers)) {
          setProviders(data.providers);
          if (data.providers.length > 0) setSelectedProviderId(data.providers[0].id);
        }
      } catch {
        if (!cancelled) {
          setProvidersError('Failed to load nearby providers. Please try again.');
          setProviders([]);
        }
      } finally {
        if (!cancelled) setProvidersLoading(false);
      }
    };
    fetchProviders();
    return () => { cancelled = true; };
  }, [step, serviceId, latitude, longitude, basePrice, authFetch]);

  /* ---- Fetch technician when reaching step 5 ---- */
  useEffect(() => {
    if (step !== 5 || !selectedProviderId) return;
    let cancelled = false;
    const fetchTechnician = async () => {
      setTechnicianLoading(true);
      try {
        const res = await authFetch(`/api/providers/${selectedProviderId}/technician`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!cancelled) {
          setTechnician(data.technician || data);
          // OTP should only be revealed at service completion time, not during booking
        }
      } catch {
        if (!cancelled) {
          setTechnicianError('Failed to assign technician. Please try again.');
          setTechnician(null);
        }
      } finally {
        if (!cancelled) setTechnicianLoading(false);
      }
    };
    fetchTechnician();
    return () => { cancelled = true; };
  }, [step, selectedProviderId, service?.category?.name, authFetch]);

  /* ---- Coupon apply ---- */
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await authFetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, serviceId, amount: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');
      setCouponDiscount(data.discount || 0);
      setCouponApplied(true);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code');
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, serviceId, subtotal, authFetch]);

  /* ---- Validation helpers ---- */
  const validateStep2 = (): boolean => {
    if (!address.trim()) { setAddressError('Full address is required'); return false; }
    if (!city.trim()) { setAddressError('City is required'); return false; }
    if (!pincode.trim() || pincode.trim().length !== 6) { setAddressError('Valid 6-digit pincode is required'); return false; }
    setAddressError('');
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!selectedDate) { setDateError('Please select a date'); return false; }
    if (!selectedTime) { setDateError('Please select a time slot'); return false; }
    setDateError('');
    return true;
  };

  /* ---- Navigation ---- */
  const goNext = () => {
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !selectedProviderId) return;
    if (step < 7) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  /* ---- Submit booking ---- */
  const handleConfirmBooking = async () => {
    setPaymentError('');
    try {
      const body = {
        serviceId: service?.id,
        providerId: selectedProviderId,
        scheduledDate: selectedDate?.toISOString().split('T')[0],
        scheduledTime: selectedTime,
        serviceAddress: address,
        city,
        pincode,
        landmark,
        latitude,
        longitude,
        paymentMethod,
        couponCode: couponApplied ? couponCode : undefined,
        couponDiscount: couponApplied ? couponDiscount : undefined,
        emergencyCharge,
        platformFee,
        distanceCharge,
        totalAmount: totalPrice,
        technicianId: technician?.id,
      };
      const result = (await createBooking('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      })) as BookingResult;
      const id = result?.booking?.id || result?.id || '';
      setBookingId(id);
      setStep(7);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  /* ---- Progress ---- */
  const progressPercent = Math.round(((step - 1) / 6) * 100);

  /* ---- Unauthenticated ---- */
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-8">
            <User className="mx-auto size-12 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold">Login Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to book a service</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={goBack} className="rounded-xl">Go Back</Button>
              <Button className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg rounded-xl" onClick={() => navigate('login')}>
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Loading ---- */
  if (serviceLoading || availLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 h-8 w-64 animate-pulse rounded-xl bg-slate-200/50" />
        <div className="mb-4 h-16 w-full animate-pulse rounded-2xl bg-slate-200/50" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200/50" />
      </div>
    );
  }

  /* ---- Service not found ---- */
  if (!service) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">Service not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  /* ---- Step indicator label ---- */
  const stepLabel = STEPS[step - 1]?.label ?? '';

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* ---- Header ---- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back" className="rounded-xl hover:bg-slate-100">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold sm:text-2xl">Book Service</h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 7 &middot; {stepLabel}
          </p>
        </div>
      </motion.div>

      {/* ---- Progress Bar ---- */}
      <div className="mb-6">
        <Progress value={progressPercent} className="h-2 rounded-full bg-slate-200 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#132D5E] [&>[data-slot=progress-indicator]]:to-[#FFD54F]" />
        <div className="mt-3 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const isCompleted = step > s.number;
            const isCurrent = step === s.number;
            const Icon = s.icon;
            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                    className={`flex size-9 items-center justify-center rounded-xl border-2 text-xs font-medium transition-all sm:size-10 ${
                      isCompleted
                        ? 'border-[#FFD54F] bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg'
                        : isCurrent
                        ? 'border-[#FFD54F] bg-[#132D5E]/10 text-[#132D5E] ring-2 ring-[#FFD54F]/30'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </motion.div>
                  <span className={`mt-1.5 hidden text-[10px] font-medium sm:block ${isCurrent ? 'text-[#132D5E]' : isCompleted ? 'text-[#FFD54F]' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-1 flex-1">
                    <div className="relative h-0.5 rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: step > s.number ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#132D5E] to-[#FFD54F]"
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ---- Step Content ---- */}
      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/*  STEP 1: Service Details                                     */}
        {/* ============================================================ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                    <Briefcase className="size-4 text-[#0A1F44]" />
                  </div>
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Service card */}
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-lg">
                      <Briefcase className="size-7 text-[#0A1F44]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold">{service.title}</p>
                      {service.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="mt-0.5 font-semibold">{service.category?.name || 'General'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-xs text-muted-foreground">Base Price</p>
                    <p className="mt-0.5 text-lg font-bold text-[#132D5E]">₹{basePrice.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-xs text-muted-foreground">Provider</p>
                    <p className="mt-0.5 font-semibold">{service.provider?.name || 'Assigned Provider'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="mt-0.5 font-semibold">{service.serviceDurationMinutes ? `${service.serviceDurationMinutes} min` : '1-2 hrs'}</p>
                  </div>
                </div>

                {service.provider?.averageRating && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{service.provider.averageRating.toFixed(1)} provider rating</span>
                    <span className="text-xs text-muted-foreground">({service.provider.completedJobsCount ?? 0} jobs completed)</span>
                  </div>
                )}

                {service.priceNegotiable && (
                  <Badge className="bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/20">Price Negotiable</Badge>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-[#132D5E]/5 p-3">
                  <Shield className="size-4 text-[#132D5E]" />
                  <span className="text-xs font-medium text-[#132D5E]">Secure booking with {COMPANY_INFO.name} protection</span>
                </div>
              </CardContent>
              <CardFooter className="justify-end p-4">
                <Button
                  className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl"
                  onClick={goNext}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  STEP 2: Address Selection                                   */}
        {/* ============================================================ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                    <MapPin className="size-4 text-[#0A1F44]" />
                  </div>
                  Service Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location detection indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {geoLoading ? (
                      <Badge variant="secondary" className="gap-1.5 rounded-lg bg-[#FFD54F]/10 text-[#FFD54F] border border-[#FFD54F]/20">
                        <Loader2 className="size-3 animate-spin" /> Detecting location...
                      </Badge>
                    ) : detectedCity && !geoError ? (
                      <Badge variant="secondary" className="gap-1.5 rounded-lg bg-[#FFD54F]/10 text-[#132D5E] border border-[#FFD54F]/30">
                        <Navigation className="size-3" /> Location Detected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                        <MapPin className="size-3" /> Location unavailable
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-[#132D5E]"
                    onClick={refreshLocation}
                    disabled={geoLoading}
                  >
                    <RefreshCw className={`size-3 ${geoLoading ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </div>

                {addressError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {addressError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setAddressError(''); }}
                    placeholder="Flat/House No., Street, Area..."
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setAddressError(''); }}
                      placeholder="Your city"
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setAddressError(''); }}
                      placeholder="6-digit pincode"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (optional)</Label>
                  <Input
                    id="landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Nearby landmark for easy navigation"
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Use current location button */}
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-dashed border-[#132D5E]/30 text-[#132D5E] hover:bg-[#132D5E]/5"
                  onClick={refreshLocation}
                  disabled={geoLoading}
                >
                  <MapPinned className="size-4" />
                  {geoLoading ? 'Detecting Location...' : 'Use Current Location'}
                </Button>
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={goPrev} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl"
                  onClick={goNext}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  STEP 3: Date / Time Selection                               */}
        {/* ============================================================ */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                    <CalendarDays className="size-4 text-[#0A1F44]" />
                  </div>
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {dateError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {dateError}
                  </div>
                )}

                {/* Available days badges */}
                <div className="flex flex-wrap gap-2">
                  {Array.from(availableDayIndices).sort().map((d) => (
                    <Badge key={d} variant="secondary" className="bg-[#132D5E]/10 text-[#132D5E] rounded-lg">
                      {DAY_NAMES[d]}
                    </Badge>
                  ))}
                </div>

                {/* Calendar */}
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setDateError(''); }}
                    disabled={isDateDisabled}
                    className="rounded-xl border"
                  />
                </div>

                <Separator />

                {/* Time slot grid */}
                {selectedDate && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Select Time Slot</Label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableSlots.map((time) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setSelectedTime(time); setDateError(''); }}
                          className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'border-[#132D5E] bg-gradient-to-br from-[#0A1F44]/10 to-[#FFD54F]/10 text-[#132D5E] shadow-md shadow-[#132D5E]/10'
                              : 'border-slate-100 bg-white text-slate-600 hover:border-[#FFD54F]/40 hover:bg-[#FFD54F]/5'
                          }`}
                        >
                          <Clock className={`mx-auto mb-1 size-3.5 ${selectedTime === time ? 'text-[#132D5E]' : 'opacity-50'}`} />
                          {formatTime(time)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedDate && (
                  <div className="py-6 text-center">
                    <CalendarDays className="mx-auto size-10 text-slate-300" />
                    <p className="mt-2 text-sm text-muted-foreground">Please select a date first</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={goPrev} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl"
                  onClick={goNext}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  STEP 4: Nearby Provider Match                               */}
        {/* ============================================================ */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                    <Search className="size-4 text-[#0A1F44]" />
                  </div>
                  Nearby Provider Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {providersLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-[#132D5E]" />
                    <p className="mt-3 text-sm text-muted-foreground">Searching nearby providers...</p>
                  </div>
                ) : providersError ? (
                  <div className="py-8 text-center">
                    <Users className="mx-auto size-10 text-red-300" />
                    <p className="mt-2 text-sm text-red-600">{providersError}</p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => { setProvidersError(''); setStep(3); }}>Go Back & Retry</Button>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="mx-auto size-10 text-slate-300" />
                    <p className="mt-2 text-sm text-muted-foreground">No providers available in your area</p>
                  </div>
                ) : (
                  <>
                    {/* Best match auto-selected badge */}
                    <div className="flex items-center gap-2 rounded-xl bg-[#132D5E]/5 p-3">
                      <Award className="size-4 text-[#132D5E]" />
                      <span className="text-xs font-medium text-[#132D5E]">Best match auto-selected based on rating & proximity</span>
                    </div>

                    {/* Provider list */}
                    <RadioGroup value={selectedProviderId} onValueChange={setSelectedProviderId} className="gap-3">
                      {providers
                        .slice(0, showAllProviders ? providers.length : 2)
                        .map((provider) => (
                          <motion.label
                            key={provider.id}
                            htmlFor={`provider-${provider.id}`}
                            whileHover={{ scale: 1.01 }}
                            className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                              selectedProviderId === provider.id
                                ? 'border-[#132D5E] bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                          >
                            <RadioGroupItem value={provider.id} id={`provider-${provider.id}`} />
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                              {provider.profileImageUrl ? (
                                <img src={provider.profileImageUrl} alt={provider.name} className="size-11 rounded-full object-cover" />
                              ) : (
                                <User className="size-5 text-[#0A1F44]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{provider.name}</p>
                              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="size-3 fill-amber-400 text-amber-400" />
                                  {provider.averageRating.toFixed(1)}
                                </span>
                                <span>{provider.completedJobsCount} jobs</span>
                                {provider.specialization && <span className="hidden sm:inline">{provider.specialization}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#132D5E]">₹{provider.price.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{provider.distance} km</p>
                            </div>
                          </motion.label>
                        ))}
                    </RadioGroup>

                    {/* View all toggle */}
                    {providers.length > 2 && (
                      <Button
                        variant="ghost"
                        className="w-full gap-1 text-sm text-[#FFD54F]"
                        onClick={() => setShowAllProviders(!showAllProviders)}
                      >
                        {showAllProviders ? (
                          <>Show Less <ChevronUp className="size-4" /></>
                        ) : (
                          <>View All Providers ({providers.length}) <ChevronDown className="size-4" /></>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={goPrev} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl"
                  disabled={!selectedProviderId}
                  onClick={goNext}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  STEP 5: Technician Assignment                               */}
        {/* ============================================================ */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                    <Wrench className="size-4 text-[#0A1F44]" />
                  </div>
                  Technician Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {technicianLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-[#132D5E]" />
                    <p className="mt-3 text-sm text-muted-foreground">Assigning best technician...</p>
                  </div>
                ) : technicianError ? (
                  <div className="py-8 text-center">
                    <Wrench className="mx-auto size-10 text-red-300" />
                    <p className="mt-2 text-sm text-red-600">{technicianError}</p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => { setTechnicianError(''); setStep(4); }}>Go Back & Retry</Button>
                  </div>
                ) : technician ? (
                  <>
                    {/* Technician card */}
                    <div className="overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5">
                      <div className="flex items-center gap-4 p-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-lg">
                          {technician.profileImageUrl ? (
                            <img src={technician.profileImageUrl} alt={technician.name} className="size-16 rounded-full object-cover" />
                          ) : (
                            <User className="size-8 text-[#0A1F44]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-bold">{technician.name}</p>
                          <p className="text-sm text-muted-foreground">{technician.specialization}</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              {technician.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">{technician.experienceYears} yrs exp</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-xs text-muted-foreground">Experience</p>
                        <p className="mt-0.5 font-semibold">{technician.experienceYears} Years</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="mt-0.5 flex items-center gap-1 font-semibold">
                          <Phone className="size-3 text-[#132D5E]" />
                          {technician.phone}
                        </p>
                      </div>
                    </div>

                    {/* Certifications */}
                    {technician.certifications && technician.certifications.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Certifications</Label>
                        <div className="flex flex-wrap gap-2">
                          {technician.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1 rounded-lg bg-[#132D5E]/10 text-[#132D5E]">
                              <Award className="size-3" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* OTP section */}
                    <div className="rounded-xl border-2 border-dashed border-[#132D5E]/30 bg-[#132D5E]/5 p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">Verification OTP</p>
                      <p className="mt-1 text-xs text-muted-foreground">Share this OTP with the technician on arrival</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 shadow-sm border border-slate-100">
                        <Eye className="size-4 text-[#132D5E]" />
                        <span className="text-2xl font-bold tracking-[0.3em] text-[#132D5E]">{verificationOtp}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No technician assigned yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={goPrev} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl"
                  onClick={goNext}
                  disabled={!technician}
                >
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  STEP 6: Payment Summary                                     */}
        {/* ============================================================ */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                    <CreditCard className="size-4 text-[#0A1F44]" />
                  </div>
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {paymentError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {paymentError}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Price Breakdown</h3>
                  <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Price</span>
                      <span>₹{basePrice.toLocaleString()}</span>
                    </div>
                    {emergencyCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Emergency Charge</span>
                        <span className="text-amber-600">+₹{emergencyCharge.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>₹{platformFee}</span>
                    </div>
                    {distanceCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Distance Charge</span>
                        <span>₹{distanceCharge}</span>
                      </div>
                    )}
                    {couponApplied && couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coupon Discount</span>
                        <span className="text-[#FFD54F]">-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#132D5E]">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon code */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Ticket className="size-4" /> Apply Coupon
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); setCouponApplied(false); setCouponDiscount(0); }}
                      placeholder="Enter coupon code"
                      className="rounded-xl h-11 flex-1 uppercase"
                      disabled={couponApplied}
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl px-4 border-[#132D5E]/30 text-[#132D5E] hover:bg-[#132D5E]/5"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || couponLoading || couponApplied}
                    >
                      {couponLoading ? <Loader2 className="size-4 animate-spin" /> : couponApplied ? <Check className="size-4" /> : 'Apply'}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  {couponApplied && (
                    <p className="flex items-center gap-1 text-xs text-[#FFD54F] font-medium">
                      <Check className="size-3" /> Coupon applied! You save ₹{couponDiscount.toLocaleString()}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Payment method */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <motion.label
                          key={method.value}
                          htmlFor={`pay-${method.value}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                            paymentMethod === method.value
                              ? 'border-[#132D5E] bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5'
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                          <RadioGroupItem value={method.value} id={`pay-${method.value}`} />
                          <Icon className={`size-4 ${paymentMethod === method.value ? 'text-[#132D5E]' : 'text-slate-400'}`} />
                          <span className={`text-sm font-medium ${paymentMethod === method.value ? 'text-[#132D5E]' : 'text-slate-600'}`}>
                            {method.label}
                          </span>
                        </motion.label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#132D5E]/5 p-3">
                  <Shield className="size-4 text-[#132D5E]" />
                  <span className="text-xs font-medium text-[#132D5E]">Secure payment powered by {COMPANY_INFO.name}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between p-4">
                <Button variant="outline" onClick={goPrev} className="rounded-xl">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl h-11 px-8"
                  onClick={handleConfirmBooking}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Confirming...
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

        {/* ============================================================ */}
        {/*  STEP 7: Booking Confirmation                                */}
        {/* ============================================================ */}
        {step === 7 && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />

              {/* Success animation area */}
              <div className="flex flex-col items-center py-8 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-xl shadow-[#FFD54F]/30"
                >
                  <CircleCheckBig className="size-10 text-[#0A1F44]" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-2xl font-bold text-[#132D5E]"
                >
                  Booking Confirmed!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-1 text-sm text-muted-foreground"
                >
                  Your service has been booked successfully
                </motion.p>
              </div>

              <CardContent className="space-y-4 px-6 pb-6">
                {/* Booking ID */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl border-2 border-dashed border-[#132D5E]/20 bg-[#132D5E]/5 p-4 text-center"
                >
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="mt-1 text-lg font-bold tracking-wider text-[#132D5E]">
                    {bookingId || 'BYS-PENDING'}
                  </p>
                </motion.div>

                {/* Booking details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3 rounded-xl border border-slate-100 bg-white p-4"
                >
                  {[
                    {
                      label: 'Service',
                      value: service.title,
                      icon: <Briefcase className="size-3.5 text-[#132D5E]" />,
                    },
                    {
                      label: 'Date & Time',
                      value: selectedDate
                        ? `${selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at ${formatTime(selectedTime)}`
                        : 'N/A',
                      icon: <CalendarDays className="size-3.5 text-[#132D5E]" />,
                    },
                    {
                      label: 'Provider',
                      value: providers.find((p) => p.id === selectedProviderId)?.name || service.provider?.name || 'Assigned Provider',
                      icon: <Users className="size-3.5 text-[#132D5E]" />,
                    },
                    {
                      label: 'Technician',
                      value: technician?.name || 'Assigned Technician',
                      icon: <Wrench className="size-3.5 text-[#132D5E]" />,
                    },
                    {
                      label: 'Address',
                      value: address,
                      icon: <MapPin className="size-3.5 text-[#132D5E]" />,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="mt-0.5">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium line-clamp-2">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <Separator />

                {/* Amount paid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between rounded-xl bg-[#0A1F44] p-4 text-[#FFD54F]"
                >
                  <span className="text-sm font-medium opacity-90">Amount Paid</span>
                  <span className="text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
                </motion.div>

                {/* OTP reminder */}
                {verificationOtp && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center"
                  >
                    <p className="text-xs font-medium text-amber-800">Remember to share OTP <span className="font-bold">{verificationOtp}</span> with the technician</p>
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-3 pt-2 sm:flex-row"
                >
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl h-11"
                    onClick={() => navigate('client-booking-detail', { bookingId: bookingId || '' })}
                  >
                    <MapPinned className="mr-2 size-4" /> Track Booking
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-11 border-[#132D5E]/30 text-[#132D5E] hover:bg-[#132D5E]/5"
                    onClick={() => navigate('home')}
                  >
                    <Home className="mr-2 size-4" /> Back to Home
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Step-specific error for booking submission ---- */}
      {bookingError && step !== 6 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200"
        >
          {bookingError}
        </motion.div>
      )}
    </div>
  );
}

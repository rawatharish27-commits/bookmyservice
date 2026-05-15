import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Droplets,
  Zap,
  Wind,
  ArrowRight,
  Users,
  Shield,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  Star,
  Wrench,
  Eye,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Quote,
  Clock,
  ThumbsUp,
  Snowflake,
  Shirt,
  ChefHat,
  Tv,
  Flame,
  Truck,
  Droplet,
  Home,
  Navigation,
  MessageCircle,
  UserPlus,
  Rocket,
  Briefcase,
  Handshake,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/lib/api-url';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  subcategoriesCount: number;
  servicesCount: number;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  priceNegotiable: boolean;
  averageRating: number;
  totalBookings: number;
  totalReviews: number;
  city?: string;
  images?: string;
  provider: { id: string; name: string; profileImageUrl?: string };
  category: { id: number; name: string; slug: string };
}

interface PlatformStats {
  activeVisitors: number;
  totalVisitors: number;
  totalUsers: number;
  totalProviders: number;
  totalServices: number;
  totalBookings: number;
  timestamp: string;
}

interface LocationData {
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

// ─── Static 11 Service Definitions ────────────────────────────────────────────

const SERVICE_CATEGORIES = [
  { name: 'Air Conditioner', slug: 'air-conditioner', icon: 'Wind', description: 'AC repair, gas refill & servicing', image: '/images/air-conditioner.jpg' },
  { name: 'Refrigerator', slug: 'refrigerator', icon: 'Snowflake', description: 'Fridge repair & maintenance', image: '/images/refrigerator.jpg' },
  { name: 'Washing Machine', slug: 'washing-machine', icon: 'Shirt', description: 'Washer repair & installation', image: '/images/washing-machine.jpg' },
  { name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: 'ChefHat', description: 'Mixer, chimney & appliance repair', image: '/images/kitchen-appliances.jpg' },
  { name: 'TV Repair', slug: 'tv-repair', icon: 'Tv', description: 'LED, LCD & smart TV repair', image: '/images/tv-repair.jpg' },
  { name: 'Water Purifier', slug: 'water-purifier', icon: 'Droplets', description: 'RO, UV & water filter service', image: '/images/water-purifier.jpg' },
  { name: 'Geyser', slug: 'geyser', icon: 'Flame', description: 'Water heater repair & install', image: '/images/geyser.jpg' },
  { name: 'Plumber', slug: 'plumber', icon: 'Wrench', description: 'Pipe fitting, leakage & plumbing', image: '/images/plumber.jpg' },
  { name: 'Electrician', slug: 'electrician', icon: 'Zap', description: 'Wiring, switches & electrical work', image: '/images/electrician.jpg' },
  { name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', icon: 'Droplet', description: 'Tank cleaning & sanitization', image: '/images/water-tank-cleaning.jpg' },
  { name: 'Movers and Packers', slug: 'movers-and-packers', icon: 'Truck', description: 'Home shifting & packing services', image: '/images/movers-and-packers.jpg' },
] as const;

// ─── Category Icon Map ────────────────────────────────────────────────────────

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Wind: <Wind className="size-7" />,
  Snowflake: <Snowflake className="size-7" />,
  Shirt: <Shirt className="size-7" />,
  ChefHat: <ChefHat className="size-7" />,
  Tv: <Tv className="size-7" />,
  Droplets: <Droplets className="size-7" />,
  Flame: <Flame className="size-7" />,
  Wrench: <Wrench className="size-7" />,
  Zap: <Zap className="size-7" />,
  Droplet: <Droplet className="size-7" />,
  Truck: <Truck className="size-7" />,
};

// ─── Testimonial Data ─────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  quote: string;
  avatar: string;
  service: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Priya Sharma',
    role: 'Homeowner, Mumbai',
    rating: 5,
    quote: 'The AC technician arrived within 30 minutes and fixed the cooling issue perfectly. Transparent pricing and professional service. Highly recommend!',
    avatar: 'PS',
    service: 'AC Repair',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Business Owner, Delhi',
    rating: 5,
    quote: 'Got our office plumbing fixed before an important meeting. The plumber was well-trained and explained everything clearly. Great experience overall.',
    avatar: 'RK',
    service: 'Plumbing',
  },
  {
    name: 'Ananya Patel',
    role: 'Apartment Resident, Bangalore',
    rating: 4,
    quote: 'Electrical work at my apartment was done neatly. The provider was KYC verified which gave me peace of mind. Will use again!',
    avatar: 'AP',
    service: 'Electrical',
  },
  {
    name: 'Vikram Singh',
    role: 'Property Manager, Pune',
    rating: 5,
    quote: 'Managing multiple properties, I rely on BookYourService for all maintenance. From appliance repair to plumbing, their verified providers never disappoint.',
    avatar: 'VS',
    service: 'Appliance Repair',
  },
  {
    name: 'Meera Joshi',
    role: 'Homeowner, Hyderabad',
    rating: 5,
    quote: 'Booked an emergency electrical repair late evening. The provider came on time and resolved the issue safely. Impressive service!',
    avatar: 'MJ',
    service: 'Electrical',
  },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ value, loading, className = '' }: { value: number; loading: boolean; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(value);

  useEffect(() => {
    if (loading) return;
    const start = ref.current;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ref.current = end;
      }
    }
    requestAnimationFrame(animate);
  }, [value, loading]);

  if (loading) return <span className={`inline-block h-7 w-16 animate-pulse rounded-md bg-[#1e3a5f]/20 ${className}`} />;
  return <span className={className}>{display.toLocaleString()}</span>;
}

// ─── Rotating Text Component ──────────────────────────────────────────────────

function RotatingText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ y: 30, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -30, opacity: 0, scale: 1.15 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="inline-block bg-gradient-to-r from-sky-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent"
        style={{ textShadow: '0 0 40px rgba(30,58,95,0.5), 0 0 80px rgba(59,130,246,0.25)' }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// ─── Testimonial Carousel ─────────────────────────────────────────────────────

function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, testimonials.length]);

  const next = () => { setAutoPlay(false); setCurrent((prev) => (prev + 1) % testimonials.length); };
  const prev = () => { setAutoPlay(false); setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length); };

  const t = testimonials[current];

  return (
    <div className="relative mx-auto max-w-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -60, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative overflow-hidden rounded-3xl p-8 text-center shadow-2xl sm:p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.8) 40%, rgba(240,249,255,0.7) 70%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30,58,95,0.12)',
          }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-[#1e3a5f]/10 to-sky-200/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-gradient-to-br from-slate-200/15 to-[#1e3a5f]/5 blur-2xl" />
          <div className="relative">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#2d5a8e]/10">
              <Quote className="size-7 text-[#1e3a5f]/60" />
            </div>
            <p className="mb-7 text-lg leading-relaxed text-foreground/85 sm:text-xl">&ldquo;{t.quote}&rdquo;</p>
            <div className="mb-5 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-5 ${i < t.rating ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]' : 'fill-gray-200 text-gray-200'}`} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] text-base font-bold text-white shadow-lg shadow-[#1e3a5f]/30 ring-2 ring-white/50">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
              <Badge className="ml-2 border-[#1e3a5f]/20 bg-gradient-to-r from-[#0a1628]/5 to-[#2d5a8e]/5 px-3 py-1 text-[#1e3a5f]" variant="outline">
                {t.service}
              </Badge>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-5">
        <button onClick={prev} className="group flex size-11 items-center justify-center rounded-full border border-[#1e3a5f]/20 bg-white text-[#1e3a5f] shadow-sm transition-all duration-300 hover:bg-[#0a1628]/5 hover:shadow-md hover:scale-110" aria-label="Previous testimonial">
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="flex gap-2.5">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => { setCurrent(idx); setAutoPlay(false); }} className={`h-3 rounded-full transition-all duration-400 ${idx === current ? 'w-10 bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] shadow-md shadow-[#1e3a5f]/30' : 'w-3 bg-[#1e3a5f]/20 hover:bg-[#1e3a5f]/30 hover:scale-125'}`} aria-label={`Go to testimonial ${idx + 1}`} />
          ))}
        </div>
        <button onClick={next} className="group flex size-11 items-center justify-center rounded-full border border-[#1e3a5f]/20 bg-white text-[#1e3a5f] shadow-sm transition-all duration-300 hover:bg-[#0a1628]/5 hover:shadow-md hover:scale-110" aria-label="Next testimonial">
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HomePage() {
  const { navigate } = useApp();
  const { user } = useAuth();

  // Data fetching
  const { data: categoriesData, loading: categoriesLoading } = useApi<{ categories: Category[]; total: number }>('/api/categories');
  const { data: servicesData, loading: servicesLoading } = useApi<{ services: ServiceItem[]; pagination: { total: number } }>('/api/services?limit=6');

  const categories = categoriesData?.categories || [];
  const services = servicesData?.services || [];

  // Location state
  const geoAvailable = typeof window !== 'undefined' && !!navigator.geolocation;
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(geoAvailable);
  const [locationError, setLocationError] = useState(!geoAvailable);
  const [pincodeInput, setPincodeInput] = useState('');

  // Area activation state
  const [areaProviders, setAreaProviders] = useState(0);
  const [areaCustomers, setAreaCustomers] = useState(0);

  // Popup funnel state
  const [showPopup, setShowPopup] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Real-time stats
  const [liveStats, setLiveStats] = useState<PlatformStats | null>(null);

  // Horizontal scroll ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // Service availability - check if providers exist in user's area
  const hasProvidersInArea = areaProviders > 0;
  const hasLimitedServices = areaProviders > 0 && areaProviders < 10;

  // ─── Auto Location Detection ──────────────────────────────────────────────

  useEffect(() => {
    if (!geoAvailable) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setLocation({
              city: addr.city || addr.town || addr.village || addr.county || 'Unknown',
              state: addr.state || '',
              pincode: addr.postcode || '',
              lat: latitude,
              lng: longitude,
            });
          } else {
            setLocation({ city: 'Your Area', state: '', pincode: '', lat: latitude, lng: longitude });
          }
        } catch {
          setLocation({ city: 'Your Area', state: '', pincode: '', lat: latitude, lng: longitude });
        }
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [geoAvailable]);

  // ─── Fetch area activation data ────────────────────────────────────────────

  useEffect(() => {
    async function fetchAreaData() {
      try {
        const res = await fetch(apiUrl('/api/stats/platform'));
        if (res.ok) {
          const data = await res.json();
          setLiveStats({
            activeVisitors: data.activeVisitors || 0,
            totalVisitors: data.totalVisitors || 0,
            totalUsers: data.totalClients || data.totalUsers || 0,
            totalProviders: data.totalProviders || 0,
            totalServices: data.totalServices || 0,
            totalBookings: data.totalBookings || 0,
            timestamp: new Date().toISOString(),
          });
          setAreaProviders(data.totalProviders || 0);
          setAreaCustomers(data.totalClients || data.totalUsers || 0);
        }
      } catch {
        // Will use defaults (0)
      }
    }
    fetchAreaData();
    const interval = setInterval(fetchAreaData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Popup Funnel Logic ────────────────────────────────────────────────────

  useEffect(() => {
    const dismissed = localStorage.getItem('bys_popup_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = (permanent: boolean) => {
    setShowPopup(false);
    if (permanent) {
      localStorage.setItem('bys_popup_dismissed', 'true');
      setDontShowAgain(true);
    }
  };

  // ─── Horizontal Scroll Handlers ────────────────────────────────────────────

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // ─── WhatsApp Referral ─────────────────────────────────────────────────────

  const openWhatsAppReferral = () => {
    const message = encodeURIComponent(
      'Hamare area me Book My Service start ho raha hai. Agar aap AC repair / electrician / plumber service provide karte ho to join karo aur customers pao. 🛠️🏠'
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const openWhatsAppProviderReferral = () => {
    const message = encodeURIComponent(
      'BookYourService me ek bahut achha opportunity hai! Agar aap koi service provider jaante ho (AC repair, plumber, electrician), unhe refer karein aur 5% referral commission paayein har booking pe. 🤝'
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // ─── Pincode Lookup ────────────────────────────────────────────────────────

  const handlePincodeLookup = async () => {
    if (!pincodeInput || pincodeInput.length < 5) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${pincodeInput}+India&addressdetails=1&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const addr = data[0].address || {};
          setLocation({
            city: addr.city || addr.town || addr.village || addr.county || pincodeInput,
            state: addr.state || '',
            pincode: pincodeInput,
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
          setLocationError(false);
        }
      }
    } catch {
      // Keep existing state
    }
  };

  // ─── Motion Variants ────────────────────────────────────────────────────────

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  // ─── Map API categories to our service definitions ────────────────────────

  const getServiceAvailability = (slug: string): boolean => {
    const apiCategory = categories.find((c) => c.slug === slug);
    if (apiCategory) return (apiCategory.servicesCount || 0) > 0;
    return false;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* ═══════════ 1. Announcement Bar (Navy Blue) ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #2d5a8e 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <motion.div className="absolute left-[8%] top-1/2 -translate-y-1/2 size-24 rounded-full bg-white/5" animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute right-[12%] top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/5" animate={{ scale: [1.3, 1, 1.3], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center gap-3">
              <Sparkles className="size-5 text-sky-300" />
              <p className="text-sm font-medium text-blue-100">
                <span className="font-bold text-white">First 100 Clients</span> — Get FREE Subscription for 1 Year!
              </p>
            </motion.div>
            <div className="hidden h-4 w-px bg-white/20 sm:block" />
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-sky-300" />
              <p className="text-sm font-medium text-blue-100">
                <span className="font-bold text-white">First 50 Providers</span> — Get FREE Subscription for 1 Year!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 2. Hero Section (Navy Blue Gradient) ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 25%, #2d5a8e 50%, #1e3a5f 75%, #0a1628 100%)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 size-[800px] rounded-full bg-gradient-to-br from-[#2d5a8e]/30 to-sky-400/15 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[700px] rounded-full bg-gradient-to-tl from-[#1e3a5f]/25 to-slate-400/10 blur-3xl" />
          <motion.div className="absolute -left-20 -top-20 size-96 rounded-full bg-sky-400/[0.06]" animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-10 right-10 size-72 rounded-full bg-[#2d5a8e]/[0.06]" animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          {Array.from({ length: 20 }).map((_, i) => {
            const seed = (i * 2654435761) >>> 0;
            return (
              <motion.div
                key={`p-${i}`}
                className="absolute rounded-full bg-white/[0.08]"
                style={{ width: `${2 + (seed % 300) / 100}px`, height: `${2 + ((seed * 7) % 300) / 100}px`, left: `${(seed * 13) % 100}%`, top: `${(seed * 17) % 100}%` }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 2 + (seed % 300) / 100, repeat: Infinity, delay: (seed * 3 % 300) / 100, ease: 'easeInOut' }}
              />
            );
          })}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-40">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="mb-6 border-sky-300/20 bg-[#1e3a5f]/50 px-5 py-2 text-sky-100 hover:bg-[#1e3a5f]/60 text-sm">
                  <Sparkles className="mr-2 size-4" /> India&apos;s Trusted Home Service Platform
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Expert{' '}
                <RotatingText words={['AC Repair', 'Plumbing', 'Electrical', 'Appliance Repair']} />
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(30,58,95,0.5)' }}>at Your Doorstep</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100/70">
                Book verified professionals for AC repair, plumbing, electrical, appliance repair, and more.
                Quality work, transparent pricing, and our satisfaction guarantee.
              </motion.p>

              {/* Location Detection Display */}
              <motion.div variants={fadeUp} custom={3} className="mt-5 flex items-center gap-2.5">
                <Navigation className="size-4 text-sky-300" />
                {locationLoading ? (
                  <span className="text-sm text-blue-200">📍 Detecting your location...</span>
                ) : location ? (
                  <span className="text-sm text-blue-200">📍 {location.city}{location.state ? `, ${location.state}` : ''}</span>
                ) : (
                  <span className="text-sm text-blue-200/70">📍 Location unavailable</span>
                )}
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-300/60" />
                  <span className="relative inline-flex size-3 rounded-full bg-sky-300 shadow-md shadow-sky-300/50" />
                </span>
                <span className="text-sm font-medium text-blue-200">
                  <AnimatedCounter value={liveStats?.activeVisitors || 0} loading={!liveStats} className="font-bold" /> viewing
                </span>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button size="lg" onClick={() => navigate('categories')} className="group h-13 bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] px-10 text-base font-bold text-white shadow-xl shadow-[#1e3a5f]/30 hover:from-[#0a1628] hover:via-[#2d5a8e] hover:to-sky-600 hover:shadow-2xl hover:shadow-[#1e3a5f]/40">
                  Book a Service <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {!user && (
                  <>
                    <Button size="lg" onClick={() => navigate('login')} className="h-13 border-2 border-sky-300/40 bg-[#1e3a5f]/30 px-8 text-base text-white shadow-lg backdrop-blur-sm hover:border-sky-300/60 hover:bg-[#1e3a5f]/40">
                      Client Login
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('register')} className="h-13 border-[#2d5a8e]/40 text-base text-blue-100 hover:bg-[#1e3a5f]/15 hover:border-[#2d5a8e]/60">
                      Join as Provider
                    </Button>
                  </>
                )}
                {user && user.role === 'CLIENT' && (
                  <Button size="lg" onClick={() => navigate('client-dashboard')} className="h-13 border-2 border-sky-300/40 bg-[#1e3a5f]/30 px-8 text-base text-white shadow-lg backdrop-blur-sm hover:border-sky-300/60">
                    My Dashboard
                  </Button>
                )}
                {user && user.role === 'PROVIDER' && (
                  <Button size="lg" onClick={() => navigate('provider-dashboard')} className="h-13 border-2 border-[#2d5a8e]/40 bg-[#1e3a5f]/30 px-8 text-base text-white shadow-lg backdrop-blur-sm hover:border-[#2d5a8e]/60">
                    Provider Dashboard
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* Hero Visual - Floating Icons */}
            <motion.div className="hidden lg:flex lg:items-center lg:justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="relative flex size-[400px] items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2d5a8e]/15 to-sky-400/8 blur-3xl" />
                <motion.div className="absolute inset-4 rounded-full border border-white/[0.08]" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} />
                <div className="absolute inset-12 rounded-full border border-white/[0.05]" />

                {/* Floating service icons */}
                <motion.div className="absolute -left-4 top-4" animate={{ y: [0, -20, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1e3a5f]/40 to-sky-400/20 shadow-2xl shadow-[#1e3a5f]/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wind className="size-10 text-sky-200 drop-shadow-[0_0_12px_rgba(147,197,253,0.6)]" />
                  </div>
                </motion.div>
                <motion.div className="absolute right-0 top-16" animate={{ y: [0, 18, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-500/30 to-[#2d5a8e]/15 shadow-2xl shadow-slate-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wrench className="size-10 text-slate-200 drop-shadow-[0_0_12px_rgba(203,213,225,0.6)]" />
                  </div>
                </motion.div>
                <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2" animate={{ y: [0, -15, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/30 to-[#1e3a5f]/15 shadow-2xl shadow-sky-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Zap className="size-10 text-sky-200 drop-shadow-[0_0_12px_rgba(125,211,252,0.6)]" />
                  </div>
                </motion.div>

                <div className="rounded-3xl bg-white/10 px-8 py-5 text-center shadow-2xl backdrop-blur-xl ring-1 ring-white/20">
                  <Home className="mx-auto mb-2 size-7 text-sky-200/80" />
                  <p className="text-xl font-bold text-white">Your Home</p>
                  <p className="text-sm font-medium text-blue-200/80">Our Expertise</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V50C180 80 360 20 540 50C720 80 900 20 1080 50C1260 80 1350 35 1440 50V100H0Z" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
      </section>

      {/* ═══════════ 3. Location Bar ═══════════ */}
      <section className="relative z-10 -mt-2 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-[#1e3a5f]/10 bg-gradient-to-r from-[#0a1628]/5 via-white to-[#2d5a8e]/5 p-4 shadow-sm sm:flex-row sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a1628] to-[#2d5a8e] text-white shadow-md">
                <MapPin className="size-5" />
              </div>
              <div>
                {locationLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-[#1e3a5f]/10" />
                    <span className="text-xs text-muted-foreground">Detecting...</span>
                  </div>
                ) : location ? (
                  <>
                    <p className="text-sm font-semibold text-[#0a1628]">
                      📍 {location.city}{location.state ? `, ${location.state}` : ''} {location.pincode ? `— ${location.pincode}` : ''}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Serving in your area
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#0a1628]">📍 Location not detected</p>
                    <p className="text-xs text-amber-600 font-medium">Enter your pincode below</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter pincode"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePincodeLookup()}
                className="h-9 w-36 border-[#1e3a5f]/20 text-sm focus-visible:border-[#2d5a8e] focus-visible:ring-[#2d5a8e]/20"
              />
              <Button onClick={handlePincodeLookup} size="sm" className="bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] text-white hover:from-[#1e3a5f] hover:to-[#2d5a8e]">
                Check
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 4. Service Categories — HORIZONTAL SCROLL ═══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-[#0a1628] sm:text-4xl">Our Service Categories</h2>
            <p className="mt-3 text-lg text-muted-foreground">Professional home services at your doorstep</p>
          </motion.div>

          {/* Scroll Controls + Container */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-[#1e3a5f]/20 bg-white text-[#1e3a5f] shadow-lg transition-all hover:bg-[#0a1628] hover:text-white hover:shadow-xl hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-[#1e3a5f]/20 bg-white text-[#1e3a5f] shadow-lg transition-all hover:bg-[#0a1628] hover:text-white hover:shadow-xl hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollRef}
              className="scrollbar-thin flex gap-5 overflow-x-auto px-8 py-2 scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d5a8e transparent' }}
            >
              {SERVICE_CATEGORIES.map((service, idx) => {
                const isAvailable = getServiceAvailability(service.slug);
                return (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    className="group relative flex-shrink-0"
                    style={{ width: '200px' }}
                  >
                    <TiltCard>
                      <div
                        onClick={() => isAvailable ? navigate('category-detail', { slug: service.slug }) : undefined}
                        className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isAvailable ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ height: '280px' }}
                      >
                        {/* Service Image */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1628]/90">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Fallback gradient if no image */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/80 via-[#0a1628]/60 to-[#0a1628]" />

                        {/* Icon overlay */}
                        <div className="absolute top-4 left-4 z-10 flex size-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20 shadow-lg">
                          {CATEGORY_ICON_MAP[service.icon] || <Wrench className="size-7" />}
                        </div>

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                          <h3 className="text-base font-bold text-white drop-shadow-md">{service.name}</h3>
                          <p className="mt-1 text-xs text-blue-100/80 leading-relaxed">{service.description}</p>
                          {isAvailable && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-sky-300 font-medium">
                              <span>View Services</span>
                              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </div>

                        {/* Coming Soon Overlay */}
                        {!isAvailable && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a1628]/60 backdrop-blur-[2px]">
                            <Badge className="bg-[#1e3a5f]/80 text-sky-200 border-[#2d5a8e]/30 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
                              Coming Soon
                            </Badge>
                            <p className="mt-2 text-xs text-blue-100/70">In Your Area</p>
                          </div>
                        )}
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 5. Area Activation Meter ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#2d5a8e]/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-[#2d5a8e]/20 ring-1 ring-white/10">
              <Rocket className="size-8 text-sky-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              🚀 {location?.city || 'Your City'} Area Launch Progress
            </h2>
            <p className="mt-2 text-blue-100/60">Help us launch faster — join as a provider or refer one!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-10 max-w-xl rounded-3xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 shadow-2xl"
          >
            {/* Providers Progress */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Shield className="size-4 text-sky-300" /> Providers Joined
                </span>
                <span className="text-sm font-bold text-sky-300">
                  {areaProviders}/20 <span className="text-blue-100/50 font-normal">({Math.round((areaProviders / 20) * 100)}%)</span>
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min((areaProviders / 20) * 100, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Customers Progress */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Users className="size-4 text-sky-300" /> Customers Joined
                </span>
                <span className="text-sm font-bold text-sky-300">
                  {areaCustomers}/100 <span className="text-blue-100/50 font-normal">({Math.round((areaCustomers / 100) * 100)}%)</span>
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#2d5a8e] to-sky-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min((areaCustomers / 100) * 100, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Milestone markers */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-blue-100/50">
              <span>🚀 Launching</span>
              <span>⚡ 25% — Early Access</span>
              <span>🔥 50% — Active</span>
              <span>🎉 100% — Fully Live</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 6. Smart Service Visibility Section ═══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasProvidersInArea ? (
            /* Services Available — Show popular services */
            <>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
                <h2 className="text-3xl font-extrabold text-[#0a1628] sm:text-4xl">Popular Services in Your Area</h2>
                <p className="mt-3 text-lg text-muted-foreground">Top-rated services with verified providers near you</p>
              </motion.div>

              {servicesLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden rounded-2xl">
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="mb-2 h-5 w-3/4" />
                        <Skeleton className="mb-2 h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : services.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.slice(0, 6).map((service, idx) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                      <TiltCard>
                        <Card className="group cursor-pointer overflow-hidden rounded-2xl border-[#1e3a5f]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#2d5a8e]/20" onClick={() => navigate('service-detail', { id: service.id })}>
                          <div className="relative overflow-hidden">
                            {service.images ? (
                              <img src={service.images.split(',')[0]} alt={service.title} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="aspect-video w-full bg-gradient-to-br from-[#1e3a5f]/20 to-[#2d5a8e]/10 flex items-center justify-center">
                                <Wrench className="size-12 text-[#1e3a5f]/30" />
                              </div>
                            )}
                            <Badge className="absolute top-3 right-3 bg-[#0a1628]/80 text-sky-200 backdrop-blur-sm border-[#2d5a8e]/30">
                              {service.category.name}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-base font-bold text-[#0a1628] line-clamp-1">{service.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold text-[#0a1628]">{service.averageRating?.toFixed(1) || '4.5'}</span>
                                <span className="text-xs text-muted-foreground">({service.totalReviews || 0})</span>
                              </div>
                              <span className="text-sm font-bold text-[#1e3a5f]">₹{service.basePrice}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="mx-auto size-16 text-[#1e3a5f]/20" />
                  <p className="mt-4 text-lg text-muted-foreground">No services listed yet in your area. Be the first provider!</p>
                </div>
              )}
            </>
          ) : (
            /* No Providers — Show Coming Soon with CTAs */
            <>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#2d5a8e]/10">
                  <MapPin className="size-8 text-[#1e3a5f]" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#0a1628] sm:text-4xl">Service Coming Soon In Your Area</h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Hamare area me abhi providers nahi hain. Aap help kar sakte ho services jaldi start karne me!
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }} className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                <Card className="group cursor-pointer border-[#1e3a5f]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#2d5a8e]/20" onClick={() => navigate('register', { role: 'PROVIDER' })}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/20">
                      <UserPlus className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1628]">Become Service Provider</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Join as a professional & get customers</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] text-white hover:from-[#1e3a5f] hover:to-[#2d5a8e]">
                      Join Now <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer border-[#1e3a5f]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#2d5a8e]/20" onClick={openWhatsAppReferral}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20">
                      <MessageCircle className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1628]">Refer Service Provider</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Know a provider? Refer via WhatsApp & earn</p>
                    <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white hover:from-emerald-700 hover:to-emerald-500">
                      <MessageCircle className="mr-1 size-4" /> WhatsApp Refer
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer border-[#1e3a5f]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#2d5a8e]/20" onClick={() => navigate('register', { role: 'AREA_MANAGER' })}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-sky-500 text-white shadow-lg shadow-[#1e3a5f]/20">
                      <Briefcase className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1628]">Become Area Manager</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Manage operations in your locality</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#1e3a5f] to-sky-500 text-white hover:from-[#1e3a5f] hover:to-sky-600">
                      Apply Now <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer border-[#1e3a5f]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#2d5a8e]/20">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-300 text-white shadow-lg shadow-amber-400/20">
                      <Clock className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1628]">Join Waiting List</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get notified when services launch near you</p>
                    <Button variant="outline" className="mt-4 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#0a1628]/5">
                      Join List <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════ 7. How It Works Section ═══════════ */}
      <section className="bg-gradient-to-b from-[#0a1628]/5 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-[#0a1628] sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-lg text-muted-foreground">Getting expert help is just 4 steps away</p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <CalendarCheck className="size-8" />, title: 'Book Service', desc: 'Choose a service, pick a time, and book in minutes', step: '01' },
              { icon: <Handshake className="size-8" />, title: 'Get Matched', desc: 'We match you with a verified, top-rated provider', step: '02' },
              { icon: <Home className="size-8" />, title: 'Service at Door', desc: 'Provider arrives on time with all required tools', step: '03' },
              { icon: <Star className="size-8" />, title: 'Rate & Review', desc: 'Pay securely, rate the service, and share feedback', step: '04' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
              >
                <TiltCard>
                  <div className="relative overflow-hidden rounded-2xl border border-[#1e3a5f]/10 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#2d5a8e]/20 text-center">
                    <div className="absolute -right-3 -top-3 text-6xl font-black text-[#1e3a5f]/5">{item.step}</div>
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/20">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1628]">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                    {idx < 3 && (
                      <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 text-[#1e3a5f]/20">
                        <ArrowRight className="size-6" />
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 8. Testimonials Carousel ═══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-[#0a1628] sm:text-4xl">What Our Customers Say</h2>
            <p className="mt-3 text-lg text-muted-foreground">Real reviews from real customers</p>
          </motion.div>
          <TestimonialCarousel testimonials={DEFAULT_TESTIMONIALS} />
        </div>
      </section>

      {/* ═══════════ 9. Career / Join Our Team Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/20">
              <Briefcase className="size-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0a1628] sm:text-4xl">Join Our Team</h2>
            <p className="mt-3 text-lg text-muted-foreground">Be part of the hyperlocal service revolution</p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {/* Area Manager Card */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <TiltCard>
                <Card className="h-full overflow-hidden rounded-2xl border-[#1e3a5f]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#2d5a8e]/20">
                  <div className="h-2 bg-gradient-to-r from-[#0a1628] to-[#2d5a8e]" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#2d5a8e] text-white shadow-lg shadow-[#1e3a5f]/20">
                      <Shield className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0a1628]">Area Manager</h3>
                    <p className="mt-1 text-sm text-[#2d5a8e] font-medium">Local Operations Leader</p>
                    <ul className="mt-4 space-y-2">
                      {['Local providers onboarding', 'Customer acquisition', 'Local operations management', 'Community building'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 text-[#2d5a8e] flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate('register', { role: 'AREA_MANAGER' })} className="mt-6 w-full bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] text-white hover:from-[#1e3a5f] hover:to-[#2d5a8e]">
                      Apply as Area Manager <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>

            {/* Local Admin Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <TiltCard>
                <Card className="h-full overflow-hidden rounded-2xl border-[#1e3a5f]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#2d5a8e]/20">
                  <div className="h-2 bg-gradient-to-r from-[#1e3a5f] to-sky-500" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-sky-500 text-white shadow-lg shadow-[#1e3a5f]/20">
                      <ThumbsUp className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0a1628]">Local Admin</h3>
                    <p className="mt-1 text-sm text-[#2d5a8e] font-medium">Support & Quality Champion</p>
                    <ul className="mt-4 space-y-2">
                      {['Complaint handling & resolution', 'Provider verification & KYC', 'Local support operations', 'Quality assurance'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 text-[#2d5a8e] flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate('register', { role: 'SUB_ADMIN' })} className="mt-6 w-full bg-gradient-to-r from-[#1e3a5f] to-sky-500 text-white hover:from-[#1e3a5f] hover:to-sky-600">
                      Apply as Local Admin <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 10. Referral Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #2d5a8e 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 top-0 size-80 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[#2d5a8e]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl items-center gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 ring-1 ring-white/10">
                <Handshake className="size-8 text-emerald-300" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">Refer & Earn</h2>
              <p className="mt-4 text-lg text-blue-100/70 leading-relaxed">
                Apne area ke service providers ko refer karein aur har booking pe 5% referral commission paayein. Jitne zyada referrals, utni zyada earning!
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 text-[#0a1628] font-bold shadow-lg shadow-amber-400/20">
                  5%
                </div>
                <div>
                  <p className="font-bold text-white">Referral Commission</p>
                  <p className="text-sm text-blue-100/60">On every booking from your referral</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={openWhatsAppProviderReferral}
                className="mt-8 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-700 hover:to-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30"
              >
                <MessageCircle className="mr-2 size-5" /> Refer via WhatsApp
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Card className="overflow-hidden rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">How Referral Works</h3>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'Share WhatsApp Link', desc: 'Send referral message to providers you know' },
                      { step: '2', title: 'Provider Joins', desc: 'They register using your referral' },
                      { step: '3', title: 'Start Earning', desc: 'Get 5% commission on every booking they complete' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-sm font-bold text-white">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{item.title}</p>
                          <p className="text-xs text-blue-100/60">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 11. Pop-Up Funnel ═══════════ */}
      <Dialog open={showPopup} onOpenChange={(open) => { if (!open) closePopup(false); }}>
        <DialogContent className="max-w-md rounded-3xl border-[#1e3a5f]/20 p-0 overflow-hidden" showCloseButton={false}>
          <div className="relative">
            {/* Navy Header */}
            <div className="px-6 pt-8 pb-6" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)' }}>
              <button onClick={() => closePopup(false)} className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                <X className="size-4" />
              </button>

              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-[#2d5a8e]/20 ring-1 ring-white/10 mx-auto">
                <Rocket className="size-7 text-sky-300" />
              </div>

              <h3 className="mt-4 text-center text-xl font-bold text-white">
                {!hasProvidersInArea
                  ? 'Book My Service abhi aapke area me launch nahi hua'
                  : hasLimitedServices
                  ? 'Sirf kuch services available hain. Apne area me aur services start karne me help kare.'
                  : 'Welcome to BookYourService!'
                }
              </h3>
            </div>

            <div className="px-6 pb-6 pt-4">
              {/* Area Progress Mini */}
              <div className="mb-5 rounded-2xl bg-[#0a1628]/5 p-4">
                <p className="text-xs font-semibold text-[#0a1628] mb-2">🚀 Area Launch Progress</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Providers</span>
                    <span className="font-bold text-[#1e3a5f]">{areaProviders}/20</span>
                  </div>
                  <Progress value={(areaProviders / 20) * 100} className="h-2 bg-[#1e3a5f]/10 [&>div]:bg-gradient-to-r [&>div]:from-[#0a1628] [&>div]:to-[#2d5a8e]" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Customers</span>
                    <span className="font-bold text-[#1e3a5f]">{areaCustomers}/100</span>
                  </div>
                  <Progress value={(areaCustomers / 100) * 100} className="h-2 bg-[#1e3a5f]/10 [&>div]:bg-gradient-to-r [&>div]:from-[#2d5a8e] [&>div]:to-sky-400" />
                </div>
              </div>

              {/* Dynamic CTA Buttons */}
              <div className="space-y-3">
                {!hasProvidersInArea && (
                  <>
                    <Button onClick={() => { closePopup(false); navigate('register', { role: 'PROVIDER' }); }} className="w-full bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] text-white hover:from-[#1e3a5f] hover:to-[#2d5a8e]">
                      <UserPlus className="mr-2 size-4" /> Become Provider
                    </Button>
                    <Button onClick={() => { closePopup(false); openWhatsAppReferral(); }} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-white hover:from-emerald-700 hover:to-emerald-500">
                      <MessageCircle className="mr-2 size-4" /> Refer Provider via WhatsApp
                    </Button>
                    <Button onClick={() => { closePopup(false); navigate('register', { role: 'AREA_MANAGER' }); }} className="w-full bg-gradient-to-r from-[#1e3a5f] to-sky-500 text-white hover:from-[#1e3a5f] hover:to-sky-600">
                      <Briefcase className="mr-2 size-4" /> Become Area Manager
                    </Button>
                  </>
                )}
                {hasLimitedServices && (
                  <>
                    <Button onClick={() => { closePopup(false); openWhatsAppReferral(); }} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-white hover:from-emerald-700 hover:to-emerald-500">
                      <MessageCircle className="mr-2 size-4" /> Refer Provider via WhatsApp
                    </Button>
                    <Button onClick={() => { closePopup(false); navigate('register', { role: 'AREA_MANAGER' }); }} className="w-full bg-gradient-to-r from-[#1e3a5f] to-sky-500 text-white hover:from-[#1e3a5f] hover:to-sky-600">
                      <Briefcase className="mr-2 size-4" /> Join Our Team
                    </Button>
                  </>
                )}
                {hasProvidersInArea && !hasLimitedServices && (
                  <Button onClick={() => { closePopup(false); navigate('categories'); }} className="w-full bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] text-white hover:from-[#1e3a5f] hover:to-[#2d5a8e]">
                    <CalendarCheck className="mr-2 size-4" /> Book a Service Now
                  </Button>
                )}
              </div>

              {/* Don't show again */}
              <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-[#1e3a5f]/20 text-[#1e3a5f] focus:ring-[#2d5a8e]/20"
                />
                Don&apos;t show this again
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

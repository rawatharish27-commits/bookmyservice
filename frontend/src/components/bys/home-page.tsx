import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp, type Page } from '@/contexts/app-context';
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
  AlertTriangle,
  Smartphone,
  QrCode,
  BadgePercent,
  Wallet,
  Gift,
  Share2,
  UsersRound,
  Building2,
  CircleDollarSign,
  BadgeCheck,
  Activity,
  RefreshCw,
  Headphones,
  IndianRupee,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/lib/api-url';
import { useGeolocation } from '@/hooks/use-geolocation';
import { COMPANY_INFO } from '@/config/company';
import { ROLE_DASHBOARD_MAP } from '@/routes/access-control';
import { AiRecommendationsSection } from '@/components/bys/ai-recommendations-section';

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
  provider?: { id: string; name: string; profileImageUrl?: string };
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

// ─── Palwal Areas ──────────────────────────────────────────────────────────────

const PALWAL_AREAS = ['HUDA Sector', 'Camp Colony', 'Railway Road', 'Minar Gate', 'Old City', 'Industrial Area', 'Model Town', 'Subhash Colony'];

// ─── Live Activity Data ────────────────────────────────────────────────────────

const LIVE_ACTIVITY_DATA = [
  { name: 'Rahul S.', action: 'RO service booked in Railway Road', time: '2 min ago' },
  { name: 'Priya M.', action: 'AC repair completed in HUDA Sector', time: '5 min ago' },
  { name: 'Amit K.', action: 'Electrician booked in Camp Colony', time: '8 min ago' },
  { name: 'Sunita D.', action: 'Water tank cleaning in Model Town', time: '12 min ago' },
  { name: 'Vikram P.', action: 'Washing machine repair in Minar Gate', time: '15 min ago' },
  { name: 'Neha R.', action: 'Plumber booked in Subhash Colony', time: '18 min ago' },
  { name: 'Rajesh T.', action: 'TV repair completed in Old City', time: '22 min ago' },
  { name: 'Anita G.', action: 'Geyser installed in Industrial Area', time: '25 min ago' },
];

// ─── Testimonial Data ─────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  quote: string;
  avatar: string;
  service: string;
}

// No hardcoded testimonials — section is hidden when no real data

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
    let rafId: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        ref.current = end;
      }
    }
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, loading]);

  if (loading) return <span className={`inline-block h-7 w-16 animate-pulse rounded-md bg-[#132D5E]/20 ${className}`} />;
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
        className="inline-block bg-gradient-to-r from-[#FFD54F] via-[#FFD54F]/20 to-[#F2C94C] bg-clip-text text-transparent"
        style={{ textShadow: '0 0 40px rgba(10,31,68,0.5), 0 0 80px rgba(255,213,79,0.25)' }}
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,220,0.8) 40%, rgba(255,245,210,0.7) 70%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(10,31,68,0.12)',
          }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-[#132D5E]/10 to-[#E0B84C]/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-gradient-to-br from-slate-200/15 to-[#132D5E]/5 blur-2xl" />
          <div className="relative">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#132D5E]/10 to-[#FFD54F]/10">
              <Quote className="size-7 text-[#132D5E]/60" />
            </div>
            <p className="mb-7 text-lg leading-relaxed text-foreground/85 sm:text-xl">&ldquo;{t.quote}&rdquo;</p>
            <div className="mb-5 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-5 ${i < t.rating ? 'fill-[#FFD54F] text-[#FFD54F] drop-shadow-[0_0_6px_rgba(255,213,79,0.4)]' : 'fill-gray-200 text-gray-200'}`} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0A1F44] to-[#132D5E] text-base font-bold text-white shadow-lg shadow-[#0A1F44]/30 ring-2 ring-white/50">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
              <Badge className="ml-2 border-[#132D5E]/20 bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5 px-3 py-1 text-[#132D5E]" variant="outline">
                {t.service}
              </Badge>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-5">
        <button onClick={prev} className="group flex size-11 items-center justify-center rounded-full border border-[#132D5E]/20 bg-white text-[#132D5E] shadow-sm transition-all duration-300 hover:bg-[#0A1F44]/5 hover:shadow-md hover:scale-110" aria-label="Previous testimonial">
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="flex gap-2.5">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => { setCurrent(idx); setAutoPlay(false); }} className={`h-3 rounded-full transition-all duration-400 ${idx === current ? 'w-10 bg-gradient-to-r from-[#0A1F44] to-[#FFD54F] shadow-md shadow-[#132D5E]/30' : 'w-3 bg-[#132D5E]/20 hover:bg-[#132D5E]/30 hover:scale-125'}`} aria-label={`Go to testimonial ${idx + 1}`} />
          ))}
        </div>
        <button onClick={next} className="group flex size-11 items-center justify-center rounded-full border border-[#132D5E]/20 bg-white text-[#132D5E] shadow-sm transition-all duration-300 hover:bg-[#0A1F44]/5 hover:shadow-md hover:scale-110" aria-label="Next testimonial">
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Floating WhatsApp Button ─────────────────────────────────────────────────

function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href="https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20a%20home%20service"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      aria-label="Chat on WhatsApp"
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0A1F44] shadow-lg ring-1 ring-[#132D5E]/10"
          >
            Need urgent help?
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div
        className="flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl shadow-[#25D366]/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 4px 15px rgba(37,211,102,0.3)', '0 4px 25px rgba(37,211,102,0.5)', '0 4px 15px rgba(37,211,102,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MessageCircle className="size-7 text-white fill-white" />
      </motion.div>
    </a>
  );
}

// ─── Live Activity Popup ──────────────────────────────────────────────────────

function LiveActivityPopup() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Initial delay of 8 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
      // Auto-hide after 4 seconds
      setTimeout(() => setVisible(false), 4000);
    }, 8000);

    // Then show every 18 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_ACTIVITY_DATA.length);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const activity = LIVE_ACTIVITY_DATA[currentIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="fixed bottom-6 left-6 z-50 max-w-xs rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-[#132D5E]/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
              <Activity className="size-5 text-[#0A1F44]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0A1F44]">{activity.name}</p>
              <p className="truncate text-xs text-muted-foreground">{activity.action}</p>
              <p className="text-[10px] text-[#FFD54F] font-medium mt-0.5">{activity.time}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HomePage() {
  const { navigate } = useApp();
  const { user } = useAuth();

  // Data fetching
  const { data: categoriesData, loading: categoriesLoading } = useApi<{ categories: Category[]; total: number }>('/api/categories');
  const { data: servicesData, loading: servicesLoading } = useApi<{ services: ServiceItem[]; pagination: { total: number } }>('/api/services?limit=6');
  const { data: testimonialsData } = useApi<{ testimonials: Testimonial[] }>('/api/testimonials?limit=5');

  const categories = categoriesData?.categories || [];
  const services = servicesData?.services || [];
  const testimonials = testimonialsData?.testimonials || [];

  // Location from useGeolocation hook
  const geo = useGeolocation();

  // Location state
  const geoAvailable = typeof window !== 'undefined' && !!navigator.geolocation;
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(geoAvailable);
  const [locationError, setLocationError] = useState(!geoAvailable);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // City-based service availability
  const [cityServiceSlugs, setCityServiceSlugs] = useState<Set<string>>(new Set());

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

  // Service availability - check if providers exist in user's area (20KM radius)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const hasProvidersInArea = areaProviders > 0;
  const hasLimitedServices = areaProviders > 0 && areaProviders < 10;

  // Check if a provider is within 20KM radius
  const isProviderInRadius = useCallback((providerLat?: number, providerLng?: number): boolean => {
    if (!location?.lat || !location?.lng || !providerLat || !providerLng) return true; // Show if no location data
    const distance = calculateDistance(location.lat, location.lng, providerLat, providerLng);
    return distance <= 20;
  }, [location?.lat, location?.lng, calculateDistance]);

  // ─── Auto Location Detection (using useGeolocation hook) ──────────────────

  useEffect(() => {
    if (geo.loading) return;

    const applyLocation = () => {
      if (geo.error || !geo.latitude || !geo.longitude) {
        setLocationLoading(false);
        setLocationError(true);
        return;
      }

      const lat = geo.latitude;
      const lng = geo.longitude;

      // If the hook already resolved the city, use it directly
      if (geo.city) {
        setLocation({
          city: geo.city,
          state: '',
          pincode: '',
          lat,
          lng,
        });
        setLocationLoading(false);
        setLocationError(false);
        return;
      }

      // Fallback: reverse geocode if hook didn't resolve city
      (async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
            {
              headers: { 'User-Agent': 'BookYourService/1.0 (https://bookyourservice.co.in)' }
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setLocation({
              city: addr.city || addr.town || addr.village || addr.county || 'Unknown',
              state: addr.state || '',
              pincode: addr.postcode || '',
              lat,
              lng,
            });
          } else {
            setLocation({ city: 'Your Area', state: '', pincode: '', lat, lng });
          }
        } catch {
          setLocation({ city: 'Your Area', state: '', pincode: '', lat, lng });
        }
        setLocationLoading(false);
        setLocationError(false);
      })();
    };

    queueMicrotask(applyLocation);
  }, [geo.loading, geo.error, geo.latitude, geo.longitude, geo.city]);

  // ─── Fetch services available in detected city ──────────────────────────

  useEffect(() => {
    if (!location?.city) return;
    let cancelled = false;

    async function fetchCityServices() {
      try {
        const res = await fetch(apiUrl(`/api/services?city=${encodeURIComponent(location!.city)}&limit=100`));
        if (res.ok && !cancelled) {
          const data = await res.json();
          const slugs = new Set<string>();
          if (data.services && Array.isArray(data.services)) {
            data.services.forEach((s: ServiceItem) => {
              if (s.category?.slug) slugs.add(s.category.slug);
            });
          }
          setCityServiceSlugs(slugs);
        }
      } catch {
        // Will fall back to global availability check
      }
    }
    fetchCityServices();
    return () => { cancelled = true; };
  }, [location?.city]);

  // ─── Fetch area activation data ────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchAreaData() {
      try {
        const res = await fetch(apiUrl('/api/stats/platform'));
        if (res.ok && !cancelled) {
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
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ─── Popup Funnel Logic ────────────────────────────────────────────────────

  useEffect(() => {
    // Don't show popup for logged-in users (N64)
    if (user) return;

    // Check session-level dismiss (clears when browser tab closes)
    const sessionDismissed = sessionStorage.getItem('bys_popup_dismissed_session');
    // Check permanent dismiss (persists across sessions only if user explicitly chose "Don't show again")
    const permanentDismiss = localStorage.getItem('bys_popup_dismissed_permanent');
    const referred = sessionStorage.getItem('bys_referred');

    if (!sessionDismissed && !permanentDismiss && !referred) {
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const closePopup = (permanent: boolean) => {
    setShowPopup(false);
    // Always mark as dismissed for this session (tab)
    sessionStorage.setItem('bys_popup_dismissed_session', 'true');
    // If user checked "Don't show again" or permanent dismiss, store permanently
    if (permanent || dontShowAgain) {
      localStorage.setItem('bys_popup_dismissed_permanent', 'true');
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
    const referralCode = user?.referralCode;
    if (!referralCode) {
      navigate('login');
      return;
    }
    const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
    const message = encodeURIComponent(
      `Join BookYourService — India's trusted home service platform!\n\nReferral Code: ${referralCode}\n${referralUrl}\n\nBookYourService is now launching in your area! If you provide AC repair, electrical, or plumbing services, join now and start getting customers. 🛠️🏠`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    sessionStorage.setItem('bys_referred', 'true');
  };

  const openWhatsAppProviderReferral = () => {
    const referralCode = user?.referralCode;
    if (!referralCode) {
      navigate('login');
      return;
    }
    const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
    const message = encodeURIComponent(
      `Great opportunity on BookYourService!\n\nReferral Code: ${referralCode}\n${referralUrl}\n\nIf you know any service providers (AC repair, plumber, electrician), refer them and earn a 5% referral commission on every booking. 🤝`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    sessionStorage.setItem('bys_referred', 'true');
  };

  // ─── Pincode Lookup ────────────────────────────────────────────────────────

  const handlePincodeLookup = async () => {
    if (!pincodeInput || pincodeInput.length < 5) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${pincodeInput}+India&addressdetails=1&limit=1`,
        {
          headers: { 'User-Agent': 'BookYourService/1.0 (https://bookyourservice.co.in)' }
        }
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
    } finally {
      setPincodeLoading(false);
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
    // If location was not detected (or user declined), show all categories normally
    if (locationError || locationLoading) return true;

    // If we have city-specific data, use it
    if (cityServiceSlugs.size > 0) {
      return cityServiceSlugs.has(slug);
    }

    // Fallback: check global API categories
    const apiCategory = categories.find((c) => c.slug === slug);
    if (apiCategory) return (apiCategory.servicesCount || 0) > 0;
    return false;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* ═══════════ 1. Announcement Bar (Navy Blue) ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <motion.div className="absolute left-[8%] top-1/2 -translate-y-1/2 size-24 rounded-full bg-[#FFD54F]/5" animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute right-[12%] top-1/2 -translate-y-1/2 size-16 rounded-full bg-[#FFD54F]/5" animate={{ scale: [1.3, 1, 1.3], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center gap-3">
              <Sparkles className="size-5 text-[#FFD54F]" />
              <p className="text-sm font-medium text-white/80">
                <span className="font-bold text-white">First 100 Clients</span> — Get FREE Subscription for 1 Year!
              </p>
            </motion.div>
            <div className="hidden h-4 w-px bg-white/20 sm:block" />
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#FFD54F]" />
              <p className="text-sm font-medium text-white/80">
                <span className="font-bold text-white">First 50 Providers</span> — Get FREE Subscription for 1 Year!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 1a. Emergency Sticky Banner ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 w-full overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #8B0000 0%, #A00000 50%, #8B0000 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <motion.p
            className="text-center text-sm font-bold text-white sm:text-base"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            🚨 Emergency Appliance &amp; Home Service Available — Service Within 2 Hours 🚨
          </motion.p>
        </div>
      </motion.div>

      {/* ═══════════ 1b. Live Trust Counter ═══════════ */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: '1500+', label: 'Happy Customers', icon: <Users className="size-6 text-[#0A1F44]" /> },
              { value: '250+', label: 'Verified Technicians', icon: <BadgeCheck className="size-6 text-[#0A1F44]" /> },
              { value: '5000+', label: 'Services Completed', icon: <CheckCircle2 className="size-6 text-[#0A1F44]" /> },
              { value: 'Palwal', label: 'Available Across', icon: <MapPin className="size-6 text-[#0A1F44]" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center rounded-2xl p-5 text-center shadow-lg ring-1 ring-[#132D5E]/10"
                style={{ background: 'linear-gradient(135deg, #FFD54F 0%, #F2C94C 100%)' }}
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0A1F44]/10">
                  {stat.icon}
                </div>
                <p className="text-2xl font-extrabold text-[#0A1F44]">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-[#0A1F44]/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 1c. Customer Problems Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#8B0000]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#8B0000]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#8B0000]/30 bg-[#8B0000]/20 px-4 py-1.5 text-[#FFD54F]">Common Issues</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">FACING THESE PROBLEMS?</h2>
            <p className="mt-3 text-white/70">We solve these everyday home service headaches</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Wind className="size-6" />, title: 'AC Not Cooling', desc: 'AC running but not cooling? Gas leak or compressor issue?' },
              { icon: <Droplets className="size-6" />, title: 'RO Leaking', desc: 'Water purifier leaking or giving bad taste? Filter needs change?' },
              { icon: <Shirt className="size-6" />, title: 'Washing Machine Stopped', desc: 'Machine not spinning or draining? Drum or motor problem?' },
              { icon: <Zap className="size-6" />, title: 'Electrician Not Available', desc: 'No electrician when you need one urgently? Switch or wiring issue?' },
              { icon: <Wrench className="size-6" />, title: 'Emergency Plumbing', desc: 'Pipe burst or tap leaking? Need immediate plumbing help?' },
              { icon: <Tv className="size-6" />, title: 'TV Display Problems', desc: 'No display, lines on screen, or no sound? TV needs repair?' },
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-2xl bg-white/5 p-5 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#8B0000]/20 text-[#FFD54F] group-hover:bg-[#8B0000]/30 transition-colors">
                  {problem.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{problem.title}</h3>
                <p className="mt-1 text-sm text-white/60">{problem.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 2. Hero Section (Navy Blue Gradient) ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 50%, #0A1F44 100%)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 size-[800px] rounded-full bg-gradient-to-br from-[#FFD54F]/30 to-[#E0B84C]/15 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[700px] rounded-full bg-gradient-to-tl from-[#132D5E]/25 to-slate-400/10 blur-3xl" />
          <motion.div className="absolute -left-20 -top-20 size-96 rounded-full bg-[#FFD54F]/[0.06]" animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-10 right-10 size-72 rounded-full bg-[#FFD54F]/[0.06]" animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          {Array.from({ length: 5 }).map((_, i) => {
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
                <Badge className="mb-6 border-[#FFD54F]/20 bg-[#132D5E]/50 px-5 py-2 text-white/80 hover:bg-[#132D5E]/60 text-sm">
                  <Sparkles className="mr-2 size-4" /> India&apos;s Trusted Home Service Platform
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Expert{' '}
                <RotatingText words={['Air Conditioner', 'Plumber', 'Electrician', 'Water Purifier']} />
                <br />
                <span className="bg-gradient-to-r from-[#FFD54F] via-[#FFD54F]/20 to-[#F2C94C] bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(10,31,68,0.5)' }}>at Your Doorstep</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Book verified professionals for AC repair, plumbing, electrical, appliance repair, and more.
                Quality work, transparent pricing, and our satisfaction guarantee.
              </motion.p>

              {/* Location Detection Display */}
              <motion.div variants={fadeUp} custom={3} className="mt-5 flex items-center gap-2.5">
                <Navigation className="size-4 text-[#FFD54F]" />
                {locationLoading ? (
                  <span className="text-sm text-white/70">📍 Detecting your location...</span>
                ) : location ? (
                  <span className="text-sm text-white/70">📍 {location.city}{location.state ? `, ${location.state}` : ''}</span>
                ) : (
                  <span className="text-sm text-white/80">📍 Location unavailable</span>
                )}
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#FFD54F]/60" />
                  <span className="relative inline-flex size-3 rounded-full bg-[#FFD54F] shadow-md shadow-[#FFD54F]/50" />
                </span>
                <span className="text-sm font-medium text-white/70">
                  <AnimatedCounter value={liveStats?.activeVisitors || 0} loading={!liveStats} className="font-bold" /> viewing
                </span>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button size="lg" onClick={() => navigate('categories')} className="group h-13 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] px-10 text-base font-bold text-[#0A1F44] shadow-xl shadow-[#FFD54F]/30 hover:from-[#E0B84C] hover:to-[#FFD54F] hover:shadow-2xl hover:shadow-[#FFD54F]/40">
                  Book a Service <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {!user && (
                  <>
                    <Button size="lg" onClick={() => navigate('login')} className="h-13 border-2 border-[#FFD54F]/40 bg-[#0A1F44]/80 px-8 text-base text-[#FFD54F] shadow-lg backdrop-blur-sm hover:border-[#FFD54F]/60 hover:bg-[#0A1F44]">
                      Client Login
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('register')} className="h-13 border-[#FFD54F]/40 text-base text-[#FFD54F] hover:bg-[#0A1F44]/15 hover:border-[#FFD54F]/60">
                      Join as Provider
                    </Button>
                  </>
                )}
                {user && (() => {
                  const dashboard = ROLE_DASHBOARD_MAP[user.roleId ?? 0];
                  return dashboard ? (
                    <Button size="lg" onClick={() => navigate(dashboard as Page)} className="h-13 border-2 border-[#FFD54F]/40 bg-[#0A1F44]/80 px-8 text-base text-[#FFD54F] shadow-lg backdrop-blur-sm hover:border-[#FFD54F]/60 hover:bg-[#0A1F44]">
                      Go to Dashboard
                    </Button>
                  ) : null;
                })()}
              </motion.div>
            </motion.div>

            {/* Hero Visual - Floating Icons */}
            <motion.div className="hidden lg:flex lg:items-center lg:justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="relative flex size-[400px] items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD54F]/15 to-[#E0B84C]/8 blur-3xl" />
                <motion.div className="absolute inset-4 rounded-full border border-white/[0.08]" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} />
                <div className="absolute inset-12 rounded-full border border-white/[0.05]" />

                {/* Floating service icons */}
                <motion.div className="absolute -left-4 top-4" animate={{ y: [0, -20, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#132D5E]/40 to-[#FFD54F]/20 shadow-2xl shadow-[#132D5E]/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wind className="size-10 text-[#FFD54F]/70 drop-shadow-[0_0_12px_rgba(255,213,79,0.4)]" />
                  </div>
                </motion.div>
                <motion.div className="absolute right-0 top-16" animate={{ y: [0, 18, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-500/30 to-[#FFD54F]/15 shadow-2xl shadow-slate-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wrench className="size-10 text-slate-200 drop-shadow-[0_0_12px_rgba(242,201,76,0.4)]" />
                  </div>
                </motion.div>
                <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2" animate={{ y: [0, -15, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#E0B84C]/20 to-[#132D5E]/15 shadow-2xl shadow-[#E0B84C]/20 backdrop-blur-xl ring-1 ring-white/20">
                    <Zap className="size-10 text-[#FFD54F]/70 drop-shadow-[0_0_12px_rgba(255,213,79,0.4)]" />
                  </div>
                </motion.div>

                <div className="rounded-3xl bg-white/10 px-8 py-5 text-center shadow-2xl backdrop-blur-xl ring-1 ring-white/20">
                  <Home className="mx-auto mb-2 size-7 text-white/50" />
                  <p className="text-xl font-bold text-white">Your Home</p>
                  <p className="text-sm font-medium text-white/70">Our Expertise</p>
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
            className="flex flex-col items-center gap-4 rounded-2xl border border-[#132D5E]/10 bg-gradient-to-r from-[#0A1F44]/5 via-white to-[#FFD54F]/5 p-4 shadow-sm sm:flex-row sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#0A1F44] text-[#FFD54F] shadow-md">
                <MapPin className="size-5" />
              </div>
              <div>
                {locationLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-[#132D5E]/10" />
                    <span className="text-xs text-muted-foreground">Detecting...</span>
                  </div>
                ) : location ? (
                  <>
                    <p className="text-sm font-semibold text-[#0A1F44]">
                      📍 {location.city}{location.state ? `, ${location.state}` : ''} {location.pincode ? `— ${location.pincode}` : ''}
                    </p>
                    <p className="text-xs text-[#FFD54F] font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Serving in your area
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#0A1F44]">📍 Location not detected</p>
                    <p className="text-xs text-[#FFD54F] font-medium">Enter your pincode below</p>
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
                className="h-9 w-36 border-[#132D5E]/20 text-sm focus-visible:border-[#FFD54F] focus-visible:ring-[#FFD54F]/20"
              />
              <Button onClick={handlePincodeLookup} size="sm" disabled={pincodeLoading} className="bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]">
                {pincodeLoading ? 'Checking...' : 'Check'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 4. Service Categories — HORIZONTAL SCROLL ═══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Our Service Categories</h2>
            <p className="mt-3 text-lg text-muted-foreground">Professional home services at your doorstep</p>
            {/* Location indicator */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <MapPin className="size-4 text-[#132D5E]" />
              {locationLoading ? (
                <span className="text-sm text-muted-foreground">📍 Detecting your location...</span>
              ) : location ? (
                <span className="text-sm font-medium text-[#0A1F44]">📍 Services in {location.city}{location.state ? `, ${location.state}` : ''}</span>
              ) : (
                <span className="text-sm text-muted-foreground">📍 Location unavailable — showing all services</span>
              )}
            </div>
          </motion.div>

          {/* Scroll Controls + Container */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-[#132D5E]/20 bg-white text-[#132D5E] shadow-lg transition-all hover:bg-[#0A1F44] hover:text-white hover:shadow-xl hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-[#132D5E]/20 bg-white text-[#132D5E] shadow-lg transition-all hover:bg-[#0A1F44] hover:text-white hover:shadow-xl hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollRef}
              className="scrollbar-thin flex gap-5 overflow-x-auto px-8 py-2 scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD54F transparent' }}
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
                        onClick={() => {
                          if (!isAvailable) return;
                          // Step 5: Auth check before booking flow
                          const currentUser = localStorage.getItem('bys_user');
                          if (!currentUser && !user) {
                            navigate('login');
                            return;
                          }
                          navigate('category-detail', { categoryId: service.slug });
                        }}
                        className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isAvailable ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ height: '280px' }}
                      >
                        {/* Fallback gradient background (always visible, serves as base) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#132D5E] via-[#0A1F44] to-[#0A1F44]" />

                        {/* Service Image (on top of fallback) */}
                        <img
                          src={service.image}
                          alt={service.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0';
                          }}
                        />

                        {/* Bottom gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A1F44]/90" />

                        {/* Icon overlay */}
                        <div className="absolute top-4 left-4 z-10 flex size-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20 shadow-lg">
                          {CATEGORY_ICON_MAP[service.icon] || <Wrench className="size-7" />}
                        </div>

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                          <h3 className="text-base font-bold text-white drop-shadow-md">{service.name}</h3>
                          <p className="mt-1 text-xs text-white/80 leading-relaxed">{service.description}</p>
                          {isAvailable && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-[#FFD54F] font-medium">
                              <span>View Services</span>
                              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </div>

                        {/* Coming Soon Overlay */}
                        {!isAvailable && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A1F44]/60 backdrop-blur-[2px]">
                            <Badge className="bg-[#132D5E]/80 text-white/50 border-[#FFD54F]/30 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
                              Coming Soon
                            </Badge>
                            <p className="mt-2 text-xs text-white/80">In Your Area</p>
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

      {/* ═══════════ 4b. AI Recommendations Section ═══════════ */}
      <AiRecommendationsSection />

      {/* ═══════════ 4c. Before/After Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #0D2A52 50%, #0A1F44 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 size-60 rounded-full bg-[#FFD54F]/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-60 rounded-full bg-[#E0B84C]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#FFD54F]/20 bg-[#132D5E]/50 px-4 py-1.5 text-[#FFD54F]">Real Results</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">See the Difference</h2>
            <p className="mt-3 text-white/70">Before and after our professional service</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'AC Cleaning', before: 'Dusty coils, poor airflow, high bills', after: 'Deep cleaned, 40% better cooling, lower bills', icon: <Wind className="size-6" /> },
              { title: 'Tank Cleaning', before: 'Dirty water, sediment buildup, health risk', after: 'Crystal clean water, sanitized tank, safe for family', icon: <Droplet className="size-6" /> },
              { title: 'Appliance Repair', before: 'Broken appliance, costly replacement', after: 'Expertly repaired, working like new, warranty covered', icon: <Wrench className="size-6" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10"
              >
                <div className="flex size-14 items-center justify-center rounded-b-2xl rounded-t-2xl bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44]">
                  {item.icon}
                </div>
                <div className="p-5">
                  <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                  <div className="mb-3 rounded-xl bg-[#8B0000]/15 p-3">
                    <p className="text-xs font-semibold text-[#FF6B6B]">❌ Before</p>
                    <p className="mt-1 text-sm text-white/70">{item.before}</p>
                  </div>
                  <div className="rounded-xl bg-[#25D366]/10 p-3">
                    <p className="text-xs font-semibold text-[#25D366]">✅ After</p>
                    <p className="mt-1 text-sm text-white/70">{item.after}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4d. Why Trust Us Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #FFD54F 0%, #F2C94C 50%, #E0B84C 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#0A1F44]/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#0A1F44]/3 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#0A1F44]/20 bg-[#0A1F44]/10 px-4 py-1.5 text-[#0A1F44]">Our Promise</Badge>
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Why Trust Us?</h2>
            <p className="mt-3 text-[#0A1F44]/70">6 reasons why Palwal trusts BookYourService</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <BadgeCheck className="size-6 text-[#FFD54F]" />, title: 'Verified Local Experts', desc: 'All technicians are background-verified and skill-tested' },
              { icon: <IndianRupee className="size-6 text-[#FFD54F]" />, title: 'Affordable Fixed Pricing', desc: 'No hidden charges. See exact prices before booking' },
              { icon: <Clock className="size-6 text-[#FFD54F]" />, title: 'Service Within 2 Hours', desc: 'Quick response for emergency and regular bookings' },
              { icon: <ShieldCheck className="size-6 text-[#FFD54F]" />, title: '3 Months Warranty', desc: 'Every service comes with a 3-month quality guarantee' },
              { icon: <Headphones className="size-6 text-[#FFD54F]" />, title: 'Local Support Team', desc: 'Dedicated Palwal-based support for your queries' },
              { icon: <RefreshCw className="size-6 text-[#FFD54F]" />, title: 'Warranty Protection', desc: 'Free re-service if issue recurs within warranty period' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-2xl bg-white/80 p-5 shadow-md ring-1 ring-[#0A1F44]/5 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#0A1F44] shadow-md">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#0A1F44]/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4e. Warranty Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #0D2A52 50%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#FFD54F]/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl bg-white/5 p-10 text-center backdrop-blur-sm ring-1 ring-white/10 shadow-2xl sm:p-14"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-xl shadow-[#FFD54F]/20"
            >
              <ShieldCheck className="size-10 text-[#0A1F44]" />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">3 Months Service Warranty</h2>
            <p className="mt-4 text-lg text-white/70">Every service comes with a guaranteed warranty. If the same issue recurs, we fix it for free.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {[
                { label: 'Quality Guarantee', icon: <CheckCircle2 className="size-4" /> },
                { label: 'Free Re-Service', icon: <RefreshCw className="size-4" /> },
                { label: 'No Extra Cost', icon: <IndianRupee className="size-4" /> },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFD54F]/20 to-[#E0B84C]/20 px-5 py-2 ring-1 ring-[#FFD54F]/20">
                  <span className="text-[#FFD54F]">{badge.icon}</span>
                  <span className="text-sm font-semibold text-[#FFD54F]">{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 4f. Fast Response Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 top-1/4 size-60 rounded-full bg-[#FFD54F]/8 blur-3xl" />
          <div className="absolute -left-20 bottom-1/4 size-60 rounded-full bg-[#E0B84C]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#FFD54F]/20 bg-[#132D5E]/50 px-4 py-1.5 text-[#FFD54F]">⚡ Fast Response</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Lightning-Fast Booking</h2>
            <p className="mt-3 text-white/70">From booking to service — faster than you expect</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: 'Technician Assigned Quickly', desc: 'Get a verified technician assigned within minutes of booking', icon: <UsersRound className="size-6 text-[#FFD54F]" /> },
              { step: '02', title: 'Fast Booking Confirmation', desc: 'Instant confirmation with all service details on your phone', icon: <BadgeCheck className="size-6 text-[#FFD54F]" /> },
              { step: '03', title: 'Real-Time Booking Updates', desc: 'Track your technician arrival in real-time, no waiting around', icon: <Activity className="size-6 text-[#FFD54F]" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10"
              >
                <div className="absolute -right-4 -top-4 text-6xl font-extrabold text-[#FFD54F]/5">{item.step}</div>
                <div className="relative">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-[#0A1F44]/50 ring-1 ring-[#FFD54F]/20">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4g. Limited Offers Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #FFD54F 0%, #F2C94C 50%, #E0B84C 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#0A1F44]/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#0A1F44]/3 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#0A1F44]/20 bg-[#0A1F44]/10 px-4 py-1.5 text-[#0A1F44]">🔥 Limited Time</Badge>
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Exclusive Offers</h2>
            <p className="mt-3 text-[#0A1F44]/70">Grab these deals before they expire</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { badge: 'SUMMER DEAL', badgeColor: 'bg-[#8B0000] text-white', title: 'Summer AC Service Offer', desc: 'Get AC deep clean + gas check at flat ₹499', icon: <Wind className="size-6 text-[#0A1F44]" /> },
              { badge: 'FREE', badgeColor: 'bg-[#25D366] text-white', title: 'Free RO Inspection', desc: 'Book any service & get a free RO health checkup', icon: <Gift className="size-6 text-[#0A1F44]" /> },
              { badge: 'REWARD', badgeColor: 'bg-[#0A1F44] text-[#FFD54F]', title: 'First Booking Wallet Reward', desc: 'Get ₹100 in your wallet on your first booking', icon: <Wallet className="size-6 text-[#0A1F44]" /> },
            ].map((offer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="group overflow-hidden rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-[#0A1F44]/5 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#0A1F44]/5">
                    {offer.icon}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${offer.badgeColor}`}>
                    {offer.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44]">{offer.title}</h3>
                <p className="mt-2 text-sm text-[#0A1F44]/60">{offer.desc}</p>
                <Button onClick={() => navigate('categories')} className="mt-4 w-full bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]">
                  Claim Now <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4h. Local Palwal Feel ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 size-60 rounded-full bg-[#FFD54F]/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-60 rounded-full bg-[#E0B84C]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#FFD54F]/20 bg-[#132D5E]/50 px-4 py-1.5 text-[#FFD54F]">📍 Palwal Local</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Serving Every Corner of Palwal</h2>
            <p className="mt-3 text-white/70">From HUDA Sector to Old City — we cover it all</p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PALWAL_AREAS.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 ring-1 ring-[#FFD54F]/20 backdrop-blur-sm cursor-default hover:bg-[#FFD54F]/10 transition-colors"
              >
                <MapPin className="size-4 text-[#FFD54F]" />
                <span className="text-sm font-semibold text-white">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4i. Provider Growth Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #0D2A52 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#FFD54F]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#E0B84C]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#FFD54F]/20 bg-[#132D5E]/50 px-4 py-1.5 text-[#FFD54F]">🚀 For Providers</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Grow Your Business</h2>
            <p className="mt-3 text-white/70">Join BookYourService and watch your business scale</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '20+', label: 'Extra clients monthly', icon: <UsersRound className="size-6 text-[#FFD54F]" /> },
              { value: '100%', label: 'Online visibility', icon: <Eye className="size-6 text-[#FFD54F]" /> },
              { value: '∞', label: 'Repeat customers', icon: <RefreshCw className="size-6 text-[#FFD54F]" /> },
              { value: '24/7', label: 'Booking management', icon: <Clock className="size-6 text-[#FFD54F]" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center rounded-2xl bg-white/5 p-6 text-center backdrop-blur-sm ring-1 ring-white/10"
              >
                <div className="mb-3 flex size-14 items-center justify-center rounded-xl bg-[#0A1F44]/50 ring-1 ring-[#FFD54F]/20">
                  {stat.icon}
                </div>
                <p className="text-3xl font-extrabold text-[#FFD54F]">{stat.value}</p>
                <p className="mt-1 text-sm text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-8 text-center">
            <Button onClick={() => navigate('register')} size="lg" className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] px-10 text-[#0A1F44] font-bold shadow-xl shadow-[#FFD54F]/30 hover:from-[#E0B84C] hover:to-[#FFD54F]">
              Join as Provider <ArrowRight className="ml-2 size-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 5. Area Activation Meter ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#FFD54F]/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#E0B84C]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/20 to-[#E0B84C]/20 ring-1 ring-white/10">
              <Rocket className="size-8 text-[#FFD54F]" />
            </div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              🚀 {location?.city || 'Your City'} Area Launch Progress
            </h2>
            <p className="mt-2 text-white/80">Help us launch faster — join as a provider or refer one!</p>
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
                  <Shield className="size-4 text-[#FFD54F]" /> Providers Joined
                </span>
                <span className="text-sm font-bold text-[#FFD54F]">
                  {areaProviders}/20 <span className="text-white/60 font-normal">({Math.round((areaProviders / 20) * 100)}%)</span>
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#132D5E] to-[#FFD54F]"
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
                  <Users className="size-4 text-[#FFD54F]" /> Customers Joined
                </span>
                <span className="text-sm font-bold text-[#FFD54F]">
                  {areaCustomers}/100 <span className="text-white/60 font-normal">({Math.round((areaCustomers / 100) * 100)}%)</span>
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#FFD54F] to-[#E0B84C]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min((areaCustomers / 100) * 100, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Milestone markers */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/60">
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
                <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Popular Services in Your Area</h2>
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
                        <Card className="group cursor-pointer overflow-hidden rounded-2xl border-[#132D5E]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#FFD54F]/20" onClick={() => navigate('service-detail', { serviceId: service.id })}>
                          <div className="relative overflow-hidden">
                            {service.images ? (
                              <img src={service.images.split(',')[0]} alt={service.title} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="aspect-video w-full bg-gradient-to-br from-[#132D5E]/20 to-[#FFD54F]/10 flex items-center justify-center">
                                <Wrench className="size-12 text-[#132D5E]/30" />
                              </div>
                            )}
                            <Badge className="absolute top-3 right-3 bg-[#0A1F44]/80 text-white/50 backdrop-blur-sm border-[#FFD54F]/30">
                              {service.category?.name || 'Category'}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-base font-bold text-[#0A1F44] line-clamp-1">{service.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="size-4 fill-[#FFD54F] text-[#FFD54F]" />
                                <span className="text-sm font-semibold text-[#0A1F44]">{service.averageRating?.toFixed(1) || '4.5'}</span>
                                <span className="text-xs text-muted-foreground">({service.totalReviews || 0})</span>
                              </div>
                              <span className="text-sm font-bold text-[#132D5E]">₹{service.basePrice}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="mx-auto size-16 text-[#132D5E]/20" />
                  <p className="mt-4 text-lg text-muted-foreground">No services listed yet in your area. Be the first provider!</p>
                </div>
              )}
            </>
          ) : (
            /* No Providers — Show Coming Soon with CTAs */
            <>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#132D5E]/10 to-[#FFD54F]/10">
                  <MapPin className="size-8 text-[#132D5E]" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Service Coming Soon In Your Area</h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  We don't have providers in your area yet. You can help us launch services faster by referring providers!
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }} className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                <Card className="group cursor-pointer border-[#132D5E]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#FFD54F]/20" onClick={() => navigate('register', { role: 'PROVIDER' })}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/20">
                      <UserPlus className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1F44]">Become Service Provider</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Join as a professional & get customers</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
                      Join Now <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer border-[#132D5E]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#FFD54F]/20" onClick={openWhatsAppReferral}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/20">
                      <MessageCircle className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1F44]">Refer Service Provider</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Know a provider? Refer via WhatsApp & earn</p>
                    <Button className="mt-4 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
                      <MessageCircle className="mr-1 size-4" /> WhatsApp Refer
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer border-[#132D5E]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#FFD54F]/20" onClick={() => navigate('join-manager')}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#0A1F44] text-[#FFD54F] shadow-lg shadow-[#0A1F44]/20">
                      <Briefcase className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1F44]">Become Area Manager</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Manage operations in your locality</p>
                    <Button className="mt-4 bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]">
                      Apply Now <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer border-[#132D5E]/10 rounded-2xl transition-all hover:shadow-xl hover:border-[#FFD54F]/20">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#0A1F44] text-[#FFD54F] shadow-lg shadow-[#0A1F44]/20">
                      <Clock className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1F44]">Join Waiting List</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get notified when services launch near you</p>
                    <Button variant="outline" className="mt-4 border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5">
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
      <section className="bg-gradient-to-b from-[#0A1F44]/5 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">How It Works</h2>
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
                  <div className="relative overflow-hidden rounded-2xl border border-[#132D5E]/10 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#FFD54F]/20 text-center">
                    <div className="absolute -right-3 -top-3 text-6xl font-black text-[#132D5E]/5">{item.step}</div>
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/20">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1F44]">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                    {idx < 3 && (
                      <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 text-[#132D5E]/20">
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
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #fefcf3 0%, #fef9e7 50%, #fdf6e3 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/20">
              <Star className="size-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">What Our Customers Say</h2>
            <p className="mt-3 text-lg text-muted-foreground">Real reviews from real customers</p>
          </motion.div>

          <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
            <div>
              <MessageCircle className="mx-auto mb-4 size-12 text-[#FFD54F]/40" />
              <p className="text-lg font-medium">No reviews yet — be the first to review!</p>
              <p className="mt-2 text-sm">Customer testimonials will appear here once reviews are submitted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 9. Career / Join Our Team Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #fefcf3 0%, #f5f0e0 50%, #fdf6e3 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/20">
              <Briefcase className="size-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Join Our Team</h2>
            <p className="mt-3 text-lg text-muted-foreground">Be part of the hyperlocal service revolution</p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {/* Area Manager Card */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <TiltCard>
                <Card className="h-full overflow-hidden rounded-2xl border-[#132D5E]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#FFD54F]/20">
                  <div className="h-2 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C]" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/20">
                      <Shield className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1F44]">Area Manager</h3>
                    <p className="mt-1 text-sm text-[#FFD54F] font-medium">Local Operations Leader</p>
                    <ul className="mt-4 space-y-2">
                      {['Local providers onboarding', 'Customer acquisition', 'Local operations management', 'Community building'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 text-[#FFD54F] flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate('register', { role: 'AREA_MANAGER' })} className="mt-6 w-full bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
                      Apply as Area Manager <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>

            {/* Local Admin Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <TiltCard>
                <Card className="h-full overflow-hidden rounded-2xl border-[#132D5E]/10 shadow-sm transition-all hover:shadow-xl hover:border-[#FFD54F]/20">
                  <div className="h-2 bg-gradient-to-r from-[#0A1F44] to-[#132D5E]" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#0A1F44] text-[#FFD54F] shadow-lg shadow-[#0A1F44]/20">
                      <ThumbsUp className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1F44]">Local Admin</h3>
                    <p className="mt-1 text-sm text-[#FFD54F] font-medium">Support & Quality Champion</p>
                    <ul className="mt-4 space-y-2">
                      {['Complaint handling & resolution', 'Provider verification & KYC', 'Local support operations', 'Quality assurance'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 text-[#FFD54F] flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate('register', { role: 'SUB_ADMIN' })} className="mt-6 w-full bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]">
                      Apply as Local Admin <ArrowRight className="ml-1 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 9a. App Download Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#FFD54F]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#E0B84C]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-[#FFD54F]/20 to-[#E0B84C]/10 blur-2xl" />
                <div className="relative flex h-[500px] w-[260px] flex-col items-center justify-center rounded-[3rem] bg-gradient-to-b from-[#132D5E] to-[#0A1F44] p-6 ring-2 ring-[#FFD54F]/20 shadow-2xl">
                  <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-[#0A1F44] ring-1 ring-white/10" />
                  <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-lg shadow-[#FFD54F]/20">
                    <Smartphone className="size-8 text-[#0A1F44]" />
                  </div>
                  <p className="text-lg font-bold text-white">BookYourService</p>
                  <p className="mt-1 text-xs text-[#FFD54F]">Book in 30 seconds</p>
                  <div className="mt-6 w-full space-y-3">
                    {['Book any service instantly', 'Track technician in real-time', 'Secure online payments'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                        <CheckCircle2 className="size-4 text-[#FFD54F] shrink-0" />
                        <span className="text-xs text-white/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-4 border-[#FFD54F]/20 bg-[#132D5E]/50 px-4 py-1.5 text-[#FFD54F]">📱 Coming Soon</Badge>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Get the BookYourService App</h2>
              <p className="mt-4 text-lg text-white/70">Book services in 30 seconds, track your technician, and pay securely — all from your phone.</p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: <Zap className="size-5 text-[#FFD54F]" />, text: 'Book any service in 30 seconds' },
                  { icon: <MapPin className="size-5 text-[#FFD54F]" />, text: 'Real-time technician tracking' },
                  { icon: <ShieldCheck className="size-5 text-[#FFD54F]" />, text: 'Secure payments & warranty tracking' },
                  { icon: <Bell className="size-5 text-[#FFD54F]" />, text: 'Instant booking updates & reminders' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFD54F]/10 ring-1 ring-[#FFD54F]/20">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-white/90">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] font-bold shadow-xl shadow-[#FFD54F]/30 hover:from-[#E0B84C] hover:to-[#FFD54F]">
                  <Smartphone className="mr-2 size-5" /> Download App
                </Button>
                <Button size="lg" variant="outline" className="border-[#FFD54F]/40 text-[#FFD54F] hover:bg-[#FFD54F]/10 hover:border-[#FFD54F]/60">
                  <QrCode className="mr-2 size-5" /> Scan QR Code
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 9b. SEO Landing Pages Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #FFD54F 0%, #F2C94C 50%, #E0B84C 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#0A1F44]/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#0A1F44]/3 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <Badge className="mb-4 border-[#0A1F44]/20 bg-[#0A1F44]/10 px-4 py-1.5 text-[#0A1F44]">📍 Service Areas</Badge>
            <h2 className="text-3xl font-extrabold text-[#0A1F44] sm:text-4xl">Find Services in Your Area</h2>
            <p className="mt-3 text-[#0A1F44]/70">Click on any service to book in your locality</p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { service: 'AC Repair', area: 'Palwal', icon: <Wind className="size-5 text-[#FFD54F]" /> },
              { service: 'RO Service', area: 'Palwal', icon: <Droplets className="size-5 text-[#FFD54F]" /> },
              { service: 'Plumber', area: 'Palwal', icon: <Wrench className="size-5 text-[#FFD54F]" /> },
              { service: 'Electrician', area: 'Palwal', icon: <Zap className="size-5 text-[#FFD54F]" /> },
              { service: 'Washing Machine', area: 'Palwal', icon: <Shirt className="size-5 text-[#FFD54F]" /> },
              { service: 'TV Repair', area: 'Palwal', icon: <Tv className="size-5 text-[#FFD54F]" /> },
              { service: 'Geyser Repair', area: 'Palwal', icon: <Flame className="size-5 text-[#FFD54F]" /> },
              { service: 'Water Tank Cleaning', area: 'Palwal', icon: <Droplet className="size-5 text-[#FFD54F]" /> },
              { service: 'Kitchen Appliances', area: 'Palwal', icon: <ChefHat className="size-5 text-[#FFD54F]" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate('categories')}
                className="group flex cursor-pointer items-center gap-3 rounded-xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-[#0A1F44]/5 hover:shadow-md hover:bg-white/90 transition-all"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#0A1F44] shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0A1F44]">{item.service} in {item.area}</p>
                  <p className="text-xs text-[#0A1F44]/50">Verified experts • Fixed pricing</p>
                </div>
                <ArrowRight className="ml-auto size-4 text-[#0A1F44]/30 group-hover:text-[#0A1F44] group-hover:translate-x-1 transition-all shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 10. Referral Section ═══════════ */}
      <section className="relative overflow-hidden py-16" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 top-0 size-80 rounded-full bg-[#FFD54F]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[#FFD54F]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl items-center gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/20 to-[#E0B84C]/20 ring-1 ring-white/10">
                <Handshake className="size-8 text-[#FFD54F]" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">Refer & Earn</h2>
              <p className="mt-4 text-lg text-white/80 leading-relaxed">
                Apne area ke service providers ko refer karein aur har booking pe 5% referral commission paayein. Jitne zyada referrals, utni zyada earning!
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] font-bold shadow-lg shadow-[#FFD54F]/20">
                  5%
                </div>
                <div>
                  <p className="font-bold text-white">Referral Commission</p>
                  <p className="text-sm text-white/80">On every booking from your referral</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={openWhatsAppProviderReferral}
                className="mt-8 bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-xl shadow-[#E0B84C]/20 hover:from-[#0A1F44] hover:to-[#FFD54F] hover:text-white hover:shadow-2xl hover:shadow-[#E0B84C]/30"
              >
                <MessageCircle className="mr-2 size-5" /> Refer via WhatsApp
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Card className="overflow-hidden rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                <div className="h-2 bg-gradient-to-r from-[#FFD54F] to-[#F2C94C]" />
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">How Referral Works</h3>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'Share WhatsApp Link', desc: 'Send referral message to providers you know' },
                      { step: '2', title: 'Provider Joins', desc: 'They register using your referral' },
                      { step: '3', title: 'Start Earning', desc: 'Get 5% commission on every booking they complete' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#132D5E] to-[#0A1F44] text-sm font-bold text-[#FFD54F]">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{item.title}</p>
                          <p className="text-xs text-white/80">{item.desc}</p>
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
        <DialogContent className="max-w-md rounded-3xl border-[#132D5E]/20 p-0 overflow-hidden" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>BookYourService Launch</DialogTitle>
            <DialogDescription>Area launch status and available actions</DialogDescription>
          </DialogHeader>
          <div className="relative">
            {/* Navy Header */}
            <div className="px-6 pt-8 pb-6" style={{ background: 'linear-gradient(135deg, #0A1F44 0%, #132D5E 100%)' }}>
              <button onClick={() => closePopup(false)} className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                <X className="size-4" />
              </button>

              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/20 to-[#E0B84C]/20 ring-1 ring-white/10 mx-auto">
                <Rocket className="size-7 text-[#FFD54F]" />
              </div>

              <h3 className="mt-4 text-center text-xl font-bold text-white">
                {!hasProvidersInArea
                  ? 'BookYourService has not launched in your area yet'
                  : hasLimitedServices
                  ? 'Only a few services are available in your area. Help us bring more providers on board.'
                  : 'Welcome to BookYourService!'
                }
              </h3>
            </div>

            <div className="px-6 pb-6 pt-4">
              {/* Area Progress Mini */}
              <div className="mb-5 rounded-2xl bg-[#0A1F44]/5 p-4">
                <p className="text-xs font-semibold text-[#0A1F44] mb-2">🚀 Area Launch Progress</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Providers</span>
                    <span className="font-bold text-[#132D5E]">{areaProviders}/20</span>
                  </div>
                  <Progress value={(areaProviders / 20) * 100} className="h-2 bg-[#132D5E]/10 [&>div]:bg-gradient-to-r [&>div]:from-[#0A1F44] [&>div]:to-[#FFD54F]" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Customers</span>
                    <span className="font-bold text-[#132D5E]">{areaCustomers}/100</span>
                  </div>
                  <Progress value={(areaCustomers / 100) * 100} className="h-2 bg-[#132D5E]/10 [&>div]:bg-gradient-to-r [&>div]:from-[#FFD54F] [&>div]:to-[#E0B84C]" />
                </div>
              </div>

              {/* Dynamic CTA Buttons */}
              <div className="space-y-3">
                {!hasProvidersInArea && (
                  <>
                    <Button onClick={() => { closePopup(false); navigate('register', { role: 'PROVIDER' }); }} className="w-full bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
                      <UserPlus className="mr-2 size-4" /> Become Provider
                    </Button>
                    <Button onClick={() => { closePopup(false); openWhatsAppReferral(); }} className="w-full bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]">
                      <MessageCircle className="mr-2 size-4" /> Refer Provider via WhatsApp
                    </Button>
                    <Button onClick={() => { closePopup(false); navigate('register', { role: 'AREA_MANAGER' }); }} className="w-full bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
                      <Briefcase className="mr-2 size-4" /> Become Area Manager
                    </Button>
                  </>
                )}
                {hasLimitedServices && (
                  <>
                    <Button onClick={() => { closePopup(false); openWhatsAppReferral(); }} className="w-full bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]">
                      <MessageCircle className="mr-2 size-4" /> Refer Provider via WhatsApp
                    </Button>
                    <Button onClick={() => { closePopup(false); navigate('register', { role: 'AREA_MANAGER' }); }} className="w-full bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
                      <Briefcase className="mr-2 size-4" /> Join Our Team
                    </Button>
                  </>
                )}
                {hasProvidersInArea && !hasLimitedServices && (
                  <Button onClick={() => { closePopup(false); navigate('categories'); }} className="w-full bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-[#0A1F44] hover:from-[#E0B84C] hover:to-[#FFD54F]">
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
                  className="rounded border-[#0A1F44]/20 text-[#0A1F44] focus:ring-[#FFD54F]/20"
                />
                Don&apos;t show this again
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Floating WhatsApp Button ═══════════ */}
      <FloatingWhatsApp />

      {/* ═══════════ Live Activity Popup ═══════════ */}
      <LiveActivityPopup />
    </div>
  );
}

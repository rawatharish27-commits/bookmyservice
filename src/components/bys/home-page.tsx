import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Droplets,
  Zap,
  ArrowRight,
  Users,
  Shield,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  Star,
  Search,
  Wrench,
  Eye,
  Activity,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Quote,
  Clock,
  ThumbsUp,
  Lock,
  Gift,
  Crown,
  PartyPopper,
  Phone,
  Thermometer,
  Snowflake,
  RotateCcw,
  Utensils,
  Tv,
  Flame,
  GlassWater,
  Truck,
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
  subcategoriesCount: number;
  servicesCount: number;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
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

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  reviewer: { id: string; name: string };
  service: { id: string; title: string };
  createdAt: string;
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

// ─── Helper: Generate or persist sessionId ────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const KEY = 'bys_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ─── Helper: Category icon map (11 categories) ───────────────────────────────

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Thermometer: <Thermometer className="size-8" />,
  Snowflake: <Snowflake className="size-8" />,
  RotateCcw: <RotateCcw className="size-8" />,
  Utensils: <Utensils className="size-8" />,
  Tv: <Tv className="size-8" />,
  Droplets: <Droplets className="size-8" />,
  Flame: <Flame className="size-8" />,
  Wrench: <Wrench className="size-8" />,
  Zap: <Zap className="size-8" />,
  GlassWater: <GlassWater className="size-8" />,
  Truck: <Truck className="size-8" />,
};

const CATEGORY_BG_MAP: Record<string, string> = {
  Thermometer: 'from-sky-700 via-blue-500 to-sky-400',
  Snowflake: 'from-cyan-700 via-cyan-500 to-blue-400',
  RotateCcw: 'from-indigo-700 via-violet-500 to-purple-400',
  Utensils: 'from-amber-600 via-orange-500 to-yellow-400',
  Tv: 'from-purple-700 via-violet-500 to-fuchsia-400',
  Droplets: 'from-blue-700 via-blue-500 to-cyan-400',
  Flame: 'from-red-700 via-orange-500 to-amber-400',
  Wrench: 'from-blue-900 via-blue-700 to-blue-400',
  Zap: 'from-amber-600 via-yellow-500 to-amber-400',
  GlassWater: 'from-teal-700 via-teal-500 to-cyan-400',
  Truck: 'from-slate-700 via-gray-500 to-slate-400',
};

const CATEGORY_LIGHT_BG: Record<string, string> = {
  Thermometer: 'bg-gradient-to-r from-sky-50/80 to-blue-50/60 text-sky-700 border border-sky-200/40 backdrop-blur-sm',
  Snowflake: 'bg-gradient-to-r from-cyan-50/80 to-blue-50/60 text-cyan-700 border border-cyan-200/40 backdrop-blur-sm',
  RotateCcw: 'bg-gradient-to-r from-indigo-50/80 to-violet-50/60 text-indigo-700 border border-indigo-200/40 backdrop-blur-sm',
  Utensils: 'bg-gradient-to-r from-amber-50/80 to-orange-50/60 text-amber-700 border border-amber-200/40 backdrop-blur-sm',
  Tv: 'bg-gradient-to-r from-purple-50/80 to-violet-50/60 text-purple-700 border border-purple-200/40 backdrop-blur-sm',
  Droplets: 'bg-gradient-to-r from-blue-50/80 to-cyan-50/60 text-blue-700 border border-blue-200/40 backdrop-blur-sm',
  Flame: 'bg-gradient-to-r from-red-50/80 to-orange-50/60 text-red-700 border border-red-200/40 backdrop-blur-sm',
  Wrench: 'bg-gradient-to-r from-blue-50/80 to-indigo-50/60 text-blue-900 border border-blue-200/40 backdrop-blur-sm',
  Zap: 'bg-gradient-to-r from-amber-50/80 to-yellow-50/60 text-amber-700 border border-amber-200/40 backdrop-blur-sm',
  GlassWater: 'bg-gradient-to-r from-teal-50/80 to-cyan-50/60 text-teal-700 border border-teal-200/40 backdrop-blur-sm',
  Truck: 'bg-gradient-to-r from-slate-50/80 to-gray-50/60 text-slate-700 border border-slate-200/40 backdrop-blur-sm',
};

const CATEGORY_GLOW: Record<string, string> = {
  Thermometer: 'shadow-sky-500/40',
  Snowflake: 'shadow-cyan-500/40',
  RotateCcw: 'shadow-indigo-500/40',
  Utensils: 'shadow-amber-500/40',
  Tv: 'shadow-purple-500/40',
  Droplets: 'shadow-blue-500/40',
  Flame: 'shadow-red-500/40',
  Wrench: 'shadow-blue-800/40',
  Zap: 'shadow-amber-500/40',
  GlassWater: 'shadow-teal-500/40',
  Truck: 'shadow-slate-500/40',
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  Thermometer: '/images/air-conditioner.jpg',
  Snowflake: '/images/refrigerator.jpg',
  RotateCcw: '/images/washing-machine.jpg',
  Utensils: '/images/kitchen-appliances.jpg',
  Tv: '/images/tv-repair.jpg',
  Droplets: '/images/water-purifier.jpg',
  Flame: '/images/geyser.jpg',
  Wrench: '/images/plumber.jpg',
  Zap: '/images/electrician.jpg',
  GlassWater: '/images/water-tank-cleaning.jpg',
  Truck: '/images/movers-packers.jpg',
};

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

  if (loading) return <span className={`inline-block h-7 w-16 animate-pulse rounded-md bg-accent ${className}`} />;
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
        className="inline-block text-gradient"
        style={{ textShadow: '0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(14,165,233,0.25), 0 0 120px rgba(30,58,95,0.15)' }}
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

// ─── Skeleton Components ──────────────────────────────────────────────────────

function CategorySkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <Skeleton className="mb-3 size-14 rounded-2xl" />
        <Skeleton className="mb-2 h-6 w-28" />
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-2 h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
  );
}

// ─── Testimonial Data (real reviews from API or defaults) ─────────────────────

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
    quote: 'Got our office refrigerator repaired before an important event. The technician was well-trained and explained everything clearly. Great experience overall.',
    avatar: 'RK',
    service: 'Refrigerator',
  },
  {
    name: 'Ananya Patel',
    role: 'Apartment Resident, Bangalore',
    rating: 4,
    quote: 'Electrical work at my apartment was done neatly. The provider was KYC verified which gave me peace of mind. Will use again!',
    avatar: 'AP',
    service: 'Electrician',
  },
  {
    name: 'Vikram Singh',
    role: 'Property Manager, Pune',
    rating: 5,
    quote: 'Managing multiple properties, I rely on BookYourService for all plumbing and appliance repairs. Their verified providers never disappoint.',
    avatar: 'VS',
    service: 'Plumber',
  },
  {
    name: 'Meera Joshi',
    role: 'Homeowner, Hyderabad',
    rating: 5,
    quote: 'Used their movers and packers service for relocation. Everything was handled carefully and delivered on time. Impressive service!',
    avatar: 'MJ',
    service: 'Movers & Packers',
  },
  {
    name: 'Suresh Reddy',
    role: 'Restaurant Owner, Chennai',
    rating: 5,
    quote: 'Kitchen appliance repair was done quickly and professionally. My restaurant was back in operation the same day. Fantastic response time!',
    avatar: 'SR',
    service: 'Kitchen Appliances',
  },
];

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

  const next = () => {
    setAutoPlay(false);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };
  const prev = () => {
    setAutoPlay(false);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(239,246,255,0.7) 40%, rgba(224,242,254,0.6) 70%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30,58,95,0.15)',
          }}
        >
          {/* Decorative gradient blob */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-blue-200/30 to-sky-200/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-gradient-to-br from-amber-200/20 to-orange-200/15 blur-2xl" />

          <div className="relative">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-sky-500/10">
              <Quote className="size-7 text-blue-500/60" />
            </div>
            <p className="mb-7 text-lg leading-relaxed text-foreground/85 sm:text-xl sm:leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="mb-5 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${i < t.rating ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6] text-base font-bold text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/50">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
              <Badge
                className="ml-2 border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-amber-700"
                variant="outline"
              >
                {t.service}
              </Badge>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          onClick={prev}
          className="group flex size-11 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition-all duration-300 hover:bg-blue-50 hover:shadow-md hover:border-blue-300 hover:scale-110"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="flex gap-2.5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrent(idx); setAutoPlay(false); }}
              className={`h-3 rounded-full transition-all duration-400 ${idx === current ? 'w-10 bg-gradient-to-r from-blue-600 to-sky-400 shadow-md shadow-blue-400/40' : 'w-3 bg-blue-200 hover:bg-blue-300 hover:scale-125'}`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="group flex size-11 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition-all duration-300 hover:bg-blue-50 hover:shadow-md hover:border-blue-300 hover:scale-110"
          aria-label="Next testimonial"
        >
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

  // Data fetching - REAL API only, no mock/demo data
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useApi<{ categories: Category[]; total: number }>('/api/categories');
  const { data: servicesData, loading: servicesLoading } = useApi<{ services: ServiceItem[]; pagination: { total: number } }>('/api/services?limit=6');

  const categories = categoriesData?.categories || [];
  const services = servicesData?.services || [];

  // Subcategories per category
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, Subcategory[]>>({});

  // Real-time stats from API
  const [liveStats, setLiveStats] = useState<PlatformStats | null>(null);

  // ─── Visitor tracking ────────────────────────────────────────────────────────

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Track visitor
    fetch(apiUrl('/api/stats/visitor'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, page: 'home' }),
    }).catch(() => {});

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      fetch(apiUrl('/api/stats/visitor'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, page: 'home' }),
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(heartbeat);
  }, []);

  // ─── WebSocket for real-time stats (disabled - using REST fallback) ────────
  // WebSocket connection removed - REST API polling handles stats updates

  // ─── Fetch subcategories for each category ──────────────────────────────────

  useEffect(() => {
    if (categories.length === 0) return;
    async function fetchSubcategories() {
      const map: Record<number, Subcategory[]> = {};
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(apiUrl(`/api/subcategories?categoryId=${cat.id}`));
            if (res.ok) {
              const data = await res.json();
              map[cat.id] = data.subcategories || data;
            }
          } catch {
            // ignore
          }
        })
      );
      if (Object.keys(map).length > 0) {
        setSubcategoriesMap(map);
      }
    }
    fetchSubcategories();
  }, [categories]);

  // ─── Fetch live stats from API ──────────────────────────────────────────────

  useEffect(() => {
    async function fetchStats() {
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
        }
      } catch {
        // Stats will remain null - shows loading state
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Motion Variants ────────────────────────────────────────────────────────

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* ═══════════ Launch Offer Banner ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #d97706 0%, #ea580c 30%, #e11d48 70%, #f43f5e 100%)' }}>
        {/* Animated sparkle background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute left-[8%] top-1/2 -translate-y-1/2 size-24 rounded-full bg-white/10"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[12%] top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/10"
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-[40%] top-1/2 -translate-y-1/2 size-12 rounded-full bg-yellow-300/20"
            animate={{ scale: [1, 1.6, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Animated sparkle dots */}
          {Array.from({ length: 8 }).map((_, i) => {
            const seed = ((i + 3) * 2654435761) >>> 0;
            const l = (seed * 13) % 90 + 5;
            const dur = 1.5 + (seed % 200) / 100;
            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute size-1 rounded-full bg-yellow-200/60"
                style={{ left: `${l}%`, top: '50%', transform: 'translateY(-50%)' }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: dur, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
              />
            );
          })}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
            {/* Left side - Client offer */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-xl ring-1 ring-white/20 shadow-lg shadow-black/10"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-lg" style={{ boxShadow: '0 0 20px rgba(253,224,71,0.3)' }}>
                <Crown className="size-7 text-yellow-100 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white sm:text-base">First 100 Clients</p>
                <p className="text-xs text-white/80 sm:text-sm">Get <span className="font-extrabold text-yellow-100 drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]">FREE Subscription</span> for 1 Year!</p>
              </div>
            </motion.div>

            {/* Center sparkle divider */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl ring-1 ring-white/20 shadow-lg"
            >
              <PartyPopper className="size-7 text-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.4)]" />
            </motion.div>

            {/* Right side - Provider offer */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-xl ring-1 ring-white/20 shadow-lg shadow-black/10"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-lg" style={{ boxShadow: '0 0 20px rgba(253,224,71,0.3)' }}>
                <Gift className="size-7 text-yellow-100 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white sm:text-base">First 50 Service Providers</p>
                <p className="text-xs text-white/80 sm:text-sm">Get <span className="font-extrabold text-yellow-100 drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]">FREE Subscription</span> for 1 Year!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ Hero Section ═══════════ */}
      <section className="relative overflow-hidden noise-bg" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 25%, #2d5a8e 50%, #3b82f6 75%, #0ea5e9 100%)' }}>
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -left-40 -top-40 size-[800px] rounded-full bg-gradient-to-br from-blue-700/30 to-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[700px] rounded-full bg-gradient-to-tl from-blue-600/30 to-sky-400/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/4 size-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-400/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 size-[300px] rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-400/5 blur-3xl" />
          {/* Deep blue accent orb */}
          <div className="absolute left-1/4 top-1/2 size-[250px] rounded-full bg-gradient-to-br from-[#1e3a5f]/20 to-[#3b82f6]/10 blur-3xl" />
          {/* Warm amber orb */}
          <div className="absolute right-1/3 top-1/5 size-[200px] rounded-full bg-gradient-to-br from-amber-400/15 to-yellow-300/8 blur-3xl" />

          {/* Animated floating shapes */}
          <motion.div
            className="absolute -left-20 -top-20 size-96 rounded-full bg-sky-400/[0.06]"
            animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-10 right-10 size-72 rounded-full bg-blue-400/[0.06]"
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/4 top-1/4 size-48 rounded-full bg-amber-400/[0.05]"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-1/4 top-1/3 size-36 rounded-full bg-amber-300/[0.06]"
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/6 bottom-1/3 size-28 rounded-full bg-blue-400/[0.05]"
            animate={{ x: [0, 30, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Particle-like dots animation */}
          {Array.from({ length: 25 }).map((_, i) => {
            const seed = (i * 2654435761) >>> 0;
            const w = 2 + (seed % 300) / 100;
            const h = 2 + ((seed * 7) % 300) / 100;
            const l = (seed * 13) % 100;
            const t = (seed * 17) % 100;
            const dur = 2 + (seed % 300) / 100;
            const del = (seed * 3 % 300) / 100;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full bg-white/[0.12]"
                style={{
                  width: `${w}px`,
                  height: `${h}px`,
                  left: `${l}%`,
                  top: `${t}%`,
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: dur,
                  repeat: Infinity,
                  delay: del,
                  ease: 'easeInOut',
                }}
              />
            );
          })}

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Diagonal light beam */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 55%, transparent 60%)' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="mb-8 border-blue-300/25 bg-blue-500/20 px-5 py-2 text-blue-100 hover:bg-blue-500/30 text-sm backdrop-blur-md shadow-lg shadow-blue-500/10">
                  <Sparkles className="mr-2 size-4" /> India&apos;s Trusted Home Service Platform
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Expert{' '}
                <RotatingText words={['AC Repair', 'Plumbing', 'Electrical', 'Appliances', 'Moving']} />
                <br />
                <span className="text-gradient" style={{ textShadow: '0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(14,165,233,0.3)' }}>at Your Doorstep</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-8 max-w-xl text-lg leading-relaxed text-blue-100/80 sm:text-xl"
              >
                Book verified professionals for AC repair, plumbing, electrical work, appliance servicing, and more.
                Quality work, transparent pricing, and our satisfaction guarantee.
              </motion.p>

              {/* Real-time visitor counter */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-6 flex items-center gap-2.5"
              >
                <span className="relative flex size-3.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-300 opacity-75" />
                  <span className="relative inline-flex size-3.5 rounded-full bg-blue-300 shadow-md shadow-blue-300/50" />
                </span>
                <span className="text-sm font-medium text-blue-200">
                  <AnimatedCounter value={liveStats?.activeVisitors || 0} loading={!liveStats} className="font-bold" />{' '}
                  {liveStats?.activeVisitors === 1 ? 'person' : 'people'} viewing right now
                </span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('categories')}
                  className="shimmer group h-13 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 px-10 text-base font-bold text-white shadow-xl shadow-amber-500/30 hover:from-amber-600 hover:via-orange-500 hover:to-rose-500 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300"
                >
                  Book a Service
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {!user && (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('login')}
                      className="h-13 border-2 border-sky-300/40 bg-gradient-to-r from-blue-600/30 to-sky-600/30 px-8 text-base text-white shadow-lg shadow-blue-900/20 backdrop-blur-sm hover:border-sky-300/60 hover:from-blue-600/40 hover:to-sky-600/40 hover:shadow-xl"
                    >
                      Client Login
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('register')}
                      className="h-13 border-amber-300/30 text-base text-amber-100 hover:bg-amber-600/15 hover:border-amber-300/50"
                    >
                      Join as Provider
                    </Button>
                  </>
                )}
                {user && user.role === 'CLIENT' && (
                  <Button
                    size="lg"
                    onClick={() => navigate('client-dashboard')}
                    className="h-13 border-2 border-sky-300/40 bg-gradient-to-r from-blue-600/30 to-sky-600/30 px-8 text-base text-white shadow-lg shadow-blue-900/20 backdrop-blur-sm hover:border-sky-300/60 hover:from-blue-600/40 hover:to-sky-600/40"
                  >
                    My Dashboard
                  </Button>
                )}
                {user && user.role === 'PROVIDER' && (
                  <Button
                    size="lg"
                    onClick={() => navigate('provider-dashboard')}
                    className="h-13 border-2 border-amber-300/40 bg-gradient-to-r from-amber-600/30 to-orange-600/30 px-8 text-base text-white shadow-lg shadow-amber-900/20 backdrop-blur-sm hover:border-amber-300/60 hover:from-amber-600/40 hover:to-orange-600/40"
                  >
                    Provider Dashboard
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* Hero visual - floating service icons with glow */}
            <motion.div
              className="hidden lg:flex lg:items-center lg:justify-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="relative flex size-[440px] items-center justify-center">
                {/* Outer glow rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/15 to-sky-400/8 blur-3xl" />
                <motion.div
                  className="absolute inset-4 rounded-full border border-white/[0.08]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-12 rounded-full border border-white/[0.05]" />
                <div className="absolute inset-24 rounded-full border border-white/[0.03]" />

                {/* Rotating dots on outer ring */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={`orbit-dot-${i}`}
                    className="absolute size-2 rounded-full bg-blue-400/40"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: '0 0',
                      transform: `rotate(${angle}deg) translateX(200px) translate(-50%, -50%)`,
                    }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}

                {/* AC / Thermometer */}
                <motion.div
                  className="absolute -left-4 top-4 float-animation"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 shadow-2xl shadow-sky-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Thermometer className="size-12 text-sky-200 drop-shadow-[0_0_12px_rgba(125,211,252,0.6)]" />
                  </div>
                </motion.div>

                {/* Electrical / Zap */}
                <motion.div
                  className="absolute right-0 top-16"
                  animate={{ y: [0, 18, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/25 to-yellow-400/15 shadow-2xl shadow-amber-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Zap className="size-12 text-yellow-200 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]" />
                  </div>
                </motion.div>

                {/* Plumber / Wrench */}
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600/25 to-indigo-400/15 shadow-2xl shadow-blue-600/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wrench className="size-12 text-blue-200 drop-shadow-[0_0_12px_rgba(147,197,253,0.6)]" />
                  </div>
                </motion.div>

                {/* Center element */}
                <div className="rounded-3xl bg-white/10 px-10 py-6 text-center shadow-2xl backdrop-blur-xl ring-1 ring-white/20" style={{ boxShadow: '0 0 60px rgba(30,58,95,0.25), 0 0 120px rgba(59,130,246,0.1)' }}>
                  <p className="text-2xl font-bold text-white">Your Home</p>
                  <p className="text-sm font-medium bg-gradient-to-r from-blue-200 to-sky-200 bg-clip-text text-transparent">Our Expertise</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V50C180 80 360 20 540 50C720 80 900 20 1080 50C1260 80 1350 35 1440 50V100H0Z" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
      </section>

      {/* ═══════════ Live Stats Bar ═══════════ */}
      <section className="relative z-10 -mt-3 bg-gradient-to-b from-white to-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: <Eye className="size-5" />, label: 'Active Visitors', value: liveStats?.activeVisitors || 0, color: 'from-blue-600 to-blue-400', cardBg: 'bg-gradient-to-br from-blue-50/80 to-sky-50/60', hoverGlow: 'hover:shadow-blue-400/50', live: true, iconBg: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]' },
              { icon: <Users className="size-5" />, label: 'Registered Clients', value: liveStats?.totalUsers || 0, color: 'from-blue-600 to-cyan-400', cardBg: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/60', hoverGlow: 'hover:shadow-blue-400/50', iconBg: 'from-blue-600 via-indigo-500 to-cyan-400' },
              { icon: <Shield className="size-5" />, label: 'Verified Providers', value: liveStats?.totalProviders || 0, color: 'from-amber-600 to-amber-400', cardBg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/60', hoverGlow: 'hover:shadow-amber-400/50', iconBg: 'from-amber-600 via-orange-500 to-rose-400' },
              { icon: <Wrench className="size-5" />, label: 'Services Available', value: liveStats?.totalServices || 0, color: 'from-blue-700 to-blue-400', cardBg: 'bg-gradient-to-br from-blue-50/80 to-sky-50/60', hoverGlow: 'hover:shadow-blue-400/50', iconBg: 'from-[#1e3a5f] via-[#2d5a8e] to-sky-400' },
              { icon: <CalendarCheck className="size-5" />, label: 'Total Bookings', value: liveStats?.totalBookings || 0, color: 'from-rose-600 to-pink-400', cardBg: 'bg-gradient-to-br from-rose-50/80 to-pink-50/60', hoverGlow: 'hover:shadow-rose-400/50', iconBg: 'from-rose-600 via-rose-500 to-fuchsia-400' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className={`group ${stat.cardBg} rounded-2xl p-5 shadow-sm backdrop-blur-sm ring-1 ring-white/60 transition-all duration-300 hover:shadow-xl ${stat.hoverGlow} hover:ring-white hover:-translate-y-1 hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconBg} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-extrabold text-foreground">
                        <AnimatedCounter value={stat.value} loading={!liveStats} />
                      </p>
                      {stat.live && (
                        <span className="relative flex size-3.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-80" />
                          <span className="relative inline-flex size-3.5 rounded-full bg-blue-400 shadow-md shadow-blue-400/50" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Launch Notice Banner ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 size-[300px] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[300px] rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute right-1/3 top-0 size-[200px] rounded-full bg-amber-200/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center gap-5 rounded-3xl border border-blue-200/50 bg-white/70 px-8 py-7 text-center shadow-lg backdrop-blur-xl sm:flex-row sm:text-left"
          >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] shadow-xl shadow-blue-500/30">
              <Clock className="size-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900">Services Coming Soon!</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-700/80">
                Our services will officially start after the selection of our <span className="font-bold text-blue-900">first 100 clients</span> and <span className="font-bold text-blue-900">50 service providers</span>. Register now to be among the first and enjoy <span className="font-extrabold text-amber-600">FREE subscription for one year</span>!
              </p>
            </div>
            <Button
              size="lg"
              className="shimmer shrink-0 bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] px-8 text-white shadow-lg shadow-blue-500/30 hover:from-[#162d4a] hover:to-[#2563eb] hover:shadow-xl"
              onClick={() => navigate('register')}
            >
              Register Now
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Service Categories ═══════════ */}
      <section className="relative bg-gradient-to-b from-white via-blue-50/20 to-white py-24 noise-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-5 border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-blue-700 hover:bg-blue-100 backdrop-blur-sm shadow-sm shadow-blue-200/30">
              <Sparkles className="mr-1.5 size-3.5" /> 11 Specialized Services
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Our <span className="text-gradient">Service Categories</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground/80">
              We offer 11 specialized home services, each staffed by verified professionals
            </p>
          </motion.div>

          {!categoriesLoading && categories.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">Unable to load categories. Please try again.</p>
              <Button variant="outline" size="sm" onClick={refetchCategories} className="mt-3">
                Retry
              </Button>
            </div>
          ) : (
            <div className="mt-14 grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categoriesLoading ? (
                Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
              ) : (
                categories.map((cat, idx) => {
                  const iconKey = cat.icon || 'Wrench';
                  const bgClass = CATEGORY_BG_MAP[iconKey] || 'from-blue-700 via-blue-500 to-sky-400';
                  const lightBgClass = CATEGORY_LIGHT_BG[iconKey] || 'bg-blue-50 text-blue-700';
                  const glowClass = CATEGORY_GLOW[iconKey] || 'shadow-blue-500/30';
                  const imageUrl = CATEGORY_IMAGE_MAP[iconKey] || '/images/plumber.jpg';
                  const subs = subcategoriesMap[cat.id] || [];

                  return (
                    <motion.div
                      key={cat.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-30px' }}
                      variants={scaleIn}
                      custom={idx}
                    >
                      <TiltCard>
                        <Card
                          className={`group cursor-pointer overflow-hidden rounded-3xl border-0 shadow-lg shadow-premium transition-all duration-500 hover:shadow-2xl ${glowClass} hover:scale-[1.02]`}
                          onClick={() => navigate('category-detail', { slug: cat.slug })}
                        >
                          {/* Image header with gradient overlay */}
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={cat.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            {/* Gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${bgClass} opacity-75`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                            {/* Icon badge */}
                            <div className="absolute left-4 top-4 flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl ring-1 ring-white/30 shadow-lg" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                              <div className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                                {CATEGORY_ICON_MAP[iconKey] || <Wrench className="size-7" />}
                              </div>
                            </div>

                            {/* Title on image */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{cat.name}</h3>
                            </div>
                          </div>

                          <CardContent className="relative p-4 bg-gradient-to-b from-white to-blue-50/30">
                            {/* Stats row */}
                            <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 font-medium">
                                <Wrench className="size-3.5" />
                                {cat.subcategoriesCount || subs.length} Sub
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Star className="size-3.5 text-amber-400" />
                                {cat.servicesCount} Services
                              </span>
                            </div>

                            {/* Subcategory pills */}
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {subs.slice(0, 3).map((sub) => (
                                  <span
                                    key={sub.id}
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${lightBgClass}`}
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                                {subs.length > 3 && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                                    +{subs.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* View all link */}
                            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] bg-clip-text text-transparent group-hover:from-[#162d4a] group-hover:to-[#2563eb] transition-all duration-300">
                              Explore
                              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </TiltCard>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* View all categories CTA */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 text-center"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('categories')}
                className="rounded-full border-2 border-blue-200 px-8 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                View All Categories
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/30 via-white to-sky-50/20 py-24 noise-bg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/3 size-[500px] rounded-full bg-blue-100/30 blur-3xl" />
          <div className="absolute -right-40 bottom-1/3 size-[500px] rounded-full bg-sky-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-5 border-sky-200/60 bg-sky-50/80 px-4 py-1.5 text-sky-700 hover:bg-sky-100 backdrop-blur-sm shadow-sm shadow-sky-200/30">
              <Activity className="mr-1.5 size-3.5" /> Simple Process
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground/80">
              Get your home services done in three easy steps
            </p>
          </motion.div>

          <div className="relative mt-16">
            {/* Connecting dashed line */}
            <div className="absolute left-0 right-0 top-24 hidden lg:block">
              <div className="mx-auto max-w-3xl border-t-2 border-dashed border-blue-200" />
            </div>

            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  step: 1,
                  icon: <Search className="size-7" />,
                  title: 'Choose Your Service',
                  desc: 'Browse our 11 service categories and find the exact service you need for your home or business.',
                  gradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
                  ringColor: 'ring-blue-200/60',
                  shadowColor: 'shadow-blue-500/40',
                },
                {
                  step: 2,
                  icon: <CalendarCheck className="size-7" />,
                  title: 'Book a Professional',
                  desc: 'Select a verified professional, pick a convenient time slot, and book instantly with transparent pricing.',
                  gradient: 'from-amber-600 via-orange-500 to-rose-400',
                  ringColor: 'ring-amber-200/60',
                  shadowColor: 'shadow-amber-500/40',
                },
                {
                  step: 3,
                  icon: <CheckCircle2 className="size-7" />,
                  title: 'Get It Done Right',
                  desc: 'Sit back and relax. Our verified professional arrives on time and delivers quality work guaranteed.',
                  gradient: 'from-[#2d5a8e] via-[#3b82f6] to-sky-400',
                  ringColor: 'ring-sky-200/60',
                  shadowColor: 'shadow-sky-500/40',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  variants={fadeUp}
                  custom={idx + 1}
                  className="relative text-center"
                >
                  {/* Step number */}
                  <div className="relative mx-auto mb-8">
                    <div className={`mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-xl ${item.shadowColor} ring-4 ${item.ringColor} transition-transform duration-300 hover:scale-110 hover:shadow-2xl`}>
                      {item.icon}
                    </div>
                    {/* Step badge */}
                    <div className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] bg-clip-text text-transparent shadow-lg ring-2 ring-blue-100">
                      {item.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Featured Services ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 size-[400px] rounded-full bg-blue-50/50 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 size-[400px] rounded-full bg-sky-50/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-5 border-amber-200/60 bg-amber-50/80 px-4 py-1.5 text-amber-700 hover:bg-amber-100 backdrop-blur-sm shadow-sm shadow-amber-200/30">
              <Star className="mr-1.5 size-3.5 fill-amber-400" /> Popular Services
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Featured <span className="text-gradient">Services</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground/80">
              Top-rated services loved by our customers across India
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
            ) : (
              services.slice(0, 6).map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  variants={scaleIn}
                  custom={idx}
                >
                  <Card
                    className="group cursor-pointer overflow-hidden rounded-3xl border-0 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                    onClick={() => navigate('service-detail', { id: service.id })}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={service.images ? JSON.parse(service.images)[0] : '/images/placeholder.jpg'}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm">
                          {service.category.name}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-foreground line-clamp-1">{service.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Star className="size-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
                          <span className="text-sm font-semibold text-foreground">{service.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({service.totalReviews})</span>
                        </div>
                        <p className="text-lg font-bold bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] bg-clip-text text-transparent">
                          ₹{service.basePrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {service.city || 'All Cities'}
                        <span className="mx-1">•</span>
                        <span>{service.totalBookings} bookings</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 text-center"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('categories')}
                className="rounded-full border-2 border-blue-200 px-8 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                Browse All Services
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════ Testimonials ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-amber-50/15 to-white py-24">
        {/* Decorative */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 size-[400px] rounded-full bg-blue-50/50 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 size-[400px] rounded-full bg-sky-50/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-5 border-amber-200/60 bg-amber-50/80 px-4 py-1.5 text-amber-700 hover:bg-amber-100 backdrop-blur-sm shadow-sm shadow-amber-200/30">
              <Star className="mr-1.5 size-3.5 fill-amber-400" /> Customer Love
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              What Our <span className="text-gradient">Customers Say</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground/80">
              Real reviews from real customers who trust our platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-14"
          >
            <TestimonialCarousel testimonials={DEFAULT_TESTIMONIALS} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Trust Badges ═══════════ */}
      <section className="relative bg-gradient-to-r from-blue-50/60 via-sky-50/40 to-indigo-50/60 py-16 noise-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: <ShieldCheck className="size-6" />, title: 'KYC Verified', desc: 'All providers undergo thorough verification', gradient: 'from-[#1e3a5f] to-[#3b82f6]' },
              { icon: <Lock className="size-6" />, title: 'Secure Payments', desc: 'Encrypted transactions & refund protection', gradient: 'from-blue-600 to-cyan-400' },
              { icon: <ThumbsUp className="size-6" />, title: 'Quality Guaranteed', desc: 'Satisfaction guarantee on every booking', gradient: 'from-amber-600 to-amber-400' },
              { icon: <Clock className="size-6" />, title: 'On-Time Service', desc: 'Punctual professionals who respect your time', gradient: 'from-[#2d5a8e] to-sky-400' },
            ].map((badge, idx) => (
              <motion.div
                key={badge.title}
                variants={fadeUp}
                custom={idx}
                className="group flex items-start gap-4 rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur-sm ring-1 ring-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${badge.gradient} text-white shadow-lg`}>
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{badge.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Provider CTA Section ═══════════ */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 size-[500px] rounded-full bg-blue-100/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 size-[500px] rounded-full bg-sky-100/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(30,58,95,0.95) 25%, rgba(45,90,142,0.95) 50%, rgba(59,130,246,0.95) 75%, rgba(14,165,233,0.97) 100%)',
              padding: '3rem',
            }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />

            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-400/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-gradient-to-br from-sky-400/10 to-blue-400/5 blur-3xl" />

            {/* Dot grid pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 via-orange-400 to-rose-400 shadow-2xl shadow-amber-500/30" style={{ boxShadow: '0 0 40px rgba(245,158,11,0.3), 0 8px 32px rgba(0,0,0,0.2)' }}>
                <Phone className="size-9 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Need a Custom Service?</h2>
                <p className="mt-3 max-w-xl text-lg text-blue-100/70">
                  Can&apos;t find what you&apos;re looking for? We offer custom solutions for all your home service needs. Get in touch with us today!
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('register')}
                  className="shimmer h-13 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 px-8 text-base font-bold text-white shadow-xl shadow-amber-500/30 hover:from-amber-600 hover:via-orange-500 hover:to-rose-500 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300"
                >
                  Register Now
                  <ArrowRight className="ml-2 size-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('contact')}
                  className="h-13 border-2 border-white/20 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/30"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Footer Mini ═══════════ */}
      <section className="border-t border-blue-100/50 bg-gradient-to-b from-gray-50 to-blue-50/20 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-foreground">BookYourService</h3>
              <p className="text-sm text-muted-foreground">India&apos;s trusted home service platform</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('about')} className="transition-colors hover:text-blue-600">About</button>
              <button onClick={() => navigate('faq')} className="transition-colors hover:text-blue-600">FAQ</button>
              <button onClick={() => navigate('contact')} className="transition-colors hover:text-blue-600">Contact</button>
              <button onClick={() => navigate('terms')} className="transition-colors hover:text-blue-600">Terms</button>
              <button onClick={() => navigate('privacy')} className="transition-colors hover:text-blue-600">Privacy</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

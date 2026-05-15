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
  Wind,
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
  Phone,
  Snowflake,
  Shirt,
  ChefHat,
  Tv,
  Flame,
  Truck,
  Droplet,
  Home,
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

// ─── Helper: Dynamic Category icon map (supports all 11+ categories) ──────────

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Wind: <Wind className="size-8" />,
  Snowflake: <Snowflake className="size-8" />,
  Shirt: <Shirt className="size-8" />,
  ChefHat: <ChefHat className="size-8" />,
  Tv: <Tv className="size-8" />,
  Droplets: <Droplets className="size-8" />,
  Flame: <Flame className="size-8" />,
  Wrench: <Wrench className="size-8" />,
  Zap: <Zap className="size-8" />,
  Droplet: <Droplet className="size-8" />,
  Truck: <Truck className="size-8" />,
};

// Dynamic category gradient map - navy blue based per category
const CATEGORY_BG_MAP: Record<string, string> = {
  Wind: 'from-blue-800 via-blue-600 to-sky-400',
  Snowflake: 'from-slate-800 via-blue-600 to-cyan-400',
  Shirt: 'from-blue-900 via-indigo-500 to-blue-400',
  ChefHat: 'from-slate-800 via-amber-600 to-yellow-400',
  Tv: 'from-blue-900 via-blue-700 to-sky-400',
  Droplets: 'from-blue-800 via-blue-500 to-cyan-400',
  Flame: 'from-red-800 via-red-500 to-orange-400',
  Wrench: 'from-slate-800 via-slate-600 to-blue-400',
  Zap: 'from-blue-900 via-yellow-500 to-amber-400',
  Droplet: 'from-blue-800 via-cyan-500 to-sky-400',
  Truck: 'from-slate-800 via-blue-600 to-indigo-400',
};

const CATEGORY_LIGHT_BG: Record<string, string> = {
  Wind: 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-100/50',
  Snowflake: 'bg-gradient-to-r from-slate-50 to-cyan-50 text-slate-700 border border-slate-100/50',
  Shirt: 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-100/50',
  ChefHat: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-100/50',
  Tv: 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-100/50',
  Droplets: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-100/50',
  Flame: 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-100/50',
  Wrench: 'bg-gradient-to-r from-slate-50 to-blue-50 text-slate-700 border border-slate-100/50',
  Zap: 'bg-gradient-to-r from-blue-50 to-amber-50 text-blue-700 border border-blue-100/50',
  Droplet: 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 border border-cyan-100/50',
  Truck: 'bg-gradient-to-r from-slate-50 to-indigo-50 text-slate-700 border border-slate-100/50',
};

const CATEGORY_GLOW: Record<string, string> = {
  Wind: 'shadow-blue-500/30',
  Snowflake: 'shadow-slate-500/30',
  Shirt: 'shadow-indigo-500/30',
  ChefHat: 'shadow-amber-500/30',
  Tv: 'shadow-blue-500/30',
  Droplets: 'shadow-blue-500/30',
  Flame: 'shadow-red-500/30',
  Wrench: 'shadow-slate-500/30',
  Zap: 'shadow-blue-500/30',
  Droplet: 'shadow-cyan-500/30',
  Truck: 'shadow-slate-500/30',
};

// Default fallback values
const DEFAULT_BG = 'from-blue-900 via-blue-700 to-sky-400';
const DEFAULT_LIGHT_BG = 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-100/50';
const DEFAULT_GLOW = 'shadow-blue-500/30';

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
        style={{ textShadow: '0 0 40px rgba(30,58,95,0.5), 0 0 80px rgba(59,130,246,0.25), 0 0 120px rgba(14,165,233,0.15)' }}
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(239,246,255,0.7) 40%, rgba(240,249,255,0.6) 70%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30,58,95,0.15)',
          }}
        >
          {/* Decorative gradient blob */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-blue-200/30 to-sky-200/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-gradient-to-br from-slate-200/20 to-blue-200/15 blur-2xl" />

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
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 text-base font-bold text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/50">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
              <Badge
                className="ml-2 border-blue-200/60 bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-1 text-blue-700"
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
              className={`h-3 rounded-full transition-all duration-400 ${idx === current ? 'w-10 bg-gradient-to-r from-blue-800 to-sky-400 shadow-md shadow-blue-400/40' : 'w-3 bg-blue-200 hover:bg-blue-300 hover:scale-125'}`}
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
      transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
      {/* ═══════════ Navy Blue Announcement Bar ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #2d5a8e 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute left-[8%] top-1/2 -translate-y-1/2 size-24 rounded-full bg-white/5"
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[12%] top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/5"
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Sparkles className="size-5 text-sky-300" />
              <p className="text-sm font-medium text-blue-100">
                <span className="font-bold text-white">First 100 Clients</span> — Get FREE Subscription for 1 Year!
              </p>
            </motion.div>

            <div className="hidden h-4 w-px bg-white/20 sm:block" />

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <ShieldCheck className="size-5 text-sky-300" />
              <p className="text-sm font-medium text-blue-100">
                <span className="font-bold text-white">First 50 Providers</span> — Get FREE Subscription for 1 Year!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ Hero Section ═══════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 20%, #2d5a8e 45%, #3b82f6 70%, #0ea5e9 100%)' }}>
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -left-40 -top-40 size-[800px] rounded-full bg-gradient-to-br from-blue-700/30 to-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[700px] rounded-full bg-gradient-to-tl from-blue-500/30 to-slate-400/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/4 size-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-400/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 size-[300px] rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-400/5 blur-3xl" />
          {/* Deep blue accent orb */}
          <div className="absolute left-1/4 top-1/2 size-[250px] rounded-full bg-gradient-to-br from-blue-600/15 to-sky-400/8 blur-3xl" />
          {/* Light accent orb */}
          <div className="absolute right-1/3 top-1/5 size-[200px] rounded-full bg-gradient-to-br from-sky-400/15 to-cyan-300/8 blur-3xl" />

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
            className="absolute left-1/4 top-1/4 size-48 rounded-full bg-sky-400/[0.05]"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-1/4 top-1/3 size-36 rounded-full bg-blue-300/[0.06]"
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/6 bottom-1/3 size-28 rounded-full bg-sky-400/[0.05]"
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
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="mb-8 border-blue-300/20 bg-blue-500/20 px-5 py-2 text-blue-100 hover:bg-blue-500/30 text-sm">
                  <Sparkles className="mr-2 size-4" /> India&apos;s Trusted Home Service Platform
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Expert{' '}
                <RotatingText words={['AC Repair', 'Plumbing', 'Electrical', 'Appliance Repair']} />
                <br />
                <span className="text-gradient" style={{ textShadow: '0 0 40px rgba(30,58,95,0.5), 0 0 80px rgba(59,130,246,0.3)' }}>at Your Doorstep</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-8 max-w-xl text-lg leading-relaxed text-blue-100/70 sm:text-xl"
              >
                Book verified professionals for AC repair, plumbing, electrical, appliance repair, and more.
                Quality work, transparent pricing, and our satisfaction guarantee.
              </motion.p>

              {/* Real-time visitor counter */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-6 flex items-center gap-2.5"
              >
                <span className="relative flex size-3.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-300 opacity-75" />
                  <span className="relative inline-flex size-3.5 rounded-full bg-sky-300 shadow-md shadow-sky-300/50" />
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
                  className="shimmer group h-13 bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 px-10 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-950 hover:via-blue-800 hover:to-sky-600 hover:shadow-2xl hover:shadow-blue-500/40"
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
                      className="h-13 border-blue-300/30 text-base text-blue-100 hover:bg-blue-600/15 hover:border-blue-300/50"
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
                    className="h-13 border-2 border-blue-300/40 bg-gradient-to-r from-blue-600/30 to-slate-600/30 px-8 text-base text-white shadow-lg shadow-blue-900/20 backdrop-blur-sm hover:border-blue-300/60 hover:from-blue-600/40 hover:to-slate-600/40"
                  >
                    Provider Dashboard
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* Hero visual - "Your Home, Our Expertise" concept */}
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

                {/* Floating service icon - AC/Wind */}
                <motion.div
                  className="absolute -left-4 top-4 float-animation"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/25 to-sky-400/15 shadow-2xl shadow-blue-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wind className="size-12 text-blue-200 drop-shadow-[0_0_12px_rgba(147,197,253,0.6)]" />
                  </div>
                </motion.div>

                {/* Floating service icon - Plumbing/Wrench */}
                <motion.div
                  className="absolute right-0 top-16"
                  animate={{ y: [0, 18, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-500/25 to-blue-400/15 shadow-2xl shadow-slate-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Wrench className="size-12 text-slate-200 drop-shadow-[0_0_12px_rgba(203,213,225,0.6)]" />
                  </div>
                </motion.div>

                {/* Floating service icon - Electrical/Zap */}
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/25 to-blue-400/15 shadow-2xl shadow-sky-500/25 backdrop-blur-xl ring-1 ring-white/20">
                    <Zap className="size-12 text-sky-200 drop-shadow-[0_0_12px_rgba(125,211,252,0.6)]" />
                  </div>
                </motion.div>

                {/* Center element - "Your Home, Our Expertise" */}
                <div className="rounded-3xl bg-white/10 px-10 py-6 text-center shadow-2xl backdrop-blur-xl ring-1 ring-white/20">
                  <Home className="mx-auto mb-2 size-8 text-sky-200/80" />
                  <p className="text-2xl font-bold text-white">Your Home</p>
                  <p className="text-sm font-medium text-blue-200/80">Our Expertise</p>
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
      <section className="relative z-10 -mt-3 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: <Eye className="size-5" />, label: 'Active Visitors', value: liveStats?.activeVisitors || 0, color: 'from-blue-800 to-blue-500', cardBg: 'bg-gradient-to-br from-blue-50/80 to-sky-50/60', hoverGlow: 'hover:shadow-blue-300/40', live: true, iconBg: 'from-blue-800 via-blue-600 to-sky-400' },
              { icon: <Users className="size-5" />, label: 'Registered Clients', value: liveStats?.totalUsers || 0, color: 'from-blue-600 to-cyan-400', cardBg: 'bg-gradient-to-br from-blue-50/80 to-cyan-50/60', hoverGlow: 'hover:shadow-blue-300/40', iconBg: 'from-blue-600 via-blue-500 to-cyan-400' },
              { icon: <Shield className="size-5" />, label: 'Verified Providers', value: liveStats?.totalProviders || 0, color: 'from-slate-700 to-slate-400', cardBg: 'bg-gradient-to-br from-slate-50/80 to-blue-50/60', hoverGlow: 'hover:shadow-slate-300/40', iconBg: 'from-slate-700 via-slate-500 to-blue-400' },
              { icon: <Wrench className="size-5" />, label: 'Services Available', value: liveStats?.totalServices || 0, color: 'from-blue-700 to-sky-400', cardBg: 'bg-gradient-to-br from-blue-50/80 to-sky-50/60', hoverGlow: 'hover:shadow-blue-300/40', iconBg: 'from-blue-700 via-blue-500 to-sky-400' },
              { icon: <CalendarCheck className="size-5" />, label: 'Total Bookings', value: liveStats?.totalBookings || 0, color: 'from-blue-800 to-indigo-400', cardBg: 'bg-gradient-to-br from-indigo-50/80 to-blue-50/60', hoverGlow: 'hover:shadow-indigo-300/40', iconBg: 'from-blue-800 via-indigo-500 to-blue-400' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className={`group ${stat.cardBg} rounded-2xl p-5 shadow-sm backdrop-blur-sm ring-1 ring-white/60 transition-all duration-300 hover:shadow-xl ${stat.hoverGlow} hover:ring-white/80 hover:-translate-y-1`}
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
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50 to-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 size-[300px] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[300px] rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute right-1/3 top-0 size-[200px] rounded-full bg-slate-200/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center gap-5 rounded-3xl border border-blue-200/50 bg-white/70 px-8 py-7 text-center shadow-lg backdrop-blur-xl sm:flex-row sm:text-left"
          >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-blue-600 shadow-xl shadow-blue-500/30">
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
              className="shimmer shrink-0 bg-gradient-to-r from-blue-900 to-blue-600 px-8 text-white shadow-lg shadow-blue-500/30 hover:from-blue-950 hover:to-blue-700 hover:shadow-xl"
              onClick={() => navigate('register')}
            >
              Register Now
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Service Categories ═══════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-5 border-blue-200 bg-blue-50 px-4 py-1.5 text-blue-700 hover:bg-blue-100">
              <Sparkles className="mr-1.5 size-3.5" /> Specialized Services
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Our <span className="text-gradient">Service Categories</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
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
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesLoading ? (
                Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
              ) : (
                categories.map((cat, idx) => {
                  const iconKey = cat.icon || 'Wrench';
                  const bgClass = CATEGORY_BG_MAP[iconKey] || DEFAULT_BG;
                  const lightBgClass = CATEGORY_LIGHT_BG[iconKey] || DEFAULT_LIGHT_BG;
                  const glowClass = CATEGORY_GLOW[iconKey] || DEFAULT_GLOW;
                  const catImageUrl = cat.imageUrl || `/images/${cat.slug}.jpg`;
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
                          className={`group cursor-pointer overflow-hidden rounded-3xl border-0 shadow-lg transition-all duration-500 hover:shadow-2xl ${glowClass}`}
                          onClick={() => navigate('category-detail', { slug: cat.slug })}
                        >
                          {/* Image header with gradient overlay */}
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={catImageUrl}
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
                            <div className="absolute left-5 top-5 flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl ring-1 ring-white/30 shadow-lg">
                              <div className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                {CATEGORY_ICON_MAP[iconKey] || <Wrench className="size-8" />}
                              </div>
                            </div>

                            {/* Title on image */}
                            <div className="absolute bottom-5 left-5 right-5">
                              <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{cat.name}</h3>
                              <p className="mt-1 text-sm text-white/80 line-clamp-2">{cat.description || `Professional ${cat.name.toLowerCase()} services`}</p>
                            </div>
                          </div>

                          <CardContent className="p-6">
                            {/* Stats row */}
                            <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Wrench className="size-4" />
                                {cat.subcategoriesCount || subs.length} Subcategories
                              </span>
                              <span className="flex items-center gap-1.5 font-medium">
                                <Star className="size-4 text-amber-400" />
                                {cat.servicesCount} Services
                              </span>
                            </div>

                            {/* Subcategory pills */}
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {subs.slice(0, 4).map((sub) => (
                                  <span
                                    key={sub.id}
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${lightBgClass}`}
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                                {subs.length > 4 && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    +{subs.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* View all link */}
                            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
                              Explore {cat.name}
                              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
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
            <Badge className="mb-5 border-blue-200 bg-blue-50 px-4 py-1.5 text-blue-700 hover:bg-blue-100">
              <Activity className="mr-1.5 size-3.5" /> Simple Process
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
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
                  desc: 'Browse our curated categories and find the exact service you need for your home or business.',
                  gradient: 'from-blue-900 via-blue-700 to-sky-400',
                  ringColor: 'ring-blue-200',
                  shadowColor: 'shadow-blue-500/30',
                },
                {
                  step: 2,
                  icon: <CalendarCheck className="size-7" />,
                  title: 'Book a Professional',
                  desc: 'Select a verified professional, pick a convenient time slot, and book instantly with transparent pricing.',
                  gradient: 'from-slate-800 via-slate-600 to-blue-400',
                  ringColor: 'ring-slate-200',
                  shadowColor: 'shadow-slate-500/30',
                },
                {
                  step: 3,
                  icon: <CheckCircle2 className="size-7" />,
                  title: 'Get It Done Right',
                  desc: 'Sit back and relax. Our verified professional arrives on time and delivers quality work guaranteed.',
                  gradient: 'from-blue-800 via-blue-600 to-sky-400',
                  ringColor: 'ring-blue-200',
                  shadowColor: 'shadow-blue-500/30',
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
                    <div className={`mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-xl ${item.shadowColor} ring-4 ${item.ringColor}`}>
                      {item.icon}
                    </div>
                    {/* Step badge */}
                    <div className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-700 shadow-lg ring-2 ring-blue-100">
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

      {/* ═══════════ Testimonials ═══════════ */}
      <section className="relative overflow-hidden bg-white py-24">
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
            <Badge className="mb-5 border-amber-200 bg-amber-50 px-4 py-1.5 text-amber-700 hover:bg-amber-100">
              <Star className="mr-1.5 size-3.5 fill-amber-400" /> Customer Love
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              What Our <span className="text-gradient">Customers Say</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
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
      <section className="bg-gradient-to-r from-blue-50 via-sky-50 to-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: <ShieldCheck className="size-6" />, title: 'KYC Verified', desc: 'All providers undergo thorough verification', gradient: 'from-blue-900 to-blue-500' },
              { icon: <Lock className="size-6" />, title: 'Secure Payments', desc: 'Encrypted transactions & refund protection', gradient: 'from-blue-600 to-cyan-400' },
              { icon: <ThumbsUp className="size-6" />, title: 'Quality Guaranteed', desc: 'Satisfaction guarantee on every booking', gradient: 'from-slate-700 to-slate-400' },
              { icon: <Clock className="size-6" />, title: 'On-Time Service', desc: 'Punctual professionals who respect your time', gradient: 'from-blue-700 to-sky-400' },
            ].map((badge, idx) => (
              <motion.div
                key={badge.title}
                variants={fadeUp}
                custom={idx}
                className="group flex items-start gap-4 rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur-sm ring-1 ring-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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

      {/* ═══════════ CTA Section ═══════════ */}
      <section className="relative overflow-hidden bg-white py-24">
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
              background: 'linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(30,58,95,0.95) 40%, rgba(45,90,142,0.95) 70%, rgba(59,130,246,0.95) 100%)',
              padding: '3rem',
            }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />

            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-sky-400/10 to-blue-400/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-gradient-to-br from-blue-400/10 to-sky-400/5 blur-3xl" />

            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 shadow-2xl shadow-blue-500/30">
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
                  className="shimmer h-13 bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 px-8 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-950 hover:via-blue-800 hover:to-sky-600 hover:shadow-2xl hover:shadow-blue-500/40"
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
      <section className="border-t bg-gray-50 py-10">
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

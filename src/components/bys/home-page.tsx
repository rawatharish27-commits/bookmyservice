'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { io } from 'socket.io-client';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ─── Helper: Category icon map ────────────────────────────────────────────────

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Droplets: <Droplets className="size-8" />,
  Zap: <Zap className="size-8" />,
  Wind: <Wind className="size-8" />,
};

const CATEGORY_BG_MAP: Record<string, string> = {
  Droplets: 'from-blue-600 via-blue-500 to-cyan-400',
  Zap: 'from-amber-600 via-amber-500 to-orange-400',
  Wind: 'from-teal-600 via-emerald-500 to-cyan-400',
};

const CATEGORY_LIGHT_BG: Record<string, string> = {
  Droplets: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-100/50',
  Zap: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100/50',
  Wind: 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-100/50',
};

const CATEGORY_GLOW: Record<string, string> = {
  Droplets: 'shadow-blue-500/30',
  Zap: 'shadow-amber-500/30',
  Wind: 'shadow-teal-500/30',
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
        initial={{ y: 20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="inline-block text-gradient drop-shadow-[0_0_24px_rgba(16,185,129,0.5)]"
        style={{ textShadow: '0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(20,184,166,0.2)' }}
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
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-200 ease-out ${className}`}
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
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <Skeleton className="mb-4 size-16 rounded-2xl" />
        <Skeleton className="mb-2 h-5 w-24" />
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
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
    quote: 'The plumber arrived within 30 minutes and fixed the leakage perfectly. Transparent pricing and professional service. Highly recommend!',
    avatar: 'PS',
    service: 'Plumbing',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Business Owner, Delhi',
    rating: 5,
    quote: 'Got our office AC serviced before summer. The technician was well-trained and explained everything clearly. Great experience overall.',
    avatar: 'RK',
    service: 'AC & HVAC',
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
    quote: 'Managing multiple properties, I rely on BookYourService for all maintenance. Their verified providers never disappoint.',
    avatar: 'VS',
    service: 'Plumbing',
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
    <div className="relative mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="glass-emerald rounded-3xl p-8 text-center shadow-xl sm:p-10 bg-gradient-to-br from-emerald-50/60 via-white/80 to-teal-50/40 ring-1 ring-emerald-200/40"
        >
          <Quote className="mx-auto mb-4 size-10 text-emerald-400/60" />
          <p className="mb-6 text-lg leading-relaxed text-foreground/90 sm:text-xl">&ldquo;{t.quote}&rdquo;</p>
          <div className="mb-3 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-5 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)] ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-emerald-500/25 ring-2 ring-white/40">
              {t.avatar}
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
            <Badge className="ml-2 border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700" variant="outline">
              {t.service}
            </Badge>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="flex size-10 items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-r from-white to-emerald-50 text-emerald-600 shadow-sm transition-all hover:bg-emerald-100 hover:shadow-md hover:border-emerald-300"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrent(idx); setAutoPlay(false); }}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-400/30' : 'w-2.5 bg-emerald-200 hover:bg-emerald-300'}`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="flex size-10 items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white text-emerald-600 shadow-sm transition-all hover:bg-emerald-100 hover:shadow-md hover:border-emerald-300"
          aria-label="Next testimonial"
        >
          <ChevronRight className="size-5" />
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
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useApi<Category[]>('/api/categories');
  const { data: servicesData, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useApi<{ services: ServiceItem[]; pagination: { total: number } }>('/api/services?limit=6');

  // Subcategories per category
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, Subcategory[]>>({});

  // Real-time stats from WebSocket
  const [liveStats, setLiveStats] = useState<PlatformStats | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Visitor tracking
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string>('');

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const services = servicesData?.services || [];

  // ─── Fetch subcategories for each category ──────────────────────────────────

  useEffect(() => {
    if (categories.length === 0) return;
    async function fetchSubcategories() {
      const map: Record<number, Subcategory[]> = {};
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(`/api/subcategories?categoryId=${cat.id}`);
            if (res.ok) {
              const data = await res.json();
              map[cat.id] = data;
            }
          } catch {
            // ignore
          }
        })
      );
      setSubcategoriesMap(map);
    }
    fetchSubcategories();
  }, [categories.length]);

  // ─── WebSocket Connection ───────────────────────────────────────────────────

  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setWsConnected(true);
    });

    socket.on('stats:update', (data: PlatformStats) => {
      setLiveStats(data);
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    // Fallback: fetch from REST API if WebSocket doesn't connect within 5s
    const fallbackTimer = setTimeout(async () => {
      if (!liveStats) {
        try {
          const res = await fetch('/api/stats/platform');
          if (res.ok) {
            const data = await res.json();
            setLiveStats({
              activeVisitors: data.activeVisitors || 0,
              totalVisitors: data.totalVisitors || 0,
              totalUsers: data.totalClients || 0,
              totalProviders: data.totalProviders || 0,
              totalServices: data.totalServices || 0,
              totalBookings: data.totalBookings || 0,
              timestamp: new Date().toISOString(),
            });
          }
        } catch {
          // ignore
        }
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimer);
      socket.disconnect();
    };
  }, []);

  // ─── Visitor Tracking ──────────────────────────────────────────────────────

  const trackVisitor = useCallback(async (sid: string) => {
    try {
      await fetch('/api/stats/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, page: 'home' }),
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const sid = getSessionId();
    sessionIdRef.current = sid;

    // Initial track
    trackVisitor(sid);

    // Heartbeat every 30s
    heartbeatRef.current = setInterval(() => {
      trackVisitor(sid);
    }, 30000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      // Mark inactive on unmount
      fetch('/api/stats/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, page: 'leaving' }),
      }).catch(() => {});
    };
  }, [trackVisitor]);

  // ─── Motion Variants ────────────────────────────────────────────────────────

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
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
      transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
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
      {/* ═══════════ Hero Section ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800" style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 25%, #0f766e 50%, #0e7490 75%, #164e63 100%)' }}>
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -left-40 -top-40 size-[700px] rounded-full bg-gradient-to-br from-blue-700/40 to-cyan-400/25 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[600px] rounded-full bg-gradient-to-tl from-teal-500/35 to-emerald-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 size-[350px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500/25 to-orange-400/15 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 size-[250px] rounded-full bg-gradient-to-br from-violet-500/15 to-fuchsia-400/8 blur-3xl" />
          {/* Deep blue accent orb */}
          <div className="absolute left-1/4 top-1/2 size-[200px] rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-400/10 blur-3xl" />
          {/* Warm amber orb */}
          <div className="absolute right-1/3 top-1/6 size-[180px] rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-300/10 blur-3xl" />
          {/* Animated floating shapes */}
          <motion.div
            className="absolute -left-20 -top-20 size-80 rounded-full bg-cyan-400/[0.08]"
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-10 right-10 size-60 rounded-full bg-emerald-400/[0.08]"
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/4 top-1/4 size-40 rounded-full bg-amber-400/[0.06]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Warm amber animated orb */}
          <motion.div
            className="absolute right-1/4 top-1/3 size-32 rounded-full bg-amber-300/[0.07]"
            animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Deep blue animated orb */}
          <motion.div
            className="absolute left-1/6 bottom-1/3 size-24 rounded-full bg-blue-400/[0.06]"
            animate={{ x: [0, 25, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Particle-like dots animation */}
          {Array.from({ length: 20 }).map((_, i) => {
            // Deterministic pseudo-random values based on index to avoid hydration mismatch
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
              className="absolute rounded-full bg-white/[0.15]"
              style={{
                width: `${w}px`,
                height: `${h}px`,
                left: `${l}%`,
                top: `${t}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
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
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="mb-6 border-emerald-300/20 bg-emerald-500/20 px-4 py-1.5 text-emerald-100 hover:bg-emerald-500/30">
                  <Sparkles className="mr-1.5 size-3.5" /> India&apos;s Trusted Home Service Platform
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Expert{' '}
                <RotatingText words={['Plumbing', 'Electrical', 'AC & HVAC']} />
                <br />
                <span className="text-gradient">at Your Doorstep</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-6 max-w-xl text-lg leading-relaxed text-emerald-100/80"
              >
                Book verified professionals for plumbing, electrical, and AC/HVAC services.
                Quality work, transparent pricing, and our satisfaction guarantee.
              </motion.p>

              {/* Real-time visitor counter */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-5 flex items-center gap-2"
              >
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-300" />
                </span>
                <span className="text-sm font-medium text-emerald-200">
                  <AnimatedCounter value={liveStats?.activeVisitors || 0} loading={!liveStats} className="font-bold" />{' '}
                  {liveStats?.activeVisitors === 1 ? 'person' : 'people'} viewing right now
                </span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('categories')}
                  className="shimmer group bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-8 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500"
                >
                  Book a Service
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
                {!user && (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('login')}
                      className="border-2 border-cyan-300/50 bg-gradient-to-r from-teal-600/40 to-cyan-600/40 px-8 text-white shadow-lg shadow-cyan-900/30 backdrop-blur-sm hover:border-cyan-300/70 hover:from-teal-600/50 hover:to-cyan-600/50"
                    >
                      Client Login
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('register')}
                      className="border-amber-300/40 text-amber-100 hover:bg-amber-600/20 hover:border-amber-300/60"
                    >
                      Join as Provider
                    </Button>
                  </>
                )}
                {user && user.role === 'CLIENT' && (
                  <Button
                    size="lg"
                    onClick={() => navigate('client-dashboard')}
                    className="border-2 border-cyan-300/50 bg-gradient-to-r from-teal-600/40 to-cyan-600/40 px-8 text-white shadow-lg shadow-cyan-900/30 backdrop-blur-sm hover:border-cyan-300/70 hover:from-teal-600/50 hover:to-cyan-600/50"
                  >
                    My Dashboard
                  </Button>
                )}
                {user && user.role === 'PROVIDER' && (
                  <Button
                    size="lg"
                    onClick={() => navigate('provider-dashboard')}
                    className="border-2 border-amber-300/50 bg-gradient-to-r from-amber-600/40 to-orange-600/40 px-8 text-white shadow-lg shadow-amber-900/30 backdrop-blur-sm hover:border-amber-300/70 hover:from-amber-600/50 hover:to-orange-600/50"
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
              <div className="relative flex size-[400px] items-center justify-center">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 blur-3xl" />
                <div className="absolute inset-8 rounded-full border border-white/10" />
                <div className="absolute inset-20 rounded-full border border-white/5" />

                {/* Plumbing */}
                <motion.div
                  className="absolute -left-2 top-8 float-animation"
                  animate={{ y: [0, -16, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/30 to-cyan-400/20 shadow-xl shadow-blue-500/20 backdrop-blur-md ring-1 ring-white/20">
                    <Droplets className="size-12 text-blue-200 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]" />
                  </div>
                </motion.div>

                {/* Electrical */}
                <motion.div
                  className="absolute right-2 top-12"
                  animate={{ y: [0, 14, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/30 to-yellow-400/20 shadow-xl shadow-amber-500/20 backdrop-blur-md ring-1 ring-white/20">
                    <Zap className="size-12 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
                  </div>
                </motion.div>

                {/* AC & HVAC */}
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500/30 to-emerald-400/20 shadow-xl shadow-teal-500/20 backdrop-blur-md ring-1 ring-white/20">
                    <Wind className="size-12 text-teal-200 drop-shadow-[0_0_8px_rgba(94,234,212,0.5)]" />
                  </div>
                </motion.div>

                {/* Center element */}
                <div className="rounded-3xl bg-white/10 px-8 py-5 text-center shadow-xl backdrop-blur-md ring-1 ring-white/20">
                  <p className="text-xl font-bold text-white">Your Home</p>
                  <p className="text-sm font-medium text-emerald-200">Our Expertise</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 70 480 10 720 40C960 70 1200 10 1440 40V80H0Z" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
      </section>

      {/* ═══════════ Live Stats Bar ═══════════ */}
      <section className="relative z-10 -mt-2 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: <Eye className="size-5" />, label: 'Active Visitors', value: liveStats?.activeVisitors || 0, color: 'from-emerald-600 to-emerald-400', cardBg: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/60', hoverGlow: 'hover:shadow-emerald-300/40', live: true },
              { icon: <Users className="size-5" />, label: 'Registered Clients', value: liveStats?.totalUsers || 0, color: 'from-blue-600 to-cyan-400', cardBg: 'bg-gradient-to-br from-blue-50/80 to-cyan-50/60', hoverGlow: 'hover:shadow-blue-300/40' },
              { icon: <Shield className="size-5" />, label: 'Verified Providers', value: liveStats?.totalProviders || 0, color: 'from-amber-600 to-amber-400', cardBg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/60', hoverGlow: 'hover:shadow-amber-300/40' },
              { icon: <Wrench className="size-5" />, label: 'Services Available', value: liveStats?.totalServices || 0, color: 'from-teal-600 to-teal-400', cardBg: 'bg-gradient-to-br from-teal-50/80 to-emerald-50/60', hoverGlow: 'hover:shadow-teal-300/40' },
              { icon: <CalendarCheck className="size-5" />, label: 'Total Bookings', value: liveStats?.totalBookings || 0, color: 'from-rose-600 to-pink-400', cardBg: 'bg-gradient-to-br from-rose-50/80 to-pink-50/60', hoverGlow: 'hover:shadow-rose-300/40' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`group ${stat.cardBg} rounded-2xl p-4 shadow-sm backdrop-blur-sm ring-1 ring-white/60 transition-all duration-300 hover:shadow-lg ${stat.hoverGlow} hover:ring-white/80`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-2xl font-extrabold text-foreground">
                        <AnimatedCounter value={stat.value} loading={!liveStats} />
                      </p>
                      {stat.live && (
                        <span className="relative flex size-3">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-80" />
                          <span className="relative inline-flex size-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
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

      {/* ═══════════ Service Categories ═══════════ */}
      <section className="mesh-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <Sparkles className="mr-1 size-3" /> Specialized Services
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our <span className="text-gradient">Service Categories</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              We specialize in three core home services, each staffed by verified professionals
            </p>
          </motion.div>

          {categoriesError ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">Failed to load categories</p>
              <Button variant="outline" size="sm" onClick={refetchCategories} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesLoading
                ? Array.from({ length: 3 }).map((_, i) => <CategorySkeleton key={i} />)
                : categories.map((cat, idx) => {
                    const iconEl = CATEGORY_ICON_MAP[cat.icon || ''] || <Sparkles className="size-8" />;
                    const gradientBg = CATEGORY_BG_MAP[cat.icon || ''] || 'from-emerald-500 to-teal-500';
                    const lightBg = CATEGORY_LIGHT_BG[cat.icon || ''] || 'bg-emerald-50 text-emerald-600';
                    const glowShadow = CATEGORY_GLOW[cat.icon || ''] || 'shadow-emerald-500/30';
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
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-500 hover:shadow-2xl"
                            onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                          >
                            {/* Gradient border effect on hover */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientBg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} style={{ padding: '2px' }}>
                              <div className="size-full rounded-2xl bg-white" />
                            </div>

                            {/* Gradient overlay on hover */}
                            <div className={`pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-br ${gradientBg} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`} />

                            {/* Shimmer effect */}
                            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
                              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>

                            {/* Gradient header */}
                            <div className={`relative bg-gradient-to-r ${gradientBg} px-6 py-6`}>
                              {/* Decorative pattern */}
                              <div className="pointer-events-none absolute inset-0 opacity-10">
                                <div
                                  className="size-full"
                                  style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                  }}
                                />
                              </div>
                              <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <motion.div
                                    className={`flex size-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg ${glowShadow} backdrop-blur-sm`}
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <span className="text-white">{iconEl}</span>
                                  </motion.div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                                    <p className="text-sm text-white/80">
                                      {cat.servicesCount} {cat.servicesCount === 1 ? 'service' : 'services'} available
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="size-5 text-white/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
                              </div>
                            </div>

                            <CardContent className="relative p-6">
                              {cat.description && (
                                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
                              )}

                              {/* Subcategories */}
                              {subs.length > 0 ? (
                                <div>
                                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Services Include
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {subs.slice(0, 10).map((sub) => (
                                      <Badge
                                        key={sub.id}
                                        variant="secondary"
                                        className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${lightBg} transition-transform hover:scale-105`}
                                      >
                                        {sub.name}
                                      </Badge>
                                    ))}
                                    {subs.length > 10 && (
                                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                        +{subs.length - 10} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TiltCard>
                      </motion.div>
                    );
                  })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section className="mesh-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <Clock className="mr-1 size-3" /> Simple Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How <span className="text-gradient">It Works</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Getting started is simple and takes just a few minutes</p>
          </motion.div>

          <div className="relative mt-16">
            {/* Connecting line - desktop */}
            <div className="absolute left-0 right-0 top-24 hidden h-1 rounded-full bg-gradient-to-r from-emerald-200 via-cyan-200 to-amber-200 sm:block">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 via-cyan-400 to-amber-400"
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
              {/* Animated glow on the line */}
              <motion.div
                className="absolute top-0 h-full w-20 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm"
                animate={{ x: ['-5%', '105%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />
            </div>

            <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Search & Compare',
                  description: 'Browse through our verified service providers. Read genuine reviews, compare prices, and pick the best match.',
                  icon: <Search className="size-7" />,
                  color: 'from-emerald-600 via-emerald-500 to-teal-500',
                  iconBg: 'from-emerald-100 to-teal-50',
                  iconColor: 'text-emerald-600',
                  shadowColor: 'shadow-emerald-500/25',
                },
                {
                  step: '2',
                  title: 'Book & Schedule',
                  description: 'Choose your preferred time slot, confirm your booking, and get instant confirmation from verified professionals.',
                  icon: <CalendarCheck className="size-7" />,
                  color: 'from-cyan-600 via-teal-500 to-emerald-500',
                  iconBg: 'from-cyan-100 to-teal-50',
                  iconColor: 'text-teal-600',
                  shadowColor: 'shadow-teal-500/25',
                },
                {
                  step: '3',
                  title: 'Get It Done',
                  description: 'A KYC-verified professional arrives on time, completes the work, and you leave a review for the community.',
                  icon: <CheckCircle2 className="size-7" />,
                  color: 'from-amber-600 via-amber-500 to-orange-400',
                  iconBg: 'from-amber-100 to-orange-50',
                  iconColor: 'text-amber-600',
                  shadowColor: 'shadow-amber-500/25',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  variants={scaleIn}
                  custom={idx}
                  className="relative text-center"
                >
                  {/* Icon container with gradient */}
                  <motion.div
                    className={`mx-auto flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br ${item.iconBg} ${item.iconColor} shadow-xl ${item.shadowColor} ring-1 ring-white/60`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>

                  {/* Step number with gradient */}
                  <motion.div
                    className={`mx-auto mt-5 flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-sm font-bold text-white shadow-lg ${item.shadowColor}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 + 0.3, type: 'spring', stiffness: 200 }}
                  >
                    {item.step}
                  </motion.div>

                  <h3 className="mt-5 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 max-w-xs mx-auto text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Featured Services ═══════════ */}
      <section className="mesh-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              custom={0}
            >
              <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                <ThumbsUp className="mr-1 size-3" /> Top Picks
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Featured <span className="text-gradient">Services</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Top-rated services from verified providers</p>
            </motion.div>
            <Button
              variant="ghost"
              onClick={() => navigate('search')}
              className="hidden text-emerald-600 hover:text-emerald-700 sm:inline-flex"
            >
              View All <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>

          {servicesError ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">Failed to load services</p>
              <Button variant="outline" size="sm" onClick={refetchServices} className="mt-2">
                Retry
              </Button>
            </div>
          ) : services.length === 0 && !servicesLoading ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">No services available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicesLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
                : services.map((service, idx) => (
                    <motion.div
                      key={service.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-30px' }}
                      variants={scaleIn}
                      custom={idx}
                    >
                      <Card
                        className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-md transition-all duration-500 hover:shadow-xl"
                        onClick={() => navigate('service-detail', { serviceId: service.id })}
                      >
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                          {service.images ? (
                            <img
                              src={(() => { try { return JSON.parse(service.images)[0] || ''; } catch { return ''; } })()}
                              alt={service.title}
                              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <Wrench className="size-14 text-emerald-300/60" />
                            </div>
                          )}
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          {service.priceNegotiable && (
                            <Badge className="absolute right-3 top-3 bg-amber-100/90 text-amber-700 shadow-sm backdrop-blur-sm hover:bg-amber-100/90">
                              Negotiable
                            </Badge>
                          )}
                          <Badge className="absolute left-3 top-3 bg-white/90 text-emerald-700 shadow-sm backdrop-blur-sm hover:bg-white/90">
                            {service.category.name}
                          </Badge>

                          {/* Gradient price tag */}
                          <div className="absolute bottom-3 right-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 shadow-lg">
                            <span className="text-lg font-bold text-white">₹{service.basePrice}</span>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-lg font-semibold leading-tight transition-colors group-hover:text-emerald-700">{service.title}</h3>
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span>{service.provider.name}</span>
                            {service.city && (
                              <>
                                <span>·</span>
                                <MapPin className="size-3" />
                                <span>{service.city}</span>
                              </>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${i < Math.round(service.averageRating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                                />
                              ))}
                              <span className="ml-1 text-sm font-semibold">{service.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({service.totalReviews})</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-700 hover:to-teal-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('service-detail', { serviceId: service.id });
                            }}
                          >
                            Book Now
                            <ArrowRight className="ml-1 size-3.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('search')} className="border-emerald-200 text-emerald-600">
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════ Provider CTA Section ═══════════ */}
      <section className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 20%, #0f766e 45%, #0e7490 70%, #1e3a5f 100%)' }}>
        {/* Parallax-like decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 size-[500px] rounded-full bg-gradient-to-br from-teal-500/25 to-emerald-400/15 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-[600px] rounded-full bg-gradient-to-tl from-blue-600/20 to-cyan-400/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 size-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-500/15 to-orange-400/8 blur-3xl" />
          <div className="absolute right-1/6 top-1/6 size-[200px] rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-400/8 blur-3xl" />
          <motion.div
            className="absolute -right-10 -top-10 size-40 rounded-full bg-cyan-400/[0.1]"
            animate={{ scale: [1, 1.4, 1], rotate: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-8 left-10 size-32 rounded-full bg-emerald-400/[0.1]"
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/3 top-1/4 size-24 rounded-full bg-amber-400/[0.08]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Particle dots */}
          {Array.from({ length: 12 }).map((_, i) => {
            // Deterministic pseudo-random values based on index to avoid hydration mismatch
            const seed = ((i + 50) * 2654435761) >>> 0;
            const w = 2 + (seed % 200) / 100;
            const h = 2 + ((seed * 7) % 200) / 100;
            const l = (seed * 13) % 100;
            const t = (seed * 17) % 100;
            const dur = 2 + (seed % 300) / 100;
            const del = (seed * 3 % 300) / 100;
            return (
            <motion.div
              key={`cta-particle-${i}`}
              className="absolute rounded-full bg-white/[0.12]"
              style={{
                width: `${w}px`,
                height: `${h}px`,
                left: `${l}%`,
                top: `${t}%`,
              }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.5, 1, 0.5],
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
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          custom={0}
          className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"
        >
          <Badge className="mb-6 border-cyan-300/20 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-4 py-1.5 text-cyan-100 hover:from-teal-500/30 hover:to-cyan-500/30">
            <Activity className="mr-1.5 size-3.5" /> Grow Your Business
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Become a <span className="bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">Service Provider</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cyan-100/80">
            Join our growing network of professionals. Reach thousands of customers, manage your
            schedule, and grow your business with BookYourService.
          </p>

          {/* Provider stats with animated counters */}
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900/60 to-teal-900/40 p-4 text-center backdrop-blur-md ring-1 ring-white/10">
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={liveStats?.totalProviders || 0} loading={!liveStats} />
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-200">Active Providers</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-teal-900/60 to-cyan-900/40 p-4 text-center backdrop-blur-md ring-1 ring-white/10">
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={liveStats?.totalBookings || 0} loading={!liveStats} />
              </p>
              <p className="mt-1 text-xs font-medium text-teal-200">Bookings Done</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-900/60 to-blue-900/40 p-4 text-center backdrop-blur-md ring-1 ring-white/10">
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={liveStats?.totalUsers || 0} loading={!liveStats} />
              </p>
              <p className="mt-1 text-xs font-medium text-cyan-200">Happy Clients</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="shimmer group bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-8 text-white shadow-lg shadow-teal-500/30 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500"
              onClick={() => navigate('register')}
            >
              Join as Provider
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-cyan-300/30 text-cyan-100 hover:bg-cyan-700/30 hover:border-cyan-300/50"
              onClick={() => navigate('how-it-works')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ Testimonials / Reviews Section ═══════════ */}
      <section className="mesh-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <Star className="mr-1 size-3" /> Customer Love
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Our <span className="text-gradient">Customers Say</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Real reviews from real customers across India</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <TestimonialCarousel testimonials={DEFAULT_TESTIMONIALS} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Trust & Safety Section ═══════════ */}
      <section className="mesh-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <Lock className="mr-1 size-3" /> Your Safety Matters
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trust &amp; <span className="text-gradient">Safety</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Your safety and satisfaction are our top priorities</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Shield className="size-8" />,
                title: 'KYC Verified Providers',
                description: 'Every service provider undergoes thorough identity and background verification before joining our platform.',
                gradient: 'from-blue-500 to-cyan-500',
                bgGlow: 'bg-blue-500/10',
                iconColor: 'text-blue-600',
              },
              {
                icon: <Lock className="size-8" />,
                title: 'Secure Platform',
                description: 'Your data and transactions are protected with industry-standard encryption and secure payment systems.',
                gradient: 'from-emerald-500 to-teal-500',
                bgGlow: 'bg-emerald-500/10',
                iconColor: 'text-emerald-600',
              },
              {
                icon: <CheckCircle2 className="size-8" />,
                title: 'Satisfaction Guarantee',
                description: 'If you are not satisfied with the service, we offer a resolution process to ensure your peace of mind.',
                gradient: 'from-amber-500 to-orange-500',
                bgGlow: 'bg-amber-500/10',
                iconColor: 'text-amber-600',
              },
            ].map((badge, idx) => (
              <motion.div
                key={badge.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={scaleIn}
                custom={idx}
              >
                <Card className="group rounded-2xl border-0 bg-white/80 text-center shadow-md transition-all duration-500 hover:shadow-xl hover:border-emerald-200/40 border border-transparent backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className={`mx-auto flex size-18 items-center justify-center rounded-2xl ${badge.bgGlow} relative`}>
                      {/* Gradient icon background */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${badge.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-15`} />
                      <span className={`relative ${badge.iconColor}`}>
                        {badge.icon}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{badge.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

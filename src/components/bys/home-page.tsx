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
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  Droplets: 'from-blue-500 to-cyan-500',
  Zap: 'from-amber-500 to-yellow-500',
  Wind: 'from-teal-500 to-emerald-500',
};

const CATEGORY_LIGHT_BG: Record<string, string> = {
  Droplets: 'bg-blue-50 text-blue-600',
  Zap: 'bg-amber-50 text-amber-600',
  Wind: 'bg-teal-50 text-teal-600',
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ value, loading }: { value: number; loading: boolean }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(value);

  useEffect(() => {
    if (loading) return;
    const start = ref.current;
    const end = value;
    const duration = 800;
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

  if (loading) return <Skeleton className="h-7 w-16" />;
  return <span>{display.toLocaleString()}</span>;
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
    <Card className="overflow-hidden rounded-xl">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-2 h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
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
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.15, duration: 0.4, ease: 'easeOut' },
    }),
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* ═══════════ Hero Section ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500">
        {/* Animated background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-20 -top-20 size-80 rounded-full bg-white/5"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-10 right-10 size-60 rounded-full bg-white/5"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/3 top-1/4 size-40 rounded-full bg-white/5"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <Badge className="mb-4 border-emerald-300/30 bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40">
                <Sparkles className="mr-1 size-3" /> Expert Home Services
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Expert Plumbing, Electrical &amp; AC Services{' '}
                <span className="text-emerald-200">at Your Doorstep</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-emerald-100/90">
                Book verified professionals for plumbing, electrical, and AC/HVAC services.
                Quality work, transparent pricing, and our satisfaction guarantee.
              </p>

              {/* Real-time visitor counter */}
              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-300" />
                </span>
                <span className="text-sm text-emerald-200">
                  <AnimatedCounter value={liveStats?.activeVisitors || 0} loading={!liveStats} />{' '}
                  {liveStats?.activeVisitors === 1 ? 'person' : 'people'} viewing right now
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  size="lg"
                  onClick={() => navigate('categories')}
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  Book a Service
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                {!user && (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('login')}
                      className="border-emerald-300/50 text-white hover:bg-emerald-600/50"
                    >
                      Client Login
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('register')}
                      className="border-emerald-300/50 text-white hover:bg-emerald-600/50"
                    >
                      Join as Provider
                    </Button>
                  </>
                )}
                {user && user.role === 'CLIENT' && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('client-dashboard')}
                    className="border-emerald-300/50 text-white hover:bg-emerald-600/50"
                  >
                    My Dashboard
                  </Button>
                )}
                {user && user.role === 'PROVIDER' && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('provider-dashboard')}
                    className="border-emerald-300/50 text-white hover:bg-emerald-600/50"
                  >
                    Provider Dashboard
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Hero visual - 3 floating service icons */}
            <motion.div
              className="hidden lg:flex lg:items-center lg:justify-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="relative flex size-80 items-center justify-center">
                {/* Central glow */}
                <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" />

                {/* Plumbing */}
                <motion.div
                  className="absolute -left-4 top-4 flex size-24 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Droplets className="size-10 text-blue-200" />
                </motion.div>

                {/* Electrical */}
                <motion.div
                  className="absolute right-0 top-8 flex size-24 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Zap className="size-10 text-yellow-200" />
                </motion.div>

                {/* AC & HVAC */}
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex size-24 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Wind className="size-10 text-teal-200" />
                </motion.div>

                {/* Center text */}
                <div className="rounded-2xl bg-white/15 px-6 py-4 text-center backdrop-blur-sm">
                  <p className="text-lg font-bold text-white">Your Home</p>
                  <p className="text-sm text-emerald-100">Our Expertise</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ Live Stats Bar ═══════════ */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {/* Active Visitors */}
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <Eye className="size-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-bold text-foreground">
                    <AnimatedCounter value={liveStats?.activeVisitors || 0} loading={!liveStats} />
                  </p>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Active Visitors</p>
              </div>
            </div>

            {/* Registered Clients */}
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Users className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  <AnimatedCounter value={liveStats?.totalUsers || 0} loading={!liveStats} />
                </p>
                <p className="text-xs text-muted-foreground">Registered Clients</p>
              </div>
            </div>

            {/* Verified Providers */}
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Shield className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  <AnimatedCounter value={liveStats?.totalProviders || 0} loading={!liveStats} />
                </p>
                <p className="text-xs text-muted-foreground">Verified Providers</p>
              </div>
            </div>

            {/* Services Available */}
            <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-100">
                <Wrench className="size-5 text-teal-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  <AnimatedCounter value={liveStats?.totalServices || 0} loading={!liveStats} />
                </p>
                <p className="text-xs text-muted-foreground">Services Available</p>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-3 col-span-2 sm:col-span-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <CalendarCheck className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  <AnimatedCounter value={liveStats?.totalBookings || 0} loading={!liveStats} />
                </p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Service Categories ═══════════ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Our Service Categories
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
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesLoading
                ? Array.from({ length: 3 }).map((_, i) => <CategorySkeleton key={i} />)
                : categories.map((cat, idx) => {
                    const iconEl = CATEGORY_ICON_MAP[cat.icon || ''] || <Sparkles className="size-8" />;
                    const gradientBg = CATEGORY_BG_MAP[cat.icon || ''] || 'from-emerald-500 to-teal-500';
                    const lightBg = CATEGORY_LIGHT_BG[cat.icon || ''] || 'bg-emerald-50 text-emerald-600';
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
                        <Card
                          className="group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                          onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                        >
                          {/* Gradient header */}
                          <div className={`bg-gradient-to-r ${gradientBg} px-6 py-5`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex size-14 items-center justify-center rounded-xl bg-white/20">
                                  <span className="text-white">{iconEl}</span>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                                  <p className="text-sm text-white/80">
                                    {cat.servicesCount} {cat.servicesCount === 1 ? 'service' : 'services'} available
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="size-5 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                            </div>
                          </div>

                          <CardContent className="p-6">
                            {cat.description && (
                              <p className="mb-4 text-sm text-muted-foreground">{cat.description}</p>
                            )}

                            {/* Subcategories */}
                            {subs.length > 0 ? (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Services Include
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {subs.slice(0, 10).map((sub) => (
                                    <Badge
                                      key={sub.id}
                                      variant="secondary"
                                      className={`text-xs ${lightBg} border-0`}
                                    >
                                      {sub.name}
                                    </Badge>
                                  ))}
                                  {subs.length > 10 && (
                                    <Badge variant="outline" className="text-xs">
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
                      </motion.div>
                    );
                  })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Getting started is simple and takes just a few minutes</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Search & Compare',
                description: 'Browse through our verified service providers across Plumbing, Electrical, and AC services. Read reviews and compare prices.',
                icon: <Search className="size-7" />,
              },
              {
                step: '2',
                title: 'Book & Schedule',
                description: 'Choose your preferred time slot, confirm your booking, and get instant confirmation from verified professionals.',
                icon: <CalendarCheck className="size-7" />,
              },
              {
                step: '3',
                title: 'Get It Done',
                description: 'A KYC-verified professional arrives on time, completes the work, and you leave a review for the community.',
                icon: <CheckCircle2 className="size-7" />,
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
                {idx < 2 && (
                  <div className="absolute right-0 top-10 hidden translate-x-1/2 sm:block">
                    <ArrowRight className="size-5 text-emerald-300" />
                  </div>
                )}
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-sm">
                  {item.icon}
                </div>
                <div className="mx-auto mt-4 flex size-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-md">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Featured Services ═══════════ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Services</h2>
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
                        className="group cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                        onClick={() => navigate('service-detail', { serviceId: service.id })}
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-emerald-50 to-teal-50">
                          {service.images ? (
                            <img
                              src={(() => { try { return JSON.parse(service.images)[0] || ''; } catch { return ''; } })()}
                              alt={service.title}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <Wrench className="size-12 text-emerald-300" />
                            </div>
                          )}
                          {service.priceNegotiable && (
                            <Badge className="absolute right-2 top-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                              Negotiable
                            </Badge>
                          )}
                          <Badge className="absolute left-2 top-2 bg-white/90 text-emerald-700 hover:bg-white/90">
                            {service.category.name}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold leading-tight group-hover:text-emerald-700">{service.title}</h3>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span>{service.provider.name}</span>
                            {service.city && (
                              <>
                                <span>·</span>
                                <MapPin className="size-3" />
                                <span>{service.city}</span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="size-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">{service.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({service.totalReviews})</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">₹{service.basePrice}</span>
                          </div>
                          <Button
                            size="sm"
                            className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('service-detail', { serviceId: service.id });
                            }}
                          >
                            Book Now
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
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -right-10 -top-10 size-40 rounded-full bg-white/5"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-8 left-10 size-32 rounded-full bg-white/5"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
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
          <Badge className="mb-4 border-emerald-300/30 bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40">
            <Activity className="mr-1 size-3" /> Grow Your Business
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Become a Service Provider
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-100">
            Join our growing network of professionals. Reach thousands of customers, manage your
            schedule, and grow your business with BookYourService.
          </p>

          {/* Provider stats */}
          <div className="mx-auto mt-6 flex max-w-md justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={liveStats?.totalProviders || 0} loading={!liveStats} />
              </p>
              <p className="text-xs text-emerald-200">Active Providers</p>
            </div>
            <div className="h-10 w-px bg-emerald-300/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={liveStats?.totalBookings || 0} loading={!liveStats} />
              </p>
              <p className="text-xs text-emerald-200">Bookings Completed</p>
            </div>
            <div className="h-10 w-px bg-emerald-300/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={liveStats?.totalUsers || 0} loading={!liveStats} />
              </p>
              <p className="text-xs text-emerald-200">Happy Clients</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50"
              onClick={() => navigate('register')}
            >
              Join as Provider
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-300 text-white hover:bg-emerald-700"
              onClick={() => navigate('how-it-works')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ Trust & Safety Section ═══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Trust &amp; Safety</h2>
            <p className="mt-3 text-muted-foreground">Your safety and satisfaction are our top priorities</p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Shield className="size-8" />,
                title: 'KYC Verified Providers',
                description: 'Every service provider undergoes thorough identity and background verification before joining our platform.',
                gradient: 'from-blue-500 to-indigo-500',
                lightBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                icon: <CheckCircle2 className="size-8" />,
                title: 'Secure Platform',
                description: 'Your data and transactions are protected with industry-standard encryption and secure payment systems.',
                gradient: 'from-emerald-500 to-teal-500',
                lightBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
              },
              {
                icon: <Star className="size-8" />,
                title: 'Satisfaction Guarantee',
                description: 'If you are not satisfied with the service, we offer a resolution process to ensure your peace of mind.',
                gradient: 'from-amber-500 to-orange-500',
                lightBg: 'bg-amber-50',
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
                <Card className="rounded-2xl text-center transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${badge.lightBg} ${badge.iconColor}`}>
                      {badge.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{badge.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
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

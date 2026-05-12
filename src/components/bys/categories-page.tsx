'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Wrench,
  Zap,
  Droplets,
  Wind,
  Sparkles,
  ChevronRight,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  Phone,
  Search,
  Star,
  TrendingUp,
  Globe,
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

// ─── Icon & Color Maps ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="size-8" />,
  Zap: <Zap className="size-8" />,
  Droplets: <Droplets className="size-8" />,
  Wind: <Wind className="size-8" />,
  ShieldCheck: <ShieldCheck className="size-8" />,
};

const CATEGORY_GRADIENTS: Record<string, {
  gradient: string;
  headerGradient: string;
  lightBg: string;
  lightText: string;
  glow: string;
  borderAccent: string;
  badgeBg: string;
  badgeText: string;
  hoverBg: string;
  ringColor: string;
  shadowGlow: string;
  heroGradient: string;
}> = {
  plumbing: {
    gradient: 'from-blue-500 to-cyan-500',
    headerGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    glow: 'shadow-blue-500/25',
    borderAccent: 'border-blue-200',
    badgeBg: 'bg-blue-100/80',
    badgeText: 'text-blue-700',
    hoverBg: 'hover:bg-blue-50',
    ringColor: 'ring-blue-500/30',
    shadowGlow: 'shadow-blue-500/15',
    heroGradient: 'from-blue-600 via-blue-500 to-cyan-400',
  },
  electrical: {
    gradient: 'from-amber-500 to-yellow-500',
    headerGradient: 'from-amber-700 via-amber-600 to-yellow-500',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    glow: 'shadow-amber-500/25',
    borderAccent: 'border-amber-200',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-700',
    hoverBg: 'hover:bg-amber-50',
    ringColor: 'ring-amber-500/30',
    shadowGlow: 'shadow-amber-500/15',
    heroGradient: 'from-amber-600 via-amber-500 to-yellow-400',
  },
  'ac-hvac': {
    gradient: 'from-teal-500 to-emerald-500',
    headerGradient: 'from-teal-700 via-teal-600 to-emerald-500',
    lightBg: 'bg-teal-50',
    lightText: 'text-teal-700',
    glow: 'shadow-teal-500/25',
    borderAccent: 'border-teal-200',
    badgeBg: 'bg-teal-100/80',
    badgeText: 'text-teal-700',
    hoverBg: 'hover:bg-teal-50',
    ringColor: 'ring-teal-500/30',
    shadowGlow: 'shadow-teal-500/15',
    heroGradient: 'from-teal-600 via-teal-500 to-emerald-400',
  },
};

const DEFAULT_GRADIENT = {
  gradient: 'from-emerald-500 to-teal-500',
  headerGradient: 'from-emerald-700 via-emerald-600 to-teal-500',
  lightBg: 'bg-emerald-50',
  lightText: 'text-emerald-700',
  glow: 'shadow-emerald-500/25',
  borderAccent: 'border-emerald-200',
  badgeBg: 'bg-emerald-100/80',
  badgeText: 'text-emerald-700',
  hoverBg: 'hover:bg-emerald-50',
  ringColor: 'ring-emerald-500/30',
  shadowGlow: 'shadow-emerald-500/15',
  heroGradient: 'from-emerald-600 via-emerald-500 to-teal-400',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-8" />;
}

function getCategoryGradient(slug?: string) {
  if (slug && CATEGORY_GRADIENTS[slug]) return CATEGORY_GRADIENTS[slug];
  return DEFAULT_GRADIENT;
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
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
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

// ─── Rotating Words ───────────────────────────────────────────────────────────

function RotatingWords({ words }: { words: string[] }) {
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
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-block text-gradient"
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(value);

  useEffect(() => {
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
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

// ─── Skeleton Component ───────────────────────────────────────────────────────

function CategorySkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
      <Skeleton className="h-36 w-full" />
      <CardContent className="p-6">
        <Skeleton className="mb-3 size-14 rounded-2xl" />
        <Skeleton className="mb-2 h-6 w-32" />
        <Skeleton className="mb-4 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-3/4" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Motion Variants ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function CategoriesPage() {
  const { navigate } = useApp();
  const { data: categoriesData, loading, error, refetch } = useApi<Category[]>('/api/categories');
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Fetch subcategories for preview
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, Subcategory[]>>({});

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

  // Total stats
  const totalServices = categories.reduce((acc, cat) => acc + cat.servicesCount, 0);
  const totalSubcategories = categories.reduce((acc, cat) => acc + cat.subcategoriesCount, 0);

  return (
    <div className="flex flex-col">
      {/* ═══════════ Hero Header ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-800 to-cyan-700">
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Category-colored orbs */}
          <motion.div
            className="absolute -left-40 -top-40 size-[600px] rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-400/15 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 size-[500px] rounded-full bg-gradient-to-tl from-cyan-400/25 to-teal-300/15 blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/3 size-[300px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-400/20 to-cyan-300/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Floating shapes */}
          <motion.div
            className="absolute -left-20 -top-20 size-80 rounded-full bg-white/[0.04]"
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-10 right-10 size-60 rounded-full bg-white/[0.04]"
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/4 top-1/4 size-40 rounded-full bg-white/[0.04]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Breadcrumb className="mb-8">
              <BreadcrumbList className="text-emerald-200/70">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate('home')}
                    className="cursor-pointer text-emerald-200/70 hover:text-white"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-emerald-300/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">Services</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Badge className="mb-5 border-emerald-300/20 bg-emerald-500/20 px-4 py-1.5 text-emerald-100 hover:bg-emerald-500/30">
                <Sparkles className="mr-1.5 size-3.5" /> Professional Home Services
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Expert{' '}
              <RotatingWords words={['Plumbing', 'Electrical', 'AC & HVAC']} />
              <br />
              <span className="text-gradient">at Your Doorstep</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-emerald-100/80"
            >
              Book verified professionals for plumbing, electrical, and AC/HVAC services.
              Quality work, transparent pricing, and our satisfaction guarantee.
            </motion.p>

            {/* Stats row in hero */}
            {!loading && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mx-auto mt-8 flex max-w-md items-center justify-center gap-6 sm:gap-10"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={categories.length} />
                  </p>
                  <p className="text-xs font-medium text-emerald-200/70">Categories</p>
                </div>
                <div className="size-px h-10 bg-emerald-400/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={totalSubcategories} />
                  </p>
                  <p className="text-xs font-medium text-emerald-200/70">Specializations</p>
                </div>
                <div className="size-px h-10 bg-emerald-400/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={totalServices} />
                  </p>
                  <p className="text-xs font-medium text-emerald-200/70">Services</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 70 480 10 720 40C960 70 1200 10 1440 40V80H0Z" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
      </section>

      {/* ═══════════ Trust Badges ═══════════ */}
      <section className="relative z-10 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { icon: <ShieldCheck className="size-5" />, label: 'Verified Providers', gradient: 'from-emerald-700 to-teal-600' },
              { icon: <Clock className="size-5" />, label: 'On-Time Service', gradient: 'from-blue-700 to-cyan-600' },
              { icon: <Users className="size-5" />, label: 'Trusted by Thousands', gradient: 'from-amber-600 to-amber-400' },
              { icon: <CheckCircle2 className="size-5" />, label: 'Satisfaction Guaranteed', gradient: 'from-rose-600 to-pink-500' },
            ].map((badge) => (
              <motion.div
                key={badge.label}
                variants={fadeUp}
                custom={0}
                className="group flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <div className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${badge.gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                  {badge.icon}
                </div>
                <span>{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Categories Grid ═══════════ */}
      <section className="mesh-bg py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-16 text-center shadow-lg"
            >
              <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-rose-50">
                <FolderOpen className="size-12 text-red-300" />
              </div>
              <p className="text-xl font-bold text-foreground">Failed to load categories</p>
              <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
              <Button
                variant="outline"
                size="lg"
                onClick={refetch}
                className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Retry
              </Button>
            </motion.div>
          )}

          {/* Category Cards */}
          {!error && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <CategorySkeleton key={i} />)
                : categories.map((cat, idx) => {
                    const colors = getCategoryGradient(cat.slug);
                    const iconEl = getCategoryIcon(cat.icon);
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
                            className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-500 hover:shadow-2xl"
                            onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                          >
                            {/* Gradient header with icon */}
                            <div className={`relative bg-gradient-to-r ${colors.headerGradient} px-6 py-8`}>
                              {/* Decorative dot pattern */}
                              <div className="pointer-events-none absolute inset-0 opacity-10">
                                <div
                                  className="size-full"
                                  style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                  }}
                                />
                              </div>

                              {/* Floating decorative circle */}
                              <div className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-white/[0.07]" />
                              <div className="pointer-events-none absolute -bottom-4 -left-4 size-20 rounded-full bg-white/[0.05]" />

                              <div className="relative flex items-center gap-4">
                                {/* Animated icon with float */}
                                <motion.div
                                  className={`flex size-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg ${colors.glow} backdrop-blur-sm`}
                                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <span className="text-white float-animation">{iconEl}</span>
                                </motion.div>

                                <div className="flex-1">
                                  <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                                  <p className="mt-0.5 text-sm text-white/80">
                                    {cat.subcategoriesCount} subcategories
                                  </p>
                                </div>

                                {/* Service count badge */}
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className="rounded-full border-0 bg-white/25 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                                    {cat.servicesCount} {cat.servicesCount === 1 ? 'Service' : 'Services'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <CardContent className="relative p-6">
                              {/* Description */}
                              {cat.description && (
                                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                  {cat.description}
                                </p>
                              )}

                              {/* Subcategory pills preview */}
                              {subs.length > 0 ? (
                                <div>
                                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Sparkles className="size-3" /> Popular Services
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {subs.slice(0, 5).map((sub) => (
                                      <Badge
                                        key={sub.id}
                                        variant="secondary"
                                        className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${colors.lightBg} ${colors.lightText} transition-all duration-200 hover:scale-105 hover:shadow-sm`}
                                      >
                                        {sub.name}
                                      </Badge>
                                    ))}
                                    {subs.length > 5 && (
                                      <Badge
                                        variant="outline"
                                        className={`rounded-full px-3 py-1 text-xs ${colors.borderAccent}`}
                                      >
                                        +{subs.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                                  ))}
                                </div>
                              )}

                              {/* CTA */}
                              <div className="mt-5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-all group-hover:gap-3">
                                  Explore Services
                                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </div>
                                <div className={`flex items-center gap-1.5 rounded-full ${colors.badgeBg} px-3 py-1`}>
                                  <Star className={`size-3 fill-current ${colors.badgeText}`} />
                                  <span className={`text-xs font-semibold ${colors.badgeText}`}>Top Rated</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TiltCard>
                      </motion.div>
                    );
                  })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && categories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white p-16 text-center shadow-lg"
            >
              {/* Illustration-style empty state */}
              <div className="relative mx-auto mb-6 size-32">
                <div className="absolute inset-0 rounded-full bg-emerald-50" />
                <div className="absolute inset-4 rounded-full bg-emerald-100/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="size-14 text-emerald-300" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -right-2 top-2 size-3 rounded-full bg-amber-300" />
                <div className="absolute -left-1 bottom-4 size-2 rounded-full bg-blue-300" />
                <div className="absolute right-4 -bottom-1 size-2.5 rounded-full bg-teal-300" />
              </div>
              <p className="text-xl font-bold text-foreground">No categories available yet</p>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                We&apos;re working hard to bring you amazing services. Please check back soon!
              </p>
              <Button
                className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => navigate('home')}
              >
                Back to Home
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════ Why Choose Us Section ═══════════ */}
      {!loading && !error && categories.length > 0 && (
        <section className="mesh-bg py-16">
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
                <ShieldCheck className="mr-1 size-3" /> Why Choose Us
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The <span className="text-gradient">BookYourService</span> Advantage
              </h2>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck className="size-6" />,
                  title: 'KYC Verified Providers',
                  desc: 'Every professional on our platform is background-verified and KYC approved for your safety.',
                  gradient: 'from-emerald-700 to-teal-600',
                  bg: 'bg-emerald-50',
                },
                {
                  icon: <TrendingUp className="size-6" />,
                  title: 'Transparent Pricing',
                  desc: 'No hidden charges. See exact pricing upfront before you book any service.',
                  gradient: 'from-blue-700 to-cyan-600',
                  bg: 'bg-blue-50',
                },
                {
                  icon: <Clock className="size-6" />,
                  title: 'On-Time Guarantee',
                  desc: 'Our professionals arrive on time or we compensate you for the delay.',
                  gradient: 'from-amber-600 to-amber-400',
                  bg: 'bg-amber-50',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-20px' }}
                  variants={scaleIn}
                  custom={idx}
                  className="group"
                >
                  <div className="glass rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className={`mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      {item.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ CTA Section (Glassmorphism) ═══════════ */}
      {!loading && !error && categories.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-16">
          {/* Background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-0 size-[400px] rounded-full bg-emerald-100/40 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 size-[400px] rounded-full bg-teal-100/40 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-50/30 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl"
            >
              {/* Gradient border wrapper */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 p-[2px]">
                <div className="size-full rounded-3xl bg-white" />
              </div>

              <div className="relative glass-emerald rounded-3xl px-8 py-12 text-center sm:px-16 sm:py-16">
                {/* Decorative gradient orbs inside */}
                <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-teal-200/30 blur-3xl" />

                <div className="relative">
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                    <Phone className="size-7" />
                  </div>
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Need a <span className="text-gradient">Custom Service</span>?
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                    Can&apos;t find what you&apos;re looking for? Contact us and we&apos;ll connect you with the right professional for your needs.
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button
                      className="shimmer bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
                      size="lg"
                      onClick={() => navigate('contact')}
                    >
                      Contact Us
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => navigate('home')}
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

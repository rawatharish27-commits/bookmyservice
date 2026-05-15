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
  Snowflake,
  Tv,
  Flame,
  Truck,
  Droplet,
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

// ─── Icon & Color Maps ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="size-8" />,
  Zap: <Zap className="size-8" />,
  Droplets: <Droplets className="size-8" />,
  Wind: <Wind className="size-8" />,
  ShieldCheck: <ShieldCheck className="size-8" />,
  Snowflake: <Snowflake className="size-8" />,
  Tv: <Tv className="size-8" />,
  Flame: <Flame className="size-8" />,
  Truck: <Truck className="size-8" />,
  Droplet: <Droplet className="size-8" />,
  Plug: <Zap className="size-8" />,
  Globe: <Globe className="size-8" />,
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
  'air-conditioner': {
    gradient: 'from-sky-500 to-blue-500',
    headerGradient: 'from-sky-600 via-blue-500 to-cyan-400',
    lightBg: 'bg-sky-50',
    lightText: 'text-sky-700',
    glow: 'shadow-sky-500/25',
    borderAccent: 'border-sky-200',
    badgeBg: 'bg-sky-100/80',
    badgeText: 'text-sky-700',
    hoverBg: 'hover:bg-sky-50',
    ringColor: 'ring-sky-500/30',
    shadowGlow: 'shadow-sky-500/15',
    heroGradient: 'from-sky-600 via-blue-500 to-cyan-400',
  },
  'refrigerator': {
    gradient: 'from-cyan-500 to-blue-400',
    headerGradient: 'from-cyan-600 via-sky-500 to-blue-400',
    lightBg: 'bg-cyan-50',
    lightText: 'text-cyan-700',
    glow: 'shadow-cyan-500/25',
    borderAccent: 'border-cyan-200',
    badgeBg: 'bg-cyan-100/80',
    badgeText: 'text-cyan-700',
    hoverBg: 'hover:bg-cyan-50',
    ringColor: 'ring-cyan-500/30',
    shadowGlow: 'shadow-cyan-500/15',
    heroGradient: 'from-cyan-600 via-sky-500 to-blue-400',
  },
  'washing-machine': {
    gradient: 'from-indigo-500 to-purple-400',
    headerGradient: 'from-indigo-600 via-violet-500 to-purple-400',
    lightBg: 'bg-indigo-50',
    lightText: 'text-indigo-700',
    glow: 'shadow-indigo-500/25',
    borderAccent: 'border-indigo-200',
    badgeBg: 'bg-indigo-100/80',
    badgeText: 'text-indigo-700',
    hoverBg: 'hover:bg-indigo-50',
    ringColor: 'ring-indigo-500/30',
    shadowGlow: 'shadow-indigo-500/15',
    heroGradient: 'from-indigo-600 via-violet-500 to-purple-400',
  },
  'kitchen-appliances': {
    gradient: 'from-amber-500 to-yellow-400',
    headerGradient: 'from-amber-600 via-orange-500 to-yellow-400',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    glow: 'shadow-amber-500/25',
    borderAccent: 'border-amber-200',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-700',
    hoverBg: 'hover:bg-amber-50',
    ringColor: 'ring-amber-500/30',
    shadowGlow: 'shadow-amber-500/15',
    heroGradient: 'from-amber-600 via-orange-500 to-yellow-400',
  },
  'tv-repair': {
    gradient: 'from-purple-500 to-fuchsia-400',
    headerGradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-700',
    glow: 'shadow-purple-500/25',
    borderAccent: 'border-purple-200',
    badgeBg: 'bg-purple-100/80',
    badgeText: 'text-purple-700',
    hoverBg: 'hover:bg-purple-50',
    ringColor: 'ring-purple-500/30',
    shadowGlow: 'shadow-purple-500/15',
    heroGradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
  },
  'water-purifier': {
    gradient: 'from-blue-500 to-sky-400',
    headerGradient: 'from-blue-600 via-cyan-500 to-sky-400',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    glow: 'shadow-blue-500/25',
    borderAccent: 'border-blue-200',
    badgeBg: 'bg-blue-100/80',
    badgeText: 'text-blue-700',
    hoverBg: 'hover:bg-blue-50',
    ringColor: 'ring-blue-500/30',
    shadowGlow: 'shadow-blue-500/15',
    heroGradient: 'from-blue-600 via-cyan-500 to-sky-400',
  },
  'geyser': {
    gradient: 'from-red-500 to-amber-400',
    headerGradient: 'from-red-600 via-orange-500 to-amber-400',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    glow: 'shadow-red-500/25',
    borderAccent: 'border-red-200',
    badgeBg: 'bg-red-100/80',
    badgeText: 'text-red-700',
    hoverBg: 'hover:bg-red-50',
    ringColor: 'ring-red-500/30',
    shadowGlow: 'shadow-red-500/15',
    heroGradient: 'from-red-600 via-orange-500 to-amber-400',
  },
  'plumber': {
    gradient: 'from-[#1e3a5f] to-[#3b82f6]',
    headerGradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
    lightBg: 'bg-blue-50',
    lightText: 'text-[#1e3a5f]',
    glow: 'shadow-[#1e3a5f]/25',
    borderAccent: 'border-[#2d5a8e]/30',
    badgeBg: 'bg-[#1e3a5f]/10',
    badgeText: 'text-[#1e3a5f]',
    hoverBg: 'hover:bg-blue-50',
    ringColor: 'ring-[#2d5a8e]/30',
    shadowGlow: 'shadow-[#1e3a5f]/15',
    heroGradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
  },
  'electrician': {
    gradient: 'from-amber-500 to-orange-400',
    headerGradient: 'from-amber-600 via-yellow-500 to-orange-400',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    glow: 'shadow-amber-500/25',
    borderAccent: 'border-amber-200',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-700',
    hoverBg: 'hover:bg-amber-50',
    ringColor: 'ring-amber-500/30',
    shadowGlow: 'shadow-amber-500/15',
    heroGradient: 'from-amber-600 via-yellow-500 to-orange-400',
  },
  'water-tank-cleaning': {
    gradient: 'from-teal-500 to-sky-400',
    headerGradient: 'from-teal-600 via-cyan-500 to-sky-400',
    lightBg: 'bg-teal-50',
    lightText: 'text-teal-700',
    glow: 'shadow-teal-500/25',
    borderAccent: 'border-teal-200',
    badgeBg: 'bg-teal-100/80',
    badgeText: 'text-teal-700',
    hoverBg: 'hover:bg-teal-50',
    ringColor: 'ring-teal-500/30',
    shadowGlow: 'shadow-teal-500/15',
    heroGradient: 'from-teal-600 via-cyan-500 to-sky-400',
  },
  'movers-and-packers': {
    gradient: 'from-slate-500 to-zinc-400',
    headerGradient: 'from-slate-600 via-gray-500 to-zinc-400',
    lightBg: 'bg-slate-50',
    lightText: 'text-slate-700',
    glow: 'shadow-slate-500/25',
    borderAccent: 'border-slate-200',
    badgeBg: 'bg-slate-100/80',
    badgeText: 'text-slate-700',
    hoverBg: 'hover:bg-slate-50',
    ringColor: 'ring-slate-500/30',
    shadowGlow: 'shadow-slate-500/15',
    heroGradient: 'from-slate-600 via-gray-500 to-zinc-400',
  },
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'air-conditioner': '/images/hvac.jpg',
  'refrigerator': '/images/plumbing.jpg',
  'washing-machine': '/images/plumbing.jpg',
  'kitchen-appliances': '/images/plumbing.jpg',
  'tv-repair': '/images/electrical.jpg',
  'water-purifier': '/images/plumbing.jpg',
  'geyser': '/images/plumbing.jpg',
  'plumber': '/images/plumbing.jpg',
  'electrician': '/images/electrical.jpg',
  'water-tank-cleaning': '/images/plumbing.jpg',
  'movers-and-packers': '/images/plumbing.jpg',
};

const DEFAULT_GRADIENT = {
  gradient: 'from-[#1e3a5f] to-[#3b82f6]',
  headerGradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
  lightBg: 'bg-blue-50',
  lightText: 'text-[#1e3a5f]',
  glow: 'shadow-[#1e3a5f]/25',
  borderAccent: 'border-[#2d5a8e]/30',
  badgeBg: 'bg-[#1e3a5f]/10',
  badgeText: 'text-[#1e3a5f]',
  hoverBg: 'hover:bg-blue-50',
  ringColor: 'ring-[#2d5a8e]/30',
  shadowGlow: 'shadow-[#1e3a5f]/15',
  heroGradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
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
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
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
        initial={{ y: 24, opacity: 0, rotateX: -40 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        exit={{ y: -24, opacity: 0, rotateX: 40 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
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
    const duration = 1400;
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
    <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
      <Skeleton className="h-[200px] w-full rounded-none" />
      <CardContent className="p-6">
        <div className="-mt-14 mb-4">
          <Skeleton className="size-[4.5rem] rounded-2xl" />
        </div>
        <Skeleton className="mb-2 h-7 w-36" />
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-3/4" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-20 rounded-full" />
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
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
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
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function CategoriesPage() {
  const { navigate } = useApp();
  const { data: categoriesData, loading, error, refetch } = useApi<{ categories: Category[]; total: number }>('/api/categories');
  const categories = categoriesData?.categories || [];

  // Fetch subcategories for preview
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, Subcategory[]>>({});

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
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 25%, #2d5a8e 50%, #3b82f6 75%, #0ea5e9 100%)' }}>
        {/* Mesh gradient background with animated orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Primary large orbs */}
          <motion.div
            className="absolute -left-32 -top-32 size-[700px] rounded-full bg-gradient-to-br from-cyan-400/25 to-blue-400/10 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 -right-24 size-[600px] rounded-full bg-gradient-to-tl from-blue-400/25 to-sky-300/10 blur-3xl"
            animate={{ x: [0, -35, 0], y: [0, 25, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/3 top-1/4 size-[400px] rounded-full bg-gradient-to-br from-amber-400/15 to-cyan-300/8 blur-3xl"
            animate={{ scale: [1, 1.25, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Secondary smaller orbs */}
          <motion.div
            className="absolute right-1/4 top-1/3 size-[250px] rounded-full bg-gradient-to-bl from-sky-300/20 to-transparent blur-3xl"
            animate={{ y: [0, -40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 size-[200px] rounded-full bg-gradient-to-tr from-cyan-200/15 to-transparent blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Floating translucent shapes */}
          <motion.div
            className="absolute -left-16 -top-16 size-96 rounded-full bg-white/[0.03]"
            animate={{ x: [0, 50, 0], y: [0, -35, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-8 right-8 size-72 rounded-full bg-white/[0.03]"
            animate={{ x: [0, -35, 0], y: [0, 35, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/3 top-1/3 size-48 rounded-full bg-white/[0.03]"
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Dot grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Diagonal line accent */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Breadcrumb>
              <BreadcrumbList className="text-blue-200/70">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate('home')}
                    className="cursor-pointer text-blue-200/70 transition-colors duration-200 hover:text-white"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-blue-300/30" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-white">Services</BreadcrumbPage>
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
              <Badge className="mb-6 border-blue-300/20 bg-blue-400/15 px-5 py-2 text-sm font-medium text-blue-100 backdrop-blur-sm hover:bg-blue-400/25">
                <Sparkles className="mr-2 size-4" /> Professional Home Services
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Expert{' '}
              <RotatingWords words={['AC & Cooling', 'Plumbing', 'Electrical', 'Appliances', 'Moving']} />
              <br />
              <span className="text-gradient">at Your Doorstep</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/75 sm:text-xl"
            >
              Book verified professionals for AC, plumbing, electrical, appliances, and more.
              Quality work, transparent pricing, and our satisfaction guarantee.
            </motion.p>

            {/* Stats row in hero */}
            {!loading && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mx-auto mt-10"
              >
                <div className="inline-flex items-center gap-0 rounded-2xl border border-blue-400/15 bg-[#1e3a5f]/40 backdrop-blur-xl">
                  <div className="px-8 py-4 text-center sm:px-10">
                    <p className="text-3xl font-bold text-white sm:text-4xl">
                      <AnimatedCounter value={categories.length} />
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-200/60">Categories</p>
                  </div>
                  <div className="size-px h-12 bg-gradient-to-b from-transparent via-blue-400/25 to-transparent" />
                  <div className="px-8 py-4 text-center sm:px-10">
                    <p className="text-3xl font-bold text-white sm:text-4xl">
                      <AnimatedCounter value={totalSubcategories} />
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-200/60">Specializations</p>
                  </div>
                  <div className="size-px h-12 bg-gradient-to-b from-transparent via-blue-400/25 to-transparent" />
                  <div className="px-8 py-4 text-center sm:px-10">
                    <p className="text-3xl font-bold text-white sm:text-4xl">
                      <AnimatedCounter value={totalServices} />
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-200/60">Services</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V50C240 80 480 15 720 50C960 85 1200 20 1440 50V100H0Z" fill="white" fillOpacity="0.97" />
          </svg>
        </div>
      </section>

      {/* ═══════════ Trust Badges ═══════════ */}
      <section className="relative z-10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { icon: <ShieldCheck className="size-5" />, label: 'Verified Providers', gradient: 'from-[#1e3a5f] to-[#2d5a8e]' },
              { icon: <Clock className="size-5" />, label: 'On-Time Service', gradient: 'from-blue-600 to-cyan-500' },
              { icon: <Users className="size-5" />, label: 'Trusted by Thousands', gradient: 'from-amber-500 to-amber-400' },
              { icon: <CheckCircle2 className="size-5" />, label: 'Satisfaction Guaranteed', gradient: 'from-rose-500 to-pink-400' },
            ].map((badge) => (
              <motion.div
                key={badge.label}
                variants={staggerItem}
                className="group flex items-center gap-3 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${badge.gradient} text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  {badge.icon}
                </div>
                <span className="text-balance">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Categories Grid ═══════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            custom={0}
            className="mb-14 text-center"
          >
            <Badge className="mb-4 border-blue-200 bg-blue-50 text-[#1e3a5f] hover:bg-blue-100">
              <Sparkles className="mr-1.5 size-3.5" /> Browse Categories
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Explore Our <span className="text-gradient">Service Categories</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Choose from our wide range of professional home services, each with verified experts and transparent pricing.
            </p>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-16 text-center shadow-xl"
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
                className="mt-6 border-blue-200 text-[#1e3a5f] hover:bg-blue-50"
              >
                Retry
              </Button>
            </motion.div>
          )}

          {/* Category Cards */}
          {!error && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
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
                            className="group cursor-pointer overflow-hidden rounded-3xl border-0 shadow-xl transition-all duration-500 hover:shadow-2xl"
                            onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                          >
                            {/* Category image header with gradient overlay */}
                            <div className={`relative overflow-hidden bg-gradient-to-r ${colors.headerGradient}`}>
                              {/* Background image */}
                              <img
                                src={CATEGORY_IMAGE_MAP[cat.slug || ''] || '/images/plumbing.jpg'}
                                alt={cat.name}
                                className="size-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-110"
                                style={{ minHeight: '200px', maxHeight: '220px' }}
                              />
                              {/* Multi-layer gradient overlays */}
                              <div className={`absolute inset-0 bg-gradient-to-r ${colors.headerGradient} opacity-75`} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />

                              {/* Decorative dot pattern */}
                              <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
                                <div
                                  className="size-full"
                                  style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                  }}
                                />
                              </div>

                              {/* Floating decorative circles */}
                              <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/[0.06]" />
                              <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-white/[0.04]" />
                              <div className="pointer-events-none absolute bottom-1/4 right-1/4 size-16 rounded-full bg-white/[0.05]" />

                              {/* Decorative ring */}
                              <div className="pointer-events-none absolute -right-12 bottom-0 size-32 rounded-full border-[3px] border-white/[0.06]" />

                              <div className="relative px-7 pt-10 pb-8">
                                <div className="relative flex items-start gap-4">
                                  {/* Animated icon with backdrop-blur */}
                                  <motion.div
                                    className={`flex size-[4.5rem] items-center justify-center rounded-2xl bg-white/20 shadow-lg ${colors.glow} backdrop-blur-xl ring-1 ring-white/10`}
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <span className="text-white float-animation">{iconEl}</span>
                                  </motion.div>

                                  <div className="flex-1 pt-1">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-sm">{cat.name}</h3>
                                    <p className="mt-1 text-sm font-medium text-white/75">
                                      {cat.subcategoriesCount} subcategories
                                    </p>
                                  </div>

                                  {/* Services count badge */}
                                  <div className="flex flex-col items-end gap-2 pt-1">
                                    <Badge className="rounded-full border-0 bg-white/25 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm ring-1 ring-white/10">
                                      {cat.servicesCount} {cat.servicesCount === 1 ? 'Service' : 'Services'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <CardContent className="relative p-7">
                              {/* Description */}
                              {cat.description && (
                                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                                  {cat.description}
                                </p>
                              )}

                              {/* Subcategory pills preview */}
                              {subs.length > 0 ? (
                                <div>
                                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Sparkles className="size-3.5" /> Popular Services
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {subs.slice(0, 5).map((sub) => (
                                      <Badge
                                        key={sub.id}
                                        variant="secondary"
                                        className={`rounded-full border-0 px-3.5 py-1.5 text-xs font-medium ${colors.lightBg} ${colors.lightText} transition-all duration-200 hover:scale-105 hover:shadow-sm`}
                                      >
                                        {sub.name}
                                      </Badge>
                                    ))}
                                    {subs.length > 5 && (
                                      <Badge
                                        variant="outline"
                                        className={`rounded-full px-3.5 py-1.5 text-xs ${colors.borderAccent}`}
                                      >
                                        +{subs.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                                  ))}
                                </div>
                              )}

                              {/* CTA Row */}
                              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f] transition-all duration-300 group-hover:gap-3 group-hover:text-[#2d5a8e]">
                                  Explore Services
                                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                                <div className={`flex items-center gap-1.5 rounded-full ${colors.badgeBg} px-3 py-1.5`}>
                                  <Star className={`size-3.5 fill-current ${colors.badgeText}`} />
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
              className="rounded-3xl bg-white p-16 text-center shadow-xl"
            >
              {/* Illustration-style empty state */}
              <div className="relative mx-auto mb-6 size-36">
                <div className="absolute inset-0 rounded-full bg-blue-50" />
                <div className="absolute inset-4 rounded-full bg-blue-100/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="size-14 text-blue-300" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -right-2 top-2 size-3 rounded-full bg-amber-300" />
                <div className="absolute -left-1 bottom-4 size-2 rounded-full bg-sky-300" />
                <div className="absolute right-4 -bottom-1 size-2.5 rounded-full bg-cyan-300" />
              </div>
              <p className="text-xl font-bold text-foreground">No categories available yet</p>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                We&apos;re working hard to bring you amazing services. Please check back soon!
              </p>
              <Button
                className="mt-6 bg-[#1e3a5f] text-white hover:bg-[#2d5a8e]"
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
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50/80 to-white py-20">
          {/* Background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-0 size-[500px] rounded-full bg-blue-50/60 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 size-[500px] rounded-full bg-sky-50/60 blur-3xl" />
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
              <Badge className="mb-5 border-blue-200 bg-blue-50 text-[#1e3a5f] hover:bg-blue-100">
                <ShieldCheck className="mr-1.5 size-3.5" /> Why Choose Us
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The <span className="text-gradient">BookYourService</span> Advantage
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                We go above and beyond to ensure every service experience exceeds your expectations.
              </p>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck className="size-7" />,
                  title: 'KYC Verified Providers',
                  desc: 'Every professional on our platform is background-verified and KYC approved for your safety and peace of mind.',
                  gradient: 'from-[#1e3a5f] to-[#2d5a8e]',
                  bg: 'bg-blue-50',
                  shadow: 'shadow-[#1e3a5f]/20',
                },
                {
                  icon: <TrendingUp className="size-7" />,
                  title: 'Transparent Pricing',
                  desc: 'No hidden charges or surprise fees. See exact pricing upfront before you book any service with complete clarity.',
                  gradient: 'from-blue-600 to-cyan-500',
                  bg: 'bg-sky-50',
                  shadow: 'shadow-blue-500/20',
                },
                {
                  icon: <Clock className="size-7" />,
                  title: 'On-Time Guarantee',
                  desc: 'Our professionals arrive on time or we compensate you for the delay. Your time is valuable and we respect it.',
                  gradient: 'from-amber-500 to-amber-400',
                  bg: 'bg-amber-50',
                  shadow: 'shadow-amber-500/20',
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
                  <div className="card-premium relative h-full overflow-hidden rounded-3xl p-8">
                    {/* Decorative corner gradient */}
                    <div className={`pointer-events-none absolute -right-8 -top-8 size-32 rounded-full ${item.bg} opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />

                    <div className="relative">
                      <div className={`mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg ${item.shadow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                        {item.icon}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                      <p className="leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ CTA Section (Glassmorphism) ═══════════ */}
      {!loading && !error && categories.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 py-20">
          {/* Background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-0 size-[500px] rounded-full bg-blue-100/50 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-sky-100/50 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-50/30 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-3xl"
            >
              {/* Gradient border wrapper */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6] p-[2px]">
                <div className="size-full rounded-3xl bg-white" />
              </div>

              <div className="relative glass-navy rounded-3xl px-8 py-14 text-center sm:px-16 sm:py-20">
                {/* Decorative gradient orbs inside */}
                <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-blue-200/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 size-52 rounded-full bg-sky-200/30 blur-3xl" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/20 blur-3xl" />

                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mb-8 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-white shadow-xl shadow-[#1e3a5f]/30"
                  >
                    <Phone className="size-8" />
                  </motion.div>

                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Need a <span className="text-gradient">Custom Service</span>?
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
                    Can&apos;t find what you&apos;re looking for? Contact us and we&apos;ll connect you with the right professional for your needs.
                  </p>
                  <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Button
                      className="shimmer bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-10 py-6 text-lg font-semibold text-white shadow-xl shadow-[#1e3a5f]/25 hover:from-[#2d5a8e] hover:to-[#3b82f6]"
                      size="lg"
                      onClick={() => navigate('contact')}
                    >
                      Contact Us
                      <ChevronRight className="ml-2 size-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-blue-200 px-8 py-6 text-lg font-semibold text-[#1e3a5f] hover:bg-blue-50"
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

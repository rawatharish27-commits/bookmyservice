'use client';

import React, { useState, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Star,
  MapPin,
  Wrench,
  FolderOpen,
  ChevronRight,
  Sparkles,
  Zap,
  Paintbrush,
  Droplets,
  Plug,
  Hammer,
  Scissors,
  Wind,
  ShieldCheck,
  Home as HomeIcon,
  Building,
  TreePine,
  Snowflake,
  Tv,
  Flame,
  Truck,
  Droplet,
  Layers,
  TrendingUp,
  Phone,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  servicesCount: number;
  subcategories: Subcategory[];
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

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="size-8" />,
  Zap: <Zap className="size-8" />,
  Paintbrush: <Paintbrush className="size-8" />,
  Droplets: <Droplets className="size-8" />,
  Plug: <Plug className="size-8" />,
  Hammer: <Hammer className="size-8" />,
  Scissors: <Scissors className="size-8" />,
  Wind: <Wind className="size-8" />,
  ShieldCheck: <ShieldCheck className="size-8" />,
  Home: <HomeIcon className="size-8" />,
  Building: <Building className="size-8" />,
  TreePine: <TreePine className="size-8" />,
  Snowflake: <Snowflake className="size-8" />,
  Tv: <Tv className="size-8" />,
  Flame: <Flame className="size-8" />,
  Truck: <Truck className="size-8" />,
  Droplet: <Droplet className="size-8" />,
};

// ─── Category Styles (Navy Blue Theme, 11 categories) ─────────────────────────

const CATEGORY_STYLES: Record<string, {
  headerGradient: string;
  iconBg: string;
  lightBg: string;
  lightText: string;
  borderColor: string;
  pillBg: string;
  pillText: string;
  glow: string;
  heroAccent: string;
  cardAccent: string;
  gradient: string;
}> = {
  'air-conditioner': {
    headerGradient: 'from-sky-600 via-blue-500 to-cyan-400',
    iconBg: 'bg-sky-100 text-sky-700',
    lightBg: 'bg-sky-50',
    lightText: 'text-sky-700',
    borderColor: 'border-sky-200',
    pillBg: 'bg-sky-100/80',
    pillText: 'text-sky-700',
    glow: 'shadow-sky-500/25',
    heroAccent: 'from-sky-500 to-cyan-400',
    cardAccent: 'border-l-sky-500',
    gradient: 'from-sky-500 to-blue-500',
  },
  'refrigerator': {
    headerGradient: 'from-cyan-600 via-sky-500 to-blue-400',
    iconBg: 'bg-cyan-100 text-cyan-700',
    lightBg: 'bg-cyan-50',
    lightText: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    pillBg: 'bg-cyan-100/80',
    pillText: 'text-cyan-700',
    glow: 'shadow-cyan-500/25',
    heroAccent: 'from-cyan-500 to-blue-400',
    cardAccent: 'border-l-cyan-500',
    gradient: 'from-cyan-500 to-blue-400',
  },
  'washing-machine': {
    headerGradient: 'from-indigo-600 via-violet-500 to-purple-400',
    iconBg: 'bg-indigo-100 text-indigo-700',
    lightBg: 'bg-indigo-50',
    lightText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    pillBg: 'bg-indigo-100/80',
    pillText: 'text-indigo-700',
    glow: 'shadow-indigo-500/25',
    heroAccent: 'from-indigo-500 to-purple-400',
    cardAccent: 'border-l-indigo-500',
    gradient: 'from-indigo-500 to-purple-400',
  },
  'kitchen-appliances': {
    headerGradient: 'from-amber-600 via-orange-500 to-yellow-400',
    iconBg: 'bg-amber-100 text-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    borderColor: 'border-amber-200',
    pillBg: 'bg-amber-100/80',
    pillText: 'text-amber-700',
    glow: 'shadow-amber-500/25',
    heroAccent: 'from-amber-500 to-yellow-400',
    cardAccent: 'border-l-amber-500',
    gradient: 'from-amber-500 to-yellow-400',
  },
  'tv-repair': {
    headerGradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    iconBg: 'bg-purple-100 text-purple-700',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-700',
    borderColor: 'border-purple-200',
    pillBg: 'bg-purple-100/80',
    pillText: 'text-purple-700',
    glow: 'shadow-purple-500/25',
    heroAccent: 'from-purple-500 to-fuchsia-400',
    cardAccent: 'border-l-purple-500',
    gradient: 'from-purple-500 to-fuchsia-400',
  },
  'water-purifier': {
    headerGradient: 'from-blue-600 via-cyan-500 to-sky-400',
    iconBg: 'bg-blue-100 text-blue-700',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    borderColor: 'border-blue-200',
    pillBg: 'bg-blue-100/80',
    pillText: 'text-blue-700',
    glow: 'shadow-blue-500/25',
    heroAccent: 'from-blue-500 to-sky-400',
    cardAccent: 'border-l-blue-500',
    gradient: 'from-blue-500 to-sky-400',
  },
  'geyser': {
    headerGradient: 'from-red-600 via-orange-500 to-amber-400',
    iconBg: 'bg-red-100 text-red-700',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    borderColor: 'border-red-200',
    pillBg: 'bg-red-100/80',
    pillText: 'text-red-700',
    glow: 'shadow-red-500/25',
    heroAccent: 'from-red-500 to-amber-400',
    cardAccent: 'border-l-red-500',
    gradient: 'from-red-500 to-amber-400',
  },
  'plumber': {
    headerGradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
    iconBg: 'bg-[#1e3a5f]/10 text-[#1e3a5f]',
    lightBg: 'bg-blue-50',
    lightText: 'text-[#1e3a5f]',
    borderColor: 'border-[#2d5a8e]/30',
    pillBg: 'bg-[#1e3a5f]/10',
    pillText: 'text-[#1e3a5f]',
    glow: 'shadow-[#1e3a5f]/25',
    heroAccent: 'from-[#1e3a5f] to-[#3b82f6]',
    cardAccent: 'border-l-[#1e3a5f]',
    gradient: 'from-[#1e3a5f] to-[#3b82f6]',
  },
  'electrician': {
    headerGradient: 'from-amber-600 via-yellow-500 to-orange-400',
    iconBg: 'bg-amber-100 text-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    borderColor: 'border-amber-200',
    pillBg: 'bg-amber-100/80',
    pillText: 'text-amber-700',
    glow: 'shadow-amber-500/25',
    heroAccent: 'from-amber-500 to-orange-400',
    cardAccent: 'border-l-amber-500',
    gradient: 'from-amber-500 to-orange-400',
  },
  'water-tank-cleaning': {
    headerGradient: 'from-teal-600 via-cyan-500 to-sky-400',
    iconBg: 'bg-teal-100 text-teal-700',
    lightBg: 'bg-teal-50',
    lightText: 'text-teal-700',
    borderColor: 'border-teal-200',
    pillBg: 'bg-teal-100/80',
    pillText: 'text-teal-700',
    glow: 'shadow-teal-500/25',
    heroAccent: 'from-teal-500 to-sky-400',
    cardAccent: 'border-l-teal-500',
    gradient: 'from-teal-500 to-sky-400',
  },
  'movers-and-packers': {
    headerGradient: 'from-slate-600 via-gray-500 to-zinc-400',
    iconBg: 'bg-slate-100 text-slate-700',
    lightBg: 'bg-slate-50',
    lightText: 'text-slate-700',
    borderColor: 'border-slate-200',
    pillBg: 'bg-slate-100/80',
    pillText: 'text-slate-700',
    glow: 'shadow-slate-500/25',
    heroAccent: 'from-slate-500 to-zinc-400',
    cardAccent: 'border-l-slate-500',
    gradient: 'from-slate-500 to-zinc-400',
  },
};

const DEFAULT_STYLE = {
  headerGradient: 'from-[#1e3a5f] via-[#2d5a8e] to-[#3b82f6]',
  iconBg: 'bg-[#1e3a5f]/10 text-[#1e3a5f]',
  lightBg: 'bg-blue-50',
  lightText: 'text-[#1e3a5f]',
  borderColor: 'border-[#2d5a8e]/30',
  pillBg: 'bg-[#1e3a5f]/10',
  pillText: 'text-[#1e3a5f]',
  glow: 'shadow-[#1e3a5f]/25',
  heroAccent: 'from-[#1e3a5f] to-[#3b82f6]',
  cardAccent: 'border-l-[#1e3a5f]',
  gradient: 'from-[#1e3a5f] to-[#3b82f6]',
};

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-8" />;
}

function getCategoryStyle(slug?: string) {
  if (slug && CATEGORY_STYLES[slug]) return CATEGORY_STYLES[slug];
  return DEFAULT_STYLE;
}

function getSubcategoryIcon(index: number): React.ReactNode {
  const icons = [
    <Wrench key="w" className="size-5" />,
    <Zap key="z" className="size-5" />,
    <Droplets key="d" className="size-5" />,
    <Wind key="wi" className="size-5" />,
    <ShieldCheck key="s" className="size-5" />,
    <Sparkles key="sp" className="size-5" />,
    <Plug key="pl" className="size-5" />,
    <Layers key="la" className="size-5" />,
    <Building key="bu" className="size-5" />,
    <HomeIcon key="ho" className="size-5" />,
  ];
  return icons[index % icons.length];
}

// ─── Motion Variants ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export function CategoryDetailPage() {
  const { navigate, nav } = useApp();
  const categoryId = nav.params.categoryId;
  const [sortBy, setSortBy] = useState('newest');

  const { data: category, loading: catLoading, error: catError, refetch: refetchCat } = useApi<CategoryDetail>(
    categoryId ? `/api/categories/${categoryId}` : null
  );

  const { data: servicesData, loading: srvLoading, error: srvError, refetch: refetchSrv } = useApi<{
    services: ServiceItem[];
    pagination: { total: number };
  }>(categoryId ? `/api/services?category=${categoryId}&limit=12` : null);

  const services = servicesData?.services || [];

  // Sort services
  const sortedServices = useMemo(() => {
    const sorted = [...services];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'price_low':
        sorted.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
      default:
        break;
    }
    return sorted;
  }, [services, sortBy]);

  const style = getCategoryStyle(category?.slug);

  return (
    <div className="flex flex-col">
      {/* ═══════════ Category Hero Banner ═══════════ */}
      {catLoading ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      ) : catError ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-16 text-center shadow-xl">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-rose-50">
              <FolderOpen className="size-12 text-red-300" />
            </div>
            <p className="text-xl font-bold text-foreground">Failed to load category</p>
            <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
            <Button
              variant="outline"
              size="lg"
              onClick={refetchCat}
              className="mt-6 border-blue-200 text-[#1e3a5f] hover:bg-blue-50"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : category ? (
        <>
          {/* Hero Banner */}
          <section className={`relative overflow-hidden bg-gradient-to-r ${style.headerGradient}`}>
            {/* Animated floating circles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -right-16 -top-16 size-64 rounded-full bg-white/[0.06]"
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/[0.04]"
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute right-1/4 top-1/3 size-24 rounded-full bg-white/[0.05]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Dot grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
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
                      <BreadcrumbLink
                        onClick={() => navigate('categories')}
                        className="cursor-pointer text-blue-200/70 transition-colors duration-200 hover:text-white"
                      >
                        Categories
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-blue-300/30" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium text-white">{category.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </motion.div>

              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('categories')}
                  className="group mb-2 text-blue-100 hover:bg-white/10 hover:text-white md:mb-0"
                >
                  <ArrowLeft className="mr-1 size-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  Back
                </Button>

                {/* Icon */}
                <motion.div
                  className={`flex size-20 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-xl ring-1 ring-white/10 ${style.glow}`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white float-animation">{getCategoryIcon(category.icon)}</span>
                </motion.div>

                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">{category.name}</h1>
                  {category.description && (
                    <p className="mt-2 max-w-2xl text-lg text-white/75">{category.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <Badge className="rounded-full border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                      <Layers className="mr-1.5 size-3.5" /> {category.subcategories.length} subcategories
                    </Badge>
                    <Badge className="rounded-full border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                      <Wrench className="mr-1.5 size-3.5" /> {category.servicesCount} services
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Wave separator */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M0 80V40C240 60 480 10 720 40C960 70 1200 15 1440 40V80H0Z" fill="white" fillOpacity="0.97" />
              </svg>
            </div>
          </section>

          {/* ═══════════ Subcategories Grid ═══════════ */}
          {category.subcategories.length > 0 && (
            <section className="bg-white py-14">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={0}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${style.heroAccent} text-white shadow-md`}>
                      <Sparkles className="size-5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Subcategories</h2>
                  </div>
                  <p className="text-muted-foreground">Browse specialized services within {category.name}</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {category.subcategories.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-20px' }}
                      variants={scaleIn}
                      custom={idx}
                    >
                      <Card
                        className={`group cursor-pointer rounded-2xl border-l-4 ${style.cardAccent} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                        onClick={() =>
                          navigate('search', {
                            categoryId: String(category.id),
                            subcategoryId: String(sub.id),
                          })
                        }
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${style.iconBg} transition-transform duration-200 group-hover:scale-110 group-hover:shadow-sm`}>
                            {getSubcategoryIcon(idx)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{sub.name}</p>
                            {sub.description && (
                              <p className="line-clamp-1 text-xs text-muted-foreground">{sub.description}</p>
                            )}
                          </div>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════ Popular Services ═══════════ */}
          <section className="bg-gradient-to-b from-gray-50/80 to-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Popular Services</h2>
                  <p className="text-sm text-muted-foreground">{services.length} services available</p>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {srvError ? (
                <div className="glass rounded-3xl p-16 text-center shadow-xl">
                  <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-rose-50">
                    <FolderOpen className="size-12 text-red-300" />
                  </div>
                  <p className="text-xl font-bold text-foreground">Failed to load services</p>
                  <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={refetchSrv}
                    className="mt-6 border-blue-200 text-[#1e3a5f] hover:bg-blue-50"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {srvLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden rounded-2xl">
                          <Skeleton className="aspect-video w-full" />
                          <CardContent className="p-4">
                            <Skeleton className="mb-2 h-5 w-3/4" />
                            <Skeleton className="mb-2 h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </CardContent>
                        </Card>
                      ))
                    : sortedServices.map((service, idx) => (
                        <motion.div
                          key={service.id}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: '-20px' }}
                          variants={scaleIn}
                          custom={idx}
                        >
                          <Card
                            className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            onClick={() => navigate('service-detail', { serviceId: service.id })}
                          >
                            <div className="relative aspect-video overflow-hidden">
                              {service.images ? (
                                <img
                                  src={JSON.parse(service.images)[0] || ''}
                                  alt={service.title}
                                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className={`flex size-full items-center justify-center bg-gradient-to-br ${style.gradient} opacity-20`}>
                                  <Wrench className="size-12 text-gray-300" />
                                </div>
                              )}
                              {/* Gradient overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              {/* Category badge on hover */}
                              <Badge className={`absolute bottom-3 left-3 rounded-full ${style.pillBg} ${style.pillText} border-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}>
                                {service.category.name}
                              </Badge>
                              {service.priceNegotiable && (
                                <Badge className="absolute right-3 top-3 bg-amber-100 text-amber-700 hover:bg-amber-100">
                                  Negotiable
                                </Badge>
                              )}
                              {/* Book Now button on hover */}
                              <Button
                                size="sm"
                                className="shimmer absolute bottom-3 right-3 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-4 text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 hover:from-[#2d5a8e] hover:to-[#3b82f6]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('service-detail', { serviceId: service.id });
                                }}
                              >
                                Book Now
                              </Button>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold leading-tight line-clamp-1">{service.title}</h3>
                              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <span className="truncate">{service.provider.name}</span>
                                {service.city && (
                                  <>
                                    <span>·</span>
                                    <MapPin className="size-3 shrink-0" />
                                    <span className="truncate">{service.city}</span>
                                  </>
                                )}
                              </div>
                              <div className="mt-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="size-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]" />
                                  <span className="text-sm font-medium">{service.averageRating.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">({service.totalReviews})</span>
                                </div>
                                <span className="text-lg font-bold text-gradient">₹{service.basePrice}</span>
                              </div>
                              {/* Popular badge for booked services */}
                              {service.totalBookings > 5 && (
                                <Badge className="mt-2 rounded-full border-0 bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs">
                                  <TrendingUp className="mr-1 size-3" /> Popular ({service.totalBookings} booked)
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                </div>
              )}

              {/* Empty State */}
              {!srvLoading && !srvError && services.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-3xl p-16 text-center shadow-xl"
                >
                  {/* Illustration-style empty state */}
                  <div className="relative mx-auto mb-6 size-36">
                    <div className="absolute inset-0 rounded-full bg-blue-50" />
                    <div className="absolute inset-4 rounded-full bg-blue-100/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <FolderOpen className="size-14 text-blue-300" />
                      </motion.div>
                    </div>
                    {/* Decorative dots */}
                    <motion.div className="absolute -right-2 top-2 size-3 rounded-full bg-amber-300" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.div className="absolute -left-1 bottom-4 size-2 rounded-full bg-sky-300" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
                    <motion.div className="absolute right-4 -bottom-1 size-2.5 rounded-full bg-cyan-300" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 3, repeat: Infinity }} />
                  </div>
                  <p className="text-xl font-bold text-foreground">No services found</p>
                  <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                    No services available in this category yet. Check back soon or browse other categories!
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button
                      className="shimmer bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-8 text-white shadow-lg shadow-[#1e3a5f]/25 hover:from-[#2d5a8e] hover:to-[#3b82f6]"
                      onClick={() => navigate('categories')}
                    >
                      Browse Other Categories
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-200 text-[#1e3a5f] hover:bg-blue-50"
                      onClick={() => navigate('home')}
                    >
                      Back to Home
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* ═══════════ CTA Section ═══════════ */}
          <section className={`relative overflow-hidden bg-gradient-to-r ${style.headerGradient} py-16`}>
            {/* Decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -right-16 -top-16 size-48 rounded-full bg-white/[0.06]"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-12 -left-12 size-36 rounded-full bg-white/[0.04]"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to book a {category.name.toLowerCase()} service?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-lg text-white/75">
                Choose from {category.servicesCount} verified professionals with transparent pricing and our satisfaction guarantee.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  className="shimmer bg-white px-10 py-6 text-lg font-semibold text-[#1e3a5f] shadow-xl hover:bg-blue-50"
                  size="lg"
                  onClick={() => navigate('search', { categoryId: String(category.id) })}
                >
                  Book Now
                  <ChevronRight className="ml-2 size-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 px-8 py-6 text-lg font-semibold text-white hover:bg-white/10"
                  onClick={() => navigate('categories')}
                >
                  All Categories
                </Button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

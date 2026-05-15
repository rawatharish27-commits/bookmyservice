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
  Search,
  ArrowRight,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Icon & Color Maps ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="size-10" />,
  Zap: <Zap className="size-10" />,
  Paintbrush: <Paintbrush className="size-10" />,
  Droplets: <Droplets className="size-10" />,
  Plug: <Plug className="size-10" />,
  Hammer: <Hammer className="size-10" />,
  Scissors: <Scissors className="size-10" />,
  Wind: <Wind className="size-10" />,
  ShieldCheck: <ShieldCheck className="size-10" />,
  Home: <HomeIcon className="size-10" />,
  Building: <Building className="size-10" />,
  TreePine: <TreePine className="size-10" />,
};

const CATEGORY_STYLES: Record<string, {
  gradient: string;
  headerGradient: string;
  lightBg: string;
  lightText: string;
  borderColor: string;
  hoverBorder: string;
  glow: string;
  accentBadge: string;
  iconBg: string;
  pillBg: string;
  pillText: string;
  heroAccent: string;
  cardAccent: string;
}> = {
  plumbing: {
    gradient: 'from-blue-500 to-cyan-500',
    headerGradient: 'from-blue-600 via-blue-500 to-cyan-400',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    borderColor: 'border-l-blue-500',
    hoverBorder: 'hover:border-l-blue-400',
    glow: 'shadow-blue-500/20',
    accentBadge: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-100',
    pillBg: 'bg-blue-50',
    pillText: 'text-blue-700',
    heroAccent: 'from-blue-400/30 to-cyan-400/20',
    cardAccent: 'ring-blue-200/50',
  },
  electrical: {
    gradient: 'from-sky-500 to-yellow-500',
    headerGradient: 'from-sky-600 via-sky-500 to-yellow-400',
    lightBg: 'bg-sky-50',
    lightText: 'text-sky-700',
    borderColor: 'border-l-sky-500',
    hoverBorder: 'hover:border-l-cyan-400',
    glow: 'shadow-sky-500/20',
    accentBadge: 'bg-sky-100 text-sky-700',
    iconBg: 'bg-sky-100',
    pillBg: 'bg-sky-50',
    pillText: 'text-sky-700',
    heroAccent: 'from-cyan-400/30 to-yellow-400/20',
    cardAccent: 'ring-sky-200/50',
  },
  'ac-hvac': {
    gradient: 'from-teal-500 to-emerald-500',
    headerGradient: 'from-teal-600 via-teal-500 to-emerald-400',
    lightBg: 'bg-teal-50',
    lightText: 'text-teal-700',
    borderColor: 'border-l-teal-500',
    hoverBorder: 'hover:border-l-teal-400',
    glow: 'shadow-teal-500/20',
    accentBadge: 'bg-teal-100 text-teal-700',
    iconBg: 'bg-teal-100',
    pillBg: 'bg-teal-50',
    pillText: 'text-teal-700',
    heroAccent: 'from-teal-400/30 to-emerald-400/20',
    cardAccent: 'ring-teal-200/50',
  },
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  plumbing: '/images/plumbing.jpg',
  electrical: '/images/electrical.jpg',
  'ac-hvac': '/images/hvac.jpg',
};

const DEFAULT_STYLE = {
  gradient: 'from-emerald-500 to-teal-500',
  headerGradient: 'from-emerald-600 via-emerald-500 to-teal-400',
  lightBg: 'bg-emerald-50',
  lightText: 'text-emerald-700',
  borderColor: 'border-l-emerald-500',
  hoverBorder: 'hover:border-l-emerald-400',
  glow: 'shadow-emerald-500/20',
  accentBadge: 'bg-emerald-100 text-emerald-700',
  iconBg: 'bg-emerald-100',
  pillBg: 'bg-emerald-50',
  pillText: 'text-emerald-700',
  heroAccent: 'from-emerald-400/30 to-teal-400/20',
  cardAccent: 'ring-emerald-200/50',
};

// ─── Subcategory Icon Helper ───────────────────────────────────────────────────

function getSubcategoryIcon(index: number): React.ReactNode {
  const icons = [
    <Wrench key="wrench" className="size-4" />,
    <Zap key="zap" className="size-4" />,
    <Droplets key="droplets" className="size-4" />,
    <Wind key="wind" className="size-4" />,
    <ShieldCheck key="shield" className="size-4" />,
    <Sparkles key="sparkles" className="size-4" />,
    <Plug key="plug" className="size-4" />,
    <Layers key="layers" className="size-4" />,
    <Building key="building" className="size-4" />,
    <HomeIcon key="home" className="size-4" />,
  ];
  return icons[index % icons.length];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-10" />;
}

function getCategoryStyle(slug?: string) {
  if (slug && CATEGORY_STYLES[slug]) return CATEGORY_STYLES[slug];
  return DEFAULT_STYLE;
}

// ─── Star Rating Display ──────────────────────────────────────────────────────

function StarRating({ rating, totalReviews }: { rating: number; totalReviews: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-3.5 ${
              i < fullStars
                ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.4)]'
                : i === fullStars && hasHalf
                  ? 'fill-sky-200 text-cyan-400'
                  : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
      {totalReviews > 0 && (
        <span className="text-xs text-muted-foreground">({totalReviews})</span>
      )}
    </div>
  );
}

// ─── Motion Variants ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const rawServices = servicesData?.services || [];

  // Sort services
  const services = useMemo(() => {
    const sorted = [...rawServices];
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
      default:
        break;
    }
    return sorted;
  }, [rawServices, sortBy]);

  const style = getCategoryStyle(category?.slug);

  return (
    <div className="flex flex-col">
      {/* ═══════════ Category Hero Banner ═══════════ */}
      <section className={`relative overflow-hidden bg-gradient-to-r ${style.headerGradient}`}>
        {/* Category background image */}
        <img
          src={CATEGORY_IMAGE_MAP[category?.slug || ''] || '/images/plumbing.jpg'}
          alt={category?.name || 'Category'}
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
        />
        {/* Gradient overlay on image */}
        <div className={`absolute inset-0 bg-gradient-to-r ${style.headerGradient} opacity-80`} />
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 size-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 size-[300px] rounded-full bg-white/5 blur-3xl" />
          <motion.div
            className="absolute -left-10 top-1/4 size-48 rounded-full bg-white/[0.04]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-1/4 bottom-1/4 size-32 rounded-full bg-white/[0.04]"
            animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          {/* Breadcrumb with gradient active state */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Breadcrumb className="mb-6">
              <BreadcrumbList className="text-white/60">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate('home')}
                    className="cursor-pointer text-white/60 hover:text-white"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/30" />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate('categories')}
                    className="cursor-pointer text-white/60 hover:text-white"
                  >
                    Categories
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/30" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-white">
                    {category?.name || 'Category'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          {catLoading ? (
            <div className="flex items-center gap-5">
              <Skeleton className="size-24 rounded-2xl bg-white/10" />
              <div>
                <Skeleton className="mb-2 h-10 w-56 bg-white/10" />
                <Skeleton className="h-4 w-72 bg-white/10" />
              </div>
            </div>
          ) : catError ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/10">
                <FolderOpen className="size-8 text-white/60" />
              </div>
              <p className="text-lg font-semibold text-white">Failed to load category</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refetchCat}
                className="mt-3 border-white/30 text-white hover:bg-white/10"
              >
                Retry
              </Button>
            </div>
          ) : category ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-start gap-5 sm:gap-8"
            >
              {/* Large animated icon */}
              <motion.div
                className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur-sm sm:size-24"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white float-animation">{getCategoryIcon(category.icon)}</span>
              </motion.div>

              <div className="flex-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                    {category.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full border-0 bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                    <Layers className="mr-1.5 size-3.5" /> {category.subcategories.length} Subcategories
                  </Badge>
                  <Badge className="rounded-full border-0 bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                    <Wrench className="mr-1.5 size-3.5" /> {category.servicesCount} Services
                  </Badge>
                </div>
              </div>

              {/* Back button on desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('categories')}
                className="hidden border-white/20 text-white hover:bg-white/10 hover:text-white sm:flex"
              >
                <ArrowLeft className="mr-1 size-4" /> Back
              </Button>
            </motion.div>
          ) : null}

          {/* Back button on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('categories')}
            className="mt-4 border-white/20 text-white hover:bg-white/10 hover:text-white sm:hidden"
          >
            <ArrowLeft className="mr-1 size-4" /> Back to Categories
          </Button>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 50 480 10 720 30C960 50 1200 10 1440 30V60H0Z" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
      </section>

      {/* ═══════════ Subcategories Grid ═══════════ */}
      {category && category.subcategories.length > 0 && (
        <section className="relative z-10 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              variants={fadeUp}
              custom={0}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-md`}>
                  <Layers className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Browse <span className="text-gradient">Subcategories</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">Find the specific service you need</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.subcategories.map((sub, idx) => (
                <motion.div
                  key={sub.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-20px' }}
                  variants={slideInLeft}
                  custom={idx}
                >
                  <Card
                    className={`group cursor-pointer overflow-hidden rounded-xl border-l-4 ${style.borderColor} ${style.hoverBorder} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                    onClick={() =>
                      navigate('search', {
                        categoryId: String(category.id),
                        subcategoryId: String(sub.id),
                      })
                    }
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${style.iconBg} ${style.lightText} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sm`}>
                        {getSubcategoryIcon(idx)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{sub.name}</p>
                        {sub.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">{sub.description}</p>
                        )}
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-600" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ Popular Services ═══════════ */}
      <section className="bg-gray-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with sort */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-md`}>
                <Wrench className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Popular <span className="text-gradient">Services</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {services.length} {services.length === 1 ? 'service' : 'services'} available
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[170px] rounded-xl border-emerald-200 bg-white shadow-sm focus:ring-emerald-500/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest" className="focus:bg-emerald-50 focus:text-emerald-700">
                    Newest First
                  </SelectItem>
                  <SelectItem value="rating" className="focus:bg-emerald-50 focus:text-emerald-700">
                    Highest Rated
                  </SelectItem>
                  <SelectItem value="price_low" className="focus:bg-emerald-50 focus:text-emerald-700">
                    Price: Low → High
                  </SelectItem>
                  <SelectItem value="price_high" className="focus:bg-emerald-50 focus:text-emerald-700">
                    Price: High → Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Error State */}
          {srvError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-16 text-center shadow-lg"
            >
              <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-rose-50">
                <FolderOpen className="size-12 text-red-300" />
              </div>
              <p className="text-xl font-bold text-foreground">Failed to load services</p>
              <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
              <Button variant="outline" size="lg" onClick={refetchSrv} className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Retry
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {srvLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg">
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="p-5">
                        <Skeleton className="mb-2 h-5 w-3/4" />
                        <Skeleton className="mb-2 h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                : services.map((service, idx) => (
                    <motion.div
                      key={service.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-20px' }}
                      variants={scaleIn}
                      custom={idx}
                    >
                      <Card
                        className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                        onClick={() => navigate('service-detail', { serviceId: service.id })}
                      >
                        {/* Image section */}
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                          {service.images ? (
                            <img
                              src={JSON.parse(service.images)[0] || ''}
                              alt={service.title}
                              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <Wrench className="size-12 text-emerald-300" />
                            </div>
                          )}

                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          {/* Price tag with gradient */}
                          <div className="absolute right-3 top-3">
                            <Badge className={`rounded-full border-0 bg-gradient-to-r ${style.gradient} px-3 py-1 text-sm font-bold text-white shadow-lg`}>
                              ₹{service.basePrice}
                            </Badge>
                          </div>

                          {/* Negotiable badge */}
                          {service.priceNegotiable && (
                            <Badge className="absolute left-3 top-3 rounded-full border-0 bg-sky-100/90 px-2.5 py-0.5 text-xs font-semibold text-sky-700 backdrop-blur-sm">
                              Negotiable
                            </Badge>
                          )}

                          {/* Book Now overlay on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            <Button
                              size="sm"
                              className="shimmer rounded-full bg-white/90 px-6 text-emerald-700 shadow-xl hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('service-detail', { serviceId: service.id });
                              }}
                            >
                              Book Now <ArrowRight className="ml-1 size-3.5" />
                            </Button>
                          </div>

                          {/* Category badge on image */}
                          <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            <Badge className={`rounded-full border-0 ${style.accentBadge} px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm`}>
                              {service.category.name}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-5">
                          <h3 className="text-base font-bold leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {service.title}
                          </h3>

                          {/* Provider & location */}
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <div className={`flex size-6 items-center justify-center rounded-full ${style.iconBg} text-xs font-bold ${style.lightText}`}>
                              {service.provider.name.charAt(0)}
                            </div>
                            <span className="truncate font-medium">{service.provider.name}</span>
                            {service.city && (
                              <>
                                <span className="text-muted-foreground/40">·</span>
                                <MapPin className="size-3 shrink-0" />
                                <span className="truncate">{service.city}</span>
                              </>
                            )}
                          </div>

                          {/* Rating & Price */}
                          <div className="mt-3 flex items-center justify-between">
                            <StarRating rating={service.averageRating} totalReviews={service.totalReviews} />
                            <span className={`text-lg font-bold ${style.lightText}`}>
                              ₹{service.basePrice}
                            </span>
                          </div>

                          {/* Bookings info */}
                          {service.totalBookings > 0 && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle2 className="size-3 text-emerald-500" />
                                <span>{service.totalBookings} bookings completed</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="size-3" />
                                <span>Popular</span>
                              </div>
                            </div>
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
              className="rounded-3xl bg-white p-16 text-center shadow-lg"
            >
              {/* Illustration-style empty state */}
              <div className="relative mx-auto mb-6 size-36">
                {/* Outer rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-100/60 to-teal-100/40" />
                <div className="absolute inset-6 rounded-full bg-white/80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Search className="size-14 text-emerald-300" />
                  </motion.div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -right-2 top-2 size-3 rounded-full bg-sky-300" />
                <div className="absolute -left-1 bottom-4 size-2 rounded-full bg-blue-300" />
                <div className="absolute right-4 -bottom-1 size-2.5 rounded-full bg-teal-300" />
                <div className="absolute -top-1 left-1/2 size-2 rounded-full bg-rose-300" />
                {/* Animated circles */}
                <motion.div
                  className="absolute -right-4 bottom-0 size-4 rounded-full bg-emerald-200/50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute left-0 -top-3 size-3 rounded-full bg-sky-200/50"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
              </div>
              <p className="text-xl font-bold text-foreground">No services found</p>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                We&apos;re expanding our service network in this category. Check back soon for new offerings!
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  className="shimmer bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
                  onClick={() => navigate('categories')}
                >
                  <ArrowLeft className="mr-1 size-4" /> Browse Other Categories
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
      {category && !srvLoading && services.length > 0 && (
        <section className="relative overflow-hidden bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${style.headerGradient} p-8 text-center sm:p-12`}
            >
              {/* Background decorations */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/[0.07]" />
                <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-white/[0.05]" />
                <motion.div
                  className="absolute left-1/4 top-1/4 size-16 rounded-full bg-white/[0.04]"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              {/* Dot pattern */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative">
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Ready to book a {category.name.toLowerCase()} service?
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-white/80">
                  Choose from {services.length} verified professionals in your area. Quality guaranteed.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    className="shimmer bg-white px-8 text-emerald-700 shadow-xl hover:bg-emerald-50"
                    onClick={() => navigate('home')}
                  >
                    Book Now <ArrowRight className="ml-2 size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => navigate('categories')}
                  >
                    All Categories
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

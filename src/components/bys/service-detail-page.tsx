import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Star,
  MapPin,
  Heart,
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  Wrench,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Share2,
  Zap,
  Award,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  priceNegotiable: boolean;
  serviceDurationMinutes?: number;
  serviceAreaRadiusKm: number;
  city?: string;
  state?: string;
  address?: string;
  images?: string;
  averageRating: number;
  totalBookings: number;
  totalReviews: number;
  isActive: boolean;
  isApproved: boolean;
  provider: {
    id: string;
    name: string;
    profileImageUrl?: string;
    city?: string;
  };
  category: { id: number; name: string; slug: string };
  subcategory?: { id: number; name: string; slug: string };
  reviews: ReviewItem[];
  availability: AvailabilitySlot[];
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: { id: string; name: string; profileImageUrl?: string };
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface SimilarService {
  id: string;
  title: string;
  basePrice: number;
  averageRating: number;
  totalReviews: number;
  city?: string;
  images?: string;
  provider: { id: string; name: string };
  category: { id: number; name: string };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Motion Variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// ─── Star Rating with Gradient ───────────────────────────────────────────────

function GradientStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'size-5' : size === 'md' ? 'size-4' : 'size-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="relative">
          <Star
            className={`${sizeClass} ${
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ServiceDetailPage() {
  const { navigate, nav } = useApp();
  const { user, token } = useAuth();
  const serviceId = nav.params.serviceId;
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const { mutate } = useApiMutation();

  const { data: service, loading, error, refetch } = useApi<ServiceDetail>(
    serviceId ? `/api/services/${serviceId}` : null
  );

  const { data: reviewsData } = useApi<{
    reviews: ReviewItem[];
    pagination: { total: number };
  }>(serviceId ? `/api/services/${serviceId}/reviews?limit=10` : null);

  const { data: similarData } = useApi<{ services: SimilarService[] }>(
    service?.category ? `/api/services?category=${service.category.id}&limit=4` : null
  );

  const similarServices = similarData?.services?.filter((s) => s.id !== serviceId) || [];
  const images = service?.images ? JSON.parse(service.images) : [];
  const reviews = reviewsData?.reviews || service?.reviews || [];

  const handleFavorite = async () => {
    if (!user) {
      navigate('login');
      return;
    }
    setFavoriteLoading(true);
    setFavoriteAnimating(true);
    try {
      await mutate('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
      });
      setIsFavorited(true);
    } catch {
      // already favorited or error
    } finally {
      setFavoriteLoading(false);
      setTimeout(() => setFavoriteAnimating(false), 400);
    }
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass mx-auto max-w-md rounded-3xl p-10 shadow-lg"
        >
          <AlertCircle className="mx-auto size-14 text-rose-400" />
          <p className="mt-4 text-lg font-semibold text-foreground">Failed to load service details</p>
          <p className="mt-1 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
          <Button
            variant="outline"
            onClick={refetch}
            className="mt-4 border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#FFD54F]/10"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="mt-4 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="size-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="mt-6 h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-4 h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="relative min-h-screen">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -left-40 top-20 size-[500px] rounded-full bg-[#FFD54F]/15 blur-3xl" />
        <div className="absolute -right-40 bottom-20 size-[400px] rounded-full bg-[#FFD54F]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ─── Breadcrumb ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumb className="mb-5">
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate('home')}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-[#0A1F44]"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground/40" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate('categories')}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-[#0A1F44]"
                >
                  Categories
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground/40" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate('category-detail', { categoryId: String(service.category.id) })}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-[#0A1F44]"
                >
                  {service.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate font-semibold text-gradient">
                  {service.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* ─── Back Button ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('category-detail', { categoryId: String(service.category.id) })}
            className="group mb-5 gap-2 text-muted-foreground hover:text-[#0A1F44] hover:bg-[#FFD54F]/10"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to{' '}
            {service.category.name}
          </Button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ═══════════ Left Column - Main Content ═══════════ */}
          <div className="lg:col-span-2">
            {/* ─── Image Gallery with Thumbnails ────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/10 shadow-lg ring-1 ring-[#FFD54F]/20/50">
                {/* Main Image with Crossfade */}
                <div className="relative aspect-video overflow-hidden">
                  {images.length > 0 ? (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImage}
                          src={images[currentImage]}
                          alt={`${service.title} - Image ${currentImage + 1}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="size-full object-cover"
                        />
                      </AnimatePresence>

                      {/* Gradient overlay at bottom */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />

                      {/* Image counter badge */}
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                        <span>{currentImage + 1}</span>
                        <span className="text-white/60">/</span>
                        <span>{images.length}</span>
                      </div>

                      {/* Share button */}
                      <button className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/50 hover:scale-110">
                        <Share2 className="size-4" />
                      </button>

                      {images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="size-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                            onClick={nextImage}
                          >
                            <ChevronRight className="size-5" />
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#FFD54F]/10 via-[#FFD54F]/10 to-[#FFD54F]/10">
                      <div className="text-center">
                        <Wrench className="mx-auto size-20 text-[#0A1F44]/50" />
                        <p className="mt-2 text-sm text-[#0A1F44]/60">No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {images.map((img: string, i: number) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImage(i)}
                        className={`relative shrink-0 size-20 overflow-hidden rounded-xl transition-all duration-300 ${
                          i === currentImage
                            ? 'ring-2 ring-[#0A1F44] ring-offset-2 shadow-md shadow-[#0A1F44]/20'
                            : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="size-full object-cover"
                        />
                        {i === currentImage && (
                          <div className="absolute inset-0 bg-[#FFD54F]/100/10" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ─── Title, Badges, and Favorite ──────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="mt-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    {service.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="border-[#0A1F44]/20 bg-[#FFD54F]/10 text-[#0A1F44] hover:bg-[#FFD54F]/20">
                      {service.category.name}
                    </Badge>
                    {service.subcategory && (
                      <Badge variant="outline" className="border-[#0A1F44]/20 text-[#0A1F44]">
                        {service.subcategory.name}
                      </Badge>
                    )}
                    {service.city && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 text-[#0A1F44]/80" /> {service.city}
                        {service.state && `, ${service.state}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Favorite Button with Animation */}
                <motion.button
                  whileTap={{ scale: 0.7 }}
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className="group flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-rose-100"
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <motion.div
                    animate={{
                      scale: favoriteAnimating ? [1, 1.4, 1] : 1,
                      color: isFavorited ? '#ef4444' : '#9ca3af',
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <Heart
                      className={`size-5 transition-colors duration-300 ${
                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'
                      }`}
                    />
                  </motion.div>
                </motion.button>
              </div>

              {/* Rating and Stats Row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <GradientStars rating={service.averageRating} size="md" />
                  <span className="text-sm font-semibold">{service.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({service.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#FFD54F]/10">
                    <Users className="size-3.5 text-[#0A1F44]" />
                  </div>
                  <span className="font-medium">{service.totalBookings}</span> bookings
                </div>
                {service.serviceDurationMinutes && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50">
                      <Clock className="size-3.5 text-amber-600" />
                    </div>
                    <span className="font-medium">{service.serviceDurationMinutes} min</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ─── Quick Info Cards ──────────────────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {[
                { icon: <MapPin className="size-4" />, label: 'Service Area', value: `${service.serviceAreaRadiusKm} km`, color: 'from-[#0A1F44] to-[#132D5E]' },
                { icon: <Clock className="size-4" />, label: 'Duration', value: service.serviceDurationMinutes ? `${service.serviceDurationMinutes} min` : 'Flexible', color: 'from-amber-500 to-blue-500' },
                { icon: <ShieldCheck className="size-4" />, label: 'Verified', value: 'KYC Approved', color: 'from-[#0A1F44] to-[#132D5E]' },
                { icon: <TrendingUp className="size-4" />, label: 'Popularity', value: service.totalBookings > 20 ? 'High' : service.totalBookings > 5 ? 'Growing' : 'New', color: 'from-purple-500 to-pink-500' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  variants={scaleIn}
                  custom={idx}
                  className="glass rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className={`mb-2 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm`}>
                    {item.icon}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            <Separator className="my-8" />

            {/* ─── Description ────────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] text-white shadow-sm">
                  <Wrench className="size-4" />
                </div>
                <h2 className="text-lg font-bold">About This Service</h2>
              </div>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/10 p-5 ring-1 ring-[#FFD54F]/20/50">
                <p className="whitespace-pre-line leading-relaxed text-foreground/80">{service.description}</p>
              </div>
            </motion.div>

            <Separator className="my-8" />

            {/* ─── Availability ───────────────────────────────────────── */}
            {service.availability && service.availability.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-blue-500 text-white shadow-sm">
                    <Calendar className="size-4" />
                  </div>
                  <h2 className="text-lg font-bold">Availability</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.availability
                    .filter((a) => a.isAvailable)
                    .map((slot, idx) => (
                      <motion.div
                        key={slot.id}
                        variants={scaleIn}
                        custom={idx}
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#0A1F44]/20"
                      >
                        {/* Gradient active indicator */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#0A1F44] to-[#D4A017] rounded-r-full transition-all duration-300 group-hover:w-1.5" />
                        <div className="ml-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFD54F]/10 text-sm font-bold text-[#0A1F44]">
                              {DAY_SHORT[slot.dayOfWeek]}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{DAY_NAMES[slot.dayOfWeek]}</p>
                              <p className="text-sm text-muted-foreground">
                                {slot.startTime} - {slot.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex size-6 items-center justify-center rounded-full bg-[#FFD54F]/10">
                            <CheckCircle2 className="size-3.5 text-[#0A1F44]/80" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
                <Separator className="my-8" />
              </motion.div>
            )}

            {/* ─── Reviews ────────────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A017] to-[#FFD54F] text-white shadow-sm">
                    <Star className="size-4" />
                  </div>
                  <h2 className="text-lg font-bold">Reviews</h2>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  {service.totalReviews} total
                </span>
              </div>

              {reviews.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      variants={scaleIn}
                      custom={idx}
                      className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#0A1F44]/10"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar with gradient ring */}
                        <div className="relative shrink-0">
                          <div className="rounded-full bg-gradient-to-br from-[#0A1F44] to-[#D4A017] p-[2px]">
                            <Avatar className="size-10 ring-2 ring-white">
                              {review.reviewer.profileImageUrl && (
                                <AvatarImage src={review.reviewer.profileImageUrl} alt={review.reviewer.name} />
                              )}
                              <AvatarFallback className="bg-[#FFD54F]/10 text-xs font-bold text-[#0A1F44]">
                                {getInitials(review.reviewer.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground">{review.reviewer.name}</p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <GradientStars rating={review.rating} size="sm" />
                            <span className="text-xs font-semibold text-amber-600">{review.rating}.0</span>
                          </div>
                          {review.comment && (
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center"
                >
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50">
                    <MessageSquare className="size-8 text-amber-400" />
                  </div>
                  <p className="mt-3 font-semibold text-foreground">No reviews yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Be the first to share your experience</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ═══════════ Right Column - Sidebar ═══════════ */}
          <div className="space-y-6">
            {/* ─── Glassmorphism Price Card ──────────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="sticky top-24"
            >
              <div className="glass overflow-hidden rounded-2xl shadow-xl ring-1 ring-[#FFD54F]/20/50">
                {/* Gradient top accent */}
                <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#0A1F44]" />

                <div className="p-6">
                  {/* Price Display */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-gradient">₹{service.basePrice}</span>
                      <span className="text-sm text-muted-foreground">/service</span>
                    </div>
                    {service.priceNegotiable && (
                      <Badge className="mt-2 border-amber-200 bg-gradient-to-r from-amber-50 to-blue-50 text-amber-700 hover:from-amber-100 hover:to-sky-100">
                        <Zap className="mr-1 size-3" /> Price Negotiable
                      </Badge>
                    )}
                  </div>

                  {/* Book Now Button with Shimmer */}
                  <Button
                    className="shimmer group relative w-full overflow-hidden bg-gradient-to-r from-[#0A1F44] to-[#132D5E] py-6 text-base font-bold text-white shadow-lg shadow-[#0A1F44]/25 transition-all hover:from-[#132D5E] hover:to-[#0A1F44] hover:shadow-xl hover:shadow-[#0A1F44]/30"
                    size="lg"
                    onClick={() => navigate('booking', { serviceId: service.id })}
                  >
                    Book Now
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  </Button>

                  {service.priceNegotiable && (
                    <Button
                      variant="outline"
                      className="mt-3 w-full border-[#0A1F44]/20 py-5 text-[#0A1F44] hover:bg-[#FFD54F]/10 hover:border-[#0A1F44]/30"
                      onClick={() => navigate('booking', { serviceId: service.id })}
                    >
                      Negotiate Price
                    </Button>
                  )}

                  <Separator className="my-5" />

                  {/* Provider Info */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Service Provider
                    </h3>
                    <div
                      className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-[#FFD54F]/10"
                      onClick={() => navigate('category-detail', { categoryId: String(service.category.id) })}
                    >
                      {/* Avatar with Gradient Ring */}
                      <div className="relative shrink-0">
                        <div className="rounded-full bg-gradient-to-br from-[#0A1F44] to-[#D4A017] p-[2.5px] shadow-md shadow-[#0A1F44]/20">
                          <Avatar className="size-12 ring-2 ring-white">
                            {service.provider.profileImageUrl && (
                              <AvatarImage src={service.provider.profileImageUrl} alt={service.provider.name} />
                            )}
                            <AvatarFallback className="bg-[#FFD54F]/10 text-sm font-bold text-[#0A1F44]">
                              {getInitials(service.provider.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {/* Verified Badge with Glow */}
                        <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[#FFD54F]/100 shadow-md shadow-[#0A1F44]/30 ring-2 ring-white">
                          <ShieldCheck className="size-3 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground group-hover:text-[#0A1F44] transition-colors">
                          {service.provider.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <Award className="size-3 text-[#0A1F44]/80" />
                          <span className="text-xs font-medium text-[#0A1F44]">Verified Provider</span>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-[#0A1F44]" />
                    </div>

                    {/* Provider Stats */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {service.totalBookings > 0 && (
                        <div className="rounded-xl bg-[#FFD54F]/10 p-2.5 text-center ring-1 ring-[#FFD54F]/20/50">
                          <p className="text-lg font-bold text-[#0A1F44]">{service.totalBookings}</p>
                          <p className="text-xs text-[#0A1F44]">Bookings</p>
                        </div>
                      )}
                      {service.averageRating > 0 && (
                        <div className="rounded-xl bg-amber-50/50 p-2.5 text-center ring-1 ring-amber-100/50">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <p className="text-lg font-bold text-amber-700">{service.averageRating.toFixed(1)}</p>
                          </div>
                          <p className="text-xs text-amber-600">Rating</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Service Details */}
                  <div className="space-y-3">
                    {service.address && (
                      <div className="flex items-start gap-3 rounded-xl bg-gray-50/50 p-3 ring-1 ring-gray-100">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FFD54F]/10">
                          <MapPin className="size-4 text-[#0A1F44]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Location</p>
                          <p className="text-sm font-medium text-foreground">{service.address}</p>
                        </div>
                      </div>
                    )}
                    {service.serviceAreaRadiusKm && (
                      <div className="flex items-start gap-3 rounded-xl bg-gray-50/50 p-3 ring-1 ring-gray-100">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <CheckCircle2 className="size-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Service Area</p>
                          <p className="text-sm font-medium text-foreground">
                            Within {service.serviceAreaRadiusKm} km radius
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── Similar Services - Horizontal Scrollable ──────────── */}
            {similarServices.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#132D5E] text-white">
                    <Wrench className="size-3.5" />
                  </div>
                  Similar Services
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {similarServices.map((s, idx) => {
                    const sImages = s.images ? JSON.parse(s.images) : [];
                    return (
                      <motion.div
                        key={s.id}
                        variants={scaleIn}
                        custom={idx}
                        className="group w-64 shrink-0 cursor-pointer"
                        onClick={() => {
                          navigate('service-detail', { serviceId: s.id });
                          window.scrollTo(0, 0);
                        }}
                      >
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#0A1F44]/20 hover:-translate-y-1">
                          {/* Service Image */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/10">
                            {sImages[0] ? (
                              <img
                                src={sImages[0]}
                                alt={s.title}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center">
                                <Wrench className="size-10 text-[#FFD54F]" />
                              </div>
                            )}
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            {/* Price badge */}
                            <div className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-sm font-bold text-gradient backdrop-blur-sm shadow-sm">
                              ₹{s.basePrice}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-[#0A1F44] transition-colors">
                              {s.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{s.provider.name}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold">{s.averageRating.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({s.totalReviews})</span>
                              </div>
                              {s.city && (
                                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                  <MapPin className="size-2.5" /> {s.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

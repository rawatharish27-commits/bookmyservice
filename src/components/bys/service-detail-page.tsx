'use client';

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
} from 'lucide-react';

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ServiceDetailPage() {
  const { navigate, nav } = useApp();
  const { user, token } = useAuth();
  const serviceId = nav.params.serviceId;
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
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
    }
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <AlertCircle className="mx-auto size-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Failed to load service details</p>
        <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="mt-4 h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-4 h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('categories')} className="cursor-pointer">
              Categories
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('category-detail', { categoryId: String(service.category.id) })}
              className="cursor-pointer"
            >
              {service.category.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">{service.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('category-detail', { categoryId: String(service.category.id) })}
        className="mb-4 text-muted-foreground"
      >
        <ArrowLeft className="mr-1 size-4" /> Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage]}
                  alt={service.title}
                  className="aspect-video w-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                      {images.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`size-2 rounded-full transition-colors ${
                            i === currentImage ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <Wrench className="size-20 text-emerald-300" />
              </div>
            )}
          </div>

          {/* Title and Details */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{service.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">{service.category.name}</Badge>
                  {service.subcategory && (
                    <Badge variant="outline">{service.subcategory.name}</Badge>
                  )}
                  {service.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {service.city}
                      {service.state && `, ${service.state}`}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleFavorite}
                disabled={favoriteLoading}
              >
                <Heart
                  className={`size-5 ${
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                  }`}
                />
              </Button>
            </div>

            {/* Rating and Stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.round(service.averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">{service.averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({service.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>{service.totalBookings} bookings</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold">About This Service</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{service.description}</p>
          </div>

          <Separator className="my-6" />

          {/* Availability */}
          {service.availability && service.availability.length > 0 && (
            <>
              <div>
                <h2 className="text-lg font-semibold">Availability</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {service.availability
                    .filter((a) => a.isAvailable)
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-2 rounded-lg border bg-emerald-50/50 p-3 text-sm"
                      >
                        <Calendar className="size-4 text-emerald-600" />
                        <span className="font-medium">{DAY_NAMES[slot.dayOfWeek]}</span>
                        <span className="text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <span className="text-sm text-muted-foreground">{service.totalReviews} total</span>
            </div>
            {reviews.length > 0 ? (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {review.reviewer.profileImageUrl && (
                            <AvatarImage src={review.reviewer.profileImageUrl} alt={review.reviewer.name} />
                          )}
                          <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                            {getInitials(review.reviewer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.reviewer.name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="ml-1 text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border p-6 text-center">
                <MessageSquare className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="sticky top-20 rounded-xl">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-emerald-600">₹{service.basePrice}</span>
                  {service.priceNegotiable && (
                    <Badge className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Negotiable
                    </Badge>
                  )}
                </div>
                {service.serviceDurationMinutes && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="size-3" /> {service.serviceDurationMinutes} minutes
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                size="lg"
                onClick={() => navigate('booking', { serviceId: service.id })}
              >
                Book Now
              </Button>

              {service.priceNegotiable && (
                <Button
                  variant="outline"
                  className="mt-2 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => navigate('booking', { serviceId: service.id })}
                >
                  Negotiate Price
                </Button>
              )}

              <Separator className="my-4" />

              {/* Provider Info */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Service Provider</h3>
                <div
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  onClick={() => navigate('category-detail', { categoryId: String(service.category.id) })}
                >
                  <Avatar className="size-10">
                    {service.provider.profileImageUrl && (
                      <AvatarImage src={service.provider.profileImageUrl} alt={service.provider.name} />
                    )}
                    <AvatarFallback className="bg-emerald-100 text-sm text-emerald-700">
                      {getInitials(service.provider.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{service.provider.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      <span>Verified Provider</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {service.totalBookings > 0 && (
                    <p>{service.totalBookings} completed bookings</p>
                  )}
                  {service.averageRating > 0 && (
                    <p className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {service.averageRating.toFixed(1)} average rating
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Service Details */}
              <div className="space-y-2 text-sm">
                {service.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-muted-foreground">{service.address}</span>
                  </div>
                )}
                {service.serviceAreaRadiusKm && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-muted-foreground">
                      Serves within {service.serviceAreaRadiusKm} km radius
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Similar Services */}
          {similarServices.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Similar Services</h3>
              <div className="space-y-3">
                {similarServices.map((s) => (
                  <Card
                    key={s.id}
                    className="cursor-pointer rounded-xl transition-all hover:border-emerald-200 hover:shadow-md"
                    onClick={() => {
                      navigate('service-detail', { serviceId: s.id });
                      window.scrollTo(0, 0);
                    }}
                  >
                    <CardContent className="flex gap-3 p-3">
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                        {s.images ? (
                          <img
                            src={JSON.parse(s.images)[0] || ''}
                            alt={s.title}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Wrench className="size-6 text-emerald-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.provider.name}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs">{s.averageRating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">₹{s.basePrice}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

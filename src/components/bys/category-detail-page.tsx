'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

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
};

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-8" />;
}

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
            <BreadcrumbPage>{category?.name || 'Category'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('categories')}
        className="mb-4 text-muted-foreground"
      >
        <ArrowLeft className="mr-1 size-4" /> Back to Categories
      </Button>

      {/* Category Header */}
      {catLoading ? (
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      ) : catError ? (
        <div className="mb-8 rounded-lg bg-red-50 p-6 text-center">
          <FolderOpen className="mx-auto size-12 text-red-300" />
          <p className="mt-2 text-muted-foreground">Failed to load category</p>
          <Button variant="outline" size="sm" onClick={refetchCat} className="mt-2">
            Retry
          </Button>
        </div>
      ) : category ? (
        <div className="mb-8 flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            {getCategoryIcon(category.icon)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            {category.description && (
              <p className="mt-1 text-muted-foreground">{category.description}</p>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{category.subcategories.length} subcategories</span>
              <span>·</span>
              <span>{category.servicesCount} services</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Subcategories Grid */}
      {category && category.subcategories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Subcategories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {category.subcategories.map((sub) => (
              <Card
                key={sub.id}
                className="cursor-pointer rounded-xl transition-all hover:border-emerald-200 hover:shadow-md"
                onClick={() =>
                  navigate('search', {
                    categoryId: String(category.id),
                    subcategoryId: String(sub.id),
                  })
                }
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{sub.name}</p>
                    {sub.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">{sub.description}</p>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Popular Services in Category */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Popular Services</h2>
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
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load services</p>
            <Button variant="outline" size="sm" onClick={refetchSrv} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {srvLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-xl">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="mb-2 h-5 w-3/4" />
                      <Skeleton className="mb-2 h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                  </Card>
                ))
              : services.map((service) => (
                  <Card
                    key={service.id}
                    className="cursor-pointer overflow-hidden rounded-xl transition-all hover:border-emerald-200 hover:shadow-md"
                    onClick={() => navigate('service-detail', { serviceId: service.id })}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-emerald-50 to-teal-50">
                      {service.images ? (
                        <img
                          src={JSON.parse(service.images)[0] || ''}
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
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold leading-tight">{service.title}</h3>
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
                ))}
          </div>
        )}

        {!srvLoading && !srvError && services.length === 0 && (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-2 font-medium">No services found</p>
            <p className="text-sm text-muted-foreground">
              No services available in this category yet
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

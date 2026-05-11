'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  subcategoriesCount: number;
  servicesCount: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="size-8" />,
  Zap: <Zap className="size-8" />,
  Droplets: <Droplets className="size-8" />,
  Wind: <Wind className="size-8" />,
  ShieldCheck: <ShieldCheck className="size-8" />,
};

const CATEGORY_COLORS: Record<string, { bg: string; iconBg: string; iconText: string; border: string; hoverBorder: string }> = {
  plumbing: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    border: 'border-blue-100',
    hoverBorder: 'hover:border-blue-300',
  },
  electrical: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    border: 'border-amber-100',
    hoverBorder: 'hover:border-amber-300',
  },
  'ac-hvac': {
    bg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-600',
    border: 'border-cyan-100',
    hoverBorder: 'hover:border-cyan-300',
  },
};

const DEFAULT_COLOR = {
  bg: 'bg-emerald-50',
  iconBg: 'bg-emerald-100',
  iconText: 'text-emerald-600',
  border: 'border-emerald-100',
  hoverBorder: 'hover:border-emerald-300',
};

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-8" />;
}

function getCategoryColors(slug?: string) {
  if (slug && CATEGORY_COLORS[slug]) return CATEGORY_COLORS[slug];
  return DEFAULT_COLOR;
}

function CategorySkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="mb-4 size-20 shrink-0 rounded-2xl" />
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="mb-1 h-4 w-full" />
          <Skeleton className="mb-4 h-4 w-3/4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoriesPage() {
  const { navigate } = useApp();

  const { data: categoriesData, loading, error, refetch } = useApi<Category[]>('/api/categories');

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

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
            <BreadcrumbPage>Services</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <Wrench className="size-4" />
          Professional Home Services
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Expert home maintenance &amp; repair services you can trust
        </p>
      </div>

      {/* Trust Badges */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          <span>Verified Providers</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-emerald-600" />
          <span>On-Time Service</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-emerald-600" />
          <span>Trusted by Thousands</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <FolderOpen className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Failed to load categories</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Categories Grid */}
      {!error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat) => {
                const colors = getCategoryColors(cat.slug);
                return (
                  <Card
                    key={cat.id}
                    className={`group cursor-pointer rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${colors.border} ${colors.hoverBorder}`}
                    onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        {/* Icon */}
                        <div
                          className={`mb-5 flex size-20 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${colors.iconBg} ${colors.iconText}`}
                        >
                          {getCategoryIcon(cat.icon)}
                        </div>

                        {/* Name */}
                        <h3 className="mb-2 text-xl font-bold">{cat.name}</h3>

                        {/* Description */}
                        {cat.description && (
                          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {cat.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="mb-5 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="size-3.5" />
                            {cat.subcategoriesCount} subcategories
                          </span>
                          <span className="flex items-center gap-1">
                            <Wrench className="size-3.5" />
                            {cat.servicesCount} services
                          </span>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-all group-hover:gap-2">
                          Explore Services
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && categories.length === 0 && (
        <div className="py-12 text-center">
          <FolderOpen className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No categories available yet</p>
          <p className="text-sm text-muted-foreground">
            Please check back later for available services
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      {!loading && !error && categories.length > 0 && (
        <div className="mt-12 rounded-2xl bg-emerald-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold sm:text-2xl">Need a Custom Service?</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Contact us and we&apos;ll connect you with the right professional.
          </p>
          <Button
            className="mt-5 bg-emerald-600 text-white hover:bg-emerald-700"
            size="lg"
            onClick={() => navigate('contact')}
          >
            Contact Us
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Sparkles,
  Wrench,
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
  ChevronRight,
  FolderOpen,
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
  Wrench: <Wrench className="size-7" />,
  Zap: <Zap className="size-7" />,
  Paintbrush: <Paintbrush className="size-7" />,
  Droplets: <Droplets className="size-7" />,
  Plug: <Plug className="size-7" />,
  Hammer: <Hammer className="size-7" />,
  Scissors: <Scissors className="size-7" />,
  Wind: <Wind className="size-7" />,
  ShieldCheck: <ShieldCheck className="size-7" />,
  Home: <HomeIcon className="size-7" />,
  Building: <Building className="size-7" />,
  TreePine: <TreePine className="size-7" />,
};

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-7" />;
}

function CategorySkeleton() {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 shrink-0 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoriesPage() {
  const { navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categoriesData, loading, error, refetch } = useApi<Category[]>('/api/categories');

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

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
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse through our service categories to find the help you need
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <CategorySkeleton key={i} />)
            : filteredCategories.map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer rounded-xl transition-all hover:border-emerald-200 hover:shadow-md"
                  onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{cat.name}</h3>
                        {cat.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {cat.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{cat.subcategoriesCount} subcategories</span>
                          <span>{cat.servicesCount} services</span>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="py-12 text-center">
          <FolderOpen className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No categories found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search query' : 'No categories available yet'}
          </p>
          {searchQuery && (
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-3">
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

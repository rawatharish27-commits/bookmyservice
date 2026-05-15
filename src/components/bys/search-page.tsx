'use client';

import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Search,
  Star,
  MapPin,
  Wrench,
  SlidersHorizontal,
  X,
  FolderOpen,
} from 'lucide-react';

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

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function SearchPage() {
  const { navigate, nav } = useApp();
  const initialCategory = nav.params.categoryId || '';
  const initialSubcategory = nav.params.subcategoryId || '';

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchUrl, setSearchUrl] = useState<string | null>(null);

  const { data: categoriesData } = useApi<Category[]>('/api/categories');
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: resultsData, loading, error, refetch } = useApi<{
    services: ServiceItem[];
    pagination: { total: number; page: number; totalPages: number };
  }>(searchUrl);

  const services = resultsData?.services || [];

  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (categoryId) params.set('category', categoryId);
    if (initialSubcategory) params.set('subcategory', initialSubcategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (city.trim()) params.set('city', city.trim());
    params.set('limit', '12');
    return `/api/services/search?${params.toString()}`;
  }, [query, categoryId, initialSubcategory, minPrice, maxPrice, city]);

  const handleSearch = () => {
    const url = buildSearchUrl();
    setSearchUrl(url);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setQuery('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setCity('');
    setSearchUrl(null);
    setSearched(false);
  };

  const hasActiveFilters = query || categoryId || minPrice || maxPrice || city;

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
            <BreadcrumbPage>Search Services</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Find Services</h1>
        <p className="mt-2 text-muted-foreground">
          Search for the perfect service provider for your needs
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'border-blue-200 bg-blue-50 text-blue-800' : ''}
        >
          <SlidersHorizontal className="mr-1 size-4" />
          Filters
        </Button>
        <Button onClick={handleSearch} className="bg-blue-800 text-white hover:bg-[#1e3a5f]">
          Search
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-6 rounded-xl">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Min Price (₹)</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Max Price (₹)</label>
              <Input
                type="number"
                placeholder="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
              <Input
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="mr-1 size-3" /> Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {query && (
            <Badge variant="secondary" className="gap-1">
              &ldquo;{query}&rdquo;
              <X className="size-3 cursor-pointer" onClick={() => setQuery('')} />
            </Badge>
          )}
          {categoryId && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => String(c.id) === categoryId)?.name || 'Category'}
              <X className="size-3 cursor-pointer" onClick={() => setCategoryId('')} />
            </Badge>
          )}
          {minPrice && (
            <Badge variant="secondary" className="gap-1">
              Min ₹{minPrice}
              <X className="size-3 cursor-pointer" onClick={() => setMinPrice('')} />
            </Badge>
          )}
          {maxPrice && (
            <Badge variant="secondary" className="gap-1">
              Max ₹{maxPrice}
              <X className="size-3 cursor-pointer" onClick={() => setMaxPrice('')} />
            </Badge>
          )}
          {city && (
            <Badge variant="secondary" className="gap-1">
              {city}
              <X className="size-3 cursor-pointer" onClick={() => setCity('')} />
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      {error && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Failed to search services</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!error && searched && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {loading ? 'Searching...' : `${resultsData?.pagination?.total || 0} services found`}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
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
                    className="cursor-pointer overflow-hidden rounded-xl transition-all hover:border-blue-200 hover:shadow-md"
                    onClick={() => navigate('service-detail', { serviceId: service.id })}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-sky-50">
                      {service.images ? (
                        <img
                          src={JSON.parse(service.images)[0] || ''}
                          alt={service.title}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Wrench className="size-12 text-blue-400" />
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
                        <span className="text-lg font-bold text-blue-700">₹{service.basePrice}</span>
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-blue-800 text-white hover:bg-[#1e3a5f]"
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

          {!loading && services.length === 0 && (
            <div className="py-12 text-center">
              <FolderOpen className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-2 font-medium">No services found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters} className="mt-3">
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="py-16 text-center">
          <Search className="mx-auto size-16 text-blue-300" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Search for services to get started
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a keyword and apply filters to find the perfect service
          </p>
        </div>
      )}
    </div>
  );
}

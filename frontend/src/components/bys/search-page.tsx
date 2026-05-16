import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Droplets,
  Zap,
  Wind,
  ArrowRight,
  Sparkles,
  IndianRupee,
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
  provider?: { id: string; name: string; profileImageUrl?: string };
  category: { id: number; name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="size-4" />,
  electrical: <Zap className="size-4" />,
  'ac-hvac': <Wind className="size-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  plumbing: 'from-blue-500 to-cyan-500',
  electrical: 'from-sky-500 to-yellow-500',
  'ac-hvac': 'from-teal-500 to-emerald-500',
};

const CATEGORY_BG_COLORS: Record<string, string> = {
  plumbing: 'bg-blue-50 text-blue-700 border-blue-200',
  electrical: 'bg-sky-50 text-sky-700 border-sky-200',
  'ac-hvac': 'bg-teal-50 text-teal-700 border-teal-200',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

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

  const activeCategorySlug = categoryId
    ? categories.find((c) => String(c.id) === categoryId)?.slug || ''
    : '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <motion.div {...fadeUp}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gradient font-semibold">Search Services</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-10"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 sm:p-12">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-white/5" />
            <div className="absolute right-1/4 top-1/4 size-32 rounded-full bg-white/5" />
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          </div>

          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
            >
              <Search className="size-7 text-white" />
            </motion.div>
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              Find Your Perfect Service
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-emerald-100">
              Search across verified professionals for plumbing, electrical, and AC services
            </p>

            {/* Search Input */}
            <div className="mx-auto max-w-2xl">
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-100" />
                <div className="relative flex items-center overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/20">
                  <div className="flex items-center pl-4">
                    <Search className="size-5 text-emerald-500" />
                  </div>
                  <Input
                    placeholder="Search for plumbing, electrical, AC services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-14 border-0 bg-transparent pl-3 text-base shadow-none placeholder:text-gray-400 focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 pr-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`size-10 rounded-lg transition-all ${showFilters ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <SlidersHorizontal className="size-5" />
                    </Button>
                    <Button
                      onClick={handleSearch}
                      className="shimmer h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Sparkles className="mr-1.5 size-4" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => {
                const slug = cat.slug;
                const isActive = String(cat.id) === categoryId;
                const colorClass = CATEGORY_BG_COLORS[slug] || 'bg-emerald-50 text-emerald-700 border-emerald-200';
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCategoryId(isActive ? '' : String(cat.id));
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? `${colorClass} shadow-md`
                        : 'border-white/20 bg-white/10 text-white/90 hover:bg-white/20'
                    }`}
                  >
                    {CATEGORY_ICONS[slug]}
                    {cat.name}
                    {isActive && <X className="ml-1 size-3" onClick={(e) => { e.stopPropagation(); setCategoryId(''); }} />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <SlidersHorizontal className="size-4 text-emerald-600" />
                  Advanced Filters
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <X className="mr-1 size-3" /> Clear All
                  </Button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          <span className="flex items-center gap-2">
                            {CATEGORY_ICONS[cat.slug]}
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Min Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-11 rounded-xl border-gray-200 bg-white/80 pl-9 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Max Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="10000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-11 rounded-xl border-gray-200 bg-white/80 pl-9 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11 rounded-xl border-gray-200 bg-white/80 pl-9 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 mt-6 flex flex-wrap gap-2"
          >
            {query && (
              <Badge variant="secondary" className="gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                &ldquo;{query}&rdquo;
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setQuery('')} />
              </Badge>
            )}
            {categoryId && (
              <Badge variant="secondary" className="gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                {CATEGORY_ICONS[activeCategorySlug]}
                {categories.find((c) => String(c.id) === categoryId)?.name || 'Category'}
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setCategoryId('')} />
              </Badge>
            )}
            {minPrice && (
              <Badge variant="secondary" className="gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Min ₹{minPrice}
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setMinPrice('')} />
              </Badge>
            )}
            {maxPrice && (
              <Badge variant="secondary" className="gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Max ₹{maxPrice}
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setMaxPrice('')} />
              </Badge>
            )}
            {city && (
              <Badge variant="secondary" className="gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                <MapPin className="size-3" />{city}
                <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => setCity('')} />
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <motion.div {...fadeUp} className="py-16 text-center">
          <div className="glass mx-auto max-w-md rounded-2xl p-8">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-50">
              <Search className="size-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Search Failed</p>
            <p className="mt-1 text-sm text-muted-foreground">We couldn&apos;t complete your search. Please try again.</p>
            <Button variant="outline" onClick={refetch} className="mt-4 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50">
              Retry Search
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!error && searched && (
        <>
          <motion.div {...fadeUp} className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
                  Searching...
                </span>
              ) : (
                <span>
                  <span className="font-semibold text-foreground">{resultsData?.pagination?.total || 0}</span>{' '}
                  services found
                </span>
              )}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="overflow-hidden rounded-2xl border bg-white"
                  >
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="mt-3 h-5 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-1/2" />
                      <div className="mt-3 flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
                    </div>
                  </motion.div>
                ))
              : services.map((service) => {
                  const catSlug = service.category?.slug || '';
                  const gradientColor = CATEGORY_COLORS[catSlug] || 'from-emerald-500 to-teal-500';
                  return (
                    <motion.div
                      key={service.id}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200/50"
                      onClick={() => navigate('service-detail', { serviceId: service.id })}
                    >
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                        {service.images ? (
                          <img
                            src={JSON.parse(service.images)[0] || ''}
                            alt={service.title}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <div className={`flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientColor} text-white shadow-lg`}>
                              <Wrench className="size-8" />
                            </div>
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {/* Negotiable badge */}
                        {service.priceNegotiable && (
                          <Badge className="absolute right-3 top-3 border-0 bg-sky-100/90 text-sky-700 backdrop-blur-sm hover:bg-sky-100/90">
                            Negotiable
                          </Badge>
                        )}
                        {/* Category badge */}
                        <div className="absolute left-3 top-3">
                          <div className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${gradientColor} px-2.5 py-1 text-xs font-medium text-white shadow-md`}>
                            {CATEGORY_ICONS[catSlug]}
                            {service.category?.name}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Provider */}
                        <div className="flex items-center gap-2">
                          <div className={`flex size-8 items-center justify-center rounded-full bg-gradient-to-br ${gradientColor} text-xs font-bold text-white`}>
                            {service.provider?.name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-700">{service.provider?.name || 'Provider'}</p>
                            {service.city && (
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3" />
                                {service.city}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="mt-3 font-semibold leading-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {service.title}
                        </h3>

                        {/* Rating and Price */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              <Star className="size-4 fill-cyan-400 text-cyan-400 drop-shadow-[0_0_2px_rgba(6,182,212,0.4)]" />
                              <span className="text-sm font-semibold">{service.averageRating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({service.totalReviews})</span>
                          </div>
                          <span className="text-gradient text-lg font-bold">₹{service.basePrice}</span>
                        </div>

                        {/* Book Button */}
                        <Button
                          size="sm"
                          className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('service-detail', { serviceId: service.id });
                          }}
                        >
                          Book Now
                          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
          </motion.div>

          {/* Empty State */}
          {!loading && services.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="py-16 text-center"
            >
              <div className="glass mx-auto max-w-md rounded-3xl p-10">
                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50">
                  <FolderOpen className="size-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Services Found</h3>
                <p className="mt-2 text-muted-foreground">
                  We couldn&apos;t find any services matching your criteria. Try adjusting your search or filters.
                </p>
                <Button
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                >
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-20 text-center"
        >
          <div className="relative mx-auto mb-6 size-32">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="size-12 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            Search for Services to Get Started
          </h3>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Enter a keyword and apply filters to find the perfect professional for your home service needs
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Plumbing', icon: <Droplets className="size-4" />, color: 'from-blue-500 to-cyan-500' },
              { label: 'Electrical', icon: <Zap className="size-4" />, color: 'from-sky-500 to-yellow-500' },
              { label: 'AC & HVAC', icon: <Wind className="size-4" />, color: 'from-teal-500 to-emerald-500' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const cat = categories.find((c) => c.name === item.label);
                  if (cat) {
                    setCategoryId(String(cat.id));
                    handleSearch();
                  }
                }}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-md ring-1 ring-gray-100 transition-shadow hover:shadow-lg"
              >
                <div className={`flex size-7 items-center justify-center rounded-full bg-gradient-to-r ${item.color} text-white`}>
                  {item.icon}
                </div>
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

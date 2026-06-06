'use client';

import { useState, useEffect } from 'react';
import { useApp, type Page } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useRecommendations, type RecommendedService, type TrendingService } from '@/hooks/use-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Star,
  TrendingUp,
  ArrowRight,
  MapPin,
  ChevronRight,
  Zap,
  Crown,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Service Card ──────────────────────────────────────────────────────────────

function RecommendationCard({
  service,
  onClick,
}: {
  service: RecommendedService | TrendingService;
  onClick: () => void;
}) {
  const isTrending = 'growthRate' in service;

  return (
    <Card
      className="group cursor-pointer border border-gray-100 transition-all duration-300 hover:border-[#132D5E]/20 hover:shadow-lg hover:shadow-[#132D5E]/5"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {service.title}
              </h3>
              {isTrending && (service as TrendingService).growthRate > 0 && (
                <Badge variant="secondary" className="shrink-0 bg-[#FFD54F]/10 text-[#132D5E] text-[10px] px-1.5 py-0.5">
                  <TrendingUp className="mr-0.5 size-3" />
                  +{(service as TrendingService).growthRate.toFixed(0)}%
                </Badge>
              )}
            </div>
            {service.provider && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                by {service.provider.name}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-[#132D5E]">
              ₹{service.basePrice?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">
              {service.averageRating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {service.totalBookings || 0} bookings
          </span>
          {service.city && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {service.city}
            </span>
          )}
        </div>

        {'reason' in service && service.reason && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md bg-gradient-to-r from-[#0A1F44]/5 to-[#FFD54F]/5 px-2.5 py-1.5">
            <Sparkles className="mt-0.5 size-3 shrink-0 text-[#FFD54F]" />
            <p className="text-[11px] leading-relaxed text-[#132D5E]/80">
              {service.reason}
            </p>
          </div>
        )}

        {service.category && (
          <Badge variant="outline" className="mt-2 text-[10px]">
            {service.category.name}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function RecommendationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-1.5 h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-2 flex gap-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="mt-2 h-8 w-full rounded-md" />
            <Skeleton className="mt-2 h-5 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiRecommendationsSection() {
  const { navigate } = useApp();
  const { user, token } = useAuth();
  const {
    personalized,
    trending,
  } = useRecommendations();

  const [showPersonalized, setShowPersonalized] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (token) {
      personalized.fetch().then((data) => {
        setShowPersonalized(!!data && data.length > 0);
      });
    }
    trending.fetch(user?.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.city]);

  const handleServiceClick = (serviceId: string) => {
    navigate('service-detail' as Page, { id: serviceId });
  };

  const isLoading = (token && personalized.loading) || trending.loading;

  return (
    <section className="bg-gradient-to-b from-white to-slate-50/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#FFD54F] shadow-md shadow-[#132D5E]/20">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {token ? 'Recommended for You' : 'Trending Services'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {token
                  ? 'AI-powered suggestions based on your preferences'
                  : 'Popular services people are booking right now'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="hidden items-center gap-1 text-sm font-medium text-[#132D5E] sm:flex"
            onClick={() => navigate('recommendations' as Page)}
          >
            See All <ChevronRight className="size-4" />
          </Button>
        </motion.div>

        {/* Personalized Recommendations (logged-in users) */}
        {token && showPersonalized && personalized.data && personalized.data.length > 0 && (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="size-4 text-amber-500" />
              <h3 className="text-base font-semibold text-foreground">Recommended for You</h3>
              <Badge variant="secondary" className="bg-[#132D5E]/10 text-[#132D5E] text-[10px]">
                AI
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {personalized.data.slice(0, 4).map((service) => (
                <RecommendationCard
                  key={service.serviceId}
                  service={service}
                  onClick={() => handleServiceClick(service.serviceId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Personalized Loading */}
        {token && personalized.loading && (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="size-4 text-amber-500" />
              <h3 className="text-base font-semibold text-foreground">Recommended for You</h3>
              <Badge variant="secondary" className="bg-[#132D5E]/10 text-[#132D5E] text-[10px]">
                AI
              </Badge>
            </div>
            <RecommendationSkeleton />
          </div>
        )}

        {/* Trending Services */}
        {trending.data && trending.data.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Zap className="size-4 text-orange-500" />
              <h3 className="text-base font-semibold text-foreground">
                Trending Now
              </h3>
              {user?.city && (
                <Badge variant="outline" className="text-[10px]">
                  <MapPin className="mr-1 size-3" />
                  {user.city}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trending.data.slice(0, 4).map((service) => (
                <RecommendationCard
                  key={service.serviceId}
                  service={service}
                  onClick={() => handleServiceClick(service.serviceId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Loading */}
        {trending.loading && !trending.data && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Zap className="size-4 text-orange-500" />
              <h3 className="text-base font-semibold text-foreground">Trending Now</h3>
            </div>
            <RecommendationSkeleton />
          </div>
        )}

        {/* No data */}
        {!isLoading && (!trending.data || trending.data.length === 0) && (!token || !personalized.data || personalized.data.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No recommendations available yet. Start booking to get personalized suggestions!
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('categories' as Page)}
            >
              Browse Services
            </Button>
          </div>
        )}

        {/* Mobile See All button */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => navigate('recommendations' as Page)}
          >
            See All Recommendations <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>
    </section>
  );
}

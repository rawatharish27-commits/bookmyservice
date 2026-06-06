'use client';

import { useState, useEffect } from 'react';
import { useApp, type Page } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useRecommendations, type RecommendedService, type TrendingService, type InsightData } from '@/hooks/use-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  Star,
  TrendingUp,
  ArrowRight,
  MapPin,
  Zap,
  Crown,
  BarChart3,
  Lightbulb,
  Wallet,
  Clock,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Service Card ──────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onClick,
  showReason = false,
}: {
  service: RecommendedService | TrendingService;
  onClick: () => void;
  showReason?: boolean;
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

        {showReason && 'reason' in service && service.reason && (
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

// ─── Insight Card ──────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: { type: string; title: string; description: string; value?: string | number; trend?: string } }) {
  const iconMap: Record<string, React.ReactNode> = {
    spending: <Wallet className="size-5 text-[#FFD54F]" />,
    frequency: <Clock className="size-5 text-[#FFD54F]" />,
    timing: <Clock className="size-5 text-violet-600" />,
    category: <Heart className="size-5 text-rose-600" />,
    savings: <IndianRupee className="size-5 text-[#FFD54F]" />,
    preference: <Star className="size-5 text-amber-600" />,
  };

  const trendIcon = insight.trend === 'up'
    ? <ArrowUpRight className="size-3 text-[#FFD54F]" />
    : insight.trend === 'down'
      ? <ArrowDownRight className="size-3 text-red-500" />
      : <Minus className="size-3 text-yellow-600" />;

  return (
    <Card className="border border-gray-100 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0A1F44]/5 to-[#FFD54F]/5">
            {iconMap[insight.type] || <Lightbulb className="size-5 text-[#FFD54F]" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
              {insight.trend && trendIcon}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {insight.description}
            </p>
            {insight.value !== undefined && (
              <p className="mt-1.5 text-base font-bold text-[#132D5E]">
                {typeof insight.value === 'number' ? `₹${insight.value.toLocaleString()}` : insight.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
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

function InsightsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-3/4" />
                <Skeleton className="mt-2 h-5 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export function RecommendationsPage() {
  const { navigate } = useApp();
  const { user, token } = useAuth();
  const {
    personalized,
    trending,
    insights,
  } = useRecommendations();

  const [activeTab, setActiveTab] = useState<string>(token ? 'for-you' : 'trending');

  // Fetch all data on mount
  useEffect(() => {
    if (token) {
      personalized.fetch();
      insights.fetch();
    }
    trending.fetch(user?.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.city]);

  const handleServiceClick = (serviceId: string) => {
    navigate('service-detail' as Page, { id: serviceId });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => navigate('home' as Page)}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#FFD54F] shadow-md shadow-[#132D5E]/20">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Recommendations</h1>
              <p className="text-sm text-muted-foreground">
                Personalized suggestions powered by AI
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start gap-1 bg-muted/50 p-1 sm:w-auto">
          {token && (
            <TabsTrigger value="for-you" className="gap-1.5 text-xs sm:text-sm">
              <Crown className="size-3.5" />
              For You
            </TabsTrigger>
          )}
          <TabsTrigger value="trending" className="gap-1.5 text-xs sm:text-sm">
            <Zap className="size-3.5" />
            Trending
          </TabsTrigger>
          {token && (
            <TabsTrigger value="insights" className="gap-1.5 text-xs sm:text-sm">
              <Lightbulb className="size-3.5" />
              Insights
            </TabsTrigger>
          )}
        </TabsList>

        {/* For You Tab */}
        {token && (
          <TabsContent value="for-you" className="mt-0">
            {personalized.loading && <LoadingGrid />}

            {!personalized.loading && personalized.data && personalized.data.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[#132D5E]/10 text-[#132D5E]">
                    <Sparkles className="mr-1 size-3" /> AI-Powered
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Based on your booking history and preferences
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {personalized.data.map((service) => (
                    <ServiceCard
                      key={service.serviceId}
                      service={service}
                      onClick={() => handleServiceClick(service.serviceId)}
                      showReason
                    />
                  ))}
                </div>
              </div>
            )}

            {!personalized.loading && (!personalized.data || personalized.data.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="mb-4 size-12 text-muted-foreground/20" />
                <h3 className="text-lg font-semibold text-foreground">No recommendations yet</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Book some services first to get personalized AI recommendations tailored to your preferences.
                </p>
                <Button
                  className="mt-6 bg-gradient-to-r from-[#0A1F44] to-[#FFD54F] text-white"
                  onClick={() => navigate('categories' as Page)}
                >
                  Browse Services <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        )}

        {/* Trending Tab */}
        <TabsContent value="trending" className="mt-0">
          {trending.loading && !trending.data && <LoadingGrid />}

          {!trending.loading && trending.data && trending.data.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  <TrendingUp className="mr-1 size-3" /> Hot
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Most booked services in {user?.city || 'your area'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trending.data.map((service) => (
                  <ServiceCard
                    key={service.serviceId}
                    service={service}
                    onClick={() => handleServiceClick(service.serviceId)}
                  />
                ))}
              </div>
            </div>
          )}

          {!trending.loading && (!trending.data || trending.data.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TrendingUp className="mb-4 size-12 text-muted-foreground/20" />
              <h3 className="text-lg font-semibold text-foreground">No trending services</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Trending data is updated regularly. Check back soon!
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => navigate('categories' as Page)}
              >
                Browse All Services
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Insights Tab */}
        {token && (
          <TabsContent value="insights" className="mt-0">
            {insights.loading && <InsightsLoadingSkeleton />}

            {!insights.loading && insights.data && (
              <div>
                {/* Spending Patterns */}
                {insights.data.spendingPatterns && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-2">
                      <Wallet className="size-4 text-[#FFD54F]" />
                      <h3 className="text-base font-semibold">Spending Patterns</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Card className="border-l-4 border-l-[#FFD54F]">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
                          <p className="mt-1 text-xl font-bold text-[#132D5E]">
                            ₹{insights.data.spendingPatterns.totalSpent?.toLocaleString() || 0}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-[#FFD54F]">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-muted-foreground">Avg. Booking</p>
                          <p className="mt-1 text-xl font-bold text-[#132D5E]">
                            ₹{insights.data.spendingPatterns.averageBookingValue?.toLocaleString() || 0}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-[#FFD54F]">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-muted-foreground">Top Category</p>
                          <p className="mt-1 text-lg font-bold text-[#D4A017] truncate">
                            {insights.data.spendingPatterns.topCategory || 'N/A'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-[#FFD54F]">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-muted-foreground">Monthly Avg.</p>
                          <p className="mt-1 text-xl font-bold text-[#FFD54F]">
                            ₹{insights.data.spendingPatterns.monthlyAverage?.toLocaleString() || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {insights.data.preferences && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-2">
                      <Heart className="size-4 text-rose-600" />
                      <h3 className="text-base font-semibold">Your Preferences</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Card className="border border-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="size-4 text-violet-600" />
                            <p className="text-xs font-medium text-muted-foreground">Preferred Time</p>
                          </div>
                          <p className="text-sm font-semibold">{insights.data.preferences.preferredTimeSlot || 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card className="border border-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="size-4 text-rose-600" />
                            <p className="text-xs font-medium text-muted-foreground">Preferred Category</p>
                          </div>
                          <p className="text-sm font-semibold">{insights.data.preferences.preferredCategory || 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card className="border border-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="size-4 text-[#FFD54F]" />
                            <p className="text-xs font-medium text-muted-foreground">Booking Frequency</p>
                          </div>
                          <p className="text-sm font-semibold">{insights.data.preferences.bookingFrequency || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {insights.data.insights && insights.data.insights.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Lightbulb className="size-4 text-amber-600" />
                      <h3 className="text-base font-semibold">AI Insights</h3>
                      <Badge variant="secondary" className="bg-[#132D5E]/10 text-[#132D5E] text-[10px]">
                        AI
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {insights.data.insights.map((insight, i) => (
                        <InsightCard key={i} insight={insight} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No insights */}
                {(!insights.data.insights || insights.data.insights.length === 0) &&
                  !insights.data.spendingPatterns &&
                  !insights.data.preferences && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Lightbulb className="mb-4 size-12 text-muted-foreground/20" />
                    <h3 className="text-lg font-semibold text-foreground">No insights yet</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Book more services to unlock AI-powered insights about your spending patterns and preferences.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!insights.loading && !insights.data && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Lightbulb className="mb-4 size-12 text-muted-foreground/20" />
                <h3 className="text-lg font-semibold text-foreground">Unable to load insights</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  We couldn&apos;t load your booking insights right now. Please try again later.
                </p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiUrl } from '@/lib/api-url';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecommendedService {
  serviceId: string;
  title: string;
  description?: string;
  basePrice: number;
  averageRating: number;
  totalBookings: number;
  category?: { id: number; name: string; slug: string };
  provider?: { id: string; name: string; profileImageUrl?: string };
  city?: string;
  reason: string;
  relevanceScore: number;
}

export interface TrendingService {
  serviceId: string;
  title: string;
  description?: string;
  basePrice: number;
  averageRating: number;
  totalBookings: number;
  category?: { id: number; name: string; slug: string };
  provider?: { id: string; name: string; profileImageUrl?: string };
  city?: string;
  bookingCount: number;
  growthRate: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'service' | 'category' | 'query' | 'trending';
  confidence: number;
}

export interface BookingInsight {
  type: string;
  title: string;
  description: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'stable';
  category?: string;
}

export interface InsightData {
  insights: BookingInsight[];
  spendingPatterns?: {
    totalSpent: number;
    averageBookingValue: number;
    topCategory: string;
    monthlyAverage: number;
  };
  preferences?: {
    preferredTimeSlot: string;
    preferredCategory: string;
    bookingFrequency: string;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRecommendations() {
  const { token } = useAuth();

  // Cache refs to avoid re-fetching
  const personalizedCache = useRef<{ data: RecommendedService[] | null; timestamp: number } | null>(null);
  const similarCache = useRef<Map<string, { data: RecommendedService[]; timestamp: number }>>(new Map());
  const insightsCache = useRef<{ data: InsightData | null; timestamp: number }>(new Map() as any);
  const trendingCache = useRef<{ data: TrendingService[] | null; timestamp: number; city?: string } | null>(null);

  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [personalizedError, setPersonalizedError] = useState<string | null>(null);
  const [personalizedData, setPersonalizedData] = useState<RecommendedService[] | null>(null);

  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [similarData, setSimilarData] = useState<RecommendedService[] | null>(null);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestionsData, setSuggestionsData] = useState<SearchSuggestion[] | null>(null);

  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<InsightData | null>(null);

  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingService[] | null>(null);

  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  const isCacheValid = (timestamp: number) => Date.now() - timestamp < CACHE_TTL;

  // Get personalized recommendations
  const getPersonalized = useCallback(async () => {
    if (personalizedCache.current && isCacheValid(personalizedCache.current.timestamp)) {
      setPersonalizedData(personalizedCache.current.data);
      return personalizedCache.current.data;
    }

    setPersonalizedLoading(true);
    setPersonalizedError(null);
    try {
      const res = await fetch(apiUrl('/api/recommendations'), { headers: getAuthHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch recommendations');
      const data = result.recommendations || result || [];
      personalizedCache.current = { data, timestamp: Date.now() };
      setPersonalizedData(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setPersonalizedError(msg);
      return null;
    } finally {
      setPersonalizedLoading(false);
    }
  }, [getAuthHeaders]);

  // Get similar services
  const getSimilar = useCallback(async (serviceId: string) => {
    const cached = similarCache.current.get(serviceId);
    if (cached && isCacheValid(cached.timestamp)) {
      setSimilarData(cached.data);
      return cached.data;
    }

    setSimilarLoading(true);
    setSimilarError(null);
    try {
      const res = await fetch(apiUrl(`/api/recommendations/similar/${serviceId}`), { headers: getAuthHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch similar services');
      const data = result.recommendations || result.similar || result || [];
      similarCache.current.set(serviceId, { data, timestamp: Date.now() });
      setSimilarData(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch similar services';
      setSimilarError(msg);
      return null;
    } finally {
      setSimilarLoading(false);
    }
  }, [getAuthHeaders]);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestionsData([]);
      return [];
    }

    setSuggestionsLoading(true);
    setSuggestionsError(null);
    try {
      const res = await fetch(apiUrl(`/api/recommendations/search-suggestions?q=${encodeURIComponent(query)}`), { headers: getAuthHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch suggestions');
      const data = result.suggestions || result || [];
      setSuggestionsData(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setSuggestionsError(msg);
      return [];
    } finally {
      setSuggestionsLoading(false);
    }
  }, [getAuthHeaders]);

  // Get booking insights
  const getInsights = useCallback(async () => {
    const cached = insightsCache.current;
    if (cached && isCacheValid((cached as any).timestamp)) {
      setInsightsData((cached as any).data);
      return (cached as any).data;
    }

    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await fetch(apiUrl('/api/recommendations/insights'), { headers: getAuthHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch insights');
      const data = result.insights || result;
      insightsCache.current = { data, timestamp: Date.now() } as any;
      setInsightsData(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch insights';
      setInsightsError(msg);
      return null;
    } finally {
      setInsightsLoading(false);
    }
  }, [getAuthHeaders]);

  // Get trending services
  const getTrending = useCallback(async (city?: string) => {
    if (trendingCache.current && isCacheValid(trendingCache.current.timestamp) && trendingCache.current.city === city) {
      setTrendingData(trendingCache.current.data);
      return trendingCache.current.data;
    }

    setTrendingLoading(true);
    setTrendingError(null);
    try {
      const url = city
        ? apiUrl(`/api/recommendations/trending?city=${encodeURIComponent(city)}`)
        : apiUrl('/api/recommendations/trending');
      const res = await fetch(url);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch trending services');
      const data = result.trending || result.services || result || [];
      trendingCache.current = { data, timestamp: Date.now(), city };
      setTrendingData(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch trending services';
      setTrendingError(msg);
      return null;
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  return {
    // Personalized
    personalized: {
      data: personalizedData,
      loading: personalizedLoading,
      error: personalizedError,
      fetch: getPersonalized,
    },
    // Similar
    similar: {
      data: similarData,
      loading: similarLoading,
      error: similarError,
      fetch: getSimilar,
    },
    // Search suggestions
    suggestions: {
      data: suggestionsData,
      loading: suggestionsLoading,
      error: suggestionsError,
      fetch: getSearchSuggestions,
    },
    // Insights
    insights: {
      data: insightsData,
      loading: insightsLoading,
      error: insightsError,
      fetch: getInsights,
    },
    // Trending
    trending: {
      data: trendingData,
      loading: trendingLoading,
      error: trendingError,
      fetch: getTrending,
    },
  };
}

'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Star, MapPin, Loader2, Trash2 } from 'lucide-react';

interface Favorite {
  id: string;
  createdAt: string;
  service?: {
    id: string;
    title: string;
    description: string;
    basePrice: number;
    city?: string;
    averageRating: number;
    totalReviews: number;
    provider?: { name: string };
  };
  serviceId: string;
}

export function ClientFavoritesPage() {
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<{ favorites: Favorite[] }>('/api/favorites');
  const { mutate: removeFavorite, loading: removing } = useApiMutation();

  const favorites = data?.favorites || [];

  const handleRemove = async (serviceId: string) => {
    try {
      await removeFavorite(`/api/favorites/${serviceId}`, { method: 'DELETE' });
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <p className="text-sm text-muted-foreground">Services you&apos;ve saved for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-16 text-center">
          <Heart className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No favorites yet</p>
          <p className="text-sm text-muted-foreground">Save services you like to find them easily later</p>
          <Button
            variant="outline"
            className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => navigate('categories')}
          >
            Browse Services
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {favorites.map((fav) => {
            const service = fav.service;
            if (!service) return null;
            return (
              <Card key={fav.id} className="gap-4 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => navigate('service-detail', { serviceId: service.id })}
                      className="min-w-0 flex-1 text-left"
                    >
                      <h3 className="truncate font-semibold">{service.title}</h3>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-red-500 hover:text-red-600"
                      onClick={() => handleRemove(fav.serviceId)}
                      disabled={removing}
                    >
                      {removing ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4 fill-red-500" />}
                    </Button>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {service.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {service.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {service.averageRating?.toFixed(1) || '0.0'} ({service.totalReviews || 0})
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-700">₹{service.basePrice?.toLocaleString()}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => navigate('service-detail', { serviceId: service.id })}
                    >
                      View Details
                    </Button>
                  </div>

                  {service.provider && (
                    <p className="mt-2 text-xs text-muted-foreground">by {service.provider.name}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, Loader2, ArrowRight } from 'lucide-react';

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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <p className="text-sm text-muted-foreground">Services you&apos;ve saved for later</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-50">
            <Heart className="size-10 text-pink-300" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No favorites yet</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">Save services you like to find them easily later</p>
          <Button
            className="mt-4 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25"
            onClick={() => navigate('categories')}
          >
            Browse Services <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {favorites.map((fav, idx) => {
            const service = fav.service;
            if (!service) return null;
            return (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md">
                  <div className="h-1.5 bg-gradient-to-r from-pink-400 to-rose-500" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => navigate('service-detail', { serviceId: service.id })}
                        className="min-w-0 flex-1 text-left group-hover:text-[#1D63FF] transition-colors"
                      >
                        <h3 className="truncate font-semibold">{service.title}</h3>
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.7 }}
                        onClick={() => handleRemove(fav.serviceId)}
                        disabled={removing}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-pink-500 transition-colors hover:bg-pink-50"
                      >
                        {removing ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4 fill-pink-500" />}
                      </motion.button>
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
                        <Star className="size-3 fill-[#FFE066] text-[#FFE066]" />
                        {service.averageRating?.toFixed(1) || '0.0'} ({service.totalReviews || 0})
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-gradient text-lg font-bold">₹{service.basePrice?.toLocaleString()}</span>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-sm shadow-[#4D8AFF]/25 rounded-lg"
                        onClick={() => navigate('service-detail', { serviceId: service.id })}
                      >
                        View Details
                      </Button>
                    </div>

                    {service.provider && (
                      <p className="mt-2 text-xs text-muted-foreground">by {service.provider?.name || 'Provider'}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

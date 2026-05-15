'use client';

import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  bookingId: string;
  service: { id: string; title: string };
  reviewer: { id: string; name: string; profileImageUrl?: string };
}

interface ReviewsResponse {
  reviews?: Review[];
}

// Fallback: use bookings endpoint with reviews
export function ProviderReviewsPage() {
  const { data, loading } = useApi<ReviewsResponse>('/api/reviews');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = (data?.reviews || []) as Review[];
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`size-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">See what your clients say about you</p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-6 p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">{avgRating}</p>
              <div className="mt-1 flex">{renderStars(Math.round(avgRating))}</div>
              <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {ratingDist.map((r) => (
                <div key={r.star} className="flex items-center gap-2">
                  <span className="w-4 text-right text-sm">{r.star}</span>
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-yellow-400"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">{r.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="mb-2 size-8 text-emerald-600" />
            <p className="text-sm font-medium">Response Rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {reviews.length > 0 ? '85%' : 'N/A'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Respond to reviews to build trust</p>
          </CardContent>
        </Card>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Star className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviews will appear once clients complete bookings
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.reviewer?.name || 'Client'}</span>
                        {review.isVerified && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm text-muted-foreground">{review.rating}.0</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  {review.service && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Service: {review.service.title}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

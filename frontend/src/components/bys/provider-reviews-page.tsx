import { motion } from 'framer-motion';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

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

export function ProviderReviewsPage() {
  const { data, loading } = useApi<ReviewsResponse>('/api/reviews');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/50" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
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
        className={`size-4 ${i < rating ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.4)]' : 'text-gray-200'}`}
      />
    ));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">See what your clients say about you</p>
      </motion.div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-rose-500" />
            <CardContent className="flex items-center gap-6 p-6">
              <div className="text-center">
                <p className="text-gradient text-4xl font-bold">{avgRating}</p>
                <div className="mt-1 flex">{renderStars(Math.round(avgRating))}</div>
                <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingDist.map((r) => (
                  <div key={r.star} className="flex items-center gap-2">
                    <span className="w-4 text-right text-sm">{r.star}</span>
                    <Star className="size-3 fill-cyan-400 text-cyan-400" />
                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400"
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-muted-foreground">{r.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
                <MessageSquare className="size-7 text-white" />
              </div>
              <p className="mt-3 text-sm font-medium">Response Rate</p>
              <p className="mt-1 text-gradient text-2xl font-bold">
                {reviews.length > 0 ? '85%' : 'N/A'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Respond to reviews to build trust</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50">
                <Star className="size-10 text-sky-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No reviews yet</h3>
              <p className="mt-1 text-sm text-muted-foreground/70">Reviews will appear once clients complete bookings</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                            {review.reviewer?.name?.charAt(0) || 'C'}
                          </div>
                          <span className="font-medium">{review.reviewer?.name || 'Client'}</span>
                          {review.isVerified && (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="size-2.5" />
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
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

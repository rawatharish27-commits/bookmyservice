import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Star, Trash2, Pencil, Loader2, MessageSquare, ArrowRight } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  service?: { id: string; title: string };
  reviewed?: { id: string; name: string };
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ClientReviewsPage() {
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<{ reviews: Review[] }>('/api/reviews');
  const { mutate: updateReview, loading: updating } = useApiMutation();
  const { mutate: deleteReview, loading: deleting } = useApiMutation();

  const reviews = data?.reviews || [];

  const [editDialog, setEditDialog] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openEdit = (review: Review) => {
    setEditDialog(review);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleEdit = async () => {
    if (!editDialog) return;
    try {
      await updateReview(`/api/reviews/${editDialog.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      setEditDialog(null);
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(`/api/reviews/${id}`, { method: 'DELETE' });
      setDeleteTarget(null);
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
        <h1 className="text-2xl font-bold">My Reviews</h1>
        <p className="text-sm text-muted-foreground">Reviews you&apos;ve given to service providers</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D63FF]/10 to-[#1D63FF]/5">
            <MessageSquare className="size-10 text-[#9DC2FF]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No reviews yet</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">Complete a booking to leave your first review</p>
          <Button
            className="mt-4 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25"
            onClick={() => navigate('client-bookings')}
          >
            View My Bookings <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{review.service?.title || 'Service'}</p>
                      <p className="text-sm text-muted-foreground">
                        by {review.reviewed?.name || 'Provider'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-[#1D63FF]/5" onClick={() => openEdit(review)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog open={deleteTarget === review.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < review.rating ? 'fill-[#FFE066] text-[#FFE066] drop-shadow-[0_0_3px_rgba(255,206,50,0.4)]' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review for {editDialog?.service?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEditRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-8 ${i < editRating ? 'fill-[#FFE066] text-[#FFE066]' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)} className="rounded-xl">Cancel</Button>
            <Button className="bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white rounded-xl" onClick={handleEdit} disabled={updating}>
              {updating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

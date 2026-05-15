'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Star, Trash2, Pencil, Loader2, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  service?: { id: string; title: string };
  reviewed?: { id: string; name: string };
}

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Reviews</h1>
        <p className="text-sm text-muted-foreground">Reviews you&apos;ve given to service providers</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Complete a booking to leave your first review</p>
          <Button
            variant="outline"
            className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => navigate('client-bookings')}
          >
            View My Bookings
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="gap-4">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{review.service?.title || 'Service'}</p>
                    <p className="text-sm text-muted-foreground">
                      by {review.reviewed?.name || 'Provider'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(review)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <AlertDialog open={deleteTarget === review.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                        className={`size-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
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
          ))}
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent>
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
                      className={`size-8 ${i < editRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button className="bg-blue-800 hover:bg-[#1e3a5f]" onClick={handleEdit} disabled={updating}>
              {updating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

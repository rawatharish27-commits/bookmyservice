'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Camera, Send, Zap, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface ReviewBookingData {
  service: string
  providerName: string
  date: string
  bookingId: string
}

export function ClientBookingReviewPage() {
  const { goBack } = useApp()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { data: bookingInfo, loading, error, refetch } = useApi<ReviewBookingData>(async () => {
    const res = await fetch('/api/client/bookings/review')
    if (!res.ok) throw new Error('Failed to load booking info')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading review data">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load booking info</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/client/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingInfo?.bookingId, rating }),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      goBack()
    } catch {
      // Error handled by UI
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Rate & Review</h1>

        {bookingInfo && (
          <Card className="bg-white rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                  <Zap className="size-6 text-[#0A1F44]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{bookingInfo.service}</h3>
                  <p className="text-xs text-slate-400">Provider: {bookingInfo.providerName} &bull; {bookingInfo.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 mb-3">How was your experience?</p>
              <div className="flex justify-center gap-2" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110" aria-label={`Rate ${star} stars`}>
                    <Star className={`size-10 ${star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500" aria-live="polite">
                {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent' : 'Select a rating'}
              </p>
            </div>

            <Separator />

            <div>
              <label htmlFor="review-text" className="mb-2 text-sm font-medium text-slate-700">Write a review</label>
              <textarea id="review-text" rows={4} placeholder="Share your experience..." className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]/20 resize-none" />
            </div>

            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">Add Photos</label>
              <div className="flex gap-2">
                <button className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors" aria-label="Upload photo">
                  <Camera className="size-6" />
                </button>
              </div>
            </div>

            <Button className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white gap-1 rounded-xl py-5" disabled={rating === 0 || submitting} onClick={handleSubmit} aria-label="Submit review">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

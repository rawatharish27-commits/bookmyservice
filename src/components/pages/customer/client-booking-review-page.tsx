'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Camera, Send, Zap } from 'lucide-react'

export function ClientBookingReviewPage() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Rate & Review</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50">
                <Zap className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">AC Service & Repair</h3>
                <p className="text-xs text-slate-400">Provider: Amit Sharma • 15 May 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 mb-3">How was your experience?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110" aria-label={`Rate ${star} stars`}>
                    <Star className={`size-10 ${star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent' : 'Select a rating'}
              </p>
            </div>

            <Separator />

            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">Write a review</label>
              <textarea rows={4} placeholder="Share your experience..." className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
            </div>

            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">Add Photos</label>
              <div className="flex gap-2">
                <button className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors" aria-label="Upload photo">
                  <Camera className="size-6" />
                </button>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl py-5" disabled={rating === 0}>
              <Send className="size-4" /> Submit Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

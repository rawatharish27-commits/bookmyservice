'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, MessageSquare, Filter } from 'lucide-react'

const reviews = [
  { id: 1, customer: 'Priya Patel', rating: 5, service: 'Deep Cleaning', date: '21 May 2024', comment: 'Excellent work! Very thorough and professional.', replied: false },
  { id: 2, customer: 'Amit Verma', rating: 4, service: 'Plumbing Service', date: '20 May 2024', comment: 'Good service, arrived on time. Fixed the issue quickly.', replied: true },
  { id: 3, customer: 'Sonia Mehta', rating: 3, service: 'AC Repair', date: '18 May 2024', comment: 'Service was okay but could have been more careful with the unit.', replied: false },
  { id: 4, customer: 'Deepak Kumar', rating: 5, service: 'Electrical Repair', date: '16 May 2024', comment: 'Very knowledgeable technician. Fixed everything in one visit.', replied: true },
  { id: 5, customer: 'Kavita Rao', rating: 2, service: 'AC Service', date: '14 May 2024', comment: 'Not satisfied. Had to call again for the same issue.', replied: false },
]

const starFilters = [5, 4, 3, 2, 1]

export function ProviderReviewsPage() {
  const [filterStar, setFilterStar] = useState<number | null>(null)
  const filtered = filterStar ? reviews.filter(r => r.rating === filterStar) : reviews

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Filter className="size-4" /> Filter</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">4.3</p>
                <div className="flex items-center gap-0.5 mt-1">{[1,2,3,4,5].map(s => <Star key={s} className={`size-4 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />)}</div>
                <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {starFilters.map(star => (
                  <button key={star} onClick={() => setFilterStar(filterStar === star ? null : star)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStar === star ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {star} ★
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="space-y-0">
            {filtered.map((review, i) => (
              <div key={review.id}>
                <div className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{review.customer}</p>
                      <p className="text-xs text-slate-400">{review.service} • {review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`size-3 ${s < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
                  {!review.replied && (
                    <Button variant="outline" size="sm" className="mt-2 gap-1 rounded-lg text-xs"><MessageSquare className="size-3" /> Reply</Button>
                  )}
                  {review.replied && <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">Replied</Badge>}
                </div>
                {i < filtered.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

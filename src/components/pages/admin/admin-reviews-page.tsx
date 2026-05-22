'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Flag, Eye, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

const reviews = [
  { id: 1, customer: 'Priya Patel', provider: 'Cool Care Services', service: 'Water Tank Cleaning', rating: 5, comment: 'Excellent work! Very thorough and professional.', date: '21 May 2024', flagged: false, replied: true },
  { id: 2, customer: 'Amit Verma', provider: 'QuickFix Solutions', service: 'Plumber', rating: 4, comment: 'Good service, arrived on time.', date: '20 May 2024', flagged: false, replied: false },
  { id: 3, customer: 'Sonia Mehta', provider: 'HomePro Services', service: 'Air Conditioner', rating: 2, comment: 'Very poor service. The issue came back within a day.', date: '18 May 2024', flagged: true, replied: false },
  { id: 4, customer: 'Kavita Rao', provider: 'SparkClean Pro', service: 'Electrician', rating: 1, comment: 'Unprofessional behavior. Would not recommend.', date: '14 May 2024', flagged: true, replied: false },
  { id: 5, customer: 'Deepak Kumar', provider: 'Cool Care Services', service: 'Air Conditioner', rating: 5, comment: 'Fixed everything in one visit. Great!', date: '16 May 2024', flagged: false, replied: true },
]

export function AdminReviewsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
          <Badge className="bg-red-100 text-red-700 border-red-200">{reviews.filter(r => r.flagged).length} Flagged</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">4.3</p><p className="text-xs text-slate-500">Avg Rating</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{reviews.length}</p><p className="text-xs text-slate-500">Total Reviews</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">2</p><p className="text-xs text-slate-500">Flagged</p></CardContent></Card>
        </div>

        {reviews.map((review) => (
          <Card key={review.id} className={`bg-white rounded-xl ${review.flagged ? 'border-red-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />)}
                  </div>
                  {review.flagged && <Badge className="bg-red-100 text-red-700 border-red-200 gap-1"><Flag className="size-3" /> Flagged</Badge>}
                </div>
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>
              <p className="text-sm text-slate-700">{review.comment}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span>{review.customer}</span><span>•</span><span>{review.provider}</span><span>•</span><span>{review.service}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {review.flagged && <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded-lg border-emerald-200 text-emerald-600"><ThumbsUp className="size-3" /> Approve</Button>}
                {!review.replied && <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded-lg"><MessageSquare className="size-3" /> Reply</Button>}
                <Button size="sm" variant="ghost" className="h-7 text-xs"><Eye className="size-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

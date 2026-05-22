'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, RotateCcw, Calendar, Clock, CheckCircle } from 'lucide-react'

const completed = [
  { id: 'BK002', service: 'Plumbing Repair', date: '12 May 2025', time: '2:00 PM', amount: '₹800', rating: 5, reviewed: true },
  { id: 'BK003', service: 'Deep Cleaning', date: '10 May 2025', time: '9:00 AM', amount: '₹2,500', rating: 0, reviewed: false },
  { id: 'BK005', service: 'Carpenter Visit', date: '5 May 2025', time: '3:00 PM', amount: '₹1,500', rating: 4, reviewed: true },
  { id: 'BK008', service: 'Electrician', date: '1 May 2025', time: '11:00 AM', amount: '₹600', rating: 0, reviewed: false },
]

export function ClientCompletedPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Completed Bookings</h1>

        <div className="space-y-4">
          {completed.map((b) => (
            <Card key={b.id} className="bg-white rounded-xl">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">{b.service}</h3>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><CheckCircle className="size-3 mr-1" />Completed</Badge>
                </div>
                <div className="flex gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5"><Calendar className="size-3.5" />{b.date}</div>
                  <div className="flex items-center gap-1.5"><Clock className="size-3.5" />{b.time}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{b.amount}</span>
                  {b.reviewed ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: b.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">Rated</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600 rounded-lg text-xs"><Star className="size-3" /> Rate</Button>
                      <Button variant="outline" size="sm" className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"><RotateCcw className="size-3" /> Rebook</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, RotateCcw, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface CompletedBooking {
  id: string
  service: string
  date: string
  time: string
  amount: string
  rating: number
  reviewed: boolean
}

export function ClientCompletedPage() {
  const { navigate } = useApp()
  const { data: completed, loading, error, refetch } = useApi<CompletedBooking[]>(async () => {
    const res = await fetch('/api/client/bookings/completed')
    if (!res.ok) throw new Error('Failed to load completed bookings')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading completed bookings">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load completed bookings</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Completed Bookings</h1>

        {!completed || completed.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No completed bookings yet</p>
          </div>
        ) : (
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
                        <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600 rounded-lg text-xs" onClick={() => navigate('client-booking-review', { id: b.id })} aria-label={`Rate ${b.service}`}><Star className="size-3" /> Rate</Button>
                        <Button variant="outline" size="sm" className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs" onClick={() => navigate('client-rebook', { id: b.id })} aria-label={`Rebook ${b.service}`}><RotateCcw className="size-3" /> Rebook</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

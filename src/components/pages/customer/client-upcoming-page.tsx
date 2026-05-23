'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, User, Timer, RefreshCw, XCircle, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface UpcomingBooking {
  id: string
  service: string
  date: string
  time: string
  provider: string
  address: string
  countdown: string
  amount: string
}

export function ClientUpcomingPage() {
  const { navigate } = useApp()
  const { data: upcoming, loading, error, refetch } = useApi<UpcomingBooking[]>(async () => {
    const res = await fetch('/api/client/bookings/upcoming')
    if (!res.ok) throw new Error('Failed to load upcoming bookings')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading upcoming bookings">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load upcoming bookings</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Upcoming Bookings</h1>

        {!upcoming || upcoming.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming bookings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <Card key={b.id} className="bg-white rounded-xl cursor-pointer" onClick={() => navigate('client-booking-detail', { id: b.id })}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">{b.service}</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Upcoming</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><Calendar className="size-3.5" />{b.date}</div>
                    <div className="flex items-center gap-1.5"><Clock className="size-3.5" />{b.time}</div>
                    <div className="flex items-center gap-1.5"><User className="size-3.5" />{b.provider}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="size-3.5" />{b.address}</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="size-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">Starts in {b.countdown}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{b.amount}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 border-slate-200 rounded-lg" aria-label={`Reschedule ${b.service}`} onClick={(e) => { e.stopPropagation() }}><RefreshCw className="size-3.5" /> Reschedule</Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg" aria-label={`Cancel ${b.service}`} onClick={(e) => { e.stopPropagation() }}><XCircle className="size-3.5" /> Cancel</Button>
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

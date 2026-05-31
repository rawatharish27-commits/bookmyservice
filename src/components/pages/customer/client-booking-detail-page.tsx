'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin, Phone, ChevronRight, Receipt, CheckCircle, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface TimelineStep {
  time: string
  label: string
  done: boolean
}

interface BookingDetail {
  id: string
  service: string
  status: string
  date: string
  time: string
  address: string
  timeline: TimelineStep[]
  provider: { name: string; initials: string; rating: string; services: string }
  breakdown: { label: string; value: string }[]
  total: string
}

export function ClientBookingDetailPage() {
  const { navigate, goBack } = useApp()
  const { data: booking, loading, error, refetch } = useApi<BookingDetail>(async () => {
    const res = await fetch('/api/client/bookings/current')
    if (!res.ok) throw new Error('Failed to load booking details')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading booking details">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load booking details</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">Booking not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Booking Details</h1>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">{booking.status}</Badge>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2"><Calendar className="size-4 text-slate-400" /><span className="text-sm text-slate-600">Booking ID: {booking.id}</span></div>
            <h2 className="text-lg font-bold text-slate-900">{booking.service}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {booking.date}</div>
              <div className="flex items-center gap-1.5"><Clock className="size-3.5" /> {booking.time}</div>
              <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {booking.address}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {booking.timeline.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <span className={`text-sm flex-1 ${step.done ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{step.label}</span>
                <span className="text-xs text-slate-400">{step.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Provider</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-[#1D63FF] text-white text-sm">{booking.provider.initials}</AvatarFallback></Avatar>
              <div className="flex-1"><p className="text-sm font-semibold text-slate-900">{booking.provider.name}</p><p className="text-xs text-slate-400">{booking.provider.rating} &bull; {booking.provider.services}</p></div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg" aria-label={`Call ${booking.provider.name}`}><Phone className="size-3.5" /> Call</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Amount Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {booking.breakdown.map((item) => (
              <div key={item.label} className="flex justify-between text-sm"><span className="text-slate-500">{item.label}</span><span className="text-slate-900">{item.value}</span></div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm font-bold"><span className="text-slate-900">Total</span><span className="text-slate-900">{booking.total}</span></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl" aria-label="Cancel booking">Cancel Booking</Button>
          <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl gap-1" onClick={() => navigate('client-invoice', { id: booking.id })} aria-label="View invoice"><Receipt className="size-4" /> View Invoice</Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Phone, MessageSquare, Clock, Navigation, Truck, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface TrackingStep {
  label: string
  done: boolean
}

interface TrackingData {
  status: string
  eta: string
  distance: string
  lastUpdated: string
  steps: TrackingStep[]
  provider: { name: string; initials: string }
}

export function ClientBookingTrackingPage() {
  const { navigate } = useApp()
  const { data: tracking, loading, error, refetch } = useApi<TrackingData>(async () => {
    const res = await fetch('/api/client/bookings/tracking')
    if (!res.ok) throw new Error('Failed to load tracking data')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading tracking data">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load tracking data</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">No active tracking available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Track Booking</h1>
          <Badge variant="secondary" className="bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200 hover:bg-[#1D63FF]/10">{tracking.status}</Badge>
        </div>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="h-56 bg-slate-100 flex items-center justify-center relative" role="img" aria-label="Live map showing provider location">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <MapPin className="size-8" />
              <span className="text-sm">Live Map</span>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#1D63FF]">
                <Truck className="size-3.5" /> Provider is on the way
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-900">Estimated Arrival</span>
              </div>
              <span className="text-lg font-bold text-[#1D63FF]">{tracking.eta}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><Navigation className="size-3.5" />{tracking.distance}</div>
              <div className="flex items-center gap-1.5"><Clock className="size-3.5" />{tracking.lastUpdated}</div>
            </div>
            <div className="space-y-2">
              {tracking.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`size-2.5 rounded-full ${s.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <span className={`text-sm ${s.done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-[#1D63FF] text-white text-sm">{tracking.provider.initials}</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{tracking.provider.name}</p>
                <p className="text-xs text-slate-400">Your service provider</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg" aria-label={`Call ${tracking.provider.name}`}><Phone className="size-3.5" /> Call</Button>
              <Button variant="outline" size="sm" className="gap-1 border-blue-200 text-[#1D63FF] hover:bg-blue-50 rounded-lg" onClick={() => navigate('client-chat')} aria-label="Chat with provider"><MessageSquare className="size-3.5" /> Chat</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

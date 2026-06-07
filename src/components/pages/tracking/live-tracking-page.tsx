'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Phone, MessageSquare, Navigation, Clock, Truck, Radio } from 'lucide-react'

const liveUpdates = [
  { time: '10:32 AM', message: 'Technician has started from location' },
  { time: '10:38 AM', message: 'Technician is on the way' },
  { time: '10:42 AM', message: 'ETA updated: 12 minutes' },
]

export function LiveTrackingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Live Tracking</h1>
          <Badge variant="secondary" className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10">
            <Radio className="size-3 mr-1 animate-pulse" /> Live
          </Badge>
        </div>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="relative h-64 bg-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <MapPin className="size-8" />
              <span className="text-sm">Live Map</span>
            </div>
            <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-3 py-2 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-[#0A1F44]" />
                <span className="text-xs font-medium text-[#0A1F44]">Amit is on the way</span>
              </div>
            </div>
            <div className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
              <Navigation className="size-5 text-[#0A1F44]" />
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500">Estimated Arrival</p>
                <p className="text-2xl font-bold text-[#0A1F44]">12 min</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Distance</p>
                <p className="text-lg font-bold text-slate-900">2.5 km</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFD54F]/10">
              <Avatar><AvatarFallback className="bg-[#0A1F44] text-white text-xs">AS</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Amit Sharma</p>
                <p className="text-xs text-slate-400">Your technician</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg"><Phone className="size-3" /> Call</Button>
              <Button variant="outline" size="sm" className="gap-1 border-[#FFD54F]/20 text-[#0A1F44] rounded-lg"><MessageSquare className="size-3" /> Chat</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Live Updates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {liveUpdates.map((u, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`size-3 rounded-full ${i === liveUpdates.length - 1 ? 'bg-[#FFD54F]/100 animate-pulse' : 'bg-emerald-500'}`} />
                  {i < liveUpdates.length - 1 && <div className="w-0.5 h-6 bg-slate-200" />}
                </div>
                <div>
                  <p className="text-sm text-slate-700">{u.message}</p>
                  <p className="text-xs text-slate-400">{u.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

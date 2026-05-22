'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Phone, MessageSquare, Clock, Navigation, Truck } from 'lucide-react'

export function ClientBookingTrackingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Track Booking</h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">En Route</Badge>
        </div>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="h-56 bg-slate-100 flex items-center justify-center relative">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <MapPin className="size-8" />
              <span className="text-sm">Live Map</span>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
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
              <span className="text-lg font-bold text-blue-600">15 min</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><Navigation className="size-3.5" />2.5 km away</div>
              <div className="flex items-center gap-1.5"><Clock className="size-3.5" />Updated just now</div>
            </div>
            <div className="space-y-2">
              {['Booking Confirmed', 'Provider Assigned', 'Provider En Route'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-700">{s}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-slate-200" />
                <span className="text-sm text-slate-400">Service In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-blue-600 text-white text-sm">AS</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Amit Sharma</p>
                <p className="text-xs text-slate-400">Your service provider</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg"><Phone className="size-3.5" /> Call</Button>
              <Button variant="outline" size="sm" className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"><MessageSquare className="size-3.5" /> Chat</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, Navigation, MapPin, Phone, Truck, Timer } from 'lucide-react'

export function TechnicianEtaPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Technician ETA</h1>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl border-0 text-white">
          <CardContent className="p-6 text-center">
            <Timer className="size-10 mx-auto mb-2 text-blue-200" />
            <p className="text-4xl font-bold">12 min</p>
            <p className="text-sm text-blue-200 mt-1">Estimated time of arrival</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Distance', value: '2.5 km', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
            { label: 'Travel Time', value: '12 min', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Avg Speed', value: '12 km/h', icon: Navigation, color: 'text-purple-600 bg-purple-50' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white rounded-xl">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="size-5" />
                </div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-blue-600 text-white text-sm">AS</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Amit Sharma</p>
                <p className="text-xs text-slate-400">AC Technician • 4.9 ★</p>
              </div>
              <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-lg"><Phone className="size-3" /> Call</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Real-Time Updates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: '10:32 AM', msg: 'Started from current location', active: false },
              { time: '10:38 AM', msg: 'Crossed Rajouri Chowk', active: false },
              { time: '10:42 AM', msg: 'Near Rajouri Garden Metro', active: true },
              { time: '~10:54 AM', msg: 'Expected arrival', active: false },
            ].map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`size-2.5 rounded-full ${u.active ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className={`text-sm flex-1 ${u.active ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}>{u.msg}</span>
                <span className="text-xs text-slate-400">{u.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
          <Truck className="size-3.5" /> Last updated 30 seconds ago
        </div>
      </div>
    </div>
  )
}

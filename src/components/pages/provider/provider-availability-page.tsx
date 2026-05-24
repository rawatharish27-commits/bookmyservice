'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, ToggleLeft, ToggleRight, Plus } from 'lucide-react'

const availabilityData = [
  { day: 'Monday', enabled: true, slots: ['09:00-12:00', '14:00-18:00'] },
  { day: 'Tuesday', enabled: true, slots: ['09:00-12:00', '14:00-18:00'] },
  { day: 'Wednesday', enabled: true, slots: ['09:00-12:00'] },
  { day: 'Thursday', enabled: true, slots: ['09:00-12:00', '14:00-18:00'] },
  { day: 'Friday', enabled: true, slots: ['09:00-12:00', '14:00-18:00'] },
  { day: 'Saturday', enabled: true, slots: ['10:00-14:00'] },
  { day: 'Sunday', enabled: false, slots: [] },
]

export function ProviderAvailabilityPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><Plus className="size-4" /> Add Slot</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Day-wise Availability</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {availabilityData.map((day, i) => (
              <div key={day.day}>
                <div className="flex items-center gap-4 py-4">
                  <div className="w-24">
                    <p className="text-sm font-medium text-slate-900">{day.day}</p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {day.enabled && day.slots.length > 0 ? (
                      day.slots.map((slot) => (
                        <span key={slot} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          <Clock className="size-3" /> {slot}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">{day.enabled ? 'No slots configured' : 'Day off'}</span>
                    )}
                  </div>
                  <button className="shrink-0">
                    {day.enabled ? <ToggleRight className="size-6 text-emerald-500" /> : <ToggleLeft className="size-6 text-slate-300" />}
                  </button>
                </div>
                {i < availabilityData.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Quick Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-900">Same-day bookings</p><p className="text-xs text-slate-400">Allow bookings for same day</p></div>
              <ToggleRight className="size-6 text-emerald-500" />
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-900">Buffer time</p><p className="text-xs text-slate-400">30 min between bookings</p></div>
              <ToggleRight className="size-6 text-emerald-500" />
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-900">Auto-accept bookings</p><p className="text-xs text-slate-400">Automatically accept matching requests</p></div>
              <ToggleLeft className="size-6 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

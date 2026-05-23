'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Plus, X } from 'lucide-react'

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const scheduleData: Record<string, { slots: string[]; blocked: boolean }> = {
  Monday: { slots: ['09:00-12:00', '14:00-18:00'], blocked: false },
  Tuesday: { slots: ['09:00-12:00', '14:00-18:00'], blocked: false },
  Wednesday: { slots: ['09:00-12:00'], blocked: false },
  Thursday: { slots: ['09:00-12:00', '14:00-18:00'], blocked: false },
  Friday: { slots: ['09:00-12:00', '14:00-18:00'], blocked: false },
  Saturday: { slots: ['10:00-14:00'], blocked: false },
  Sunday: { slots: [], blocked: true },
}

const blockedDates = [
  { date: '25 May 2024', reason: 'Personal Leave' },
  { date: '02 Jun 2024', reason: 'Medical Appointment' },
]

export function ProviderSchedulePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><Plus className="size-4" /> Add Slot</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Weekly Calendar</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {weekDays.map((day, i) => {
              const data = scheduleData[day]
              return (
                <div key={day}>
                  <div className="flex items-center gap-4 py-3">
                    <div className="w-24"><p className="text-sm font-medium text-slate-900">{day}</p></div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {data.blocked ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200">Blocked</Badge>
                      ) : data.slots.length > 0 ? (
                        data.slots.map((slot) => (
                          <Badge key={slot} className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                            <Clock className="size-3" /> {slot}
                            <button className="ml-1"><X className="size-2.5" /></button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No slots</span>
                      )}
                    </div>
                    {!data.blocked && <Button variant="ghost" size="sm" className="text-blue-600 text-xs"><Plus className="size-3" /></Button>}
                  </div>
                  {i < weekDays.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Calendar className="size-4 text-red-600" /><CardTitle className="text-sm font-semibold text-slate-900">Blocked Dates</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {blockedDates.map((block, i) => (
              <div key={block.date}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{block.date}</p>
                    <p className="text-xs text-slate-400">{block.reason}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600 text-xs gap-1"><X className="size-3" /> Remove</Button>
                </div>
                {i < blockedDates.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

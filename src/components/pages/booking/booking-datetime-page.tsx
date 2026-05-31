'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const timeSlots = [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: false },
  { time: '12:00 PM', available: true },
  { time: '1:00 PM', available: true },
  { time: '2:00 PM', available: true },
  { time: '3:00 PM', available: false },
  { time: '4:00 PM', available: true },
  { time: '5:00 PM', available: true },
  { time: '6:00 PM', available: true },
]

const dates = [
  { day: 'Mon', date: 19, available: true },
  { day: 'Tue', date: 20, available: true },
  { day: 'Wed', date: 21, available: true },
  { day: 'Thu', date: 22, available: false },
  { day: 'Fri', date: 23, available: true },
  { day: 'Sat', date: 24, available: true },
  { day: 'Sun', date: 25, available: true },
]

export function BookingDatetimePage() {
  const [selectedDate, setSelectedDate] = useState(20)
  const [selectedTime, setSelectedTime] = useState('10:00 AM')

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Select Date & Time</h1>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900"><Calendar className="size-4 inline mr-1.5 text-[#1D63FF]" />May 2025</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-7"><ChevronLeft className="size-4" /></Button>
                <Button variant="ghost" size="icon" className="size-7"><ChevronRight className="size-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((d) => (
                <button key={d.date} disabled={!d.available} onClick={() => d.available && setSelectedDate(d.date)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${!d.available ? 'opacity-30 cursor-not-allowed' : selectedDate === d.date ? 'bg-[#1D63FF] text-white' : 'hover:bg-slate-50'}`}>
                  <span className="text-[10px] font-medium opacity-70">{d.day}</span>
                  <span className="text-sm font-bold">{d.date}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900"><Clock className="size-4 inline mr-1.5 text-[#1D63FF]" />Available Time Slots</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <Button key={slot.time} disabled={!slot.available}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  className={`rounded-xl text-xs ${selectedTime === slot.time ? 'bg-[#1D63FF] hover:bg-[#0B3D91] text-white' : !slot.available ? 'opacity-30' : 'border-slate-200'}`}>
                  {slot.time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-[#1D63FF]/10 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="size-5 text-[#1D63FF]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Selected: 20 May 2025 at {selectedTime}</p>
              <p className="text-xs text-slate-500">Estimated duration: 1 hour</p>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl py-5">Confirm Date & Time</Button>
      </div>
    </div>
  )
}

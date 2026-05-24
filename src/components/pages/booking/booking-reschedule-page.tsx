'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { useApp } from '@/lib/app-context'

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']
const dates = [
  { day: 'Wed', date: 21 },
  { day: 'Thu', date: 22 },
  { day: 'Fri', date: 23 },
  { day: 'Sat', date: 24 },
  { day: 'Sun', date: 25 },
  { day: 'Mon', date: 26 },
  { day: 'Tue', date: 27 },
]

const rescheduleReasons = ['Schedule conflict', 'Need earlier time', 'Need later time', 'Weather conditions', 'Other']

export function BookingReschedulePage() {
  const [selectedDate, setSelectedDate] = useState(23)
  const [selectedTime, setSelectedTime] = useState('10:00 AM')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const { navigate } = useApp()

  const handleReschedule = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('booking-confirmation')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Reschedule Booking</h1>

        <Card className="bg-blue-50 border-blue-100 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Current Schedule</p>
                <p className="text-xs text-blue-700">20 May 2025 at 10:00 AM</p>
                <p className="text-xs text-blue-600 mt-1">Free reschedule available (first change)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900"><Calendar className="size-4 inline mr-1.5 text-blue-600" />New Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((d) => (
                <button key={d.date} onClick={() => setSelectedDate(d.date)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${selectedDate === d.date ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>
                  <span className="text-[10px] font-medium opacity-70">{d.day}</span>
                  <span className="text-sm font-bold">{d.date}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900"><Clock className="size-4 inline mr-1.5 text-blue-600" />New Time</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((t) => (
                <Button key={t} onClick={() => setSelectedTime(t)} variant={selectedTime === t ? 'default' : 'outline'}
                  className={`rounded-xl text-xs ${selectedTime === t ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200'}`}>{t}</Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Reason for Reschedule</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rescheduleReasons.map((r) => (
              <button key={r} onClick={() => setReason(r)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${reason === r ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <div className={`size-4 rounded-full border-2 ${reason === r ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                <span className="text-slate-700">{r}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl border-slate-200" onClick={() => navigate('booking-confirmation')}>Cancel</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl" onClick={handleReschedule} disabled={loading}>
            <RefreshCw className="size-4" /> {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </div>
      </div>
    </div>
  )
}

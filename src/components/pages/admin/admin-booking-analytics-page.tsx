'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, TrendingUp, Download } from 'lucide-react'

const bookingTrends = [
  { date: 'Mon', total: 145, completed: 128, cancelled: 12 },
  { date: 'Tue', total: 162, completed: 145, cancelled: 8 },
  { date: 'Wed', total: 178, completed: 158, cancelled: 15 },
  { date: 'Thu', total: 155, completed: 138, cancelled: 10 },
  { date: 'Fri', total: 198, completed: 175, cancelled: 14 },
  { date: 'Sat', total: 210, completed: 185, cancelled: 18 },
  { date: 'Sun', total: 125, completed: 108, cancelled: 12 },
]

const categoryDist = [
  { category: 'Air Conditioner', bookings: 856, percentage: 32 },
  { category: 'Water Tank Cleaning', bookings: 654, percentage: 24 },
  { category: 'Plumber', bookings: 432, percentage: 16 },
  { category: 'Electrician', bookings: 324, percentage: 12 },
  { category: 'Geyser', bookings: 215, percentage: 8 },
  { category: 'Others', bookings: 195, percentage: 8 },
]

const peakHours = [
  { hour: '9-10 AM', bookings: 85 },
  { hour: '10-11 AM', bookings: 120 },
  { hour: '11-12 PM', bookings: 145 },
  { hour: '12-1 PM', bookings: 95 },
  { hour: '2-3 PM', bookings: 110 },
  { hour: '3-4 PM', bookings: 130 },
  { hour: '4-5 PM', bookings: 115 },
  { hour: '5-6 PM', bookings: 90 },
]

export function AdminBookingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Booking Analytics</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Booking Trends</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-36">
              {bookingTrends.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-400">{d.total}</span>
                  <div className="w-full rounded-t-sm bg-[#FFD54F]/100" style={{ height: `${(d.total / 220) * 100}%` }} />
                  <span className="text-[10px] text-slate-400">{d.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Category Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {categoryDist.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-700">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{cat.bookings}</span>
                      <span className="text-xs text-slate-400">({cat.percentage}%)</span>
                    </div>
                  </div>
                  {i < categoryDist.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Peak Hours</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 h-32">
                {peakHours.map((h) => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm bg-emerald-500" style={{ height: `${(h.bookings / 150) * 100}%` }} />
                    <span className="text-[8px] text-slate-400 text-center leading-tight">{h.hour}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

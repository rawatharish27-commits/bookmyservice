'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, User, Timer, RefreshCw, XCircle } from 'lucide-react'

const upcoming = [
  { id: 'BK001', service: 'AC Service', date: '15 May 2025', time: '10:00 AM', provider: 'Amit Sharma', address: 'Rajouri Garden', countdown: '2h 30m', amount: '₹1,200' },
  { id: 'BK006', service: 'Deep Cleaning', date: '18 May 2025', time: '9:00 AM', provider: 'Priya Singh', address: 'Cyber Hub, Gurugram', countdown: '3 days', amount: '₹2,500' },
  { id: 'BK007', service: 'Plumbing Check', date: '20 May 2025', time: '11:00 AM', provider: 'Ravi Kumar', address: 'Green Park, Delhi', countdown: '5 days', amount: '₹800' },
]

export function ClientUpcomingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Upcoming Bookings</h1>

        <div className="space-y-4">
          {upcoming.map((b) => (
            <Card key={b.id} className="bg-white rounded-xl">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">{b.service}</h3>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Upcoming</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5"><Calendar className="size-3.5" />{b.date}</div>
                  <div className="flex items-center gap-1.5"><Clock className="size-3.5" />{b.time}</div>
                  <div className="flex items-center gap-1.5"><User className="size-3.5" />{b.provider}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="size-3.5" />{b.address}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="size-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">Starts in {b.countdown}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{b.amount}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 border-slate-200 rounded-lg"><RefreshCw className="size-3.5" /> Reschedule</Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="size-3.5" /> Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

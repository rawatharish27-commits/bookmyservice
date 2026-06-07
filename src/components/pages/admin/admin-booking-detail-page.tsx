'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, MapPin, Clock, Phone, RotateCcw, MessageSquare } from 'lucide-react'

const timeline = [
  { time: '10:00 AM', event: 'Booking Created', detail: 'By Rahul Sharma', color: 'bg-[#FFD54F]/100' },
  { time: '10:05 AM', event: 'Payment Received', detail: '₹499 via UPI', color: 'bg-emerald-500' },
  { time: '10:10 AM', event: 'Provider Assigned', detail: 'Cool Care Services', color: 'bg-purple-500' },
  { time: '10:15 AM', event: 'Provider Accepted', detail: 'Arvind Kumar accepted', color: 'bg-emerald-500' },
  { time: '02:00 PM', event: 'Service Started', detail: 'Provider arrived at location', color: 'bg-[#FFD54F]/100' },
  { time: '03:30 PM', event: 'Service Completed', detail: 'Marked complete by provider', color: 'bg-emerald-500' },
]

export function AdminBookingDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Booking #BK-1024</h1>
            <p className="text-sm text-slate-500 mt-1">Air Conditioner Service</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Booking Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><User className="size-4 text-slate-400" /><div><p className="text-xs text-slate-400">Customer</p><p className="font-medium text-slate-700">Rahul Sharma</p></div></div>
              <div className="flex items-center gap-2"><Phone className="size-4 text-slate-400" /><div><p className="text-xs text-slate-400">Phone</p><p className="font-medium text-slate-700">+91 98765 12345</p></div></div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" /><div><p className="text-xs text-slate-400">Address</p><p className="font-medium text-slate-700">12, MG Road, Delhi</p></div></div>
              <div className="flex items-center gap-2"><Calendar className="size-4 text-slate-400" /><div><p className="text-xs text-slate-400">Date</p><p className="font-medium text-slate-700">22 May 2024, 10:00 AM</p></div></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-3 rounded-full ${item.color} shrink-0 mt-1.5 ring-4 ring-white`} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className={i < timeline.length - 1 ? 'pb-5' : 'pb-0'}>
                    <p className="text-xs font-semibold text-slate-500">{item.time}</p>
                    <p className="text-sm font-medium text-slate-900">{item.event}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-sm font-semibold text-slate-900">Payment</p><p className="text-xs text-slate-400">₹499 via UPI</p></div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Paid</Badge>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-1 rounded-xl"><RotateCcw className="size-4" /> Refund</Button>
              <Button variant="outline" className="flex-1 gap-1 rounded-xl"><MessageSquare className="size-4" /> Message</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin, User, Phone, ChevronRight, Receipt, CheckCircle } from 'lucide-react'

const timeline = [
  { time: '10:00 AM', label: 'Booking Confirmed', done: true },
  { time: '10:15 AM', label: 'Provider Assigned', done: true },
  { time: '10:30 AM', label: 'Provider En Route', done: false },
  { time: '11:00 AM', label: 'Service In Progress', done: false },
  { time: '12:00 PM', label: 'Service Completed', done: false },
]

export function ClientBookingDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Booking Details</h1>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Upcoming</Badge>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2"><Calendar className="size-4 text-slate-400" /><span className="text-sm text-slate-600">Booking ID: BK001</span></div>
            <h2 className="text-lg font-bold text-slate-900">AC Service & Repair</h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><Calendar className="size-3.5" /> 15 May 2025</div>
              <div className="flex items-center gap-1.5"><Clock className="size-3.5" /> 10:00 AM - 11:00 AM</div>
              <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Rajouri Garden, Delhi</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {timeline.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <span className={`text-sm flex-1 ${step.done ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{step.label}</span>
                <span className="text-xs text-slate-400">{step.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Provider</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-blue-600 text-white text-sm">AS</AvatarFallback></Avatar>
              <div className="flex-1"><p className="text-sm font-semibold text-slate-900">Amit Sharma</p><p className="text-xs text-slate-400">4.9 ★ • 500+ services</p></div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg"><Phone className="size-3.5" /> Call</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Amount Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Service Charge', value: '₹1,000' },
              { label: 'Parts & Materials', value: '₹150' },
              { label: 'GST (18%)', value: '₹207' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm"><span className="text-slate-500">{item.label}</span><span className="text-slate-900">{item.value}</span></div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm font-bold"><span className="text-slate-900">Total</span><span className="text-slate-900">₹1,357</span></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl">Cancel Booking</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl gap-1"><Receipt className="size-4" /> View Invoice</Button>
        </div>
      </div>
    </div>
  )
}

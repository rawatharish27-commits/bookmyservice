'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Circle, Clock, Calendar, User, MapPin, CreditCard, Zap } from 'lucide-react'

const timelineSteps = [
  { time: '10:00 AM', title: 'Booking Placed', desc: 'AC Service & Repair booked for 20 May 2025', status: 'completed' },
  { time: '10:02 AM', title: 'Payment Confirmed', desc: '₹1,039 paid via MyService Wallet', status: 'completed' },
  { time: '10:05 AM', title: 'Provider Assigned', desc: 'Amit Sharma assigned to your booking', status: 'completed' },
  { time: '9:45 AM', title: 'Provider En Route', desc: 'Amit is heading to your location', status: 'current' },
  { time: '~10:00 AM', title: 'Service In Progress', desc: 'AC repair work in progress', status: 'upcoming' },
  { time: '~11:00 AM', title: 'Service Completed', desc: 'Work finished, awaiting your confirmation', status: 'upcoming' },
  { time: '~11:05 AM', title: 'Payment Released', desc: 'Payment released to provider', status: 'upcoming' },
]

export function BookingTimelinePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Booking Timeline</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50"><Zap className="size-6 text-blue-600" /></div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">AC Service & Repair</h3>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="size-3" />20 May 2025</span>
                  <span className="flex items-center gap-1"><User className="size-3" />Amit Sharma</span>
                  <span className="flex items-center gap-1"><CreditCard className="size-3" />₹1,039</span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {step.status === 'completed' ? (
                      <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      </div>
                    ) : step.status === 'current' ? (
                      <div className="flex size-7 items-center justify-center rounded-full bg-blue-600">
                        <Circle className="size-3 fill-white text-white" />
                      </div>
                    ) : (
                      <div className="flex size-7 items-center justify-center rounded-full bg-slate-100">
                        <Circle className="size-3 text-slate-300" />
                      </div>
                    )}
                    {i < timelineSteps.length - 1 && (
                      <div className={`w-0.5 h-8 ${step.status === 'completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</p>
                      {step.status === 'current' && <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-[10px]">Now</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="size-2.5" />{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

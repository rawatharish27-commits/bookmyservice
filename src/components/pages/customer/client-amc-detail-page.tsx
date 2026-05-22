'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Shield, Calendar, Check, Clock, RotateCcw, ChevronRight } from 'lucide-react'

const visits = [
  { date: '15 Jan 2025', service: 'AC Service', status: 'Completed' },
  { date: '10 Mar 2025', service: 'AC Gas Refill', status: 'Completed' },
  { date: '20 Jun 2025', service: 'AC Checkup', status: 'Scheduled' },
  { date: '15 Sep 2025', service: 'AC Service', status: 'Upcoming' },
]

export function ClientAmcDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">AMC Details</h1>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50"><Shield className="size-6 text-blue-600" /></div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Standard Care Plan</h2>
                <p className="text-xs text-slate-400">Plan ID: AMC-2025-001</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">Price</span><p className="font-semibold text-slate-900">₹1,999/yr</p></div>
              <div><span className="text-slate-400">Valid Till</span><p className="font-semibold text-slate-900">31 Dec 2025</p></div>
              <div><span className="text-slate-400">Visits Used</span><p className="font-semibold text-slate-900">2 / 4</p></div>
              <div><span className="text-slate-400">Services</span><p className="font-semibold text-slate-900">AC, Cooler</p></div>
            </div>
            <Progress value={50} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Visit History</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {visits.map((v, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-3">
                  <div className={`size-3 rounded-full ${v.status === 'Completed' ? 'bg-emerald-500' : v.status === 'Scheduled' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{v.service}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="size-3" />{v.date}</div>
                  </div>
                  <Badge variant="secondary" className={v.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : v.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100'}>{v.status}</Badge>
                </div>
                {i < visits.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Next Visit: 20 Jun 2025</p>
                <p className="text-xs text-slate-400">AC Checkup</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg"><RotateCcw className="size-3" /> Reschedule</Button>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl"><RotateCcw className="size-4" /> Renew Plan</Button>
      </div>
    </div>
  )
}

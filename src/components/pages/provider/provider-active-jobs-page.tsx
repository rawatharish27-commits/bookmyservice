'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Timer, Phone, Navigation, MessageSquare, CheckCircle } from 'lucide-react'

const activeJobs = [
  { id: 'BK-1024', service: 'Air Conditioner', customer: 'Rahul Sharma', phone: '+91 98765 12345', address: '12, MG Road, Delhi', startedAt: '10:00 AM', elapsed: '1h 25m', status: 'In Progress' },
  { id: 'BK-1028', service: 'Plumber', customer: 'Anita Desai', phone: '+91 87654 54321', address: '34, Janakpuri, Delhi', startedAt: '02:00 PM', elapsed: '0h 15m', status: 'On the Way' },
]

export function ProviderActiveJobsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Active Jobs</h1>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{activeJobs.length} Active</Badge>
        </div>

        {activeJobs.map((job) => (
          <Card key={job.id} className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">{job.service}</CardTitle>
                <Badge className={job.status === 'In Progress' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20'}>{job.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FFD54F]/10">
                <div className="flex items-center gap-2"><Timer className="size-4 text-[#0A1F44]" /><span className="text-xs text-[#0A1F44] font-medium">Time Elapsed</span></div>
                <span className="text-lg font-bold text-[#0A1F44]">{job.elapsed}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-slate-400">Customer</span><p className="font-medium text-slate-700">{job.customer}</p></div>
                <div><span className="text-xs text-slate-400">Started At</span><p className="font-medium text-slate-700">{job.startedAt}</p></div>
                <div><span className="text-xs text-slate-400">Address</span><p className="font-medium text-slate-700">{job.address}</p></div>
                <div><span className="text-xs text-slate-400">Booking ID</span><p className="font-medium text-slate-700">{job.id}</p></div>
              </div>
              <Separator className="bg-slate-100" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1 rounded-xl"><Phone className="size-4" /> Call</Button>
                <Button variant="outline" className="flex-1 gap-1 rounded-xl"><Navigation className="size-4" /> Directions</Button>
                <Button variant="outline" className="flex-1 gap-1 rounded-xl"><MessageSquare className="size-4" /> Chat</Button>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-xl"><CheckCircle className="size-4" /> Mark Complete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

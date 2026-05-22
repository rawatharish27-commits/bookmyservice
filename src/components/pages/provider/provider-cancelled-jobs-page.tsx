'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { XCircle, RotateCcw, MessageSquare, ChevronRight } from 'lucide-react'

const cancelledJobs = [
  { id: 'BK-1021', service: 'AC Service', customer: 'Neha Gupta', date: '19 May 2024', amount: '₹499', reason: 'Customer unavailable', refundStatus: 'Refunded', cancelledBy: 'Customer' },
  { id: 'BK-1015', service: 'Deep Cleaning', customer: 'Ravi Prasad', date: '15 May 2024', amount: '₹2,500', reason: 'Scheduling conflict', refundStatus: 'Processing', cancelledBy: 'Provider' },
  { id: 'BK-1010', service: 'Plumbing', customer: 'Kavita Rao', date: '10 May 2024', amount: '₹800', reason: 'Service not needed', refundStatus: 'Refunded', cancelledBy: 'Customer' },
]

const refundColors: Record<string, string> = {
  Refunded: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Processing: 'bg-amber-100 text-amber-700 border-amber-200',
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function ProviderCancelledJobsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Cancelled Jobs</h1>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{cancelledJobs.length}</p><p className="text-xs text-slate-500">Cancelled</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{cancelledJobs.filter(j => j.refundStatus === 'Refunded').length}</p><p className="text-xs text-slate-500">Refunded</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Cancellation Details</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {cancelledJobs.map((job, i) => (
              <div key={job.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 shrink-0"><XCircle className="size-5 text-red-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{job.service}</p>
                      <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{job.customer} • {job.date}</p>
                    <p className="text-xs text-slate-500 mt-1">Reason: {job.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-700">{job.amount}</p>
                    <Badge variant="secondary" className={`text-[10px] ${refundColors[job.refundStatus]}`}>{job.refundStatus}</Badge>
                  </div>
                </div>
                {i < cancelledJobs.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

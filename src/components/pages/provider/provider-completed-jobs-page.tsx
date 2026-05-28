'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Star, IndianRupee, ChevronRight } from 'lucide-react'

const completedJobs = [
  { id: 'BK-1023', service: 'Water Tank Cleaning', customer: 'Priya Patel', date: '21 May 2024', amount: '₹499', earnings: '₹424', rating: 5, hasReview: true },
  { id: 'BK-1022', service: 'Plumber', customer: 'Amit Verma', date: '20 May 2024', amount: '₹499', earnings: '₹424', rating: 4, hasReview: true },
  { id: 'BK-1019', service: 'Air Conditioner', customer: 'Sonia Mehta', date: '18 May 2024', amount: '₹499', earnings: '₹424', rating: 0, hasReview: false },
  { id: 'BK-1017', service: 'Electrician', customer: 'Deepak Kumar', date: '16 May 2024', amount: '₹499', earnings: '₹424', rating: 5, hasReview: true },
]

export function ProviderCompletedJobsPage() {
  const totalEarnings = completedJobs.reduce((sum, j) => sum + parseInt(j.earnings.replace(/[₹,]/g, '')), 0)

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Completed Jobs</h1>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">₹{totalEarnings.toLocaleString()}</p><p className="text-xs text-slate-500">Total Earnings</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-[#1D63FF]">{completedJobs.length}</p><p className="text-xs text-slate-500">Jobs Completed</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Completed List</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {completedJobs.map((job, i) => (
              <div key={job.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 shrink-0"><CheckCircle className="size-5 text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{job.service}</p>
                      {job.hasReview && (
                        <div className="flex items-center gap-0.5"><Star className="size-3 fill-amber-400 text-amber-400" /><span className="text-xs text-slate-500">{job.rating}</span></div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{job.customer} • {job.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600">{job.earnings}</p>
                    <p className="text-xs text-slate-400">of {job.amount}</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>
                {i < completedJobs.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

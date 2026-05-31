'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Shield, Calendar, Check, Clock, RotateCcw, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface Visit {
  date: string
  service: string
  status: string
}

interface AmcDetail {
  planId: string
  planName: string
  price: string
  validTill: string
  visitsUsed: number
  totalVisits: number
  services: string
  visits: Visit[]
  nextVisit: string
  nextService: string
}

export function ClientAmcDetailPage() {
  const { navigate } = useApp()
  const { data: detail, loading, error, refetch } = useApi<AmcDetail>(async () => {
    const res = await fetch('/api/client/amc/detail')
    if (!res.ok) throw new Error('Failed to load AMC details')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading AMC details">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load AMC details</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">AMC plan not found</p>
      </div>
    )
  }

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
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50"><Shield className="size-6 text-[#1D63FF]" /></div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{detail.planName}</h2>
                <p className="text-xs text-slate-400">Plan ID: {detail.planId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">Price</span><p className="font-semibold text-slate-900">{detail.price}</p></div>
              <div><span className="text-slate-400">Valid Till</span><p className="font-semibold text-slate-900">{detail.validTill}</p></div>
              <div><span className="text-slate-400">Visits Used</span><p className="font-semibold text-slate-900">{detail.visitsUsed} / {detail.totalVisits}</p></div>
              <div><span className="text-slate-400">Services</span><p className="font-semibold text-slate-900">{detail.services}</p></div>
            </div>
            <Progress value={(detail.visitsUsed / detail.totalVisits) * 100} className="h-2" />
          </CardContent>
        </Card>

        {detail.visits.length > 0 && (
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Visit History</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {detail.visits.map((v, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-3">
                    <div className={`size-3 rounded-full ${v.status === 'Completed' ? 'bg-emerald-500' : v.status === 'Scheduled' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{v.service}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="size-3" />{v.date}</div>
                    </div>
                    <Badge variant="secondary" className={v.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : v.status === 'Scheduled' ? 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200 hover:bg-[#1D63FF]/10' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100'}>{v.status}</Badge>
                  </div>
                  {i < detail.visits.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Next Visit: {detail.nextVisit}</p>
                <p className="text-xs text-slate-400">{detail.nextService}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg" aria-label="Reschedule next visit"><RotateCcw className="size-3" /> Reschedule</Button>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl" aria-label="Renew AMC plan"><RotateCcw className="size-4" /> Renew Plan</Button>
      </div>
    </div>
  )
}

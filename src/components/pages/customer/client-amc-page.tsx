'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Shield, Check, Calendar, Zap, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface AmcPlan {
  id: string
  name: string
  price: string
  visits: number
  benefits: string[]
  color: string
}

interface ActiveAmc {
  name: string
  visitsUsed: number
  totalVisits: number
  validTill: string
  nextVisit: string
}

interface AmcData {
  activePlan: ActiveAmc | null
  plans: AmcPlan[]
}

export function ClientAmcPage() {
  const { data: amcData, loading, error, refetch } = useApi<AmcData>(async () => {
    const res = await fetch('/api/client/amc')
    if (!res.ok) throw new Error('Failed to load AMC plans')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading AMC plans">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load AMC plans</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">AMC Plans</h1>

        {amcData?.activePlan && (
          <Card className="bg-white rounded-xl border-emerald-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50"><Shield className="size-5 text-emerald-600" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-900">{amcData.activePlan.name}</h3><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge></div>
                  <p className="text-xs text-slate-400">Valid till {amcData.activePlan.validTill}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Visits Used</span><span className="font-semibold text-slate-900">{amcData.activePlan.visitsUsed} / {amcData.activePlan.totalVisits}</span></div>
                <Progress value={(amcData.activePlan.visitsUsed / amcData.activePlan.totalVisits) * 100} className="h-2" />
              </div>
              <div className="flex items-center gap-2 mt-3 rounded-lg bg-slate-50 p-2.5">
                <Calendar className="size-4 text-slate-400" />
                <span className="text-xs text-slate-500">Next visit: {amcData.activePlan.nextVisit}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-base font-semibold text-slate-900">Available Plans</h2>
        {(!amcData?.plans || amcData.plans.length === 0) ? (
          <p className="text-center text-slate-400 py-8">No plans available</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {amcData.plans.map((plan) => (
              <Card key={plan.id} className={`rounded-xl ${plan.color}`}>
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xl font-bold text-[#1D63FF]">{plan.price}</p>
                  <p className="text-xs text-slate-500">{plan.visits} service visits/year</p>
                  <Separator />
                  <div className="space-y-1.5">
                    {plan.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-1.5 text-xs text-slate-600"><Check className="size-3 text-emerald-500" />{b}</div>
                    ))}
                  </div>
                  <Button className="w-full gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl text-xs" aria-label={`Buy ${plan.name} plan`}><Zap className="size-3" />Buy Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

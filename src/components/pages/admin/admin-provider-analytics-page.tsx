'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Briefcase, Star, UserCheck, Download } from 'lucide-react'

const providerMetrics = [
  { label: 'Total Providers', value: '1,234', change: '+86', icon: Briefcase, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  { label: 'Verified', value: '945', change: '+52', icon: UserCheck, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Avg Rating', value: '4.5', change: '+0.1', icon: Star, color: 'bg-amber-100 text-amber-600' },
]

const onboardingFunnel = [
  { stage: 'Registered', count: 1200, percentage: 100 },
  { stage: 'Profile Completed', count: 980, percentage: 82 },
  { stage: 'KYC Submitted', count: 850, percentage: 71 },
  { stage: 'KYC Verified', count: 720, percentage: 60 },
  { stage: 'First Service Added', count: 650, percentage: 54 },
  { stage: 'First Booking', count: 520, percentage: 43 },
]

const topProviders = [
  { name: 'Cool Care Services', rating: 4.9, bookings: 156, earnings: '₹2,45,000' },
  { name: 'QuickFix Solutions', rating: 4.8, bookings: 132, earnings: '₹1,98,000' },
  { name: 'HomePro Services', rating: 4.7, bookings: 118, earnings: '₹1,75,000' },
  { name: 'A1 Repair Hub', rating: 4.7, bookings: 105, earnings: '₹1,52,000' },
]

export function AdminProviderAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Provider Analytics</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {providerMetrics.map((m) => {
            const Icon = m.icon
            return (
              <Card key={m.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3"><div className={`flex size-10 items-center justify-center rounded-lg ${m.color}`}><Icon className="size-5" /></div>
                    <div><p className="text-xs text-slate-500">{m.label}</p><p className="text-lg font-bold text-slate-900">{m.value}</p></div>
                  </div>
                  <div className="flex items-center gap-1 mt-2"><TrendingUp className="size-3 text-emerald-500" /><span className="text-xs font-medium text-emerald-600">{m.change}</span></div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Onboarding Funnel</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {onboardingFunnel.map((step, i) => (
                <div key={step.stage}>
                  <div className="py-3">
                    <div className="flex items-center justify-between mb-1"><span className="text-sm text-slate-700">{step.stage}</span><span className="text-sm font-semibold text-slate-700">{step.count.toLocaleString()}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${step.percentage}%` }} /></div>
                  </div>
                  {i < onboardingFunnel.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Top Performing Providers</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {topProviders.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center gap-3 py-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#1D63FF]/10 text-xs font-bold text-[#1D63FF]">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5"><Star className="size-3 fill-amber-400 text-amber-400" /><span className="text-xs text-slate-500">{p.rating}</span></div>
                        <span className="text-xs text-slate-400">{p.bookings} bookings</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{p.earnings}</span>
                  </div>
                  {i < topProviders.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

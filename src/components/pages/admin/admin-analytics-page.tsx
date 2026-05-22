'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Users, Calendar, IndianRupee, BarChart3, Download, Loader2, AlertCircle } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

export function AdminAnalyticsPage() {
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useApi<{ label: string; value: string; change: string; icon: string; color: string }[]>('/admin/analytics/kpi')
  const { data: healthData, isLoading: healthLoading, error: healthError } = useApi<{ metric: string; value: string; status: string }[]>('/admin/analytics/health')

  const iconMap: Record<string, React.ElementType> = { IndianRupee, Users, Calendar, TrendingUp }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6" role="main" aria-label="System Analytics">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl" aria-label="Export analytics data"><Download className="size-4" /> Export</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key Performance Indicators">
          {kpiLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white rounded-xl"><CardContent className="p-4 flex items-center justify-center h-24"><Loader2 className="size-6 animate-spin text-slate-300" /></CardContent></Card>
            ))
          ) : kpiError ? (
            <Card className="bg-white rounded-xl col-span-full"><CardContent className="p-4 flex items-center gap-2 text-red-600"><AlertCircle className="size-4" /><span className="text-sm">Failed to load KPI data</span></CardContent></Card>
          ) : (kpiData && kpiData.length > 0) ? kpiData.map((kpi) => {
            const Icon = iconMap[kpi.icon] || TrendingUp
            return (
              <Card key={kpi.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.color}`}><Icon className="size-5" /></div>
                    <div><p className="text-xs text-slate-500">{kpi.label}</p><p className="text-lg font-bold text-slate-900">{kpi.value}</p></div>
                  </div>
                  <div className="flex items-center gap-1 mt-2"><TrendingUp className="size-3 text-emerald-500" /><span className="text-xs font-medium text-emerald-600">{kpi.change}</span></div>
                </CardContent>
              </Card>
            )
          }) : (
            <Card className="bg-white rounded-xl col-span-full"><CardContent className="p-8 text-center text-slate-400 text-sm">No analytics data available</CardContent></Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Charts Grid</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {['Revenue Trend', 'User Growth', 'Booking Funnel', 'Service Mix'].map((chart) => (
                  <div key={chart} className="h-32 rounded-lg bg-slate-50 flex items-center justify-center">
                    <div className="text-center"><BarChart3 className="size-6 text-slate-300 mx-auto" /><p className="text-xs text-slate-400 mt-1">{chart}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">System Health</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {healthLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : healthError ? (
                <div className="flex items-center gap-2 text-red-600 py-4"><AlertCircle className="size-4" /><span className="text-sm">Failed to load health data</span></div>
              ) : (healthData && healthData.length > 0) ? healthData.map((item, i) => (
                <div key={item.metric}>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-700">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">{item.status}</Badge>
                    </div>
                  </div>
                  {i < healthData.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              )) : (
                <p className="text-center text-slate-400 text-sm py-4">No health data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Users, UserPlus, UserCheck, Download } from 'lucide-react'

const userMetrics = [
  { label: 'Total Users', value: '12,456', change: '+1,234', icon: Users, color: 'bg-[#FFD54F]/10 text-[#0A1F44]' },
  { label: 'New Users (May)', value: '1,234', change: '+18%', icon: UserPlus, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Active Users', value: '8,432', change: '+12%', icon: UserCheck, color: 'bg-purple-100 text-purple-600' },
]

const demographics = [
  { group: '18-25', percentage: 22, count: 2740 },
  { group: '26-35', percentage: 35, count: 4360 },
  { group: '36-45', percentage: 25, count: 3114 },
  { group: '46-55', percentage: 12, count: 1495 },
  { group: '55+', percentage: 6, count: 747 },
]

const retentionData = [
  { month: 'Jan', rate: 72 },
  { month: 'Feb', rate: 68 },
  { month: 'Mar', rate: 75 },
  { month: 'Apr', rate: 78 },
  { month: 'May', rate: 82 },
]

export function AdminUserAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">User Analytics</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {userMetrics.map((m) => {
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
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Age Demographics</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {demographics.map((d, i) => (
                <div key={d.group}>
                  <div className="py-3">
                    <div className="flex items-center justify-between mb-1"><span className="text-sm text-slate-700">{d.group} years</span><span className="text-sm font-semibold text-slate-700">{d.count.toLocaleString()}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#FFD54F]/100 rounded-full" style={{ width: `${d.percentage}%` }} /></div>
                  </div>
                  {i < demographics.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">User Retention</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40">
                {retentionData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-500">{d.rate}%</span>
                    <div className="w-full rounded-t-sm bg-emerald-500" style={{ height: `${d.rate}%` }} />
                    <span className="text-xs text-slate-400">{d.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

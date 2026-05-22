'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Users, Calendar, IndianRupee, BarChart3, Download } from 'lucide-react'

const kpiCards = [
  { label: 'Total Revenue', value: '₹12,45,000', change: '+18.2%', icon: IndianRupee, color: 'bg-blue-100 text-blue-600' },
  { label: 'Active Users', value: '8,432', change: '+12.5%', icon: Users, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Total Bookings', value: '3,256', change: '+8.3%', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
  { label: 'Conversion Rate', value: '4.8%', change: '+0.5%', icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
]

const systemHealth = [
  { metric: 'API Uptime', value: '99.9%', status: 'Healthy' },
  { metric: 'Avg Response Time', value: '245ms', status: 'Good' },
  { metric: 'Error Rate', value: '0.12%', status: 'Healthy' },
  { metric: 'Active Sessions', value: '1,234', status: 'Normal' },
]

export function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
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
          })}
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
              {systemHealth.map((item, i) => (
                <div key={item.metric}>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-700">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">{item.status}</Badge>
                    </div>
                  </div>
                  {i < systemHealth.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

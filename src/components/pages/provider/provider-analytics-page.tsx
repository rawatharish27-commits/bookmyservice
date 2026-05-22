'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Eye, Star, Calendar, Users } from 'lucide-react'

const metrics = [
  { label: 'Total Bookings', value: '432', change: '+12%', trend: 'up' },
  { label: 'Completion Rate', value: '94%', change: '+3%', trend: 'up' },
  { label: 'Avg Rating', value: '4.7', change: '+0.2', trend: 'up' },
  { label: 'Response Time', value: '8 min', change: '-2 min', trend: 'up' },
  { label: 'Repeat Customers', value: '38%', change: '-5%', trend: 'down' },
  { label: 'Earnings/Booking', value: '₹1,250', change: '+8%', trend: 'up' },
]

const weeklyData = [
  { week: 'Week 1', bookings: 12, earnings: 15600 },
  { week: 'Week 2', bookings: 18, earnings: 22400 },
  { week: 'Week 3', bookings: 15, earnings: 18900 },
  { week: 'Week 4', bookings: 22, earnings: 27500 },
]

export function ProviderAnalyticsPage() {
  const maxEarnings = Math.max(...weeklyData.map(w => w.earnings))

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Calendar className="size-4" /> Last 30 Days</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="bg-white rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{metric.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {metric.trend === 'up' ? <TrendingUp className="size-3 text-emerald-500" /> : <TrendingDown className="size-3 text-red-500" />}
                  <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Weekly Performance</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {weeklyData.map((week, i) => (
              <div key={week.week}>
                <div className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{week.week}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{week.bookings} bookings</span>
                      <span className="text-sm font-semibold text-emerald-600">₹{week.earnings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(week.earnings / maxEarnings) * 100}%` }} />
                  </div>
                </div>
                {i < weeklyData.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Comparison Period</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-50"><p className="text-xs text-blue-600 font-medium">This Month</p><p className="text-lg font-bold text-slate-900">67 bookings</p><p className="text-xs text-emerald-600">+12% vs last month</p></div>
              <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-500 font-medium">Last Month</p><p className="text-lg font-bold text-slate-700">60 bookings</p><p className="text-xs text-slate-400">Baseline</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, IndianRupee, Calendar, Download } from 'lucide-react'

const dailyEarnings = [
  { date: 'Mon', amount: 2450 },
  { date: 'Tue', amount: 1800 },
  { date: 'Wed', amount: 3200 },
  { date: 'Thu', amount: 2900 },
  { date: 'Fri', amount: 2100 },
  { date: 'Sat', amount: 3800 },
  { date: 'Sun', amount: 1500 },
]

const breakdown = [
  { source: 'Air Conditioner', amount: '₹8,200', percentage: 35 },
  { source: 'Water Tank Cleaning', amount: '₹6,500', percentage: 28 },
  { source: 'Plumber', amount: '₹4,800', percentage: 20 },
  { source: 'Electrician', amount: '₹3,900', percentage: 17 },
]

export function ProviderEarningsPage() {
  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount))
  const totalEarnings = dailyEarnings.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">₹{totalEarnings.toLocaleString()}</p><p className="text-xs text-slate-500">This Week</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">₹{(totalEarnings * 4).toLocaleString()}</p><p className="text-xs text-slate-500">This Month</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">₹7,650</p><p className="text-xs text-slate-500">Pending</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Daily Earnings</CardTitle>
              <div className="flex gap-1">
                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                  <Button key={period} variant="ghost" size="sm" className="h-7 text-xs">{period}</Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {dailyEarnings.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500">₹{(day.amount / 1000).toFixed(1)}K</span>
                  <div className="w-full bg-blue-100 rounded-t-sm relative" style={{ height: `${(day.amount / maxEarning) * 100}%` }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-t-sm" />
                  </div>
                  <span className="text-[10px] text-slate-400">{day.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Earnings Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {breakdown.map((item, i) => (
              <div key={item.source}>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{item.source}</p>
                      <span className="text-sm font-semibold text-slate-700">{item.amount}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                </div>
                {i < breakdown.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

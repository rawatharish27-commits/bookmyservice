'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, IndianRupee, Download, Calendar } from 'lucide-react'

const revenueData = [
  { month: 'Jan', revenue: 580000, bookings: 1200 },
  { month: 'Feb', revenue: 620000, bookings: 1350 },
  { month: 'Mar', revenue: 710000, bookings: 1500 },
  { month: 'Apr', revenue: 680000, bookings: 1420 },
  { month: 'May', revenue: 820000, bookings: 1680 },
  { month: 'Jun', revenue: 890000, bookings: 1780 },
]

const sourceBreakdown = [
  { source: 'Service Bookings', amount: '₹8,45,000', percentage: 68 },
  { source: 'AMC Plans', amount: '₹2,10,000', percentage: 17 },
  { source: 'Subscription Fees', amount: '₹1,20,000', percentage: 10 },
  { source: 'Cancellation Fees', amount: '₹70,000', percentage: 5 },
]

export function AdminRevenueAnalyticsPage() {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Calendar className="size-4" /> Last 6 Months</Button>
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">₹43,00,000</p><p className="text-xs text-slate-500">Total Revenue</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-[#1D63FF]">₹8,90,000</p><p className="text-xs text-slate-500">This Month</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><div className="flex items-center justify-center gap-1"><TrendingUp className="size-4 text-emerald-500" /><p className="text-2xl font-bold text-emerald-600">+8.5%</p></div><p className="text-xs text-slate-500">MoM Growth</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {revenueData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500">₹{(d.revenue / 100000).toFixed(1)}L</span>
                  <div className="w-full rounded-t-sm bg-blue-500 transition-all" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }} />
                  <span className="text-xs text-slate-400">{d.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Revenue by Source</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {sourceBreakdown.map((item, i) => (
              <div key={item.source}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-900">{item.source}</span><span className="text-sm font-semibold text-slate-700">{item.amount}</span></div>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.percentage}%` }} /></div>
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{item.percentage}%</span>
                </div>
                {i < sourceBreakdown.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

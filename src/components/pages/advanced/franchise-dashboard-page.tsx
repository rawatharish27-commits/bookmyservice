'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Building2,
  CalendarCheck,
  Star,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  MapPin,
} from 'lucide-react'

const revenueMetrics = [
  { label: 'Total Revenue', value: '₹48,75,000', change: '+22.4%', trend: 'up', icon: IndianRupee, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  { label: 'Active Branches', value: '12', change: '+2', trend: 'up', icon: Building2, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Monthly Bookings', value: '4,328', change: '+15.7%', trend: 'up', icon: CalendarCheck, color: 'bg-purple-100 text-purple-600' },
  { label: 'Avg Rating', value: '4.6', change: '+0.2', trend: 'up', icon: Star, color: 'bg-amber-100 text-amber-600' },
]

const branchPerformance = [
  { name: 'Koramangala', city: 'Bengaluru', revenue: '₹8,45,000', bookings: 856, rating: 4.8, growth: '+18%', target: 92 },
  { name: 'Hinjewadi', city: 'Pune', revenue: '₹7,32,000', bookings: 723, rating: 4.7, growth: '+22%', target: 88 },
  { name: 'Andheri West', city: 'Mumbai', revenue: '₹6,98,000', bookings: 689, rating: 4.5, growth: '+12%', target: 85 },
  { name: 'Salt Lake', city: 'Kolkata', revenue: '₹5,67,000', bookings: 534, rating: 4.6, growth: '+25%', target: 78 },
  { name: 'T. Nagar', city: 'Chennai', revenue: '₹5,21,000', bookings: 498, rating: 4.4, growth: '+9%', target: 72 },
]

const topServices = [
  { name: 'Water Tank Cleaning', bookings: 1245, revenue: '₹12,45,000', share: 28 },
  { name: 'Air Conditioner', bookings: 987, revenue: '₹9,87,000', share: 22 },
  { name: 'Plumber', bookings: 756, revenue: '₹7,56,000', share: 17 },
  { name: 'Electrician', bookings: 654, revenue: '₹6,54,000', share: 15 },
  { name: 'Kitchen Appliances', bookings: 432, revenue: '₹4,32,000', share: 10 },
]

const monthlyBookings = [
  { month: 'Jan', volume: 2850 },
  { month: 'Feb', volume: 3120 },
  { month: 'Mar', volume: 3450 },
  { month: 'Apr', volume: 3200 },
  { month: 'May', volume: 3680 },
  { month: 'Jun', volume: 4328 },
]

const upcomingTargets = [
  { target: 'Revenue Target Q3', current: '₹48,75,000', goal: '₹65,00,000', progress: 75 },
  { target: 'New Customer Acquisition', current: '2,340', goal: '3,000', progress: 78 },
  { target: 'Service Expansion', current: '8', goal: '12', progress: 67 },
  { target: 'Customer Satisfaction', current: '4.6', goal: '4.8', progress: 96 },
]

export function FranchiseDashboardPage() {
  const maxVolume = Math.max(...monthlyBookings.map(m => m.volume))

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Franchise Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of all franchise operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1 rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91] text-white"><BarChart3 className="size-4" /> Reports</Button>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${metric.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{metric.label}</p>
                      <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="size-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="size-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Booking Volume Chart + Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">Booking Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {monthlyBookings.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-600">{(m.volume / 1000).toFixed(1)}k</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-[#1D63FF]"
                      style={{ height: `${(m.volume / maxVolume) * 160}px` }}
                    />
                    <span className="text-xs text-slate-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">Top Performing Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {topServices.map((service, i) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1D63FF]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{service.name}</p>
                        <p className="text-xs text-slate-500">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{service.revenue}</p>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${service.share}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{service.share}%</span>
                      </div>
                    </div>
                  </div>
                  {i < topServices.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Branch Comparison Table */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Branch Performance Comparison</CardTitle>
              <Badge variant="secondary" className="bg-blue-50 text-[#0B3D91] border-blue-200 text-[10px]">12 Branches</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 text-xs font-medium text-slate-500">Branch</th>
                    <th className="text-left py-3 text-xs font-medium text-slate-500">City</th>
                    <th className="text-right py-3 text-xs font-medium text-slate-500">Revenue</th>
                    <th className="text-right py-3 text-xs font-medium text-slate-500">Bookings</th>
                    <th className="text-center py-3 text-xs font-medium text-slate-500">Rating</th>
                    <th className="text-right py-3 text-xs font-medium text-slate-500">Growth</th>
                    <th className="text-center py-3 text-xs font-medium text-slate-500">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {branchPerformance.map((branch) => (
                    <tr key={branch.name} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800">{branch.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{branch.city}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">{branch.revenue}</td>
                      <td className="py-3 text-right text-slate-700">{branch.bookings.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="size-3 text-amber-400 fill-amber-400" />
                          <span className="font-medium">{branch.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-emerald-600 font-medium flex items-center justify-end gap-1">
                          <TrendingUp className="size-3" />{branch.growth}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={branch.target} className="h-2 flex-1" />
                          <span className="text-xs text-slate-500 w-8">{branch.target}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Targets */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-[#1D63FF]" />
              <CardTitle className="text-sm font-semibold text-slate-900">Upcoming Targets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingTargets.map((target) => (
                <div key={target.target} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-800">{target.target}</p>
                    <Badge variant="secondary" className={`text-[10px] ${target.progress >= 80 ? 'bg-emerald-50 text-emerald-700' : target.progress >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {target.progress >= 80 ? 'On Track' : target.progress >= 60 ? 'At Risk' : 'Behind'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">{target.current}</span>
                    <span className="text-xs text-slate-400">of {target.goal}</span>
                  </div>
                  <Progress value={target.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

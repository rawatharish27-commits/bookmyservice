'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserPlus,
  Heart,
  TrendingUp,
  ArrowUpRight,
  IndianRupee,
  Target,
  PieChart,
  BarChart3,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Share2,
  Download,
} from 'lucide-react'

const crmMetrics = [
  { label: 'Total Customers', value: '24,567', change: '+1,234', icon: Users, color: 'bg-blue-100 text-blue-600' },
  { label: 'New This Month', value: '1,234', change: '+18.5%', icon: UserPlus, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Retention Rate', value: '78.4%', change: '+3.2%', icon: Heart, color: 'bg-pink-100 text-pink-600' },
  { label: 'Avg LTV', value: '₹8,450', change: '+12.3%', icon: IndianRupee, color: 'bg-amber-100 text-amber-600' },
]

const acquisitionFunnel = [
  { stage: 'Website Visitors', count: 45230, percentage: 100, color: 'bg-blue-500' },
  { stage: 'Service Page Views', count: 18920, percentage: 42, color: 'bg-blue-400' },
  { stage: 'Started Booking', count: 8540, percentage: 19, color: 'bg-blue-300' },
  { stage: 'Completed Booking', count: 4328, percentage: 10, color: 'bg-emerald-500' },
  { stage: 'Repeat Customers', count: 2456, percentage: 5, color: 'bg-emerald-400' },
]

const customerSegments = [
  { name: 'Premium', count: 3245, percentage: 13, color: 'bg-amber-500', avgSpend: '₹15,200' },
  { name: 'Regular', count: 8765, percentage: 36, color: 'bg-blue-500', avgSpend: '₹6,800' },
  { name: 'Occasional', count: 6543, percentage: 27, color: 'bg-purple-500', avgSpend: '₹3,200' },
  { name: 'New', count: 4321, percentage: 18, color: 'bg-emerald-500', avgSpend: '₹1,800' },
  { name: 'At Risk', count: 1693, percentage: 7, color: 'bg-red-500', avgSpend: '₹2,400' },
]

const leadSources = [
  { source: 'Google Search', count: 4520, percentage: 35, icon: '🔍' },
  { source: 'Social Media', count: 2890, percentage: 22, icon: '📱' },
  { source: 'Referrals', count: 2340, percentage: 18, icon: '👥' },
  { source: 'Direct Traffic', count: 1670, percentage: 13, icon: '🌐' },
  { source: 'Email Campaigns', count: 890, percentage: 7, icon: '📧' },
  { source: 'Offline Ads', count: 560, percentage: 4, icon: '📺' },
]

const recentInteractions = [
  { customer: 'Ananya Iyer', action: 'Booked AC Service', time: '2 min ago', channel: 'App', type: 'booking' },
  { customer: 'Vikram Singh', action: 'Left 5-star review', time: '15 min ago', channel: 'App', type: 'review' },
  { customer: 'Meera Joshi', action: 'Inquired about AMC plan', time: '32 min ago', channel: 'Chat', type: 'inquiry' },
  { customer: 'Arjun Reddy', action: 'Rebooked plumbing service', time: '1 hr ago', channel: 'Call', type: 'booking' },
  { customer: 'Pooja Nair', action: 'Submitted refund request', time: '2 hrs ago', channel: 'Email', type: 'support' },
  { customer: 'Rohan Gupta', action: 'Upgraded to Premium', time: '3 hrs ago', channel: 'App', type: 'upgrade' },
]

export function CRMDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CRM Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Customer relationship management overview</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export Report</Button>
        </div>

        {/* CRM Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {crmMetrics.map((metric) => {
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
                    <ArrowUpRight className="size-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">{metric.change}</span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Acquisition Funnel + Customer Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Acquisition Funnel */}
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-blue-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">Customer Acquisition Funnel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {acquisitionFunnel.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{stage.stage}</span>
                    <span className="text-xs text-slate-500">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="relative h-8 bg-slate-50 rounded-lg overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${stage.color} rounded-lg flex items-center px-3 transition-all`}
                      style={{ width: `${stage.percentage}%` }}
                    >
                      <span className="text-xs font-medium text-white">{stage.percentage}%</span>
                    </div>
                  </div>
                  {i < acquisitionFunnel.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowUpRight className="size-3 text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="size-4 text-purple-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">Customer Segments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Visual pie placeholder */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative size-36">
                  <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="18" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="18"
                      strokeDasharray={`${13 * 2.51} ${100 * 2.51}`} strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="18"
                      strokeDasharray={`${36 * 2.51} ${100 * 2.51}`} strokeDashoffset={`${-13 * 2.51}`} />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="18"
                      strokeDasharray={`${27 * 2.51} ${100 * 2.51}`} strokeDashoffset={`${-49 * 2.51}`} />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="18"
                      strokeDasharray={`${18 * 2.51} ${100 * 2.51}`} strokeDashoffset={`${-76 * 2.51}`} />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="18"
                      strokeDasharray={`${7 * 2.51} ${100 * 2.51}`} strokeDashoffset={`${-94 * 2.51}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">24.6K</p>
                      <p className="text-[10px] text-slate-400">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-0">
                {customerSegments.map((segment, i) => (
                  <div key={segment.name}>
                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`size-3 rounded-full ${segment.color}`} />
                        <span className="text-sm text-slate-700">{segment.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">{segment.count.toLocaleString()}</span>
                        <span className="text-xs font-medium text-slate-800">{segment.avgSpend}</span>
                        <Badge variant="secondary" className="text-[10px] bg-slate-50">{segment.percentage}%</Badge>
                      </div>
                    </div>
                    {i < customerSegments.length - 1 && <Separator className="bg-slate-50" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Sources + Recent Interactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Sources */}
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-emerald-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">Lead Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {leadSources.map((source, i) => (
                <div key={source.source}>
                  <div className="flex items-center gap-3 py-3">
                    <span className="text-lg">{source.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{source.source}</span>
                        <span className="text-xs text-slate-500">{source.count.toLocaleString()} leads</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${source.percentage}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-10 text-right">{source.percentage}%</span>
                  </div>
                  {i < leadSources.length - 1 && <Separator className="bg-slate-50" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-blue-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">Recent Interactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {recentInteractions.map((interaction, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-3">
                    <div className={`flex size-8 items-center justify-center rounded-full ${
                      interaction.type === 'booking' ? 'bg-blue-100' :
                      interaction.type === 'review' ? 'bg-amber-100' :
                      interaction.type === 'inquiry' ? 'bg-purple-100' :
                      interaction.type === 'support' ? 'bg-red-100' :
                      'bg-emerald-100'
                    }`}>
                      {interaction.type === 'booking' ? <CalendarIcon className="size-4 text-blue-600" /> :
                       interaction.type === 'review' ? <Star className="size-4 text-amber-600" /> :
                       interaction.type === 'inquiry' ? <MessageSquare className="size-4 text-purple-600" /> :
                       interaction.type === 'support' ? <Phone className="size-4 text-red-600" /> :
                       <TrendingUp className="size-4 text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{interaction.customer}</p>
                      <p className="text-xs text-slate-500 truncate">{interaction.action}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="secondary" className="text-[10px] bg-slate-50">{interaction.channel}</Badge>
                      <p className="text-[10px] text-slate-400 mt-1">{interaction.time}</p>
                    </div>
                  </div>
                  {i < recentInteractions.length - 1 && <Separator className="bg-slate-50" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Customer Lifetime Value */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="size-4 text-amber-600" />
              <CardTitle className="text-sm font-semibold text-slate-900">Customer Lifetime Value Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-100 p-4 text-center">
                <p className="text-xs text-slate-500">Avg LTV</p>
                <p className="text-xl font-bold text-slate-900 mt-1">₹8,450</p>
                <span className="text-xs text-emerald-600 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="size-3" />+12.3%
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 p-4 text-center">
                <p className="text-xs text-slate-500">LTV Premium</p>
                <p className="text-xl font-bold text-slate-900 mt-1">₹22,340</p>
                <span className="text-xs text-emerald-600 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="size-3" />+18.7%
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 p-4 text-center">
                <p className="text-xs text-slate-500">CAC</p>
                <p className="text-xl font-bold text-slate-900 mt-1">₹1,250</p>
                <span className="text-xs text-emerald-600 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="size-3" />-8.4%
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 p-4 text-center">
                <p className="text-xs text-slate-500">LTV:CAC Ratio</p>
                <p className="text-xl font-bold text-slate-900 mt-1">6.8x</p>
                <span className="text-xs text-emerald-600 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="size-3" />+0.4x
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

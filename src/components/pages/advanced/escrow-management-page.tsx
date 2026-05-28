'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  IndianRupee,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Calendar,
  User,
  Building2,
  ChevronRight,
  Gavel,
  Banknote,
  Wallet,
} from 'lucide-react'

const escrowSummary = [
  { label: 'Total Escrow Balance', value: '₹24,56,000', change: '+18.4%', icon: Wallet, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  { label: 'Active Escrows', value: '142', change: '+12', icon: Lock, color: 'bg-amber-100 text-amber-600' },
  { label: 'Released This Month', value: '₹18,34,000', change: '+22%', icon: Unlock, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Pending Release', value: '₹6,22,000', change: '-5.2%', icon: Clock, color: 'bg-purple-100 text-purple-600' },
]

type EscrowStatus = 'Active' | 'Released' | 'Pending' | 'Disputed'

interface Escrow {
  id: string
  booking: string
  customer: string
  provider: string
  amount: string
  status: EscrowStatus
  createdDate: string
  releaseDate: string | null
  service: string
}

const escrows: Escrow[] = [
  { id: 'ESC-001', booking: 'BK-4521', customer: 'Ananya Iyer', provider: 'Ramesh Kumar', amount: '₹499', status: 'Active', createdDate: '12 Mar 2025', releaseDate: null, service: 'Water Tank Cleaning' },
  { id: 'ESC-002', booking: 'BK-4518', customer: 'Vikram Singh', provider: 'Sunil Yadav', amount: '₹499', status: 'Active', createdDate: '11 Mar 2025', releaseDate: null, service: 'Air Conditioner' },
  { id: 'ESC-003', booking: 'BK-4515', customer: 'Priya Sharma', provider: 'Deepak Verma', amount: '₹499', status: 'Pending', createdDate: '10 Mar 2025', releaseDate: null, service: 'Electrician' },
  { id: 'ESC-004', booking: 'BK-4510', customer: 'Arjun Reddy', provider: 'Mohan Das', amount: '₹499', status: 'Released', createdDate: '08 Mar 2025', releaseDate: '10 Mar 2025', service: 'Plumber' },
  { id: 'ESC-005', booking: 'BK-4505', customer: 'Meera Joshi', provider: 'Raju Patel', amount: '₹499', status: 'Disputed', createdDate: '07 Mar 2025', releaseDate: null, service: 'Kitchen Appliances' },
  { id: 'ESC-006', booking: 'BK-4500', customer: 'Karthik Raja', provider: 'Venkat Rao', amount: '₹499', status: 'Released', createdDate: '05 Mar 2025', releaseDate: '08 Mar 2025', service: 'Air Conditioner' },
  { id: 'ESC-007', booking: 'BK-4495', customer: 'Rohan Gupta', provider: 'Amit Tiwari', amount: '₹349', status: 'Released', createdDate: '04 Mar 2025', releaseDate: '06 Mar 2025', service: 'Plumber' },
  { id: 'ESC-008', booking: 'BK-4490', customer: 'Pooja Nair', provider: 'Suresh Menon', amount: '₹499', status: 'Active', createdDate: '03 Mar 2025', releaseDate: null, service: 'Water Tank Cleaning' },
  { id: 'ESC-009', booking: 'BK-4485', customer: 'Deepak Kumar', provider: 'Manoj Singh', amount: '₹499', status: 'Disputed', createdDate: '02 Mar 2025', releaseDate: null, service: 'Electrician' },
  { id: 'ESC-010', booking: 'BK-4480', customer: 'Lakshmi Reddy', provider: 'Kiran Babu', amount: '₹399', status: 'Pending', createdDate: '01 Mar 2025', releaseDate: null, service: 'Water Purifier' },
]

const transactionTimeline = [
  { time: '12:45 PM', event: 'Escrow ESC-001 created', amount: '₹499', type: 'created' as const },
  { time: '11:30 AM', event: 'Escrow ESC-003 moved to Pending', amount: '₹499', type: 'pending' as const },
  { time: '10:15 AM', event: 'Escrow ESC-004 released to provider', amount: '₹499', type: 'released' as const },
  { time: '09:00 AM', event: 'Escrow ESC-005 dispute raised', amount: '₹499', type: 'disputed' as const },
  { time: 'Yesterday', event: 'Escrow ESC-006 released to provider', amount: '₹499', type: 'released' as const },
  { time: 'Yesterday', event: 'Escrow ESC-007 released to provider', amount: '₹349', type: 'released' as const },
  { time: '2 days ago', event: 'Escrow ESC-009 dispute raised', amount: '₹499', type: 'disputed' as const },
]

const disputedEscrows = [
  { id: 'ESC-005', customer: 'Meera Joshi', provider: 'Raju Patel', amount: '₹499', reason: 'Service quality not as expected - kitchen appliance issue within 3 days', filedDate: '09 Mar 2025', status: 'Under Review' },
  { id: 'ESC-009', customer: 'Deepak Kumar', provider: 'Manoj Singh', amount: '₹499', reason: 'Electrical issue not resolved - recurring problem after service', filedDate: '08 Mar 2025', status: 'Mediation' },
]

const statusConfig: Record<EscrowStatus, { badge: string; icon: React.ReactNode }> = {
  'Active': { badge: 'bg-blue-50 text-[#0B3D91] border-blue-200', icon: <Lock className="size-3" /> },
  'Released': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="size-3" /> },
  'Pending': { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="size-3" /> },
  'Disputed': { badge: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="size-3" /> },
}

export function EscrowManagementPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Escrow Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage escrow payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><RefreshCw className="size-4" /> Sync</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {escrowSummary.map((metric) => {
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
                    {metric.change.startsWith('+') ? (
                      <ArrowUpRight className="size-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="size-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Escrow Balance Card */}
        <Card className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] rounded-xl text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-blue-200">Total Escrow Balance</p>
                <p className="text-3xl font-bold mt-1">₹24,56,000</p>
                <p className="text-xs text-blue-200 mt-1">Across 142 active escrow accounts</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-blue-200">Active</p>
                  <p className="text-lg font-bold">₹12,45,000</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-blue-200">Pending</p>
                  <p className="text-lg font-bold">₹6,22,000</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-blue-200">Disputed</p>
                  <p className="text-lg font-bold">₹5,89,000</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="bg-white rounded-xl h-auto p-1">
            <TabsTrigger value="all" className="rounded-lg text-xs">All Escrows</TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg text-xs">Active</TabsTrigger>
            <TabsTrigger value="released" className="rounded-lg text-xs">Released</TabsTrigger>
            <TabsTrigger value="disputed" className="rounded-lg text-xs">Disputed</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg text-xs">Timeline</TabsTrigger>
          </TabsList>

          {/* All Escrows Tab */}
          <TabsContent value="all" className="mt-4">
            <Card className="bg-white rounded-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Escrow ID</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Booking</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Customer</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Provider</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Service</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Amount</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escrows.map((escrow) => (
                        <tr key={escrow.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono text-xs text-[#1D63FF]">{escrow.id}</td>
                          <td className="py-3 px-4 text-slate-600">{escrow.booking}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <User className="size-3 text-slate-400" />
                              <span className="text-slate-800">{escrow.customer}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{escrow.provider}</td>
                          <td className="py-3 px-4 text-slate-600">{escrow.service}</td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900">{escrow.amount}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary" className={`text-[10px] gap-1 ${statusConfig[escrow.status].badge}`}>
                              {statusConfig[escrow.status].icon}
                              {escrow.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">{escrow.createdDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escrows.filter(e => e.status === 'Active').map((escrow) => (
                <Card key={escrow.id} className="bg-white rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-[#1D63FF]">{escrow.id}</span>
                      <Badge variant="secondary" className={`text-[10px] gap-1 ${statusConfig[escrow.status].badge}`}>
                        {statusConfig[escrow.status].icon} {escrow.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{escrow.amount}</p>
                    <p className="text-xs text-slate-500 mt-1">{escrow.service}</p>
                    <Separator className="bg-slate-100 my-3" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Customer:</span> <span className="text-slate-700">{escrow.customer}</span></div>
                      <div><span className="text-slate-400">Provider:</span> <span className="text-slate-700">{escrow.provider}</span></div>
                      <div><span className="text-slate-400">Booking:</span> <span className="text-slate-700">{escrow.booking}</span></div>
                      <div><span className="text-slate-400">Created:</span> <span className="text-slate-700">{escrow.createdDate}</span></div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 gap-1">
                        <Unlock className="size-3" /> Release
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1">
                        <AlertTriangle className="size-3" /> Dispute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Released Tab */}
          <TabsContent value="released" className="mt-4">
            <div className="space-y-3">
              {escrows.filter(e => e.status === 'Released').map((escrow) => (
                <Card key={escrow.id} className="bg-white rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{escrow.service}</p>
                          <p className="text-xs text-slate-500">{escrow.customer} → {escrow.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{escrow.amount}</p>
                        <p className="text-[10px] text-slate-400">Released {escrow.releaseDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Disputed Tab */}
          <TabsContent value="disputed" className="mt-4">
            <div className="space-y-4">
              {disputedEscrows.map((dispute) => (
                <Card key={dispute.id} className="bg-white rounded-xl border-red-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Gavel className="size-4 text-red-500" />
                        <span className="font-mono text-xs text-[#1D63FF]">{dispute.id}</span>
                        <Badge variant="secondary" className={`text-[10px] ${
                          dispute.status === 'Under Review' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {dispute.status}
                        </Badge>
                      </div>
                      <span className="text-lg font-bold text-slate-900">{dispute.amount}</span>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-red-800 mb-1">Dispute Reason:</p>
                      <p className="text-xs text-red-700">{dispute.reason}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Customer:</span> <span className="text-slate-700">{dispute.customer}</span></div>
                      <div><span className="text-slate-400">Provider:</span> <span className="text-slate-700">{dispute.provider}</span></div>
                      <div><span className="text-slate-400">Filed:</span> <span className="text-slate-700">{dispute.filedDate}</span></div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="h-7 text-xs rounded-lg bg-[#1D63FF] hover:bg-[#0B3D91]">Resolve</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg">View Chat</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-4">
            <Card className="bg-white rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">Transaction Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6">
                  <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-200" />
                  {transactionTimeline.map((event, i) => (
                    <div key={i} className="relative pb-6 last:pb-0">
                      <div className={`absolute left-[-14px] top-1 size-3 rounded-full border-2 ${
                        event.type === 'created' ? 'bg-blue-500 border-blue-200' :
                        event.type === 'released' ? 'bg-emerald-500 border-emerald-200' :
                        event.type === 'pending' ? 'bg-amber-500 border-amber-200' :
                        'bg-red-500 border-red-200'
                      }`} />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-800">{event.event}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{event.time}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{event.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

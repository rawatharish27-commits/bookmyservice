'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Shield, UserX, Eye, Ban, CheckCircle } from 'lucide-react'

const fraudAlerts = [
  { id: 1, type: 'Multiple Refunds', user: 'User #4521', detail: '5 refund requests in 48 hours', severity: 'High', date: '22 May 2024', status: 'Open' },
  { id: 2, type: 'Fake Provider', user: 'A1 Repair Hub', detail: 'KYC documents appear forged', severity: 'Critical', date: '21 May 2024', status: 'Under Review' },
  { id: 3, type: 'Suspicious Login', user: 'User #3210', detail: 'Login from 3 different countries in 1 hour', severity: 'Medium', date: '20 May 2024', status: 'Resolved' },
  { id: 4, type: 'Payment Fraud', user: 'User #5678', detail: 'Multiple failed payment attempts', severity: 'High', date: '19 May 2024', status: 'Open' },
]

const blockedUsers = [
  { id: 1, name: 'User #2847', reason: 'Payment fraud', blockedDate: '15 May 2024', blockedBy: 'System' },
  { id: 2, name: 'Fake Provider #12', reason: 'Forged KYC documents', blockedDate: '10 May 2024', blockedBy: 'Admin' },
]

const severityColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200',
}

const statusColors: Record<string, string> = {
  Open: 'bg-red-100 text-red-700 border-red-200',
  'Under Review': 'bg-amber-100 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export function AdminFraudPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Fraud Detection</h1>
          <Badge className="bg-red-100 text-red-700 border-red-200">{fraudAlerts.filter(a => a.status === 'Open').length} Open Alerts</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><AlertTriangle className="size-5 text-red-500 mx-auto mb-1" /><p className="text-lg font-bold text-red-600">{fraudAlerts.filter(a => a.status !== 'Resolved').length}</p><p className="text-xs text-slate-500">Active Alerts</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Shield className="size-5 text-[#1D63FF] mx-auto mb-1" /><p className="text-lg font-bold text-[#1D63FF]">12</p><p className="text-xs text-slate-500">Cases This Month</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><UserX className="size-5 text-purple-600 mx-auto mb-1" /><p className="text-lg font-bold text-purple-600">{blockedUsers.length}</p><p className="text-xs text-slate-500">Blocked Users</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Fraud Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {fraudAlerts.map((alert, i) => (
              <div key={alert.id}>
                <div className="flex items-center gap-4 py-3">
                  <AlertTriangle className={`size-5 ${alert.severity === 'Critical' ? 'text-red-500' : alert.severity === 'High' ? 'text-orange-500' : 'text-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">{alert.type}</p>
                      <Badge variant="secondary" className={severityColors[alert.severity]}>{alert.severity}</Badge>
                      <Badge variant="secondary" className={statusColors[alert.status]}>{alert.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.user} • {alert.detail} • {alert.date}</p>
                  </div>
                  <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button><Button variant="ghost" size="sm" className="h-7 text-red-500"><Ban className="size-3" /></Button></div>
                </div>
                {i < fraudAlerts.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Blocked Users</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {blockedUsers.map((u, i) => (
              <div key={u.id}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-400">Reason: {u.reason} • Blocked: {u.blockedDate} by {u.blockedBy}</p></div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded-lg border-emerald-200 text-emerald-600"><CheckCircle className="size-3" /> Unblock</Button>
                </div>
                {i < blockedUsers.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

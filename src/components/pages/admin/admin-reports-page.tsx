'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Calendar, Clock, Plus } from 'lucide-react'

const reportTypes = [
  { id: 1, name: 'Revenue Report', description: 'Detailed revenue breakdown by source, period, and category', icon: '💰', lastGenerated: '22 May 2024', frequency: 'Weekly' },
  { id: 2, name: 'Booking Report', description: 'All booking data with filters for status, category, and date', icon: '📅', lastGenerated: '21 May 2024', frequency: 'Daily' },
  { id: 3, name: 'User Report', description: 'User growth, demographics, and activity metrics', icon: '👥', lastGenerated: '20 May 2024', frequency: 'Monthly' },
  { id: 4, name: 'Provider Report', description: 'Provider performance, KYC status, and earnings data', icon: '🔧', lastGenerated: '19 May 2024', frequency: 'Weekly' },
  { id: 5, name: 'Payment Report', description: 'All transactions, refunds, and payment method analysis', icon: '💳', lastGenerated: '22 May 2024', frequency: 'Daily' },
  { id: 6, name: 'Fraud Report', description: 'Suspicious activities and flagged transactions', icon: '🚨', lastGenerated: '22 May 2024', frequency: 'Daily' },
]

const scheduledReports = [
  { id: 1, name: 'Weekly Revenue Summary', schedule: 'Every Monday 9 AM', recipients: 'admin@bookmyservice.com', nextRun: '27 May 2024' },
  { id: 2, name: 'Daily Booking Digest', schedule: 'Every day 11 PM', recipients: 'ops@bookmyservice.com', nextRun: '22 May 2024' },
]

export function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Custom Report</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <Card key={report.id} className="bg-white rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{report.icon}</span>
                  <div><h3 className="text-sm font-semibold text-slate-900">{report.name}</h3><p className="text-[10px] text-slate-400">{report.frequency}</p></div>
                </div>
                <p className="text-xs text-slate-500 mb-3">{report.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs bg-[#1D63FF] hover:bg-[#0B3D91] gap-1 rounded-lg"><Download className="size-3" /> Generate</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg"><Calendar className="size-3" /> Schedule</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Scheduled Reports</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {scheduledReports.map((sr, i) => (
              <div key={sr.id}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2"><FileText className="size-4 text-[#1D63FF]" /><p className="text-sm font-medium text-slate-900">{sr.name}</p></div>
                    <p className="text-xs text-slate-400 mt-1">{sr.schedule} • {sr.recipients}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Next: {sr.nextRun}</p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500">Cancel</Button>
                  </div>
                </div>
                {i < scheduledReports.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

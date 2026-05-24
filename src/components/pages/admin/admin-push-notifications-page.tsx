'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { BellRing, Send, Users, Calendar, BarChart3 } from 'lucide-react'

const campaigns = [
  { id: 1, name: 'Summer Sale Push', segment: 'All Customers', status: 'Completed', sent: 8432, delivered: 8100, opened: 3240, date: '20 May 2024' },
  { id: 2, name: 'New Feature Alert', segment: 'Active Users', status: 'Scheduled', sent: 0, delivered: 0, opened: 0, date: '25 May 2024' },
  { id: 3, name: 'Win-Back Campaign', segment: 'Inactive 30d+', status: 'Draft', sent: 0, delivered: 0, opened: 0, date: '—' },
]

const statusColors: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  Draft: 'bg-slate-100 text-slate-500 border-slate-200',
  Sending: 'bg-amber-100 text-amber-700 border-amber-200',
}

export function AdminPushNotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Push Notifications</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><BellRing className="size-4" /> New Campaign</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Create Push Campaign</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Campaign Name</label><Input placeholder="e.g., Weekend Offer" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Title</label><Input placeholder="Push notification title" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Message</label><Textarea placeholder="Push notification body..." rows={2} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Segment</label><Input placeholder="e.g., Active Customers" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Schedule</label><Input type="datetime-local" /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs rounded-lg">Save Draft</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 text-xs rounded-xl"><Send className="size-3" /> Send Now</Button>
              <Button variant="outline" size="sm" className="gap-1 text-xs rounded-lg"><Calendar className="size-3" /> Schedule</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Campaigns</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {campaigns.map((c, i) => (
              <div key={c.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50"><BellRing className="size-4 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{c.name}</p><Badge variant="secondary" className={statusColors[c.status]}>{c.status}</Badge></div>
                    <p className="text-xs text-slate-400 mt-0.5"><Users className="size-3 inline mr-0.5" />{c.segment} • {c.date}</p>
                  </div>
                  {c.status === 'Completed' && (
                    <div className="text-right text-xs text-slate-500 hidden sm:block">
                      <p>Delivered: {c.delivered.toLocaleString()}</p>
                      <p>Opened: {c.opened.toLocaleString()} ({Math.round((c.opened / c.delivered) * 100)}%)</p>
                    </div>
                  )}
                </div>
                {i < campaigns.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

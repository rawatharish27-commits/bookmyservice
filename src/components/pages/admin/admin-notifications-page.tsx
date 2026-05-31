'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Bell, Send, Clock, Eye, Plus, Search } from 'lucide-react'

const templates = [
  { id: 1, name: 'Booking Confirmation', type: 'Booking', lastSent: '22 May 2024', sentCount: 3456 },
  { id: 2, name: 'Payment Received', type: 'Payment', lastSent: '22 May 2024', sentCount: 2890 },
  { id: 3, name: 'Service Reminder', type: 'Reminder', lastSent: '21 May 2024', sentCount: 1234 },
  { id: 4, name: 'Welcome New User', type: 'Onboarding', lastSent: '20 May 2024', sentCount: 890 },
]

const sendHistory = [
  { id: 1, template: 'Booking Confirmation', recipients: 45, date: '22 May 2024', status: 'Delivered', deliveryRate: '98%' },
  { id: 2, template: 'Special Offer', recipients: 1250, date: '20 May 2024', status: 'Delivered', deliveryRate: '95%' },
  { id: 3, template: 'Service Reminder', recipients: 34, date: '19 May 2024', status: 'Delivered', deliveryRate: '100%' },
]

export function AdminNotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl"><Send className="size-4" /> Broadcast</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Broadcast Message</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Subject line..." />
            <textarea className="w-full rounded-lg border border-slate-200 p-3 text-sm resize-none" rows={3} placeholder="Type your message..." />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs gap-1 rounded-lg"><Eye className="size-3" /> Preview</Button>
              <Button size="sm" className="bg-[#1D63FF] hover:bg-[#0B3D91] text-white text-xs gap-1 rounded-lg"><Send className="size-3" /> Send to All</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Templates</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {templates.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50"><Bell className="size-4 text-[#1D63FF]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.type} • Sent {t.sentCount.toLocaleString()} times</p>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">Last: {t.lastSent}</span>
                </div>
                {i < templates.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Send History</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {sendHistory.map((h, i) => (
              <div key={h.id}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{h.template}</p><p className="text-xs text-slate-400">{h.recipients} recipients • {h.date}</p></div>
                  <div className="text-right"><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">{h.status}</Badge><p className="text-xs text-slate-400 mt-1">{h.deliveryRate} delivery</p></div>
                </div>
                {i < sendHistory.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

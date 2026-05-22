'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Plus, Search, HelpCircle, ChevronRight, Clock } from 'lucide-react'

const tickets = [
  { id: 'TK-001', subject: 'Refund not received', date: '10 May 2025', status: 'Open', priority: 'High' },
  { id: 'TK-002', subject: 'Provider was late', date: '5 May 2025', status: 'Resolved', priority: 'Medium' },
  { id: 'TK-003', subject: 'Wrong service performed', date: '1 May 2025', status: 'Closed', priority: 'High' },
]

const faqs = [
  { q: 'How do I cancel a booking?', a: 'Go to My Bookings → Select booking → Cancel' },
  { q: 'When will I get my refund?', a: 'Refunds are processed within 3-5 business days' },
  { q: 'How to reschedule a booking?', a: 'Go to booking details → Reschedule → Pick new time' },
  { q: 'Can I change the provider?', a: 'Yes, cancel and rebook with a different provider' },
]

const statusColors: Record<string, string> = {
  Open: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
}

export function ClientSupportPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><Plus className="size-4" /> New Ticket</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">My Tickets</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {tickets.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50"><MessageSquare className="size-4 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t.subject}</p>
                    <p className="text-xs text-slate-400">{t.id} • {t.date}</p>
                  </div>
                  <Badge variant="secondary" className={statusColors[t.status]}>{t.status}</Badge>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>
                {i < tickets.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><HelpCircle className="size-4 text-blue-500" /><CardTitle className="text-sm font-semibold text-slate-900">Frequently Asked Questions</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-slate-100 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-900">{faq.q}</p>
                <p className="text-xs text-slate-500 mt-1">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

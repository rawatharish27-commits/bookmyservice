'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Plus, Search, HelpCircle, ChevronRight, Clock } from 'lucide-react'

const tickets = [
  { id: 'TK-101', subject: 'Payment not received for booking #1018', date: '20 May 2024', status: 'Open', priority: 'High' },
  { id: 'TK-100', subject: 'Customer dispute on booking #1015', date: '18 May 2024', status: 'In Progress', priority: 'Medium' },
  { id: 'TK-099', subject: 'App crash during booking acceptance', date: '15 May 2024', status: 'Resolved', priority: 'Low' },
]

const faqs = [
  { q: 'How do I update my bank details?', a: 'Go to Settings → Payout → Update Bank Details' },
  { q: 'When will I receive my payout?', a: 'Payouts are processed every Monday for the previous week' },
  { q: 'How to respond to a negative review?', a: 'Go to Reviews → Find the review → Click Reply' },
]

const statusColors: Record<string, string> = {
  Open: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  'In Progress': 'bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
}

export function ProviderSupportPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <Button size="sm" className="gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl"><Plus className="size-4" /> New Ticket</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">My Tickets</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {tickets.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#FFD54F]/10"><MessageSquare className="size-4 text-[#0A1F44]" /></div>
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
            <div className="flex items-center gap-2"><HelpCircle className="size-4 text-[#FFD54F]/800" /><CardTitle className="text-sm font-semibold text-slate-900">Frequently Asked Questions</CardTitle></div>
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

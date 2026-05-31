'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Plus, HelpCircle, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface Ticket {
  id: string
  subject: string
  date: string
  status: string
  priority: string
}

interface Faq {
  q: string
  a: string
}

interface SupportData {
  tickets: Ticket[]
  faqs: Faq[]
}

const statusColors: Record<string, string> = {
  Open: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
}

export function ClientSupportPage() {
  const { navigate } = useApp()
  const { data: supportData, loading, error, refetch } = useApi<SupportData>(async () => {
    const res = await fetch('/api/client/support')
    if (!res.ok) throw new Error('Failed to load support data')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading support data">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load support data</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl" aria-label="Create new ticket"><Plus className="size-4" /> New Ticket</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">My Tickets</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {(!supportData?.tickets || supportData.tickets.length === 0) ? (
              <p className="text-center text-slate-400 py-8 text-sm">No tickets yet</p>
            ) : (
              supportData.tickets.map((t, i) => (
                <div key={t.id}>
                  <div className="flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg" onClick={() => navigate('client-support-detail', { id: t.id })} role="button" tabIndex={0} aria-label={`View ticket ${t.subject}`}>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50"><MessageSquare className="size-4 text-[#1D63FF]" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{t.subject}</p>
                      <p className="text-xs text-slate-400">{t.id} &bull; {t.date}</p>
                    </div>
                    <Badge variant="secondary" className={statusColors[t.status] ?? statusColors.Closed}>{t.status}</Badge>
                    <ChevronRight className="size-4 text-slate-400" />
                  </div>
                  {i < supportData.tickets.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {supportData?.faqs && supportData.faqs.length > 0 && (
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><HelpCircle className="size-4 text-blue-500" /><CardTitle className="text-sm font-semibold text-slate-900">Frequently Asked Questions</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {supportData.faqs.map((faq, i) => (
                <div key={i} className="rounded-lg border border-slate-100 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-medium text-slate-900">{faq.q}</p>
                  <p className="text-xs text-slate-500 mt-1">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

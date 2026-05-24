'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Send, Paperclip, ArrowLeft, Clock, MessageSquare, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface Message {
  id: string
  from: 'user' | 'agent'
  text: string
  time: string
}

interface SupportDetail {
  subject: string
  ticketId: string
  createdDate: string
  status: string
  messages: Message[]
}

export function ClientSupportDetailPage() {
  const { goBack } = useApp()
  const { data: detail, loading, error, refetch } = useApi<SupportDetail>(async () => {
    const res = await fetch('/api/client/support/detail')
    if (!res.ok) throw new Error('Failed to load support detail')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading support ticket">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load support ticket</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">Ticket not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-700 -ml-2" onClick={goBack} aria-label="Go back"><ArrowLeft className="size-4" /> Back</Button>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50"><MessageSquare className="size-5 text-blue-600" /></div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-slate-900">{detail.subject}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400"><Clock className="size-3" />{detail.ticketId} &bull; Created {detail.createdDate}</div>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">{detail.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {detail.messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 ${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <p className="text-sm">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <Separator />
          <div className="p-3 flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-slate-400" aria-label="Attach file"><Paperclip className="size-4" /></Button>
            <label htmlFor="support-msg" className="sr-only">Type a message</label>
            <input id="support-msg" type="text" placeholder="Type a message..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <Button size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700 rounded-xl" aria-label="Send message"><Send className="size-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

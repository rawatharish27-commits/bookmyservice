'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Paperclip, ArrowLeft, Clock, MessageSquare } from 'lucide-react'

const messages = [
  { id: 1, from: 'user', text: 'I have not received my refund for booking BK004 yet. It has been 5 days.', time: '10 May, 2:00 PM' },
  { id: 2, from: 'agent', text: 'I understand your concern. Let me check the refund status for you.', time: '10 May, 2:15 PM' },
  { id: 3, from: 'agent', text: 'Your refund of ₹600 has been initiated and will be credited within 2-3 business days.', time: '10 May, 2:20 PM' },
  { id: 4, from: 'user', text: 'Thank you. Can you confirm which payment method it will be credited to?', time: '10 May, 2:25 PM' },
]

export function ClientSupportDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-700 -ml-2"><ArrowLeft className="size-4" /> Back</Button>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50"><MessageSquare className="size-5 text-blue-600" /></div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-slate-900">Refund not received</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400"><Clock className="size-3" />TK-001 • Created 10 May 2025</div>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Open</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {messages.map((m) => (
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
            <Button variant="ghost" size="icon" className="shrink-0 text-slate-400"><Paperclip className="size-4" /></Button>
            <input type="text" placeholder="Type a message..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <Button size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700 rounded-xl"><Send className="size-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

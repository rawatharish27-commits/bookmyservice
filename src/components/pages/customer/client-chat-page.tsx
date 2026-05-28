'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Send, Paperclip, Phone, MoreVertical, CheckCheck, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface ChatMessage {
  id: string
  from: 'provider' | 'user'
  text: string
  time: string
}

interface ChatData {
  providerName: string
  providerInitials: string
  providerService: string
  messages: ChatMessage[]
}

export function ClientChatPage() {
  const { data: chatData, loading, error, refetch } = useApi<ChatData>(async () => {
    const res = await fetch('/api/client/chat')
    if (!res.ok) throw new Error('Failed to load chat')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center" role="status" aria-label="Loading chat">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load chat</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!chatData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-500">No active chat</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Avatar><AvatarFallback className="bg-[#1D63FF] text-white text-sm">{chatData.providerInitials}</AvatarFallback></Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{chatData.providerName}</p>
            <p className="text-xs text-emerald-500">Online &bull; {chatData.providerService}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400" aria-label="Call provider"><Phone className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-400" aria-label="More options"><MoreVertical className="size-5" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {chatData.messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 ${m.from === 'user' ? 'bg-[#1D63FF] text-white rounded-br-md' : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'}`}>
                <p className="text-sm">{m.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${m.from === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  <span className="text-[10px]">{m.time}</span>
                  {m.from === 'user' && <CheckCheck className="size-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-3">
        <div className="mx-auto max-w-2xl flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 text-slate-400" aria-label="Attach file"><Paperclip className="size-5" /></Button>
          <label htmlFor="chat-msg" className="sr-only">Type a message</label>
          <input id="chat-msg" type="text" placeholder="Type a message..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[#1D63FF]/20" />
          <Button size="icon" className="shrink-0 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl" aria-label="Send message"><Send className="size-4" /></Button>
        </div>
      </div>
    </div>
  )
}

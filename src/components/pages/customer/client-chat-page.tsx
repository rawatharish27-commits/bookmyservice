'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Send, Paperclip, Phone, MoreVertical, CheckCheck } from 'lucide-react'

const chatMessages = [
  { id: 1, from: 'provider', text: 'Hi Rahul! I am on my way to your location.', time: '9:45 AM' },
  { id: 2, from: 'user', text: 'Great! How long will it take?', time: '9:46 AM' },
  { id: 3, from: 'provider', text: 'About 15 minutes. I will call you when I am close.', time: '9:47 AM' },
  { id: 4, from: 'user', text: 'Sounds good. The gate code is 1234', time: '9:48 AM' },
  { id: 5, from: 'provider', text: 'Got it, thanks! See you soon 👍', time: '9:49 AM' },
]

export function ClientChatPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Avatar><AvatarFallback className="bg-blue-600 text-white text-sm">AS</AvatarFallback></Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Amit Sharma</p>
            <p className="text-xs text-emerald-500">Online • AC Service</p>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400"><Phone className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical className="size-5" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 ${m.from === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'}`}>
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
          <Button variant="ghost" size="icon" className="shrink-0 text-slate-400"><Paperclip className="size-5" /></Button>
          <input type="text" placeholder="Type a message..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <Button size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700 rounded-xl"><Send className="size-4" /></Button>
        </div>
      </div>
    </div>
  )
}

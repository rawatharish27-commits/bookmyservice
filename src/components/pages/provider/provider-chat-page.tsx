'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, ArrowLeft, User } from 'lucide-react'

const conversations = [
  { id: 1, name: 'Rahul Sharma', lastMessage: 'Thank you for the great service!', time: '5 min ago', unread: 2 },
  { id: 2, name: 'Priya Patel', lastMessage: 'Can you come at 3 PM instead?', time: '1 hour ago', unread: 1 },
  { id: 3, name: 'Amit Verma', lastMessage: 'The plumbing is fixed, thanks!', time: '3 hours ago', unread: 0 },
  { id: 4, name: 'Sonia Mehta', lastMessage: 'Is tomorrow available?', time: '1 day ago', unread: 0 },
]

const messages = [
  { id: 1, sender: 'customer', text: 'Hi, I need AC repair at my place', time: '10:00 AM' },
  { id: 2, sender: 'provider', text: 'Sure! I can come today at 2 PM. Does that work?', time: '10:05 AM' },
  { id: 3, sender: 'customer', text: 'Yes, 2 PM works perfectly', time: '10:10 AM' },
  { id: 4, sender: 'provider', text: 'Great! I will be there. Please share the exact address.', time: '10:12 AM' },
  { id: 5, sender: 'customer', text: '12, MG Road, Near City Mall, Delhi', time: '10:15 AM' },
  { id: 6, sender: 'customer', text: 'Thank you for the great service!', time: '04:30 PM' },
]

export function ProviderChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl flex h-screen">
        {/* Chat List */}
        <div className={`w-full sm:w-80 border-r border-slate-200 bg-white ${selectedChat ? 'hidden sm:block' : ''}`}>
          <div className="p-4 border-b border-slate-100">
            <h1 className="text-lg font-bold text-slate-900">Chats</h1>
            <Input placeholder="Search chats..." className="mt-2 h-8 text-sm" />
          </div>
          <ScrollArea className="flex-1">
            {conversations.map((conv, i) => (
              <div key={conv.id}>
                <button onClick={() => setSelectedChat(conv.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left ${selectedChat === conv.id ? 'bg-blue-50' : ''}`}>
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#1D63FF]/10 text-sm font-bold text-[#1D63FF]">{conv.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">{conv.name}</p>
                      <span className="text-[10px] text-slate-400">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && <span className="flex size-4 items-center justify-center rounded-full bg-[#1D63FF] text-[10px] text-white">{conv.unread}</span>}
                    </div>
                  </div>
                </button>
                {i < conversations.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat View */}
        {selectedChat && (
          <div className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden sm:flex' : ''}`}>
            <div className="flex items-center gap-3 p-4 border-b border-slate-200">
              <button onClick={() => setSelectedChat(null)} className="sm:hidden"><ArrowLeft className="size-5 text-slate-500" /></button>
              <div className="flex size-8 items-center justify-center rounded-full bg-[#1D63FF]/10 text-sm font-bold text-[#1D63FF]">R</div>
              <div><p className="text-sm font-medium text-slate-900">Rahul Sharma</p><p className="text-xs text-emerald-500">Online</p></div>
            </div>
            <ScrollArea className="flex-1 p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'provider' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 ${msg.sender === 'provider' ? 'bg-[#1D63FF] text-white' : 'bg-slate-100 text-slate-800'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'provider' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button className="bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1"><Send className="size-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

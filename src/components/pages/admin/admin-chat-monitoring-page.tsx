'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Eye, Flag, AlertTriangle, Clock } from 'lucide-react'

const activeConversations = [
  { id: 1, customer: 'Rahul Sharma', provider: 'Cool Care Services', topic: 'AC Repair Booking', messages: 8, lastMessage: '5 min ago', flagged: false },
  { id: 2, customer: 'Priya Patel', provider: 'QuickFix Solutions', topic: 'Cleaning Service', messages: 12, lastMessage: '15 min ago', flagged: false },
  { id: 3, customer: 'Amit Verma', provider: 'HomePro Services', topic: 'Plumbing Issue', messages: 5, lastMessage: '1 hour ago', flagged: true },
  { id: 4, customer: 'Sonia Mehta', provider: 'SparkClean Pro', topic: 'Electrical Repair', messages: 3, lastMessage: '2 hours ago', flagged: false },
]

const flaggedMessages = [
  { id: 1, from: 'HomePro Services', message: 'Let us settle this outside the platform for a discount...', reason: 'Off-platform transaction', date: '1 hour ago' },
]

export function AdminChatMonitoringPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Chat Monitoring</h1>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{activeConversations.length} Active</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><MessageSquare className="size-5 text-blue-600 mx-auto mb-1" /><p className="text-lg font-bold text-blue-600">{activeConversations.length}</p><p className="text-xs text-slate-500">Active Chats</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><AlertTriangle className="size-5 text-amber-600 mx-auto mb-1" /><p className="text-lg font-bold text-amber-600">{flaggedMessages.length}</p><p className="text-xs text-slate-500">Flagged</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Clock className="size-5 text-purple-600 mx-auto mb-1" /><p className="text-lg font-bold text-purple-600">156</p><p className="text-xs text-slate-500">Total Today</p></CardContent></Card>
        </div>

        {flaggedMessages.length > 0 && (
          <Card className="bg-red-50 border-red-200 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><Flag className="size-4 text-red-600" /><CardTitle className="text-sm font-semibold text-red-800">Flagged Messages</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-0">
              {flaggedMessages.map((msg) => (
                <div key={msg.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-red-900">From: {msg.from}</p><p className="text-xs text-red-700">{msg.message}</p><p className="text-xs text-red-600 mt-1">Reason: {msg.reason}</p></div>
                    <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 text-xs rounded-lg">Review</Button><Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 rounded-lg">Block</Button></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Active Conversations</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {activeConversations.map((conv, i) => (
              <div key={conv.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50"><MessageSquare className="size-5 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{conv.topic}</p>
                      {conv.flagged && <Flag className="size-3 text-red-500" />}
                    </div>
                    <p className="text-xs text-slate-400">{conv.customer} ↔ {conv.provider} • {conv.messages} msgs</p>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">{conv.lastMessage}</span>
                  <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                </div>
                {i < activeConversations.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

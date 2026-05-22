'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Calendar, CreditCard, Tag, CheckCheck, Circle } from 'lucide-react'

const notifications = [
  { id: 1, type: 'booking', icon: Calendar, title: 'Booking Confirmed', desc: 'Your AC service booking is confirmed for 15 May', time: '2h ago', read: false, color: 'text-blue-600 bg-blue-50' },
  { id: 2, type: 'payment', icon: CreditCard, title: 'Payment Received', desc: '₹600 has been refunded to your wallet', time: '5h ago', read: false, color: 'text-emerald-600 bg-emerald-50' },
  { id: 3, type: 'promo', icon: Tag, title: 'Special Offer!', desc: 'Get 25% off on all cleaning services this weekend', time: '1d ago', read: false, color: 'text-purple-600 bg-purple-50' },
  { id: 4, type: 'booking', icon: Calendar, title: 'Service Completed', desc: 'Your plumbing repair has been marked as completed', time: '2d ago', read: true, color: 'text-blue-600 bg-blue-50' },
  { id: 5, type: 'payment', icon: CreditCard, title: 'Wallet Top-up', desc: '₹500 added to your wallet via UPI', time: '3d ago', read: true, color: 'text-emerald-600 bg-emerald-50' },
  { id: 6, type: 'promo', icon: Tag, title: 'Refer & Earn', desc: 'Earn ₹100 for every friend you refer!', time: '5d ago', read: true, color: 'text-purple-600 bg-purple-50' },
]

export function ClientNotificationsPage() {
  const [items, setItems] = useState(notifications)

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })))

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={markAllRead}><CheckCheck className="size-4" /> Mark all read</Button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['All', 'Booking', 'Payment', 'Promo'].map((f) => (
            <Button key={f} variant="outline" className="rounded-xl border-slate-200 text-xs whitespace-nowrap">{f}</Button>
          ))}
        </div>

        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={`bg-white rounded-xl transition-shadow hover:shadow-sm cursor-pointer ${!n.read ? 'border-blue-100' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                    <n.icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                      {!n.read && <Circle className="size-2 fill-blue-500 text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

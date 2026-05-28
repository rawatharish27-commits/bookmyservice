'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bell, Calendar, CreditCard, Tag, CheckCheck, Circle, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface Notification {
  id: string
  type: string
  icon: 'Calendar' | 'CreditCard' | 'Tag'
  title: string
  desc: string
  time: string
  read: boolean
  color: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Calendar, CreditCard, Tag }

export function ClientNotificationsPage() {
  const { navigate } = useApp()
  const { data: notifications, loading, error, refetch } = useApi<Notification[]>(async () => {
    const res = await fetch('/api/client/notifications')
    if (!res.ok) throw new Error('Failed to load notifications')
    return res.json()
  })
  const [items, setItems] = useState<Notification[] | null>(null)

  const displayItems = items ?? notifications ?? []
  const markAllRead = () => { if (notifications) setItems(notifications.map((n) => ({ ...n, read: true }))) }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading notifications">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load notifications</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <Button variant="ghost" size="sm" className="gap-1 text-[#1D63FF]" onClick={markAllRead} aria-label="Mark all notifications as read"><CheckCheck className="size-4" /> Mark all read</Button>
        </div>

        <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter notifications">
          {['All', 'Booking', 'Payment', 'Promo'].map((f) => (
            <Button key={f} variant="outline" className="rounded-xl border-slate-200 text-xs whitespace-nowrap">{f}</Button>
          ))}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((n) => {
              const Icon = iconMap[n.icon] ?? Bell
              return (
                <Card key={n.id} className={`bg-white rounded-xl transition-shadow hover:shadow-sm cursor-pointer ${!n.read ? 'border-[#1D63FF]/10' : ''}`} onClick={() => navigate('client-notification-detail', { id: n.id })}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                        <Icon className="size-4" />
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

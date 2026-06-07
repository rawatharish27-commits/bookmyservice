'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bell, Calendar, IndianRupee, Settings, ChevronRight, Check } from 'lucide-react'

const notifications = [
  { id: 1, title: 'New Booking Request', message: 'Rahul Sharma requested Air Conditioner on 22 May', type: 'booking', time: '5 min ago', read: false },
  { id: 2, title: 'Payment Received', message: '₹2,125 credited for booking #1023', type: 'payment', time: '1 hour ago', read: false },
  { id: 3, title: 'Review Received', message: 'Priya Patel left a 5-star review', type: 'system', time: '3 hours ago', read: true },
  { id: 4, title: 'Booking Cancelled', message: 'Booking #1021 was cancelled by customer', type: 'booking', time: '5 hours ago', read: true },
  { id: 5, title: 'Payout Processed', message: '₹8,500 has been transferred to your bank account', type: 'payment', time: '1 day ago', read: true },
  { id: 6, title: 'System Update', message: 'New feature: You can now set custom time slots', type: 'system', time: '2 days ago', read: true },
]

const typeIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string }> = {
  booking: { icon: Calendar, bg: 'bg-[#FFD54F]/10' },
  payment: { icon: IndianRupee, bg: 'bg-emerald-100' },
  system: { icon: Settings, bg: 'bg-purple-100' },
}

export function ProviderNotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Check className="size-4" /> Mark All Read</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="space-y-0">
            {notifications.map((notif, i) => {
              const config = typeIcons[notif.type]
              const Icon = config.icon
              return (
                <div key={notif.id}>
                  <div className={`flex items-center gap-4 py-4 px-1 ${!notif.read ? 'bg-[#FFD54F]/10/50 -mx-1 px-2 rounded-lg' : ''}`}>
                    <div className={`flex size-10 items-center justify-center rounded-lg ${config.bg} shrink-0`}>
                      <Icon className="size-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        {!notif.read && <span className="size-2 rounded-full bg-[#0A1F44]" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 shrink-0" />
                  </div>
                  {i < notifications.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

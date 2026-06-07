'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Bell, ExternalLink, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface NotificationDetail {
  type: string
  title: string
  body: string
  bookingId: string
  service: string
  date: string
  amount: string
  receivedAt: string
}

export function ClientNotificationDetailPage() {
  const { goBack, navigate } = useApp()
  const { data: notification, loading, error, refetch } = useApi<NotificationDetail>(async () => {
    const res = await fetch('/api/client/notifications/detail')
    if (!res.ok) throw new Error('Failed to load notification')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading notification">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load notification</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">Notification not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-700 -ml-2" onClick={goBack} aria-label="Go back"><ArrowLeft className="size-4" /> Back</Button>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                <Calendar className="size-6 text-[#0A1F44]" />
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10">{notification.type}</Badge>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{notification.title}</h2>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">{notification.body}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">Booking ID</span><span className="font-medium text-slate-900">{notification.bookingId}</span>
                <span className="text-slate-500">Service</span><span className="font-medium text-slate-900">{notification.service}</span>
                <span className="text-slate-500">Date</span><span className="font-medium text-slate-900">{notification.date}</span>
                <span className="text-slate-500">Amount</span><span className="font-medium text-slate-900">{notification.amount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bell className="size-3" />
              <span>Received {notification.receivedAt}</span>
            </div>

            <Button className="w-full gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl" onClick={() => navigate('client-booking-detail', { id: notification.bookingId })} aria-label="View booking details"><ExternalLink className="size-4" /> View Booking</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

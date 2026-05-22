'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Bell, ExternalLink } from 'lucide-react'

export function ClientNotificationDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-700 -ml-2"><ArrowLeft className="size-4" /> Back</Button>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50">
                <Calendar className="size-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Booking</Badge>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Booking Confirmed</h2>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">
                Your AC Service & Repair booking has been confirmed! Our technician Amit Sharma will arrive at your location on 15 May 2025 between 10:00 AM - 11:00 AM.
              </p>
              <p className="text-sm text-slate-600">
                Please ensure someone is available at the address: 42, Rajouri Garden, New Delhi - 110027.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">Booking ID</span><span className="font-medium text-slate-900">BK001</span>
                <span className="text-slate-500">Service</span><span className="font-medium text-slate-900">AC Service</span>
                <span className="text-slate-500">Date</span><span className="font-medium text-slate-900">15 May 2025</span>
                <span className="text-slate-500">Amount</span><span className="font-medium text-slate-900">₹1,200</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bell className="size-3" />
              <span>Received 2 hours ago</span>
            </div>

            <Button className="w-full gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><ExternalLink className="size-4" /> View Booking</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

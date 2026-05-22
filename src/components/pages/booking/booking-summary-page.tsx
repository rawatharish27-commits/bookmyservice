'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Calendar, Clock, User, Tag, Zap, Shield } from 'lucide-react'

export function BookingSummaryPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Booking Summary</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50"><Zap className="size-6 text-blue-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">AC Service & Repair</h3>
                <p className="text-xs text-slate-400">Complete diagnostic and repair</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-600"><User className="size-4 text-slate-400" /> Provider: <strong className="text-slate-900">Amit Sharma</strong></div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="size-4 text-slate-400" /> Date: <strong className="text-slate-900">20 May 2025</strong></div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="size-4 text-slate-400" /> Time: <strong className="text-slate-900">10:00 AM - 11:00 AM</strong></div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-4 text-slate-400" /> Address: <strong className="text-slate-900">42, Rajouri Garden, Delhi</strong></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Price Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Service Charge</span><span className="text-slate-900">₹1,000</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Convenience Fee</span><span className="text-slate-900">₹50</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">GST (18%)</span><span className="text-slate-900">₹189</span></div>
            <Separator />
            <div className="flex items-center gap-2 text-sm"><Tag className="size-3.5 text-emerald-500" /><span className="text-emerald-600">SAVE20 Applied</span><span className="text-emerald-600 ml-auto">-₹200</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span className="text-slate-900">Total</span><span className="text-blue-600">₹1,039</span></div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">100% Safe & Secure</p>
              <p className="text-xs text-slate-500">Your payment is protected by escrow</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

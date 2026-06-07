'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Calendar, Clock, User, Tag, Zap, Shield } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useApi } from '@/lib/use-api'
import { Loader2 } from 'lucide-react'

// Booking summary data derived from booking context
// In production, this would come from /api/bookings/[id] after booking creation
interface SummaryData {
  service: { name: string; desc: string };
  provider: { name: string };
  date: string; time: string; address: string;
  pricing: { serviceCharge: number; convenienceFee: number; gst: number; discount: number; total: number };
}

const staticSummaryData: SummaryData = {
  service: { name: 'Home Service', desc: 'Complete diagnostic and repair' },
  provider: { name: 'Expert Professional' },
  date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  time: '10:00 AM - 11:00 AM',
  address: '42, Rajouri Garden, Delhi',
  pricing: { serviceCharge: 299, convenienceFee: 50, gst: 0, discount: 50, total: 299 },
}

export function BookingSummaryPage() {
  const { navigate } = useApp()

  const { data, loading } = useApi(() => Promise.resolve(staticSummaryData), [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading booking summary">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Booking Summary</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFD54F]/10"><Zap className="size-6 text-[#0A1F44]" /></div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{data.service.name}</h3>
                <p className="text-xs text-slate-400">{data.service.desc}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-600"><User className="size-4 text-slate-400" /> Provider: <strong className="text-slate-900">{data.provider.name}</strong></div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="size-4 text-slate-400" /> Date: <strong className="text-slate-900">{data.date}</strong></div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="size-4 text-slate-400" /> Time: <strong className="text-slate-900">{data.time}</strong></div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-4 text-slate-400" /> Address: <strong className="text-slate-900">{data.address}</strong></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Price Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Service Charge</span><span className="text-slate-900">₹{data.pricing.serviceCharge}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Convenience Fee</span><span className="text-slate-900">₹{data.pricing.convenienceFee}</span></div>
            <Separator />
            <div className="flex items-center gap-2 text-sm"><Tag className="size-3.5 text-emerald-500" /><span className="text-emerald-600">FIRST50 Applied</span><span className="text-emerald-600 ml-auto">-₹{data.pricing.discount}</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span className="text-slate-900">Total</span><span className="text-[#0A1F44]">₹{data.pricing.total}</span></div>
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

        <Button className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white gap-1 rounded-xl py-5" onClick={() => navigate('booking-payment')}>Proceed to Payment</Button>
      </div>
    </div>
  )
}

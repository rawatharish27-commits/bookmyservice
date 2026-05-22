'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Download, MapPin, Share2, Zap, ArrowRight } from 'lucide-react'

export function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="bg-white rounded-xl text-center">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="text-sm text-slate-500">Your booking has been confirmed</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-sm px-4 py-1">
              Booking ID: BK001
            </Badge>

            <Separator />

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50"><Zap className="size-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AC Service & Repair</p>
                  <p className="text-xs text-slate-400">20 May 2025 • 10:00 AM</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Amount Paid</span><span className="font-bold text-slate-900">₹1,039</span></div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Payment Method</span><span className="text-slate-700">Wallet</span></div>
            </div>

            <div className="space-y-2 pt-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl"><MapPin className="size-4" /> Track Booking</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-1 border-slate-200 rounded-xl"><Download className="size-4" /> Receipt</Button>
                <Button variant="outline" className="gap-1 border-slate-200 rounded-xl"><Share2 className="size-4" /> Share</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

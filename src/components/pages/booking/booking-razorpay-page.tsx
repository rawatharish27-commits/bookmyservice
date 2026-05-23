'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Shield, Loader2, CheckCircle2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'

export function BookingRazorpayPage() {
  const [status, setStatus] = useState<'processing' | 'success'>('processing')
  const { navigate } = useApp()

  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-xl">
        <CardContent className="p-8 text-center space-y-4">
          {status === 'processing' ? (
            <>
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-blue-50">
                <Loader2 className="size-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Processing Payment</h2>
              <p className="text-sm text-slate-500">Please wait while we process your payment of ₹299</p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="size-3.5" /> Secured by Razorpay
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="flex items-center gap-2"><CreditCard className="size-4 text-slate-400" /><span className="text-slate-600">UPI Payment</span></div>
                  <span className="font-semibold text-slate-900">₹299</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="size-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600">Payment Successful!</h2>
              <p className="text-sm text-slate-500">Your payment has been processed successfully</p>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Transaction ID: TXN20250520</Badge>
              <div className="pt-2">
                <button className="text-blue-600 font-semibold hover:underline" onClick={() => navigate('payment-success')}>
                  View Booking Details
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { XCircle, RefreshCw, ArrowLeft, AlertCircle, CreditCard } from 'lucide-react'

export function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="bg-white rounded-xl text-center">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-50">
              <XCircle className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Failed</h2>
            <p className="text-sm text-slate-500">Your payment could not be processed</p>

            <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-700">Transaction Declined</p>
                <p className="text-xs text-red-600">Insufficient balance or bank declined. Please try a different payment method.</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-left text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-900">₹1,039</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Transaction ID</span><span className="text-slate-700">TXN20250520</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="text-slate-700">Card •••• 4242</span></div>
            </div>

            <div className="space-y-2 pt-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl"><RefreshCw className="size-4" /> Retry Payment</Button>
              <Button variant="outline" className="w-full gap-1 border-slate-200 rounded-xl"><CreditCard className="size-4" /> Try Different Method</Button>
              <Button variant="ghost" className="w-full gap-1 text-slate-500"><ArrowLeft className="size-4" /> Back to Checkout</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

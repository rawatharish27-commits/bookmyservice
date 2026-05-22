'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { XCircle, AlertCircle, ArrowDownLeft, Clock } from 'lucide-react'
import { useApp } from '@/lib/app-context'

const reasons = [
  'Schedule conflict',
  'Found a better price',
  'Changed my mind',
  'Service no longer needed',
  'Provider unavailable',
  'Other reason',
]

export function BookingCancellationPage() {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const { navigate } = useApp()

  const handleCancel = () => {
    if (!selected) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('client-dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Cancel Booking</h1>

        <Card className="bg-amber-50 border-amber-100 rounded-xl">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Cancellation Policy</p>
              <p className="text-xs text-amber-700 mt-0.5">Free cancellation up to 2 hours before the service. A cancellation fee of ₹50 may apply after that.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Select Cancellation Reason</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {reasons.map((reason) => (
              <button key={reason} onClick={() => setSelected(reason)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${selected === reason ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <div className={`size-4 rounded-full border-2 ${selected === reason ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                  {selected === reason && <div className="m-auto mt-0.5 size-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-slate-700">{reason}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Booking Amount</span><span className="text-slate-900">₹299</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Cancellation Fee</span><span className="text-amber-600">-₹0</span></div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Refund Amount</span>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-600">₹299</span>
                <div className="flex items-center gap-1 text-xs text-slate-400"><ArrowDownLeft className="size-3" />Refunded to Wallet</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400"><Clock className="size-3" />Refund processed within 24 hours</div>
          </CardContent>
        </Card>

        <Button className="w-full bg-red-600 hover:bg-red-700 gap-1 rounded-xl py-5" disabled={!selected || loading} onClick={handleCancel}>
          <XCircle className="size-4" /> {loading ? 'Cancelling...' : 'Confirm Cancellation'}
        </Button>
      </div>
    </div>
  )
}

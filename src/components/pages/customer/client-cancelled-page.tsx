'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { XCircle, Calendar, Clock, RotateCcw, ArrowDownLeft, AlertCircle, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface CancelledBooking {
  id: string
  service: string
  date: string
  time: string
  amount: string
  reason: string
  refund: string
  refundStatus: string
  refundDate: string
}

const refundColors: Record<string, string> = {
  Refunded: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Processing: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Pending: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100',
}

export function ClientCancelledPage() {
  const { navigate } = useApp()
  const { data: cancelled, loading, error, refetch } = useApi<CancelledBooking[]>(async () => {
    const res = await fetch('/api/client/bookings/cancelled')
    if (!res.ok) throw new Error('Failed to load cancelled bookings')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading cancelled bookings">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load cancelled bookings</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Cancelled Bookings</h1>

        {!cancelled || cancelled.length === 0 ? (
          <div className="text-center py-12">
            <XCircle className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No cancelled bookings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cancelled.map((b) => (
              <Card key={b.id} className="bg-white rounded-xl">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">{b.service}</h3>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><XCircle className="size-3 mr-1" />Cancelled</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><Calendar className="size-3.5" />{b.date}</div>
                    <div className="flex items-center gap-1.5"><Clock className="size-3.5" />{b.time}</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5">
                    <AlertCircle className="size-4 text-red-500 shrink-0" />
                    <span className="text-sm text-red-700">Reason: {b.reason}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm"><ArrowDownLeft className="size-3.5 text-emerald-500" /><span className="text-slate-600">Refund: <strong className="text-slate-900">{b.refund}</strong></span></div>
                      <p className="text-xs text-slate-400 ml-5">Refunded on: {b.refundDate}</p>
                    </div>
                    <Badge variant="secondary" className={refundColors[b.refundStatus] ?? refundColors.Pending}>{b.refundStatus}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => navigate('client-rebook', { id: b.id })} aria-label={`Rebook ${b.service}`}><RotateCcw className="size-3.5" /> Rebook Service</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

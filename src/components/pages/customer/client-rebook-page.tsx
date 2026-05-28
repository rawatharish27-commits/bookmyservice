'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, RotateCcw, User, MapPin, Zap, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface RebookData {
  service: string
  providerName: string
  address: string
  previousDate: string
}

export function ClientRebookPage() {
  const { goBack } = useApp()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { data: rebookInfo, loading, error, refetch } = useApi<RebookData>(async () => {
    const res = await fetch('/api/client/bookings/rebook')
    if (!res.ok) throw new Error('Failed to load rebook data')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading rebook data">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load rebook data</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/client/bookings/rebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time }),
      })
      if (!res.ok) throw new Error('Failed to rebook')
      goBack()
    } catch {
      // Error handled by UI
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Quick Rebook</h1>

        {rebookInfo && (
          <Card className="bg-blue-50 border-[#1D63FF]/10 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#1D63FF]/10">
                  <Zap className="size-6 text-[#1D63FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{rebookInfo.service}</h3>
                  <p className="text-xs text-slate-500">Previously booked on {rebookInfo.previousDate}</p>
                </div>
                <Badge variant="secondary" className="ml-auto bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200 hover:bg-[#1D63FF]/10">Rebook</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {rebookInfo && (
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Previous Details (Pre-filled)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600"><User className="size-4 text-slate-400" /> Provider: {rebookInfo.providerName}</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-4 text-slate-400" /> Address: {rebookInfo.address}</div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <label htmlFor="rebook-date" className="mb-1.5 text-sm font-medium text-slate-700">Preferred Date</label>
                  <Input id="rebook-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-slate-200" />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-slate-700">Preferred Time</label>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select preferred time">
                    {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((t) => (
                      <Button key={t} variant={time === t ? 'default' : 'outline'} onClick={() => setTime(t)}
                        className={`rounded-lg text-xs ${time === t ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : 'border-slate-200'}`}
                        aria-pressed={time === t}>{t}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl border-slate-200" onClick={goBack}>Cancel</Button>
          <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] gap-1 rounded-xl" onClick={handleConfirm} disabled={submitting || !date || !time} aria-label="Confirm rebook">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Confirm Rebook
          </Button>
        </div>
      </div>
    </div>
  )
}

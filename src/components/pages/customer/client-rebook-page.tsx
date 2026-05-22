'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, RotateCcw, User, MapPin, Zap } from 'lucide-react'

export function ClientRebookPage() {
  const [date, setDate] = useState('2025-05-20')
  const [time, setTime] = useState('10:00 AM')

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Quick Rebook</h1>

        <Card className="bg-blue-50 border-blue-100 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100">
                <Zap className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">AC Service & Repair</h3>
                <p className="text-xs text-slate-500">Previously booked on 12 May 2025</p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Rebook</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Previous Details (Pre-filled)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600"><User className="size-4 text-slate-400" /> Provider: Amit Sharma</div>
            <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-4 text-slate-400" /> Address: Rajouri Garden, Delhi</div>
            <Separator />
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 text-sm font-medium text-slate-700">Preferred Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-slate-200" />
              </div>
              <div>
                <label className="mb-1.5 text-sm font-medium text-slate-700">Preferred Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((t) => (
                    <Button key={t} variant={time === t ? 'default' : 'outline'} onClick={() => setTime(t)}
                      className={`rounded-lg text-xs ${time === t ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200'}`}>{t}</Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl border-slate-200">Cancel</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl"><RotateCcw className="size-4" /> Confirm Rebook</Button>
        </div>
      </div>
    </div>
  )
}

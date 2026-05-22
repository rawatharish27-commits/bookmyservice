'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, MapPin, Share2, Phone, MessageSquare, Calendar, Clock, Zap } from 'lucide-react'

export function BookingConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center py-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 mb-3">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-sm text-slate-500 mt-1">Your service has been scheduled</p>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50"><Zap className="size-6 text-blue-600" /></div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">AC Service & Repair</h3>
                <p className="text-xs text-slate-400">Booking ID: BK001</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Confirmed</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><Calendar className="size-4 text-slate-400" /><span className="text-slate-600">20 May 2025</span></div>
              <div className="flex items-center gap-2"><Clock className="size-4 text-slate-400" /><span className="text-slate-600">10:00 AM</span></div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" /><span className="text-slate-600">Rajouri Garden</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-slate-900 mb-3">Your Provider</p>
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-blue-600 text-white text-sm">AS</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Amit Sharma</p>
                <p className="text-xs text-slate-400">4.9 ★ • 500+ services</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-lg"><Phone className="size-3.5" /> Call</Button>
              <Button variant="outline" size="sm" className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"><MessageSquare className="size-3.5" /> Chat</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl"><MapPin className="size-4" /> Track Booking</Button>
          <Button variant="outline" className="flex-1 gap-1 border-slate-200 rounded-xl"><Share2 className="size-4" /> Share Details</Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, MessageSquare, Share2, Star, MapPin, Clock, Zap, Shield } from 'lucide-react'

export function TechnicianContactPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Technician Details</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 text-center">
            <Avatar className="size-24 mx-auto mb-4">
              <AvatarFallback className="bg-[#0A1F44] text-white text-2xl">AS</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-slate-900">Amit Sharma</h2>
            <p className="text-sm text-slate-500">AC Technician</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-4 ${i < 5 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              ))}
              <span className="text-sm text-slate-600 ml-1">4.9</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">500+ services completed</p>
            <div className="flex justify-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><Shield className="size-3 mr-1" />Verified</Badge>
              <Badge variant="secondary" className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10">Top Rated</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="size-4 text-[#0A1F44]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Current Service</p>
                <p className="text-xs text-slate-400">Air Conditioner • BK001</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Current Location</p>
                <p className="text-xs text-slate-400">Rajouri Garden, Delhi • 2.5 km away</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">ETA</p>
                <p className="text-xs text-slate-400">~12 minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Button className="flex-col h-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4">
            <Phone className="size-5" />
            <span className="text-xs">Call</span>
          </Button>
          <Button className="flex-col h-auto gap-2 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl py-4">
            <MessageSquare className="size-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto gap-2 rounded-xl py-4 border-slate-200">
            <Share2 className="size-5 text-slate-600" />
            <span className="text-xs text-slate-600">Share</span>
          </Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-slate-900 mb-3">Rate this technician</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="transition-transform hover:scale-110" aria-label={`Rate ${star} stars`}>
                  <Star className={`size-8 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

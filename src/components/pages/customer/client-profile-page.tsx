'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Mail, Phone, MapPin, Calendar, Star, Wallet, Shield } from 'lucide-react'

export function ClientProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-20">
                <AvatarFallback className="bg-blue-600 text-white text-xl">RK</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">Rahul Kumar</h2>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Verified</Badge>
                </div>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Mail className="size-3.5" /> rahul.kumar@email.com</div>
                  <div className="flex items-center gap-2"><Phone className="size-3.5" /> +91 98765 43210</div>
                  <div className="flex items-center gap-2"><MapPin className="size-3.5" /> Delhi, India</div>
                  <div className="flex items-center gap-2"><Calendar className="size-3.5" /> Member since Jan 2024</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200">
                <Edit className="size-3.5" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Calendar, label: 'Total Bookings', value: '24', color: 'text-blue-600 bg-blue-50' },
            { icon: Star, label: 'Avg Rating', value: '4.8', color: 'text-amber-600 bg-amber-50' },
            { icon: Wallet, label: 'Wallet Balance', value: '₹1,250', color: 'text-emerald-600 bg-emerald-50' },
            { icon: Shield, label: 'Active AMC', value: '1', color: 'text-purple-600 bg-purple-50' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white rounded-xl">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="size-5" />
                </div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            <Separator />
            {['Booked AC Service - 2 days ago', 'Left review for Plumber - 5 days ago', 'Added ₹500 to wallet - 1 week ago'].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-600">{activity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

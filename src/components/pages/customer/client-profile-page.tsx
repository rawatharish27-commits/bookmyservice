'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Mail, Phone, MapPin, Calendar, Star, Wallet, Shield, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface ProfileData {
  name: string
  initials: string
  email: string
  phone: string
  location: string
  memberSince: string
  verified: boolean
  stats: {
    totalBookings: number
    avgRating: number
    walletBalance: number
    activeAmc: number
  }
  recentActivity: string[]
}

export function ClientProfilePage() {
  const { navigate } = useApp()
  const { data: profile, loading, error, refetch } = useApi<ProfileData>(async () => {
    const res = await fetch('/api/client/profile')
    if (!res.ok) throw new Error('Failed to load profile')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading profile">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
        <span className="sr-only">Loading profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load profile</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">No profile data found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-20">
                <AvatarFallback className="bg-blue-600 text-white text-xl">{profile.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  {profile.verified && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Verified</Badge>}
                </div>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Mail className="size-3.5" /> {profile.email}</div>
                  <div className="flex items-center gap-2"><Phone className="size-3.5" /> {profile.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="size-3.5" /> {profile.location}</div>
                  <div className="flex items-center gap-2"><Calendar className="size-3.5" /> Member since {profile.memberSince}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1 border-slate-200" onClick={() => navigate('client-edit-profile')} aria-label="Edit profile">
                <Edit className="size-3.5" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Calendar, label: 'Total Bookings', value: String(profile.stats.totalBookings), color: 'text-blue-600 bg-blue-50' },
            { icon: Star, label: 'Avg Rating', value: String(profile.stats.avgRating), color: 'text-amber-600 bg-amber-50' },
            { icon: Wallet, label: 'Wallet Balance', value: `₹${profile.stats.walletBalance.toLocaleString()}`, color: 'text-emerald-600 bg-emerald-50' },
            { icon: Shield, label: 'Active AMC', value: String(profile.stats.activeAmc), color: 'text-purple-600 bg-purple-50' },
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

        {profile.recentActivity.length > 0 && (
          <Card className="bg-white rounded-xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <Separator />
              {profile.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-slate-600">{activity}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

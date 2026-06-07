'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, MapPin, Phone, Mail, Calendar, Star, ShieldCheck, Edit2 } from 'lucide-react'

const profileData = {
  name: 'Arvind Kumar',
  business: 'Cool Care Services',
  email: 'arvind@coolcare.in',
  phone: '+91 98765 43210',
  address: '45, Rajouri Garden, New Delhi, 110027',
  joined: '15 Mar 2023',
  rating: 4.7,
  reviews: 156,
  completedJobs: 432,
}

const verifications = [
  { label: 'PAN Card', status: 'Verified' },
  { label: 'Aadhaar', status: 'Verified' },
  { label: 'Bank Account', status: 'Verified' },
  { label: 'GST', status: 'Pending' },
]

const statusColors: Record<string, string> = {
  Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
}

export function ProviderProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <Button size="sm" className="gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl"><Edit2 className="size-4" /> Edit Profile</Button>
        </div>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A1F44] to-[#0A1F44] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">AK</div>
              <div>
                <h2 className="text-xl font-bold">{profileData.name}</h2>
                <p className="text-[#FFD54F]/80">{profileData.business}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{profileData.rating}</span>
                  <span className="text-blue-200">({profileData.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3"><MapPin className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{profileData.address}</span></div>
            <div className="flex items-center gap-3"><Phone className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{profileData.phone}</span></div>
            <div className="flex items-center gap-3"><Mail className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{profileData.email}</span></div>
            <div className="flex items-center gap-3"><Calendar className="size-4 text-slate-400" /><span className="text-sm text-slate-700">Joined {profileData.joined}</span></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Verification Status</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {verifications.map((v, i) => (
              <div key={v.label}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-700">{v.label}</span>
                  <Badge variant="secondary" className={statusColors[v.status]}>{v.status}</Badge>
                </div>
                {i < verifications.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Quick Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[#FFD54F]/10"><p className="text-2xl font-bold text-[#0A1F44]">{profileData.completedJobs}</p><p className="text-xs text-slate-500">Completed Jobs</p></div>
              <div className="text-center p-3 rounded-lg bg-emerald-50"><p className="text-2xl font-bold text-emerald-600">{profileData.rating}</p><p className="text-xs text-slate-500">Rating</p></div>
              <div className="text-center p-3 rounded-lg bg-amber-50"><p className="text-2xl font-bold text-amber-600">{profileData.reviews}</p><p className="text-xs text-slate-500">Reviews</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

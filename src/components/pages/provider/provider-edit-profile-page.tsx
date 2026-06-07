'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Building2, MapPin, Clock, Camera, Save } from 'lucide-react'

const businessHours = [
  { day: 'Monday', open: '09:00', close: '18:00', active: true },
  { day: 'Tuesday', open: '09:00', close: '18:00', active: true },
  { day: 'Wednesday', open: '09:00', close: '18:00', active: true },
  { day: 'Thursday', open: '09:00', close: '18:00', active: true },
  { day: 'Friday', open: '09:00', close: '18:00', active: true },
  { day: 'Saturday', open: '10:00', close: '16:00', active: true },
  { day: 'Sunday', open: '—', close: '—', active: false },
]

export function ProviderEditProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
          <Button size="sm" className="gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl"><Save className="size-4" /> Save Changes</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-20 rounded-xl bg-[#FFD54F]/10 flex items-center justify-center text-2xl font-bold text-[#0A1F44]">CC</div>
                <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-[#0A1F44] text-white"><Camera className="size-3.5" /></button>
              </div>
              <div className="text-sm text-slate-500">Upload your business logo</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Business Name</label><Input defaultValue="Cool Care Services" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Owner Name</label><Input defaultValue="Arvind Kumar" /></div>
            </div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Description</label><Textarea defaultValue="Professional AC repair, cleaning, and plumbing services with 10+ years of experience in Delhi NCR." rows={3} /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Address</label><Input defaultValue="45, Rajouri Garden, New Delhi, 110027" /></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Clock className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Business Hours</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {businessHours.map((h, i) => (
              <div key={h.day}>
                <div className="flex items-center gap-4 py-3">
                  <span className="text-sm font-medium text-slate-700 w-24">{h.day}</span>
                  {h.active ? (
                    <div className="flex items-center gap-2">
                      <Input className="w-24 h-8 text-sm" defaultValue={h.open} />
                      <span className="text-xs text-slate-400">to</span>
                      <Input className="w-24 h-8 text-sm" defaultValue={h.close} />
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Closed</span>
                  )}
                </div>
                {i < businessHours.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Camera className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Gallery Images</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {['Work Sample 1', 'Work Sample 2', 'Work Sample 3'].map((img) => (
                <div key={img} className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 border-2 border-dashed border-slate-200">{img}</div>
              ))}
              <button className="aspect-square rounded-lg border-2 border-dashed border-[#FFD54F]/30 flex items-center justify-center text-[#FFD54F]/800 hover:bg-[#FFD54F]/10 transition-colors"><Camera className="size-6" /></button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

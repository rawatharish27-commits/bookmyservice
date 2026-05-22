'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Camera, User, Mail, Phone, Save } from 'lucide-react'

export function ClientEditProfilePage() {
  const [form, setForm] = useState({ name: 'Rahul Kumar', email: 'rahul.kumar@email.com', phone: '+91 98765 43210' })

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                <Avatar className="size-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">RK</AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg" aria-label="Upload avatar">
                  <Camera className="size-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">Click to change avatar</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="size-3.5" /> Full Name
                </label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-slate-200" />
              </div>
              <Separator />
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="size-3.5" /> Email Address
                </label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border-slate-200" />
              </div>
              <Separator />
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="size-3.5" /> Phone Number
                </label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border-slate-200" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl">
                <Save className="size-4" /> Save Changes
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl border-slate-200">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

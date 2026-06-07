'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Camera, User, Mail, Phone, Save, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface ProfileData {
  name: string
  email: string
  phone: string
  initials: string
}

export function ClientEditProfilePage() {
  const { goBack } = useApp()
  const { data: profile, loading, error, refetch } = useApi<ProfileData>(async () => {
    const res = await fetch('/api/client/profile')
    if (!res.ok) throw new Error('Failed to load profile')
    return res.json()
  })
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  // Sync form with loaded data
  const isFormEmpty = !form.name && !form.email && !form.phone
  const currentForm = isFormEmpty && profile
    ? { name: profile.name, email: profile.email, phone: profile.phone }
    : form
  if (isFormEmpty && profile && form.name === '') {
    setForm({ name: profile.name, email: profile.email, phone: profile.phone })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading profile">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      goBack()
    } catch {
      // Error handled by UI state
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                <Avatar className="size-24">
                  <AvatarFallback className="bg-[#0A1F44] text-white text-2xl">{profile?.initials ?? 'U'}</AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-[#0A1F44] text-white shadow-lg" aria-label="Upload avatar">
                  <Camera className="size-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">Click to change avatar</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="size-3.5" /> Full Name
                </label>
                <Input id="edit-name" value={currentForm.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-slate-200" />
              </div>
              <Separator />
              <div>
                <label htmlFor="edit-email" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="size-3.5" /> Email Address
                </label>
                <Input id="edit-email" type="email" value={currentForm.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border-slate-200" />
              </div>
              <Separator />
              <div>
                <label htmlFor="edit-phone" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="size-3.5" /> Phone Number
                </label>
                <Input id="edit-phone" type="tel" value={currentForm.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border-slate-200" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white gap-1 rounded-xl" onClick={handleSave} disabled={saving} aria-label="Save changes">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl border-slate-200" onClick={goBack}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

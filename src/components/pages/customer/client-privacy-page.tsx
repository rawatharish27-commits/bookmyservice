'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Shield, Download, Trash2, Eye, Bell, Lock, AlertTriangle, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface PrivacySettings {
  profileVisibility: boolean
  showPhone: boolean
  showEmail: boolean
  bookingHistory: boolean
  marketingEmails: boolean
  dataSharing: boolean
}

interface PrivacyData {
  settings: PrivacySettings
}

export function ClientPrivacyPage() {
  const { data: privacyData, loading, error, refetch } = useApi<PrivacyData>(async () => {
    const res = await fetch('/api/client/privacy')
    if (!res.ok) throw new Error('Failed to load privacy settings')
    return res.json()
  })
  const [settings, setSettings] = useState<PrivacySettings | null>(null)

  const currentSettings = settings ?? privacyData?.settings ?? {
    profileVisibility: true,
    showPhone: false,
    showEmail: false,
    bookingHistory: true,
    marketingEmails: false,
    dataSharing: false,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading privacy settings">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load privacy settings</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  const toggle = (key: keyof PrivacySettings) => {
    const updated = { ...currentSettings, [key]: !currentSettings[key] }
    setSettings(updated)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Privacy Settings</h1>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Eye className="size-4 text-[#1D63FF]" /> Visibility</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'profileVisibility' as const, label: 'Profile Visibility', desc: 'Allow providers to see your profile' },
              { key: 'showPhone' as const, label: 'Show Phone Number', desc: 'Display phone on your profile' },
              { key: 'showEmail' as const, label: 'Show Email Address', desc: 'Display email on your profile' },
              { key: 'bookingHistory' as const, label: 'Booking History', desc: 'Allow viewing past bookings' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-900">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                <button onClick={() => toggle(item.key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentSettings[item.key] ? 'bg-[#1D63FF]' : 'bg-slate-200'}`} role="switch" aria-checked={currentSettings[item.key]} aria-label={`${item.label}: ${currentSettings[item.key] ? 'on' : 'off'}`}>
                  <span className={`inline-block size-4 rounded-full bg-white transition-transform ${currentSettings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Bell className="size-4 text-[#1D63FF]" /> Communications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Receive promotional offers' },
              { key: 'dataSharing' as const, label: 'Data Sharing', desc: 'Share data with partners' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-900">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                <button onClick={() => toggle(item.key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentSettings[item.key] ? 'bg-[#1D63FF]' : 'bg-slate-200'}`} role="switch" aria-checked={currentSettings[item.key]} aria-label={`${item.label}: ${currentSettings[item.key] ? 'on' : 'off'}`}>
                  <span className={`inline-block size-4 rounded-full bg-white transition-transform ${currentSettings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-3">
            <Button variant="outline" className="w-full gap-2 border-slate-200 rounded-xl" aria-label="Download your data"><Download className="size-4" /> Download My Data</Button>
            <Separator />
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="size-4 text-red-500" /><span className="text-sm font-semibold text-red-700">Danger Zone</span></div>
              <p className="text-xs text-red-600 mb-3">This action is irreversible. All your data will be permanently deleted.</p>
              <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-100 rounded-xl" aria-label="Delete account"><Trash2 className="size-4" /> Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

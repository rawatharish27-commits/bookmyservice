'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Settings, Bell, Shield, Save } from 'lucide-react'
import { ChangePasswordDialog } from '@/components/change-password-dialog'

export function ProviderSettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl"><Save className="size-4" /> Save All</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Settings className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Business Settings</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Business Name</label><Input defaultValue="Cool Care Services" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Contact Email</label><Input defaultValue="arvind@coolcare.in" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Phone Number</label><Input defaultValue="+91 98765 43210" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Service Radius</label><Input defaultValue="15 km" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Bell className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Notification Preferences</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { label: 'New booking requests', desc: 'Get notified for every new booking', enabled: true },
              { label: 'Payment alerts', desc: 'Notifications for payments and payouts', enabled: true },
              { label: 'Review notifications', desc: 'When customers leave a review', enabled: true },
              { label: 'Marketing emails', desc: 'Promotional and feature update emails', enabled: false },
              { label: 'SMS notifications', desc: 'Important alerts via SMS', enabled: false },
            ].map((pref, i) => (
              <div key={pref.label}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{pref.label}</p><p className="text-xs text-slate-400">{pref.desc}</p></div>
                  <div className={`size-10 rounded-full flex items-center justify-center cursor-pointer ${pref.enabled ? 'bg-[#1D63FF]' : 'bg-slate-200'}`}>
                    <div className={`size-4 rounded-full bg-white transition-transform ${pref.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                  </div>
                </div>
                {i < 4 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Shield className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Security</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Update your password to keep your account secure.</p>
            <ChangePasswordDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Settings, Globe, Clock, ToggleLeft, ToggleRight, Save } from 'lucide-react'

export function AdminSystemSettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><Save className="size-4" /> Save All</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Settings className="size-4 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-900">General Settings</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Platform Name</label><Input defaultValue="BookMyService" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Support Email</label><Input defaultValue="support@bookmyservice.com" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Support Phone</label><Input defaultValue="+91 1800 123 4567" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Default Language</label><Input defaultValue="English" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Globe className="size-4 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-900">Currency & Region</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Currency</label><Input defaultValue="INR (₹)" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Timezone</label><Input defaultValue="Asia/Kolkata (IST)" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Date Format</label><Input defaultValue="DD/MM/YYYY" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Country</label><Input defaultValue="India" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Clock className="size-4 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-900">Maintenance & System</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { label: 'Maintenance Mode', desc: 'Temporarily disable the platform for maintenance', enabled: false },
              { label: 'Registration Open', desc: 'Allow new user registrations', enabled: true },
              { label: 'Provider Onboarding', desc: 'Allow new provider sign-ups', enabled: true },
              { label: 'Debug Mode', desc: 'Enable detailed error logging', enabled: false },
            ].map((setting, i) => (
              <div key={setting.label}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{setting.label}</p><p className="text-xs text-slate-400">{setting.desc}</p></div>
                  <button className="shrink-0">{setting.enabled ? <ToggleRight className="size-6 text-emerald-500" /> : <ToggleLeft className="size-6 text-slate-300" />}</button>
                </div>
                {i < 3 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

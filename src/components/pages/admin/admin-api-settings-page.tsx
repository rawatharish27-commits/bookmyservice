'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Code, Key, Webhook, Activity, Plus, Copy, Trash2 } from 'lucide-react'

const apiKeys = [
  { id: 1, name: 'Production API Key', key: 'bms_prod_****xxxx', created: '15 Jan 2024', lastUsed: '22 May 2024', status: 'Active' },
  { id: 2, name: 'Staging API Key', key: 'bms_stg_****yyyy', created: '10 Feb 2024', lastUsed: '20 May 2024', status: 'Active' },
  { id: 3, name: 'Old API Key', key: 'bms_old_****zzzz', created: '01 Mar 2023', lastUsed: '01 Jan 2024', status: 'Revoked' },
]

const webhooks = [
  { id: 1, url: 'https://api.example.com/webhooks/booking', events: ['booking.created', 'booking.cancelled'], status: 'Active' },
  { id: 2, url: 'https://api.example.com/webhooks/payment', events: ['payment.success', 'payment.failed'], status: 'Active' },
]

export function AdminApiSettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">API Settings</h1>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Key className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">API Keys</CardTitle></div>
              <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> New Key</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {apiKeys.map((key, i) => (
              <div key={key.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{key.name}</p><Badge variant="secondary" className={key.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>{key.status}</Badge></div>
                    <div className="flex items-center gap-2 mt-1"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{key.key}</code><button><Copy className="size-3 text-slate-400" /></button></div>
                    <p className="text-xs text-slate-400 mt-1">Created: {key.created} • Last used: {key.lastUsed}</p>
                  </div>
                  {key.status === 'Active' && <Button variant="ghost" size="sm" className="h-7 text-red-500"><Trash2 className="size-3" /></Button>}
                </div>
                {i < apiKeys.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Webhook className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Webhooks</CardTitle></div>
              <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Add Webhook</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {webhooks.map((wh, i) => (
              <div key={wh.id}>
                <div className="py-3">
                  <div className="flex items-center gap-2"><code className="text-sm font-mono text-slate-700">{wh.url}</code><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">{wh.status}</Badge></div>
                  <div className="flex gap-1 mt-1">{wh.events.map(e => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}</div>
                </div>
                {i < webhooks.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Activity className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Rate Limits</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Requests per minute</label><Input defaultValue="100" type="number" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Burst limit</label><Input defaultValue="20" type="number" /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

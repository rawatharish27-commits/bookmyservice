'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Smartphone, Plus, Edit2, Eye } from 'lucide-react'

const templates = [
  { id: 1, name: 'OTP Verification', content: 'Your OTP is {{otp}}. Valid for 10 minutes. - BookMyService', chars: 58, trigger: 'Login/Signup' },
  { id: 2, name: 'Booking Confirmed', content: 'Booking #{{booking_id}} confirmed for {{service_name}} on {{date}}. - BMS', chars: 72, trigger: 'Booking Created' },
  { id: 3, name: 'Provider Assigned', content: '{{provider_name}} assigned for your {{service_name}} booking on {{date}}. - BMS', chars: 78, trigger: 'Provider Assigned' },
  { id: 4, name: 'Payment Received', content: 'Payment ₹{{amount}} received for booking #{{booking_id}}. Thank you! - BMS', chars: 72, trigger: 'Payment Success' },
]

export function AdminSmsTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">SMS Templates</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> New Template</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Smartphone className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Templates</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {templates.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50"><Smartphone className="size-4 text-[#1D63FF]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{t.name}</p><Badge variant="secondary" className="bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200 text-[10px]">{t.trigger}</Badge></div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{t.content}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.chars} characters {t.chars > 160 ? '• ⚠️ Exceeds SMS limit' : '• Within SMS limit'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7"><Edit2 className="size-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                  </div>
                </div>
                {i < templates.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Template Editor</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Template Name</label><Input defaultValue="OTP Verification" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">SMS Content</label>
              <Textarea defaultValue="Your OTP is {{otp}}. Valid for 10 minutes. - BookMyService" rows={3} className="font-mono text-sm" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Character count:</span>
                <Badge variant="secondary" className={58 > 160 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>58 / 160</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs rounded-lg"><Eye className="size-3" /> Preview</Button>
                <Button size="sm" className="bg-[#1D63FF] hover:bg-[#0B3D91] text-xs rounded-xl">Save Template</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-[#0B3D91]"><strong>SMS Tips:</strong> Standard SMS allows 160 characters. Unicode characters reduce the limit to 70. Messages exceeding the limit will be split into multiple SMS and may incur extra charges.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

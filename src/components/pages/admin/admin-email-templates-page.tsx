'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Mail, Plus, Eye, Edit2, Copy } from 'lucide-react'

const templates = [
  { id: 1, name: 'Booking Confirmation', subject: 'Your booking #{{booking_id}} is confirmed!', trigger: 'Booking Created', lastEdited: '22 May 2024' },
  { id: 2, name: 'Payment Received', subject: 'Payment of ₹{{amount}} received', trigger: 'Payment Success', lastEdited: '20 May 2024' },
  { id: 3, name: 'Welcome Email', subject: 'Welcome to BookMyService!', trigger: 'User Registration', lastEdited: '15 May 2024' },
  { id: 4, name: 'Password Reset', subject: 'Reset your password', trigger: 'Forgot Password', lastEdited: '10 May 2024' },
  { id: 5, name: 'Provider Onboarding', subject: 'Complete your provider profile', trigger: 'Provider Registration', lastEdited: '05 May 2024' },
]

const variables = ['{{user_name}}', '{{booking_id}}', '{{amount}}', '{{date}}', '{{service_name}}', '{{provider_name}}', '{{customer_name}}', '{{support_email}}']

export function AdminEmailTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl"><Plus className="size-4" /> New Template</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Mail className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Templates</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {templates.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50"><Mail className="size-4 text-[#1D63FF]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400 truncate">{t.subject}</p>
                    <p className="text-[10px] text-slate-400">Trigger: {t.trigger} • Last edited: {t.lastEdited}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7"><Edit2 className="size-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7"><Copy className="size-3" /></Button>
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
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Template Name</label><Input defaultValue="Booking Confirmation" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Subject Line</label><Input defaultValue="Your booking #{{booking_id}} is confirmed!" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Email Body</label>
              <Textarea defaultValue={`Dear {{user_name}},\n\nYour booking #{{booking_id}} for {{service_name}} has been confirmed.\n\nDate: {{date}}\nProvider: {{provider_name}}\nAmount: ₹{{amount}}\n\nThank you for choosing BookMyService!`} rows={8} className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-xs rounded-lg"><Eye className="size-3" /> Preview</Button>
              <Button size="sm" className="bg-[#1D63FF] hover:bg-[#0B3D91] text-white text-xs rounded-xl">Save Template</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Available Variables</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {variables.map((v) => (
                <button key={v} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-600 hover:bg-[#1D63FF]/10 hover:text-[#1D63FF] transition-colors"><Copy className="size-3 inline mr-1" />{v}</button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

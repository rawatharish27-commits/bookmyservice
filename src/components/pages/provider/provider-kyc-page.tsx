'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ShieldCheck, Upload, FileText, Building2, CreditCard } from 'lucide-react'

const kycSections = [
  { id: 1, label: 'PAN Card', icon: FileText, status: 'Verified', doc: 'PAN_ABCDE1234F', date: '20 Mar 2023' },
  { id: 2, label: 'Aadhaar Card', icon: ShieldCheck, status: 'Verified', doc: 'XXXX-XXXX-1234', date: '20 Mar 2023' },
  { id: 3, label: 'Bank Account', icon: CreditCard, status: 'Verified', doc: 'HDFC ****4532', date: '22 Mar 2023' },
  { id: 4, label: 'GST Certificate', icon: Building2, status: 'Pending', doc: 'Not uploaded', date: '—' },
]

const statusColors: Record<string, string> = {
  Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Rejected: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
}

export function ProviderKycPage() {
  const verifiedCount = kycSections.filter(s => s.status === 'Verified').length
  const progress = (verifiedCount / kycSections.length) * 100

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">KYC Verification</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Verification Progress</p>
                <p className="text-xs text-slate-500">{verifiedCount} of {kycSections.length} documents verified</p>
              </div>
              <Badge variant="secondary" className={progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                {progress === 100 ? 'Complete' : 'In Progress'}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Document Status</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {kycSections.map((section, i) => (
              <div key={section.id}>
                <div className="flex items-center gap-4 py-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
                    <section.icon className="size-5 text-[#1D63FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{section.label}</p>
                    <p className="text-xs text-slate-400">{section.doc} • {section.date}</p>
                  </div>
                  <Badge variant="secondary" className={statusColors[section.status]}>{section.status}</Badge>
                  {section.status !== 'Verified' && (
                    <Button size="sm" variant="outline" className="gap-1 rounded-lg text-xs"><Upload className="size-3" /> Upload</Button>
                  )}
                </div>
                {i < kycSections.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200 rounded-xl">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Complete your KYC</p>
                <p className="text-xs text-amber-700 mt-1">Upload your GST certificate to unlock all features including higher payout limits and premium listings.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

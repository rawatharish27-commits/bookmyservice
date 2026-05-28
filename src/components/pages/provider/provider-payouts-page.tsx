'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Building2, Calendar, ArrowUpRight } from 'lucide-react'

const payouts = [
  { id: 'PO-201', date: '20 May 2024', amount: '₹8,500', method: 'HDFC ****4532', status: 'Completed' },
  { id: 'PO-200', date: '13 May 2024', amount: '₹6,200', method: 'HDFC ****4532', status: 'Completed' },
  { id: 'PO-199', date: '06 May 2024', amount: '₹9,100', method: 'HDFC ****4532', status: 'Completed' },
  { id: 'PO-198', date: '29 Apr 2024', amount: '₹7,800', method: 'HDFC ****4532', status: 'Completed' },
]

const bankDetails = { bank: 'HDFC Bank', account: '****4532', ifsc: 'HDFC0001234', holder: 'Arvind Kumar' }

export function ProviderPayoutsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] p-5 text-white">
            <p className="text-sm font-medium text-blue-100">Next Payout</p>
            <p className="text-3xl font-bold mt-1">₹7,650</p>
            <p className="text-xs text-blue-200 mt-1">Scheduled for 27 May 2024</p>
          </div>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] gap-1 rounded-xl"><ArrowUpRight className="size-4" /> Withdraw Now</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Building2 className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Bank Details</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-400">Bank</span><p className="font-medium text-slate-700">{bankDetails.bank}</p></div>
              <div><span className="text-xs text-slate-400">Account</span><p className="font-medium text-slate-700">{bankDetails.account}</p></div>
              <div><span className="text-xs text-slate-400">IFSC</span><p className="font-medium text-slate-700">{bankDetails.ifsc}</p></div>
              <div><span className="text-xs text-slate-400">Holder</span><p className="font-medium text-slate-700">{bankDetails.holder}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Payout History</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {payouts.map((payout, i) => (
              <div key={payout.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 shrink-0"><CreditCard className="size-5 text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{payout.id}</p>
                    <p className="text-xs text-slate-400">{payout.method} • {payout.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">{payout.amount}</p>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">{payout.status}</Badge>
                  </div>
                </div>
                {i < payouts.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

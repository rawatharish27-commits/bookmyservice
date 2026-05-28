'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RotateCcw, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const refunds = [
  { id: 'REF-201', booking: 'BK-1021', customer: 'Neha Gupta', amount: '₹499', reason: 'Service cancelled by customer', status: 'Processed', date: '19 May 2024' },
  { id: 'REF-200', booking: 'BK-1018', customer: 'Vikas Singh', amount: '₹299', reason: 'Service quality issue', status: 'Pending', date: '18 May 2024' },
  { id: 'REF-199', booking: 'BK-1015', customer: 'Ravi Prasad', amount: '₹399', reason: 'Provider no-show', status: 'Pending', date: '15 May 2024' },
  { id: 'REF-198', booking: 'BK-1012', customer: 'Meena Devi', amount: '₹349', reason: 'Wrong service performed', status: 'Approved', date: '12 May 2024' },
  { id: 'REF-197', booking: 'BK-1010', customer: 'Kavita Rao', amount: '₹449', reason: 'Duplicate payment', status: 'Rejected', date: '10 May 2024' },
]

const statusColors: Record<string, string> = {
  Processed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Approved: 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
}

export function AdminRefundsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Refunds</h1>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">{refunds.filter(r => r.status === 'Pending').length} Pending</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search refunds..." className="pl-10 rounded-xl" />
        </div>

        {refunds.map((refund) => (
          <Card key={refund.id} className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 text-[#1D63FF]" />
                  <span className="text-sm font-semibold text-[#1D63FF]">{refund.id}</span>
                  <Badge variant="secondary" className={statusColors[refund.status]}>{refund.status}</Badge>
                </div>
                <span className="text-lg font-bold text-slate-900">{refund.amount}</span>
              </div>
              <p className="text-sm text-slate-700">{refund.customer} • {refund.booking}</p>
              <p className="text-xs text-slate-400 mt-1">Reason: {refund.reason} • {refund.date}</p>
              {refund.status === 'Pending' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs rounded-lg"><CheckCircle className="size-3" /> Approve</Button>
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600 border-red-200 rounded-lg"><XCircle className="size-3" /> Reject</Button>
                </div>
              )}
              {refund.status === 'Approved' && (
                <Button size="sm" className="h-7 bg-[#1D63FF] hover:bg-[#0B3D91] gap-1 text-xs rounded-lg mt-3"><RotateCcw className="size-3" /> Process Refund</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, Download, RotateCcw, CreditCard, Eye } from 'lucide-react'

const payments = [
  { id: 'PAY-501', booking: 'BK-1024', customer: 'Rahul Sharma', amount: '₹499', method: 'UPI', status: 'Successful', date: '22 May 2024' },
  { id: 'PAY-500', booking: 'BK-1023', customer: 'Priya Patel', amount: '₹399', method: 'Card', status: 'Successful', date: '21 May 2024' },
  { id: 'PAY-499', booking: 'BK-1022', customer: 'Amit Verma', amount: '₹349', method: 'Wallet', status: 'Successful', date: '20 May 2024' },
  { id: 'PAY-498', booking: 'BK-1021', customer: 'Neha Gupta', amount: '₹499', method: 'UPI', status: 'Refunded', date: '19 May 2024' },
  { id: 'PAY-497', booking: 'BK-1020', customer: 'Vikas Singh', amount: '₹299', method: 'Card', status: 'Failed', date: '18 May 2024' },
]

const statusColors: Record<string, string> = {
  Successful: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Refunded: 'bg-amber-100 text-amber-700 border-amber-200',
  Failed: 'bg-red-100 text-red-700 border-red-200',
  Pending: 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200',
}

export function AdminPaymentsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-emerald-600">₹12,45,000</p><p className="text-xs text-slate-500">Total Collected</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-amber-600">₹45,000</p><p className="text-xs text-slate-500">Pending</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-red-600">₹12,500</p><p className="text-xs text-slate-500">Refunded</p></CardContent></Card>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input placeholder="Search payments..." className="pl-10 rounded-xl" /></div>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Filter className="size-4" /> Filter</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Action</th>
                </tr></thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-[#1D63FF]">{p.id}</td>
                      <td className="px-4 py-3"><p className="text-sm text-slate-700">{p.customer}</p><p className="text-xs text-slate-400">{p.booking} • {p.date}</p></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><div className="flex items-center gap-1.5"><CreditCard className="size-3.5 text-slate-400" /><span className="text-sm text-slate-700">{p.method}</span></div></td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{p.amount}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={statusColors[p.status]}>{p.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {p.status === 'Successful' && <Button variant="ghost" size="sm" className="h-7 text-amber-600"><RotateCcw className="size-3" /></Button>}
                          <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

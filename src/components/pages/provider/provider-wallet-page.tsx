'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight } from 'lucide-react'

const transactions = [
  { id: 1, desc: 'Air Conditioner - Booking #1024', amount: '+₹424', type: 'credit', date: '22 May 2024' },
  { id: 2, desc: 'Withdrawal to HDFC Bank', amount: '-₹5,000', type: 'debit', date: '21 May 2024' },
  { id: 3, desc: 'Water Tank Cleaning - Booking #1023', amount: '+₹424', type: 'credit', date: '21 May 2024' },
  { id: 4, desc: 'Platform Fee', amount: '-₹150', type: 'debit', date: '21 May 2024' },
  { id: 5, desc: 'Plumber - Booking #1022', amount: '+₹424', type: 'credit', date: '20 May 2024' },
]

export function ProviderWalletPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Wallet className="size-5" /><span className="text-sm font-medium text-blue-100">Balance</span></div>
              <Badge className="bg-white/20 text-white border-0">Active</Badge>
            </div>
            <p className="text-3xl font-bold">₹7,650.00</p>
          </div>
          <div className="bg-white p-4 flex gap-3">
            <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl"><Plus className="size-4" /> Add Money</Button>
            <Button variant="outline" className="flex-1 gap-1 border-slate-200 rounded-xl"><ArrowUpRight className="size-4" /> Withdraw</Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">₹23,400</p><p className="text-xs text-slate-500">Total Earned (May)</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">₹5,000</p><p className="text-xs text-slate-500">Total Withdrawn (May)</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#1D63FF] text-xs">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {transactions.map((txn, i) => (
              <div key={txn.id}>
                <div className="flex items-center gap-3 py-3">
                  <div className={`flex size-9 items-center justify-center rounded-lg ${txn.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {txn.type === 'credit' ? <TrendingUp className="size-4 text-emerald-600" /> : <TrendingDown className="size-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{txn.desc}</p>
                    <p className="text-xs text-slate-400">{txn.date}</p>
                  </div>
                  <span className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>{txn.amount}</span>
                </div>
                {i < transactions.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Search, Filter, Download, Calendar } from 'lucide-react'

const transactions = [
  { id: 1, desc: 'Air Conditioner - BK001', amount: '-₹499', type: 'debit', date: '15 May 2025', method: 'Wallet', status: 'Success' },
  { id: 2, desc: 'Wallet Top-up', amount: '+₹500', type: 'credit', date: '10 May 2025', method: 'UPI', status: 'Success' },
  { id: 3, desc: 'Refund - BK004', amount: '+₹600', type: 'credit', date: '8 May 2025', method: 'Refund', status: 'Success' },
  { id: 4, desc: 'Water Tank Cleaning - BK003', amount: '-₹499', type: 'debit', date: '5 May 2025', method: 'Card', status: 'Success' },
  { id: 5, desc: 'Plumber - BK002', amount: '-₹499', type: 'debit', date: '3 May 2025', method: 'Wallet', status: 'Success' },
  { id: 6, desc: 'Cashback Reward', amount: '+₹50', type: 'credit', date: '1 May 2025', method: 'Reward', status: 'Success' },
]

export function ClientTransactionsPage() {
  const [search, setSearch] = useState('')

  const filtered = transactions.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <Button variant="outline" size="sm" className="gap-1 border-slate-200 rounded-xl"><Download className="size-3.5" /> Export</Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-10 rounded-xl border-slate-200" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200"><Filter className="size-4" /></Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', 'Credits', 'Debits', 'This Month'].map((f) => (
            <Button key={f} variant="outline" className="rounded-xl border-slate-200 text-xs whitespace-nowrap">{f}</Button>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            {filtered.map((txn, i) => (
              <div key={txn.id}>
                <div className="flex items-center gap-3 p-4">
                  <div className={`flex size-9 items-center justify-center rounded-lg ${txn.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {txn.type === 'credit' ? <TrendingUp className="size-4 text-emerald-600" /> : <TrendingDown className="size-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{txn.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="size-3" />{txn.date}<Badge variant="outline" className="text-[10px] px-1 py-0">{txn.method}</Badge>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>{txn.amount}</span>
                </div>
                {i < filtered.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Search, Filter, Calendar } from 'lucide-react'

const allTransactions = [
  { id: 1, desc: 'Added via UPI', amount: '+₹500', type: 'credit', date: '10 May 2025', method: 'UPI' },
  { id: 2, desc: 'AC Service Payment', amount: '-₹1,200', type: 'debit', date: '12 May 2025', method: 'Wallet' },
  { id: 3, desc: 'Refund - Cancelled', amount: '+₹600', type: 'credit', date: '8 May 2025', method: 'Refund' },
  { id: 4, desc: 'Cleaning Service', amount: '-₹2,500', type: 'debit', date: '5 May 2025', method: 'Wallet' },
  { id: 5, desc: 'Added via Card', amount: '+₹1,000', type: 'credit', date: '1 May 2025', method: 'Card' },
  { id: 6, desc: 'Carpenter Visit', amount: '-₹1,500', type: 'debit', date: '28 Apr 2025', method: 'Wallet' },
  { id: 7, desc: 'Cashback Reward', amount: '+₹50', type: 'credit', date: '25 Apr 2025', method: 'Reward' },
]

export function ClientWalletTransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')

  const filtered = allTransactions.filter((t) => filter === 'all' || t.type === filter)

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search transactions..." className="pl-10 rounded-xl border-slate-200" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200"><Filter className="size-4" /></Button>
        </div>

        <div className="flex gap-2">
          {(['all', 'credit', 'debit'] as const).map((f) => (
            <Button key={f} onClick={() => setFilter(f)} variant={filter === f ? 'default' : 'outline'}
              className={`rounded-xl text-xs capitalize ${filter === f ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200'}`}>{f}</Button>
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

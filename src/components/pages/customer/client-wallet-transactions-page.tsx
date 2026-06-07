'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Search, Filter, Calendar, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface Transaction {
  id: string
  desc: string
  amount: string
  type: 'credit' | 'debit'
  date: string
  method: string
}

export function ClientWalletTransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const { data: transactions, loading, error, refetch } = useApi<Transaction[]>(async () => {
    const res = await fetch('/api/client/wallet/transactions')
    if (!res.ok) throw new Error('Failed to load transactions')
    return res.json()
  })

  const filtered = transactions?.filter((t) => filter === 'all' || t.type === filter) ?? []

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading transactions">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load transactions</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search transactions..." className="pl-10 rounded-xl border-slate-200" aria-label="Search transactions" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200" aria-label="Filter transactions"><Filter className="size-4" /></Button>
        </div>

        <div className="flex gap-2" role="group" aria-label="Filter by type">
          {(['all', 'credit', 'debit'] as const).map((f) => (
            <Button key={f} onClick={() => setFilter(f)} variant={filter === f ? 'default' : 'outline'}
              className={`rounded-xl text-xs capitalize ${filter === f ? 'bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white' : 'border-slate-200'}`}
              aria-pressed={filter === f}>{f}</Button>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No transactions found</p>
            ) : (
              filtered.map((txn, i) => (
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, Wallet, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface WalletTransaction {
  id: string
  desc: string
  amount: string
  type: 'credit' | 'debit'
  date: string
}

interface WalletData {
  balance: number
  transactions: WalletTransaction[]
}

export function ClientWalletPage() {
  const { navigate } = useApp()
  const { data: wallet, loading, error, refetch } = useApi<WalletData>(async () => {
    const res = await fetch('/api/client/wallet')
    if (!res.ok) throw new Error('Failed to load wallet')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading wallet">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load wallet</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Wallet</h1>

        <Card className="rounded-xl overflow-hidden border-0">
          <div className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Wallet className="size-5" /><span className="text-sm font-medium text-blue-100">Available Balance</span></div>
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/20">Active</Badge>
            </div>
            <p className="text-3xl font-bold">₹{(wallet?.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-4 flex gap-3">
            <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl" onClick={() => navigate('client-add-money')} aria-label="Add money to wallet"><Plus className="size-4" /> Add Money</Button>
            <Button variant="outline" className="flex-1 gap-1 border-slate-200 rounded-xl" aria-label="Withdraw from wallet"><ArrowUpRight className="size-4" /> Withdraw</Button>
          </div>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#1D63FF] text-xs" onClick={() => navigate('client-wallet-transactions')} aria-label="View all transactions">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {(!wallet?.transactions || wallet.transactions.length === 0) ? (
              <p className="text-center text-slate-400 py-8 text-sm">No transactions yet</p>
            ) : (
              wallet.transactions.map((txn, i) => (
                <div key={txn.id}>
                  <div className="flex items-center gap-3 py-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${txn.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {txn.type === 'credit' ? <TrendingUp className="size-4 text-emerald-600" /> : <TrendingDown className="size-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{txn.desc}</p>
                      <p className="text-xs text-slate-400">{txn.date}</p>
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>{txn.amount}</span>
                  </div>
                  {i < wallet.transactions.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

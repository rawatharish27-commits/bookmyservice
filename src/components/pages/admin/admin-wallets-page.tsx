'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, TrendingUp, TrendingDown, Search, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'

const walletOverview = { totalBalance: '₹4,56,780', totalDeposits: '₹12,45,000', totalWithdrawals: '₹8,90,000', pendingWithdrawals: '₹45,000' }

const userWallets = [
  { id: 1, name: 'Rahul Sharma', role: 'Customer', balance: '₹1,250', transactions: 24, status: 'Active' },
  { id: 2, name: 'Cool Care Services', role: 'Provider', balance: '₹7,650', transactions: 56, status: 'Active' },
  { id: 3, name: 'Priya Patel', role: 'Customer', balance: '₹500', transactions: 12, status: 'Active' },
  { id: 4, name: 'QuickFix Solutions', role: 'Provider', balance: '₹12,400', transactions: 89, status: 'Active' },
  { id: 5, name: 'Amit Verma', role: 'Customer', balance: '₹0', transactions: 8, status: 'Frozen' },
]

const recentTxns = [
  { id: 'TXN-501', user: 'Rahul Sharma', type: 'Credit', amount: '+₹500', method: 'UPI', date: '22 May 2024' },
  { id: 'TXN-500', user: 'Cool Care Services', type: 'Debit', amount: '-₹5,000', method: 'Bank Transfer', date: '21 May 2024' },
  { id: 'TXN-499', user: 'Priya Patel', type: 'Credit', amount: '+₹250', method: 'Wallet Top-up', date: '20 May 2024' },
]

export function AdminWalletsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Wallets</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-blue-600">{walletOverview.totalBalance}</p><p className="text-xs text-slate-500">Total Balance</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-emerald-600">{walletOverview.totalDeposits}</p><p className="text-xs text-slate-500">Total Deposits</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-red-600">{walletOverview.totalWithdrawals}</p><p className="text-xs text-slate-500">Total Withdrawals</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-amber-600">{walletOverview.pendingWithdrawals}</p><p className="text-xs text-slate-500">Pending</p></CardContent></Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search wallets..." className="pl-10 rounded-xl" />
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">User Wallets</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {userWallets.map((w, i) => (
              <div key={w.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{w.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{w.name}</p>
                    <p className="text-xs text-slate-400">{w.role} • {w.transactions} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{w.balance}</p>
                    <Badge variant="secondary" className={`text-[10px] ${w.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{w.status}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                </div>
                {i < userWallets.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

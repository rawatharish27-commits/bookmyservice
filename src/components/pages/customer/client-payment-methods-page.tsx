'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Smartphone, Wallet, Plus, Trash2, Star } from 'lucide-react'

const cards = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', default: true },
  { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/25', default: false },
]

const upiIds = [
  { id: 1, upi: 'rahul@upi', default: true },
  { id: 2, upi: 'rahul@paytm', default: false },
]

const wallets = [
  { id: 1, name: 'Paytm', balance: '₹500' },
  { id: 2, name: 'Amazon Pay', balance: '₹200' },
]

export function ClientPaymentMethodsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><Plus className="size-4" /> Add New</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CreditCard className="size-4 text-blue-600" /> Saved Cards</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <CreditCard className="size-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{c.type} •••• {c.last4}</p>
                  <p className="text-xs text-slate-400">Expires {c.expiry}</p>
                </div>
                {c.default && <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Default</Badge>}
                <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-red-600"><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Smartphone className="size-4 text-purple-600" /> UPI</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upiIds.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <Smartphone className="size-5 text-slate-400" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{u.upi}</p></div>
                {u.default && <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Default</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Wallet className="size-4 text-emerald-600" /> Wallets</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <Wallet className="size-5 text-slate-400" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{w.name}</p><p className="text-xs text-slate-400">Balance: {w.balance}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

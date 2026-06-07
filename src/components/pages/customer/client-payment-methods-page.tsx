'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Smartphone, Wallet, Plus, Trash2, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface SavedCard {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
}

interface UpiId {
  id: string
  upi: string
  isDefault: boolean
}

interface WalletItem {
  id: string
  name: string
  balance: string
}

interface PaymentMethodsData {
  cards: SavedCard[]
  upiIds: UpiId[]
  wallets: WalletItem[]
}

export function ClientPaymentMethodsPage() {
  const { data: paymentData, loading, error, refetch } = useApi<PaymentMethodsData>(async () => {
    const res = await fetch('/api/client/payment-methods')
    if (!res.ok) throw new Error('Failed to load payment methods')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading payment methods">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load payment methods</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
          <Button size="sm" className="gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl" aria-label="Add new payment method"><Plus className="size-4" /> Add New</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CreditCard className="size-4 text-[#0A1F44]" /> Saved Cards</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(!paymentData?.cards || paymentData.cards.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-4">No saved cards</p>
            ) : (
              paymentData.cards.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <CreditCard className="size-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{c.type} &bull;&bull;&bull;&bull; {c.last4}</p>
                    <p className="text-xs text-slate-400">Expires {c.expiry}</p>
                  </div>
                  {c.isDefault && <Badge variant="secondary" className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10">Default</Badge>}
                  <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-red-600" aria-label={`Remove ${c.type} card ending ${c.last4}`}><Trash2 className="size-4" /></Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Smartphone className="size-4 text-purple-600" /> UPI</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(!paymentData?.upiIds || paymentData.upiIds.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-4">No UPI IDs saved</p>
            ) : (
              paymentData.upiIds.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Smartphone className="size-5 text-slate-400" />
                  <div className="flex-1"><p className="text-sm font-medium text-slate-900">{u.upi}</p></div>
                  {u.isDefault && <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Default</Badge>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Wallet className="size-4 text-emerald-600" /> Wallets</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(!paymentData?.wallets || paymentData.wallets.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-4">No wallets linked</p>
            ) : (
              paymentData.wallets.map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Wallet className="size-5 text-slate-400" />
                  <div className="flex-1"><p className="text-sm font-medium text-slate-900">{w.name}</p><p className="text-xs text-slate-400">Balance: {w.balance}</p></div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

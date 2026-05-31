'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Wallet, CreditCard, Smartphone, Landmark, Plus, Check, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

const methods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Credit or Debit Card' },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark, desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay' },
]

interface WalletInfo {
  balance: number
}

export function ClientAddMoneyPage() {
  const { goBack } = useApp()
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [submitting, setSubmitting] = useState(false)
  const { data: wallet, loading, error, refetch } = useApi<WalletInfo>(async () => {
    const res = await fetch('/api/client/wallet')
    if (!res.ok) throw new Error('Failed to load wallet')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading wallet info">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load wallet info</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  const presets = [99, 199, 499]

  const handleAddMoney = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/client/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), method: selectedMethod }),
      })
      if (!res.ok) throw new Error('Failed to add money')
      goBack()
    } catch {
      // Error handled by UI
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Money</h1>

        <Card className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] rounded-xl border-0 text-white">
          <CardContent className="p-5">
            <p className="text-xs text-blue-100">Current Balance</p>
            <p className="text-2xl font-bold">₹{(wallet?.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Select Amount</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {presets.map((p) => (
                <Button key={p} variant={amount === String(p) ? 'default' : 'outline'}
                  onClick={() => setAmount(String(p))}
                  className={`rounded-xl py-6 text-lg font-bold ${amount === String(p) ? 'bg-[#1D63FF] hover:bg-[#0B3D91] text-white' : 'border-slate-200 text-slate-900'}`}
                  aria-pressed={amount === String(p)}>
                  ₹{p}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <Input id="add-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter custom amount (₹99-₹499)" className="pl-8 rounded-xl border-slate-200 text-lg font-bold" aria-label="Custom amount" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${selectedMethod === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}
                aria-pressed={selectedMethod === m.id}>
                <m.icon className={`size-5 ${selectedMethod === m.id ? 'text-[#1D63FF]' : 'text-slate-400'}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </div>
                {selectedMethod === m.id && <Check className="size-5 text-[#1D63FF]" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl py-5" disabled={!amount || submitting} onClick={handleAddMoney} aria-label={`Add ₹${amount || '0'} to wallet`}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add ₹{amount || '0'} to Wallet
        </Button>
      </div>
    </div>
  )
}

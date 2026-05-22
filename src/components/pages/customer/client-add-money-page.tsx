'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Wallet, CreditCard, Smartphone, Landmark, Plus, Check } from 'lucide-react'

const presets = [500, 1000, 2000]

const methods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Credit or Debit Card' },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark, desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay' },
]

export function ClientAddMoneyPage() {
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('upi')

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Money</h1>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl border-0 text-white">
          <CardContent className="p-5">
            <p className="text-xs text-blue-100">Current Balance</p>
            <p className="text-2xl font-bold">₹1,250.00</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Select Amount</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {presets.map((p) => (
                <Button key={p} variant={amount === String(p) ? 'default' : 'outline'}
                  onClick={() => setAmount(String(p))}
                  className={`rounded-xl py-6 text-lg font-bold ${amount === String(p) ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200 text-slate-900'}`}>
                  ₹{p}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter custom amount" className="pl-8 rounded-xl border-slate-200 text-lg font-bold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${selectedMethod === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <m.icon className={`size-5 ${selectedMethod === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </div>
                {selectedMethod === m.id && <Check className="size-5 text-blue-600" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl py-5" disabled={!amount}>
          <Plus className="size-4" /> Add ₹{amount || '0'} to Wallet
        </Button>
      </div>
    </div>
  )
}

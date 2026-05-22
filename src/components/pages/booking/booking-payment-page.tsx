'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, CreditCard, Smartphone, Tag, Check, Shield, Zap } from 'lucide-react'

const methods = [
  { id: 'wallet', label: 'MyService Wallet', icon: Wallet, balance: '₹1,250', desc: 'Available balance' },
  { id: 'upi', label: 'UPI', icon: Smartphone, balance: '', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, balance: '', desc: 'Visa, Mastercard, Rupay' },
]

export function BookingPaymentPage() {
  const [selected, setSelected] = useState('wallet')
  const [coupon, setCoupon] = useState('')

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50"><Zap className="size-5 text-blue-600" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">AC Service & Repair</p>
              <p className="text-xs text-slate-400">20 May 2025 • 10:00 AM</p>
            </div>
            <span className="text-lg font-bold text-blue-600">₹1,039</span>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Apply Coupon</CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">SAVE20 Applied</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code" className="pl-10 rounded-xl border-slate-200" />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200">Apply</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setSelected(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${selected === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <m.icon className={`size-5 ${selected === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.balance ? `Balance: ${m.balance}` : m.desc}</p>
                </div>
                {selected === m.id && <Check className="size-5 text-blue-600" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-900">₹1,239</span></div>
            <div className="flex justify-between text-sm"><span className="text-emerald-600">Discount</span><span className="text-emerald-600">-₹200</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold"><span className="text-slate-900">Pay</span><span className="text-blue-600">₹1,039</span></div>
          </CardContent>
        </Card>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl py-5"><Shield className="size-4" /> Pay ₹1,039</Button>
      </div>
    </div>
  )
}

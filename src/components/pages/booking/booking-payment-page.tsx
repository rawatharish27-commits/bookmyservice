'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, CreditCard, Smartphone, Tag, Check, Shield, Zap, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useApi } from '@/lib/use-api'

// Payment methods and pricing are client-side state (UI config + booking context)
// In production, the booking amount and applied coupons would come from the booking API
interface PaymentData {
  service: { name: string; date: string; time: string };
  total: number;
  methods: { id: string; label: string; icon: typeof Wallet; balance: string; desc: string }[];
  pricing: { subtotal: number; discount: number; pay: number };
}

const staticPaymentData: PaymentData = {
  service: { name: 'Home Service', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), time: '10:00 AM' },
  total: 299,
  methods: [
    { id: 'wallet', label: 'MyService Wallet', icon: Wallet, balance: '₹1,250', desc: 'Available balance' },
    { id: 'upi', label: 'UPI', icon: Smartphone, balance: '', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, balance: '', desc: 'Visa, Mastercard, Rupay' },
  ],
  pricing: { subtotal: 349, discount: 50, pay: 299 },
}

export function BookingPaymentPage() {
  const [selected, setSelected] = useState('wallet')
  const [coupon, setCoupon] = useState('')
  const { navigate } = useApp()

  const { data, loading } = useApi(() => Promise.resolve(staticPaymentData), [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading payment">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50"><Zap className="size-5 text-[#1D63FF]" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{data.service.name}</p>
              <p className="text-xs text-slate-400">{data.service.date} • {data.service.time}</p>
            </div>
            <span className="text-lg font-bold text-[#1D63FF]">₹{data.total}</span>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Apply Coupon</CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">FIRST50 Applied</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code" className="pl-10 rounded-xl border-slate-200" aria-label="Coupon code" />
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200">Apply</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.methods.map((m) => (
              <button key={m.id} onClick={() => setSelected(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${selected === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <m.icon className={`size-5 ${selected === m.id ? 'text-[#1D63FF]' : 'text-slate-400'}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.balance ? `Balance: ${m.balance}` : m.desc}</p>
                </div>
                {selected === m.id && <Check className="size-5 text-[#1D63FF]" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-900">₹{data.pricing.subtotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-emerald-600">Discount</span><span className="text-emerald-600">-₹{data.pricing.discount}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold"><span className="text-slate-900">Pay</span><span className="text-[#1D63FF]">₹{data.pricing.pay}</span></div>
          </CardContent>
        </Card>

        <Button className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl py-5" onClick={() => navigate('booking-razorpay')}>
          <Shield className="size-4" /> Pay ₹{data.pricing.pay}
        </Button>
      </div>
    </div>
  )
}

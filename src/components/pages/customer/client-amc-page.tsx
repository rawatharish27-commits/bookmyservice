'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Shield, Check, Calendar, Zap, ArrowRight } from 'lucide-react'

const plans = [
  { id: 1, name: 'Basic Care', price: '₹999/yr', visits: 2, benefits: ['2 free visits', '10% off repairs', 'Priority support'], color: 'bg-slate-50 border-slate-200' },
  { id: 2, name: 'Standard Care', price: '₹1,999/yr', visits: 4, benefits: ['4 free visits', '15% off repairs', 'Priority support', 'Free parts up to ₹500'], color: 'bg-blue-50 border-blue-200' },
  { id: 3, name: 'Premium Care', price: '₹3,499/yr', visits: 6, benefits: ['6 free visits', '20% off repairs', '24/7 priority support', 'Free parts up to ₹1,000', 'Annual deep clean'], color: 'bg-purple-50 border-purple-200' },
]

export function ClientAmcPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">AMC Plans</h1>

        <Card className="bg-white rounded-xl border-emerald-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50"><Shield className="size-5 text-emerald-600" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-900">Standard Care</h3><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge></div>
                <p className="text-xs text-slate-400">Valid till 31 Dec 2025</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Visits Used</span><span className="font-semibold text-slate-900">2 / 4</span></div>
              <Progress value={50} className="h-2" />
            </div>
            <div className="flex items-center gap-2 mt-3 rounded-lg bg-slate-50 p-2.5">
              <Calendar className="size-4 text-slate-400" />
              <span className="text-xs text-slate-500">Next visit: 20 Jun 2025</span>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-base font-semibold text-slate-900">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`rounded-xl ${plan.color}`}>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xl font-bold text-blue-600">{plan.price}</p>
                <p className="text-xs text-slate-500">{plan.visits} service visits/year</p>
                <Separator />
                <div className="space-y-1.5">
                  {plan.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-1.5 text-xs text-slate-600"><Check className="size-3 text-emerald-500" />{b}</div>
                  ))}
                </div>
                <Button className="w-full gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs"><Zap className="size-3" />Buy Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

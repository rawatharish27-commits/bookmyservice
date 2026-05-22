'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Crown, Zap, Star } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    description: 'Get started with basic features',
    features: ['Up to 3 services', 'Basic analytics', 'Standard support', '5% commission'],
    current: true,
    color: 'bg-slate-100',
    textColor: 'text-slate-700',
    icon: Star,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'Grow your business faster',
    features: ['Up to 10 services', 'Advanced analytics', 'Priority support', '3% commission', 'Featured listing', 'Custom schedule'],
    current: false,
    color: 'bg-blue-600',
    textColor: 'text-white',
    icon: Zap,
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹999',
    period: '/month',
    description: 'Maximum visibility & earnings',
    features: ['Unlimited services', 'Full analytics suite', '24/7 dedicated support', '1% commission', 'Top featured listing', 'Custom schedule', 'Priority in search', 'Marketing tools'],
    current: false,
    color: 'bg-purple-600',
    textColor: 'text-white',
    icon: Crown,
  },
]

export function ProviderSubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Choose the plan that fits your business needs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card key={plan.name} className={`bg-white rounded-xl relative ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
                {plan.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white border-0">Most Popular</Badge>}
                <CardContent className="p-5">
                  <div className={`flex size-10 items-center justify-center rounded-lg ${plan.color} ${plan.textColor} mb-3`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{plan.description}</p>
                  <Separator className="my-4 bg-slate-100" />
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="size-3.5 text-emerald-500 shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-4 rounded-xl ${plan.current ? 'bg-slate-100 text-slate-500' : plan.name === 'Pro' ? 'bg-blue-600 hover:bg-blue-700' : plan.name === 'Premium' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-200 text-slate-700'}`} disabled={plan.current}>
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

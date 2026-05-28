'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Plus, Calendar, Users } from 'lucide-react'

const amcPlans = [
  { id: 1, name: 'Basic Care', price: '₹999/year', services: 2, visits: 4, customers: 156, active: true },
  { id: 2, name: 'Standard Care', price: '₹1,999/year', services: 4, visits: 8, customers: 243, active: true },
  { id: 3, name: 'Premium Care', price: '₹2,999/year', services: 6, visits: 12, customers: 89, active: true },
  { id: 4, name: 'Enterprise Care', price: '₹4,999/year', services: 10, visits: 24, customers: 12, active: false },
]

const subscriptions = [
  { id: 1, customer: 'Rahul Sharma', plan: 'Standard Care', startDate: '15 Jan 2024', endDate: '14 Jan 2025', status: 'Active', visitsUsed: 3 },
  { id: 2, customer: 'Priya Patel', plan: 'Premium Care', startDate: '01 Mar 2024', endDate: '28 Feb 2025', status: 'Active', visitsUsed: 5 },
  { id: 3, customer: 'Amit Verma', plan: 'Basic Care', startDate: '10 Feb 2024', endDate: '09 Feb 2025', status: 'Expiring Soon', visitsUsed: 4 },
]

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Expiring Soon': 'bg-amber-100 text-amber-700 border-amber-200',
  Expired: 'bg-red-100 text-red-700 border-red-200',
}

export function AdminAmcPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">AMC Plans</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Add Plan</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {amcPlans.map((plan) => (
            <Card key={plan.id} className="bg-white rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={plan.active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>{plan.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                <p className="text-lg font-bold text-[#1D63FF] mt-1">{plan.price}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p>{plan.services} services included</p>
                  <p>{plan.visits} visits per year</p>
                  <p className="font-medium text-slate-700">{plan.customers} subscribers</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Recent Subscriptions</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {subscriptions.map((sub, i) => (
              <div key={sub.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50"><Shield className="size-5 text-[#1D63FF]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{sub.customer}</p><Badge variant="secondary" className={statusColors[sub.status]}>{sub.status}</Badge></div>
                    <p className="text-xs text-slate-400">{sub.plan} • {sub.visitsUsed} visits used • {sub.startDate} - {sub.endDate}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg">Renew</Button>
                </div>
                {i < subscriptions.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

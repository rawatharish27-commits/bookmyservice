'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Tag, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'

const coupons = [
  { id: 1, code: 'SUMMER20', discount: '20%', type: 'Percentage', usage: '156 / 500', expires: '30 Jun 2024', active: true },
  { id: 2, code: 'FIRST100', discount: '₹100', type: 'Flat', usage: '432 / 1000', expires: '31 Dec 2024', active: true },
  { id: 3, code: 'CLEAN50', discount: '₹50', type: 'Flat', usage: '89 / 200', expires: '15 Jul 2024', active: true },
  { id: 4, code: 'WINTER15', discount: '15%', type: 'Percentage', usage: '0 / 300', expires: '31 Jan 2025', active: false },
  { id: 5, code: 'VIP30', discount: '30%', type: 'Percentage', usage: '23 / 50', expires: '30 May 2024', active: true },
]

export function AdminCouponsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl"><Plus className="size-4" /> Create Coupon</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search coupons..." className="pl-10 rounded-xl" />
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><Tag className="size-4 text-[#1D63FF]" /><span className="text-sm font-mono font-semibold text-slate-700">{c.code}</span></div></td>
                      <td className="px-4 py-3 text-sm text-slate-700">{c.discount} <span className="text-xs text-slate-400">({c.type})</span></td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden sm:table-cell">{c.usage}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{c.expires}</td>
                      <td className="px-4 py-3">
                        <button className="shrink-0">
                          {c.active ? <ToggleRight className="size-6 text-emerald-500" /> : <ToggleLeft className="size-6 text-slate-300" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-7"><Edit2 className="size-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

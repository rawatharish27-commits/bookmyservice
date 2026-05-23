'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, ShieldCheck, XCircle, Eye } from 'lucide-react'

const providers = [
  { id: 1, name: 'Cool Care Services', owner: 'Arvind Kumar', email: 'arvind@coolcare.in', services: 4, kyc: 'Verified', bookings: 156, rating: 4.7 },
  { id: 2, name: 'QuickFix Solutions', owner: 'Suresh Patel', email: 'suresh@quickfix.in', services: 6, kyc: 'Verified', bookings: 132, rating: 4.8 },
  { id: 3, name: 'HomePro Services', owner: 'Meena Devi', email: 'meena@homepro.in', services: 3, kyc: 'Pending', bookings: 45, rating: 4.2 },
  { id: 4, name: 'A1 Repair Hub', owner: 'Raj Kumar', email: 'raj@a1repair.in', services: 5, kyc: 'Rejected', bookings: 0, rating: 0 },
  { id: 5, name: 'SparkClean Pro', owner: 'Anita Desai', email: 'anita@sparkclean.in', services: 2, kyc: 'Verified', bookings: 88, rating: 4.5 },
]

const kycColors: Record<string, string> = {
  Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
}

export function AdminProvidersPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Providers</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search providers..." className="pl-10 rounded-xl" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">1,234</p><p className="text-xs text-slate-500">Total Providers</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">945</p><p className="text-xs text-slate-500">KYC Verified</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">156</p><p className="text-xs text-slate-500">Pending KYC</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Services</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">KYC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{p.name}</p><p className="text-xs text-slate-400">{p.owner}</p></td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden sm:table-cell">{p.services}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={kycColors[p.kyc]}>{p.kyc}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden md:table-cell">{p.bookings}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.kyc === 'Pending' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ShieldCheck className="size-3" /> Verify</Button>}
                          {p.kyc === 'Rejected' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600"><XCircle className="size-3" /> Review</Button>}
                          <Button size="sm" variant="ghost" className="h-7 text-xs"><Eye className="size-3" /></Button>
                        </div>
                      </td>
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

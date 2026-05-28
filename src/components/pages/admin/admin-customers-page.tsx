'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react'

const customers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', phone: '+91 98765 12345', bookings: 12, spent: '₹18,500', joined: '15 Jan 2024', status: 'Active' },
  { id: 2, name: 'Priya Patel', email: 'priya@email.com', phone: '+91 87654 54321', bookings: 8, spent: '₹12,200', joined: '22 Feb 2024', status: 'Active' },
  { id: 3, name: 'Amit Verma', email: 'amit@email.com', phone: '+91 76543 67890', bookings: 5, spent: '₹6,800', joined: '10 Mar 2024', status: 'Active' },
  { id: 4, name: 'Neha Gupta', email: 'neha@email.com', phone: '+91 65432 12345', bookings: 3, spent: '₹3,200', joined: '05 Apr 2024', status: 'Inactive' },
  { id: 5, name: 'Vikas Singh', email: 'vikas@email.com', phone: '+91 54321 98765', bookings: 15, spent: '₹24,500', joined: '01 Jan 2024', status: 'Active' },
]

export function AdminCustomersPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Filter className="size-4" /> Filters</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                </tr></thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#1D63FF]/10 text-xs font-bold text-[#1D63FF]">{c.name.charAt(0)}</div>
                          <div><p className="text-sm font-medium text-slate-700">{c.name}</p><p className="text-xs text-slate-400">{c.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden sm:table-cell">{c.bookings}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{c.spent}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{c.joined}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={c.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Showing 1-5 of 1,234</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronLeft className="size-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#1D63FF] text-white border-[#1D63FF]">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">2</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">3</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}

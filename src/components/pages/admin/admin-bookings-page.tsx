'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, Download, Trash2, Eye } from 'lucide-react'

const bookings = [
  { id: 'BK-1024', customer: 'Rahul Sharma', provider: 'Cool Care Services', service: 'Air Conditioner', date: '22 May 2024', amount: '₹499', status: 'Confirmed' },
  { id: 'BK-1023', customer: 'Priya Patel', provider: 'QuickFix Solutions', service: 'Water Tank Cleaning', date: '21 May 2024', amount: '₹399', status: 'Completed' },
  { id: 'BK-1022', customer: 'Amit Verma', provider: 'Cool Care Services', service: 'Plumber', date: '20 May 2024', amount: '₹349', status: 'Completed' },
  { id: 'BK-1021', customer: 'Neha Gupta', provider: 'HomePro Services', service: 'Refrigerator', date: '19 May 2024', amount: '₹499', status: 'Cancelled' },
  { id: 'BK-1020', customer: 'Vikas Singh', provider: 'SparkClean Pro', service: 'Electrician', date: '18 May 2024', amount: '₹299', status: 'In Progress' },
]

const statusColors: Record<string, string> = {
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function AdminBookingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Trash2 className="size-4" /> Bulk</Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input placeholder="Search bookings..." className="pl-10 rounded-xl" /></div>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Filter className="size-4" /> Filters</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Action</th>
                </tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{b.id}</td>
                      <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{b.service}</p><p className="text-xs text-slate-400">{b.customer}</p></td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden sm:table-cell">{b.provider}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{b.date}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{b.amount}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={statusColors[b.status]}>{b.status}</Badge></td>
                      <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button></td>
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

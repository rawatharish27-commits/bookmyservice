'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, ChevronRight, Filter } from 'lucide-react'

type TabKey = 'all' | 'active' | 'completed' | 'cancelled'

const bookings = [
  { id: 'BK-1024', service: 'Air Conditioner', customer: 'Rahul Sharma', date: '22 May 2024', time: '10:00 AM', amount: '₹499', status: 'Active' },
  { id: 'BK-1023', service: 'Water Tank Cleaning', customer: 'Priya Patel', date: '21 May 2024', time: '02:00 PM', amount: '₹499', status: 'Completed' },
  { id: 'BK-1022', service: 'Plumber', customer: 'Amit Verma', date: '20 May 2024', time: '11:00 AM', amount: '₹499', status: 'Completed' },
  { id: 'BK-1021', service: 'Air Conditioner', customer: 'Neha Gupta', date: '19 May 2024', time: '09:00 AM', amount: '₹499', status: 'Cancelled' },
  { id: 'BK-1020', service: 'Electrician', customer: 'Vikas Singh', date: '18 May 2024', time: '04:00 PM', amount: '₹499', status: 'Active' },
]

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Completed: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  Cancelled: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export function ProviderBookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status.toLowerCase() === activeTab)

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Filter className="size-4" /> Filter</Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No bookings found</div>
            ) : (
              filtered.map((booking, i) => (
                <div key={booking.id}>
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 shrink-0"><Calendar className="size-5 text-blue-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{booking.service}</p>
                        <Badge variant="secondary" className={statusColors[booking.status]}>{booking.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.customer} • {booking.id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="size-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{booking.date} at {booking.time}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-700">{booking.amount}</p>
                      <ChevronRight className="size-4 text-slate-400 ml-auto" />
                    </div>
                  </div>
                  {i < filtered.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

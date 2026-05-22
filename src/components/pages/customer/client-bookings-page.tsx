'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Calendar, Clock, ChevronRight, Filter } from 'lucide-react'

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'] as const
const bookings = [
  { id: 'BK001', service: 'AC Service', date: '15 May 2025', time: '10:00 AM', amount: '₹1,200', status: 'Upcoming' },
  { id: 'BK002', service: 'Plumbing Repair', date: '12 May 2025', time: '2:00 PM', amount: '₹800', status: 'Completed' },
  { id: 'BK003', service: 'Deep Cleaning', date: '10 May 2025', time: '9:00 AM', amount: '₹2,500', status: 'Completed' },
  { id: 'BK004', service: 'Electrician', date: '8 May 2025', time: '11:00 AM', amount: '₹600', status: 'Cancelled' },
  { id: 'BK005', service: 'Carpenter Visit', date: '5 May 2025', time: '3:00 PM', amount: '₹1,500', status: 'Completed' },
]

const statusColor: Record<string, string> = {
  Upcoming: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Cancelled: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
}

export function ClientBookingsPage() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('All')
  const [search, setSearch] = useState('')

  const filtered = bookings.filter((b) => {
    const matchTab = activeTab === 'All' || b.status === activeTab
    const matchSearch = b.service.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="pl-10 rounded-xl border-slate-200" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200"><Filter className="size-4" /></Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <Button key={tab} onClick={() => setActiveTab(tab)} variant={activeTab === tab ? 'default' : 'outline'}
              className={`rounded-xl whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200'}`}>
              {tab}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((booking) => (
            <Card key={booking.id} className="bg-white rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Calendar className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{booking.service}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="size-3" /> {booking.date} &bull; {booking.time}
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusColor[booking.status]}>{booking.status}</Badge>
                  <span className="text-sm font-bold text-slate-900">{booking.amount}</span>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

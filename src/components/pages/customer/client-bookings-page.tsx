'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Calendar, Clock, ChevronRight, Filter, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'] as const

interface Booking {
  id: string
  service: string
  date: string
  time: string
  amount: string
  status: 'Upcoming' | 'Completed' | 'Cancelled'
}

const statusColor: Record<string, string> = {
  Upcoming: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Cancelled: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
}

export function ClientBookingsPage() {
  const { navigate } = useApp()
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('All')
  const [search, setSearch] = useState('')
  const { data: bookings, loading, error, refetch } = useApi<Booking[]>(async () => {
    const res = await fetch('/api/client/bookings')
    if (!res.ok) throw new Error('Failed to load bookings')
    return res.json()
  })

  const filtered = bookings?.filter((b) => {
    const matchTab = activeTab === 'All' || b.status === activeTab
    const matchSearch = b.service.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  }) ?? []

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading bookings">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load bookings</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="pl-10 rounded-xl border-slate-200" aria-label="Search bookings" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200" aria-label="Filter bookings"><Filter className="size-4" /></Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Booking status filter">
          {tabs.map((tab) => (
            <Button key={tab} onClick={() => setActiveTab(tab)} variant={activeTab === tab ? 'default' : 'outline'}
              className={`rounded-xl whitespace-nowrap ${activeTab === tab ? 'bg-[#1D63FF] hover:bg-[#0B3D91] text-white' : 'border-slate-200'}`}
              role="tab" aria-selected={activeTab === tab}>
              {tab}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <Card key={booking.id} className="bg-white rounded-xl hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('client-booking-detail', { id: booking.id })}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Calendar className="size-5 text-[#1D63FF]" />
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
        )}
      </div>
    </div>
  )
}

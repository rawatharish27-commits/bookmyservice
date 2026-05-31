'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, XCircle, Calendar, Trash2 } from 'lucide-react'

const activeBookings = [
  { id: 'BK-1024', customer: 'Rahul Sharma', date: '22 May 2024', time: '10:00 AM', status: 'Confirmed' },
  { id: 'BK-1028', customer: 'Priya Patel', date: '23 May 2024', time: '02:00 PM', status: 'Pending' },
]

export function ProviderDeleteServicePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Delete Service</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-red-100"><Trash2 className="size-6 text-red-600" /></div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Air Conditioner</h2>
                <p className="text-sm text-slate-500">Category: Air Conditioner • Price: ₹499</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 rounded-xl">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <AlertTriangle className="size-5 text-red-600 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Warning: This action cannot be undone</h3>
                <p className="text-xs text-red-700 mt-1">Deleting this service will permanently remove it from your profile. All associated data including booking history will be lost.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {activeBookings.length > 0 && (
          <Card className="bg-amber-50 border-amber-200 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><Calendar className="size-4 text-amber-600" /><CardTitle className="text-sm font-semibold text-amber-800">Active Bookings ({activeBookings.length})</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-0">
              <p className="text-xs text-amber-700 mb-3">You have active bookings for this service. Please complete or cancel them before deleting.</p>
              {activeBookings.map((booking, i) => (
                <div key={booking.id}>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-amber-900">{booking.customer}</p>
                      <p className="text-xs text-amber-700">{booking.id} • {booking.date} at {booking.time}</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">{booking.status}</Badge>
                  </div>
                  {i < activeBookings.length - 1 && <Separator className="bg-amber-200" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Confirm Deletion</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Type <strong>&quot;DELETE&quot;</strong> to confirm deletion of this service.</p>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder='Type "DELETE" to confirm' />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-1 rounded-xl"><XCircle className="size-4" /> Delete Service</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

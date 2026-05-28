'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Phone, MapPin, Clock, User } from 'lucide-react'

const requests = [
  { id: 'BR-1001', service: 'Air Conditioner', customer: 'Rahul Sharma', phone: '+91 98765 12345', address: '12, MG Road, Delhi', date: '22 May 2024', time: '10:00 AM', amount: '₹499', urgency: 'Normal' },
  { id: 'BR-1002', service: 'Plumber', customer: 'Anita Desai', phone: '+91 87654 54321', address: '34, Janakpuri, Delhi', date: '22 May 2024', time: '11:30 AM', amount: '₹499', urgency: 'Urgent' },
  { id: 'BR-1003', service: 'Water Tank Cleaning', customer: 'Vikram Joshi', phone: '+91 76543 67890', address: '56, Dwarka, Delhi', date: '23 May 2024', time: '09:00 AM', amount: '₹499', urgency: 'Normal' },
]

export function ProviderBookingRequestsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Booking Requests</h1>
          <Badge className="bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200">{requests.length} New</Badge>
        </div>

        {requests.map((req) => (
          <Card key={req.id} className="bg-white rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold text-slate-900">{req.service}</CardTitle>
                  {req.urgency === 'Urgent' && <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>}
                </div>
                <span className="text-sm font-semibold text-slate-700">{req.amount}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2"><User className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{req.customer}</span></div>
              <div className="flex items-center gap-2"><Phone className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{req.phone}</span></div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{req.address}</span></div>
              <div className="flex items-center gap-2"><Clock className="size-4 text-slate-400" /><span className="text-sm text-slate-700">{req.date} at {req.time}</span></div>
              <Separator className="bg-slate-100" />
              <div className="flex gap-3">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1 rounded-xl"><CheckCircle className="size-4" /> Accept</Button>
                <Button variant="outline" className="flex-1 gap-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"><XCircle className="size-4" /> Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

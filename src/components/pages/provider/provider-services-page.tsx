'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Edit2, Power, MoreVertical } from 'lucide-react'

const services = [
  { id: 1, name: 'Air Conditioner', category: 'Air Conditioner', price: '₹499', duration: '1-2 hrs', status: 'Active', bookings: 86 },
  { id: 2, name: 'Water Tank Cleaning', category: 'Water Tank Cleaning', price: '₹499', duration: '2-3 hrs', status: 'Active', bookings: 52 },
  { id: 3, name: 'Plumber', category: 'Plumber', price: '₹399', duration: '1 hr', status: 'Active', bookings: 38 },
  { id: 4, name: 'Electrician', category: 'Electrician', price: '₹499', duration: '1-2 hrs', status: 'Paused', bookings: 24 },
  { id: 5, name: 'Kitchen Appliances', category: 'Kitchen Appliances', price: '₹499', duration: '4-6 hrs', status: 'Active', bookings: 15 },
]

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Paused: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
}

export function ProviderServicesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Add Service</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-[#1D63FF]">{services.length}</p><p className="text-xs text-slate-500">Total Services</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{services.filter(s => s.status === 'Active').length}</p><p className="text-xs text-slate-500">Active</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{services.reduce((a, s) => a + s.bookings, 0)}</p><p className="text-xs text-slate-500">Total Bookings</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Service List</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {services.map((service, i) => (
              <div key={service.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{service.name}</p>
                      <Badge variant="secondary" className={statusColors[service.status]}>{service.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{service.category} • {service.duration} • {service.bookings} bookings</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{service.price}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit2 className="size-4" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Power className="size-4" /></button>
                  </div>
                </div>
                {i < services.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, MapPinned } from 'lucide-react'

const addresses = [
  { id: 1, label: 'Home', icon: Home, full: '42, Rajouri Garden, New Delhi - 110027', isDefault: true },
  { id: 2, label: 'Work', icon: Briefcase, full: 'Tower B, 5th Floor, Cyber Hub, Gurugram - 122002', isDefault: false },
  { id: 3, label: 'Other', icon: MapPinned, full: '12, Green Park Extension, New Delhi - 110016', isDefault: false },
]

export function ClientAddressesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Addresses</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
            <Plus className="size-4" /> Add Address
          </Button>
        </div>

        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="bg-white rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <addr.icon className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{addr.label}</span>
                      {addr.isDefault && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Default</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{addr.full}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-blue-600"><Edit className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-red-600"><Trash2 className="size-4" /></Button>
                  </div>
                </div>
                <div className="mt-3 h-24 rounded-lg bg-slate-100 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="size-4" />
                    <span className="text-xs">Map Preview</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, MapPinned, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface Address {
  id: string
  label: string
  icon: 'Home' | 'Work' | 'Other'
  full: string
  isDefault: boolean
}

const iconMap = { Home, Work, Other: MapPinned }

export function ClientAddressesPage() {
  const { navigate } = useApp()
  const { data: addresses, loading, error, refetch } = useApi<Address[]>(async () => {
    const res = await fetch('/api/client/addresses')
    if (!res.ok) throw new Error('Failed to load addresses')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading addresses">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load addresses</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Addresses</h1>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl" aria-label="Add new address">
            <Plus className="size-4" /> Add Address
          </Button>
        </div>

        {!addresses || addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No addresses saved yet</p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 gap-1" aria-label="Add your first address">
              <Plus className="size-4" /> Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => {
              const IconComponent = iconMap[addr.icon as keyof typeof iconMap] ?? MapPinned
              return (
                <Card key={addr.id} className="bg-white rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <IconComponent className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900">{addr.label}</span>
                          {addr.isDefault && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Default</Badge>}
                        </div>
                        <p className="text-sm text-slate-500">{addr.full}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-blue-600" aria-label={`Edit ${addr.label} address`}><Edit className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-red-600" aria-label={`Delete ${addr.label} address`}><Trash2 className="size-4" /></Button>
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

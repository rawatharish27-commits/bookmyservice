'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Home, Briefcase, MapPinned, Star, Navigation, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface SavedAddress {
  id: string
  label: string
  icon: 'Home' | 'Work' | 'Other'
  address: string
  pin: string
  tag: string
}

const iconMap = { Home, Work, Other: MapPinned }

const tagColors: Record<string, string> = {
  primary: 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200 hover:bg-[#1D63FF]/10',
  secondary: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
  other: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100',
}

export function ClientSavedAddressesPage() {
  const { data: savedAddresses, loading, error, refetch } = useApi<SavedAddress[]>(async () => {
    const res = await fetch('/api/client/addresses/saved')
    if (!res.ok) throw new Error('Failed to load saved addresses')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading saved addresses">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load saved addresses</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>

        {!savedAddresses || savedAddresses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No saved addresses yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {savedAddresses.map((addr) => {
              const IconComponent = iconMap[addr.icon as keyof typeof iconMap] ?? MapPinned
              return (
                <Card key={addr.id} className="bg-white rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                        <IconComponent className="size-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900">{addr.label}</span>
                          <Badge variant="secondary" className={tagColors[addr.tag] ?? tagColors.other}>{addr.tag}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{addr.address}</p>
                        <p className="text-xs text-slate-400 mt-0.5">PIN: {addr.pin}</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs border-slate-200 rounded-lg" aria-label={`Navigate to ${addr.label}`}>
                        <Navigation className="size-3" /> Navigate
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs border-slate-200 rounded-lg" aria-label={`Set ${addr.label} as default`}>
                        <Star className="size-3" /> Default
                      </Button>
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

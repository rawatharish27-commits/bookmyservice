'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, User, Tag, Zap, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useApi } from '@/lib/use-api'

// Checkout data derived from service API + static booking config
interface CheckoutData {
  service: { name: string; desc: string; price: number };
  provider: { name: string; rating: string; services: string; distance: string };
  addresses: { id: string; label: string; address: string; selected: boolean }[];
  pricing: { serviceCharge: number; convenienceFee: number; discount: number; total: number };
}

export function BookingCheckoutPage() {
  const { navigate, nav } = useApp()
  const serviceId = nav.params.id || nav.params.service || ''

  const { data, loading, error, refetch } = useApi<CheckoutData>(async () => {
    // Fetch service details from API if we have a service ID
    if (serviceId) {
      const res = await fetch(`/api/services/${encodeURIComponent(serviceId)}`)
      if (!res.ok) throw new Error('Failed to load checkout details')
      const svc = await res.json()
      const serviceCharge = svc.basePrice
      const convenienceFee = Math.max(5, Math.round(svc.basePrice * 0.05))
      const discount = Math.round(svc.basePrice * 0.15)
      return {
        service: { name: svc.title, desc: svc.description ?? 'Professional home service', price: svc.basePrice },
        provider: { name: svc.provider.name, rating: svc.averageRating?.toFixed(1) ?? '4.5', services: `${svc.totalBookings ?? 0}+`, distance: '2 km' },
        addresses: [
          { id: '1', label: 'Home', address: '42, Rajouri Garden, New Delhi', selected: true },
          { id: '2', label: 'Work', address: 'Cyber Hub, Gurugram', selected: false },
        ],
        pricing: { serviceCharge, convenienceFee, discount, total: serviceCharge + convenienceFee - discount },
      }
    }
    // Fallback: no service ID in nav params
    return {
      service: { name: 'Home Service', desc: 'Professional home service by verified experts', price: 349 },
      provider: { name: 'Expert Professional', rating: '4.8', services: '500+', distance: '2 km' },
      addresses: [
        { id: '1', label: 'Home', address: '42, Rajouri Garden, New Delhi', selected: true },
        { id: '2', label: 'Work', address: 'Cyber Hub, Gurugram', selected: false },
      ],
      pricing: { serviceCharge: 299, convenienceFee: 50, discount: 50, total: 299 },
    }
  }, [serviceId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading checkout">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load checkout details</p>
          <Button variant="outline" onClick={() => navigate('service-detail')}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFD54F]/10"><Zap className="size-6 text-[#0A1F44]" /></div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{data.service.name}</h3>
                <p className="text-xs text-slate-400">{data.service.desc}</p>
              </div>
              <span className="text-lg font-bold text-slate-900">₹{data.service.price}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Service Provider</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-[#0A1F44] text-white text-sm">AS</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{data.provider.name}</p>
                <p className="text-xs text-slate-400">{data.provider.rating} ★ • {data.provider.services} services • {data.provider.distance} away</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Verified</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Select Address</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#0A1F44] text-xs">+ Add New</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.addresses.map((addr) => (
              <button key={addr.id} className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${addr.selected ? 'border-[#0A1F44] bg-[#FFD54F]/10' : 'border-slate-100 hover:bg-slate-50'}`}>
                <MapPin className={`size-4 ${addr.selected ? 'text-[#0A1F44]' : 'text-slate-400'}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{addr.label}</p>
                  <p className="text-xs text-slate-400">{addr.address}</p>
                </div>
                {addr.selected && <div className="size-4 rounded-full bg-[#0A1F44] flex items-center justify-center"><div className="size-2 rounded-full bg-white" /></div>}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Service Charge</span><span className="text-slate-900">₹{data.pricing.serviceCharge}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Convenience Fee</span><span className="text-slate-900">₹{data.pricing.convenienceFee}</span></div>
            <div className="flex items-center gap-1 text-sm"><Tag className="size-3.5 text-emerald-500" /><span className="text-emerald-600">Coupon: FIRST50</span><span className="text-emerald-600 ml-auto">-₹{data.pricing.discount}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold"><span className="text-slate-900">Total</span><span className="text-[#0A1F44]">₹{data.pricing.total}</span></div>
          </CardContent>
        </Card>

        <Button className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white gap-1 rounded-xl py-5" onClick={() => navigate('booking-payment')}>Proceed to Payment <ArrowRight className="size-4" /></Button>
      </div>
    </div>
  )
}

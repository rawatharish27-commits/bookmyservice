'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Wind, Zap, Droplets, Wrench, Tv, WashingMachine,
  Refrigerator, Flame, Truck, Search, Star, ArrowRight, Loader2
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useUrlApi } from '@/lib/use-api'

const CATEGORY_UI: Record<string, { icon: typeof Wind; color: string; desc: string }> = {
  'Air Conditioner': { icon: Wind, color: 'bg-cyan-100 text-cyan-600', desc: 'AC install, repair, service' },
  'Refrigerator': { icon: Refrigerator, color: 'bg-[#FFD54F]/10 text-[#0A1F44]', desc: 'Fridge repair, gas refill' },
  'Washing Machine': { icon: WashingMachine, color: 'bg-[#0A1F44]/10 text-[#0A1F44]', desc: 'Washer repair, service' },
  'Kitchen Appliances': { icon: Flame, color: 'bg-orange-100 text-orange-600', desc: 'Mixer, chimney, stove repair' },
  'TV Repair': { icon: Tv, color: 'bg-purple-100 text-purple-600', desc: 'LED, LCD, smart TV fix' },
  'Water Purifier': { icon: Droplets, color: 'bg-teal-100 text-teal-600', desc: 'RO install, service, filter' },
  'Geyser': { icon: Flame, color: 'bg-red-100 text-red-600', desc: 'Installation, repair, service' },
  'Plumber': { icon: Wrench, color: 'bg-[#FFD54F]/10 text-[#0A1F44]', desc: 'Pipes, leaks, installations' },
  'Electrician': { icon: Zap, color: 'bg-amber-100 text-amber-600', desc: 'Wiring, switches, fans' },
  'Water Tank Cleaning': { icon: Droplets, color: 'bg-emerald-100 text-emerald-600', desc: 'Tank cleaning, sanitize' },
  'Movers and Packers': { icon: Truck, color: 'bg-slate-100 text-slate-600', desc: 'House shifting, packing' },
}
const DEFAULT_CATEGORY_UI = { icon: Wrench, color: 'bg-slate-100 text-slate-600', desc: 'Professional home services' }

interface ApiCategory {
  id: number; name: string; slug: string; description: string | null;
  iconUrl: string | null; icon: string | null; displayOrder: number;
  subcategoriesCount: number; servicesCount: number;
}
interface CategoryWithUi {
  id: number; name: string; slug: string; desc: string; servicesCount: number;
  icon: typeof Wind; color: string;
}

export function CategoriesPage() {
  const { navigate } = useApp()

  const { data: catResponse, loading, error, refetch } = useUrlApi<{ categories: ApiCategory[]; total: number }>('/api/categories')

  const categories: CategoryWithUi[] = (catResponse?.categories ?? []).map((cat) => {
    const ui = CATEGORY_UI[cat.name] ?? DEFAULT_CATEGORY_UI
    return { id: cat.id, name: cat.name, slug: cat.slug, desc: cat.description ?? ui.desc, servicesCount: cat.servicesCount, icon: ui.icon, color: ui.color }
  })

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0A1F44] to-[#FFD54F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">All Service Categories</h1>
          <p className="text-[#FFD54F]/80 mb-6">Explore our range of professional home services</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              placeholder="Search categories..."
              className="pl-12 py-5 rounded-xl bg-white text-slate-900 shadow-lg border-0"
              aria-label="Search categories"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('search') }}
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{categories?.length ?? 0} Categories</h2>
            <p className="text-sm text-slate-500">Tap a category to explore services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Popular</Button>
            <Button variant="outline" size="sm">A–Z</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" role="status" aria-label="Loading categories">
            <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load categories</p>
            <Button variant="outline" onClick={refetch}>Retry</Button>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Card
                key={cat.name}
                className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate('service-listing', { category: cat.name })}
                role="button"
                tabIndex={0}
                aria-label={`${cat.name} - ${cat.desc}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('service-listing', { category: cat.name }) }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${cat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                      <cat.icon className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">{cat.name}</h3>
                        <ArrowRight className="size-4 text-slate-400 group-hover:text-[#0A1F44] transition-colors" />
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{cat.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Starting ₹99</Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          4.5+
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-20">No categories available at the moment.</p>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Card className="bg-gradient-to-r from-[#0A1F44] to-[#0A1F44] text-white rounded-2xl border-0">
          <CardContent className="p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Can&apos;t find what you need?</h2>
            <p className="text-blue-200 mb-5">Tell us your requirement and we&apos;ll connect you with the right professional.</p>
            <Button className="bg-white text-[#0A1F44] hover:bg-[#FFD54F]/10 font-semibold px-8" onClick={() => navigate('search')}>Search Services</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

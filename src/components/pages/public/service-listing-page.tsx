'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Search, Star, SlidersHorizontal, MapPin, Clock, ChevronDown,
  Grid3x3, List, Heart, ArrowUpDown, Filter, X, Loader2
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useMockApi } from '@/lib/use-api'
import { useCallback } from 'react'

const servicesData = [
  { id: '1', name: 'Air Conditioner', provider: 'CoolAir Solutions', rating: 4.8, reviews: 234, price: 499, category: 'Air Conditioner', image: '❄️', verified: true },
  { id: '2', name: 'Washing Machine Repair', provider: 'WashFix Pro', rating: 4.7, reviews: 189, price: 349, category: 'Washing Machine', image: '🫧', verified: true },
  { id: '3', name: 'Electrician - Wiring', provider: 'PowerTech Electric', rating: 4.7, reviews: 189, price: 299, category: 'Electrician', image: '⚡', verified: false },
  { id: '4', name: 'Plumber - Leak Fix', provider: 'AquaFix Experts', rating: 4.6, reviews: 167, price: 199, category: 'Plumber', image: '🔧', verified: true },
  { id: '5', name: 'RO Water Purifier Service', provider: 'PureFlow Services', rating: 4.4, reviews: 145, price: 349, category: 'Water Purifier', image: '💧', verified: true },
  { id: '6', name: 'TV Repair - LED/LCD', provider: 'ScreenFix Tech', rating: 4.5, reviews: 98, price: 399, category: 'TV Repair', image: '📺', verified: true },
  { id: '7', name: 'Refrigerator Repair', provider: 'CoolTech Services', rating: 4.6, reviews: 156, price: 399, category: 'Refrigerator', image: '🧊', verified: false },
  { id: '8', name: 'Geyser Installation', provider: 'HeatFix Experts', rating: 4.5, reviews: 112, price: 299, category: 'Geyser', image: '🔥', verified: true },
  { id: '9', name: 'Water Tank Cleaning', provider: 'AquaClean Pro', rating: 4.3, reviews: 87, price: 199, category: 'Water Tank Cleaning', image: '🪣', verified: false },
]

const filterOptions = {
  categories: ['All', 'Air Conditioner', 'Washing Machine', 'Electrician', 'Plumber', 'Water Purifier', 'TV Repair', 'Refrigerator', 'Geyser', 'Kitchen Appliances', 'Water Tank Cleaning', 'Movers and Packers'],
  priceRanges: ['All', 'Under ₹200', '₹200-₹300', '₹300-₹400', '₹400-₹499'],
  ratings: ['All', '4.5+', '4.0+', '3.5+'],
}

export function ServiceListingPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const { navigate } = useApp()

  const servicesLoader = useCallback(() => servicesData, [])
  const { data: services, loading, error } = useMockApi(servicesData, 700)

  const filteredServices = services?.filter((s) =>
    activeCategory === 'All' || s.category === activeCategory
  ) ?? []

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">All Services</h1>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input placeholder="Search services..." className="pl-10 rounded-xl border-slate-200" aria-label="Search services" />
            </div>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
              <SlidersHorizontal className="size-4" /> Filters
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl" aria-label="Sort services">
              <ArrowUpDown className="size-4" /> Sort
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 shrink-0`} aria-label="Filters">
            <Card className="bg-white rounded-xl shadow-sm border-slate-100 sticky top-4">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Filters</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-[#1D63FF]" onClick={() => setActiveCategory('All')}>Clear All</Button>
                </div>
                <Separator className="mb-4" />
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Category</h4>
                  <div className="flex flex-col gap-1.5">
                    {filterOptions.categories.map((c) => (
                      <button key={c} onClick={() => setActiveCategory(c)}
                        className={`text-sm px-3 py-1.5 rounded-lg text-left transition-colors ${activeCategory === c ? 'bg-blue-50 text-[#1D63FF] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Price Range</h4>
                  <div className="flex flex-col gap-1.5">
                    {filterOptions.priceRanges.map((p) => (
                      <button key={p} className="text-sm px-3 py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-50 transition-colors">{p}</button>
                    ))}
                  </div>
                </div>
                <Separator className="mb-4" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Rating</h4>
                  <div className="flex flex-col gap-1.5">
                    {filterOptions.ratings.map((r) => (
                      <button key={r} className="text-sm px-3 py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1">
                        {r !== 'All' && <Star className="size-3 fill-amber-400 text-amber-400" />} {r}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Service Cards */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20" role="status" aria-label="Loading services">
                <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
                <span className="sr-only">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 mb-4">Failed to load services</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">{filteredServices.length} services found</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon-sm" aria-label="Grid view"><Grid3x3 className="size-4" /></Button>
                    <Button variant="outline" size="icon-sm" aria-label="List view"><List className="size-4" /></Button>
                  </div>
                </div>
                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredServices.map((svc) => (
                      <Card key={svc.id} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-3xl" aria-hidden="true">{svc.image}</span>
                            <div className="flex items-center gap-2">
                              {svc.verified && <Badge className="bg-green-100 text-green-700 text-[10px] border-0">Verified</Badge>}
                              <Button variant="ghost" size="icon-xs" aria-label="Add to favorites"><Heart className="size-4 text-slate-400" /></Button>
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-900 group-hover:text-[#1D63FF] transition-colors">{svc.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{svc.provider}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-slate-900">{svc.rating}</span>
                            <span className="text-xs text-slate-500">({svc.reviews})</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="size-3" /> 1-2 hrs</span>
                            <span className="flex items-center gap-1"><MapPin className="size-3" /> Nearby</span>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">₹{svc.price}</span>
                            <Button size="sm" className="bg-[#1D63FF] hover:bg-[#0B3D91] text-white" onClick={() => navigate('service-detail', { id: svc.id })}>Book Now</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-20">No services found for this category.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

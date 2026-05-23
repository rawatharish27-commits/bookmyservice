'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Star, Clock, X, TrendingUp, History, Sparkles, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useMockApi } from '@/lib/use-api'
import { useCallback } from 'react'

const suggestionsData = ['Air Conditioner', 'Plumber', 'Electrician', 'Washing machine', 'Water purifier', 'TV repair']
const recentSearchesData = ['Air Conditioner near me', 'Plumber for leak', 'Electrician for wiring', 'Geyser repair']
const popularServicesData = [
  { name: 'Air Conditioner', provider: 'CoolAir Solutions', rating: 4.8, price: 499, image: '❄️' },
  { name: 'Washing Machine Repair', provider: 'WashFix Pro', rating: 4.7, price: 349, image: '🫧' },
  { name: 'Plumber - Leak Fix', provider: 'AquaFix Experts', rating: 4.6, price: 199, image: '🔧' },
  { name: 'Electrician - Wiring', provider: 'PowerTech Electric', rating: 4.7, price: 299, image: '⚡' },
  { name: 'Water Purifier Service', provider: 'PureFlow Services', rating: 4.4, price: 349, image: '💧' },
  { name: 'TV Repair', provider: 'ScreenFix Tech', rating: 4.5, price: 399, image: '📺' },
  { name: 'Refrigerator Repair', provider: 'CoolTech Services', rating: 4.6, price: 399, image: '🧊' },
  { name: 'Geyser Installation', provider: 'HeatFix Experts', rating: 4.5, price: 299, image: '🔥' },
]
const trendingSearchesData = ['Air Conditioner', 'Plumber near me', 'Electrician booking', 'Water purifier filter']

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { navigate } = useApp()

  const popularLoader = useCallback(() => popularServicesData, [])
  const { data: popularServices, loading } = useMockApi(popularServicesData, 700)

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Search Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Find Any Service</h1>
          <p className="text-blue-200 mb-6">Search from professional home services</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="What service are you looking for?"
              className="pl-12 pr-10 py-6 text-base rounded-2xl bg-white text-slate-900 shadow-xl border-0"
              aria-label="Search services"
            />
            {query && (
              <button onClick={() => { setQuery(''); setShowSuggestions(false) }} className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Clear search">
                <X className="size-4 text-slate-400" />
              </button>
            )}
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden" role="listbox" aria-label="Search suggestions">
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Suggestions</p>
                  {suggestionsData.filter(s => s.toLowerCase().includes(query.toLowerCase())).map((s) => (
                    <button key={s} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => { setQuery(s); setShowSuggestions(false) }} role="option">
                      <Search className="size-4 text-slate-400" /> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Recent Searches */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="size-5 text-slate-400" /> Recent Searches
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-slate-500">Clear All</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearchesData.map((s) => (
              <button key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                onClick={() => setQuery(s)}>
                <History className="size-3" /> {s}
              </button>
            ))}
          </div>
        </section>

        {/* Trending Searches */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
            <TrendingUp className="size-5 text-orange-500" /> Trending Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingSearchesData.map((s, i) => (
              <Badge key={s} variant="secondary" className="px-3 py-1.5 cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors text-sm">
                <span className="text-orange-500 font-bold mr-1">#{i + 1}</span> {s}
              </Badge>
            ))}
          </div>
        </section>

        <Separator />

        {/* Popular Services */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-amber-500" /> Popular Services
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-10" role="status" aria-label="Loading popular services">
              <Loader2 className="size-6 text-blue-600 animate-spin" />
              <span className="sr-only">Loading...</span>
            </div>
          ) : popularServices && popularServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularServices.map((svc) => (
                <Card key={svc.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('service-detail', { service: svc.name })}>
                  <CardContent className="p-4">
                    <span className="text-3xl" aria-hidden="true">{svc.image}</span>
                    <h3 className="font-bold text-slate-900 mt-2 text-sm">{svc.name}</h3>
                    <p className="text-xs text-slate-500">{svc.provider}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{svc.rating}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">₹{svc.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-10">No services available at the moment.</p>
          )}
        </section>
      </div>
    </div>
  )
}

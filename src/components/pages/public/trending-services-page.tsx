'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, ArrowUpRight, BarChart3, Flame, Clock, Users, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useMockApi } from '@/lib/use-api'
import { useCallback } from 'react'

const trendingData = [
  { name: 'AC Summer Service', category: 'Air Conditioner', rating: 4.8, growth: '+45%', bookings: 1240, rank: 1, image: '❄️', change: 'up' },
  { name: 'Plumber - Emergency', category: 'Plumber', rating: 4.6, growth: '+38%', bookings: 980, rank: 2, image: '🔧', change: 'up' },
  { name: 'Electrician - Safety', category: 'Electrician', rating: 4.7, growth: '+28%', bookings: 650, rank: 3, image: '⚡', change: 'up' },
  { name: 'Water Purifier Service', category: 'Water Purifier', rating: 4.4, growth: '+25%', bookings: 540, rank: 4, image: '💧', change: 'up' },
  { name: 'Washing Machine Repair', category: 'Washing Machine', rating: 4.7, growth: '+22%', bookings: 430, rank: 5, image: '🫧', change: 'up' },
  { name: 'TV Repair', category: 'TV Repair', rating: 4.5, growth: '+18%', bookings: 380, rank: 6, image: '📺', change: 'down' },
  { name: 'Refrigerator Service', category: 'Refrigerator', rating: 4.6, growth: '+15%', bookings: 320, rank: 7, image: '🧊', change: 'up' },
  { name: 'Geyser Installation', category: 'Geyser', rating: 4.5, growth: '+12%', bookings: 290, rank: 8, image: '🔥', change: 'down' },
]

export function TrendingServicesPage() {
  const { navigate } = useApp()

  const trendingLoader = useCallback(() => trendingData, [])
  const { data: trending, loading, error } = useMockApi(trendingData, 700)

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="size-6" />
            <Badge className="bg-white/20 text-white border-0 text-sm">This Week</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Trending Services</h1>
          <p className="text-purple-100">See what services are gaining popularity right now</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20" role="status" aria-label="Loading trending services">
            <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load trending services</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : trending && trending.length > 0 ? (
          <div className="space-y-3">
            {trending.map((svc) => (
              <Card key={svc.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('service-detail', { service: svc.name })}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                      svc.rank <= 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {svc.rank}
                    </div>
                    <span className="text-2xl shrink-0" aria-hidden="true">{svc.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 truncate">{svc.name}</h3>
                        {svc.rank <= 3 && <Badge className="bg-amber-100 text-amber-700 text-[10px] border-0">Hot</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{svc.category}</span>
                        <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {svc.rating}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {svc.bookings.toLocaleString()} bookings</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`flex items-center gap-1 text-sm font-bold ${svc.change === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        <ArrowUpRight className={`size-4 ${svc.change === 'down' && 'rotate-90'}`} />
                        {svc.growth}
                      </span>
                      <p className="text-xs text-slate-400">vs last week</p>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 shrink-0" onClick={(e) => { e.stopPropagation(); navigate('booking-checkout') }}>Book</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-20">No trending services available at the moment.</p>
        )}
      </div>
    </div>
  )
}

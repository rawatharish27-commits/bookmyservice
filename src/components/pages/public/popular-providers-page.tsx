'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, CheckCircle, MapPin, Heart, Award, Users, ThumbsUp, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useMockApi } from '@/lib/use-api'
import { useCallback } from 'react'

const providersData = [
  { name: 'CoolAir Solutions', service: 'Air Conditioner', rating: 4.9, reviews: 534, completed: 1520, experience: '8 yrs', avatar: '❄️', verified: true, topRated: true, distance: '1.2 km' },
  { name: 'PowerTech Electric', service: 'Electrician', rating: 4.8, reviews: 389, completed: 980, experience: '10 yrs', avatar: '⚡', verified: true, topRated: false, distance: '3.1 km' },
  { name: 'AquaFix Experts', service: 'Plumber', rating: 4.8, reviews: 367, completed: 1200, experience: '7 yrs', avatar: '🔧', verified: true, topRated: true, distance: '2.5 km' },
  { name: 'PureFlow Services', service: 'Water Purifier', rating: 4.6, reviews: 245, completed: 720, experience: '6 yrs', avatar: '💧', verified: true, topRated: false, distance: '7.2 km' },
  { name: 'WashFix Pro', service: 'Washing Machine', rating: 4.7, reviews: 203, completed: 870, experience: '4 yrs', avatar: '🫧', verified: false, topRated: false, distance: '3.8 km' },
  { name: 'ScreenFix Tech', service: 'TV Repair', rating: 4.5, reviews: 298, completed: 540, experience: '9 yrs', avatar: '📺', verified: true, topRated: false, distance: '6.7 km' },
]

export function PopularProvidersPage() {
  const { navigate } = useApp()

  const providersLoader = useCallback(() => providersData, [])
  const { data: providers, loading, error } = useMockApi(providersData, 700)

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-[#FFCE32] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="size-6" />
            <Badge className="bg-white/20 text-white border-0 text-sm">Top Performers</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Popular Providers</h1>
          <p className="text-emerald-100">Most trusted and highly rated service professionals</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20" role="status" aria-label="Loading providers">
            <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load providers</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {providers.map((p) => (
              <Card key={p.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-lg transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl" aria-hidden="true">{p.avatar}</div>
                    <div className="flex items-center gap-1.5">
                      {p.topRated && <Badge className="bg-amber-100 text-amber-700 text-[10px] border-0 gap-0.5"><Award className="size-3" /> Top</Badge>}
                      <Button variant="ghost" size="icon-xs" aria-label="Add to favorites"><Heart className="size-4 text-slate-400" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 truncate">{p.name}</h3>
                    {p.verified && <CheckCircle className="size-4 text-green-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{p.service}</p>

                  <div className="flex items-center gap-1 mt-2">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-slate-900">{p.rating}</span>
                    <span className="text-xs text-slate-500">({p.reviews} reviews)</span>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Jobs</p>
                      <p className="text-sm font-bold text-slate-900">{p.completed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Exp.</p>
                      <p className="text-sm font-bold text-slate-900">{p.experience}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Away</p>
                      <p className="text-sm font-bold text-slate-900">{p.distance}</p>
                    </div>
                  </div>

                  <Button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('service-detail', { provider: p.name })}>View Profile</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-20">No providers available at the moment.</p>
        )}
      </div>
    </div>
  )
}

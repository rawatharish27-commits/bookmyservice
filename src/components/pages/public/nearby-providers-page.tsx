'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MapPin, Star, Clock, Phone, Navigation, Filter, CheckCircle, Search } from 'lucide-react'

const providers = [
  { name: 'CoolAir Solutions', service: 'AC Service & Repair', rating: 4.8, reviews: 234, distance: '1.2 km', available: true, avatar: '🧑‍🔧', eta: '30 min' },
  { name: 'AquaFix Experts', service: 'Plumbing', rating: 4.6, reviews: 167, distance: '2.5 km', available: true, avatar: '🔧', eta: '45 min' },
  { name: 'PowerTech Electric', service: 'Electrical', rating: 4.7, reviews: 189, distance: '3.1 km', available: true, avatar: '⚡', eta: '40 min' },
  { name: 'SparkleClean Pro', service: 'Deep Cleaning', rating: 4.9, reviews: 512, distance: '4.0 km', available: false, avatar: '🏠', eta: '2 hrs' },
  { name: 'SecureView Tech', service: 'CCTV Installation', rating: 4.8, reviews: 76, distance: '5.3 km', available: true, avatar: '📷', eta: '1 hr' },
  { name: 'ColorCraft Studio', service: 'Interior Painting', rating: 4.5, reviews: 98, distance: '6.7 km', available: true, avatar: '🎨', eta: '1.5 hrs' },
  { name: 'PureFlow Services', service: 'RO Water Purifier', rating: 4.4, reviews: 145, distance: '7.2 km', available: false, avatar: '💧', eta: '3 hrs' },
]

export function NearbyProvidersPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Nearby Providers</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="size-3" /> Detecting your location...</p>
            </div>
            <Button variant="outline" className="gap-2"><Filter className="size-4" /> Filters</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input placeholder="Search providers nearby..." className="pl-10 rounded-xl border-slate-200" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="bg-white rounded-xl shadow-sm border-slate-100 overflow-hidden h-[500px]">
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative">
                <div className="text-center">
                  <Navigation className="size-12 text-blue-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Interactive Map</p>
                  <p className="text-sm text-slate-300">Map view showing nearby providers</p>
                </div>
                {/* Pin markers */}
                <div className="absolute top-[20%] left-[30%] w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg">1</div>
                <div className="absolute top-[40%] left-[50%] w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg">2</div>
                <div className="absolute top-[55%] left-[25%] w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">3</div>
                <div className="absolute top-[35%] left-[70%] w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg">4</div>
                <div className="absolute top-[65%] left-[60%] w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">5</div>
                {/* Current location */}
                <div className="absolute top-[45%] left-[45%] w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
              </div>
            </Card>
          </div>

          {/* Provider List */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <p className="text-sm text-slate-500 mb-2">{providers.length} providers found nearby</p>
            {providers.map((p, i) => (
              <Card key={p.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">{p.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                        <Badge className={`text-[10px] border-0 ${p.available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.available ? '● Available' : '○ Busy'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{p.service}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {p.rating} ({p.reviews})</span>
                        <span className="flex items-center gap-1 text-slate-500"><MapPin className="size-3" /> {p.distance}</span>
                        <span className="flex items-center gap-1 text-slate-500"><Clock className="size-3" /> {p.eta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Book</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Phone className="size-3" /> Call</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

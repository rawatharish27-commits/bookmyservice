'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, TrendingUp, ArrowUpRight, BarChart3, Flame, Clock, Users } from 'lucide-react'

const trending = [
  { name: 'AC Summer Service', category: 'HVAC', rating: 4.8, growth: '+45%', bookings: 1240, rank: 1, image: '❄️', change: 'up' },
  { name: 'Monsoon Plumbing Fix', category: 'Plumbing', rating: 4.6, growth: '+38%', bookings: 980, rank: 2, image: '🔧', change: 'up' },
  { name: 'Deep Home Cleaning', category: 'Cleaning', rating: 4.9, growth: '+32%', bookings: 870, rank: 3, image: '🏠', change: 'up' },
  { name: 'Electrical Safety Check', category: 'Electrical', rating: 4.7, growth: '+28%', bookings: 650, rank: 4, image: '⚡', change: 'up' },
  { name: 'Interior Painting', category: 'Painting', rating: 4.5, growth: '+22%', bookings: 540, rank: 5, image: '🎨', change: 'up' },
  { name: 'CCTV Installation', category: 'Security', rating: 4.8, growth: '+18%', bookings: 430, rank: 6, image: '📷', change: 'up' },
  { name: 'Car Detailing', category: 'Auto', rating: 4.7, growth: '+15%', bookings: 380, rank: 7, image: '🚗', change: 'down' },
  { name: 'RO Water Purifier', category: 'Appliance', rating: 4.4, growth: '+12%', bookings: 320, rank: 8, image: '💧', change: 'up' },
  { name: 'WiFi Setup', category: 'Networking', rating: 4.3, growth: '+10%', bookings: 290, rank: 9, image: '📶', change: 'down' },
  { name: 'Gardening Service', category: 'Garden', rating: 4.6, growth: '+8%', bookings: 210, rank: 10, image: '🌿', change: 'up' },
]

export function TrendingServicesPage() {
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
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white rounded-xl shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <BarChart3 className="size-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">5.9K</p>
              <p className="text-xs text-slate-500">Bookings this week</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <TrendingUp className="size-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">+25%</p>
              <p className="text-xs text-slate-500">Growth vs last week</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <Users className="size-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">3.2K</p>
              <p className="text-xs text-slate-500">New customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Trending List */}
        <div className="space-y-3">
          {trending.map((svc) => (
            <Card key={svc.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                    svc.rank <= 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {svc.rank}
                  </div>
                  {/* Icon */}
                  <span className="text-2xl shrink-0">{svc.image}</span>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 truncate">{svc.name}</h3>
                      {svc.rank <= 3 && <Badge className="bg-amber-100 text-amber-700 text-[10px] border-0">🔥 Hot</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{svc.category}</span>
                      <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {svc.rating}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {svc.bookings.toLocaleString()} bookings</span>
                    </div>
                  </div>
                  {/* Growth */}
                  <div className="text-right shrink-0">
                    <span className={`flex items-center gap-1 text-sm font-bold ${svc.change === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                      <ArrowUpRight className={`size-4 ${svc.change === 'down' && 'rotate-90'}`} />
                      {svc.growth}
                    </span>
                    <p className="text-xs text-slate-400">vs last week</p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 shrink-0">Book</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

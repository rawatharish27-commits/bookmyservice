'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, CheckCircle, MapPin, Clock, Heart, Award, Users, ThumbsUp } from 'lucide-react'

const providers = [
  { name: 'CoolAir Solutions', service: 'AC Service & Repair', rating: 4.9, reviews: 534, completed: 1520, experience: '8 yrs', avatar: '🧑‍🔧', verified: true, topRated: true, distance: '1.2 km' },
  { name: 'SparkleClean Pro', service: 'Deep Home Cleaning', rating: 4.9, reviews: 512, completed: 2100, experience: '6 yrs', avatar: '🏠', verified: true, topRated: true, distance: '4.0 km' },
  { name: 'PowerTech Electric', service: 'Electrical Services', rating: 4.8, reviews: 389, completed: 980, experience: '10 yrs', avatar: '⚡', verified: true, topRated: false, distance: '3.1 km' },
  { name: 'AquaFix Experts', service: 'Plumbing', rating: 4.8, reviews: 367, completed: 1200, experience: '7 yrs', avatar: '🔧', verified: true, topRated: true, distance: '2.5 km' },
  { name: 'SecureView Tech', service: 'CCTV & Security', rating: 4.7, reviews: 276, completed: 650, experience: '5 yrs', avatar: '📷', verified: true, topRated: false, distance: '5.3 km' },
  { name: 'ColorCraft Studio', service: 'Interior Painting', rating: 4.7, reviews: 298, completed: 540, experience: '9 yrs', avatar: '🎨', verified: true, topRated: false, distance: '6.7 km' },
  { name: 'AutoShine Pro', service: 'Car Detailing', rating: 4.6, reviews: 203, completed: 870, experience: '4 yrs', avatar: '🚗', verified: false, topRated: false, distance: '3.8 km' },
  { name: 'PureFlow Services', service: 'Water Purifier', rating: 4.6, reviews: 245, completed: 720, experience: '6 yrs', avatar: '💧', verified: true, topRated: false, distance: '7.2 km' },
]

export function PopularProvidersPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white py-10">
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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white rounded-xl shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <Users className="size-6 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">850+</p>
              <p className="text-xs text-slate-500">Verified Providers</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <ThumbsUp className="size-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">98%</p>
              <p className="text-xs text-slate-500">Satisfaction Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <Award className="size-6 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">4.8</p>
              <p className="text-xs text-slate-500">Avg. Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {providers.map((p) => (
            <Card key={p.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-lg transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">{p.avatar}</div>
                  <div className="flex items-center gap-1.5">
                    {p.topRated && <Badge className="bg-amber-100 text-amber-700 text-[10px] border-0 gap-0.5"><Award className="size-3" /> Top</Badge>}
                    <Button variant="ghost" size="icon-xs"><Heart className="size-4 text-slate-400" /></Button>
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

                <Button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700">View Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

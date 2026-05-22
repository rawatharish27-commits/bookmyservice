'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Clock, MapPin, Heart, Sparkles, TrendingUp, Zap } from 'lucide-react'

const featured = [
  { name: 'AC Summer Service', provider: 'CoolAir Solutions', rating: 4.8, reviews: 234, price: 599, originalPrice: 899, image: '❄️', discount: 33, tag: 'Summer Special' },
  { name: 'Deep Home Cleaning', provider: 'SparkleClean Pro', rating: 4.9, reviews: 512, price: 1299, originalPrice: 1799, image: '🏠', discount: 28, tag: 'Best Seller' },
  { name: 'Electrical Checkup', provider: 'PowerTech Electric', rating: 4.7, reviews: 189, price: 349, originalPrice: 499, image: '⚡', discount: 30, tag: 'Top Rated' },
  { name: 'Plumbing Emergency', provider: 'AquaFix Experts', rating: 4.6, reviews: 167, price: 399, originalPrice: 599, image: '🔧', discount: 33, tag: 'Urgent' },
  { name: 'Interior Painting', provider: 'ColorCraft Studio', rating: 4.5, reviews: 98, price: 2499, originalPrice: 3499, image: '🎨', discount: 29, tag: 'Premium' },
  { name: 'CCTV Installation', provider: 'SecureView Tech', rating: 4.8, reviews: 76, price: 1899, originalPrice: 2499, image: '📷', discount: 24, tag: 'Featured' },
  { name: 'RO Water Purifier', provider: 'PureFlow Services', rating: 4.4, reviews: 145, price: 349, originalPrice: 499, image: '💧', discount: 30, tag: 'Essential' },
  { name: 'Car Detailing', provider: 'AutoShine Pro', rating: 4.7, reviews: 203, price: 999, originalPrice: 1499, image: '🚗', discount: 33, tag: 'Weekend Offer' },
]

export function FeaturedServicesPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="size-6" />
            <Badge className="bg-white/20 text-white border-0 text-sm">Limited Time Offers</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Featured Services</h1>
          <p className="text-orange-100">Handpicked services with exclusive discounts and top ratings</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', 'Summer Special', 'Best Seller', 'Top Rated', 'Premium', 'Urgent'].map((f) => (
            <Button key={f} variant="outline" size="sm" className="rounded-full">{f}</Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featured.map((svc) => (
            <Card key={svc.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden">
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-red-500 text-white border-0 font-bold text-xs">{svc.discount}% OFF</Badge>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{svc.image}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      {svc.tag === 'Best Seller' && <TrendingUp className="size-3" />}
                      {svc.tag === 'Top Rated' && <Star className="size-3" />}
                      {svc.tag === 'Urgent' && <Zap className="size-3" />}
                      {svc.tag}
                    </Badge>
                    <Button variant="ghost" size="icon-xs"><Heart className="size-4 text-slate-400" /></Button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{svc.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{svc.provider}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-slate-900">{svc.rating}</span>
                  <span className="text-xs text-slate-500">({svc.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> 1-2 hrs</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> Nearby</span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg text-slate-900">₹{svc.price}</span>
                    <span className="text-sm text-slate-400 line-through ml-1">₹{svc.originalPrice}</span>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Book</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

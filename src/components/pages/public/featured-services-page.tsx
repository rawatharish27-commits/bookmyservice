'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Clock, MapPin, Heart, Sparkles, TrendingUp, Zap, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useUrlApi } from '@/lib/use-api'

const CATEGORY_EMOJI: Record<string, string> = {
  'Air Conditioner': '❄️', 'Refrigerator': '🧊', 'Washing Machine': '🫧',
  'Kitchen Appliances': '🍳', 'TV Repair': '📺', 'Water Purifier': '💧',
  'Geyser': '🔥', 'Plumber': '🔧', 'Electrician': '⚡',
  'Water Tank Cleaning': '🪣', 'Movers and Packers': '🚚',
}

const CATEGORY_TAG: Record<string, string> = {
  'Air Conditioner': 'Summer Special',
  'Plumber': 'Urgent',
  'Electrician': 'Top Rated',
  'Water Purifier': 'Essential',
  'Washing Machine': 'Best Seller',
  'TV Repair': 'Featured',
  'Geyser': 'Winter Ready',
  'Refrigerator': 'Weekend Offer',
}

interface ApiService {
  id: string; title: string; description: string | null; basePrice: number;
  averageRating: number; totalReviews: number; totalBookings: number; city: string | null;
  images: string | null; provider: { id: number; name: string; profileImageUrl: string | null };
  category: { id: number; name: string; slug: string };
}
interface FeaturedService {
  id: string; name: string; provider: string; rating: number; reviews: number;
  price: number; originalPrice: number; image: string; discount: number; tag: string;
}

export function FeaturedServicesPage() {
  const { navigate } = useApp()

  const { data: svcResponse, loading, error, refetch } = useUrlApi<{ services: ApiService[]; pagination: { total: number } }>('/api/services?limit=8')

  // Map API services to featured shape with discount and tag
  const featured: FeaturedService[] = (svcResponse?.services ?? []).map((svc, i) => ({
    id: svc.id, name: svc.title, provider: svc.provider.name, rating: svc.averageRating,
    reviews: svc.totalReviews, price: svc.basePrice, originalPrice: svc.basePrice,
    image: CATEGORY_EMOJI[svc.category.name] ?? '🔧',
    discount: Math.max(10, 30 - i * 3),
    tag: CATEGORY_TAG[svc.category.name] ?? 'Featured',
  }))

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
          {['All', 'Summer Special', 'Top Rated', 'Essential', 'Urgent'].map((f) => (
            <Button key={f} variant="outline" size="sm" className="rounded-full">{f}</Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" role="status" aria-label="Loading featured services">
            <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load featured services</p>
            <Button variant="outline" onClick={refetch}>Retry</Button>
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.map((svc) => (
              <Card key={svc.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-red-500 text-white border-0 font-bold text-xs">{svc.discount}% OFF</Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl" aria-hidden="true">{svc.image}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        {svc.tag === 'Best Seller' && <TrendingUp className="size-3" />}
                        {svc.tag === 'Top Rated' && <Star className="size-3" />}
                        {svc.tag === 'Urgent' && <Zap className="size-3" />}
                        {svc.tag}
                      </Badge>
                      <Button variant="ghost" size="icon-xs" aria-label="Add to favorites"><Heart className="size-4 text-slate-400" /></Button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#1D63FF] transition-colors">{svc.name}</h3>
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
                    </div>
                    <Button size="sm" className="bg-[#1D63FF] hover:bg-[#0B3D91] text-white" onClick={() => navigate('service-detail', { service: svc.name })}>Book</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-20">No featured services available at the moment.</p>
        )}
      </div>
    </div>
  )
}

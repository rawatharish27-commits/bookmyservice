'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Search, Wind, Zap, Droplets, Wrench, Tv, WashingMachine,
  Refrigerator, Flame, Truck, Star, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Users, Clock, Loader2
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useUrlApi, useApi } from '@/lib/use-api'

// UI config mapping: category name → icon component + color class
const CATEGORY_UI: Record<string, { icon: typeof Wind; color: string }> = {
  'Air Conditioner': { icon: Wind, color: 'bg-cyan-100 text-cyan-600' },
  'Refrigerator': { icon: Refrigerator, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  'Washing Machine': { icon: WashingMachine, color: 'bg-indigo-100 text-indigo-600' },
  'Kitchen Appliances': { icon: Flame, color: 'bg-orange-100 text-orange-600' },
  'TV Repair': { icon: Tv, color: 'bg-purple-100 text-purple-600' },
  'Water Purifier': { icon: Droplets, color: 'bg-teal-100 text-teal-600' },
  'Geyser': { icon: Flame, color: 'bg-red-100 text-red-600' },
  'Plumber': { icon: Wrench, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  'Electrician': { icon: Zap, color: 'bg-amber-100 text-amber-600' },
  'Water Tank Cleaning': { icon: Droplets, color: 'bg-emerald-100 text-emerald-600' },
  'Movers and Packers': { icon: Truck, color: 'bg-slate-100 text-slate-600' },
}
const DEFAULT_CATEGORY_UI = { icon: Wrench, color: 'bg-slate-100 text-slate-600' }

interface ApiCategory {
  id: number; name: string; slug: string; description: string | null;
  iconUrl: string | null; icon: string | null; displayOrder: number;
  subcategoriesCount: number; servicesCount: number;
}
interface CategoryWithUi {
  id: number; name: string; slug: string; servicesCount: number;
  icon: typeof Wind; color: string;
}

interface ApiService {
  id: string; title: string; description: string | null; basePrice: number;
  averageRating: number; totalReviews: number; city: string | null;
  images: string | null; provider: { id: number; name: string; profileImageUrl: string | null };
  category: { id: number; name: string; slug: string };
}

interface FeaturedService {
  id: string; name: string; provider: string; rating: number;
  reviews: number; price: number; image: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Air Conditioner': '❄️', 'Refrigerator': '🧊', 'Washing Machine': '🫧',
  'Kitchen Appliances': '🍳', 'TV Repair': '📺', 'Water Purifier': '💧',
  'Geyser': '🔥', 'Plumber': '🔧', 'Electrician': '⚡',
  'Water Tank Cleaning': '🪣', 'Movers and Packers': '🚚',
}

const testimonialData = [
  { name: 'Priya S.', text: 'Found an amazing plumber within minutes! The service was top-notch and the pricing was transparent.', rating: 5 },
  { name: 'Rahul M.', text: 'Booked Air Conditioner servicing before summer — the technician was punctual and very professional.', rating: 5 },
  { name: 'Anita K.', text: 'Best platform for home services. Easy booking, great providers, and excellent follow-up support.', rating: 4 },
]

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Loading content">
      <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function HomePage() {
  const { navigate } = useApp()

  // Fetch categories from real API
  const { data: catResponse, loading: catLoading, refetch: refetchCategories } = useUrlApi<{ categories: ApiCategory[]; total: number }>('/api/categories')

  // Fetch featured services from real API
  const { data: svcResponse, loading: featLoading, refetch: refetchFeatured } = useUrlApi<{ services: ApiService[]; pagination: { total: number } }>('/api/services?limit=4')

  // Testimonials are static marketing content — no API endpoint
  const { data: testimonials, loading: testLoading } = useApi(() => Promise.resolve(testimonialData), [])

  // Map API categories to component shape with UI config
  const categories: CategoryWithUi[] = (catResponse?.categories ?? []).map((cat) => {
    const ui = CATEGORY_UI[cat.name] ?? DEFAULT_CATEGORY_UI
    return { id: cat.id, name: cat.name, slug: cat.slug, servicesCount: cat.servicesCount, icon: ui.icon, color: ui.color }
  })

  // Map API services to featured service shape
  const featured: FeaturedService[] = (svcResponse?.services ?? []).map((svc) => ({
    id: svc.id, name: svc.title, provider: svc.provider.name, rating: svc.averageRating,
    reviews: svc.totalReviews, price: svc.basePrice, image: CATEGORY_EMOJI[svc.category.name] ?? '🔧',
  }))

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1D63FF] via-[#3B82F6] to-[#FFCE32] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-0">Trusted by 50,000+ customers</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Expert Home Services,<br />At Your Fingertips
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Connect with verified professionals for all your home service needs — from AC repair to plumbing, electrical to appliance servicing.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <Input
                placeholder="Search for services... e.g., AC repair, plumber, electrician"
                className="pl-12 pr-4 py-6 text-base rounded-2xl bg-white text-slate-900 shadow-xl border-0"
                aria-label="Search for services"
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('search') }}
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 bg-[#1D63FF] hover:bg-[#0B3D91] text-white"
                onClick={() => navigate('search')}
                aria-label="Search services"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Browse by Category</h2>
          <p className="text-slate-500 mt-2">Choose from our range of professional services</p>
        </div>
        {catLoading ? (
          <LoadingSkeleton />
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.name}
                className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('service-listing', { category: cat.name })}
                role="button"
                tabIndex={0}
                aria-label={`Browse ${cat.name} services`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('service-listing', { category: cat.name }) }}
              >
                <CardContent className="flex flex-col items-center gap-3 py-6">
                  <div className={`p-3 rounded-xl ${cat.color}`}>
                    <cat.icon className="size-6" />
                  </div>
                  <span className="font-semibold text-slate-900 text-sm text-center">{cat.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-10">No categories available at the moment.</p>
        )}
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Services</h2>
            <p className="text-slate-500 mt-1">Handpicked top-rated services for you</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Previous"><ChevronLeft className="size-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Next"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
        {featLoading ? (
          <LoadingSkeleton />
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((svc) => (
              <Card key={svc.id} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="text-4xl mb-3" aria-hidden="true">{svc.image}</div>
                  <h3 className="font-bold text-slate-900">{svc.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{svc.provider}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-900">{svc.rating}</span>
                    <span className="text-xs text-slate-500">({svc.reviews})</span>
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
          <p className="text-center text-slate-500 py-10">No featured services available at the moment.</p>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-2">Get your service done in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Search, title: 'Search Service', desc: 'Browse through our list of home services and find what you need.' },
              { step: '2', icon: Users, title: 'Choose Provider', desc: 'Compare ratings, reviews, and prices to pick the best professional.' },
              { step: '3', icon: CheckCircle, title: 'Get It Done', desc: 'Sit back and relax while our verified expert takes care of everything.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1D63FF]/10 text-[#1D63FF] flex items-center justify-center mx-auto mb-4">
                  <item.icon className="size-8" />
                </div>
                <div className="text-xs font-bold text-[#1D63FF] mb-1">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">What Our Customers Say</h2>
        {testLoading ? (
          <LoadingSkeleton />
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-white rounded-xl shadow-sm border-slate-100">
                <CardContent className="p-5">
                  <div className="flex gap-1 mb-3" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm mb-4">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1D63FF]/10 text-[#1D63FF] flex items-center justify-center text-xs font-bold" aria-hidden="true">
                      {t.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{t.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-[#1D63FF] to-[#FFCE32] rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">Join thousands of satisfied customers who trust us for their home service needs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-white text-[#1D63FF] hover:bg-blue-50 font-semibold px-8" onClick={() => navigate('categories')}>
              Book a Service <ArrowRight className="size-4 ml-1" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8" onClick={() => navigate('role-selection')}>
              Become a Provider
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

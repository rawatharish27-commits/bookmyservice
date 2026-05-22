'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Search, Wrench, Zap, Droplets, Paintbrush, Wind, Shield, Home, Car,
  Star, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Users, Clock
} from 'lucide-react'

const categories = [
  { icon: Wrench, name: 'Plumbing', count: 120, color: 'bg-blue-100 text-blue-600' },
  { icon: Zap, name: 'Electrical', count: 95, color: 'bg-amber-100 text-amber-600' },
  { icon: Paintbrush, name: 'Painting', count: 80, color: 'bg-purple-100 text-purple-600' },
  { icon: Wind, name: 'HVAC', count: 65, color: 'bg-cyan-100 text-cyan-600' },
  { icon: Shield, name: 'Security', count: 45, color: 'bg-red-100 text-red-600' },
  { icon: Home, name: 'Cleaning', count: 200, color: 'bg-green-100 text-green-600' },
  { icon: Car, name: 'Auto Repair', count: 55, color: 'bg-orange-100 text-orange-600' },
  { icon: Droplets, name: 'Water Purifier', count: 35, color: 'bg-teal-100 text-teal-600' },
]

const featured = [
  { name: 'AC Service & Repair', provider: 'CoolAir Solutions', rating: 4.8, reviews: 234, price: 599, image: '❄️' },
  { name: 'Deep Home Cleaning', provider: 'SparkleClean Pro', rating: 4.9, reviews: 512, price: 1299, image: '🏠' },
  { name: 'Electrical Wiring', provider: 'PowerTech Electric', rating: 4.7, reviews: 189, price: 449, image: '⚡' },
  { name: 'Plumbing Fix', provider: 'AquaFix Experts', rating: 4.6, reviews: 167, price: 399, image: '🔧' },
]

const testimonials = [
  { name: 'Priya S.', text: 'Found an amazing plumber within minutes! The service was top-notch and the pricing was transparent.', rating: 5 },
  { name: 'Rahul M.', text: 'Booked AC servicing before summer — the technician was punctual and very professional.', rating: 5 },
  { name: 'Anita K.', text: 'Best platform for home services. Easy booking, great providers, and excellent follow-up support.', rating: 4 },
]

export function HomePage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-0">🚀 Trusted by 50,000+ customers</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Expert Home Services,<br />At Your Fingertips
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Connect with verified professionals for all your home service needs — from plumbing to painting, electrical to cleaning.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <Input
                placeholder="Search for services... e.g., AC repair, plumbing, cleaning"
                className="pl-12 pr-4 py-6 text-base rounded-2xl bg-white text-slate-900 shadow-xl border-0"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 bg-blue-600 hover:bg-blue-700">
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
          <p className="text-slate-500 mt-2">Choose from a wide range of professional services</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center gap-3 py-6">
                <div className={`p-3 rounded-xl ${cat.color}`}>
                  <cat.icon className="size-6" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">{cat.name}</span>
                <span className="text-xs text-slate-500">{cat.count} Services</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Services</h2>
            <p className="text-slate-500 mt-1">Handpicked top-rated services for you</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon"><ChevronLeft className="size-4" /></Button>
            <Button variant="outline" size="icon"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((svc) => (
            <Card key={svc.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="text-4xl mb-3">{svc.image}</div>
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Book Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
              { step: '1', icon: Search, title: 'Search Service', desc: 'Browse through our extensive list of home services and find what you need.' },
              { step: '2', icon: Users, title: 'Choose Provider', desc: 'Compare ratings, reviews, and prices to pick the best professional.' },
              { step: '3', icon: CheckCircle, title: 'Get It Done', desc: 'Sit back and relax while our verified expert takes care of everything.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="size-8" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-1">STEP {item.step}</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-5">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm text-slate-900">{t.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">Join thousands of satisfied customers who trust us for their home service needs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">
              Book a Service <ArrowRight className="size-4 ml-1" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
              Become a Provider
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

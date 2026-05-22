'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Wrench, Zap, Paintbrush, Wind, Shield, Home, Car, Droplets,
  Wifi, TreePine, Hammer, Scissors, Search, Star, ArrowRight
} from 'lucide-react'

const categories = [
  { icon: Wrench, name: 'Plumbing', count: 120, color: 'bg-blue-100 text-blue-600', desc: 'Pipes, leaks, installations' },
  { icon: Zap, name: 'Electrical', count: 95, color: 'bg-amber-100 text-amber-600', desc: 'Wiring, switches, fans' },
  { icon: Paintbrush, name: 'Painting', count: 80, color: 'bg-purple-100 text-purple-600', desc: 'Interior, exterior, decor' },
  { icon: Wind, name: 'HVAC & AC', count: 65, color: 'bg-cyan-100 text-cyan-600', desc: 'AC repair, installation' },
  { icon: Shield, name: 'Security', count: 45, color: 'bg-red-100 text-red-600', desc: 'CCTV, alarms, locks' },
  { icon: Home, name: 'Cleaning', count: 200, color: 'bg-green-100 text-green-600', desc: 'Deep clean, sanitize' },
  { icon: Car, name: 'Auto Repair', count: 55, color: 'bg-orange-100 text-orange-600', desc: 'Car service, detailing' },
  { icon: Droplets, name: 'Water Purifier', count: 35, color: 'bg-teal-100 text-teal-600', desc: 'RO install, service' },
  { icon: Wifi, name: 'Networking', count: 40, color: 'bg-indigo-100 text-indigo-600', desc: 'WiFi, router, cabling' },
  { icon: TreePine, name: 'Gardening', count: 28, color: 'bg-emerald-100 text-emerald-600', desc: 'Landscape, maintenance' },
  { icon: Hammer, name: 'Carpentry', count: 60, color: 'bg-yellow-100 text-yellow-700', desc: 'Furniture, doors, windows' },
  { icon: Scissors, name: 'Salon at Home', count: 75, color: 'bg-pink-100 text-pink-600', desc: 'Hair, facial, grooming' },
]

export function CategoriesPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">All Service Categories</h1>
          <p className="text-blue-100 mb-6">Explore our comprehensive range of professional home services</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input placeholder="Search categories..." className="pl-12 py-5 rounded-xl bg-white text-slate-900 shadow-lg border-0" />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{categories.length} Categories</h2>
            <p className="text-sm text-slate-500">Tap a category to explore services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Popular</Button>
            <Button variant="outline" size="sm">A–Z</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Card key={cat.name} className="bg-white rounded-xl shadow-sm border-slate-100 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${cat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">{cat.name}</h3>
                      <ArrowRight className="size-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{cat.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{cat.count} services</Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        4.5+
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl border-0">
          <CardContent className="p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Can&apos;t find what you need?</h2>
            <p className="text-blue-200 mb-5">Tell us your requirement and we&apos;ll connect you with the right professional.</p>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">Request a Service</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

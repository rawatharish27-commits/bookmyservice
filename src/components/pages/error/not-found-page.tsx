'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Home,
  ArrowLeft,
  Compass,
  Wrench,
  Sparkles,
  ShoppingCart,
  Headphones,
  MapPin,
} from 'lucide-react'

const popularPages = [
  { icon: Wrench, label: 'Home Services', href: '#', tag: 'Popular' },
  { icon: Sparkles, label: 'Water Purifier', href: '#', tag: 'Popular' },
  { icon: ShoppingCart, label: 'My Bookings', href: '#', tag: null },
  { icon: Headphones, label: 'Support', href: '#', tag: null },
  { icon: MapPin, label: 'Nearby Providers', href: '#', tag: 'New' },
]

export function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1D63FF]/5 to-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main 404 Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          {/* Top decorative band */}
          <div className="h-2 bg-gradient-to-r from-blue-400 via-[#1D63FF] to-[#FFCE32]" />

          <CardContent className="p-8 text-center space-y-6">
            {/* Large 404 illustration */}
            <div className="relative">
              <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-blue-50 ring-4 ring-[#1D63FF]/20">
                <Compass className="size-14 text-[#1D63FF]" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1 left-1/2 ml-6">
                <span className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-lg font-bold">
                  ?
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
                4<span className="text-[#1D63FF]">0</span>4
              </h1>
              <h2 className="text-xl font-semibold text-slate-800">
                Page Not Found
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                Oops! It looks like this page has wandered off. Maybe it&apos;s out
                getting a service done. Let&apos;s help you find your way back.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services, pages..."
                className="pl-10 pr-4 py-5 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-2 rounded-xl py-5"
                onClick={() => (window.location.href = '/')}
              >
                <Home className="size-4" /> Go Home
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-slate-200 rounded-xl py-5"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="size-4" /> Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Pages */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Popular Pages
            </h3>
            <Separator />
            <div className="space-y-1">
              {popularPages.map((page) => (
                <button
                  key={page.label}
                  onClick={() => (window.location.href = page.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/60 transition-colors group text-left"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-[#1D63FF]/10 transition-colors">
                    <page.icon className="size-4 text-[#1D63FF]" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 flex-1">
                    {page.label}
                  </span>
                  {page.tag && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-50 text-[#1D63FF] hover:bg-[#1D63FF]/10"
                    >
                      {page.tag}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fun footer message */}
        <p className="text-center text-xs text-slate-400">
          Lost? Don&apos;t worry — even the best explorers take a wrong turn
          sometimes. 🧭
        </p>
      </div>
    </div>
  )
}

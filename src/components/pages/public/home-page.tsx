'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Search, Wind, Zap, Droplets, Wrench, Tv, WashingMachine,
  Refrigerator, Flame, Truck, Star, ArrowRight, CheckCircle, ChevronLeft, ChevronRight,
  Users, Clock, Loader2, Timer, BadgeCheck, ShieldCheck, Sparkles, Smartphone,
  Headphones, IndianRupee, RefreshCw, Activity, MapPin, Phone
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useUrlApi, useApi } from '@/lib/use-api'
import { cn } from '@/lib/utils'

// ─── BYS Brand Colors ─────────────────────────────────────────────────────────
// Primary: Navy Blue #0A1F44
// Accent: Golden Yellow #FFD54F
// Gold: #D4A017 | Gold Light: #E0B84C | Gold Card: #F2C94C | Gold Dark: #C99700
// Danger: #8B0000 | Font on gold: #000000 | Font on navy: #FFD54F

// UI config mapping: category name → icon component + BYS brand color class
const CATEGORY_UI: Record<string, { icon: typeof Wind; color: string; bgColor: string; textColor: string }> = {
  'Air Conditioner': { icon: Wind, color: 'from-[#F2C94C] to-[#E0B84C]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Refrigerator': { icon: Refrigerator, color: 'from-[#E0B84C] to-[#D4A017]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Washing Machine': { icon: WashingMachine, color: 'from-[#D4A017] to-[#C99700]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Kitchen Appliances': { icon: Flame, color: 'from-[#F2C94C] to-[#E0B84C]', bgColor: 'bg-[#8B0000]/90', textColor: 'text-white' },
  'TV Repair': { icon: Tv, color: 'from-[#E0B84C] to-[#D4A017]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Water Purifier': { icon: Droplets, color: 'from-[#D4A017] to-[#C99700]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Geyser': { icon: Flame, color: 'from-[#F2C94C] to-[#E0B84C]', bgColor: 'bg-[#8B0000]/90', textColor: 'text-white' },
  'Plumber': { icon: Wrench, color: 'from-[#E0B84C] to-[#D4A017]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Electrician': { icon: Zap, color: 'from-[#D4A017] to-[#C99700]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Water Tank Cleaning': { icon: Droplets, color: 'from-[#F2C94C] to-[#E0B84C]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
  'Movers and Packers': { icon: Truck, color: 'from-[#E0B84C] to-[#D4A017]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' },
}
const DEFAULT_CATEGORY_UI = { icon: Wrench, color: 'from-[#D4A017] to-[#C99700]', bgColor: 'bg-[#0A1F44]', textColor: 'text-[#FFD54F]' }

interface ApiCategory {
  id: number; name: string; slug: string; description: string | null;
  iconUrl: string | null; icon: string | null; displayOrder: number;
  subcategoriesCount: number; servicesCount: number;
}
interface CategoryWithUi {
  id: number; name: string; slug: string; servicesCount: number;
  icon: typeof Wind; color: string; bgColor: string; textColor: string;
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

// Palwal-specific testimonials
const testimonialData = [
  { name: 'Rajesh K.', area: 'HUDA Sector', service: 'AC Repair', text: 'AC service completed within 90 minutes! Technician was very professional. The cooling is now perfect.', rating: 5 },
  { name: 'Priya S.', area: 'Camp Colony', service: 'Plumber', text: 'Booked a plumber and was impressed by the quick response. Fixed the leakage issue in no time.', rating: 5 },
  { name: 'Amit M.', area: 'Railway Road', service: 'RO Service', text: 'Reliable and affordable. RO service was done same day. 3 months warranty gives peace of mind!', rating: 5 },
  { name: 'Sunita D.', area: 'Minar Gate', service: 'Electrician', text: 'Electrician came within 2 hours as promised. Very professional work. Highly recommend BookMyService!', rating: 5 },
  { name: 'Vikram T.', area: 'HUDA Sector', service: 'Washing Machine', text: 'My washing machine stopped working. Called BookMyService and technician fixed it the same day. Amazing!', rating: 4 },
  { name: 'Anita R.', area: 'Camp Colony', service: 'Geyser', text: 'Winter mein geyser kharab ho gaya. BookMyService ne 2 ghante mein technician bheja. Best service!', rating: 5 },
]

// Trust indicators matching page.tsx
const trustPoints = [
  { icon: Timer, text: 'Service Within 2 Hours', color: 'text-[#FFD54F]' },
  { icon: BadgeCheck, text: 'Verified Local Experts', color: 'text-[#FFD54F]' },
  { icon: IndianRupee, text: 'Affordable Fixed Pricing', color: 'text-[#FFD54F]' },
  { icon: ShieldCheck, text: '3 Months Service Warranty', color: 'text-[#FFD54F]' },
  { icon: RefreshCw, text: 'Free Revisit If Issue Remains', color: 'text-[#FFD54F]' },
]

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Loading content">
      <Loader2 className="size-8 text-[#D4A017] animate-spin" />
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

  // Map API categories to component shape with BYS UI config
  const categories: CategoryWithUi[] = (catResponse?.categories ?? []).map((cat) => {
    const ui = CATEGORY_UI[cat.name] ?? DEFAULT_CATEGORY_UI
    return { id: cat.id, name: cat.name, slug: cat.slug, servicesCount: cat.servicesCount, icon: ui.icon, color: ui.color, bgColor: ui.bgColor, textColor: ui.textColor }
  })

  // Map API services to featured service shape
  const featured: FeaturedService[] = (svcResponse?.services ?? []).map((svc) => ({
    id: svc.id, name: svc.title, provider: svc.provider.name, rating: svc.averageRating,
    reviews: svc.totalReviews, price: svc.basePrice, image: CATEGORY_EMOJI[svc.category.name] ?? '🔧',
  }))

  return (
    <div className="bg-[#D4A017] min-h-screen flex flex-col">

      {/* ─── Emergency Banner ───────────────────────────────────────────── */}
      <div className="bg-[#8B0000] text-white py-2.5 px-4 text-center overflow-hidden">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold flex-wrap whitespace-nowrap">
          <span className="animate-pulse">🚨</span>
          <span>Emergency Appliance & Home Service Available — Service Within 2 Hours</span>
          <span className="animate-pulse">🚨</span>
        </div>
      </div>

      {/* ─── Trust Counter Bar (Social Proof) ───────────────────────────── */}
      <section className="py-5 bg-[#C99700] border-b border-[#0A1F44]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Users, value: '1500+', label: 'Happy Customers', gradient: 'from-[#F2C94C] to-[#E0B84C]' },
              { icon: BadgeCheck, value: '250+', label: 'Verified Technicians', gradient: 'from-[#E0B84C] to-[#D4A017]' },
              { icon: CheckCircle, value: '5000+', label: 'Services Completed', gradient: 'from-[#D4A017] to-[#C99700]' },
              { icon: MapPin, value: 'Palwal', label: 'Available Across Palwal', gradient: 'from-[#F2C94C] to-[#E0B84C]' },
            ].map((item) => (
              <div key={item.label} className={cn('text-center p-4 rounded-2xl bg-gradient-to-br border border-[#0A1F44]/10 shadow-sm', item.gradient)}>
                <item.icon className="size-6 text-[#0A1F44] mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44]">{item.value}</p>
                <p className="text-xs text-[#0A1F44]/70 font-semibold mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Hero Section (Navy background with gold accents) ────────────── */}
      <section className="relative overflow-hidden bg-[#0A1F44]" aria-label="Hero section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,213,79,0.15),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(212,160,23,0.2),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD54F]/10 border border-[#FFD54F]/25 text-[#FFD54F] text-xs font-medium mb-6">
              <Sparkles className="size-3.5" /> Palwal&apos;s #1 Appliance & Home Service Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-4">
              Expert Home Services,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD54F] to-[#D4A017]">At Your Fingertips</span>
            </h1>

            {/* Sub Heading */}
            <p className="text-lg sm:text-xl text-[#E0B84C] leading-relaxed mb-6 max-w-2xl">
              AC Repair, RO Service, Electrician, TV Repair, Plumber & More — Service Within 2 Hours across Palwal
            </p>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-3 mb-8">
              {trustPoints.map((point) => (
                <div key={point.text} className="flex items-center gap-2 bg-[#FFD54F]/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#FFD54F]/15">
                  <point.icon className={cn('size-4', point.color)} />
                  <span className="text-xs sm:text-sm font-medium text-white">{point.text}</span>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#0A1F44]/50" />
              <Input
                placeholder="Search for services... e.g., AC repair, plumber, electrician"
                className="pl-12 pr-4 py-6 text-base rounded-2xl bg-white text-[#0A1F44] shadow-xl border-0 placeholder:text-[#0A1F44]/40"
                aria-label="Search for services"
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('search') }}
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 bg-[#0A1F44] hover:bg-[#132D5E] text-[#FFD54F] font-bold min-h-[44px]"
                onClick={() => navigate('search')}
                aria-label="Search services"
              >
                Search
              </Button>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#0A1F44] text-[#FFD54F] font-bold text-base hover:bg-[#132D5E] transition-all shadow-xl shadow-[#0A1F44]/25 hover:shadow-[#0A1F44]/40 hover:scale-[1.02] active:scale-[0.98] border border-[#FFD54F]/25 min-h-[44px]"
                onClick={() => navigate('categories')}
                aria-label="Get technician fast"
              >
                Get Technician Fast <ArrowRight className="size-5" />
              </Button>
              <Button
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#FFD54F]/10 border border-[#FFD54F]/25 text-[#FFD54F] font-semibold text-base hover:bg-[#FFD54F]/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
                onClick={() => navigate('role-selection')}
                aria-label="Start earning as a service provider"
              >
                <Wrench className="size-5" /> Start Earning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Grid (Gold card backgrounds with navy text) ────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20" aria-label="Service categories">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0A1F44]/10 text-[#0A1F44] text-xs font-semibold mb-4">OUR SERVICES</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight mb-4">
            Fast Appliance Repair & Essential Home Utility
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Professional services at affordable fixed prices. All technicians are background-verified and certified.
          </p>
        </div>
        {catLoading ? (
          <LoadingSkeleton />
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.name}
                className={cn(
                  'bg-gradient-to-br border border-[#0A1F44]/10 hover:border-[#0A1F44]/30 hover:shadow-xl hover:shadow-[#0A1F44]/10 transition-all duration-300 cursor-pointer min-h-[44px]',
                  cat.color
                )}
                onClick={() => navigate('service-listing', { category: cat.name })}
                role="button"
                tabIndex={0}
                aria-label={`Browse ${cat.name} services — ${cat.servicesCount} services available`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('service-listing', { category: cat.name }) }}
              >
                <CardContent className="flex flex-col items-center gap-3 py-6">
                  <div className={cn('p-3 rounded-xl', cat.bgColor)}>
                    <cat.icon className={cn('size-6', cat.textColor)} />
                  </div>
                  <span className="font-bold text-[#0A1F44] text-sm text-center">{cat.name}</span>
                  {cat.servicesCount > 0 && (
                    <span className="text-[10px] font-semibold text-[#0A1F44]/60">{cat.servicesCount} services</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-[#0A1F44]/60 mb-4">No categories available at the moment.</p>
            <Button
              variant="outline"
              onClick={() => refetchCategories()}
              className="border-[#0A1F44]/30 text-[#0A1F44] hover:bg-[#0A1F44]/10 min-h-[44px]"
              aria-label="Retry loading categories"
            >
              <RefreshCw className="size-4 mr-2" /> Retry
            </Button>
          </div>
        )}
      </section>

      {/* ─── Featured Services (Gold card backgrounds) ───────────────────── */}
      <section className="py-16 sm:py-20 bg-[#C99700]" aria-label="Featured services">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#0A1F44]/10 text-[#0A1F44] text-xs font-semibold mb-3">TOP RATED</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight">Featured Services</h2>
              <p className="text-black/70 mt-2">Handpicked top-rated services for you</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="icon" aria-label="Previous" className="border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/10 min-h-[44px] min-w-[44px]"><ChevronLeft className="size-4" /></Button>
              <Button variant="outline" size="icon" aria-label="Next" className="border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/10 min-h-[44px] min-w-[44px]"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          {featLoading ? (
            <LoadingSkeleton />
          ) : featured && featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((svc) => (
                <Card key={svc.id} className="bg-[#F2C94C] rounded-2xl border border-[#0A1F44]/10 hover:border-[#0A1F44]/30 hover:shadow-xl hover:shadow-[#0A1F44]/10 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="text-4xl mb-3" aria-hidden="true">{svc.image}</div>
                    <h3 className="font-bold text-[#0A1F44]">{svc.name}</h3>
                    <p className="text-sm text-[#0A1F44]/70 mt-1">{svc.provider}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="size-4 fill-[#D4A017] text-[#D4A017]" />
                      <span className="text-sm font-medium text-[#0A1F44]">{svc.rating}</span>
                      <span className="text-xs text-[#0A1F44]/60">({svc.reviews})</span>
                    </div>
                    <Separator className="my-3 bg-[#0A1F44]/10" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0A1F44]">₹{svc.price}</span>
                      <Button
                        size="sm"
                        className="bg-[#0A1F44] hover:bg-[#132D5E] text-[#FFD54F] font-bold min-h-[44px] px-4"
                        onClick={() => navigate('service-detail', { id: svc.id })}
                        aria-label={`Book ${svc.name} service`}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-[#0A1F44]/60 mb-4">No featured services available at the moment.</p>
              <Button
                variant="outline"
                onClick={() => refetchFeatured()}
                className="border-[#0A1F44]/30 text-[#0A1F44] hover:bg-[#0A1F44]/10 min-h-[44px]"
                aria-label="Retry loading featured services"
              >
                <RefreshCw className="size-4 mr-2" /> Retry
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ─── How It Works (Navy accent colors) ──────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#D4A017]" aria-label="How it works">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0A1F44]/10 text-[#0A1F44] text-xs font-semibold mb-4">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight mb-4">Book in 3 Simple Steps</h2>
            <p className="text-lg text-black/70 max-w-2xl mx-auto">Get your service done in minutes — from booking to completion</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', icon: Smartphone, title: 'Select Service', desc: 'Choose from 11 verified home services in Palwal' },
              { step: '2', icon: BadgeCheck, title: 'Technician Assigned', desc: 'Verified professional assigned within minutes' },
              { step: '3', icon: CheckCircle, title: 'Service Completed', desc: 'Quality work done at your doorstep with 3-month warranty' },
            ].map((item, idx) => (
              <div key={item.step} className="text-center relative">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#0A1F44] text-[#FFD54F] font-bold text-2xl mb-5 shadow-lg shadow-[#0A1F44]/30">
                  {item.step}
                </div>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[#0A1F44] to-[#FFD54F]/30" />
                )}
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-[#0A1F44]/10 mb-3">
                  <item.icon className="size-6 text-[#0A1F44]" />
                </div>
                <h3 className="font-bold text-[#0A1F44] text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[#0A1F44]/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust & Features Section ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#C99700]" aria-label="Why people trust us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0A1F44]/10 text-[#0A1F44] text-xs font-semibold mb-4">WHY PEOPLE TRUST US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight mb-4">
              Fast, Trusted & Local
            </h2>
            <p className="text-lg text-black/70 max-w-2xl mx-auto">
              Verified experts, honest pricing, and warranty-backed support — that&apos;s what sets us apart in Palwal.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: BadgeCheck, title: 'Verified Local Experts', desc: 'All technicians are background-verified and skill-certified for your safety' },
              { icon: IndianRupee, title: 'Affordable Fixed Pricing', desc: 'No hidden charges. Transparent pricing starting ₹99 for every service' },
              { icon: Timer, title: 'Service Within 2 Hours', desc: 'Fast response with same-day service guarantee across Palwal' },
              { icon: ShieldCheck, title: '3 Months Warranty', desc: 'Free revisit if any issue happens after service — no extra charge' },
              { icon: Headphones, title: 'Local Palwal Support', desc: 'Palwal-based support team for quick resolution of your concerns' },
              { icon: RefreshCw, title: 'Free Revisit Guarantee', desc: 'If the problem returns within warranty, we fix it again at no cost' },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl bg-[#F2C94C] border border-[#0A1F44]/8 hover:border-[#0A1F44]/20 hover:shadow-lg hover:shadow-[#0A1F44]/10 transition-all duration-300">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#0A1F44] mb-4">
                  <feature.icon className="size-7 text-[#FFD54F]" />
                </div>
                <h3 className="font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials (BYS themed) ───────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#D4A017]" aria-label="Customer testimonials">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0A1F44]/10 text-[#0A1F44] text-xs font-semibold mb-4">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight mb-4">What Palwal Says About Us</h2>
            <p className="text-lg text-black/70 max-w-2xl mx-auto">Real reviews from real customers in your area</p>
          </div>
          {testLoading ? (
            <LoadingSkeleton />
          ) : testimonials && testimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.name + t.service} className="bg-[#F2C94C] rounded-2xl border border-[#0A1F44]/10 hover:border-[#0A1F44]/20 hover:shadow-lg hover:shadow-[#0A1F44]/10 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex gap-1 mb-3" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-[#D4A017] text-[#D4A017]" />
                      ))}
                    </div>
                    <p className="text-black/80 text-sm mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <Separator className="my-3 bg-[#0A1F44]/10" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A1F44] text-[#FFD54F] flex items-center justify-center text-sm font-bold shrink-0" aria-hidden="true">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#0A1F44]">{t.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#0A1F44]/60">{t.area}</span>
                          <span className="text-[10px] font-semibold text-[#0A1F44]/50 bg-[#0A1F44]/5 px-2 py-0.5 rounded-full">{t.service}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── CTA Banner (Navy-to-gold gradient) ──────────────────────────── */}
      <section className="py-16 sm:py-20" aria-label="Call to action">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#0A1F44] rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,213,79,0.15),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">Ready to Get Started?</h2>
              <p className="text-[#E0B84C] mb-6 max-w-xl mx-auto">Join 1500+ satisfied Palwal families who trust us for their home service needs.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-[#0A1F44] text-[#FFD54F] hover:bg-[#0C1629] font-bold px-8 min-h-[44px] border border-[#FFD54F]/25 shadow-xl shadow-[#0A1F44]/30"
                  onClick={() => navigate('categories')}
                  aria-label="Book a service now"
                >
                  Book a Service <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button
                  className="bg-[#FFD54F] text-[#0A1F44] hover:bg-[#FFD54F] font-bold px-8 min-h-[44px] shadow-xl shadow-[#FFD54F]/25"
                  onClick={() => navigate('role-selection')}
                  aria-label="Become a service provider"
                >
                  Become a Provider
                </Button>
              </div>
              <p className="text-xs text-[#FFD54F]/50 mt-4 font-medium">✓ No advance payment ✓ Cancel anytime ✓ 100% satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Palwal Service Areas ────────────────────────────────────────── */}
      <section className="py-12 bg-[#C99700]" aria-label="Service areas in Palwal">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-lg font-bold text-[#0A1F44] mb-4">Serving All of Palwal</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['HUDA Sector', 'Camp Colony', 'Railway Road', 'Minar Gate', 'Old City', 'Industrial Area', 'Model Town', 'Subhash Colony'].map((area) => (
              <span key={area} className="px-4 py-2 rounded-full bg-[#F2C94C] text-[#0A1F44] text-sm font-medium border border-[#0A1F44]/10 hover:border-[#0A1F44]/30 hover:shadow-sm transition-all cursor-default">
                <MapPin className="size-3 inline mr-1" />{area}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

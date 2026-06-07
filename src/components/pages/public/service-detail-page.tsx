'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Star, MapPin, Clock, Shield, Heart, Share2, ChevronDown, ChevronUp,
  Phone, MessageCircle, CheckCircle, Users, Calendar, Loader2
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { useApi } from '@/lib/use-api'

const faqs = [
  { q: 'What is included in the basic service?', a: 'Basic service includes AC unit cleaning, filter check, and performance testing.' },
  { q: 'Do you provide a warranty?', a: 'Yes, premium service comes with a 30-day warranty on parts and labor.' },
  { q: 'How long does the service take?', a: 'Typically 1-2 hours depending on the AC type and service plan chosen.' },
  { q: 'Can I reschedule my booking?', a: 'Yes, you can reschedule up to 2 hours before the appointment at no extra cost.' },
]

interface ApiReview {
  id: string; rating: number; comment: string | null; createdAt: string;
  reviewer: { id: number; name: string; profileImageUrl: string | null };
}

interface ApiServiceDetail {
  id: string; title: string; description: string | null; basePrice: number;
  averageRating: number; totalReviews: number; totalBookings: number;
  images: string | null; city: string | null;
  provider: { id: number; name: string; profileImageUrl: string | null; city: string | null };
  category: { id: number; name: string; slug: string };
  reviews: ApiReview[];
}

interface MappedReview {
  name: string; rating: number; date: string; text: string;
}

interface MappedService {
  name: string; category: string; description: string;
  provider: { name: string; rating: number; reviews: number; experience: string; completed: number; avatar: string; verified: boolean };
  pricing: { plan: string; desc: string; price: number; popular: boolean }[];
}

export function ServiceDetailPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const { navigate, nav } = useApp()
  const serviceId = nav.params.id || nav.params.service || ''

  const { data: apiService, loading: svcLoading, refetch: refetchService } = useApi<ApiServiceDetail | null>(async () => {
    if (!serviceId) return null
    const res = await fetch(`/api/services/${encodeURIComponent(serviceId)}`)
    if (!res.ok) throw new Error('Failed to load service details')
    return res.json()
  }, [serviceId])

  // Map API service to component shape
  const service: MappedService | null = apiService ? {
    name: apiService.title,
    category: apiService.category.name,
    description: apiService.description ?? 'Professional home service by verified experts.',
    provider: {
      name: apiService.provider.name,
      rating: apiService.averageRating,
      reviews: apiService.totalReviews,
      experience: `${Math.max(1, Math.floor(apiService.totalBookings / 200))} yrs`,
      completed: apiService.totalBookings,
      avatar: '🔧',
      verified: apiService.averageRating >= 4.0,
    },
    pricing: [
      { plan: 'Basic Service', desc: 'Standard checkup and minor fixes', price: apiService.basePrice, popular: false },
      { plan: 'Standard Service', desc: 'Full service with parts inspection', price: Math.round(apiService.basePrice * 1.3), popular: true },
      { plan: 'Premium Service', desc: 'Complete service with warranty', price: Math.round(apiService.basePrice * 1.6), popular: false },
    ],
  } : null

  // Map API reviews to component shape
  const reviews: MappedReview[] = (apiService?.reviews ?? []).map((r) => ({
    name: r.reviewer.name,
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString(),
    text: r.comment ?? '',
  }))
  const revLoading = svcLoading

  if (svcLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading service details">
        <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Service not found</p>
          <Button onClick={() => navigate('service-listing')}>Browse Services</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Service Hero */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#FFD54F] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Badge className="bg-white/20 text-white border-0 mb-3">{service.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{service.name}</h1>
          <p className="text-[#FFD54F]/80 mb-4 max-w-2xl">{service.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" /> {service.provider.rating} ({service.provider.reviews} reviews)</span>
            <span className="flex items-center gap-1"><Clock className="size-4" /> 1-2 hours</span>
            <span className="flex items-center gap-1"><Shield className="size-4" /> Insured</span>
            <span className="flex items-center gap-1"><MapPin className="size-4" /> Serves within 15 km</span>
          </div>
          <div className="flex gap-3 mt-6">
            <Button className="bg-white text-[#0A1F44] hover:bg-[#FFD54F]/10 font-semibold px-8" onClick={() => navigate('booking-checkout')}>Book Now</Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" aria-label="Call provider">
              <Phone className="size-4" /> Call
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" aria-label="Chat with provider">
              <MessageCircle className="size-4" /> Chat
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Info */}
            <Card className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFD54F]/10 flex items-center justify-center text-2xl" aria-hidden="true">{service.provider.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{service.provider.name}</h3>
                      {service.provider.verified && <Badge className="bg-green-100 text-green-700 text-[10px] border-0">Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span>{service.provider.experience} exp</span>
                      <span>{service.provider.completed} jobs done</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" aria-label="Save to favorites"><Heart className="size-4" /></Button>
                    <Button variant="outline" size="icon" aria-label="Share service"><Share2 className="size-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Table */}
            <Card className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing Plans</h2>
                <div className="space-y-3">
                  {service.pricing.map((p) => (
                    <div key={p.plan} className={`p-4 rounded-xl border ${p.popular ? 'border-[#0A1F44] bg-[#FFD54F]/10/50' : 'border-slate-100'} relative`}>
                      {p.popular && <Badge className="absolute -top-2 right-4 bg-[#0A1F44] text-white border-0 text-[10px]">Most Popular</Badge>}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{p.plan}</h4>
                          <p className="text-sm text-slate-500">{p.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-slate-900">₹{p.price}</span>
                          <Button size="sm" className="ml-3 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white" onClick={() => navigate('booking-checkout')}>Select</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Reviews</h2>
                  <span className="text-sm text-slate-500">{service.provider.reviews} reviews</span>
                </div>
                {revLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="size-6 text-[#0A1F44] animate-spin" /></div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.name} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{r.name.charAt(0)}</div>
                            <span className="font-medium text-sm text-slate-900">{r.name}</span>
                          </div>
                          <span className="text-xs text-slate-400">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2" aria-label={`${r.rating} out of 5 stars`}>
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600">{r.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No reviews yet.</p>
                )}
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        aria-expanded={openFaq === i}
                        aria-controls={`faq-answer-${i}`}
                      >
                        <span className="font-medium text-sm text-slate-900">{faq.q}</span>
                        {openFaq === i ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                      </button>
                      {openFaq === i && (
                        <div id={`faq-answer-${i}`} className="px-4 pb-4 text-sm text-slate-600">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border-slate-100 sticky top-4">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Book This Service</h3>
                <div className="space-y-3">
                  <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 w-full text-left" onClick={() => navigate('booking-datetime')} aria-label="Select date">
                    <Calendar className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Select date</span>
                  </button>
                  <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 w-full text-left" onClick={() => navigate('booking-datetime')} aria-label="Select time">
                    <Clock className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Select time</span>
                  </button>
                  <Separator />
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Service fee</span><span className="text-slate-900">₹349</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="text-green-600">-₹50</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Total</span><span>₹299</span></div>
                  <Button className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white py-5" onClick={() => navigate('booking-checkout')}>Book Now</Button>
                  <p className="text-xs text-center text-slate-400">Free cancellation up to 2 hours before</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

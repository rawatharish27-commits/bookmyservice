'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Star, MapPin, Clock, Shield, Heart, Share2, ChevronDown, ChevronUp,
  Phone, MessageCircle, CheckCircle, Users, ThumbsUp, Calendar
} from 'lucide-react'
import { useState } from 'react'

const provider = { name: 'CoolAir Solutions', rating: 4.8, reviews: 234, experience: '8 yrs', completed: 1520, avatar: '🧑‍🔧', verified: true }
const pricing = [
  { plan: 'Basic Service', desc: 'AC cleaning & filter check', price: 599, popular: false },
  { plan: 'Standard Service', desc: 'Full cleaning, gas check, filter replacement', price: 999, popular: true },
  { plan: 'Premium Service', desc: 'Deep clean, gas refill, all parts check, warranty', price: 1499, popular: false },
]
const reviews = [
  { name: 'Priya S.', rating: 5, date: '2 days ago', text: 'Excellent service! The technician was very professional and fixed my AC in no time.' },
  { name: 'Rahul M.', rating: 4, date: '1 week ago', text: 'Good service overall. A bit late arrival but the work quality was great.' },
  { name: 'Sneha K.', rating: 5, date: '2 weeks ago', text: 'Best AC service I have ever had. Will definitely book again!' },
]
const faqs = [
  { q: 'What is included in the basic service?', a: 'Basic service includes AC unit cleaning, filter check, and performance testing.' },
  { q: 'Do you provide a warranty?', a: 'Yes, premium service comes with a 30-day warranty on parts and labor.' },
  { q: 'How long does the service take?', a: 'Typically 1-2 hours depending on the AC type and service plan chosen.' },
  { q: 'Can I reschedule my booking?', a: 'Yes, you can reschedule up to 2 hours before the appointment at no extra cost.' },
]

export function ServiceDetailPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Service Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Badge className="bg-white/20 text-white border-0 mb-3">HVAC & AC</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">AC Service & Repair</h1>
          <p className="text-blue-100 mb-4 max-w-2xl">Professional AC servicing, repair, and installation by certified technicians with years of experience.</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" /> {provider.rating} ({provider.reviews} reviews)</span>
            <span className="flex items-center gap-1"><Clock className="size-4" /> 1-2 hours</span>
            <span className="flex items-center gap-1"><Shield className="size-4" /> Insured</span>
            <span className="flex items-center gap-1"><MapPin className="size-4" /> Serves within 15 km</span>
          </div>
          <div className="flex gap-3 mt-6">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">Book Now</Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
              <Phone className="size-4" /> Call
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
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
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">{provider.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{provider.name}</h3>
                      {provider.verified && <Badge className="bg-green-100 text-green-700 text-[10px] border-0">✓ Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span>{provider.experience} exp</span>
                      <span>{provider.completed} jobs done</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon"><Heart className="size-4" /></Button>
                    <Button variant="outline" size="icon"><Share2 className="size-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Table */}
            <Card className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing Plans</h2>
                <div className="space-y-3">
                  {pricing.map((p) => (
                    <div key={p.plan} className={`p-4 rounded-xl border ${p.popular ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100'} relative`}>
                      {p.popular && <Badge className="absolute -top-2 right-4 bg-blue-600 text-white border-0 text-[10px]">Most Popular</Badge>}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{p.plan}</h4>
                          <p className="text-sm text-slate-500">{p.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-slate-900">₹{p.price}</span>
                          <Button size="sm" className="ml-3 bg-blue-600 hover:bg-blue-700">Select</Button>
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
                  <span className="text-sm text-slate-500">{provider.reviews} reviews</span>
                </div>
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
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">{r.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="bg-white rounded-xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span className="font-medium text-sm text-slate-900">{faq.q}</span>
                        {openFaq === i ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-4 text-sm text-slate-600">{faq.a}</div>
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
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200">
                    <Calendar className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Select date</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200">
                    <Clock className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Select time</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Service fee</span><span className="text-slate-900">₹999</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="text-green-600">-₹100</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Total</span><span>₹899</span></div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 py-5">Book Now</Button>
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

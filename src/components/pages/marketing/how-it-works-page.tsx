'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  CalendarCheck,
  Wrench,
  Star,
  ArrowRight,
  UserPlus,
  ClipboardCheck,
  IndianRupee,
  Users,
  CheckCircle2,
  ChevronRight,
  Quote,
} from 'lucide-react'

const customerSteps = [
  {
    step: 1,
    icon: Search,
    title: 'Search & Discover',
    description: 'Browse 200+ services or search for exactly what you need. Compare prices, read reviews, and choose the perfect service.',
    details: ['Search by service name or category', 'Filter by price, rating & distance', 'View detailed service descriptions', 'Check provider profiles & reviews'],
    color: 'from-[#1D63FF] to-[#0B3D91]',
    bg: 'bg-blue-50',
  },
  {
    step: 2,
    icon: CalendarCheck,
    title: 'Book Your Slot',
    description: 'Pick your preferred date, time, and service provider. Confirm your booking in just a few taps.',
    details: ['Choose date & time slot', 'Select your preferred provider', 'Add special instructions', 'Instant booking confirmation'],
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    step: 3,
    icon: Wrench,
    title: 'Get Service Done',
    description: 'A verified professional arrives at your doorstep on time. Track their arrival in real-time.',
    details: ['Real-time provider tracking', 'Live chat with your provider', 'All tools & materials included', 'Service quality guarantee'],
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
  },
  {
    step: 4,
    icon: Star,
    title: 'Review & Rate',
    description: 'After service completion, rate your experience and leave a review. Pay securely with your preferred method.',
    details: ['Rate your experience', 'Leave detailed feedback', 'Secure payment options', '30-day service warranty'],
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
  },
]

const providerSteps = [
  { step: 1, icon: UserPlus, title: 'Register & Verify', description: 'Sign up with basic details and complete KYC verification including ID proof and background check.' },
  { step: 2, icon: ClipboardCheck, title: 'Training & Assessment', description: 'Complete our skill assessment and training programme. Get certified to offer services on the platform.' },
  { step: 3, icon: CalendarCheck, title: 'Set Your Schedule', description: 'Choose your working hours and service areas. Accept bookings that match your availability.' },
  { step: 4, icon: IndianRupee, title: 'Earn & Grow', description: 'Complete jobs, earn money, and build your reputation. Top providers earn ₹80,000+/month.' },
]

const testimonials = [
  { name: 'Ananya Krishnan', city: 'Chennai', avatar: 'AK', color: 'bg-[#1D63FF]', rating: 5, text: 'I booked a Water Tank Cleaning service and was amazed at the quality. The professional was on time, courteous, and my water tank looked brand new. Will definitely book again!', service: 'Water Tank Cleaning' },
  { name: 'Rohit Verma', city: 'Delhi', avatar: 'RV', color: 'bg-emerald-600', rating: 5, text: 'The Air Conditioner repair was done in under an hour. The technician was skilled and even explained what went wrong. Fair pricing, no hidden charges. Very impressed!', service: 'Air Conditioner' },
  { name: 'Sunita Joshi', city: 'Pune', avatar: 'SJ', color: 'bg-purple-600', rating: 5, text: 'As a working professional, I rarely have time for home maintenance. BookMyService has been a lifesaver. Getting my Geyser repaired at home is so convenient!', service: 'Geyser' },
  { name: 'Mohammed Faisal', city: 'Hyderabad', avatar: 'MF', color: 'bg-orange-600', rating: 4, text: 'Great platform for finding reliable electricians. The booking process is smooth and I love the real-time tracking feature. Highly recommended!', service: 'Electrician' },
]

const whyChoose = [
  { title: 'Verified Professionals', description: 'Every provider is background-checked and skill-verified', icon: CheckCircle2 },
  { title: 'Transparent Pricing', description: 'No hidden charges. See exact prices before booking', icon: IndianRupee },
  { title: 'On-Time Guarantee', description: 'If we\'re late, you get ₹100 credit automatically', icon: CalendarCheck },
  { title: 'Quality Assurance', description: '30-day warranty on all repair services', icon: Star },
]

export function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer')

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D63FF] via-[#0B3D91] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 mb-4">How It Works</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Simple. Reliable. <span className="text-blue-200">Effortless.</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Get professional home services in 4 simple steps — or join as a provider and start earning.
          </p>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="flex justify-center gap-2">
          <Button
            size="lg"
            className={activeTab === 'customer' ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'}
            onClick={() => setActiveTab('customer')}
          >
            <Users className="size-4 mr-2" /> For Customers
          </Button>
          <Button
            size="lg"
            className={activeTab === 'provider' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'}
            onClick={() => setActiveTab('provider')}
          >
            <Wrench className="size-4 mr-2" /> For Providers
          </Button>
        </div>
      </section>

      {/* Customer Steps */}
      {activeTab === 'customer' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">How to Book a Service</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From search to service completion in just 4 easy steps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerSteps.map((step, idx) => (
              <div key={step.step} className="relative">
                {idx < customerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 z-10">
                    <ArrowRight className="size-5 text-slate-300" />
                  </div>
                )}
                <Card className="shadow-sm border-0 h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {step.step}
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center`}>
                        <step.icon className="size-5 text-slate-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-xs text-slate-500">
                          <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Provider Steps */}
      {activeTab === 'provider' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">How to Start Earning</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Join thousands of professionals earning on BookMyService</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providerSteps.map((step, idx) => (
              <div key={step.step} className="relative">
                {idx < providerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 z-10">
                    <ArrowRight className="size-5 text-slate-300" />
                  </div>
                )}
                <Card className="shadow-sm border-0 h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <step.icon className="size-5 text-emerald-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Why Choose BookMyService?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whyChoose.map((item) => (
            <Card key={item.title} className="shadow-sm border-0 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="size-6 text-[#1D63FF]" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">What Our Customers Say</h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="shadow-sm border-0">
              <CardContent className="p-6">
                <Quote className="size-8 text-blue-200 mb-3" />
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{t.text}</p>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className={`${t.color} text-white text-xs font-semibold`}>{t.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.city} • {t.service}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1D63FF] to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid sm:grid-cols-2 gap-8 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-bold mb-3">Ready to Book?</h2>
              <p className="text-blue-100 mb-5">Get professional home services at your doorstep today.</p>
              <Button size="lg" variant="secondary">
                Book Now <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Want to Earn?</h2>
              <p className="text-emerald-100 mb-5">Join as a service provider and start earning ₹25,000+/month.</p>
              <Button size="lg" variant="secondary">
                Join as Provider <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

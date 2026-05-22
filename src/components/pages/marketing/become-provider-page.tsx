'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  IndianRupee,
  Clock,
  Shield,
  GraduationCap,
  Wrench,
  Users,
  Star,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Zap,
  Heart,
  Award,
  BadgeCheck,
  Truck,
  Headphones,
  ArrowRight,
  Calculator,
} from 'lucide-react'

const benefits = [
  { icon: IndianRupee, title: 'Competitive Earnings', description: 'Earn ₹25,000-₹80,000+ per month. You keep 80% of every booking. Top providers earn even more with bonuses.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Clock, title: 'Flexible Schedule', description: 'Choose your own working hours. Work full-time or part-time — you decide when and how much you want to work.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Shield, title: 'Insurance & Safety', description: 'Free accident insurance up to ₹5 lakhs. Health insurance options. Safe working environment guaranteed.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: GraduationCap, title: 'Free Training', description: 'Professional skill training and certification programmes at no cost. Upskill and increase your earning potential.', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Truck, title: 'Equipment Support', description: 'Subsidised tools and equipment. EMI options for purchasing vehicles. Everything you need to deliver great service.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { icon: Headphones, title: 'Dedicated Support', description: '24/7 provider support helpline. Quick resolution of disputes. A dedicated relationship manager for top performers.', color: 'text-rose-600', bg: 'bg-rose-50' },
]

const onboardingSteps = [
  { step: 1, title: 'Apply Online', description: 'Fill out the registration form with your personal details, service category, and preferred work area.', icon: Users },
  { step: 2, title: 'Document Verification', description: 'Submit Aadhaar, PAN, and address proof. Complete police verification and background check.', icon: BadgeCheck },
  { step: 3, title: 'Skill Assessment', description: 'Take a practical skill test at our nearest centre. Our experts evaluate your service capabilities.', icon: Award },
  { step: 4, title: 'Training Programme', description: 'Complete our 3-day training covering service standards, app usage, customer handling, and safety protocols.', icon: GraduationCap },
  { step: 5, title: 'Start Earning', description: 'Once approved, set your availability and start receiving booking requests. Your earning journey begins!', icon: TrendingUp },
]

const requirements = [
  'Age between 18-55 years',
  'Valid Aadhaar Card & PAN Card',
  'Smartphone with internet connection',
  'Minimum 1 year experience in chosen service',
  'Own tools and equipment (or willing to purchase)',
  'No criminal record (police verification required)',
  'Willingness to undergo training',
  'Bank account for receiving payments',
]

const successStories = [
  { name: 'Ramesh Kumar', avatar: 'RK', color: 'bg-blue-600', service: 'Plumber', city: 'Bengaluru', earnings: '₹65,000/month', story: 'I was struggling to find consistent work before joining BookMyService. Now I earn over ₹65,000 a month with a steady stream of bookings. The training improved my skills and the flexible hours let me balance family time.' },
  { name: 'Sunita Devi', avatar: 'SD', color: 'bg-emerald-600', service: 'Beauty Professional', city: 'Delhi', earnings: '₹55,000/month', story: 'As a single mother, I needed flexible working hours. BookMyService gave me the freedom to choose my schedule and earn a dignified livelihood. The safety features make me feel secure visiting customers\' homes.' },
  { name: 'Arjun Patel', avatar: 'AP', color: 'bg-purple-600', service: 'Electrician', city: 'Ahmedabad', earnings: '₹72,000/month', story: 'From earning ₹15,000 doing odd jobs to ₹72,000 a month — BookMyService changed my life. The insurance coverage and equipment support have been invaluable. I\'ve even hired 2 assistants now!' },
]

export function BecomeProviderPage() {
  const [serviceCategory, setServiceCategory] = useState('')
  const [city, setCity] = useState('')
  const [bookingsPerDay, setBookingsPerDay] = useState('3')

  const avgBookingValue = 800
  const providerShare = 0.80
  const estimatedMonthly = Math.round(Number(bookingsPerDay) * avgBookingValue * providerShare * 26)

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-emerald-500/30 text-emerald-100 border-emerald-400/30 mb-4">Become a Provider</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Turn Your Skills Into <br />
              <span className="text-emerald-200">A Thriving Livelihood</span>
            </h1>
            <p className="text-emerald-100 text-lg sm:text-xl leading-relaxed mb-8">
              Join 50,000+ service providers earning ₹25,000-₹80,000+ per month on BookMyService.
              Flexible hours, steady income, and complete support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="secondary" className="text-base">
                Apply Now — It&apos;s Free <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                Watch Success Stories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: '50,000+', label: 'Active Providers', icon: Users },
            { value: '₹45K', label: 'Avg. Monthly Earnings', icon: IndianRupee },
            { value: '4.7★', label: 'Provider Satisfaction', icon: Star },
            { value: '120+', label: 'Cities Available', icon: Wrench },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-md border-0 text-center">
              <CardContent className="py-5">
                <stat.icon className="size-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Why Join BookMyService?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Everything you need to build a successful career as a service professional</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${benefit.bg} flex items-center justify-center mb-4`}>
                  <benefit.icon className={`size-6 ${benefit.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="shadow-sm border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="size-6" />
              <h2 className="text-2xl font-bold">Earnings Calculator</h2>
            </div>
            <p className="text-emerald-100">See how much you could earn as a BookMyService provider</p>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Service Category</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="beauty">Beauty & Wellness</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="painting">Painting</option>
                  <option value="appliance">Appliance Repair</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Your City</label>
                <Input placeholder="e.g., Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bookings Per Day</label>
                <Input type="number" min="1" max="10" value={bookingsPerDay} onChange={(e) => setBookingsPerDay(e.target.value)} />
              </div>
            </div>
            <Separator className="mb-6" />
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Estimated Monthly Earnings</p>
              <p className="text-4xl sm:text-5xl font-bold text-emerald-600">₹{estimatedMonthly.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2">*Based on avg. booking value of ₹{avgBookingValue} & your 80% share, 26 working days</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Onboarding Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">How to Get Started</h2>
          <p className="text-slate-500 max-w-xl mx-auto">A simple 5-step onboarding process — you could be earning within a week!</p>
        </div>
        <div className="space-y-4">
          {onboardingSteps.map((step, idx) => (
            <Card key={step.step} className="shadow-sm border-0">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      {idx === onboardingSteps.length - 1 && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Start Earning!</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                  <step.icon className="size-5 text-emerald-400 shrink-0 hidden sm:block" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Requirements Checklist */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl">Requirements to Join</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {requirements.map((req) => (
                <div key={req} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Provider Success Stories</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Real stories from real providers who transformed their lives</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {successStories.map((story) => (
            <Card key={story.name} className="shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="size-12">
                    <AvatarFallback className={`${story.color} text-white font-semibold`}>{story.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{story.name}</p>
                    <p className="text-xs text-slate-400">{story.service} • {story.city}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 mb-3">{story.earnings}</Badge>
                <p className="text-sm text-slate-600 leading-relaxed">{story.story}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Start Your Journey?</h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
            Join 50,000+ providers who are already building better lives with BookMyService. Registration is free!
          </p>
          <Button size="lg" variant="secondary" className="text-base">
            Apply Now — Free Registration <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </section>
    </div>
  )
}

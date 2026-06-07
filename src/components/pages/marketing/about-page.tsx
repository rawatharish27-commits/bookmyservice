'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Briefcase,
  MapPin,
  CalendarCheck,
  Target,
  Eye,
  Heart,
  Shield,
  Zap,
  Award,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Share2,
} from 'lucide-react'

const stats = [
  { label: 'Happy Customers', value: '25 Lakh+', icon: Users, color: 'text-[#0A1F44]', bg: 'bg-[#FFD54F]/10' },
  { label: 'Service Providers', value: '50,000+', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Cities Covered', value: '120+', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Bookings Completed', value: '1 Crore+', icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
]

const values = [
  { icon: Heart, title: 'Customer First', description: 'Every decision we make starts with the question: "How does this help our customers?"' },
  { icon: Shield, title: 'Trust & Safety', description: 'Background-verified providers, insured services, and secure payments for complete peace of mind.' },
  { icon: Zap, title: 'Speed & Reliability', description: 'From booking to service completion, we ensure fast turnaround and consistent quality.' },
  { icon: Award, title: 'Quality Excellence', description: 'Rigorous quality checks, training programmes, and a 4.8+ average rating across services.' },
  { icon: Globe, title: 'Accessibility', description: 'Making professional services available to every Indian household, from metros to tier-3 cities.' },
  { icon: Target, title: 'Impact-Driven', description: 'Creating livelihood opportunities for thousands while solving everyday problems for millions.' },
]

const team = [
  { name: 'Rajesh Sharma', role: 'Founder & CEO', initials: 'RS', color: 'bg-[#0A1F44]' },
  { name: 'Priya Patel', role: 'Co-Founder & COO', initials: 'PP', color: 'bg-emerald-600' },
  { name: 'Arun Kumar', role: 'Chief Technology Officer', initials: 'AK', color: 'bg-purple-600' },
  { name: 'Sneha Reddy', role: 'VP of Operations', initials: 'SR', color: 'bg-orange-600' },
  { name: 'Vikram Singh', role: 'VP of Marketing', initials: 'VS', color: 'bg-rose-600' },
  { name: 'Anita Desai', role: 'Head of Customer Success', initials: 'AD', color: 'bg-cyan-600' },
  { name: 'Karthik Iyer', role: 'Head of Product', initials: 'KI', color: 'bg-amber-600' },
  { name: 'Meera Joshi', role: 'Head of HR', initials: 'MJ', color: 'bg-[#0A1F44]' },
]

const milestones = [
  { year: '2018', event: 'Founded in Bengaluru with 3 service categories' },
  { year: '2019', event: 'Expanded to 10 cities, crossed 1 lakh bookings' },
  { year: '2020', event: 'Series A funding of ₹50 Cr, launched hygiene services' },
  { year: '2021', event: 'Expanded to 50+ cities, 10,000 providers on-boarded' },
  { year: '2022', event: 'Series B funding, crossed 50 lakh customers' },
  { year: '2023', event: '120+ cities, launched AMC plans & wallet features' },
  { year: '2024', event: '1 Crore+ bookings, partnered with 50,000+ providers' },
  { year: '2025', event: 'Expanded to tier-3 cities, AI-powered service matching' },
]

export function AboutPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-[#FFD54F]/100/30 text-[#FFD54F]/80 border-blue-400/30 mb-4">About Us</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Making Home Services <br />
              <span className="text-blue-200">Effortless for Every Indian</span>
            </h1>
            <p className="text-[#FFD54F]/80 text-lg sm:text-xl leading-relaxed">
              BookMyService was born from a simple idea — every Indian household deserves
              reliable, affordable, and professional home services at their fingertips.
              We connect millions of customers with skilled service providers across India.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-[#FFD54F]/10 flex items-center justify-center mb-2">
                <Target className="size-6 text-[#0A1F44]" />
              </div>
              <CardTitle className="text-xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                To democratise access to quality home services across India by empowering
                skilled professionals with technology, training, and fair earning opportunities
                while delivering exceptional experiences to every customer.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
                <Eye className="size-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                To become India&apos;s most trusted platform for home services, creating
                a thriving ecosystem where every service professional can build a dignified
                livelihood and every household can access reliable services within minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-sm border-0 text-center">
              <CardContent className="pt-6 pb-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`size-7 ${stat.color}`} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                In 2018, our founder Rajesh Sharma struggled to find a reliable plumber in Bengaluru.
                After days of asking neighbours, calling random numbers, and dealing with no-shows,
                he realised that India&apos;s massive unorganised home services sector needed a technology-led
                transformation.
              </p>
              <p>
                Starting with just 3 categories — plumber, electrician, and water tank cleaning — from a small
                office in Koramangala, Bengaluru, BookMyService set out to bring trust, transparency,
                and convenience to an industry that had none.
              </p>
              <p>
                Today, we operate across 120+ cities with over 50,000 trained and verified service
                providers, completing more than 1 crore bookings. But our journey has only just begun.
                We are committed to reaching every corner of India and making quality home services
                a right, not a privilege.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Timeline / Milestones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 sm:-translate-x-0.5" />
          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <div key={milestone.year} className={`relative flex items-start gap-4 ${idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-[#0A1F44] border-2 border-white shadow -translate-x-1.5 sm:-translate-x-1.5 mt-1.5" />
                <div className={`ml-10 sm:ml-0 sm:w-1/2 ${idx % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'}`}>
                  <Card className="shadow-sm border-0 inline-block">
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-1">{milestone.year}</Badge>
                      <p className="text-sm text-slate-600">{milestone.event}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Our Core Values</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">The principles that guide everything we do at BookMyService</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {values.map((value) => (
            <Card key={value.title} className="shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[#FFD54F]/10 flex items-center justify-center mb-4">
                  <value.icon className="size-6 text-[#0A1F44]" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Leadership Team</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Meet the people driving BookMyService&apos;s mission forward</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {team.map((member) => (
            <Card key={member.name} className="shadow-sm border-0 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Avatar className="size-16 mx-auto mb-3">
                  <AvatarFallback className={`${member.color} text-white text-lg font-semibold`}>
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-slate-900 text-sm">{member.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="max-w-7xl mx-auto" />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Want to Be Part of Our Story?</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">
          Whether you&apos;re a customer looking for reliable services or a professional seeking new opportunities, we&apos;d love to have you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white">
            <Phone className="size-4 mr-2" /> Book a Service
          </Button>
          <Button size="lg" variant="outline">
            <Briefcase className="size-4 mr-2" /> Join as Provider
          </Button>
        </div>
      </section>

      {/* Footer info */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Head Office</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                BookMyService Technologies Pvt. Ltd.<br />
                3rd Floor, KR Puram<br />
                Bengaluru, Karnataka 560036
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <div className="space-y-1 text-sm text-slate-400">
                <p className="flex items-center gap-2"><Phone className="size-3.5" /> +91 1800-123-4567</p>
                <p className="flex items-center gap-2"><Mail className="size-3.5" /> hello@bookmyservice.in</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Follow Us</h3>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <ExternalLink className="size-4" />
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <Share2 className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  IndianRupee,
  Handshake,
  TrendingUp,
  Users,
  Shield,
  Headphones,
  Award,
  Building2,
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react'

const benefits = [
  { icon: IndianRupee, title: 'Attractive Commissions', description: 'Earn 8-15% commission on every booking through your network. Monthly payouts directly to your bank account.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Shield, title: 'Brand Partnership', description: 'Leverage the BookMyService brand — one of India\'s most trusted home service platforms with nationwide recognition.', color: 'text-[#1D63FF]', bg: 'bg-blue-50' },
  { icon: Headphones, title: 'Dedicated Support', description: 'Get a dedicated partnership manager, marketing materials, training, and 24/7 support to help you succeed.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: TrendingUp, title: 'Growth Opportunities', description: 'Scale from a local partner to a regional franchise. Access to performance bonuses, incentives, and growth tracks.', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Zap, title: 'Technology Access', description: 'White-label booking platform, CRM tools, analytics dashboard, and mobile app — all included at no extra cost.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { icon: Building2, title: 'Territory Exclusivity', description: 'Get exclusive rights to operate in your designated area. No competition from other partners in your zone.', color: 'text-rose-600', bg: 'bg-rose-50' },
]

const commissionTiers = [
  { tier: 'Starter', investment: '₹50,000', commission: '8%', monthlyEarning: '₹30K-₹60K', requirements: '1-2 city zones, basic setup', features: ['Booking platform access', 'Marketing materials', 'Basic training', 'Email support'] },
  { tier: 'Growth', investment: '₹2,00,000', commission: '12%', monthlyEarning: '₹80K-₹1.5L', requirements: '3-5 city zones, office setup', features: ['All Starter features', 'White-label app', 'Dedicated manager', 'Priority support', 'Performance bonuses'] },
  { tier: 'Premium', investment: '₹5,00,000', commission: '15%', monthlyEarning: '₹2L-₹5L', requirements: 'Full city, established business', features: ['All Growth features', 'Territory exclusivity', 'Custom branding', 'Revenue sharing', 'Equity options', 'National events'] },
]

const supportProvided = [
  'Complete onboarding & business training',
  'Marketing & promotional materials',
  'Digital marketing support (SEO, social media)',
  'White-label booking platform & mobile app',
  'CRM and customer management tools',
  'Provider recruitment & training assistance',
  'Operational playbooks & SOPs',
  'Quality monitoring & audit framework',
  'Legal & compliance guidance',
  'Regular performance reviews & optimization',
]

const successMetrics = [
  { value: '500+', label: 'Active Partners', icon: Handshake },
  { value: '₹2.5 Cr+', label: 'Partner Earnings (Monthly)', icon: IndianRupee },
  { value: '85%', label: 'Partner Retention Rate', icon: Users },
  { value: '120+', label: 'Cities with Partners', icon: Globe },
]

const partnerFaqs = [
  { q: 'What is the BookMyService Partner Program?', a: 'The Partner Program allows entrepreneurs and businesses to offer BookMyService\'s home services in their designated territory. Partners earn commissions on every booking while leveraging our brand, technology, and support infrastructure.' },
  { q: 'How much can I earn as a partner?', a: 'Earnings depend on your tier and territory. Starter partners earn ₹30K-₹60K/month, Growth partners earn ₹80K-₹1.5L/month, and Premium partners earn ₹2L-₹5L/month. Top-performing partners earn even more with performance bonuses.' },
  { q: 'Do I need prior experience in home services?', a: 'No, prior experience is helpful but not required. We provide comprehensive training covering business operations, service quality, customer management, and marketing. Our team supports you every step of the way.' },
  { q: 'How is territory exclusivity determined?', a: 'Territories are allocated based on pin codes or city zones. Premium partners get exclusive rights to operate in an entire city. Territories are assigned on a first-come, first-served basis with mutual agreement.' },
  { q: 'What is the ROI timeline?', a: 'Most partners achieve break-even within 4-6 months of operation. Starter partners typically see positive returns by month 3-4, while Growth and Premium partners may take 5-6 months due to larger initial investments.' },
  { q: 'Can I upgrade my partnership tier later?', a: 'Yes, partners can upgrade to a higher tier at any time by paying the difference in investment and meeting the tier requirements. Upgrades are processed within 2 weeks.' },
]

export function PartnerProgramPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', investment: '', experience: '',
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D63FF] via-[#0B3D91] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 mb-4">Partner Program</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Partner With India&apos;s #1 <br />
              <span className="text-blue-200">Home Services Platform</span>
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8">
              Build a profitable business with BookMyService. Get exclusive territory rights,
              cutting-edge technology, and comprehensive support — earn up to ₹5 lakh/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="secondary" className="text-base">
                Apply to Become a Partner <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                Download Brochure
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {successMetrics.map((metric) => (
            <Card key={metric.label} className="shadow-md border-0 text-center">
              <CardContent className="py-5">
                <metric.icon className="size-5 text-[#1D63FF] mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Why Partner With Us?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Everything you need to build and scale a successful home services business</p>
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

      {/* Commission Structure */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Commission Structure</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Choose the partnership tier that matches your ambition and investment capacity</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {commissionTiers.map((tier) => (
            <Card key={tier.tier} className={`shadow-sm border-0 hover:shadow-md transition-shadow ${tier.tier === 'Growth' ? 'ring-2 ring-blue-500 relative' : ''}`}>
              {tier.tier === 'Growth' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#1D63FF] text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{tier.tier}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-[#1D63FF]">{tier.commission}</p>
                  <p className="text-xs text-slate-400">commission per booking</p>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Investment</span>
                    <span className="font-semibold text-slate-900">{tier.investment}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly Earning</span>
                    <span className="font-semibold text-emerald-600">{tier.monthlyEarning}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Requirements</span>
                    <span className="text-slate-600 text-xs text-right max-w-[140px]">{tier.requirements}</span>
                  </div>
                </div>
                <Separator className="mb-4" />
                <ul className="space-y-2 mb-5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${tier.tier === 'Growth' ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : ''}`} variant={tier.tier === 'Growth' ? 'default' : 'outline'}>
                  Choose {tier.tier}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Support Provided */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl">What We Provide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {supportProvided.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Apply Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="shadow-sm border-0">
          <div className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] text-white p-6 sm:p-8 rounded-t-xl">
            <h2 className="text-2xl font-bold mb-2">Apply to Become a Partner</h2>
            <p className="text-blue-100">Fill out the form below and our partnership team will contact you within 48 hours.</p>
          </div>
          <CardContent className="p-6 sm:p-8">
            {formSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="size-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Application Submitted!</h3>
                <p className="text-slate-500">Our team will review your application and contact you within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</label>
                    <Input placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address *</label>
                    <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number *</label>
                    <Input placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Preferred City *</label>
                    <Input placeholder="e.g., Bengaluru" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Investment Capacity</label>
                    <select className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" value={formData.investment} onChange={(e) => setFormData({ ...formData, investment: e.target.value })}>
                      <option value="">Select range</option>
                      <option value="50k-2l">₹50,000 - ₹2,00,000</option>
                      <option value="2l-5l">₹2,00,000 - ₹5,00,000</option>
                      <option value="5l+">₹5,00,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business Experience</label>
                    <Input placeholder="Brief description" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" size="lg" className="bg-[#1D63FF] hover:bg-[#0B3D91] w-full sm:w-auto">
                  Submit Application <ArrowRight className="size-4 ml-2" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {partnerFaqs.map((faq, idx) => (
            <Card key={idx} className="shadow-sm border-0">
              <button
                className="w-full text-left"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">{faq.q}</h3>
                    {openFaq === idx ? (
                      <ChevronUp className="size-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="size-5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  {openFaq === idx && (
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">{faq.a}</p>
                  )}
                </CardContent>
              </button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1D63FF] to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Build Your Business?</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Join 500+ partners who are building thriving businesses with BookMyService. Limited territories available!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary">Apply Now</Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Phone className="size-4 mr-2" /> Call: 1800-123-4567
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

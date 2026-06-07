'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Globe,
  ExternalLink,
  Share2,
  CheckCircle2,
} from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+91 1800-123-4567 (Toll-Free)', '+91 80-4567-8900'],
    subtitle: 'Available 24/7 for support',
    color: 'text-[#0A1F44]',
    bg: 'bg-[#FFD54F]/10',
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['support@bookmyservice.in', 'partnerships@bookmyservice.in'],
    subtitle: 'We reply within 2 hours',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: MapPin,
    title: 'Office',
    details: ['3rd Floor, KR Puram', 'Bengaluru, Karnataka 560036'],
    subtitle: 'Walk-in: Mon-Sat, 10AM-6PM',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Mon-Sat: 8:00 AM - 10:00 PM', 'Sun: 9:00 AM - 8:00 PM'],
    subtitle: 'Customer support 24/7',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
]

const offices = [
  { city: 'Bengaluru', address: '3rd Floor, KR Puram, Bengaluru 560036', phone: '+91 80-4567-8900', type: 'Head Office' },
  { city: 'Mumbai', address: 'Tower B, 12th Floor, Andheri East, Mumbai 400069', phone: '+91 22-4567-8900', type: 'Regional Office' },
  { city: 'Delhi NCR', address: 'Block A, Sector 62, Noida, UP 201301', phone: '+91 120-456-7890', type: 'Regional Office' },
  { city: 'Hyderabad', address: 'Cyber Towers, HITEC City, Hyderabad 500081', phone: '+91 40-4567-8900', type: 'Regional Office' },
]

const socialLinks = [
  { icon: Globe, label: 'Facebook', handle: '@bookmyservice', color: 'bg-[#0A1F44]' },
  { icon: Share2, label: 'Twitter', handle: '@bookmyservice_in', color: 'bg-sky-500' },
  { icon: ExternalLink, label: 'LinkedIn', handle: '/company/bookmyservice', color: 'bg-[#0A1F44]' },
  { icon: MessageCircle, label: 'Instagram', handle: '@bookmyservice_india', color: 'bg-pink-600' },
  { icon: Globe, label: 'YouTube', handle: 'BookMyService India', color: 'bg-red-600' },
]

export function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setTimeout(() => {
      setFormSubmitted(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="bg-[#FFD54F]/100/30 text-[#FFD54F]/80 border-blue-400/30 mb-4">Contact Us</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">We&apos;re Here to Help</h1>
          <p className="text-[#FFD54F]/80 text-lg max-w-2xl mx-auto">
            Have a question, feedback, or need support? Reach out to us and our team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((info) => (
            <Card key={info.title} className="shadow-md border-0">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-xl ${info.bg} flex items-center justify-center mx-auto mb-3`}>
                  <info.icon className={`size-6 ${info.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{info.title}</h3>
                {info.details.map((d, i) => (
                  <p key={i} className="text-sm text-slate-600">{d}</p>
                ))}
                <p className="text-xs text-slate-400 mt-2">{info.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="size-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-500">We&apos;ll get back to you within 2 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</label>
                        <Input
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address *</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number</label>
                        <Input
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subject *</label>
                        <Input
                          placeholder="What is this about?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Message *</label>
                      <textarea
                        className="w-full min-h-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                        placeholder="Tell us more about your query..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white w-full sm:w-auto">
                      <Send className="size-4 mr-2" /> Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map Placeholder + Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-0">
                <div className="h-56 bg-slate-100 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #e2e8f0 20px, #e2e8f0 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, #e2e8f0 20px, #e2e8f0 21px)' }} />
                  </div>
                  <div className="text-center z-10">
                    <MapPin className="size-10 text-[#0A1F44] mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Bengaluru, India</p>
                    <p className="text-xs text-slate-400">KR Puram, Karnataka 560036</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500">3rd Floor, KR Puram, Bengaluru, Karnataka 560036</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <MessageCircle className="size-4 text-[#0A1F44]" /> Live Chat Support
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Phone className="size-4 text-emerald-600" /> Call Us: 1800-123-4567
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Mail className="size-4 text-purple-600" /> Email Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Regional Offices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Our Offices</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offices.map((office) => (
            <Card key={office.city} className="shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="size-4 text-[#0A1F44]" />
                  <h3 className="font-semibold text-slate-900">{office.city}</h3>
                  <Badge variant="secondary" className="text-[10px]">{office.type}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-2">{office.address}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone className="size-3" /> {office.phone}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Media */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl">Follow Us on Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {socialLinks.map((social) => (
                <button key={social.label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
                  <div className={`w-10 h-10 rounded-lg ${social.color} flex items-center justify-center text-white shrink-0`}>
                    <social.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{social.label}</p>
                    <p className="text-xs text-slate-400">{social.handle}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ CTA */}
      <section className="bg-gradient-to-r from-[#0A1F44] to-[#0A1F44] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <Globe className="size-10 mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl font-bold mb-3">Have Common Questions?</h2>
          <p className="text-[#FFD54F]/80 mb-6 max-w-lg mx-auto">
            Check out our FAQ section for quick answers to the most commonly asked questions about our services.
          </p>
          <Button size="lg" variant="secondary">View FAQs</Button>
        </div>
      </section>
    </div>
  )
}

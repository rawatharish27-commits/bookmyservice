'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Newspaper,
  Download,
  Calendar,
  ExternalLink,
  Mail,
  Phone,
  Camera,
  FileText,
  Image,
  Play,
  Award,
  TrendingUp,
  Users,
  Globe,
  Building2,
} from 'lucide-react'

const pressReleases = [
  { date: '15 Feb 2025', title: 'BookMyService Raises ₹200 Cr Series C to Expand to Tier-3 Cities', category: 'Funding', excerpt: 'The latest round led by Sequoia Capital India will fuel expansion to 200+ cities and new service categories.' },
  { date: '28 Jan 2025', title: 'BookMyService Crosses 1 Crore Bookings Milestone', category: 'Milestone', excerpt: 'The platform has completed over 1 crore bookings since inception, with 50,000+ active service providers.' },
  { date: '10 Jan 2025', title: 'Launch of AI-Powered Service Matching Technology', category: 'Product', excerpt: 'New AI engine matches customers with the best-fit providers based on skills, proximity, and past ratings.' },
  { date: '15 Dec 2024', title: 'BookMyService Partners with State Governments for Skilled Worker Training', category: 'Partnership', excerpt: 'MOU signed with 5 state governments to train 1 lakh workers in home service skills by 2026.' },
  { date: '1 Nov 2024', title: 'Annual Home Care Report 2024 Released', category: 'Report', excerpt: 'The report reveals trends in Indian home services market projected to reach ₹20,000 Cr by 2027.' },
  { date: '15 Oct 2024', title: 'BookMyService Launches AMC Plans for Home Appliances', category: 'Product', excerpt: 'New Annual Maintenance Contracts starting at ₹2,999/year covering AC, washing machine, and RO servicing.' },
]

const mediaKit = [
  { icon: FileText, title: 'Brand Guidelines', description: 'Logo usage, colour palette, typography, and brand voice guidelines', format: 'PDF • 2.4 MB' },
  { icon: Image, title: 'Logo Pack', description: 'High-resolution logos in all formats (SVG, PNG, EPS)', format: 'ZIP • 8.1 MB' },
  { icon: Camera, title: 'Press Photos', description: 'High-resolution product screenshots, office photos, and team pictures', format: 'ZIP • 45 MB' },
  { icon: Play, title: 'Video Assets', description: 'Brand videos, TV commercials, and product demo clips', format: 'ZIP • 120 MB' },
  { icon: FileText, title: 'Company Fact Sheet', description: 'Key company stats, milestones, and business overview', format: 'PDF • 1.2 MB' },
  { icon: FileText, title: 'Founder Bios', description: 'Professional biographies and headshots of leadership team', format: 'PDF • 3.5 MB' },
]

const featuredIn = [
  { name: 'Economic Times', type: 'Business' },
  { name: 'Times of India', type: 'National' },
  { name: 'NDTV', type: 'News' },
  { name: 'YourStory', type: 'Startup' },
  { name: 'Inc42', type: 'Startup' },
  { name: 'Business Standard', type: 'Business' },
  { name: 'Hindustan Times', type: 'National' },
  { name: 'TechCrunch India', type: 'Tech' },
]

const newsArticles = [
  { source: 'Economic Times', date: '20 Feb 2025', title: 'Home Services Platforms See 3x Growth in Tier-2 Cities', link: '#' },
  { source: 'YourStory', date: '15 Feb 2025', title: 'BookMyService Raises ₹200 Cr to Take on Urban Company', link: '#' },
  { source: 'Inc42', date: '10 Feb 2025', title: 'How BookMyService is Empowering India\'s Informal Workforce', link: '#' },
  { source: 'NDTV', date: '5 Feb 2025', title: 'Top 5 Home Service Apps That Are Changing Indian Households', link: '#' },
  { source: 'Business Standard', date: '28 Jan 2025', title: '1 Crore Bookings: BookMyService Hits Major Milestone', link: '#' },
]

export function PressPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 mb-4">Press & Media</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Press Room</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            The latest news, press releases, and media resources from BookMyService.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: '1 Cr+', label: 'Bookings Completed', icon: TrendingUp },
            { value: '50K+', label: 'Service Providers', icon: Users },
            { value: '120+', label: 'Cities Present', icon: Globe },
            { value: '₹200 Cr', label: 'Latest Fundraise', icon: Building2 },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-md border-0 text-center">
              <CardContent className="py-5">
                <stat.icon className="size-5 text-blue-600 mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured In */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-lg font-semibold text-slate-400 text-center mb-6 uppercase tracking-wider">Featured In</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featuredIn.map((media) => (
            <Card key={media.name} className="shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="h-8 flex items-center justify-center mb-2">
                  <Newspaper className="size-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-700">{media.name}</p>
                <p className="text-[10px] text-slate-400">{media.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Press Releases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Press Releases</h2>
        <div className="space-y-4">
          {pressReleases.map((release, idx) => (
            <Card key={idx} className="shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px]">{release.category}</Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="size-3" /> {release.date}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1.5">{release.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{release.excerpt}</p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                    Read <ExternalLink className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* News Coverage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">In The News</h2>
        <Card className="shadow-sm border-0">
          <CardContent className="p-0">
            {newsArticles.map((article, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-600">{article.source}</span>
                      <span className="text-[10px] text-slate-400">{article.date}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">{article.title}</p>
                  </div>
                  <ExternalLink className="size-4 text-slate-300 shrink-0" />
                </div>
                {idx < newsArticles.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Media Kit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Media Kit</h2>
          <p className="text-slate-500">Download brand assets, logos, photos, and company information</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaKit.map((item) => (
            <Card key={item.title} className="shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{item.format}</span>
                      <Button variant="ghost" size="sm" className="text-blue-600 gap-1 h-auto p-0 text-xs">
                        <Download className="size-3" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Media Contact */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Media Inquiries</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            For press inquiries, interview requests, or media partnerships, please contact our communications team.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4 text-center">
                <Mail className="size-5 mx-auto mb-2 text-blue-200" />
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-blue-200">press@bookmyservice.in</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4 text-center">
                <Phone className="size-5 mx-auto mb-2 text-blue-200" />
                <p className="text-sm font-medium">Phone</p>
                <p className="text-xs text-blue-200">+91 80-4567-8901</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

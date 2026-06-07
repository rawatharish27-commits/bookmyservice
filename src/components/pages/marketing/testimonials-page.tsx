'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  Filter,
  Quote,
  Video,
  Play,
  ThumbsUp,
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react'

const serviceCategories = ['All', 'Water Tank Cleaning', 'Plumber', 'Electrician', 'Kitchen Appliances', 'Geyser', 'Water Purifier']

const testimonials = [
  { id: 1, name: 'Ananya Krishnan', avatar: 'AK', color: 'bg-[#0A1F44]', city: 'Chennai', service: 'Water Tank Cleaning', rating: 5, date: '15 Feb 2025', text: 'Absolutely fantastic experience! The cleaning team was professional, thorough, and efficient. My water tank has never looked this clean. The water tank cleaning service was worth every rupee. Will definitely book again!', verified: true, helpful: 42 },
  { id: 2, name: 'Rohit Verma', avatar: 'RV', color: 'bg-emerald-600', city: 'Delhi', service: 'Electrician', rating: 5, date: '12 Feb 2025', text: 'The electrician was punctual, skilled, and very polite. Fixed all the wiring issues in my house within 2 hours. Fair pricing with no hidden charges. The 30-day warranty gives me peace of mind.', verified: true, helpful: 38 },
  { id: 3, name: 'Sunita Joshi', avatar: 'SJ', color: 'bg-purple-600', city: 'Pune', service: 'Electrician', rating: 5, date: '10 Feb 2025', text: 'Service at home is a game changer! The professional was well-trained and used high-quality products. Got ready for my friend\'s wedding without stepping out. The convenience is unmatched.', verified: true, helpful: 56 },
  { id: 4, name: 'Mohammed Faisal', avatar: 'MF', color: 'bg-orange-600', city: 'Hyderabad', service: 'Plumber', rating: 4, date: '8 Feb 2025', text: 'Good service overall. The plumber arrived on time and fixed the leaking tap quickly. Only giving 4 stars because the booking process could be smoother. But the actual service was great.', verified: true, helpful: 24 },
  { id: 5, name: 'Kavitha Nair', avatar: 'KN', color: 'bg-teal-600', city: 'Bengaluru', service: 'Kitchen Appliances', rating: 5, date: '5 Feb 2025', text: 'My washing machine broke down and I was dreading the repair cost. BookMyService sent a technician within an hour who fixed it at a very reasonable price. Transparent pricing and no upselling!', verified: true, helpful: 31 },
  { id: 6, name: 'Arun Sharma', avatar: 'AS', color: 'bg-rose-600', city: 'Mumbai', service: 'Kitchen Appliances', rating: 5, date: '2 Feb 2025', text: 'Got my entire 2BHK kitchen sorted through BookMyService. The team was professional, completed the work in 3 days as promised, and cleaned up after themselves. The quality of workmanship is excellent.', verified: true, helpful: 47 },
  { id: 7, name: 'Deepa Reddy', avatar: 'DR', color: 'bg-amber-600', city: 'Hyderabad', service: 'Water Tank Cleaning', rating: 4, date: '28 Jan 2025', text: 'Booked water tank deep cleaning. The service was good but took longer than expected. However, the result was impressive — my tank looks brand new! Would recommend, just allow extra time.', verified: true, helpful: 19 },
  { id: 8, name: 'Vikram Singh', avatar: 'VS', color: 'bg-[#0A1F44]', city: 'Jaipur', service: 'Geyser', rating: 5, date: '25 Jan 2025', text: 'Needed geyser installation. The professional understood my requirements perfectly and delivered exactly what I wanted. Clean work, professional approach, and fair pricing. Highly recommended!', verified: true, helpful: 35 },
  { id: 9, name: 'Meera Patel', avatar: 'MP', color: 'bg-cyan-600', city: 'Ahmedabad', service: 'Water Purifier', rating: 5, date: '22 Jan 2025', text: 'Had a terrible water quality problem. The water purifier team did a thorough job and explained the treatment process. It\'s been 3 weeks and water quality is perfect. The follow-up visit was also helpful.', verified: true, helpful: 28 },
  { id: 10, name: 'Rajesh Kumar', avatar: 'RK', color: 'bg-lime-600', city: 'Lucknow', service: 'Electrician', rating: 4, date: '18 Jan 2025', text: 'Good electrical repair service. The technician was knowledgeable and fixed the issue. I appreciate the upfront pricing. Would have given 5 stars if the appointment had started on time.', verified: true, helpful: 15 },
  { id: 11, name: 'Pooja Gupta', avatar: 'PG', color: 'bg-pink-600', city: 'Delhi', service: 'Electrician', rating: 5, date: '15 Jan 2025', text: 'The electrician at home service was amazing! The professional was gentle, used quality materials, and gave me great tips. Everything works perfectly. Already booked my next session!', verified: true, helpful: 44 },
  { id: 12, name: 'Suresh Babu', avatar: 'SB', color: 'bg-violet-600', city: 'Chennai', service: 'Plumber', rating: 5, date: '12 Jan 2025', text: 'Fixed a major bathroom leak that other plumbers couldn\'t diagnose. The BookMyService plumber identified the issue immediately and repaired it properly. No leaks since then. Excellent work!', verified: true, helpful: 33 },
]

const videoTestimonials = [
  { name: 'Priya from Bengaluru', service: 'Water Tank Cleaning', duration: '2:30' },
  { name: 'Amit from Delhi', service: 'Air Conditioner', duration: '1:45' },
  { name: 'Lakshmi from Hyderabad', service: 'Electrician', duration: '3:15' },
]

export function TestimonialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent')

  const filteredTestimonials = testimonials
    .filter((t) => selectedCategory === 'All' || t.service === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating
      if (sortBy === 'helpful') return b.helpful - a.helpful
      return 0
    })

  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
  const fiveStarCount = testimonials.filter(t => t.rating === 5).length
  const fourStarCount = testimonials.filter(t => t.rating === 4).length
  const totalReviews = testimonials.length

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="bg-[#FFD54F]/100/30 text-[#FFD54F]/80 border-blue-400/30 mb-4">Testimonials</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">What Our Customers Say</h1>
          <p className="text-[#FFD54F]/80 text-lg max-w-2xl mx-auto">
            Real reviews from real customers. See why millions trust BookMyService for their home service needs.
          </p>
        </div>
      </section>

      {/* Rating Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-4 gap-6 items-center">
              <div className="text-center sm:text-left">
                <p className="text-5xl font-bold text-slate-900">{avgRating}</p>
                <div className="flex gap-0.5 justify-center sm:justify-start mt-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-500">{totalReviews.toLocaleString()} reviews</p>
              </div>
              <div className="sm:col-span-2 space-y-2">
                {[
                  { stars: 5, count: fiveStarCount, percentage: Math.round((fiveStarCount / totalReviews) * 100) },
                  { stars: 4, count: fourStarCount, percentage: Math.round((fourStarCount / totalReviews) * 100) },
                  { stars: 3, count: 0, percentage: 0 },
                  { stars: 2, count: 0, percentage: 0 },
                  { stars: 1, count: 0, percentage: 0 },
                ].map((bar) => (
                  <div key={bar.stars} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-6">{bar.stars}★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${bar.percentage}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{bar.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">92%</p>
                  <p className="text-[10px] text-slate-500">Would recommend</p>
                </div>
                <div className="text-center p-3 bg-[#FFD54F]/10 rounded-xl">
                  <Award className="size-5 text-[#0A1F44] mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">4.8</p>
                  <p className="text-[10px] text-slate-500">Avg. service rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filter & Sort */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {serviceCategories.slice(0, 7).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === cat ? 'bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white' : 'bg-white'}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'helpful')}
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Testimonial Cards */}
        {filteredTestimonials.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="py-12 text-center">
              <Star className="size-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No reviews found</h3>
              <p className="text-slate-500">Try a different category filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <Quote className="size-6 text-blue-200 mb-3" />
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{testimonial.text}</p>
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-9">
                        <AvatarFallback className={`${testimonial.color} text-white text-xs font-semibold`}>
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-slate-900">{testimonial.name}</p>
                          {testimonial.verified && <CheckCircle2 className="size-3 text-[#FFD54F]/800" />}
                        </div>
                        <p className="text-[10px] text-slate-400">{testimonial.city} • {testimonial.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-3 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{testimonial.service}</Badge>
                    <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#0A1F44] transition-colors">
                      <ThumbsUp className="size-3" /> Helpful ({testimonial.helpful})
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Video Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Video Testimonials</h2>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {videoTestimonials.map((video) => (
            <Card key={video.name} className="shadow-sm border-0 overflow-hidden cursor-pointer group">
              <div className="h-44 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="size-6 text-[#0A1F44] ml-1" />
                </div>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">{video.duration}</span>
                <Video className="size-8 text-slate-400 absolute top-3 left-3" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm text-slate-900">{video.name}</h3>
                <p className="text-xs text-slate-400">{video.service}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0A1F44] to-[#0A1F44] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Experience the Difference</h2>
          <p className="text-[#FFD54F]/80 mb-8 max-w-lg mx-auto">
            Join 25 lakh+ customers who trust BookMyService for quality home services. Your satisfaction is guaranteed.
          </p>
          <Button size="lg" variant="secondary">Book Your First Service</Button>
        </div>
      </section>
    </div>
  )
}

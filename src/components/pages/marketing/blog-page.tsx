'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Heart,
  Eye,
  Share2,
  Bookmark,
} from 'lucide-react'

const categories = ['All', 'Home Maintenance', 'Cleaning Tips', 'Interior Design', 'DIY Guides', 'Lifestyle', 'Company News', 'Provider Stories']

const featuredPost = {
  title: 'The Complete Guide to Home Maintenance in India: What Every Homeowner Needs to Know',
  excerpt: 'From monsoon prep to annual Water Tank Cleaning, learn the essential home maintenance schedule that will keep your home in top shape year-round. Expert tips from our top service providers.',
  author: 'Priya Sharma',
  authorInitials: 'PS',
  authorColor: 'bg-[#1D63FF]',
  date: '28 Feb 2025',
  readTime: '8 min read',
  category: 'Home Maintenance',
  views: '12.5K',
  likes: 342,
}

const blogPosts = [
  {
    id: 1,
    title: '10 Monsoon Preparation Tips Every Indian Home Needs',
    excerpt: 'Don\'t let the rains catch you off guard. These essential tips will protect your home from water damage, leaks, and electrical hazards during the monsoon season.',
    author: 'Arjun Patel',
    authorInitials: 'AP',
    authorColor: 'bg-emerald-600',
    date: '25 Feb 2025',
    readTime: '5 min read',
    category: 'Home Maintenance',
    views: '8.2K',
    likes: 215,
  },
  {
    id: 2,
    title: 'How to Deep Clean Your Kitchen Like a Professional',
    excerpt: 'Professional cleaners share their secrets for a spotless kitchen. From grease removal to appliance cleaning, here\'s the step-by-step guide.',
    author: 'Neha Gupta',
    authorInitials: 'NG',
    authorColor: 'bg-purple-600',
    date: '22 Feb 2025',
    readTime: '6 min read',
    category: 'Cleaning Tips',
    views: '6.7K',
    likes: 189,
  },
  {
    id: 3,
    title: 'Small Space, Big Impact: Budget-Friendly Interior Ideas',
    excerpt: 'Transform your 1BHK or 2BHK into a stylish haven without breaking the bank. Interior designers share affordable tips and tricks for Indian homes.',
    author: 'Ravi Kumar',
    authorInitials: 'RK',
    authorColor: 'bg-orange-600',
    date: '20 Feb 2025',
    readTime: '7 min read',
    category: 'Interior Design',
    views: '9.1K',
    likes: 267,
  },
  {
    id: 4,
    title: 'DIY vs Professional: When to Call an Expert',
    excerpt: 'Some home repairs are safe to DIY, but others need professional help. Learn which services you should never attempt yourself and why it matters.',
    author: 'Sneha Reddy',
    authorInitials: 'SR',
    authorColor: 'bg-rose-600',
    date: '18 Feb 2025',
    readTime: '4 min read',
    category: 'DIY Guides',
    views: '5.4K',
    likes: 156,
  },
  {
    id: 5,
    title: '5 Ways to Make Your Home More Eco-Friendly',
    excerpt: 'Sustainable living starts at home. From water-saving fixtures to energy-efficient appliances, here are practical steps for a greener household.',
    author: 'Kavitha Nair',
    authorInitials: 'KN',
    authorColor: 'bg-teal-600',
    date: '15 Feb 2025',
    readTime: '5 min read',
    category: 'Lifestyle',
    views: '4.8K',
    likes: 198,
  },
  {
    id: 6,
    title: 'BookMyService Expands to 30 New Tier-3 Cities',
    excerpt: 'We\'re excited to announce our expansion to 30 new tier-3 cities across India, bringing professional home services to millions more households.',
    author: 'Marketing Team',
    authorInitials: 'MT',
    authorColor: 'bg-[#1D63FF]',
    date: '12 Feb 2025',
    readTime: '3 min read',
    category: 'Company News',
    views: '15.2K',
    likes: 423,
  },
  {
    id: 7,
    title: 'From ₹8,000 to ₹55,000: Ramesh\'s Journey as a Plumber',
    excerpt: 'Hear how Ramesh Kumar from Bengaluru transformed his career and earnings through BookMyService. A story of skill, determination, and opportunity.',
    author: 'Editorial Team',
    authorInitials: 'ET',
    authorColor: 'bg-amber-600',
    date: '10 Feb 2025',
    readTime: '6 min read',
    category: 'Provider Stories',
    views: '7.3K',
    likes: 312,
  },
  {
    id: 8,
    title: 'The Ultimate AC Maintenance Checklist for Indian Summers',
    excerpt: 'Prepare your air conditioner for the scorching Indian summer. This comprehensive checklist covers everything from filter cleaning to gas refilling.',
    author: 'Arjun Patel',
    authorInitials: 'AP',
    authorColor: 'bg-emerald-600',
    date: '8 Feb 2025',
    readTime: '5 min read',
    category: 'Home Maintenance',
    views: '11.4K',
    likes: 287,
  },
]

export function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D63FF] via-[#0B3D91] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 mb-4">Blog</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Insights & Tips</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Expert advice, DIY guides, and the latest updates from the world of home services.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              placeholder="Search articles..."
              className="pl-10 h-12 bg-white/95 text-slate-900 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              className={selectedCategory === cat ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : 'bg-white shadow-sm'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {selectedCategory === 'All' && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Card className="shadow-sm border-0 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="h-48 lg:h-auto bg-gradient-to-br from-[#1D63FF]/10 to-blue-200 flex items-center justify-center">
                <BookOpen className="size-16 text-blue-400" />
              </div>
              <CardContent className="p-6 sm:p-8">
                <Badge className="bg-blue-50 text-[#0B3D91] mb-3">{featuredPost.category}</Badge>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-tight">{featuredPost.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className={`${featuredPost.authorColor} text-white text-xs`}>{featuredPost.authorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{featuredPost.author}</p>
                      <p className="text-[10px] text-slate-400">{featuredPost.date} • {featuredPost.readTime}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#1D63FF] hover:bg-[#0B3D91]">
                    Read More <ArrowRight className="size-3 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Eye className="size-3" /> {featuredPost.views}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Heart className="size-3" /> {featuredPost.likes}</span>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>
      )}

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedCategory === 'All' ? 'Latest Articles' : selectedCategory}
          </h2>
          <p className="text-sm text-slate-500">{filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}</p>
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="py-12 text-center">
              <BookOpen className="size-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No articles found</h3>
              <p className="text-slate-500">Try a different search or category.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <BookOpen className="size-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <CardContent className="p-4 sm:p-5">
                  <Badge variant="secondary" className="text-[10px] mb-2">{post.category}</Badge>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-2 leading-snug group-hover:text-[#1D63FF] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className={`${post.authorColor} text-white text-[8px]`}>{post.authorInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] font-medium text-slate-600">{post.author}</p>
                        <p className="text-[9px] text-slate-400">{post.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="size-2.5" /> {post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400"><Eye className="size-2.5" /> {post.views}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400"><Heart className="size-2.5" /> {post.likes}</span>
                    <Bookmark className="size-3 text-slate-300 ml-auto hover:text-blue-500 cursor-pointer" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <BookOpen className="size-10 mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay Updated</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Get the latest home maintenance tips, DIY guides, and company updates delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="bg-white/95 text-slate-900 placeholder:text-slate-400" />
            <Button variant="secondary" size="lg">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

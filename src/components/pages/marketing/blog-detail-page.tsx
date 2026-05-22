'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ExternalLink,
  Globe,
  Link2,
  ArrowLeft,
  BookOpen,
  Tag,
  MessageCircle,
  ThumbsUp,
  ChevronRight,
} from 'lucide-react'

const relatedPosts = [
  { title: '10 Monsoon Preparation Tips Every Indian Home Needs', category: 'Home Maintenance', readTime: '5 min', date: '25 Feb 2025' },
  { title: 'The Ultimate AC Maintenance Checklist for Indian Summers', category: 'Home Maintenance', readTime: '5 min', date: '8 Feb 2025' },
  { title: 'DIY vs Professional: When to Call an Expert', category: 'DIY Guides', readTime: '4 min', date: '18 Feb 2025' },
  { title: '5 Ways to Make Your Home More Eco-Friendly', category: 'Lifestyle', readTime: '5 min', date: '15 Feb 2025' },
]

const tags = ['Home Maintenance', 'India', 'Homeowner Tips', 'Seasonal Care', 'Property Care', 'Preventive Maintenance']

export function BlogDetailPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 p-0 h-auto">
              <ArrowLeft className="size-4 mr-1" /> Blog
            </Button>
            <ChevronRight className="size-3" />
            <span className="text-slate-600">Home Maintenance</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image Placeholder */}
            <div className="h-56 sm:h-72 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
              <BookOpen className="size-16 text-blue-400" />
            </div>

            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-blue-50 text-blue-700">Home Maintenance</Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="size-3" /> 28 Feb 2025</span>
              <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="size-3" /> 8 min read</span>
              <span className="text-xs text-slate-400 flex items-center gap-1"><Eye className="size-3" /> 12.5K views</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-6">
              The Complete Guide to Home Maintenance in India: What Every Homeowner Needs to Know
            </h1>

            {/* Author */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">PS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Priya Sharma</p>
                  <p className="text-xs text-slate-400">Home Maintenance Expert • 50+ articles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Share2 className="size-3.5" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Bookmark className="size-3.5" /> Save
                </Button>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Article Content */}
            <article className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-base mb-6">
                Owning a home in India comes with unique challenges — from battling monsoon moisture to dealing with hard water damage,
                the Indian climate takes a toll on your property. Yet, most homeowners only call for help when something breaks,
                which often means expensive emergency repairs that could have been prevented.
              </p>

              <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Why Regular Home Maintenance Matters</h2>
              <p className="text-slate-600 leading-relaxed text-base mb-4">
                A proactive maintenance schedule can save you up to ₹50,000 annually in repair costs. Think of it like servicing your car —
                regular check-ups prevent major breakdowns. The same principle applies to your home.
              </p>
              <p className="text-slate-600 leading-relaxed text-base mb-6">
                According to a study by the National Real Estate Development Council, Indian homeowners spend an average of
                ₹35,000-₹75,000 per year on unplanned repairs. A structured maintenance plan can reduce this by 40-60%.
              </p>

              <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Monthly Maintenance Checklist</h2>
              <p className="text-slate-600 leading-relaxed text-base mb-4">
                Here&apos;s what you should be doing every month to keep your home in top condition:
              </p>
              <div className="bg-blue-50 rounded-xl p-5 mb-6">
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">•</span> Check all faucets and pipes for leaks</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">•</span> Test smoke detectors and fire extinguishers</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">•</span> Clean AC filters and check for unusual sounds</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">•</span> Inspect electrical switches and wiring for damage</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">•</span> Clean kitchen and bathroom drains</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">•</span> Check water heater for leaks and efficiency</li>
                </ul>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Seasonal Maintenance Guide</h2>
              <p className="text-slate-600 leading-relaxed text-base mb-4">
                India&apos;s diverse climate zones mean your maintenance needs vary by season. Here&apos;s a seasonal breakdown:
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">Monsoon (June-September)</h3>
              <p className="text-slate-600 leading-relaxed text-base mb-4">
                The monsoon is the most challenging season for Indian homes. Water seepage, damp walls, and electrical hazards are common.
                Before the rains arrive, ensure your roof is waterproofed, gutters are clean, and all exterior cracks are sealed.
                Keep an electrician on speed dial — water and electricity don&apos;t mix well.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">Summer (March-May)</h3>
              <p className="text-slate-600 leading-relaxed text-base mb-4">
                Summer in India means peak AC usage. Service your air conditioners before April to avoid breakdowns during the hottest months.
                Check for paint peeling on exterior walls and reapply weatherproof coating if needed. Ensure proper ventilation to prevent
                moisture buildup.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">Winter (October-February)</h3>
              <p className="text-slate-600 leading-relaxed text-base mb-6">
                Winter is the ideal time for deep cleaning and major repairs. Schedule painting, plumbing overhauls, and electrical
                rewiring during these months when demand (and prices) are lower.
              </p>

              <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">The BookMyService Advantage</h2>
              <p className="text-slate-600 leading-relaxed text-base mb-6">
                With BookMyService, you can schedule all your home maintenance needs in one place. Our AMC (Annual Maintenance Contract)
                plans start at just ₹2,999/year and cover quarterly check-ups, priority support, and discounted repair services.
                It&apos;s like having a home care team on call, 24/7.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
                <p className="text-sm font-medium text-emerald-800 mb-1">💡 Pro Tip</p>
                <p className="text-sm text-emerald-700">
                  Book your annual maintenance services during off-peak months (Oct-Feb) for up to 20% savings.
                  Many providers offer combo deals when you bundle multiple services.
                </p>
              </div>
            </article>

            <Separator className="my-8" />

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-slate-200 transition-colors">
                    <Tag className="size-2.5 mr-1" /> {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Share this article</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5"><Globe className="size-3.5" /> Facebook</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><Share2 className="size-3.5" /> Twitter</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><ExternalLink className="size-3.5" /> LinkedIn</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><Link2 className="size-3.5" /> Copy Link</Button>
              </div>
            </div>

            {/* Reactions */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-700 mb-3">Did you find this article helpful?</p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ThumbsUp className="size-3.5" /> Helpful (342)
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Heart className="size-3.5" /> Like (287)
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <MessageCircle className="size-3.5" /> Comments (56)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-5 text-center">
                <Avatar className="size-16 mx-auto mb-3">
                  <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">PS</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-slate-900">Priya Sharma</h3>
                <p className="text-xs text-slate-400 mb-3">Home Maintenance Expert</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Priya has 10+ years of experience in home maintenance and writes regularly about keeping Indian homes in top shape.
                </p>
                <Button variant="outline" size="sm" className="w-full">Follow Author</Button>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Related Articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedPosts.map((post) => (
                  <div key={post.title} className="flex gap-3 cursor-pointer group">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                      <BookOpen className="size-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[8px] py-0">{post.category}</Badge>
                        <span className="text-[10px] text-slate-400">{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Weekly Newsletter</h3>
                <p className="text-sm text-blue-100 mb-4">Get the latest tips & updates delivered to your inbox.</p>
                <Input placeholder="Your email" className="bg-white/95 text-slate-900 placeholder:text-slate-400 mb-2" />
                <Button variant="secondary" size="sm" className="w-full">Subscribe</Button>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Home Maintenance', 'Cleaning Tips', 'Interior Design', 'DIY Guides', 'Lifestyle', 'Company News'].map((cat) => (
                  <div key={cat} className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors">
                    <span className="text-sm text-slate-600">{cat}</span>
                    <ChevronRight className="size-3.5 text-slate-300" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Tag, Copy, Sparkles, Gift, Percent, Zap } from 'lucide-react'

const offers = [
  { title: 'Summer AC Bonanza', desc: 'Get 40% off on all AC services this summer', code: 'SUMMER40', discount: '40% OFF', gradient: 'from-blue-500 to-cyan-400', validTill: '2025-03-31', category: 'HVAC' },
  { title: 'Deep Clean Deal', desc: 'Flat ₹500 off on deep home cleaning', code: 'CLEAN500', discount: '₹500 OFF', gradient: 'from-green-500 to-emerald-400', validTill: '2025-03-25', category: 'Cleaning' },
  { title: 'Plumbing Fix Sale', desc: '30% off on all plumbing services', code: 'FIX30', discount: '30% OFF', gradient: 'from-amber-500 to-yellow-400', validTill: '2025-03-28', category: 'Plumbing' },
  { title: 'New User Offer', desc: 'First booking? Get 50% off up to ₹1000', code: 'NEWUSER50', discount: '50% OFF', gradient: 'from-purple-500 to-fuchsia-400', validTill: '2025-04-15', category: 'All' },
  { title: 'Electrical Safety', desc: '₹300 off on electrical safety checkups', code: 'SAFE300', discount: '₹300 OFF', gradient: 'from-red-500 to-orange-400', validTill: '2025-03-20', category: 'Electrical' },
  { title: 'Painting Fiesta', desc: '25% off on interior painting services', code: 'PAINT25', discount: '25% OFF', gradient: 'from-indigo-500 to-violet-400', validTill: '2025-04-05', category: 'Painting' },
]

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { clearInterval(timer); return }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex gap-1">
      {[
        { val: timeLeft.days, label: 'd' },
        { val: timeLeft.hours, label: 'h' },
        { val: timeLeft.mins, label: 'm' },
        { val: timeLeft.secs, label: 's' },
      ].map((t) => (
        <span key={t.label} className="bg-black/20 rounded px-1.5 py-0.5 text-xs font-mono font-bold min-w-[28px] text-center">
          {String(t.val).padStart(2, '0')}{t.label}
        </span>
      ))}
    </div>
  )
}

export function OffersDealsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="size-6" />
            <Badge className="bg-white/20 text-white border-0 text-sm">Limited Period</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Offers & Deals</h1>
          <p className="text-pink-100">Grab exclusive discounts on top-rated home services</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Quick Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All Offers', 'New User', 'HVAC', 'Cleaning', 'Plumbing', 'Electrical'].map((tag) => (
            <Button key={tag} variant="outline" size="sm" className="rounded-full">{tag}</Button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <Card key={offer.code} className="rounded-xl shadow-sm border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${offer.gradient} p-5 text-white`}>
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-white/20 text-white border-0 text-sm font-bold">{offer.discount}</Badge>
                  <Badge className="bg-white/20 text-white border-0 text-[10px]">{offer.category}</Badge>
                </div>
                <h3 className="font-bold text-lg">{offer.title}</h3>
                <p className="text-white/80 text-sm mt-1">{offer.desc}</p>
              </div>
              <CardContent className="p-5 bg-white">
                {/* Coupon Code */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                    <Tag className="size-4 text-slate-400" />
                    <span className="font-mono font-bold text-sm text-slate-800">{offer.code}</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => handleCopy(offer.code)}>
                    <Copy className="size-3" />
                    {copiedCode === offer.code ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                {/* Countdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="size-3" /> Ends in
                  </div>
                  <CountdownTimer targetDate={offer.validTill} />
                </div>
                <Separator className="my-3" />
                <Button className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white">
                  Apply & Book
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl border-0">
          <CardContent className="p-8 text-center">
            <Sparkles className="size-8 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Refer & Earn</h2>
            <p className="text-amber-100 mb-4">Share with friends and both get ₹200 off on your next booking</p>
            <Button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8">Share Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

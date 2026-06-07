'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Tag, Copy, Sparkles, Gift, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useApi } from '@/lib/use-api'

// Offers data is static marketing content — no /api/offers endpoint exists
// Using useApi with static data instead of useMockApi to remove artificial delay
const offersData = [
  { title: 'AC Summer Bonanza', desc: 'Get 20% off on all AC services', code: 'SUMMER20', discount: '20% OFF', gradient: 'from-[#0A1F44] to-[#FFD54F]', validTill: '2025-03-31', category: 'Air Conditioner' },
  { title: 'Plumber Fix Sale', desc: '₹50 off on plumber services', code: 'FIX50', discount: '₹50 OFF', gradient: 'from-amber-500 to-yellow-400', validTill: '2025-03-28', category: 'Plumber' },
  { title: 'New User Offer', desc: 'First booking? Get 15% off up to ₹75', code: 'NEWUSER15', discount: '15% OFF', gradient: 'from-purple-500 to-fuchsia-400', validTill: '2025-04-15', category: 'All' },
  { title: 'Electrician Safety', desc: '₹50 off on electrical safety checkups', code: 'SAFE50', discount: '₹50 OFF', gradient: 'from-red-500 to-orange-400', validTill: '2025-03-20', category: 'Electrician' },
  { title: 'Water Purifier Deal', desc: '10% off on RO service and filter change', code: 'RO10', discount: '10% OFF', gradient: 'from-teal-500 to-[#FFD54F]', validTill: '2025-04-05', category: 'Water Purifier' },
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
    <div className="flex gap-1" aria-label="Time remaining">
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
  const { navigate } = useApp()

  const { data: offers, loading, error, refetch } = useApi(() => Promise.resolve(offersData), [])

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
          {['All Offers', 'New User', 'Air Conditioner', 'Plumber', 'Electrician'].map((tag) => (
            <Button key={tag} variant="outline" size="sm" className="rounded-full">{tag}</Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" role="status" aria-label="Loading offers">
            <Loader2 className="size-8 text-[#0A1F44] animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load offers</p>
            <Button variant="outline" onClick={refetch}>Retry</Button>
          </div>
        ) : offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer) => (
              <Card key={offer.code} className="rounded-xl shadow-sm border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`bg-gradient-to-r ${offer.gradient} p-5 text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-white/20 text-white border-0 text-sm font-bold">{offer.discount}</Badge>
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">{offer.category}</Badge>
                  </div>
                  <h3 className="font-bold text-lg">{offer.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{offer.desc}</p>
                </div>
                <CardContent className="p-5 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                      <Tag className="size-4 text-slate-400" />
                      <span className="font-mono font-bold text-sm text-slate-800">{offer.code}</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => handleCopy(offer.code)} aria-label={`Copy code ${offer.code}`}>
                      <Copy className="size-3" />
                      {copiedCode === offer.code ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="size-3" /> Ends in
                    </div>
                    <CountdownTimer targetDate={offer.validTill} />
                  </div>
                  <Separator className="my-3" />
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white" onClick={() => navigate('service-listing')}>
                    Apply & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-20">No offers available at the moment.</p>
        )}

        {/* CTA */}
        <Card className="mt-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl border-0">
          <CardContent className="p-8 text-center">
            <Sparkles className="size-8 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Refer & Earn</h2>
            <p className="text-amber-100 mb-4">Share with friends and both get ₹50 off on your next booking</p>
            <Button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8">Share Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

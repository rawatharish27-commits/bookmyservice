'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Tag, Check, Clock, Sparkles } from 'lucide-react'

const coupons = [
  { id: 1, code: 'SAVE20', discount: '20% OFF', desc: 'On all AC services', expiry: '31 May 2025', minOrder: '₹999', used: false },
  { id: 2, code: 'FIRST100', discount: '₹100 OFF', desc: 'First booking only', expiry: '30 Jun 2025', minOrder: '₹499', used: false },
  { id: 3, code: 'CLEAN50', discount: '₹50 OFF', desc: 'Deep cleaning services', expiry: '15 Jun 2025', minOrder: '₹999', used: false },
]

const usedCoupons = [
  { id: 4, code: 'WELCOME10', discount: '10% OFF', desc: 'Welcome offer', usedOn: '5 May 2025' },
  { id: 5, code: 'SUMMER25', discount: '25% OFF', desc: 'Summer special', usedOn: '20 Apr 2025' },
]

export function ClientCouponsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (code: string) => { setCopied(code); setTimeout(() => setCopied(null), 2000) }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Coupons</h1>

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles className="size-4 text-amber-500" /> Available Coupons</h2>
          {coupons.map((c) => (
            <Card key={c.id} className="bg-white rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="flex w-24 shrink-0 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white">
                    <span className="text-lg font-bold">{c.discount}</span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.desc}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Min order: {c.minOrder}</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 border-slate-200 rounded-lg text-xs" onClick={() => handleCopy(c.code)}>
                        {copied === c.code ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        {copied === c.code ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono border-dashed border-blue-300 text-blue-600">{c.code}</Badge>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock className="size-2.5" />Exp: {c.expiry}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400"><Tag className="size-4" /> Used Coupons</h2>
          {usedCoupons.map((c) => (
            <Card key={c.id} className="bg-white rounded-xl opacity-60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">{c.discount} — {c.desc}</p>
                  <p className="text-xs text-slate-400">Used on {c.usedOn}</p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Used</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

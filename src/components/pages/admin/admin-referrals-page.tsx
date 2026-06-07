'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Gift, TrendingUp, Copy } from 'lucide-react'

const referralStats = { totalReferrals: 856, rewardsGiven: '₹1,71,200', activeReferrers: 234, conversionRate: '28%' }

const topReferrers = [
  { id: 1, name: 'Rahul Sharma', code: 'RAHUL20', referrals: 24, rewards: '₹4,800' },
  { id: 2, name: 'Priya Patel', code: 'PRIYA15', referrals: 18, rewards: '₹3,600' },
  { id: 3, name: 'Vikas Singh', code: 'VIKAS10', referrals: 15, rewards: '₹3,000' },
  { id: 4, name: 'Amit Verma', code: 'AMIT25', referrals: 12, rewards: '₹2,400' },
]

const referralTree = [
  { referrer: 'Rahul Sharma', referred: ['User A', 'User B', 'User C'], level: 1 },
  { referrer: 'User A', referred: ['User D', 'User E'], level: 2 },
  { referrer: 'User D', referred: ['User F'], level: 3 },
]

export function AdminReferralsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Users className="size-5 text-[#0A1F44] mx-auto mb-1" /><p className="text-lg font-bold text-[#0A1F44]">{referralStats.totalReferrals}</p><p className="text-xs text-slate-500">Total Referrals</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Gift className="size-5 text-emerald-600 mx-auto mb-1" /><p className="text-lg font-bold text-emerald-600">{referralStats.rewardsGiven}</p><p className="text-xs text-slate-500">Rewards Given</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><TrendingUp className="size-5 text-purple-600 mx-auto mb-1" /><p className="text-lg font-bold text-purple-600">{referralStats.activeReferrers}</p><p className="text-xs text-slate-500">Active Referrers</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-amber-600">{referralStats.conversionRate}</p><p className="text-xs text-slate-500">Conversion Rate</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Top Referrers</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {topReferrers.map((r, i) => (
              <div key={r.id}>
                <div className="flex items-center gap-4 py-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#FFD54F]/10 text-xs font-bold text-[#0A1F44]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{r.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{r.code}</code><button><Copy className="size-3 text-slate-400" /></button></div>
                  </div>
                  <div className="text-right"><p className="text-sm font-semibold text-slate-700">{r.referrals} referrals</p><p className="text-xs text-emerald-600">{r.rewards} earned</p></div>
                </div>
                {i < topReferrers.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Referral Tree</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {referralTree.map((node) => (
              <div key={node.referrer} className="ml-${(node.level - 1) * 24}">
                <div className="flex items-center gap-2 py-1.5" style={{ marginLeft: `${(node.level - 1) * 24}px` }}>
                  <Badge variant="secondary" className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20">L{node.level}</Badge>
                  <span className="text-sm font-medium text-slate-900">{node.referrer}</span>
                  <span className="text-xs text-slate-400">→ {node.referred.join(', ')}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

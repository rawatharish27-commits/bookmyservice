'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Gift, Copy, Share2, Users, Wallet, Link2, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface ReferralData {
  code: string
  reward: string
  friendReward: string
  totalReferrals: number
  totalEarned: number
  history: { name: string; date: string; reward: string; status: string }[]
}

export function ClientReferralPage() {
  const { data: referral, loading, error, refetch } = useApi<ReferralData>(async () => {
    const res = await fetch('/api/client/referral')
    if (!res.ok) throw new Error('Failed to load referral info')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading referral info">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load referral info</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Refer & Earn</h1>

        <Card className="rounded-xl overflow-hidden border-0">
          <div className="bg-gradient-to-br from-[#1D63FF] to-[#0B3D91] p-6 text-white text-center">
            <Gift className="size-12 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Earn ₹{referral?.reward ?? '100'} per referral</h2>
            <p className="text-sm text-blue-100 mt-1">Your friend gets ₹{referral?.friendReward ?? '50'} off on their first booking</p>
          </div>
          <div className="bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-3">
              <span className="flex-1 font-mono text-sm font-bold text-[#0B3D91] tracking-widest">{referral?.code ?? '—'}</span>
              <Button size="sm" variant="outline" className="gap-1 border-blue-200 text-[#1D63FF] rounded-lg" aria-label="Copy referral code"><Copy className="size-3" /> Copy</Button>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl" aria-label="Share on WhatsApp"><Share2 className="size-4" /> WhatsApp</Button>
              <Button variant="outline" className="flex-1 gap-1 border-slate-200 rounded-xl" aria-label="Copy referral link"><Link2 className="size-4" /> Copy Link</Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <Users className="size-6 text-[#1D63FF] mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{referral?.totalReferrals ?? 0}</p>
              <p className="text-xs text-slate-500">Total Referrals</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <Wallet className="size-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">₹{referral?.totalEarned ?? 0}</p>
              <p className="text-xs text-slate-500">Total Earned</p>
            </CardContent>
          </Card>
        </div>

        {referral?.history && referral.history.length > 0 && (
          <Card className="bg-white rounded-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Referral History</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              {referral.history.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-[#1D63FF] text-xs font-bold">{r.name.charAt(0)}</div>
                    <div className="flex-1"><p className="text-sm font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-400">{r.date}</p></div>
                    <span className="text-sm font-semibold text-emerald-600">{r.reward}</span>
                    <Badge variant="secondary" className={r.status === 'Earned' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'}>{r.status}</Badge>
                  </div>
                  {i < referral.history.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

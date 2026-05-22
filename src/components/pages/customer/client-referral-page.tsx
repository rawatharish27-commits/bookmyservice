'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Gift, Copy, Share2, Users, Wallet, Check, Link2 } from 'lucide-react'

const referralHistory = [
  { name: 'Vikram P.', date: '10 May 2025', reward: '₹100', status: 'Earned' },
  { name: 'Sneha R.', date: '5 May 2025', reward: '₹100', status: 'Earned' },
  { name: 'Arjun M.', date: '1 May 2025', reward: '₹100', status: 'Pending' },
]

export function ClientReferralPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Refer & Earn</h1>

        <Card className="rounded-xl overflow-hidden border-0">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white text-center">
            <Gift className="size-12 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Earn ₹100 per referral</h2>
            <p className="text-sm text-blue-100 mt-1">Your friend gets ₹50 off on their first booking</p>
          </div>
          <div className="bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-3">
              <span className="flex-1 font-mono text-sm font-bold text-blue-700 tracking-widest">RAHUL2025</span>
              <Button size="sm" variant="outline" className="gap-1 border-blue-200 text-blue-600 rounded-lg"><Copy className="size-3" /> Copy</Button>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"><Share2 className="size-4" /> WhatsApp</Button>
              <Button variant="outline" className="flex-1 gap-1 border-slate-200 rounded-xl"><Link2 className="size-4" /> Copy Link</Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <Users className="size-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-xs text-slate-500">Total Referrals</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <Wallet className="size-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">₹200</p>
              <p className="text-xs text-slate-500">Total Earned</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Referral History</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {referralHistory.map((r, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">{r.name.charAt(0)}</div>
                  <div className="flex-1"><p className="text-sm font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-400">{r.date}</p></div>
                  <span className="text-sm font-semibold text-emerald-600">{r.reward}</span>
                  <Badge variant="secondary" className={r.status === 'Earned' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'}>{r.status}</Badge>
                </div>
                {i < referralHistory.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

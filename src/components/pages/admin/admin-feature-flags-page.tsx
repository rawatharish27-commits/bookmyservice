'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ToggleLeft, ToggleRight, Users, Zap, Eye } from 'lucide-react'

const featureFlags = [
  { id: 1, name: 'new_booking_flow', description: 'Redesigned booking flow with step indicators', enabled: true, rollout: 100, users: 'All', lastModified: '22 May 2024' },
  { id: 2, name: 'chat_v2', description: 'Upgraded real-time chat with file sharing', enabled: true, rollout: 50, users: '50% of users', lastModified: '20 May 2024' },
  { id: 3, name: 'ai_recommendations', description: 'AI-powered service recommendations', enabled: false, rollout: 0, users: 'None', lastModified: '18 May 2024' },
  { id: 4, name: 'dark_mode', description: 'Dark mode support for all pages', enabled: true, rollout: 100, users: 'All', lastModified: '15 May 2024' },
  { id: 5, name: 'video_consultation', description: 'Video call feature for remote consultations', enabled: true, rollout: 25, users: '25% of providers', lastModified: '10 May 2024' },
  { id: 6, name: 'loyalty_rewards_v2', description: 'Updated loyalty program with tiers', enabled: false, rollout: 0, users: 'None', lastModified: '05 May 2024' },
]

export function AdminFeatureFlagsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Feature Flags</h1>
          <Badge className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20">{featureFlags.filter(f => f.enabled).length}/{featureFlags.length} Enabled</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Zap className="size-5 text-emerald-600 mx-auto mb-1" /><p className="text-lg font-bold text-emerald-600">{featureFlags.filter(f => f.enabled).length}</p><p className="text-xs text-slate-500">Active Flags</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Users className="size-5 text-[#0A1F44] mx-auto mb-1" /><p className="text-lg font-bold text-[#0A1F44]">{featureFlags.filter(f => f.rollout === 100).length}</p><p className="text-xs text-slate-500">Full Rollout</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-amber-600">{featureFlags.filter(f => f.enabled && f.rollout < 100).length}</p><p className="text-xs text-slate-500">Partial Rollout</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="space-y-0">
            {featureFlags.map((flag, i) => (
              <div key={flag.id}>
                <div className="flex items-center gap-4 py-4">
                  <button className="shrink-0">{flag.enabled ? <ToggleRight className="size-7 text-emerald-500" /> : <ToggleLeft className="size-7 text-slate-300" />}</button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-semibold text-slate-900">{flag.name}</code>
                      <Badge variant="secondary" className={flag.enabled ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5"><span className="text-[10px] text-slate-400">Rollout:</span>
                        <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#FFD54F]/100 rounded-full" style={{ width: `${flag.rollout}%` }} /></div>
                        <span className="text-[10px] font-medium text-slate-500">{flag.rollout}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400">• {flag.users}</span>
                      <span className="text-[10px] text-slate-400">• Modified: {flag.lastModified}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                </div>
                {i < featureFlags.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

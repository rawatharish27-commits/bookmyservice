'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ShieldAlert, Shield, Lock, Globe, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react'

const securityMetrics = [
  { label: '2FA Enabled', value: '3/4 Admins', status: 'Warning' },
  { label: 'Active Sessions', value: '7', status: 'Normal' },
  { label: 'Failed Login Attempts (24h)', value: '12', status: 'Warning' },
  { label: 'Blocked IPs', value: '5', status: 'Normal' },
]

const ipWhitelist = [
  { id: 1, ip: '192.168.1.0/24', description: 'Office Network', addedBy: 'Super Admin' },
  { id: 2, ip: '10.0.0.5', description: 'VPN Gateway', addedBy: 'Super Admin' },
]

const activeSessions = [
  { id: 1, user: 'Super Admin', device: 'Chrome / Windows', ip: '192.168.1.1', lastActive: '2 min ago', current: true },
  { id: 2, user: 'Rakesh Verma', device: 'Firefox / Mac', ip: '192.168.1.2', lastActive: '1 hour ago', current: false },
  { id: 3, user: 'Sneha Reddy', device: 'Safari / iPhone', ip: '192.168.1.3', lastActive: '3 hours ago', current: false },
]

export function AdminSecurityPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Security</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {securityMetrics.map((m) => (
            <Card key={m.label} className="bg-white rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
                <Badge variant="secondary" className={`mt-1 text-[10px] ${m.status === 'Warning' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{m.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Shield className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Two-Factor Authentication</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {['Super Admin', 'Rakesh Verma', 'Sneha Reddy'].map((user, i) => (
              <div key={user}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-full bg-[#FFD54F]/10 text-xs font-bold text-[#0A1F44]">{user.charAt(0)}</div><span className="text-sm font-medium text-slate-900">{user}</span></div>
                  <ToggleRight className="size-6 text-emerald-500" />
                </div>
                {i < 2 && <Separator className="bg-slate-100" />}
              </div>
            ))}
            <div className="flex items-center justify-between py-3"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">A</div><span className="text-sm font-medium text-slate-900">Amit Joshi</span></div><ToggleLeft className="size-6 text-slate-300" /></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Globe className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">IP Whitelist</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {ipWhitelist.map((ip, i) => (
              <div key={ip.id}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-mono font-medium text-slate-900">{ip.ip}</p><p className="text-xs text-slate-400">{ip.description} • Added by {ip.addedBy}</p></div>
                  <Button variant="ghost" size="sm" className="h-7 text-red-500 text-xs">Remove</Button>
                </div>
                {i < ipWhitelist.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
            <div className="pt-3"><Input placeholder="Add IP address (e.g., 192.168.1.0/24)" className="rounded-lg" /></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Smartphone className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Active Sessions</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {activeSessions.map((session, i) => (
              <div key={session.id}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{session.user} {session.current && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] ml-1">Current</Badge>}</p><p className="text-xs text-slate-400">{session.device} • {session.ip} • {session.lastActive}</p></div>
                  {!session.current && <Button variant="ghost" size="sm" className="h-7 text-red-500 text-xs">Revoke</Button>}
                </div>
                {i < activeSessions.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

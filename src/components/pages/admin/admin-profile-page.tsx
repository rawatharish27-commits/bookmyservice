'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { User, Shield, Lock, Smartphone, Save } from 'lucide-react'

export function AdminProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><User className="size-4 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-900">Profile Information</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">SA</div>
              <div><p className="text-lg font-semibold text-slate-900">Super Admin</p><p className="text-sm text-slate-500">admin@bookmyservice.com</p><Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-1">Super Admin</Badge></div>
            </div>
            <Separator className="bg-slate-100" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Full Name</label><Input defaultValue="Super Admin" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Email</label><Input defaultValue="admin@bookmyservice.com" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Phone</label><Input defaultValue="+91 98765 00000" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Department</label><Input defaultValue="Administration" /></div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl"><Save className="size-4" /> Update Profile</Button>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Lock className="size-4 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-900">Change Password</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Current Password</label><Input type="password" placeholder="Enter current password" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">New Password</label><Input type="password" placeholder="Enter new password" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Confirm Password</label><Input type="password" placeholder="Confirm new password" /></div>
            </div>
            <Button variant="outline" className="gap-1 rounded-xl"><Lock className="size-4" /> Update Password</Button>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Shield className="size-4 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-900">Two-Factor Authentication</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <div className="flex items-center gap-3"><Smartphone className="size-5 text-emerald-600" /><div><p className="text-sm font-medium text-emerald-800">2FA is Enabled</p><p className="text-xs text-emerald-600">Using authenticator app</p></div></div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs rounded-lg">Reconfigure 2FA</Button>
              <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 rounded-lg">Disable 2FA</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

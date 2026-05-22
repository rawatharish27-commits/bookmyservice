'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { User, Bell, Shield, CreditCard, ChevronRight, LogOut } from 'lucide-react'

const settingsGroups = [
  {
    title: 'Account',
    icon: User,
    items: [
      { label: 'Edit Profile', desc: 'Name, email, phone' },
      { label: 'Manage Addresses', desc: 'Add, edit, remove addresses' },
      { label: 'Change Password', desc: 'Update your password' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Push Notifications', desc: 'Booking updates, reminders' },
      { label: 'Email Notifications', desc: 'Receipts, promotions' },
      { label: 'SMS Notifications', desc: 'OTP, booking confirmations' },
    ],
  },
  {
    title: 'Privacy & Security',
    icon: Shield,
    items: [
      { label: 'Privacy Settings', desc: 'Data sharing, visibility' },
      { label: 'Two-Factor Auth', desc: 'Add extra security' },
      { label: 'Delete Account', desc: 'Permanently delete account' },
    ],
  },
  {
    title: 'Payments',
    icon: CreditCard,
    items: [
      { label: 'Payment Methods', desc: 'Cards, UPI, wallets' },
      { label: 'Transaction History', desc: 'View all payments' },
    ],
  },
]

export function ClientSettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

        {settingsGroups.map((group) => (
          <Card key={group.title} className="bg-white rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <group.icon className="size-4 text-blue-600" />{group.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {group.items.map((item, i) => (
                <div key={item.label}>
                  <button className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </button>
                  {i < group.items.length - 1 && <Separator className="bg-slate-100" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-5">
          <LogOut className="size-4" /> Log Out
        </Button>
      </div>
    </div>
  )
}

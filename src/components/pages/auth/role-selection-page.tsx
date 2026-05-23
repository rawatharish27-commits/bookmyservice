'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Wrench, CheckCircle, ArrowRight } from 'lucide-react'
import { useApp } from '@/lib/app-context'

const roles = [
  {
    key: 'customer',
    icon: User,
    label: 'Customer',
    desc: 'Book and manage home services, track bookings, make payments, and review providers.',
    features: ['Book services instantly', 'Track real-time progress', 'Secure payments', 'Rate & review'],
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    key: 'provider',
    icon: Wrench,
    label: 'Service Provider',
    desc: 'List your services, manage bookings, grow your business with our platform.',
    features: ['List multiple services', 'Manage appointments', 'Track earnings', 'Build your brand'],
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconBg: 'bg-green-100 text-green-600',
  },
]

export function RoleSelectionPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const { navigate } = useApp()

  const handleContinue = () => {
    if (!selected) return
    navigate('signup', { role: selected })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Choose Your Role</h1>
          <p className="text-slate-500 mt-2">Select how you want to use our platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {roles.map((role) => (
            <Card key={role.key}
              className={`rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selected === role.key ? 'ring-2 ring-offset-2 ring-blue-500 ' + role.color : 'border-slate-100 bg-white hover:border-slate-200'}`}
              onClick={() => setSelected(role.key)}
              role="button"
              tabIndex={0}
              aria-pressed={selected === role.key}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(role.key) }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${selected === role.key ? role.iconBg : 'bg-slate-100 text-slate-600'}`}>
                    <role.icon className="size-6" />
                  </div>
                  {selected === role.key && (
                    <CheckCircle className="size-6 text-blue-600" />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{role.label}</h3>
                <p className="text-sm text-slate-500 mb-4">{role.desc}</p>
                <div className="space-y-2">
                  {role.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle className="size-3.5 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button className="bg-blue-600 hover:bg-blue-700 px-12 py-5 rounded-xl text-base gap-2" disabled={!selected} onClick={handleContinue}>
            Get Started <ArrowRight className="size-5" />
          </Button>
          <p className="text-xs text-slate-400 mt-3">You can change your role later in settings</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { ClientDashboard } from '@/components/dashboards/client-dashboard'
import { ProviderDashboard } from '@/components/dashboards/provider-dashboard'
import { Shield, User, Wrench, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type DashboardRole = 'admin' | 'client' | 'provider'

const roles: { key: DashboardRole; label: string; icon: React.ElementType; color: string; bgGradient: string }[] = [
  { key: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600', bgGradient: 'from-red-500 to-orange-500' },
  { key: 'client', label: 'Client', icon: User, color: 'text-blue-600', bgGradient: 'from-blue-500 to-cyan-500' },
  { key: 'provider', label: 'Service Provider', icon: Wrench, color: 'text-emerald-600', bgGradient: 'from-emerald-500 to-teal-500' },
]

export default function Home() {
  const [activeRole, setActiveRole] = useState<DashboardRole>('admin')
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const currentRole = roles.find(r => r.key === activeRole)!

  return (
    <div className="relative min-h-screen">
      {/* ── Floating Role Switcher ── */}
      <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
        <div className="relative">
          {/* Toggle Button */}
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-6 py-3 font-semibold text-white shadow-2xl transition-all duration-300',
              `bg-gradient-to-r ${currentRole.bgGradient}`,
              'hover:scale-105 hover:shadow-2xl active:scale-95'
            )}
          >
            <currentRole.icon className="size-5" />
            <span>{currentRole.label} Dashboard</span>
            <ChevronDown className={cn('size-4 transition-transform duration-200', switcherOpen && 'rotate-180')} />
          </button>

          {/* Dropdown */}
          {switcherOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setSwitcherOpen(false)}
              />
              <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-2xl border border-gray-100 min-w-[220px]">
                {roles.map(role => (
                  <button
                    key={role.key}
                    onClick={() => {
                      setActiveRole(role.key)
                      setSwitcherOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                      activeRole === role.key
                        ? `bg-gradient-to-r ${role.bgGradient} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <role.icon className={cn('size-5', activeRole !== role.key && role.color)} />
                    <span>{role.label}</span>
                    {activeRole === role.key && (
                      <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-80">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Dashboard Content ── */}
      <div className="transition-opacity duration-300">
        {activeRole === 'admin' && <AdminDashboard />}
        {activeRole === 'client' && <ClientDashboard />}
        {activeRole === 'provider' && <ProviderDashboard />}
      </div>
    </div>
  )
}

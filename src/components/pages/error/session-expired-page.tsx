'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  LogIn,
  Shield,
  ShieldCheck,
  Timer,
  KeyRound,
  AlertTriangle,
  Fingerprint,
  Eye,
  Monitor,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
} from 'lucide-react'

const securityTips = [
  {
    icon: Fingerprint,
    title: 'Enable two-factor authentication',
    description:
      'Add an extra layer of security to prevent unauthorized access to your account.',
  },
  {
    icon: Eye,
    title: 'Always log out from shared devices',
    description:
      "Don't rely on session expiry alone on public or shared computers.",
  },
  {
    icon: Monitor,
    title: 'Check active sessions regularly',
    description:
      'Review your account settings to see all devices currently logged in.',
  },
]

export function SessionExpiredPage() {
  const [showSecurityTips, setShowSecurityTips] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const handleLogin = () => {
    setRedirecting(true)
    // Simulate redirect
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 to-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Session Expired Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          {/* Top decorative band */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          <CardContent className="p-8 text-center space-y-6">
            {/* Large clock icon */}
            <div className="relative mx-auto">
              <div className="flex size-28 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-100">
                <Clock className="size-14 text-amber-600" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="flex size-9 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100">
                  <Timer className="size-4 text-amber-500" />
                </div>
              </div>
              {/* Animated ring to suggest time passing */}
              <svg
                className="absolute inset-0 size-28 animate-[spin_10s_linear_infinite]"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                  className="text-amber-200"
                />
              </svg>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                <Timer className="size-3 mr-1" /> Session Timed Out
              </Badge>
              <h1 className="text-2xl font-bold text-slate-900">
                Session Expired
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                Your session has expired due to inactivity. For your security,
                we automatically sign you out after 30 minutes of no activity.
              </p>
            </div>

            {/* Stay logged in info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50/60 border border-[#1D63FF]/10 text-left">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1D63FF]/10">
                <Info className="size-4 text-[#1D63FF]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0B3D91]">
                  Stay logged in longer
                </p>
                <p className="text-xs text-[#1D63FF]">
                  Check &quot;Remember me&quot; on the login page to extend your
                  session to 7 days.
                </p>
              </div>
            </div>

            {/* Login button */}
            <Button
              className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] gap-2 rounded-xl py-5"
              onClick={handleLogin}
              disabled={redirecting}
            >
              <LogIn className="size-4" />
              {redirecting
                ? 'Redirecting to Login...'
                : 'Log In Again'}
              {!redirecting && <ArrowRight className="size-4" />}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 border-slate-200 rounded-xl"
              onClick={() => window.history.back()}
            >
              Continue Browsing as Guest
            </Button>
          </CardContent>
        </Card>

        {/* What happened card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                What happened?
              </h3>
            </div>
            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <Clock className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Session timed out
                  </p>
                  <p className="text-xs text-slate-500">
                    No activity was detected for 30 minutes, so we ended your
                    session to protect your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <Shield className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Your data is safe
                  </p>
                  <p className="text-xs text-slate-500">
                    No data was lost. Any unsaved work in your current session
                    has been preserved as a draft.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <KeyRound className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Quick re-login
                  </p>
                  <p className="text-xs text-slate-500">
                    Log in again to pick up right where you left off. Your
                    bookings and settings are waiting for you.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips (collapsible) */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowSecurityTips(!showSecurityTips)}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#1D63FF]" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Security Tips
                </h3>
              </div>
              {showSecurityTips ? (
                <ChevronUp className="size-4 text-slate-400" />
              ) : (
                <ChevronDown className="size-4 text-slate-400" />
              )}
            </button>

            {showSecurityTips && (
              <>
                <Separator />
                <div className="space-y-3">
                  {securityTips.map((tip) => (
                    <div
                      key={tip.title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <tip.icon className="size-4 text-[#1D63FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {tip.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Automatic sign-out protects your account from unauthorized access. 🔒
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ExternalLink,
  Mail,
  Clock,
  ShieldCheck,
  Server,
} from 'lucide-react'

export function ServerErrorPage() {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 to-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Error Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          {/* Top decorative band */}
          <div className="h-2 bg-gradient-to-r from-red-400 via-orange-400 to-amber-400" />

          <CardContent className="p-8 text-center space-y-6">
            {/* Large warning icon */}
            <div className="relative mx-auto">
              <div className="flex size-28 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
                <AlertTriangle className="size-14 text-red-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <div className="flex size-9 items-center justify-center rounded-full bg-white shadow-md border border-slate-100">
                  <Server className="size-4 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="destructive" className="text-xs font-mono">
                  500
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Something Went Wrong
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                Our servers are having a moment. This isn&apos;t your fault — our
                team has been notified and is working on a fix. Please try again
                in a moment.
              </p>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-xs font-medium text-amber-700">
                Issue detected — team is investigating
              </span>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] gap-2 rounded-xl py-5"
                onClick={handleRetry}
                disabled={retrying}
              >
                <RefreshCw
                  className={`size-4 ${retrying ? 'animate-spin' : ''}`}
                />
                {retrying ? 'Retrying...' : 'Try Again'}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-slate-200 rounded-xl"
                  onClick={() => (window.location.href = '/')}
                >
                  <Home className="size-4" /> Go Home
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-slate-200 rounded-xl"
                >
                  <ExternalLink className="size-4" /> Status Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful info card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              What can you do?
            </h3>
            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <RefreshCw className="size-4 text-[#1D63FF]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Refresh the page
                  </p>
                  <p className="text-xs text-slate-500">
                    Sometimes a quick refresh resolves the issue.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="size-4 text-[#1D63FF]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Try again later
                  </p>
                  <p className="text-xs text-slate-500">
                    Our engineers are already on it. Most issues are resolved
                    within minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <ShieldCheck className="size-4 text-[#1D63FF]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Your data is safe
                  </p>
                  <p className="text-xs text-slate-500">
                    No data was lost. All your bookings and information remain
                    intact.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report issue link */}
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Still having trouble?{' '}
            <button className="text-[#1D63FF] hover:underline inline-flex items-center gap-1">
              <Mail className="size-3" /> Report the issue
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

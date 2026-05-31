'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Home,
  CheckCircle2,
  AlertCircle,
  Router,
  Smartphone,
  Globe,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const troubleshootingSteps = [
  {
    icon: Router,
    title: 'Check your Wi-Fi router',
    description:
      'Make sure your router is turned on and the indicator lights are active. Try restarting it if needed.',
  },
  {
    icon: Smartphone,
    title: 'Toggle airplane mode',
    description:
      'Turn airplane mode on for 10 seconds, then turn it off. This refreshes your network connection.',
  },
  {
    icon: Globe,
    title: 'Try a different network',
    description:
      'Switch between Wi-Fi and mobile data to see if the issue is with a specific network.',
  },
  {
    icon: Database,
    title: 'Clear browser cache',
    description:
      'Old cached data can sometimes cause connectivity issues. Clear your browser cache and try again.',
  },
]

export function NoInternetPage() {
  const [retrying, setRetrying] = useState(false)
  const [showTips, setShowTips] = useState(true)

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      window.location.reload()
      setRetrying(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Offline Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          {/* Top decorative band */}
          <div className="h-2 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />

          <CardContent className="p-8 text-center space-y-6">
            {/* Large WiFi-off icon */}
            <div className="relative mx-auto">
              <div className="flex size-28 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-200/60">
                <WifiOff className="size-14 text-slate-500" strokeWidth={1.5} />
              </div>
              <div className="absolute top-1 right-0">
                <div className="flex size-8 items-center justify-center rounded-full bg-red-100 shadow-sm">
                  <AlertCircle className="size-4 text-red-500" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                No Internet Connection
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                It seems you&apos;ve lost your connection. Don&apos;t worry — some
                features may still be available from cached data.
              </p>
            </div>

            {/* Retry button */}
            <Button
              className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-2 rounded-xl py-5"
              onClick={handleRetry}
              disabled={retrying}
            >
              <RefreshCw
                className={`size-4 ${retrying ? 'animate-spin' : ''}`}
              />
              {retrying ? 'Checking Connection...' : 'Retry Connection'}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 border-slate-200 rounded-xl"
              onClick={() => (window.location.href = '/')}
            >
              <Home className="size-4" /> Go Home
            </Button>
          </CardContent>
        </Card>

        {/* Cached Content Notice */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle2 className="size-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Cached content available
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can still browse previously viewed services and your booking
                  history while offline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Tips */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowTips(!showTips)}
            >
              <div className="flex items-center gap-2">
                <Wifi className="size-4 text-[#1D63FF]" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Troubleshooting Tips
                </h3>
              </div>
              {showTips ? (
                <ChevronUp className="size-4 text-slate-400" />
              ) : (
                <ChevronDown className="size-4 text-slate-400" />
              )}
            </button>

            {showTips && (
              <>
                <Separator />
                <div className="space-y-3">
                  {troubleshootingSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <step.icon className="size-4 text-[#1D63FF]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1D63FF]">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-700">
                            {step.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 ml-5">
                          {step.description}
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
          Your connection will be restored automatically when internet is
          available. 📡
        </p>
      </div>
    </div>
  )
}

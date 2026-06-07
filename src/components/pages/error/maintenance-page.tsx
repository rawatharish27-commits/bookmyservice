'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Wrench,
  Clock,
  Mail,
  MessageCircle,
  Camera,
  Globe,
  ArrowRight,
  CheckCircle2,
  Bell,
  Cog,
} from 'lucide-react'

export function MaintenancePage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [progress, setProgress] = useState(72)

  // Simulated progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95
        return prev + Math.random() * 2
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1F44]/5 to-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Maintenance Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          {/* Top decorative band */}
          <div className="h-2 bg-gradient-to-r from-blue-400 via-[#0A1F44] to-[#FFD54F]" />

          <CardContent className="p-8 text-center space-y-6">
            {/* Animated wrench icon */}
            <div className="relative mx-auto">
              <div className="flex size-28 items-center justify-center rounded-full bg-[#FFD54F]/10 ring-4 ring-[#0A1F44]/20">
                <Wrench className="size-14 text-[#0A1F44]" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100">
                  <Cog className="size-5 text-slate-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <Badge className="bg-[#FFD54F]/10 text-[#0A1F44] hover:bg-[#FFD54F]/10 border-[#0A1F44]/10">
                <Clock className="size-3 mr-1" /> Scheduled Maintenance
              </Badge>
              <h1 className="text-2xl font-bold text-slate-900">
                We&apos;ll Be Right Back
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                We&apos;re making some improvements to serve you better. Our team is
                working hard to get everything back online as quickly as possible.
              </p>
            </div>

            {/* Estimated downtime */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-[#FFD54F]/10/60 border border-[#0A1F44]/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A1F44]">~15</p>
                <p className="text-xs text-[#FFD54F]/800 font-medium">Minutes</p>
              </div>
              <div className="h-8 w-px bg-blue-200" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Started at
                </p>
                <p className="text-xs text-slate-500">2:00 AM IST</p>
              </div>
              <div className="h-8 w-px bg-blue-200" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Expected by
                </p>
                <p className="text-xs text-slate-500">2:15 AM IST</p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Maintenance Progress
                </span>
                <span className="text-[#0A1F44] font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
              <p className="text-xs text-slate-400">
                Applying database optimizations...
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Notification Signup */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-[#0A1F44]" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Get Notified
              </h3>
            </div>
            <Separator />

            {subscribed ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    You&apos;re on the list!
                  </p>
                  <p className="text-xs text-green-600">
                    We&apos;ll email you as soon as we&apos;re back online.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your email and we&apos;ll notify you the moment we&apos;re
                  back up and running.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 rounded-xl border-slate-200"
                    />
                  </div>
                  <Button
                    className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white gap-1 rounded-xl px-4"
                    onClick={handleSubscribe}
                  >
                    Notify Me <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Follow for Updates
            </h3>
            <Separator />
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors text-sky-600 text-sm font-medium">
                <MessageCircle className="size-4" /> Twitter / X
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors text-pink-600 text-sm font-medium">
                <Camera className="size-4" /> Instagram
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD54F]/10 hover:bg-[#FFD54F]/10 transition-colors text-[#0A1F44] text-sm font-medium">
                <Globe className="size-4" /> Facebook
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          We apologize for the inconvenience. Thank you for your patience. 🛠️
        </p>
      </div>
    </div>
  )
}

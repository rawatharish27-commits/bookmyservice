'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Lock,
  ArrowLeft,
  Mail,
  MessageCircle,
  KeyRound,
  UserX,
  Eye,
  FileWarning,
  Headphones,
} from 'lucide-react'

const reasons = [
  {
    icon: KeyRound,
    title: 'Insufficient permissions',
    description:
      "Your account doesn't have the required role to view this page.",
  },
  {
    icon: UserX,
    title: 'Account restrictions',
    description:
      'Your account may have restrictions applied. Contact support for details.',
  },
  {
    icon: Eye,
    title: 'Private resource',
    description:
      'This page is restricted to authorized personnel only.',
  },
]

export function AccessDeniedPage() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitRequest = () => {
    if (reason) {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/40 to-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main 403 Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100 overflow-hidden">
          {/* Top decorative band */}
          <div className="h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />

          <CardContent className="p-8 text-center space-y-6">
            {/* Large shield icon */}
            <div className="relative mx-auto">
              <div className="flex size-28 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
                <Shield className="size-14 text-red-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100">
                  <Lock className="size-5 text-red-400" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="destructive" className="text-xs font-mono">
                  403
                </Badge>
                <Badge variant="outline" className="text-xs border-red-200 text-red-500">
                  Forbidden
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Access Denied
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                You don&apos;t have permission to access this page. This could be
                due to your account role or the page may be restricted.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-slate-200 rounded-xl py-5"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="size-4" /> Go Back
              </Button>
              <Button
                className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] gap-2 rounded-xl py-5"
                onClick={() => setShowRequestForm(!showRequestForm)}
              >
                <KeyRound className="size-4" /> Request Access
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Request Access Form */}
        {showRequestForm && !submitted && (
          <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileWarning className="size-4 text-[#1D63FF]" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Request Access
                </h3>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Tell us why you need access to this page and we&apos;ll review
                  your request.
                </p>
                <Input
                  placeholder="Your name"
                  className="rounded-xl border-slate-200"
                />
                <Input
                  placeholder="Your email"
                  type="email"
                  className="rounded-xl border-slate-200"
                />
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need access to this page?"
                  className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <Button
                  className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl py-5"
                  onClick={handleSubmitRequest}
                >
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submitted confirmation */}
        {submitted && (
          <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <Mail className="size-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Request submitted!
                  </p>
                  <p className="text-xs text-green-600">
                    Our team will review your request and get back to you within
                    24 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Why am I seeing this? */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-100">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Why am I seeing this?
            </h3>
            <Separator />
            <div className="space-y-3">
              {reasons.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <item.icon className="size-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Need help?{' '}
            <button className="text-[#1D63FF] hover:underline inline-flex items-center gap-1">
              <Headphones className="size-3" /> Contact Support
            </button>
            {' '}or{' '}
            <button className="text-[#1D63FF] hover:underline inline-flex items-center gap-1">
              <MessageCircle className="size-3" /> Chat with us
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

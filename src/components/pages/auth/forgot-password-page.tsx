'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/lib/app-context'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { navigate } = useApp()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      // Always show success message even if email doesn't exist (anti-enumeration)
      setSent(true)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#FFD54F]/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="size-8 text-[#0A1F44]" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
            <p className="text-slate-500 text-sm mt-2">No worries! Enter your email address and we&apos;ll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2" role="alert">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}

          {sent ? (
            <div className="text-center">
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <p className="font-semibold text-emerald-700">Reset link sent!</p>
                <p className="text-sm text-slate-500">Check your email inbox for the password reset link.</p>
              </div>
              <Button className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white py-5 rounded-xl mt-4" onClick={() => navigate('login')}>
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="text-xs font-medium text-slate-700 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 rounded-xl border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white py-5 rounded-xl gap-2" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <Separator className="my-6" />

          <div className="text-center">
            <button className="text-sm text-slate-500 hover:text-[#0A1F44] flex items-center justify-center gap-1 mx-auto" onClick={() => navigate('login')}>
              <ArrowLeft className="size-4" /> Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

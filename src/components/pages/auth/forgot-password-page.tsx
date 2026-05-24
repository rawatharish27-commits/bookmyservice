'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/lib/app-context'

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { navigate } = useApp()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <Mail className="size-8 text-blue-600" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
            <p className="text-slate-500 text-sm mt-2">No worries! Enter your email address and we&apos;ll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">{error}</div>
          )}

          {sent ? (
            <div className="text-center">
              <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm mb-4">
                Reset link sent! Check your email inbox.
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 py-5 rounded-xl" onClick={() => navigate('login')}>
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="text-xs font-medium text-slate-700 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input id="resetEmail" type="email" placeholder="Enter your email" className="pl-10 rounded-xl border-slate-200" required />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-xl gap-2" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <Separator className="my-6" />

          <div className="text-center">
            <button className="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto" onClick={() => navigate('login')}>
              <ArrowLeft className="size-4" /> Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

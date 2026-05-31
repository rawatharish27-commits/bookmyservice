'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Mail, CheckCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'

export function EmailVerificationPage() {
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { navigate } = useApp()

  const handleResend = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setResent(true)
      setTimeout(() => setResent(false), 3000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="size-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your email has been successfully verified. You can now access all features.
          </p>

          <Button className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white py-5 rounded-xl gap-2" onClick={() => navigate('client-dashboard')}>
            Continue to Dashboard <ArrowRight className="size-4" />
          </Button>

          <Separator className="my-6" />

          <div className="space-y-3">
            <p className="text-sm text-slate-500">Didn&apos;t verify yet?</p>
            <Button variant="outline" className="rounded-xl gap-2" onClick={handleResend} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              {resent ? 'Email Sent!' : 'Resend Verification'}
            </Button>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            Need help? <button className="text-[#1D63FF] hover:underline" onClick={() => navigate('login')}>Contact Support</button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

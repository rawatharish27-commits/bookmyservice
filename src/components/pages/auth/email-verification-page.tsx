'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Mail, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react'

export function EmailVerificationPage() {
  const [resent, setResent] = useState(false)

  const handleResend = () => {
    setResent(true)
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8 text-center">
          {/* Success Animation */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="size-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your email address <span className="font-semibold text-slate-700">john@example.com</span> has been successfully verified. You can now access all features.
          </p>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-xl gap-2">
            Continue to Dashboard <ArrowRight className="size-4" />
          </Button>

          <Separator className="my-6" />

          <div className="space-y-3">
            <p className="text-sm text-slate-500">Didn&apos;t verify yet?</p>
            <Button variant="outline" className="rounded-xl gap-2" onClick={handleResend}>
              <RotateCcw className="size-4" />
              {resent ? 'Email Sent!' : 'Resend Verification'}
            </Button>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

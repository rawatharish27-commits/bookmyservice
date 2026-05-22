'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export function SocialCallbackPage() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Authenticating...')

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setStatus('Redirecting to dashboard...')
          return 100
        }
        return prev + 2
      })
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-10 text-center">
          {/* Spinning Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="size-8 text-blue-600" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">{status}</h2>
          <p className="text-sm text-slate-500 mb-6">Verifying your account with Google</p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400">{progress}%</p>

          <p className="text-xs text-slate-400 mt-6">
            This will only take a moment. Please don&apos;t close this page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

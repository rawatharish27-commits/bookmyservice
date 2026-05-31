'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Smartphone, Shield, RotateCcw, Phone, Loader2 } from 'lucide-react'
import { useApp } from '@/lib/app-context'

export function PhoneVerificationPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { navigate } = useApp()

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      const next = document.getElementById(`phone-otp-${index + 1}`)
      next?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`phone-otp-${index - 1}`)
      prev?.focus()
    }
  }

  const handleVerify = () => {
    if (otp.some(d => !d)) { setError('Please enter all 6 digits'); return }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setLoading(false)
      navigate('role-selection')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1D63FF]/10 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="size-8 text-[#1D63FF]" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Verify Phone Number</h2>
            <p className="text-slate-500 text-sm mt-2">We&apos;ve sent a 6-digit verification code</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">{error}</div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center gap-3 mb-6" role="group" aria-label="Phone verification code">
            {otp.map((digit, i) => (
              <Input key={i} id={`phone-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                value={digit} onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                aria-label={`Digit ${i + 1}`} />
            ))}
          </div>

          <Button className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] text-white py-5 rounded-xl gap-2" onClick={handleVerify} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />} {loading ? 'Verifying...' : 'Verify Number'}
          </Button>

          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in <span className="font-bold text-[#1D63FF]">{timer}s</span>
              </p>
            ) : (
              <button onClick={() => setTimer(30)} className="text-sm text-[#1D63FF] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto">
                <RotateCcw className="size-3" /> Resend Code
              </button>
            )}
          </div>

          <Separator className="my-6" />

          <p className="text-center text-xs text-slate-400">
            By verifying, you agree to our <button className="text-[#1D63FF] hover:underline">Terms</button> and <button className="text-[#1D63FF] hover:underline">Privacy Policy</button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Eye, EyeOff, Shield, CheckCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '@/lib/app-context'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { navigate } = useApp()

  // Get token from URL params
  const [token] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('token') || ''
    }
    return ''
  })

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Contains a number', pass: /[0-9]/.test(password) },
    { label: 'Contains special character', pass: /[^A-Za-z0-9]/.test(password) },
  ]

  const strength = checks.filter(c => c.pass).length
  const strengthColor = strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-amber-500' : strength <= 4 ? 'bg-green-500' : 'bg-emerald-500'
  const strengthLabel = strength <= 2 ? 'Weak' : strength <= 3 ? 'Fair' : strength <= 4 ? 'Good' : 'Strong'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (strength < 3) {
      setError('Password is not strong enough')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }
      setSuccess(true)
      setTimeout(() => navigate('login'), 3000)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="size-12 text-emerald-500" />
              <h2 className="text-2xl font-bold text-slate-900">Password Reset!</h2>
              <p className="text-slate-500 text-sm">Your password has been reset successfully. Redirecting to login...</p>
              <Button className="bg-[#1D63FF] hover:bg-[#0B3D91] py-5 rounded-xl mt-4" onClick={() => navigate('login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1D63FF]/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="size-8 text-[#1D63FF]" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
            <p className="text-slate-500 text-sm mt-2">Create a new password for your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2" role="alert">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="text-xs font-medium text-slate-700 mb-1 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 rounded-xl border-slate-200"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="size-4 text-slate-400" /> : <Eye className="size-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-amber-500' : 'text-green-500'}`}>
                {strengthLabel}
              </p>
            </div>

            {/* Password Checks */}
            <div className="space-y-1.5">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`size-3.5 ${c.pass ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className={c.pass ? 'text-slate-700' : 'text-slate-400'}>{c.label}</span>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700 mb-1 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="pl-10 pr-10 rounded-xl border-slate-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                  {showConfirm ? <EyeOff className="size-4 text-slate-400" /> : <Eye className="size-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#1D63FF] hover:bg-[#0B3D91] py-5 rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null} {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

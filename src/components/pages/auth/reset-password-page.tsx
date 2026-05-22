'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')

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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="size-8 text-blue-600" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
            <p className="text-slate-500 text-sm mt-2">Create a new password for your account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password" className="pl-10 pr-10 rounded-xl border-slate-200" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
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
              <label className="text-xs font-medium text-slate-700 mb-1 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter new password" className="pl-10 pr-10 rounded-xl border-slate-200" />
                <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirm ? <EyeOff className="size-4 text-slate-400" /> : <Eye className="size-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-xl">Reset Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { User, Wrench, ArrowRight, ArrowLeft, CheckCircle, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/lib/app-context'

const roles = [
  { key: 'customer', icon: User, label: 'Customer', desc: 'Book and manage home services', color: 'bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/30' },
  { key: 'provider', icon: Wrench, label: 'Service Provider', desc: 'Offer your professional services', color: 'bg-green-100 text-green-600 border-green-300' },
]

export function SignupPage() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { navigate } = useApp()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setLoading(false)
      navigate('otp-verification')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6" aria-label="Signup progress">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-[#0A1F44] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s ? <CheckCircle className="size-4" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-[#0A1F44]' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? 'Choose your role to get started' : step === 2 ? 'Tell us about yourself' : 'Secure your account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">{error}</div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-3">
              {roles.map((role) => (
                <button key={role.key} onClick={() => setSelectedRole(role.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedRole === role.key ? role.color : 'border-slate-100 hover:border-slate-200'}`}>
                  <div className={`p-2 rounded-lg ${selectedRole === role.key ? '' : 'bg-slate-100'}`}>
                    <role.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{role.label}</p>
                    <p className="text-xs text-slate-500">{role.desc}</p>
                  </div>
                  {selectedRole === role.key && <CheckCircle className="size-5 ml-auto text-current" />}
                </button>
              ))}
              <Button className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white py-5 rounded-xl mt-4" disabled={!selectedRole}
                onClick={() => setStep(2)}>Continue <ArrowRight className="size-4 ml-1" /></Button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-slate-700 mb-1 block" htmlFor="firstName">First Name</label><Input id="firstName" placeholder="John" className="rounded-xl border-slate-200" required /></div>
                <div><label className="text-xs font-medium text-slate-700 mb-1 block" htmlFor="lastName">Last Name</label><Input id="lastName" placeholder="Doe" className="rounded-xl border-slate-200" required /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block" htmlFor="email">Email</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" /><Input id="email" type="email" placeholder="john@example.com" className="pl-10 rounded-xl border-slate-200" required /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block" htmlFor="phone">Phone</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" /><Input id="phone" type="tel" placeholder="+91 9876543210" className="pl-10 rounded-xl border-slate-200" required /></div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => setStep(1)}><ArrowLeft className="size-4 mr-1" /> Back</Button>
                <Button type="submit" className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl flex-1">Continue <ArrowRight className="size-4 ml-1" /></Button>
              </div>
            </form>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="pl-10 pr-10 rounded-xl border-slate-200" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="size-4 text-slate-400" /> : <Eye className="size-4 text-slate-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input id="confirmPassword" type="password" placeholder="Re-enter your password" className="pl-10 rounded-xl border-slate-200" required />
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className="mt-1 rounded border-slate-300" required />
                I agree to the <button type="button" className="text-[#0A1F44] hover:underline">Terms of Service</button> and <button type="button" className="text-[#0A1F44] hover:underline">Privacy Policy</button>
              </label>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => setStep(2)}><ArrowLeft className="size-4 mr-1" /> Back</Button>
                <Button type="submit" className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl flex-1" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <button className="text-[#0A1F44] font-semibold hover:underline" onClick={() => navigate('login')}>Sign In</button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

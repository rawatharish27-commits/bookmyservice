'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Wrench, Users, ArrowRight, ArrowLeft, CheckCircle, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'

const roles = [
  { key: 'customer', icon: User, label: 'Customer', desc: 'Book and manage home services', color: 'bg-blue-100 text-blue-600 border-blue-300' },
  { key: 'provider', icon: Wrench, label: 'Service Provider', desc: 'Offer your professional services', color: 'bg-green-100 text-green-600 border-green-300' },
  { key: 'technician', icon: Users, label: 'Technician', desc: 'Join as a skilled technician', color: 'bg-purple-100 text-purple-600 border-purple-300' },
]

export function SignupPage() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg bg-white rounded-xl shadow-sm border-slate-100">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s ? <CheckCircle className="size-4" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? 'Choose your role to get started' : step === 2 ? 'Tell us about yourself' : 'Secure your account'}
            </p>
          </div>

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
              <Button className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-xl mt-4" disabled={!selectedRole}
                onClick={() => setStep(2)}>Continue <ArrowRight className="size-4 ml-1" /></Button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-slate-700 mb-1 block">First Name</label><Input placeholder="John" className="rounded-xl border-slate-200" /></div>
                <div><label className="text-xs font-medium text-slate-700 mb-1 block">Last Name</label><Input placeholder="Doe" className="rounded-xl border-slate-200" /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Email</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" /><Input placeholder="john@example.com" className="pl-10 rounded-xl border-slate-200" /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Phone</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" /><Input placeholder="+91 9876543210" className="pl-10 rounded-xl border-slate-200" /></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl flex-1" onClick={() => setStep(1)}><ArrowLeft className="size-4 mr-1" /> Back</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1" onClick={() => setStep(3)}>Continue <ArrowRight className="size-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="pl-10 pr-10 rounded-xl border-slate-200" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="size-4 text-slate-400" /> : <Eye className="size-4 text-slate-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input type="password" placeholder="Re-enter your password" className="pl-10 rounded-xl border-slate-200" />
                </div>
              </div>
              {/* Strength Indicator */}
              <div className="space-y-1">
                <div className="flex gap-1">
                  <div className="flex-1 h-1.5 rounded-full bg-green-500" />
                  <div className="flex-1 h-1.5 rounded-full bg-green-500" />
                  <div className="flex-1 h-1.5 rounded-full bg-amber-500" />
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200" />
                </div>
                <p className="text-xs text-amber-600">Medium strength — add a special character</p>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className="mt-1 rounded border-slate-300" />
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl flex-1" onClick={() => setStep(2)}><ArrowLeft className="size-4 mr-1" /> Back</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1">Create Account</Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <a href="#" className="text-blue-600 font-semibold hover:underline">Sign In</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

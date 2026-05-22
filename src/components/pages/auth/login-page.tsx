'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Mail, Phone, Lock, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Left Gradient Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 flex flex-col justify-center px-12">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-blue-100 text-lg mb-8">Log in to access your dashboard, track bookings, and manage services.</p>
          <div className="space-y-4">
            {['✓ Book services in seconds', '✓ Track real-time progress', '✓ Manage payments & invoices', '✓ Rate & review providers'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-blue-100">
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md bg-white rounded-xl shadow-sm border-slate-100">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
              <p className="text-slate-500 text-sm mt-1">Access your account</p>
            </div>

            {/* Method Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Mail className="size-4 inline mr-1" /> Email
              </button>
              <button onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Phone className="size-4 inline mr-1" /> Phone
              </button>
            </div>

            <div className="space-y-4">
              {loginMethod === 'email' ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input placeholder="Enter your email" className="pl-10 rounded-xl border-slate-200" />
                </div>
              ) : (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input placeholder="Enter your phone number" className="pl-10 rounded-xl border-slate-200" />
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="pl-10 pr-10 rounded-xl border-slate-200" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="size-4 text-slate-400" /> : <Eye className="size-4 text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300" /> Remember me
                </label>
                <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-xl">Sign In <ArrowRight className="size-4 ml-1" /></Button>
            </div>

            <Separator className="my-6" />

            {/* Social Login */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-xl py-5 gap-2">
                <span className="text-lg">G</span> Continue with Google
              </Button>
              <Button variant="outline" className="w-full rounded-xl py-5 gap-2">
                <span className="text-lg">🍎</span> Continue with Apple
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account? <a href="#" className="text-blue-600 font-semibold hover:underline">Sign Up</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

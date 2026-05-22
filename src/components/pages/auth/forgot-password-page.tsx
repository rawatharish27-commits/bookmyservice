'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Mail, ArrowLeft, Send } from 'lucide-react'

export function ForgotPasswordPage() {
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

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input placeholder="Enter your email" className="pl-10 rounded-xl border-slate-200" />
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-xl gap-2">
              <Send className="size-4" /> Send Reset Link
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <a href="#" className="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1">
              <ArrowLeft className="size-4" /> Back to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

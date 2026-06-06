'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { apiUrl } from '@/lib/api-url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, ShieldCheck, KeyRound,
} from 'lucide-react';

export function ResetPasswordPage() {
  const { navigate } = useApp();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Parse token and email from URL query params
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const e = params.get('email');
    if (t) setToken(t);
    if (e) setEmail(e);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#132D5E] to-[#FFD54F] text-white shadow-lg shadow-[#FFD54F]/25">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1F44]">Password Reset!</h2>
            <p className="mt-2 text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => navigate('login')}
              className="mt-6 h-11 rounded-xl bg-gradient-to-r from-[#132D5E] via-[#FFD54F] to-[#E0B84C] px-6 text-white shadow-lg shadow-[#FFD54F]/25 hover:from-[#0A1F44] hover:via-[#132D5E] hover:to-[#FFD54F]"
            >
              Go to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD54F]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FFD54F]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => navigate('login')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#FFD54F] mb-6 transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Login
        </motion.button>

        <div className="rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-200/50 relative overflow-hidden bg-white/70 backdrop-blur-xl">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#132D5E] via-[#FFD54F] to-[#E0B84C]" />

          <div className="relative pointer-events-auto text-center pt-8 pb-2 px-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#132D5E] via-[#FFD54F] to-[#E0B84C] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25"
            >
              <KeyRound className="size-8" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 pt-5 px-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200/70"
                >
                  <div className="size-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {!token && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-800">
                    No reset token found. Please request a new password reset link from the login page.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium text-foreground/80">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white/60 border-gray-200 focus:border-[#FFD54F] focus:ring-[#FFD54F]/20 focus:bg-white/80 transition-all rounded-xl"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-foreground/80">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-10 pr-11 h-11 bg-white/60 border-gray-200 focus:border-[#FFD54F] focus:ring-[#FFD54F]/20 focus:bg-white/80 transition-all rounded-xl"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground/80">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-white/60 border-gray-200 focus:border-[#FFD54F] focus:ring-[#FFD54F]/20 focus:bg-white/80 transition-all rounded-xl"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pt-6 pb-6">
              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full shimmer bg-gradient-to-r from-[#132D5E] via-[#FFD54F] to-[#E0B84C] hover:from-[#0A1F44] hover:via-[#132D5E] hover:to-[#FFD54F] shadow-lg shadow-[#FFD54F]/25 transition-all duration-300 h-12 rounded-xl text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 size-5" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

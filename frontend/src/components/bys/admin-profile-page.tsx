'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Clock,
  AlertCircle,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function formatLastLogin(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AdminProfilePage() {
  const { user, token } = useAuth();
  const { navigate } = useApp();
  const { mutate, loading } = useApiMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1F44] to-[#FFD54F] text-white shadow-lg">
            <Shield className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A1F44]">Access Restricted</h2>
          <p className="mt-2 text-muted-foreground">Please log in to view the admin profile</p>
          <Button
            className="mt-6 rounded-xl bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F] text-white shadow-lg shadow-[#132D5E]/25"
            onClick={() => navigate('login')}
          >
            Log In
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    try {
      await mutate('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSuccess(true);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    }
  };

  const profileDetails = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
    { icon: Shield, label: 'Role', value: user.role },
    { icon: Clock, label: 'Last Login', value: formatLastLogin(user.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1F44] via-[#132D5E] to-[#FFD54F] p-10 sm:p-14"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-white/5" />
          <div className="absolute right-1/4 top-1/3 size-40 rounded-full bg-white/[0.03]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>
        <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4 sm:mb-0 sm:mr-6"
          >
            <div className="rounded-full bg-white/15 p-[3px] backdrop-blur-sm">
              <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0A1F44] to-[#132D5E] ring-2 ring-white/20 sm:size-24">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white sm:text-3xl">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <div className="flex size-7 items-center justify-center rounded-lg bg-white/15">
                  <Shield className="size-4 text-[#FFD54F]" />
                </div>
                <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-[#FFD54F] backdrop-blur-sm">
                  {user.role}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{user.name}</h1>
              <p className="mt-1 text-[#E0B84C]">{user.email}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Profile Details Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] text-white shadow-md">
                    <User className="size-4" />
                  </div>
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {profileDetails.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
                    className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#FFD54F]/5"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F]/5 to-[#FFD54F]/10 text-[#FFD54F] group-hover:from-[#FFD54F]/10 group-hover:to-[#132D5E]/10">
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-semibold text-[#0A1F44]">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <Separator className="my-3" />

                {/* Account Status */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.3 }}
                  className="flex items-center gap-3 rounded-xl p-3"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      user.status === 'ACTIVE'
                        ? 'bg-[#FFD54F]/10 text-[#FFD54F]'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Account Status
                    </p>
                    <p className="text-sm font-semibold text-[#0A1F44]">{user.status}</p>
                  </div>
                  <span
                    className={`size-2.5 rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-[#FFD54F]' : 'bg-amber-400'
                    }`}
                  />
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#132D5E] to-[#FFD54F] text-white shadow-md">
                    <Lock className="size-4" />
                  </div>
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-5 text-sm text-muted-foreground">
                  Update your password to keep your admin account secure. Choose a strong password
                  with at least 8 characters.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Success Message */}
                  <AnimatePresence>
                    {passwordSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="flex items-center gap-2 rounded-xl border border-[#FFD54F]/30 bg-[#FFD54F]/10 px-4 py-3 text-sm text-[#132D5E]"
                      >
                        <CheckCircle2 className="size-4 shrink-0" />
                        Password changed successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {passwordError && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        <AlertCircle className="size-4 shrink-0" />
                        {passwordError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        autoComplete="current-password"
                        className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 pr-10 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#FFD54F]"
                        tabIndex={-1}
                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password (min. 8 characters)"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 pr-10 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#FFD54F]"
                        tabIndex={-1}
                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                newPassword.length >= level * 4
                                  ? level <= 1
                                    ? 'bg-red-400'
                                    : level <= 2
                                    ? 'bg-amber-400'
                                    : level <= 3
                                    ? 'bg-[#FFD54F]'
                                    : 'bg-[#FFD54F]'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {newPassword.length < 4
                            ? 'Weak password'
                            : newPassword.length < 8
                            ? 'Moderate — needs at least 8 characters'
                            : newPassword.length < 12
                            ? 'Strong password'
                            : 'Very strong password'}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 pr-10 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#FFD54F]"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        {newPassword === confirmPassword ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-[#E0B84C]" />
                            <span className="text-xs font-medium text-[#FFD54F]">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="size-3.5 text-amber-500" />
                            <span className="text-xs text-amber-600">Passwords do not match</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <Separator className="my-2" />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F] text-base font-medium text-white shadow-lg shadow-[#132D5E]/25 hover:from-[#0A1F44] hover:via-[#132D5E] hover:to-[#FFD54F] disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="size-4 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Updating Password...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="size-4" />
                        Update Password
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Security Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-6"
          >
            <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
              <div className="bg-white p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0A1F44]">
                  <Shield className="size-4 text-[#FFD54F]" />
                  Security Best Practices
                </h3>
                <ul className="space-y-3">
                  {[
                    'Use a unique password you don\'t use on other sites',
                    'Include a mix of letters, numbers, and symbols',
                    'Never share your password via email or messages',
                    'Change your password periodically for better security',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#FFD54F]" />
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiUrl } from '@/lib/api-url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { authFetch } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
    setSuccess(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(apiUrl('/api/auth/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setSuccess(true);
      toast.success('Password changed successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-gray-200/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0D3B7A] to-[#1D63FF] text-white shadow-md">
              <KeyRound className="size-4" />
            </div>
            Change Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your account password. Make sure to use a strong, unique password.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-[#1D63FF]/10 border border-green-200/80 shadow-md shadow-green-200/30">
                <ShieldCheck className="size-6 text-green-600" />
              </div>
              <p className="text-sm text-center text-muted-foreground max-w-xs leading-relaxed">
                Your password has been changed successfully. Use the new password next time you sign in.
              </p>
              <Button
                type="button"
                onClick={() => handleClose(false)}
                className="mt-2 bg-gradient-to-r from-[#0D3B7A] via-[#1D63FF] to-[#4D8AFF] hover:from-[#0A2463] hover:via-[#0D3B7A] hover:to-[#1D63FF] shadow-lg shadow-[#1D63FF]/20 rounded-xl h-11 px-6"
              >
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200/70"
                >
                  <div className="size-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); if (error) setError(''); }}
                    required
                    className="pl-10 pr-11 h-11 bg-white/60 border-gray-200 focus:border-[#1D63FF] focus:ring-[#1D63FF]/20 rounded-xl"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pass" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="new-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                    required
                    className="pl-10 h-11 bg-white/60 border-gray-200 focus:border-[#1D63FF] focus:ring-[#1D63FF]/20 rounded-xl"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pass" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirm-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                    required
                    className="pl-10 h-11 bg-white/60 border-gray-200 focus:border-[#1D63FF] focus:ring-[#1D63FF]/20 rounded-xl"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="flex-1 h-11 rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#0D3B7A] via-[#1D63FF] to-[#4D8AFF] hover:from-[#0A2463] hover:via-[#0D3B7A] hover:to-[#1D63FF] shadow-lg shadow-[#1D63FF]/20 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

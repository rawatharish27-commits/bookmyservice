'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, User, MapPin, Building, Save, Lock, CheckCircle2, Clock, AlertCircle, Camera } from 'lucide-react';

export function ProviderProfilePage() {
  const { user, updateProfile, token } = useAuth();
  const { navigate } = useApp();
  const { mutate } = useApiMutation();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ name, phone, city, state });
      setMessage('Profile updated successfully');
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    setMessage('');
    try {
      await mutate('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password changed successfully');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const kycStatus = 'NOT_SUBMITTED';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header with Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col items-center"
      >
        <div className="relative">
          <div className="rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[3px]">
            <div className="flex size-24 items-center justify-center rounded-full bg-white">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.name} className="size-24 rounded-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-teal-50">
                  <User className="size-10 text-emerald-400" />
                </div>
              )}
            </div>
          </div>
          <button className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
            <Camera className="size-3.5" />
          </button>
        </div>
        <h2 className="mt-3 text-xl font-bold">{user?.name}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 font-semibold">Provider</Badge>
          <Badge
            variant="outline"
            className={
              user?.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }
          >
            <span className={`mr-1.5 size-1.5 rounded-full ${user?.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {user?.status || 'ACTIVE'}
          </Badge>
        </div>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 rounded-xl p-3 text-sm border ${
              message.includes('success')
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.includes('success') && <CheckCircle2 className="mr-2 inline size-4" />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Business Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                  <Building className="size-4 text-white" />
                </div>
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="rounded-xl h-11 bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-11" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  <div className="relative">
                    <Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl h-11 pl-9" />
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} className="rounded-xl h-11" />
                </div>
              </div>
              <Button
                className="shimmer w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 h-11 rounded-xl"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                <Save className="mr-2 size-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* KYC Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                  <Shield className="size-4 text-white" />
                </div>
                KYC Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {kycStatus === 'APPROVED' ? (
                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100">
                      <CheckCircle2 className="size-6 text-emerald-500" />
                    </div>
                  ) : kycStatus === 'PENDING' ? (
                    <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100">
                      <Clock className="size-6 text-amber-500" />
                    </div>
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100">
                      <AlertCircle className="size-6 text-orange-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {kycStatus === 'APPROVED' ? 'Verified' : kycStatus === 'PENDING' ? 'Under Review' : 'Not Submitted'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {kycStatus === 'APPROVED'
                        ? 'Your identity has been verified'
                        : kycStatus === 'PENDING'
                          ? 'We are reviewing your documents'
                          : 'Complete KYC to unlock full features'}
                    </p>
                  </div>
                </div>
                {kycStatus !== 'APPROVED' && (
                  <Button variant="outline" onClick={() => navigate('provider-kyc')} className="rounded-xl">
                    {kycStatus === 'NOT_SUBMITTED' ? 'Start KYC' : 'View Status'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Areas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-500">
                  <MapPin className="size-4 text-white" />
                </div>
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(city ? [city] : ['Not set']).map((area) => (
                  <Badge key={area} variant="secondary" className="rounded-lg">{area}</Badge>
                ))}
                {state && <Badge variant="secondary" className="rounded-lg">{state}</Badge>}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Update your city and state above to change service areas</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-purple-500">
                  <Building className="size-4 text-white" />
                </div>
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">Bank account details coming soon</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Earnings will be tracked and payout integration will be available</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Change */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-red-500">
                  <Lock className="size-4 text-white" />
                </div>
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl h-11" />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full rounded-xl h-11"
              >
                <Lock className="mr-2 size-4" />
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

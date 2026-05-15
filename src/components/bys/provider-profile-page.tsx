'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, User, MapPin, Building, Save, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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

  const kycStatus = 'NOT_SUBMITTED'; // Would come from API

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your business profile</p>
      </div>

      {message && (
        <div className={`mb-4 rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Business Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="size-4 text-blue-700" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>
            <Button
              className="bg-blue-800 text-white hover:bg-[#1e3a5f]"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              <Save className="mr-2 size-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* KYC Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-blue-700" />
              KYC Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {kycStatus === 'APPROVED' ? (
                  <CheckCircle2 className="size-8 text-green-500" />
                ) : kycStatus === 'PENDING' ? (
                  <Clock className="size-8 text-yellow-500" />
                ) : (
                  <AlertCircle className="size-8 text-orange-500" />
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
                <Button variant="outline" onClick={() => navigate('provider-kyc')}>
                  {kycStatus === 'NOT_SUBMITTED' ? 'Start KYC' : 'View Status'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-blue-700" />
              Service Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(city ? [city] : ['Not set']).map((area) => (
                <Badge key={area} variant="secondary">{area}</Badge>
              ))}
              {state && <Badge variant="secondary">{state}</Badge>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Update your city and state above to change service areas</p>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="size-4 text-blue-700" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">Bank account details coming soon</p>
              <p className="mt-1 text-xs text-muted-foreground">Earnings will be tracked and payout integration will be available</p>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-4 text-blue-700" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={changingPassword}>
              <Lock className="mr-2 size-4" />
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

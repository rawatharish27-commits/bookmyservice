'use client';

import React, { useState } from 'react';
import { useAuth, type User as UserType } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User, Save, Key, Trash2, Loader2, Shield, Mail, Phone, MapPin } from 'lucide-react';

function ProfileForm({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const { updateProfile } = useAuth();
  const { navigate } = useApp();
  const { mutate: saveProfile, loading: saving } = useApiMutation();
  const { mutate: changePassword, loading: changingPassword } = useApiMutation();

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || '');
  const [state, setState] = useState(user.state || '');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async () => {
    setSaveError('');
    setSaveSuccess(false);
    try {
      await saveProfile('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, city, state }),
      });
      await updateProfile({ name, phone, city, state });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      await changePassword('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const handleDeleteAccount = () => {
    onLogout();
    navigate('home');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>

      {/* Profile Picture & Basic Info */}
      <Card className="mb-6 gap-4">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.name} className="size-20 rounded-full object-cover" />
            ) : (
              <User className="size-10 text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              <Badge
                variant="outline"
                className={
                  user.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : user.status === 'PENDING'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }
              >
                {user.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="mb-6 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-5 text-emerald-600" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {saveError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">{saveError}</div>
          )}
          {saveSuccess && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 border border-green-200">
              Profile updated successfully!
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <div className="flex items-center gap-2">
              <Input id="profile-email" value={user.email} disabled className="bg-gray-50" />
              <Mail className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <div className="flex items-center gap-2">
              <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Phone className="size-4 text-muted-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-city">City</Label>
              <Input id="profile-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-state">State</Label>
              <Input id="profile-state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="mb-6 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="size-5 text-emerald-600" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Change your password to keep your account secure</p>
        </CardContent>
        <div className="px-6 pb-6">
          <Button variant="outline" onClick={() => setPasswordDialog(true)}>
            <Key className="mr-2 size-4" />
            Change Password
          </Button>
        </div>
      </Card>

      <Separator className="my-6" />

      {/* Account Status */}
      <Card className="mb-6 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="size-5 text-emerald-600" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Account Status</span>
            <Badge
              variant="outline"
              className={
                user.status === 'ACTIVE'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }
            >
              {user.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Role</span>
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Verified</span>
            <Badge variant="outline" className={user.emailVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
              {user.emailVerified ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Phone Verified</span>
            <Badge variant="outline" className={user.phoneVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
              {user.phoneVerified ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-600">
            <Trash2 className="size-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </CardContent>
        <div className="px-6 pb-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 size-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all bookings, reviews, and other data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">{passwordError}</div>
            )}
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && <Loader2 className="mr-2 size-4 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClientProfilePage() {
  const { user, logout } = useAuth();
  const { navigate } = useApp();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">Please log in to view your profile</p>
        <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('login')}>
          Log In
        </Button>
      </div>
    );
  }

  return <ProfileForm user={user} onLogout={logout} />;
}

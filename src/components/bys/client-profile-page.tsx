import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, type User as UserType } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { User, Save, Key, Trash2, Loader2, Shield, Mail, Phone, MapPin, CheckCircle2, Camera } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col items-center"
      >
        <div className="relative">
          <div className="rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[3px]">
            <div className="flex size-24 items-center justify-center rounded-full bg-white">
              {user.profileImageUrl ? (
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
        <h2 className="mt-3 text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 capitalize font-semibold">
            {user.role}
          </Badge>
          <Badge
            variant="outline"
            className={
              user.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : user.status === 'PENDING'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }
          >
            <span className={`mr-1.5 size-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-400' : user.status === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'}`} />
            {user.status}
          </Badge>
        </div>
      </motion.div>

      {/* Edit Profile Form */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                <User className="size-4 text-white" />
              </div>
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200"
                >
                  {saveError}
                </motion.div>
              )}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200"
                >
                  <CheckCircle2 className="size-4" />
                  Profile updated successfully!
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <div className="flex items-center gap-2">
                <Input id="profile-email" value={user.email} disabled className="rounded-xl h-11 bg-muted/50" />
                <Mail className="size-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <div className="flex items-center gap-2">
                <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-11" />
                <Phone className="size-4 text-muted-foreground shrink-0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-city">City</Label>
                <div className="relative">
                  <Input id="profile-city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl h-11 pl-9" />
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-state">State</Label>
                <Input id="profile-state" value={state} onChange={(e) => setState(e.target.value)} className="rounded-xl h-11" />
              </div>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button
              className="shimmer w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 h-11 rounded-xl"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save Changes
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-blue-500">
                <Key className="size-4 text-white" />
              </div>
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Change your password to keep your account secure</p>
          </CardContent>
          <div className="px-6 pb-6">
            <Button variant="outline" onClick={() => setPasswordDialog(true)} className="rounded-xl w-full h-11">
              <Key className="mr-2 size-4" />
              Change Password
            </Button>
          </div>
        </Card>
      </motion.div>

      <Separator className="my-6" />

      {/* Account Status */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                <Shield className="size-4 text-white" />
              </div>
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Account Status', value: user.status, isStatus: true },
              { label: 'Role', value: user.role, isRole: true },
              { label: 'Email Verified', value: user.emailVerified ? 'Yes' : 'No', isVerified: user.emailVerified },
              { label: 'Phone Verified', value: user.phoneVerified ? 'Yes' : 'No', isVerified: user.phoneVerified },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/30 transition-colors">
                <span className="text-sm">{item.label}</span>
                {item.isStatus ? (
                  <Badge variant="outline" className={
                    user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }>
                    <span className={`mr-1.5 size-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {item.value}
                  </Badge>
                ) : item.isRole ? (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 capitalize">{item.value}</Badge>
                ) : (
                  <Badge variant="outline" className={item.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                    {item.isVerified && <CheckCircle2 className="mr-1 size-3" />}
                    {item.value}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <Card className="mt-6 overflow-hidden rounded-2xl border-2 border-red-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-red-600">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-100">
                <Trash2 className="size-4 text-red-500" />
              </div>
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
                <Button variant="destructive" className="rounded-xl">
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
      </motion.div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordError && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">{passwordError}</div>
            )}
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)} className="rounded-xl">Cancel</Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
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
        <Button
          className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
          onClick={() => navigate('login')}
        >
          Log In
        </Button>
      </div>
    );
  }

  return <ProfileForm user={user} onLogout={logout} />;
}

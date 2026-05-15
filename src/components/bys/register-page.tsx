'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wrench, Eye, EyeOff, Loader2, User, Briefcase } from 'lucide-react';

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Very Weak', color: 'bg-red-500', width: 'w-1/5' };
  if (score === 2) return { label: 'Weak', color: 'bg-orange-500', width: 'w-2/5' };
  if (score === 3) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-3/5' };
  if (score === 4) return { label: 'Strong', color: 'bg-blue-700', width: 'w-4/5' };
  return { label: 'Very Strong', color: 'bg-blue-800', width: 'w-full' };
}

export function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useApp();
  const [role, setRole] = useState<'client' | 'provider'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        roleId: role === 'client' ? 1 : 2,
      });
      navigate(role === 'client' ? 'client-dashboard' : 'provider-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-blue-800 text-white">
            <Wrench className="size-6" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join BookYourService today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    role === 'client'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300'
                  }`}
                >
                  <User className="size-6" />
                  <span className="text-sm font-medium">Client</span>
                  <span className="text-xs">Book services</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    role === 'provider'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="size-6" />
                  <span className="text-sm font-medium">Provider</span>
                  <span className="text-xs">Offer services</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                      <div className={`h-full rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                I agree to the{' '}
                <button type="button" className="text-blue-700 hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="text-blue-700 hover:underline">Privacy Policy</button>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-blue-800 hover:bg-[#1e3a5f]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="font-medium text-blue-700 hover:text-blue-800"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

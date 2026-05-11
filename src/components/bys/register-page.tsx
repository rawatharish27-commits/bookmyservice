'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Wrench, User, Briefcase, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft,
  Droplets, Zap, Wind, CheckCircle2, TrendingUp, Users, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  if (score === 4) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-4/5' };
  return { label: 'Very Strong', color: 'bg-emerald-600', width: 'w-full' };
}

export function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<string>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
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
    if (activeTab === 'provider' && !specialization) {
      setError('Please select your specialization');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        roleId: activeTab === 'client' ? 1 : 2,
        role: activeTab === 'client' ? 'CLIENT' : 'PROVIDER',
      });
      navigate(activeTab === 'client' ? 'client-dashboard' : 'provider-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clientBenefits = [
    { icon: CheckCircle2, text: 'Verified & trusted professionals' },
    { icon: Shield, text: 'Secure booking & payments' },
    { icon: Droplets, text: 'Plumbing services' },
    { icon: Zap, text: 'Electrical services' },
    { icon: Wind, text: 'AC & HVAC services' },
  ];

  const providerBenefits = [
    { icon: TrendingUp, text: 'Reach thousands of customers' },
    { icon: Users, text: 'Grow your business faster' },
    { icon: CheckCircle2, text: 'Professional profile & reviews' },
    { icon: Shield, text: 'Secure payment collection' },
  ];

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to Home */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('home')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </motion.button>

        <Card className="border-0 shadow-xl shadow-emerald-900/5 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
            >
              <Wrench className="size-7" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold tracking-tight"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-sm text-muted-foreground"
            >
              Join BookYourService today
            </motion.p>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="w-full h-auto p-1 bg-emerald-50/80 rounded-xl">
                <TabsTrigger
                  value="client"
                  className="flex-1 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/25 transition-all duration-300"
                >
                  <User className="size-4 mr-2" />
                  Sign up as Client
                </TabsTrigger>
                <TabsTrigger
                  value="provider"
                  className="flex-1 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/25 transition-all duration-300"
                >
                  <Briefcase className="size-4 mr-2" />
                  Sign up as Provider
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ============== CLIENT TAB ============== */}
            <TabsContent value="client" className="mt-0">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  {/* Client benefit banner */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 border border-emerald-100"
                  >
                    <p className="text-sm font-semibold text-emerald-800 mb-2.5">
                      Book trusted professionals for Plumbing, Electrical &amp; AC services
                    </p>
                    <div className="space-y-1.5">
                      {clientBenefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <benefit.icon className="size-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs text-emerald-700">{benefit.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="client-name" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="client-name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="client-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    <Label htmlFor="client-confirm" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="client-confirm"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pl-10"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="client-terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <Label htmlFor="client-terms" className="text-sm font-normal leading-snug">
                      I agree to the{' '}
                      <button type="button" className="text-emerald-600 hover:underline">Terms of Service</button>
                      {' '}and{' '}
                      <button type="button" className="text-emerald-600 hover:underline">Privacy Policy</button>
                    </Label>
                  </div>
                </CardContent>

                <CardFooter className="flex-col gap-4 pb-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 transition-all duration-300 h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 size-4" />
                        Create Client Account
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('login')}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Log in
                    </button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>

            {/* ============== PROVIDER TAB ============== */}
            <TabsContent value="provider" className="mt-0">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  {/* Provider benefit banner */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 p-4 border border-amber-100"
                  >
                    <p className="text-sm font-semibold text-emerald-800 mb-2.5">
                      Reach thousands of customers, grow your business
                    </p>
                    <div className="space-y-1.5">
                      {providerBenefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <benefit.icon className="size-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs text-emerald-700">{benefit.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="provider-name" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="provider-name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="provider-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="provider-phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  {/* Specialization - Provider only */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Specialization</Label>
                    <Select value={specialization} onValueChange={setSpecialization}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">
                          <span className="flex items-center gap-2">
                            <Droplets className="size-3.5" /> Plumbing
                          </span>
                        </SelectItem>
                        <SelectItem value="electrical">
                          <span className="flex items-center gap-2">
                            <Zap className="size-3.5" /> Electrical
                          </span>
                        </SelectItem>
                        <SelectItem value="ac-hvac">
                          <span className="flex items-center gap-2">
                            <Wind className="size-3.5" /> AC &amp; HVAC
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="provider-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    <Label htmlFor="provider-confirm" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="provider-confirm"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pl-10"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="provider-terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <Label htmlFor="provider-terms" className="text-sm font-normal leading-snug">
                      I agree to the{' '}
                      <button type="button" className="text-emerald-600 hover:underline">Terms of Service</button>
                      {' '}and{' '}
                      <button type="button" className="text-emerald-600 hover:underline">Privacy Policy</button>
                    </Label>
                  </div>
                </CardContent>

                <CardFooter className="flex-col gap-4 pb-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 transition-all duration-300 h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Briefcase className="mr-2 size-4" />
                        Create Provider Account
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('login')}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Log in
                    </button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Branding footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <Wrench className="size-3 inline -mt-0.5 mr-1" />
          BookYourService &mdash; Trusted Home Services
        </motion.p>
      </motion.div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wrench, User, Briefcase, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft,
  Droplets, Zap, Wind, CheckCircle2, TrendingUp, Users, Shield, ShieldCheck, BadgeCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const specializations = [
  { value: 'plumbing', label: 'Plumbing', Icon: Droplets, color: 'from-blue-600 to-cyan-400', bgColor: 'bg-blue-50 border-blue-200', activeBg: 'bg-blue-100 border-blue-400 ring-2 ring-blue-300', textColor: 'text-blue-700', desc: 'Pipes, leaks, installations' },
  { value: 'electrical', label: 'Electrical', Icon: Zap, color: 'from-amber-500 via-orange-500 to-yellow-400', bgColor: 'bg-amber-50 border-amber-200', activeBg: 'bg-amber-100 border-amber-400 ring-2 ring-amber-300', textColor: 'text-amber-700', desc: 'Wiring, switches, fixtures' },
  { value: 'ac-hvac', label: 'AC & HVAC', Icon: Wind, color: 'from-teal-500 via-emerald-500 to-cyan-400', bgColor: 'bg-teal-50 border-teal-200', activeBg: 'bg-teal-100 border-teal-400 ring-2 ring-teal-300', textColor: 'text-teal-700', desc: 'Cooling, heating, ventilation' },
];

const trustBadges = [
  { icon: BadgeCheck, label: 'KYC Verified' },
  { icon: Shield, label: 'Secure Payments' },
  { icon: Clock, label: '24/7 Support' },
];

function getPasswordStrength(password: string): { label: string; color: string; width: string; emoji: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Very Weak', color: 'bg-gradient-to-r from-red-500 to-red-600', width: 'w-1/5', emoji: '😩', score };
  if (score === 2) return { label: 'Weak', color: 'bg-gradient-to-r from-orange-500 to-amber-500', width: 'w-2/5', emoji: '😕', score };
  if (score === 3) return { label: 'Fair', color: 'bg-gradient-to-r from-yellow-500 to-amber-400', width: 'w-3/5', emoji: '😐', score };
  if (score === 4) return { label: 'Strong', color: 'bg-gradient-to-r from-emerald-500 to-teal-400', width: 'w-4/5', emoji: '😊', score };
  return { label: 'Very Strong', color: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500', width: 'w-full', emoji: '💪', score };
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

  // Step indicator: count filled fields out of total
  const totalSteps = activeTab === 'provider' ? 6 : 5;
  const filledSteps = useMemo(() => {
    let count = 0;
    if (name.trim()) count++;
    if (email.trim()) count++;
    if (phone.trim()) count++;
    if (activeTab === 'provider' && specialization) count++;
    if (password.length >= 8) count++;
    if (confirmPassword && confirmPassword === password) count++;
    return count;
  }, [name, email, phone, password, confirmPassword, specialization, activeTab]);

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
    <div className="relative flex min-h-[80vh] overflow-hidden">
      {/* ========== LEFT DECORATIVE PANEL (desktop) ========== */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        {/* Mesh gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.55),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(245,158,11,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,rgba(20,184,166,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.2),transparent_40%)]" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Floating service icons */}
        {specializations.map(({ Icon, color, value }, i) => (
          <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.3, type: 'spring', stiffness: 120 }}
            className="absolute"
            style={{ left: `${20 + i * 30}%`, top: `${25 + (i % 2) * 30}%` }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-xl shadow-black/25 drop-shadow-[0_0_12px_rgba(16,185,129,0.2)]`}
              style={{ width: 64, height: 64 }}
            >
              <Icon className="size-7 text-white" />
            </motion.div>
          </motion.div>
        ))}

        {/* Left panel content */}
        <div className="relative z-10 flex flex-col justify-center items-start px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm shadow-lg shadow-black/10">
                <Wrench className="size-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BookYourService</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Join India&apos;s<br />
              <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">Trusted Platform.</span>
            </h2>

            <p className="text-emerald-100/80 text-lg mb-10 max-w-md leading-relaxed">
              Whether you need home services or want to offer them, we&apos;ve got you covered with a seamless experience.
            </p>

            {/* Animated benefit cards */}
            <div className="space-y-3 max-w-sm">
              {[
                { icon: ShieldCheck, text: 'All providers are KYC verified' },
                { icon: CheckCircle2, text: 'Secure payments & guaranteed satisfaction' },
                { icon: Clock, text: 'Real-time booking & tracking' },
              ].map(({ icon: BenefitIcon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.2 }}
                  className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 shrink-0">
                    <BenefitIcon className="size-4 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,30 C100,60 300,0 400,30 L400,60 L0,60 Z" fill="white" fillOpacity="0.05" />
          </svg>
        </div>
      </div>

      {/* ========== RIGHT FORM PANEL ========== */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12 relative bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
        {/* Subtle background orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/25 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-100/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        {/* Animated dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Back to Home */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate('home')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </motion.button>

          {/* ========== GLASSMORPHISM CARD ========== */}
          <div className="glass-emerald rounded-2xl shadow-xl shadow-emerald-900/8 border-emerald-100/50 relative overflow-hidden backdrop-blur-xl">
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/70" />
            {/* Gradient top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

            {/* Header */}
            <div className="text-center pt-8 pb-2 px-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
                className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30"
              >
                <Wrench className="size-8" />
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
                className="text-sm text-muted-foreground mt-1"
              >
                Join BookYourService today
              </motion.p>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(filledSteps / totalSteps) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  />
                </div>
                <span className="text-xs font-medium text-emerald-600 whitespace-nowrap">
                  {filledSteps}/{totalSteps}
                </span>
              </div>
            </div>

            {/* Animated Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(''); }} className="w-full">
              <div className="px-6 pt-3">
                <TabsList className="w-full h-auto p-1.5 bg-gradient-to-r from-emerald-50/80 to-cyan-50/60 rounded-xl border border-emerald-100/50">
                  {['client', 'provider'].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className={`flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                        tab === 'client'
                          ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-600/30'
                          : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-amber-500/30'
                      }`}
                    >
                      {tab === 'client' ? (
                        <><User className="size-4 mr-2" />Sign up as Client</>
                      ) : (
                        <><Briefcase className="size-4 mr-2" />Sign up as Provider</>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* ========== CLIENT TAB ========== */}
              <TabsContent value="client" className="mt-0">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 pt-5 px-6">
                    {/* Client benefit banner with animated gradient */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="client-banner"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-xl overflow-hidden p-4 border border-emerald-100/70"
                      >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 bg-[length:200%_100%] animate-[gradient-shift_6s_ease_infinite]" />
                        <div className="relative">
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
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, x: -20, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200/70"
                        >
                          <div className="size-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-red-600 text-xs font-bold">!</span>
                          </div>
                          <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="client-name" className="text-sm font-medium text-foreground/80">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="client-name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="client-email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="pl-10 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="client-phone" className="text-sm font-medium text-foreground/80">Phone Number</Label>
                      <Input
                        id="client-phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                      />
                    </div>

                    {/* Password with animated strength bar */}
                    <div className="space-y-2">
                      <Label htmlFor="client-password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="client-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          className="pl-10 pr-11 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5"
                        >
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((segment) => (
                              <div key={segment} className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${passwordStrength.score >= segment ? passwordStrength.color : ''}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: passwordStrength.score >= segment ? '100%' : '0%' }}
                                  transition={{ duration: 0.3, delay: segment * 0.05 }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                            <span className="text-sm">{passwordStrength.emoji}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="client-confirm" className="text-sm font-medium text-foreground/80">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="client-confirm"
                          type="password"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          className="pl-10 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                      </div>
                      <AnimatePresence>
                        {confirmPassword && password !== confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="size-3.5 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-[8px] font-bold">✕</span>
                            </span>
                            Passwords do not match
                          </motion.p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-emerald-600 flex items-center gap-1"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Passwords match
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Terms with better styling */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                      <Checkbox
                        id="client-terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="client-terms" className="text-sm font-normal leading-snug text-muted-foreground">
                        I agree to the{' '}
                        <button type="button" onClick={() => navigate('terms', { type: 'terms' })} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Terms of Service</button>
                        {', '}
                        <button type="button" onClick={() => navigate('aup', { type: 'aup' })} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">AUP</button>
                        {' '}and{' '}
                        <button type="button" onClick={() => navigate('privacy', { type: 'privacy' })} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Privacy Policy</button>
                      </Label>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pt-5 pb-6 space-y-4">
                    {/* Gradient shimmer submit button */}
                    <Button
                      type="submit"
                      className="w-full shimmer bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-600 shadow-lg shadow-emerald-600/30 transition-all duration-300 h-12 rounded-xl text-base font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 size-5" />
                          Create Client Account
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('login')}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-2"
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>

              {/* ========== PROVIDER TAB ========== */}
              <TabsContent value="provider" className="mt-0">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 pt-5 px-6 max-h-[65vh] overflow-y-auto">
                    {/* Provider benefit banner */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="provider-banner"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-xl overflow-hidden p-4 border border-amber-100/70"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 bg-[length:200%_100%] animate-[gradient-shift_6s_ease_infinite]" />
                        <div className="relative">
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
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, x: -20, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200/70"
                        >
                          <div className="size-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-red-600 text-xs font-bold">!</span>
                          </div>
                          <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="provider-name" className="text-sm font-medium text-foreground/80">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="provider-name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="provider-email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="provider-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="pl-10 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="provider-phone" className="text-sm font-medium text-foreground/80">Phone Number</Label>
                      <Input
                        id="provider-phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                      />
                    </div>

                    {/* Specialization Cards (instead of dropdown) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">Specialization</Label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {specializations.map((spec) => {
                          const isActive = specialization === spec.value;
                          return (
                            <motion.button
                              key={spec.value}
                              type="button"
                              onClick={() => setSpecialization(spec.value)}
                              whileTap={{ scale: 0.97 }}
                              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                isActive ? spec.activeBg : spec.bgColor
                              }`}
                            >
                              <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${spec.color} shadow-sm`}>
                                <spec.Icon className="size-5 text-white" />
                              </div>
                              <span className={`text-xs font-semibold ${isActive ? spec.textColor : 'text-foreground/70'}`}>
                                {spec.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight text-center">
                                {spec.desc}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId="specialization-check"
                                  className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                                >
                                  <CheckCircle2 className="size-3 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Password with animated strength bar */}
                    <div className="space-y-2">
                      <Label htmlFor="provider-password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="provider-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          className="pl-10 pr-11 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5"
                        >
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((segment) => (
                              <div key={segment} className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${passwordStrength.score >= segment ? passwordStrength.color : ''}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: passwordStrength.score >= segment ? '100%' : '0%' }}
                                  transition={{ duration: 0.3, delay: segment * 0.05 }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                            <span className="text-sm">{passwordStrength.emoji}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="provider-confirm" className="text-sm font-medium text-foreground/80">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="provider-confirm"
                          type="password"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          className="pl-10 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                        />
                      </div>
                      <AnimatePresence>
                        {confirmPassword && password !== confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="size-3.5 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-[8px] font-bold">✕</span>
                            </span>
                            Passwords do not match
                          </motion.p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-emerald-600 flex items-center gap-1"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Passwords match
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Terms with better styling */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                      <Checkbox
                        id="provider-terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="provider-terms" className="text-sm font-normal leading-snug text-muted-foreground">
                        I agree to the{' '}
                        <button type="button" onClick={() => navigate('terms', { type: 'terms' })} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Terms of Service</button>
                        {', '}
                        <button type="button" onClick={() => navigate('provider-agreement', { type: 'provider-agreement' })} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Provider Agreement</button>
                        {' '}and{' '}
                        <button type="button" onClick={() => navigate('privacy', { type: 'privacy' })} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Privacy Policy</button>
                      </Label>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pt-5 pb-6 space-y-4">
                    {/* Gradient shimmer submit button */}
                    <Button
                      type="submit"
                      className="w-full shimmer bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-lg shadow-amber-500/30 transition-all duration-300 h-12 rounded-xl text-base font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Briefcase className="mr-2 size-5" />
                          Create Provider Account
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('login')}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-2"
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 mt-6"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 border border-emerald-200/80 shadow-sm shadow-emerald-200/50">
                  <Icon className="size-3 text-emerald-700" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Branding */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-center text-xs text-muted-foreground/60"
          >
            <Wrench className="size-3 inline -mt-0.5 mr-1" />
            BookYourService &mdash; Trusted Home Services
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

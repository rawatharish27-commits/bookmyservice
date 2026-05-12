import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wrench, User, Briefcase, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft,
  Droplets, Zap, Wind, Shield, Clock, BadgeCheck, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const floatingIcons = [
  { Icon: Droplets, color: 'from-blue-400 to-cyan-400', x: '15%', y: '20%', delay: 0, size: 48 },
  { Icon: Zap, color: 'from-amber-400 to-yellow-400', x: '70%', y: '15%', delay: 0.5, size: 44 },
  { Icon: Wind, color: 'from-teal-400 to-emerald-400', x: '50%', y: '65%', delay: 1, size: 46 },
  { Icon: Wrench, color: 'from-emerald-400 to-green-400', x: '25%', y: '75%', delay: 1.5, size: 40 },
  { Icon: Shield, color: 'from-emerald-500 to-teal-500', x: '80%', y: '55%', delay: 2, size: 42 },
];

const trustBadges = [
  { icon: BadgeCheck, label: 'KYC Verified' },
  { icon: Shield, label: 'Secure Payments' },
  { icon: Clock, label: '24/7 Support' },
];

export function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<string>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(activeTab === 'client' ? 'client-dashboard' : 'provider-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] overflow-hidden">
      {/* ========== LEFT DECORATIVE PANEL (desktop) ========== */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        {/* Mesh gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.55),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,rgba(245,158,11,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(20,184,166,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(6,182,212,0.2),transparent_40%)]" />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Floating service icons */}
        {floatingIcons.map(({ Icon, color, x, y, delay, size }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + delay * 0.3, type: 'spring', stiffness: 120 }}
            className="absolute"
            style={{ left: x, top: y }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
              className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-xl shadow-black/25 drop-shadow-[0_0_12px_rgba(16,185,129,0.2)]`}
              style={{ width: size + 16, height: size + 16 }}
            >
              <Icon className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
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
              Your Home,<br />
              <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">Perfectly Served.</span>
            </h2>

            <p className="text-emerald-100/80 text-lg mb-8 max-w-md leading-relaxed">
              Connect with verified professionals for plumbing, electrical, and AC &amp; HVAC services — all in one place.
            </p>

            {/* Stats */}
            <div className="flex gap-8">
              {[
                { value: '500+', label: 'Service Providers' },
                { value: '10K+', label: 'Happy Customers' },
                { value: '4.8', label: 'Average Rating' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-emerald-200/70 mt-0.5">{stat.label}</div>
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
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-muted-foreground mt-1"
              >
                Sign in to your BookYourService account
              </motion.p>
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
                        <><User className="size-4 mr-2" />Client Login</>
                      ) : (
                        <><Briefcase className="size-4 mr-2" />Provider Login</>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* ========== CLIENT TAB ========== */}
              <TabsContent value="client" className="mt-0">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5 pt-5 px-6">
                    {/* Client benefit banner */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="client-banner"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border border-emerald-100/70"
                      >
                        <p className="text-sm font-semibold text-emerald-800 mb-3">
                          Book trusted professionals for:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { Icon: Droplets, label: 'Plumbing', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                            { Icon: Zap, label: 'Electrical', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                            { Icon: Wind, label: 'AC & HVAC', color: 'bg-teal-50 text-teal-600 border-teal-100' },
                          ].map(({ Icon, label, color }) => (
                            <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${color}`}>
                              <Icon className="size-3.5" /> {label}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Error message with slide-in */}
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

                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="client-email" className="text-sm font-medium text-foreground/80">
                        Email Address
                      </Label>
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

                    {/* Password field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="client-password" className="text-sm font-medium text-foreground/80">
                          Password
                        </Label>
                        <button
                          type="button"
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="client-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="pl-10 pr-11 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all rounded-xl"
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
                  </div>

                  {/* Footer */}
                  <div className="px-6 pt-6 pb-6 space-y-4">
                    {/* Gradient shimmer submit button */}
                    <Button
                      type="submit"
                      className="w-full shimmer bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-600 shadow-lg shadow-emerald-600/30 transition-all duration-300 h-12 rounded-xl text-base font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 size-5" />
                          Sign in as Client
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                      <span className="text-xs text-muted-foreground">or continue with</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                    </div>

                    {/* Social login button (UI only) */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-gray-200/80 bg-white/80 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100/80"
                    >
                      <svg className="size-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>

                    {/* Phone login option */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 transition-all text-sm font-medium text-emerald-700"
                    >
                      <Phone className="size-4" />
                      Continue with Phone
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('register')}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-2"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>

              {/* ========== PROVIDER TAB ========== */}
              <TabsContent value="provider" className="mt-0">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5 pt-5 px-6">
                    {/* Provider benefit banner */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="provider-banner"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 p-4 border border-amber-100/70"
                      >
                        <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                          <Briefcase className="size-4 text-amber-600" />
                          Reach thousands of customers and grow your business
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[
                            { Icon: Droplets, label: 'Plumbing Jobs', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                            { Icon: Zap, label: 'Electrical Jobs', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                            { Icon: Wind, label: 'HVAC Jobs', color: 'bg-teal-50 text-teal-600 border-teal-100' },
                          ].map(({ Icon, label, color }) => (
                            <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${color}`}>
                              <Icon className="size-3.5" /> {label}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Error message with slide-in */}
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

                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="provider-email" className="text-sm font-medium text-foreground/80">
                        Email Address
                      </Label>
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

                    {/* Password field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="provider-password" className="text-sm font-medium text-foreground/80">
                          Password
                        </Label>
                        <button
                          type="button"
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="provider-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="pl-10 pr-11 h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all rounded-xl"
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
                  </div>

                  {/* Footer */}
                  <div className="px-6 pt-6 pb-6 space-y-4">
                    {/* Gradient shimmer submit button */}
                    <Button
                      type="submit"
                      className="w-full shimmer bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-600 shadow-lg shadow-emerald-600/30 transition-all duration-300 h-12 rounded-xl text-base font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Briefcase className="mr-2 size-5" />
                          Sign in as Provider
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                      <span className="text-xs text-muted-foreground">or continue with</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                    </div>

                    {/* Social login button */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-gray-200/80 bg-white/80 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100/80"
                    >
                      <svg className="size-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('register')}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-2"
                      >
                        Sign up
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
            {trustBadges.map(({ icon: Icon, label }, i) => (
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

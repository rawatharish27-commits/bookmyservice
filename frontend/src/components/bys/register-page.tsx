import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, ROLE_IDS } from '@/contexts/auth-context';
import { useApp, type Page } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Wrench, User, Briefcase, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft,
  Droplets, Zap, Wind, CheckCircle2, Shield, ShieldCheck, BadgeCheck, Clock,
  Snowflake, Tv, Droplet, Flame, Truck, CookingPot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const specializations = [
  { value: 'air-conditioner', label: 'Air Conditioner', Icon: Wind, color: 'from-teal-500 via-emerald-500 to-cyan-400', bgColor: 'bg-teal-50 border-teal-200', activeBg: 'bg-teal-100 border-teal-400 ring-2 ring-teal-300', textColor: 'text-teal-700', desc: 'AC repair & maintenance' },
  { value: 'refrigerator', label: 'Refrigerator', Icon: Snowflake, color: 'from-sky-500 via-blue-500 to-cyan-400', bgColor: 'bg-sky-50 border-sky-200', activeBg: 'bg-sky-100 border-sky-400 ring-2 ring-sky-300', textColor: 'text-sky-700', desc: 'Fridge repair & service' },
  { value: 'washing-machine', label: 'Washing Machine', Icon: Droplets, color: 'from-blue-600 to-cyan-400', bgColor: 'bg-blue-50 border-blue-200', activeBg: 'bg-blue-100 border-blue-400 ring-2 ring-blue-300', textColor: 'text-blue-700', desc: 'Washer repair & service' },
  { value: 'kitchen-appliances', label: 'Kitchen Appliances', Icon: CookingPot, color: 'from-amber-500 via-orange-500 to-yellow-400', bgColor: 'bg-amber-50 border-amber-200', activeBg: 'bg-amber-100 border-amber-400 ring-2 ring-amber-300', textColor: 'text-amber-700', desc: 'Chimney, hob, microwave' },
  { value: 'tv-repair', label: 'TV Repair', Icon: Tv, color: 'from-rose-500 via-pink-500 to-red-400', bgColor: 'bg-rose-50 border-rose-200', activeBg: 'bg-rose-100 border-rose-400 ring-2 ring-rose-300', textColor: 'text-rose-700', desc: 'LED, LCD, OLED repair' },
  { value: 'water-purifier', label: 'Water Purifier', Icon: Droplet, color: 'from-cyan-500 via-teal-500 to-emerald-400', bgColor: 'bg-cyan-50 border-cyan-200', activeBg: 'bg-cyan-100 border-cyan-400 ring-2 ring-cyan-300', textColor: 'text-cyan-700', desc: 'RO, UV filter service' },
  { value: 'geyser', label: 'Geyser', Icon: Flame, color: 'from-red-500 via-orange-500 to-amber-400', bgColor: 'bg-red-50 border-red-200', activeBg: 'bg-red-100 border-red-400 ring-2 ring-red-300', textColor: 'text-red-700', desc: 'Water heater service' },
  { value: 'plumber', label: 'Plumber', Icon: Droplets, color: 'from-blue-600 via-blue-500 to-cyan-400', bgColor: 'bg-blue-50 border-blue-200', activeBg: 'bg-blue-100 border-blue-400 ring-2 ring-blue-300', textColor: 'text-blue-700', desc: 'Pipes, leaks, installations' },
  { value: 'electrician', label: 'Electrician', Icon: Zap, color: 'from-sky-500 via-blue-500 to-yellow-400', bgColor: 'bg-sky-50 border-sky-200', activeBg: 'bg-sky-100 border-cyan-400 ring-2 ring-sky-300', textColor: 'text-sky-700', desc: 'Wiring, switches, fixtures' },
  { value: 'water-tank-cleaning', label: 'Water Tank Cleaning', Icon: Droplet, color: 'from-blue-500 via-indigo-500 to-violet-400', bgColor: 'bg-indigo-50 border-indigo-200', activeBg: 'bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300', textColor: 'text-indigo-700', desc: 'Tank cleaning & sanitation' },
  { value: 'movers-and-packers', label: 'Movers and Packers', Icon: Truck, color: 'from-emerald-500 via-green-500 to-teal-400', bgColor: 'bg-emerald-50 border-emerald-200', activeBg: 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300', textColor: 'text-emerald-700', desc: 'Relocation & packing' },
];

const roleOptions = [
  {
    key: 'client',
    roleId: ROLE_IDS.CLIENT,
    roleName: 'CLIENT',
    label: 'Client',
    Icon: User,
    gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    bgColor: 'bg-emerald-50 border-emerald-200',
    activeBg: 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300',
    textColor: 'text-emerald-700',
    desc: 'Book home services',
    banner: 'Book trusted professionals for Plumbing, Electrical & AC services',
    dashboard: 'client-dashboard' as Page,
  },
  {
    key: 'provider',
    roleId: ROLE_IDS.PROVIDER,
    roleName: 'PROVIDER',
    label: 'Service Provider',
    Icon: Briefcase,
    gradient: 'from-sky-500 via-blue-500 to-rose-500',
    bgColor: 'bg-sky-50 border-sky-200',
    activeBg: 'bg-sky-100 border-cyan-400 ring-2 ring-sky-300',
    textColor: 'text-sky-700',
    desc: 'List & manage services',
    banner: 'Reach thousands of customers, grow your business',
    dashboard: 'provider-dashboard' as Page,
  },
  {
    key: 'technician',
    roleId: ROLE_IDS.TECHNICIAN,
    roleName: 'TECHNICIAN',
    label: 'Technician',
    Icon: Wrench,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgColor: 'bg-orange-50 border-orange-200',
    activeBg: 'bg-orange-100 border-orange-400 ring-2 ring-orange-300',
    textColor: 'text-orange-700',
    desc: 'Provide hands-on services',
    banner: 'Work as a field technician providing hands-on repair services',
    dashboard: 'technician-dashboard' as Page,
  },
  // N44 fix: Area Manager and Local Admin removed from self-registration — these are privileged roles
];

function getPasswordStrength(password: string): { label: string; color: string; width: string; emoji: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Very Weak', color: 'bg-gradient-to-r from-red-500 to-red-600', width: 'w-1/5', emoji: '😩', score };
  if (score === 2) return { label: 'Weak', color: 'bg-gradient-to-r from-blue-500 to-sky-500', width: 'w-2/5', emoji: '😕', score };
  if (score === 3) return { label: 'Fair', color: 'bg-gradient-to-r from-yellow-500 to-cyan-400', width: 'w-3/5', emoji: '😐', score };
  if (score === 4) return { label: 'Strong', color: 'bg-gradient-to-r from-emerald-500 to-teal-400', width: 'w-4/5', emoji: '😊', score };
  return { label: 'Very Strong', color: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500', width: 'w-full', emoji: '💪', score };
}

export function RegisterPage() {
  const { register } = useAuth();
  const { navigate, nav } = useApp();
  const [selectedRole, setSelectedRole] = useState<string>('client');
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

  // Old #58 fix: pre-select role from navigation params (e.g. navigate('register', { role: 'provider' }))
  useEffect(() => {
    const paramRole = nav.params?.role;
    if (paramRole) {
      const validKeys = roleOptions.map(r => r.key);
      if (validKeys.includes(paramRole)) {
        setSelectedRole(paramRole);
      }
    }
  }, [nav.params?.role]);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const needsSpecialization = selectedRole === 'provider' || selectedRole === 'technician';

  const totalSteps = needsSpecialization ? 6 : 5;
  const filledSteps = useMemo(() => {
    let count = 0;
    if (name.trim()) count++;
    if (email.trim()) count++;
    if (phone.trim()) count++;
    if (needsSpecialization && specialization) count++;
    if (password.length >= 8) count++;
    if (confirmPassword && confirmPassword === password) count++;
    return count;
  }, [name, email, phone, password, confirmPassword, specialization, needsSpecialization]);

  const currentRole = roleOptions.find(r => r.key === selectedRole) || roleOptions[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }
    if (needsSpecialization && !specialization) {
      setError('Please select your specialization');
      return;
    }

    // Email format validation (Old #51 fix)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        roleId: currentRole.roleId,
        role: currentRole.roleName,
        specialization: specialization || undefined,
      });
      navigate(currentRole.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12 relative bg-white">
        {/* Subtle background orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gray-100/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gray-50/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

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
          <div className="glass-emerald rounded-2xl shadow-xl border-gray-200/50 relative overflow-hidden backdrop-blur-xl">
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-200/30 pointer-events-none" />
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

            {/* ========== UNIFIED FORM ========== */}
            <form onSubmit={handleSubmit}>
              {/* Role Selection Grid */}
              <div className="px-6 pt-4">
                <Label className="text-sm font-medium text-foreground/80 mb-2 block">I want to join as</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRole === role.key;
                    return (
                      <motion.button
                        key={role.key}
                        type="button"
                        onClick={() => { setSelectedRole(role.key); setError(''); }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isSelected ? role.activeBg : role.bgColor
                        }`}
                      >
                        <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${role.gradient} shadow-sm`}>
                          <role.Icon className="size-4 text-white" />
                        </div>
                        <span className={`text-[11px] font-semibold leading-tight text-center ${isSelected ? role.textColor : 'text-foreground/70'}`}>
                          {role.label}
                        </span>
                        {isSelected && (
                          <motion.div
                            layoutId="role-check"
                            className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <CheckCircle2 className="size-2.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 pt-4 px-6">
                {/* Role benefit banner */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-xl overflow-hidden p-4 border border-emerald-100/70"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 bg-[length:200%_100%] animate-[gradient-shift_6s_ease_infinite]" />
                    <div className="relative">
                      <p className="text-sm font-semibold text-emerald-800">
                        {currentRole.banner}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Sign up as a {currentRole.label} to get started
                      </p>
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
                  <Label htmlFor="reg-name" className="text-sm font-medium text-foreground/80">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      id="reg-name"
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
                  <Label htmlFor="reg-email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      id="reg-email"
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
                  <Label htmlFor="reg-phone" className="text-sm font-medium text-foreground/80">Phone Number</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="+91 8901172507"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11 bg-white/60 border-emerald-100/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white/80 transition-all rounded-xl"
                  />
                </div>

                {/* Specialization Cards (only for provider/technician) */}
                <AnimatePresence>
                  {needsSpecialization && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-medium text-foreground/80">Specialization</Label>
                      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password with animated strength bar */}
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm font-medium text-foreground/80">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      id="reg-password"
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  <Label htmlFor="reg-confirm" className="text-sm font-medium text-foreground/80">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      id="reg-confirm"
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

                {/* Terms */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 select-none"
                >
                  <Checkbox
                    id="reg-terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5 size-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 cursor-pointer"
                  />
                  <Label htmlFor="reg-terms" className="text-sm font-normal leading-snug text-muted-foreground cursor-pointer">
                    I agree to the{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); navigate('terms', { type: 'terms' }); }} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Terms of Service</button>
                    {', '}
                    <button type="button" onClick={(e) => { e.preventDefault(); navigate('aup', { type: 'aup' }); }} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">AUP</button>
                    {' '}and{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); navigate('privacy', { type: 'privacy' }); }} className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">Privacy Policy</button>
                  </Label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pt-5 pb-6 space-y-4">
                {/* Submit button */}
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
                      <currentRole.Icon className="mr-2 size-5" />
                      Create {currentRole.label} Account
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROLE_DASHBOARD_MAP } from '@/routes/access-control';
import type { Page } from '@/contexts/app-context';
import { toast } from 'sonner';
import {
  Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft,
  Wrench, LockKeyhole, Fingerprint, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminLoginPage() {
  const { login } = useAuth();
  const { navigate } = useApp();
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
      // Read the stored user to determine role
      const storedUser = JSON.parse(localStorage.getItem('bys_user') || '{}');
      const roleId = storedUser.roleId;

      // Only allow admin roles (3=ADMIN, 7=SUB_ADMIN)
      if (roleId !== 3 && roleId !== 7) {
        // Not an admin — log them out and show error
        localStorage.removeItem('bys_token');
        localStorage.removeItem('bys_user');
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }

      // Redirect to the appropriate admin dashboard
      navigate((ROLE_DASHBOARD_MAP[roleId] as Page) || 'super-admin-dashboard');
      toast.success('Welcome back, Admin!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] overflow-hidden">
      {/* ========== LEFT DECORATIVE PANEL (desktop) ========== */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        {/* Mesh gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(234,88,12,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,rgba(251,146,60,0.15),transparent_50%)]" />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Floating admin icons */}
        {[
          { Icon: Shield, color: 'from-orange-500 to-amber-500', x: '15%', y: '20%', delay: 0, size: 48 },
          { Icon: LockKeyhole, color: 'from-amber-500 to-yellow-500', x: '70%', y: '15%', delay: 0.5, size: 44 },
          { Icon: Fingerprint, color: 'from-orange-600 to-red-500', x: '50%', y: '65%', delay: 1, size: 46 },
          { Icon: CheckCircle2, color: 'from-amber-400 to-orange-400', x: '25%', y: '75%', delay: 1.5, size: 40 },
        ].map(({ Icon, color, x, y, delay, size }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + delay * 0.3, type: 'spring', stiffness: 120 }}
            className="absolute"
            style={{ left: x, top: y }}
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
              className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-xl shadow-black/25 backdrop-blur-sm`}
              style={{ width: size + 16, height: size + 16 }}
            >
              <Icon className="text-white drop-shadow-sm" style={{ width: size * 0.55, height: size * 0.55 }} />
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
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-lg shadow-black/10 border border-white/10">
                <Shield className="size-6 text-orange-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">BookYourService</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Admin<br />
              <span className="bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">Control Center.</span>
            </h2>

            <p className="text-gray-300/80 text-lg mb-10 max-w-md leading-relaxed">
              Manage your platform, monitor bookings, oversee providers, and keep everything running smoothly.
            </p>

            {/* Admin features */}
            <div className="space-y-3">
              {[
                { icon: '📊', label: 'Real-time Analytics & Revenue' },
                { icon: '👥', label: 'User & Provider Management' },
                { icon: '🔧', label: 'Service & Category Control' },
                { icon: '🛡️', label: 'Security & Access Control' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3 text-gray-300/90"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm font-medium">{feature.label}</span>
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
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12 relative bg-gradient-to-br from-white via-gray-50/30 to-white">
        {/* Subtle background orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-50/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-50/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-50/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

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
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-orange-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </motion.button>

          {/* ========== GLASSMORPHISM CARD ========== */}
          <div className="rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-200/50 relative overflow-hidden bg-white/70 backdrop-blur-xl">
            {/* Subtle inner ring */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40 pointer-events-none" />
            {/* Gradient top accent — orange for admin */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

            {/* Header */}
            <div className="relative pointer-events-auto text-center pt-8 pb-4 px-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
                className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30"
              >
                <Shield className="size-8" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold tracking-tight"
              >
                Admin Login
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-muted-foreground mt-1"
              >
                Access the administration portal
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6">
                {/* Restricted access notice */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/60 border border-orange-100/70 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LockKeyhole className="size-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800">Restricted Access</span>
                  </div>
                  <p className="text-xs text-orange-700/80 leading-relaxed">
                    This portal is exclusively for platform administrators and sub-admins. Unauthorized access attempts are logged.
                  </p>
                </motion.div>

                {/* Error message */}
                <motion.div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200/70"
                    >
                      <div className="size-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium text-foreground/80">
                    Admin Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-orange-600 transition-colors" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@bookyourservice.co.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10 h-12 bg-white/60 border-orange-100/50 focus:border-orange-400 focus:ring-orange-400/20 focus:bg-white/80 transition-all rounded-xl"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-sm font-medium text-foreground/80">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-orange-600 transition-colors" />
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-10 pr-11 h-12 bg-white/60 border-orange-100/50 focus:border-orange-400 focus:ring-orange-400/20 focus:bg-white/80 transition-all rounded-xl"
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
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pt-6 pb-6 space-y-4">
                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full shimmer bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 hover:from-orange-700 hover:via-amber-600 hover:to-yellow-600 shadow-lg shadow-orange-500/30 transition-all duration-300 h-12 rounded-xl text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 size-5" />
                      Sign In to Admin Panel
                    </>
                  )}
                </Button>

                {/* Security notice */}
                <div className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/50 to-yellow-50/30 p-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="size-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-800">All login attempts are monitored and logged</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Not an admin?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('login')}
                    className="font-semibold text-orange-600 hover:text-orange-700 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    User Login
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 mt-6"
          >
            {[
              { icon: Shield, label: 'Encrypted', gradient: 'from-orange-100 to-amber-100', iconColor: 'text-orange-700', border: 'border-orange-200/80', shadow: 'shadow-orange-200/50' },
              { icon: LockKeyhole, label: 'Secured', gradient: 'from-amber-100 to-yellow-100', iconColor: 'text-amber-700', border: 'border-amber-200/80', shadow: 'shadow-amber-200/50' },
              { icon: CheckCircle2, label: 'Verified', gradient: 'from-yellow-100 to-orange-100', iconColor: 'text-yellow-700', border: 'border-yellow-200/80', shadow: 'shadow-yellow-200/50' },
            ].map(({ icon: Icon, label, gradient, iconColor, border, shadow }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} border ${border} shadow-sm ${shadow}`}>
                  <Icon className={`size-3 ${iconColor}`} />
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
            BookYourService &mdash; Admin Portal
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

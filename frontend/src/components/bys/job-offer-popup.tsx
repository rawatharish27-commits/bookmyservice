import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  MapPin,
  DollarSign,
  X,
  Briefcase,
  Star,
  ArrowRight,
} from 'lucide-react';

const DISMISSAL_KEY = 'bys_job_offer_dismissed';
const DISMISSAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_SHOW_DELAY_MS = 10 * 1000; // 10 seconds

function isDismissed(): boolean {
  try {
    const stored = localStorage.getItem(DISMISSAL_KEY);
    if (!stored) return false;
    const dismissedAt = Number(stored);
    if (isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISSAL_DURATION_MS;
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(DISMISSAL_KEY, String(Date.now()));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function JobOfferPopup() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const [open, setOpen] = useState(false);

  const shouldShow = useCallback(() => {
    if (!user) return false;
    // Only show to CLIENT (1) or PROVIDER (2)
    if (user.roleId !== 1 && user.roleId !== 2) return false;
    return !isDismissed();
  }, [user]);

  // Auto-show after 10 seconds
  useEffect(() => {
    if (!shouldShow()) return;

    const timer = setTimeout(() => {
      if (shouldShow()) {
        setOpen(true);
      }
    }, AUTO_SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [shouldShow]);

  const handleClose = useCallback(() => {
    setOpen(false);
    markDismissed();
  }, []);

  const handleApplyManager = useCallback(() => {
    setOpen(false);
    markDismissed();
    navigate('join-manager');
  }, [navigate]);

  const handleApplyLocalAdmin = useCallback(() => {
    setOpen(false);
    markDismissed();
    navigate('join-local-admin');
  }, [navigate]);

  if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-gradient-to-br from-[#0A2463] via-[#0D3B7A] to-[#1D63FF] text-white"
      >
        {/* Header section */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm">
                  <Briefcase className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-medium text-yellow-300 uppercase tracking-wider">
                    Exclusive Opportunity
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-bold text-white mt-3 leading-tight">
              🚀 Job Offer: Become an Area Manager or Local Admin in Your Area!
            </DialogTitle>

            <DialogDescription className="text-sm sm:text-base text-[#FFE066]/80 mt-1">
              Be a part of a growing business and earn money. Lead your city's service marketplace.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Cards section */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Area Manager Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30">
                      <Shield className="w-6 h-6 text-yellow-300" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-200 text-xs font-semibold">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                      Premium
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">Area Manager</h3>
                  <p className="text-xs text-[#FFE066]/70 mb-4">
                    Manage multiple cities and oversee operations across your region.
                  </p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-[#FFE066]/90">
                      <MapPin className="w-3.5 h-3.5 text-yellow-300/70 flex-shrink-0" />
                      <span>Manage your entire area</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#FFE066]/90">
                      <Users className="w-3.5 h-3.5 text-yellow-300/70 flex-shrink-0" />
                      <span>Lead local admins & providers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#FFE066]/90">
                      <DollarSign className="w-3.5 h-3.5 text-yellow-300/70 flex-shrink-0" />
                      <span>Higher earning potential</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#FFE066]/50">Registration Fee</span>
                      <p className="text-lg font-bold text-yellow-300">₹100</p>
                    </div>
                    <Button
                      onClick={handleApplyManager}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-semibold gap-1.5 shadow-lg shadow-yellow-500/25 transition-all duration-200 group-hover:shadow-yellow-500/40"
                      size="sm"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Local Admin Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#1D63FF]/10 group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DB0FF]/20 to-[#7DB0FF]/20 border border-[#7DB0FF]/30">
                      <Users className="w-6 h-6 text-[#7DB0FF]" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7DB0FF]/20 border border-[#7DB0FF]/30 text-[#7DB0FF] text-xs font-semibold">
                      <Briefcase className="w-3 h-3" />
                      Popular
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">Local Admin</h3>
                  <p className="text-xs text-[#FFE066]/70 mb-4">
                    Administer your city's service marketplace and support local providers.
                  </p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-[#FFE066]/90">
                      <MapPin className="w-3.5 h-3.5 text-[#7DB0FF]/70 flex-shrink-0" />
                      <span>Manage your city operations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#FFE066]/90">
                      <Users className="w-3.5 h-3.5 text-[#7DB0FF]/70 flex-shrink-0" />
                      <span>Coordinate local providers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#FFE066]/90">
                      <DollarSign className="w-3.5 h-3.5 text-[#7DB0FF]/70 flex-shrink-0" />
                      <span>Steady income stream</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#FFE066]/50">Registration Fee</span>
                      <p className="text-lg font-bold text-[#7DB0FF]">₹50</p>
                    </div>
                    <Button
                      onClick={handleApplyLocalAdmin}
                      className="bg-gradient-to-r from-[#7DB0FF] to-[#7DB0FF] hover:from-[#4D8AFF] hover:to-[#1D63FF] text-black font-semibold gap-1.5 shadow-lg shadow-[#1D63FF]/25 transition-all duration-200 group-hover:shadow-[#1D63FF]/40"
                      size="sm"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Maybe Later button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-5 text-center"
          >
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-[#FFE066]/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              Maybe Later
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

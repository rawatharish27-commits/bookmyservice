'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Link2,
  Users,
  IndianRupee,
  Trophy,
  Clock,
  UserPlus,
  CheckCircle2,
  Sparkles,
  Send,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';

/* ---------- animation variants ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/* ---------- types ---------- */
interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarned: number;
  pendingRewards: number;
  referralHistory: ReferralEntry[];
}

interface ReferralEntry {
  id: string;
  referredName: string;
  referredEmail: string;
  status: 'PENDING' | 'COMPLETED';
  rewardEarned: number;
  referredAt: string;
  completedAt?: string;
}

/* ---------- status config ---------- */
const STATUS_CONFIG: Record<string, { className: string; dotColor: string; icon: typeof Clock; label: string }> = {
  PENDING: {
    className: 'bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20',
    dotColor: 'bg-[#FFE066]',
    icon: Clock,
    label: 'Pending',
  },
  COMPLETED: {
    className: 'bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20',
    dotColor: 'bg-[#7DB0FF]',
    icon: CheckCircle2,
    label: 'Completed',
  },
};

/* ==================== MAIN COMPONENT ==================== */
export function ClientReferralsPage() {
  const { user } = useAuth();
  const { data: referralData, loading: referralLoading } = useApi<ReferralData>('/api/referrals');

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const referral = referralData || {
    referralCode: user?.referralCode || 'LOADING',
    referralLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.referralCode || ''}`,
    totalReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
    referralHistory: [],
  };

  const referralHistory = referral.referralHistory || [];
  const displayedHistory = showAllHistory
    ? referralHistory
    : referralHistory.slice(0, 5);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referral.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referral.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = (platform: string) => {
    const text = `Join BookYourService and get amazing discounts on home services! Use my referral code: ${referral.referralCode}`;
    const link = referral.referralLink;

    switch (platform) {
      case 'whatsapp': {
        const url = `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`;
        window.open(url, '_blank');
        break;
      }
      case 'email': {
        const subject = encodeURIComponent('Join BookYourService - Get ₹50 Off!');
        const body = encodeURIComponent(`${text}\n\nSign up here: ${link}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
        break;
      }
      case 'sms': {
        window.open(`sms:?body=${encodeURIComponent(`${text}\n${link}`)}`);
        break;
      }
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-sm text-muted-foreground">Share your referral code and earn rewards for every friend who joins</p>
      </motion.div>

      {/* Referral Code Hero Card */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D63FF] via-[#1D63FF] to-[#FFCE32] p-6 sm:p-8 shadow-xl shadow-[#4D8AFF]/20"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-white/80">
            <Gift className="size-5" />
            <span className="text-sm font-medium">Your Referral Code</span>
          </div>

          {referralLoading ? (
            <Skeleton className="mt-3 h-14 w-64 bg-white/20" />
          ) : (
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border-2 border-dashed border-white/40 bg-white/10 px-6 py-3 backdrop-blur-sm">
                    <p className="font-mono text-3xl font-bold tracking-[0.2em] text-white sm:text-4xl">
                      {referral.referralCode}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`shrink-0 rounded-xl size-11 border-white/30 bg-white/10 backdrop-blur-sm transition-all ${
                      copiedCode
                        ? 'border-white bg-white/30 text-white'
                        : 'text-white hover:bg-white/20 hover:text-white'
                    }`}
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <Check className="size-5" /> : <Copy className="size-5" />}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-white/80">
                  Share this code with friends — they get ₹50 off, you earn ₹50 cashback!
                </p>
              </div>

              {/* Quick stat */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex flex-col items-center rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white">{referral.totalReferrals}</span>
                  <span className="text-xs text-white/70">Referrals</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Share Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="bg-gradient-to-r from-[#1D63FF]/5 to-[#1D63FF]/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] shadow-lg">
                <Share2 className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Share Your Link</h2>
                <p className="text-xs text-muted-foreground">Spread the word and earn rewards</p>
              </div>
            </div>
          </div>

          <CardContent className="p-5">
            {/* Copy link */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  value={referral.referralLink}
                  className="pl-9 rounded-xl pr-3 text-sm"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className={`shrink-0 rounded-xl px-4 transition-all ${
                  copiedLink
                    ? 'border-[#7DB0FF] bg-[#1D63FF]/5 text-[#1D63FF]'
                    : 'hover:border-[#9DC2FF] hover:bg-[#1D63FF]/5 hover:text-[#1D63FF]'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="mr-2 size-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 size-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            {/* Share buttons */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-[#1D63FF]/20 bg-[#1D63FF]/5 p-4 transition-all hover:border-[#7DB0FF] hover:bg-[#1D63FF]/5 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-[#1D63FF] shadow-md transition-transform group-hover:scale-110">
                  <MessageSquare className="size-5 text-white" />
                </div>
                <span className="text-xs font-medium text-[#0D3B7A]">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('email')}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-[#1D63FF]/20 bg-[#1D63FF]/5 p-4 transition-all hover:border-[#7DB0FF] hover:bg-[#1D63FF]/5 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4D8AFF] to-[#FFCE32] shadow-md transition-transform group-hover:scale-110">
                  <Mail className="size-5 text-white" />
                </div>
                <span className="text-xs font-medium text-[#0D3B7A]">Email</span>
              </button>

              <button
                onClick={() => handleShare('sms')}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-[#FFCE32]/20 bg-[#FFCE32]/5 p-4 transition-all hover:border-[#FFE066] hover:bg-[#FFCE32]/5 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFCE32] to-[#1D63FF] shadow-md transition-transform group-hover:scale-110">
                  <Send className="size-5 text-white" />
                </div>
                <span className="text-xs font-medium text-[#E6B800]">SMS</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral Stats */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  {referralLoading ? (
                    <Skeleton className="mt-1 h-8 w-16" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold text-[#1D63FF]">{referral.totalReferrals}</p>
                  )}
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF] shadow-lg">
                  <Users className="size-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Friends who signed up</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  {referralLoading ? (
                    <Skeleton className="mt-1 h-8 w-24" />
                  ) : (
                    <div className="mt-1 flex items-baseline gap-1">
                      <IndianRupee className="size-5 text-[#1D63FF]" />
                      <span className="text-3xl font-bold text-[#1D63FF]">
                        {referral.totalEarned?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE066] to-[#4D8AFF] shadow-lg">
                  <Trophy className="size-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Earned from referrals</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  {referralLoading ? (
                    <Skeleton className="mt-1 h-8 w-20" />
                  ) : (
                    <div className="mt-1 flex items-baseline gap-1">
                      <IndianRupee className="size-5 text-[#1D63FF]" />
                      <span className="text-3xl font-bold text-[#1D63FF]">
                        {referral.pendingRewards?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE066] to-yellow-500 shadow-lg">
                  <Star className="size-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="bg-gradient-to-r from-[#1D63FF]/5 to-[#1D63FF]/5 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#1D63FF]" />
              <h2 className="text-lg font-semibold">How It Works</h2>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] text-sm font-bold text-white shadow-md">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold">Share Your Code</p>
                  <p className="text-xs text-muted-foreground">Send your unique referral code to friends and family</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] text-sm font-bold text-white shadow-md">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold">Friend Signs Up</p>
                  <p className="text-xs text-muted-foreground">They register using your code and get ₹50 off their first booking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] text-sm font-bold text-white shadow-md">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold">You Earn ₹50</p>
                  <p className="text-xs text-muted-foreground">Once they complete a booking, ₹50 cashback is added to your wallet</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#1D63FF]/5 to-[#1D63FF]/5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Referral History</CardTitle>
              {referralHistory.length > 0 && (
                <Badge className="bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20 hover:bg-[#1D63FF]/10">
                  {referralHistory.length} Referrals
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {referralLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : referralHistory.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#1D63FF]/5">
                  <UserPlus className="size-8 text-[#9DC2FF]" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No Referrals Yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Start sharing your referral code to earn rewards!
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25"
                  size="sm"
                  onClick={handleCopyCode}
                >
                  <Copy className="mr-2 size-4" />
                  Copy Referral Code
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <AnimatePresence>
                    {displayedHistory.map((entry, idx) => {
                      const statusConf = STATUS_CONFIG[entry.status] || STATUS_CONFIG.PENDING;
                      const isCompleted = entry.status === 'COMPLETED';

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-gray-50/80"
                        >
                          {/* Avatar */}
                          <div className={`flex size-11 shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-md ${
                            isCompleted
                              ? 'bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF]'
                              : 'bg-gradient-to-br from-[#FFE066] to-[#4D8AFF]'
                          }`}>
                            {getInitials(entry.referredName)}
                          </div>

                          {/* Name & date */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold">{entry.referredName}</p>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{entry.referredEmail}</span>
                              <span>·</span>
                              <Clock className="size-3" />
                              <span>{formatDate(entry.referredAt)}</span>
                            </div>
                          </div>

                          {/* Reward & status */}
                          <div className="shrink-0 text-right">
                            <p className={`text-sm font-bold ${isCompleted ? 'text-[#1D63FF]' : 'text-[#1D63FF]'}`}>
                              {isCompleted ? '+' : ''}₹{entry.rewardEarned?.toLocaleString('en-IN')}
                            </p>
                            <Badge variant="outline" className={`mt-0.5 gap-1 text-[10px] font-semibold ${statusConf.className}`}>
                              <span className={`size-1.5 rounded-full ${statusConf.dotColor}`} />
                              {statusConf.label}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {referralHistory.length > 5 && (
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="text-[#1D63FF] hover:text-[#0D3B7A] hover:bg-[#1D63FF]/5"
                    >
                      {showAllHistory ? (
                        <>
                          Show Less <ChevronUp className="ml-1 size-4" />
                        </>
                      ) : (
                        <>
                          Show All ({referralHistory.length}) <ChevronDown className="ml-1 size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

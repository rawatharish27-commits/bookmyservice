'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Banknote,
  CreditCard,
  Gift,
  Clock,
  TrendingUp,
  History,
  IndianRupee,
  Building2,
  Smartphone,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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
interface WalletData {
  balance: number;
  cashbackBalance: number;
  promoBalance: number;
  totalCredited: number;
  totalDebited: number;
}

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  category: string;
  amount: number;
  description: string;
  createdAt: string;
  status?: string;
  referenceId?: string;
}

/* ---------- category config ---------- */
const CATEGORY_CONFIG: Record<string, { icon: typeof Wallet; gradient: string; bg: string; label: string }> = {
  TOP_UP: { icon: Plus, gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', label: 'Top Up' },
  BOOKING: { icon: CreditCard, gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-50', label: 'Booking' },
  CASHBACK: { icon: Gift, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', label: 'Cashback' },
  REFUND: { icon: ArrowDownLeft, gradient: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', label: 'Refund' },
  WITHDRAWAL: { icon: Banknote, gradient: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', label: 'Withdrawal' },
  PROMO: { icon: Gift, gradient: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', label: 'Promo' },
  PENALTY: { icon: AlertCircle, gradient: 'from-red-400 to-rose-500', bg: 'bg-red-50', label: 'Penalty' },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] || { icon: Wallet, gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', label: category };
}

/* ---------- filter tabs ---------- */
const FILTER_TABS = [
  { key: 'all', label: 'All', icon: History },
  { key: 'CREDIT', label: 'Credit', icon: ArrowDownLeft },
  { key: 'DEBIT', label: 'Debit', icon: ArrowUpRight },
] as const;

/* ==================== MAIN COMPONENT ==================== */
export function ClientWalletPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useApi<WalletData>('/api/wallet');
  const { data: transactionsData, loading: txLoading, refetch: refetchTx } = useApi<{ transactions: Transaction[] }>('/api/wallet/transactions');
  const { mutate, loading: mutating } = useApiMutation();

  const [activeFilter, setActiveFilter] = useState<'all' | 'CREDIT' | 'DEBIT'>('all');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'BANK' | 'UPI'>('BANK');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);

  const wallet = walletData || { balance: 0, cashbackBalance: 0, promoBalance: 0, totalCredited: 0, totalDebited: 0 };
  const transactions = transactionsData?.transactions || [];

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (activeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === activeFilter);
    }
    return filtered;
  }, [transactions, activeFilter]);

  const displayedTransactions = showAllTx ? filteredTransactions : filteredTransactions.slice(0, 8);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;
    try {
      await mutate('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method: withdrawMethod,
          ...(withdrawMethod === 'UPI' ? { upiId: withdrawUpiId } : {}),
        }),
      });
      setWithdrawSuccess(true);
      refetchWallet();
      refetchTx();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const resetWithdrawForm = () => {
    setWithdrawAmount('');
    setWithdrawMethod('BANK');
    setWithdrawUpiId('');
    setWithdrawSuccess(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your balance, transactions and withdrawals</p>
      </motion.div>

      {/* Wallet Balance Card */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 shadow-xl shadow-emerald-500/20">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-100">
              <Wallet className="size-5" />
              <span className="text-sm font-medium">Total Balance</span>
            </div>

            {walletLoading ? (
              <Skeleton className="mt-2 h-12 w-48 bg-white/20" />
            ) : (
              <div className="mt-2 flex items-baseline gap-1">
                <IndianRupee className="size-7 text-emerald-200 sm:size-8" />
                <span className="text-4xl font-bold text-white sm:text-5xl">
                  {wallet.balance?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-emerald-200">
                  <Gift className="size-3.5" />
                  <span className="text-xs font-medium">Cashback</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">
                  ₹{wallet.cashbackBalance?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-emerald-200">
                  <CreditCard className="size-3.5" />
                  <span className="text-xs font-medium">Promo</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">
                  ₹{wallet.promoBalance?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-white/10 p-3 backdrop-blur-sm sm:col-span-1">
                <div className="flex items-center gap-1.5 text-emerald-200">
                  <TrendingUp className="size-3.5" />
                  <span className="text-xs font-medium">Total Credited</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">
                  ₹{wallet.totalCredited?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate('categories')}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/25 transition-shadow hover:shadow-xl"
          >
            <Plus className="size-6" />
            <span className="text-sm font-semibold">Add Money</span>
          </button>
        </motion.div>
        <motion.div variants={fadeUp}>
          <button
            onClick={() => { resetWithdrawForm(); setWithdrawOpen(true); }}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-lg shadow-rose-500/25 transition-shadow hover:shadow-xl"
          >
            <Banknote className="size-6" />
            <span className="text-sm font-semibold">Withdraw</span>
          </button>
        </motion.div>
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate('client-bookings')}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-lg shadow-sky-500/25 transition-shadow hover:shadow-xl"
          >
            <CreditCard className="size-6" />
            <span className="text-sm font-semibold">Pay for Service</span>
          </button>
        </motion.div>
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate('client-coupons')}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/25 transition-shadow hover:shadow-xl"
          >
            <Gift className="size-6" />
            <span className="text-sm font-semibold">Promos</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
              {/* Filter Tabs */}
              <div className="flex gap-1.5">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                          : 'bg-white/60 text-muted-foreground hover:bg-white hover:text-foreground'
                      }`}
                    >
                      <tab.icon className="size-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-11 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <History className="size-8 text-emerald-300" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No transactions yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {activeFilter !== 'all' ? 'Try a different filter' : 'Your transactions will appear here'}
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  size="sm"
                  onClick={() => navigate('categories')}
                >
                  Book a Service
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <AnimatePresence>
                    {displayedTransactions.map((tx, idx) => {
                      const catConfig = getCategoryConfig(tx.category);
                      const isCredit = tx.type === 'CREDIT';
                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-gray-50/80"
                        >
                          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${catConfig.gradient} shadow-md`}>
                            <catConfig.icon className="size-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold">{tx.description || catConfig.label}</p>
                              <Badge variant="outline" className={`shrink-0 gap-1 text-[10px] font-semibold ${
                                isCredit
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-rose-200 bg-rose-50 text-rose-700'
                              }`}>
                                {isCredit ? <ArrowDownLeft className="size-2.5" /> : <ArrowUpRight className="size-2.5" />}
                                {tx.type}
                              </Badge>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{catConfig.label}</span>
                              <span>·</span>
                              <Clock className="size-3" />
                              <span>
                                {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                            </p>
                            {tx.status && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{tx.status}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {filteredTransactions.length > 8 && (
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllTx(!showAllTx)}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      {showAllTx ? (
                        <>Show Less <ChevronUp className="ml-1 size-4" /></>
                      ) : (
                        <>Show All ({filteredTransactions.length}) <ChevronDown className="ml-1 size-4" /></>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={(open) => { if (!open) setWithdrawOpen(false); }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {withdrawSuccess ? (
            <div className="flex flex-col items-center py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex size-20 items-center justify-center rounded-full bg-emerald-100"
              >
                <CheckCircle2 className="size-10 text-emerald-600" />
              </motion.div>
              <h3 className="mt-4 text-lg font-bold">Withdrawal Requested!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your withdrawal of ₹{parseFloat(withdrawAmount || '0').toLocaleString('en-IN')} via{' '}
                {withdrawMethod === 'BANK' ? 'Bank Transfer' : 'UPI'} has been submitted. It will be processed within 24-48 hours.
              </p>
              <Button
                className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                onClick={() => { setWithdrawOpen(false); resetWithdrawForm(); }}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Banknote className="size-5 text-emerald-600" />
                  Withdraw Funds
                </DialogTitle>
                <DialogDescription>
                  Transfer money from your wallet to your bank account or UPI.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Available balance */}
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-medium text-emerald-700">Available Balance</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">₹{wallet.balance?.toLocaleString('en-IN') || '0'}</p>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-9 rounded-xl"
                      min={1}
                      max={wallet.balance || 0}
                    />
                  </div>
                  {/* Quick amount buttons */}
                  <div className="flex gap-2">
                    {[100, 500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(String(amt))}
                        className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100"
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Withdraw Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWithdrawMethod('BANK')}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        withdrawMethod === 'BANK'
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-muted hover:border-emerald-200 hover:bg-emerald-50/30'
                      }`}
                    >
                      <Building2 className={`size-6 ${withdrawMethod === 'BANK' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${withdrawMethod === 'BANK' ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        Bank Transfer
                      </span>
                    </button>
                    <button
                      onClick={() => setWithdrawMethod('UPI')}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        withdrawMethod === 'UPI'
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-muted hover:border-emerald-200 hover:bg-emerald-50/30'
                      }`}
                    >
                      <Smartphone className={`size-6 ${withdrawMethod === 'UPI' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${withdrawMethod === 'UPI' ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        UPI Transfer
                      </span>
                    </button>
                  </div>
                </div>

                {/* UPI ID field (conditional) */}
                {withdrawMethod === 'UPI' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium">UPI ID</label>
                    <Input
                      placeholder="yourname@upi"
                      value={withdrawUpiId}
                      onChange={(e) => setWithdrawUpiId(e.target.value)}
                      className="rounded-xl"
                    />
                  </motion.div>
                )}

                {/* Summary */}
                {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Withdrawal Amount</span>
                      <span className="font-semibold">₹{parseFloat(withdrawAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">{withdrawMethod === 'BANK' ? 'Bank Transfer' : 'UPI'}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing Time</span>
                      <span className="font-medium">24-48 hours</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    mutating ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    parseFloat(withdrawAmount) > (wallet.balance || 0) ||
                    (withdrawMethod === 'UPI' && !withdrawUpiId)
                  }
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                >
                  {mutating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Banknote className="mr-2 size-4" />
                      Withdraw ₹{withdrawAmount ? parseFloat(withdrawAmount).toLocaleString('en-IN') : '0'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

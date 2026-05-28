'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { toast } from 'sonner';
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

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
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Wallet; gradient: string; label: string }> = {
  TOP_UP: { icon: Plus, gradient: 'from-[#7DB0FF] to-[#4D8AFF]', label: 'Top Up' },
  BOOKING: { icon: CreditCard, gradient: 'from-[#4D8AFF] to-[#1D63FF]', label: 'Booking' },
  EARNING: { icon: TrendingUp, gradient: 'from-[#7DB0FF] to-[#4D8AFF]', label: 'Earning' },
  CASHBACK: { icon: Gift, gradient: 'from-[#FFCE32] to-[#1D63FF]', label: 'Cashback' },
  REFUND: { icon: ArrowDownLeft, gradient: 'from-violet-400 to-purple-500', label: 'Refund' },
  WITHDRAWAL: { icon: Banknote, gradient: 'from-rose-400 to-pink-500', label: 'Withdrawal' },
  PAYOUT: { icon: Banknote, gradient: 'from-amber-400 to-orange-500', label: 'Payout' },
  PENALTY: { icon: AlertCircle, gradient: 'from-red-400 to-rose-500', label: 'Penalty' },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] || { icon: Wallet, gradient: 'from-gray-400 to-gray-500', label: category };
}

const FILTER_TABS = [
  { key: 'all', label: 'All', icon: History },
  { key: 'CREDIT', label: 'Credit', icon: ArrowDownLeft },
  { key: 'DEBIT', label: 'Debit', icon: ArrowUpRight },
] as const;

export function VendorWalletPage() {
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
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  const wallet = walletData || { balance: 0, cashbackBalance: 0, promoBalance: 0, totalCredited: 0, totalDebited: 0 };
  const transactions = transactionsData?.transactions || [];

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter((t) => t.type === activeFilter);
  }, [transactions, activeFilter]);

  const displayedTransactions = showAllTx ? filteredTransactions : filteredTransactions.slice(0, 8);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }
    try {
      await mutate('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method: withdrawMethod === 'BANK' ? 'BANK_TRANSFER' : 'UPI',
          ...(withdrawMethod === 'UPI' ? { upiId: withdrawUpiId } : {
            bankAccountNumber,
            bankIfscCode,
            bankAccountHolder,
          }),
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
    setBankAccountNumber('');
    setBankIfscCode('');
    setBankAccountHolder('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Vendor Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your earnings, balance and payouts</p>
      </motion.div>

      {/* Wallet Balance Card */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-6 sm:p-8 shadow-xl shadow-amber-500/20">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-amber-100">
              <Wallet className="size-5" />
              <span className="text-sm font-medium">Available Balance</span>
            </div>
            {walletLoading ? (
              <Skeleton className="mt-2 h-12 w-48 bg-white/20" />
            ) : (
              <div className="mt-2 flex items-baseline gap-1">
                <IndianRupee className="size-7 text-amber-200 sm:size-8" />
                <span className="text-4xl font-bold text-white sm:text-5xl">
                  {wallet.balance?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-amber-200">
                  <TrendingUp className="size-3.5" />
                  <span className="text-xs font-medium">Total Earned</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">₹{wallet.totalCredited?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-amber-200">
                  <Banknote className="size-3.5" />
                  <span className="text-xs font-medium">Total Withdrawn</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">₹{wallet.totalDebited?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-white/10 p-3 backdrop-blur-sm sm:col-span-1">
                <div className="flex items-center gap-1.5 text-amber-200">
                  <Gift className="size-3.5" />
                  <span className="text-xs font-medium">Cashback</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">₹{wallet.cashbackBalance?.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          onClick={() => toast.info('Wallet top-up coming soon!')}
          className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/25 transition-shadow hover:shadow-xl"
        >
          <Plus className="size-6" />
          <span className="text-sm font-semibold">Add Money</span>
        </button>
        <button
          onClick={() => { resetWithdrawForm(); setWithdrawOpen(true); }}
          className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-lg shadow-rose-500/25 transition-shadow hover:shadow-xl"
        >
          <Banknote className="size-6" />
          <span className="text-sm font-semibold">Withdraw</span>
        </button>
        <button
          onClick={() => navigate('vendor-payouts')}
          className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-[#1D63FF] to-[#1D63FF] p-5 text-white shadow-lg shadow-[#1D63FF]/25 transition-shadow hover:shadow-xl"
        >
          <History className="size-6" />
          <span className="text-sm font-semibold">Payouts</span>
        </button>
      </div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
              <div className="flex gap-1.5">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
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
                {[1, 2, 3].map((i) => (
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
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50">
                  <History className="size-8 text-amber-300" />
                </div>
                <p className="mt-3 font-medium text-muted-foreground">No transactions yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Your earnings will appear here</p>
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
                                isCredit ? 'border-[#FFCE32]/30 bg-[#FFCE32]/10 text-[#0D3B7A]' : 'border-rose-200 bg-rose-50 text-rose-700'
                              }`}>
                                {isCredit ? <ArrowDownLeft className="size-2.5" /> : <ArrowUpRight className="size-2.5" />}
                                {tx.type}
                              </Badge>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{catConfig.label}</span>
                              <span>·</span>
                              <Clock className="size-3" />
                              <span>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`text-sm font-bold ${isCredit ? 'text-[#1D63FF]' : 'text-rose-600'}`}>
                              {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                            </p>
                            {tx.status && <p className="mt-0.5 text-[10px] text-muted-foreground">{tx.status}</p>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {filteredTransactions.length > 8 && (
                  <div className="mt-3 flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setShowAllTx(!showAllTx)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      {showAllTx ? <>Show Less <ChevronUp className="ml-1 size-4" /></> : <>Show All ({filteredTransactions.length}) <ChevronDown className="ml-1 size-4" /></>}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={(open) => { if (!open) { setWithdrawOpen(false); resetWithdrawForm(); } }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {withdrawSuccess ? (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Withdrawal Requested</DialogTitle>
                <DialogDescription>Your withdrawal request has been submitted</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="flex size-20 items-center justify-center rounded-full bg-[#FFCE32]/10">
                  <CheckCircle2 className="size-10 text-[#1D63FF]" />
                </motion.div>
                <h3 className="mt-4 text-lg font-bold">Withdrawal Requested!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your withdrawal of ₹{parseFloat(withdrawAmount || '0').toLocaleString('en-IN')} via {withdrawMethod === 'BANK' ? 'Bank Transfer' : 'UPI'} has been submitted. It will be processed within 24-48 hours.
                </p>
                <Button className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25" onClick={() => { setWithdrawOpen(false); resetWithdrawForm(); }}>
                  Done
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Banknote className="size-5 text-amber-600" /> Withdraw Funds</DialogTitle>
                <DialogDescription>Transfer money from your wallet to your bank account or UPI.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-medium text-amber-700">Available Balance</p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">₹{wallet.balance?.toLocaleString('en-IN') || '0'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="pl-9 rounded-xl" min={1} max={wallet.balance || 0} />
                  </div>
                  <div className="flex gap-2">
                    {[100, 500, 1000, 2000].map((amt) => (
                      <button key={amt} onClick={() => setWithdrawAmount(String(amt))} className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100">
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setWithdrawMethod('BANK')} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${withdrawMethod === 'BANK' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-muted hover:border-amber-200'}`}>
                      <Building2 className={`size-6 ${withdrawMethod === 'BANK' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${withdrawMethod === 'BANK' ? 'text-amber-700' : 'text-muted-foreground'}`}>Bank Transfer</span>
                    </button>
                    <button onClick={() => setWithdrawMethod('UPI')} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${withdrawMethod === 'UPI' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-muted hover:border-amber-200'}`}>
                      <Smartphone className={`size-6 ${withdrawMethod === 'UPI' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${withdrawMethod === 'UPI' ? 'text-amber-700' : 'text-muted-foreground'}`}>UPI Transfer</span>
                    </button>
                  </div>
                </div>
                {withdrawMethod === 'UPI' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">UPI ID</label>
                    <Input placeholder="yourname@upi" value={withdrawUpiId} onChange={(e) => setWithdrawUpiId(e.target.value)} className="rounded-xl" />
                  </div>
                )}
                {withdrawMethod === 'BANK' && (
                  <div className="space-y-3">
                    <div className="space-y-2"><label className="text-sm font-medium">Account Number</label><Input placeholder="Enter account number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="rounded-xl" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">IFSC Code</label><Input placeholder="Enter IFSC code" value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} className="rounded-xl" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Account Holder Name</label><Input placeholder="Enter account holder name" value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)} className="rounded-xl" /></div>
                  </div>
                )}
                {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Withdrawal Amount</span><span className="font-semibold">₹{parseFloat(withdrawAmount).toLocaleString('en-IN')}</span></div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Method</span><span className="font-medium">{withdrawMethod === 'BANK' ? 'Bank Transfer' : 'UPI'}</span></div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Processing Time</span><span className="font-medium">24-48 hours</span></div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setWithdrawOpen(false)} className="rounded-xl">Cancel</Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={mutating || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (wallet.balance || 0) || (withdrawMethod === 'UPI' && !withdrawUpiId) || (withdrawMethod === 'BANK' && (!bankAccountNumber || !bankIfscCode || !bankAccountHolder))}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                >
                  {mutating ? <><Loader2 className="mr-2 size-4 animate-spin" />Processing...</> : <><Banknote className="mr-2 size-4" />Withdraw ₹{withdrawAmount ? parseFloat(withdrawAmount).toLocaleString('en-IN') : '0'}</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Wallet,
  Search,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  createdAt: string;
  processedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  upiId?: string;
}

interface PayoutsResponse {
  payouts: Payout[];
  stats: {
    totalPendingAmount: number;
    totalApprovedAmount: number;
    totalRejectedAmount: number;
  };
  pagination: { page: number; total: number; totalPages: number };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function PayoutStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: React.ReactNode }> = {
    PENDING: {
      className: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: <Clock className="mr-1 size-3" />,
    },
    APPROVED: {
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="mr-1 size-3" />,
    },
    REJECTED: {
      className: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <XCircle className="mr-1 size-3" />,
    },
    PROCESSING: {
      className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: <Loader2 className="mr-1 size-3 animate-spin" />,
    },
    COMPLETED: {
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle2 className="mr-1 size-3" />,
    },
  };
  const cfg = config[status] || { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: null };
  return (
    <Badge variant="outline" className={cfg.className}>
      <span className="flex items-center">
        {cfg.icon}
        {status}
      </span>
    </Badge>
  );
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString()}`;
}

const statusFilters = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function AdminPayoutsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [processing, setProcessing] = useState(false);

  const buildUrl = () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    if (search) params.set('search', search);
    return `/api/admin/payouts?${params.toString()}`;
  };

  const { data, loading, refetch } = useApi<PayoutsResponse>(buildUrl());
  const { mutate } = useApiMutation();

  const payouts = data?.payouts || [];
  const stats = data?.stats || { totalPendingAmount: 0, totalApprovedAmount: 0, totalRejectedAmount: 0 };
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const handleAction = async () => {
    if (!selectedPayout || !actionType) return;
    setProcessing(true);
    try {
      await mutate(`/api/admin/payouts/${selectedPayout.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: actionType }),
      });
      setSelectedPayout(null);
      setActionType(null);
      refetch();
    } catch {
      // handled
    } finally {
      setProcessing(false);
    }
  };

  const openActionDialog = (payout: Payout, type: 'APPROVED' | 'REJECTED') => {
    setSelectedPayout(payout);
    setActionType(type);
  };

  const statCards = [
    {
      label: 'Pending Amount',
      value: formatCurrency(stats.totalPendingAmount),
      icon: Clock,
      bgLight: 'bg-sky-50',
      textColor: 'text-sky-700',
      borderColor: 'border-l-sky-500',
      gradient: 'from-sky-500 to-blue-500',
    },
    {
      label: 'Approved Amount',
      value: formatCurrency(stats.totalApprovedAmount),
      icon: CheckCircle2,
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-l-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Rejected Amount',
      value: formatCurrency(stats.totalRejectedAmount),
      icon: XCircle,
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-l-rose-500',
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage platform payouts and settlements
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className={`border-l-4 ${card.borderColor} transition-shadow hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {card.label}
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                    </div>
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.bgLight}`}>
                      <Icon className={`size-5 ${card.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="mb-6 mt-6">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  className={
                    statusFilter === filter.value
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shrink-0'
                      : 'shrink-0'
                  }
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setPage(1);
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payouts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                <DollarSign className="mb-4 size-12 opacity-50" />
                <p className="text-lg font-medium">No payouts found</p>
                <p className="mt-1 text-sm">
                  {statusFilter !== 'ALL'
                    ? 'No payouts with the selected status'
                    : 'Payout requests will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden sm:table-cell">Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {payouts.map((payout, index) => (
                        <motion.tr
                          key={payout.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
                                <span className="text-sm font-bold text-emerald-700">
                                  {payout.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{payout.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{payout.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(payout.amount)}
                            </p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ArrowRightLeft className="size-3" />
                              {payout.method}
                            </div>
                          </TableCell>
                          <TableCell>
                            <PayoutStatusBadge status={payout.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {payout.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  onClick={() => openActionDialog(payout, 'APPROVED')}
                                  title="Approve"
                                >
                                  <CheckCircle2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                  onClick={() => openActionDialog(payout, 'REJECTED')}
                                  title="Reject"
                                >
                                  <XCircle className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Approve/Reject Dialog */}
      <Dialog
        open={!!selectedPayout && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPayout(null);
            setActionType(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-2 ${
                actionType === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {actionType === 'APPROVED' ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <XCircle className="size-5" />
              )}
              {actionType === 'APPROVED' ? 'Approve Payout' : 'Reject Payout'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'APPROVED'
                ? 'This will approve the payout request for processing.'
                : 'This will reject the payout request.'}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">User</p>
                    <p className="font-medium">{selectedPayout.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(selectedPayout.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Method</p>
                    <p>{selectedPayout.method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Requested</p>
                    <p>
                      {new Date(selectedPayout.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {selectedPayout.upiId && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">UPI ID</p>
                    <p>{selectedPayout.upiId}</p>
                  </div>
                )}
                {selectedPayout.bankDetails && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedPayout.bankDetails.bankName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Bank</p>
                        <p>{selectedPayout.bankDetails.bankName}</p>
                      </div>
                    )}
                    {selectedPayout.bankDetails.accountNumber && (
                      <div>
                        <p className="text-xs text-muted-foreground">Account</p>
                        <p>****{selectedPayout.bankDetails.accountNumber.slice(-4)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {actionType === 'REJECTED' && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                  <p className="text-sm text-rose-700">
                    Rejecting this payout will notify the user. This action cannot be undone.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedPayout(null);
                    setActionType(null);
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${
                    actionType === 'APPROVED'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                  onClick={handleAction}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : actionType === 'APPROVED' ? (
                    <CheckCircle2 className="mr-2 size-4" />
                  ) : (
                    <XCircle className="mr-2 size-4" />
                  )}
                  {processing
                    ? actionType === 'APPROVED'
                      ? 'Approving...'
                      : 'Rejecting...'
                    : actionType === 'APPROVED'
                      ? 'Approve'
                      : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  ArrowRight,
  Calendar,
  IndianRupee,
  Clock,
  Download,
  Filter,
  Receipt,
  ChevronDown,
} from 'lucide-react';

/* ---------- types ---------- */
interface Invoice {
  id: string;
  invoiceNumber: string;
  serviceTitle: string;
  amount: number;
  gst: number;
  total: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  providerName?: string;
  bookingNumber?: string;
}

interface InvoicesResponse {
  invoices: Invoice[];
}

/* ---------- status config ---------- */
const STATUS_CONFIG: Record<string, { className: string; dotColor: string; gradient: string; label: string }> = {
  PAID: {
    className: 'bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20',
    dotColor: 'bg-[#7DB0FF]',
    gradient: 'from-[#7DB0FF] to-[#4D8AFF]',
    label: 'Paid',
  },
  PENDING: {
    className: 'bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20',
    dotColor: 'bg-[#FFE066]',
    gradient: 'from-[#FFE066] to-[#4D8AFF]',
    label: 'Pending',
  },
  OVERDUE: {
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-400',
    gradient: 'from-red-400 to-rose-500',
    label: 'Overdue',
  },
  CANCELLED: {
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    dotColor: 'bg-gray-400',
    gradient: 'from-gray-400 to-gray-500',
    label: 'Cancelled',
  },
};

/* ---------- filter tabs ---------- */
const FILTER_TABS = [
  { key: 'all', label: 'All', icon: Receipt },
  { key: 'PAID', label: 'Paid', icon: FileText },
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'OVERDUE', label: 'Overdue', icon: IndianRupee },
] as const;

/* ---------- animation ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

/* ==================== MAIN COMPONENT ==================== */
export function ClientInvoicesPage() {
  const { navigate } = useApp();
  const { data, loading } = useApi<InvoicesResponse>('/api/invoices');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const invoices = data?.invoices || [];

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    if (activeFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.serviceTitle?.toLowerCase().includes(q) ||
          inv.providerName?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [invoices, activeFilter, searchQuery]);

  const statusCounts = useMemo(() => ({
    all: invoices.length,
    PAID: invoices.filter((i) => i.status === 'PAID').length,
    PENDING: invoices.filter((i) => i.status === 'PENDING').length,
    OVERDUE: invoices.filter((i) => i.status === 'OVERDUE').length,
  }), [invoices]);

  const totalPaid = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((s, i) => s + (i.total || 0), 0);
  const totalPending = invoices
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((s, i) => s + (i.total || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">My Invoices</h1>
          <p className="text-sm text-muted-foreground">View and download your service invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-muted-foreground/20 focus:border-[#7DB0FF]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0 rounded-xl"
          >
            <Filter className="size-4" />
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4D8AFF] to-[#1D63FF] p-4 text-white shadow-lg shadow-[#4D8AFF]/20">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/10 blur-xl" />
            <Receipt className="size-5 text-white/70" />
            <p className="mt-2 text-2xl font-bold">{invoices.length}</p>
            <p className="text-xs text-white/80">Total Invoices</p>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7DB0FF] to-[#4D8AFF] p-4 text-white shadow-lg shadow-[#7DB0FF]/20">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/10 blur-xl" />
            <IndianRupee className="size-5 text-white/70" />
            <p className="mt-2 text-2xl font-bold">₹{totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-xs text-white/80">Total Paid</p>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFE066] to-[#4D8AFF] p-4 text-white shadow-lg shadow-[#FFE066]/20">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/10 blur-xl" />
            <Clock className="size-5 text-white/70" />
            <p className="mt-2 text-2xl font-bold">₹{totalPending.toLocaleString('en-IN')}</p>
            <p className="text-xs text-white/80">Pending</p>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4D8AFF] to-[#4D8AFF] p-4 text-white shadow-lg shadow-[#4D8AFF]/20">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/10 blur-xl" />
            <Download className="size-5 text-white/70" />
            <p className="mt-2 text-2xl font-bold">
              {invoices.filter((i) => i.status === 'PAID').length}
            </p>
            <p className="text-xs text-white/80">Downloadable</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = statusCounts[tab.key as keyof typeof statusCounts] || 0;
          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="size-4" />
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                isActive ? 'bg-white/25' : 'bg-muted'
              }`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Invoice Cards */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex flex-col items-center py-16 text-center"
          >
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D63FF]/10 to-[#1D63FF]/5">
              <FileText className="size-10 text-[#9DC2FF]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No invoices found</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {searchQuery ? 'Try a different search term' : 'Your invoices will appear here after bookings'}
            </p>
            <Button
              className="mt-4 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25"
              onClick={() => navigate('client-bookings')}
            >
              View Bookings <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            {filteredInvoices.map((invoice, idx) => {
              const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.PENDING;
              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-0">
                      <div className={`h-1 bg-gradient-to-r ${statusConf.gradient}`} />
                      <button
                        onClick={() => navigate('client-invoice-detail', { id: invoice.id })}
                        className="flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:gap-6"
                      >
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${statusConf.gradient} shadow-md`}>
                          <FileText className="size-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
                            <Badge variant="outline" className={`${statusConf.className} gap-1.5 text-xs font-semibold`}>
                              <span className={`size-1.5 rounded-full ${statusConf.dotColor}`} />
                              {statusConf.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground truncate">
                            {invoice.serviceTitle || 'Service'}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(invoice.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {invoice.providerName && (
                              <span>· {invoice.providerName}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <p className="bg-gradient-to-r from-[#1D63FF] to-[#1D63FF] bg-clip-text text-lg font-bold text-transparent">
                            ₹{invoice.total?.toLocaleString('en-IN')}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Base: ₹{invoice.amount?.toLocaleString('en-IN')}</span>
                            <span>+ GST: ₹{invoice.gst?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More */}
      {filteredInvoices.length > 5 && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-xl text-[#1D63FF] hover:text-[#0D3B7A] hover:bg-[#1D63FF]/5"
          >
            <ChevronDown className="mr-2 size-4" />
            Load More Invoices
          </Button>
        </div>
      )}
    </div>
  );
}

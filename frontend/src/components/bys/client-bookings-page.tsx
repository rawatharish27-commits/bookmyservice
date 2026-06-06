import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  CalendarDays,
  XCircle,
  Loader2,
  Search,
  Clock,
  User,
  MapPin,
  ArrowRight,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string; iconBg: string }> = {
    PENDING: { className: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', dotColor: 'bg-[#FFD54F]', iconBg: 'bg-[#FFD54F]/10' },
    ACCEPTED: { className: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', dotColor: 'bg-[#E0B84C]', iconBg: 'bg-[#FFD54F]/10' },
    IN_PROGRESS: { className: 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/30', dotColor: 'bg-[#E0B84C]', iconBg: 'bg-[#FFD54F]/10' },
    COMPLETED: { className: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', dotColor: 'bg-[#FFD54F]', iconBg: 'bg-[#FFD54F]/10' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400', iconBg: 'bg-red-100' },
    REFUNDED: { className: 'bg-gray-50 text-gray-700 border-gray-200', dotColor: 'bg-gray-400', iconBg: 'bg-gray-100' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace('_', ' ')}
    </Badge>
  );
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  basePrice: number;
  finalPrice: number;
  platformFee: number;
  service?: { id: string; title: string };
  provider?: { id: string; name: string };
}

const TAB_CONFIG: Record<string, { label: string; gradient: string; icon: typeof Briefcase }> = {
  all: { label: 'All', gradient: 'from-gray-400 to-gray-500', icon: Briefcase },
  upcoming: { label: 'Upcoming', gradient: 'from-[#E0B84C] to-[#FFD54F]', icon: CalendarDays },
  in_progress: { label: 'In Progress', gradient: 'from-[#E0B84C] to-[#FFD54F]', icon: Clock },
  completed: { label: 'Completed', gradient: 'from-[#FFD54F] to-[#E0B84C]', icon: Briefcase },
  cancelled: { label: 'Cancelled', gradient: 'from-red-400 to-rose-500', icon: XCircle },
};

export function ClientBookingsPage() {
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<{ bookings: Booking[] }>('/api/bookings');
  const { mutate, loading: cancelling } = useApiMutation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const bookings = data?.bookings || [];

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    if (activeTab === 'upcoming') {
      filtered = filtered.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status));
    } else if (activeTab === 'in_progress') {
      filtered = filtered.filter((b) => b.status === 'IN_PROGRESS');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((b) => b.status === 'COMPLETED');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter((b) => ['CANCELLED', 'REFUNDED'].includes(b.status));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(q) ||
          b.service?.title?.toLowerCase().includes(q) ||
          b.provider?.name?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [bookings, activeTab, searchQuery]);

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await mutate(`/api/bookings/${cancelDialog.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setCancelDialog(null);
      setCancelReason('');
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const tabCounts = useMemo(() => ({
    all: bookings.length,
    upcoming: bookings.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status)).length,
    in_progress: bookings.filter((b) => b.status === 'IN_PROGRESS').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => ['CANCELLED', 'REFUNDED'].includes(b.status)).length,
  }), [bookings]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage and track your service bookings</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-muted-foreground/20 focus:border-[#E0B84C]"
          />
        </div>
      </motion.div>

      {/* Status Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {Object.entries(TAB_CONFIG).map(([key, config]) => {
          const count = tabCounts[key as keyof typeof tabCounts] || 0;
          const isActive = activeTab === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <config.icon className="size-4" />
              <span>{config.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                isActive ? 'bg-white/25' : 'bg-muted'
              }`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Booking Cards */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/5">
              <CalendarDays className="size-10 text-[#FFD54F]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No bookings found</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {searchQuery ? 'Try a different search term' : 'Book a service to get started'}
            </p>
            <Button
              className="mt-4 bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25"
              onClick={() => navigate('categories')}
            >
              Browse Services <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredBookings.map((booking, idx) => {
              const tabConf = TAB_CONFIG[booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? 'cancelled' :
                booking.status === 'COMPLETED' ? 'completed' :
                booking.status === 'IN_PROGRESS' ? 'in_progress' : 'upcoming'] || TAB_CONFIG.all;
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-0">
                      {/* Status indicator bar */}
                      <div className={`h-1 bg-gradient-to-r ${tabConf.gradient}`} />
                      <button
                        onClick={() => navigate('client-booking-detail', { bookingId: booking.id })}
                        className="flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:gap-6"
                      >
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tabConf.gradient} shadow-md`}>
                          <Briefcase className="size-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{booking.service?.title || 'Service'}</p>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="size-3" />
                            {booking.provider?.name || 'Provider'}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            at {booking.scheduledTime}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <p className="text-gradient text-lg font-bold">₹{booking.finalPrice?.toLocaleString()}</p>
                          {['PENDING', 'ACCEPTED'].includes(booking.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelDialog(booking);
                              }}
                            >
                              <XCircle className="mr-1 size-3.5" />
                              Cancel
                            </Button>
                          )}
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

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => !open && setCancelDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {cancelDialog?.bookingNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for cancellation (optional)</label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling..."
              rows={3}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)} className="rounded-xl">
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-xl"
            >
              {cancelling ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

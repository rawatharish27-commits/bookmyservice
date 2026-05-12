import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarCheck, User, Briefcase, Clock, CheckCircle2, XCircle, Play, Eye } from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  finalPrice: number;
  basePrice: number;
  platformFee: number;
  providerEarnings: number;
  serviceAddress: string;
  specialInstructions?: string;
  service: { id: string; title: string; basePrice: number };
  client: { id: string; name: string; profileImageUrl?: string };
  createdAt: string;
}

interface BookingResponse {
  bookings: Booking[];
  pagination: { total: number };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    PENDING: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-400' },
    ACCEPTED: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-400' },
    IN_PROGRESS: { className: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-400' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400' },
    CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
  };
  const c = config[status] || { className: 'bg-gray-50 text-gray-700 border-gray-200', dotColor: 'bg-gray-400' };
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status.replace('_', ' ')}
    </Badge>
  );
}

const TABS = [
  { key: 'PENDING', label: 'New Requests', gradient: 'from-amber-400 to-orange-500', icon: Clock },
  { key: 'ACCEPTED', label: 'Accepted', gradient: 'from-sky-400 to-blue-500', icon: CheckCircle2 },
  { key: 'IN_PROGRESS', label: 'In Progress', gradient: 'from-orange-400 to-amber-500', icon: Play },
  { key: 'COMPLETED', label: 'Completed', gradient: 'from-emerald-400 to-teal-500', icon: CheckCircle2 },
  { key: 'CANCELLED', label: 'Cancelled', gradient: 'from-red-400 to-rose-500', icon: XCircle },
];

export function ProviderBookingsPage() {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState('PENDING');
  const { data, loading, refetch } = useApi<BookingResponse>(`/api/bookings?status=${activeTab}&limit=50`);
  const { mutate } = useApiMutation();

  const bookings = data?.bookings || [];

  const handleAction = async (bookingId: string, action: string) => {
    try {
      await mutate(`/api/bookings/${bookingId}/${action}`, { method: 'PATCH' });
      refetch();
    } catch {
      // handled
    }
  };

  const getActions = (booking: Booking) => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25 rounded-lg"
              onClick={() => handleAction(booking.id, 'accept')}
            >
              <CheckCircle2 className="mr-1 size-3" /> Accept
            </Button>
            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => handleAction(booking.id, 'reject')}>
              <XCircle className="mr-1 size-3" /> Reject
            </Button>
          </>
        );
      case 'ACCEPTED':
        return (
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm rounded-lg"
            onClick={() => handleAction(booking.id, 'start')}
          >
            <Play className="mr-1 size-3" /> Start Service
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25 rounded-lg"
            onClick={() => handleAction(booking.id, 'complete')}
          >
            <CheckCircle2 className="mr-1 size-3" /> Mark Complete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your service bookings</p>
      </motion.div>

      {/* Tab Buttons */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50">
                  <CalendarCheck className="size-10 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">
                  No {TABS.find(t => t.key === activeTab)?.label.toLowerCase()}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {activeTab === 'PENDING'
                    ? 'New booking requests will appear here'
                    : `No ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()} bookings found`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-3">
                {bookings.map((booking, idx) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm transition-shadow hover:shadow-md">
                      <div className={`h-1 bg-gradient-to-r ${TABS.find(t => t.key === booking.status)?.gradient || 'from-gray-400 to-gray-500'}`} />
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                #{booking.bookingNumber}
                              </span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Briefcase className="size-4 text-emerald-600" />
                              <span className="font-medium">{booking.service?.title}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="size-3" />
                              {booking.client?.name}
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {booking.scheduledDate} at {booking.scheduledTime}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-gradient text-lg font-bold">
                              ₹{booking.finalPrice?.toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              {getActions(booking)}
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg"
                                onClick={() => navigate('provider-booking-detail', { bookingId: booking.id })}
                              >
                                <Eye className="mr-1 size-3" /> Detail
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

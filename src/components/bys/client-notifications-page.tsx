'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  CalendarCheck,
  Star,
  AlertTriangle,
  MessageSquare,
  Info,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

function getNotifConfig(type: string) {
  switch (type) {
    case 'BOOKING':
      return { icon: CalendarCheck, gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-100' };
    case 'REVIEW':
      return { icon: Star, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-100' };
    case 'DISPUTE':
      return { icon: AlertTriangle, gradient: 'from-orange-400 to-red-500', bg: 'bg-orange-100' };
    case 'MESSAGE':
      return { icon: MessageSquare, gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-100' };
    default:
      return { icon: Info, gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-100' };
  }
}

export function ClientNotificationsPage() {
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<{ notifications: Notification[] }>('/api/notifications');
  const { mutate: markRead, loading: markingRead } = useApiMutation();
  const { mutate: markAllRead, loading: markingAll } = useApiMutation();

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(`/api/notifications/${id}/read`, { method: 'PATCH' });
      refetch();
    } catch {
      // Error handled
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead('/api/notifications', { method: 'PATCH' });
      refetch();
    } catch {
      // Error handled
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      handleMarkRead(notif.id);
    }
    if (notif.actionUrl) {
      if (notif.actionUrl.includes('booking')) {
        const bookingId = notif.actionUrl.split('/').pop();
        if (bookingId) {
          navigate('client-booking-detail', { bookingId });
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </span>
            ) : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            {markingAll ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCheck className="mr-2 size-4" />}
            Mark all read
          </Button>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50">
            <BellOff className="size-10 text-emerald-300" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No notifications</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">You&apos;ll see notifications about your bookings here</p>
        </motion.div>
      ) : (
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-2">
            {notifications.map((notif, idx) => {
              const config = getNotifConfig(notif.type);
              return (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                    !notif.isRead
                      ? 'border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white'
                      : 'border-transparent bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-sm`}>
                    <config.icon className="size-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="size-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notif.id);
                      }}
                      disabled={markingRead}
                    >
                      <CheckCheck className="size-4" />
                    </Button>
                  )}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

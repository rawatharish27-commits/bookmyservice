'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

function getNotifIcon(type: string) {
  switch (type) {
    case 'BOOKING':
      return <CalendarCheck className="size-5 text-blue-600" />;
    case 'REVIEW':
      return <Star className="size-5 text-amber-500" />;
    case 'DISPUTE':
      return <AlertTriangle className="size-5 text-orange-600" />;
    case 'MESSAGE':
      return <MessageSquare className="size-5 text-emerald-600" />;
    default:
      return <Info className="size-5 text-gray-500" />;
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
    // Navigate based on actionUrl or type
    if (notif.actionUrl) {
      // Parse actionUrl to determine navigation
      if (notif.actionUrl.includes('booking')) {
        const bookingId = notif.actionUrl.split('/').pop();
        if (bookingId) {
          navigate('client-booking-detail', { bookingId });
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            {markingAll ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCheck className="mr-2 size-4" />}
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center">
          <BellOff className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground">You&apos;ll see notifications about your bookings here</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 ${
                  !notif.isRead ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white'
                }`}
              >
                <div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${
                  !notif.isRead ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  {getNotifIcon(notif.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="size-2 shrink-0 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
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
                    className="shrink-0 text-emerald-600 hover:text-emerald-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                    disabled={markingRead}
                  >
                    <CheckCheck className="size-4" />
                  </Button>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/auth-context';

interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

interface BookingNotification {
  type: string;
  message: string;
  timestamp: string;
}

interface TrackingState {
  isConnected: boolean;
  location: LocationData | null;
  bookingStatus: string | null;
  eta: number | null;
  notifications: BookingNotification[];
  joinBooking: (bookingId: string) => void;
  leaveBooking: (bookingId: string) => void;
  updateLocation: (data: LocationData) => void;
}

export function useTracking(): TrackingState {
  const [isConnected, setIsConnected] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectDelay = 30000; // 30 seconds max

  // Connect to Socket.IO tracking service
  useEffect(() => {
    if (!token) return;

    const socket = io('/?XTransformPort=3003', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: maxReconnectDelay,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server intentionally disconnected, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      reconnectAttemptsRef.current += 1;
      // Exponential backoff is handled by socket.io internally
      // but we log the attempts
      console.warn(`Tracking connection error (attempt ${reconnectAttemptsRef.current}):`, err.message);
    });

    // Listen for location updates from provider
    socket.on('location-update', (data: LocationData) => {
      setLocation(data);
    });

    // Listen for booking status changes
    socket.on('booking-status-update', (data: { status: string; timestamp: string; bookingId: string }) => {
      setBookingStatus(data.status);
      setNotifications((prev) => [
        ...prev.slice(-19), // Keep last 20 notifications
        {
          type: 'status',
          message: `Status updated to ${data.status.replace(/_/g, ' ')}`,
          timestamp: data.timestamp,
        },
      ]);
    });

    // Listen for ETA updates
    socket.on('eta-update', (data: { eta: number; bookingId: string }) => {
      setEta(data.eta);
    });

    // Listen for booking notifications
    socket.on('booking-notification', (data: BookingNotification) => {
      setNotifications((prev) => [
        ...prev.slice(-19),
        data,
      ]);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  const joinBooking = useCallback((bookingId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-booking', { bookingId });
    }
  }, []);

  const leaveBooking = useCallback((bookingId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-booking', { bookingId });
    }
  }, []);

  const updateLocation = useCallback((data: LocationData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update-location', {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    }
  }, []);

  return {
    isConnected,
    location,
    bookingStatus,
    eta,
    notifications,
    joinBooking,
    leaveBooking,
    updateLocation,
  };
}

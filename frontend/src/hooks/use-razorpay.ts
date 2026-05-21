'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiUrl } from '@/lib/api-url';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  bookingId: string;
}

interface PaymentConfig {
  key: string;
  name: string;
}

interface InitiatePaymentParams {
  bookingId: string;
  amount: number;
  currency?: string;
  name: string;
  email: string;
  phone: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Extend Window to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

export function useRazorpay() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const scriptLoadAttempted = useRef(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    if (scriptLoadAttempted.current) return;
    scriptLoadAttempted.current = true;

    // Check if already loaded
    if (window.Razorpay) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      setError('Failed to load Razorpay checkout script. Please check your internet connection.');
      scriptLoadAttempted.current = false;
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove the script on unmount as it may be needed again
    };
  }, []);

  const fetchConfig = useCallback(async (): Promise<PaymentConfig> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(apiUrl('/api/payments/config'), { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch payment config');
    }
    return res.json();
  }, [token]);

  const createOrder = useCallback(async (bookingId: string, amount: number, currency: string): Promise<RazorpayOrder> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(apiUrl('/api/payments/create-order'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookingId, amount, currency }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create order');
    }
    return data;
  }, [token]);

  const verifyPayment = useCallback(async (response: RazorpayResponse, bookingId: string): Promise<void> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(apiUrl('/api/payments/verify'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        bookingId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }
  }, [token]);

  const initiatePayment = useCallback(async (params: InitiatePaymentParams): Promise<boolean> => {
    if (!window.Razorpay) {
      setError('Razorpay checkout is not loaded yet. Please wait or refresh the page.');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Fetch Razorpay config (public key)
      const config = await fetchConfig();

      // Create order on the server
      const order = await createOrder(params.bookingId, params.amount, params.currency || 'INR');

      // Open Razorpay checkout modal
      return new Promise<boolean>((resolve) => {
        const options: RazorpayOptions = {
          key: config.key,
          amount: order.amount,
          currency: order.currency,
          name: 'BookYourService',
          description: `Payment for booking ${params.bookingId}`,
          order_id: order.id,
          handler: async (response: RazorpayResponse) => {
            try {
              await verifyPayment(response, params.bookingId);
              setIsProcessing(false);
              resolve(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Payment verification failed');
              setIsProcessing(false);
              resolve(false);
            }
          },
          prefill: {
            name: params.name,
            email: params.email,
            contact: params.phone,
          },
          theme: {
            color: '#0a1628',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setError('Payment was cancelled');
              resolve(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(message);
      setIsProcessing(false);
      return false;
    }
  }, [fetchConfig, createOrder, verifyPayment]);

  return { initiatePayment, isProcessing, error, isScriptLoaded };
}

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

export function ClientCommissionsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-primary mb-6">My Commissions</h1>
      <div className="bg-white rounded-xl border p-6 text-center">
        <p className="text-muted-foreground">Commission tracking will appear here once you start referring providers and customers.</p>
        <p className="text-sm text-muted-foreground mt-2">Share your referral code to earn commissions on every successful referral!</p>
      </div>
    </div>
  );
}

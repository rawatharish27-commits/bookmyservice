import React from 'react';
import { useApp } from '@/contexts/app-context';

export function VendorPayoutsPage() {
  const { user } = useApp();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-primary mb-6">Payouts</h1>
      <div className="bg-white rounded-xl border p-6 text-center">
        <p className="text-muted-foreground">Your payout history and pending payouts will appear here.</p>
        <p className="text-sm text-muted-foreground mt-2">Complete jobs to receive payouts directly to your bank account.</p>
      </div>
    </div>
  );
}

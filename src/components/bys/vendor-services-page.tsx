'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';

export function VendorServicesPage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1F44]/10 to-[#132D5E]/10">
          <Construction className="size-8 text-[#0A1F44]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Services</h1>
        <p className="max-w-md text-muted-foreground">Manage your service listings.</p>
        <p className="text-sm text-[#0A1F44] font-medium">🚧 This page is under construction</p>
        <Button onClick={() => navigate('home')} variant="outline" className="mt-2 border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5">
          <ArrowLeft className="mr-2 size-4" /> Back to Home
        </Button>
      </motion.div>
    </div>
  );
}

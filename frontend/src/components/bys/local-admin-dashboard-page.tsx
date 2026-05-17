'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Users,
  CalendarCheck,
  IndianRupee,
  ShieldCheck,
  Wrench,
  MessageSquare,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  UserCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocalAreaControl {
  area: string;
  pincode: string;
  activeProviders: number;
  activeBookings: number;
  satisfactionScore: number;
  status: 'Active' | 'Inactive';
}

interface ProviderVerification {
  id: string;
  name: string;
  service: string;
  status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
  submittedAt: string;
  documents: number;
}

interface TechnicianAssignment {
  id: string;
  name: string;
  specialty: string;
  currentJob: string | null;
  status: 'Available' | 'On Job' | 'Break';
  rating: number;
  area: string;
}

interface AreaComplaint {
  id: string;
  client: string;
  provider: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Escalated';
  createdAt: string;
}

interface LocalBookingsAnalytics {
  today: number;
  thisWeek: number;
  thisMonth: number;
  avgValue: number;
  completionRate: number;
  topServices: { name: string; bookings: number }[];
}

interface LocalAdminDashboardData {
  localAreaControl: LocalAreaControl;
  providerVerifications: ProviderVerification[];
  technicianAssignments: TechnicianAssignment[];
  areaComplaints: AreaComplaint[];
  bookingsAnalytics: LocalBookingsAnalytics;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function getMockLocalAdminData(): LocalAdminDashboardData {
  return {
    localAreaControl: {
      area: 'Andheri West',
      pincode: '400053',
      activeProviders: 32,
      activeBookings: 18,
      satisfactionScore: 4.6,
      status: 'Active',
    },
    providerVerifications: [
      { id: 'pv1', name: 'Rajesh Sharma', service: 'AC Repair', status: 'Pending', submittedAt: '1 hour ago', documents: 3 },
      { id: 'pv2', name: 'Priya Patel', service: 'Plumbing', status: 'Under Review', submittedAt: '3 hours ago', documents: 4 },
      { id: 'pv3', name: 'Sunil Verma', service: 'Electrical', status: 'Pending', submittedAt: '5 hours ago', documents: 2 },
      { id: 'pv4', name: 'Kavita Joshi', service: 'Cleaning', status: 'Verified', submittedAt: '1 day ago', documents: 5 },
    ],
    technicianAssignments: [
      { id: 'ta1', name: 'Amit Desai', specialty: 'AC Technician', currentJob: 'AC Gas Refill - Lokhandwala', status: 'On Job', rating: 4.8, area: 'Andheri West' },
      { id: 'ta2', name: 'Nitin Rane', specialty: 'Plumber', currentJob: null, status: 'Available', rating: 4.5, area: 'Andheri West' },
      { id: 'ta3', name: 'Prakash Mali', specialty: 'Electrician', currentJob: 'Switch Board Fix - Versova', status: 'On Job', rating: 4.7, area: 'Andheri West' },
      { id: 'ta4', name: 'Vijay Sawant', specialty: 'Cleaner', currentJob: null, status: 'Break', rating: 4.3, area: 'Andheri West' },
      { id: 'ta5', name: 'Rahul Naik', specialty: 'Painter', currentJob: null, status: 'Available', rating: 4.6, area: 'Andheri West' },
    ],
    areaComplaints: [
      { id: 'LAC-101', client: 'Meera S.', provider: 'Amit D.', issue: 'AC not cooling after service', priority: 'High', status: 'Open', createdAt: '2 hours ago' },
      { id: 'LAC-099', client: 'Rohit K.', provider: 'Prakash M.', issue: 'Incomplete electrical work', priority: 'Medium', status: 'In Progress', createdAt: '5 hours ago' },
      { id: 'LAC-096', client: 'Sonal P.', provider: 'Nitin R.', issue: 'Leakage reappeared after repair', priority: 'High', status: 'Escalated', createdAt: '1 day ago' },
    ],
    bookingsAnalytics: {
      today: 24,
      thisWeek: 156,
      thisMonth: 640,
      avgValue: 1250,
      completionRate: 94.2,
      topServices: [
        { name: 'AC Repair', bookings: 45 },
        { name: 'Plumbing', bookings: 38 },
        { name: 'Electrical', bookings: 29 },
        { name: 'Cleaning', bookings: 24 },
        { name: 'Painting', bookings: 18 },
      ],
    },
  };
}

// ─── Helper Components ────────────────────────────────────────────────────────

function VerificationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    'Pending': { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-400' },
    'Under Review': { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-400' },
    'Verified': { className: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-400' },
    'Rejected': { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-400' },
  };
  const c = config[status] || config['Pending'];
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status}
    </Badge>
  );
}

function TechnicianAvailabilityBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotColor: string }> = {
    'Available': { className: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-400' },
    'On Job': { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-400' },
    'Break': { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-400' },
  };
  const c = config[status] || config['Available'];
  return (
    <Badge variant="outline" className={`${c.className} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {status}
    </Badge>
  );
}

function ComplaintStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    'Open': 'bg-red-50 text-red-700 border-red-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Escalated': 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <Badge variant="outline" className={config[status] || 'bg-gray-100 text-gray-700'}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <Badge variant="outline" className={colors[priority] || 'bg-gray-100 text-gray-800'}>
      {priority}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LocalAdminDashboardPage() {
  const { navigate, goBack } = useApp();
  const { data: apiData, loading } = useApi<LocalAdminDashboardData>('/api/local-admin/dashboard');
  const { mutate } = useApiMutation();
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');

  const data = apiData || getMockLocalAdminData();

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const handleVerifyProvider = async (providerId: string, action: 'verify' | 'reject') => {
    try {
      await mutate(`/api/providers/${providerId}/${action}`, { method: 'POST' });
    } catch {
      // Silently handle for demo
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-3 text-[#2d5a8e] hover:text-[#1e3a5f] hover:bg-sky-50">
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[#0a1628] sm:text-3xl">Local Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage local area, verify providers & monitor bookings</p>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] p-6 sm:p-8"
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-sky-300" />
              <span className="text-sm font-medium text-sky-200">Local Admin</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {data.localAreaControl.area} 👋
            </h2>
            <p className="mt-1 text-sky-100/80">
              {data.localAreaControl.pincode} &middot; {data.localAreaControl.activeProviders} active providers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Star className="size-4 fill-yellow-300 text-yellow-300" />
              <span className="text-sm text-white">{data.localAreaControl.satisfactionScore} satisfaction</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Local Area Control Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="border-l-4 border-l-[#2d5a8e] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Area</p>
                  <p className="mt-1 text-lg font-bold text-[#0a1628]">{data.localAreaControl.area}</p>
                  <p className="text-xs text-muted-foreground">{data.localAreaControl.pincode}</p>
                </div>
                <div className="rounded-lg bg-[#0a1628]/10 p-2.5 text-[#2d5a8e]">
                  <MapPin className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#1e3a5f] transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Providers</p>
                  <p className="mt-1 text-lg font-bold">{data.localAreaControl.activeProviders}</p>
                </div>
                <div className="rounded-lg bg-[#0a1628]/10 p-2.5 text-[#1e3a5f]">
                  <Users className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Bookings</p>
                  <p className="mt-1 text-lg font-bold">{data.localAreaControl.activeBookings}</p>
                </div>
                <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                  <CalendarCheck className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Satisfaction</p>
                  <div className="mt-1 flex items-center gap-1">
                    <p className="text-lg font-bold">{data.localAreaControl.satisfactionScore}</p>
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-100 p-2.5 text-yellow-600">
                  <TrendingUp className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Provider Verification + Technician Assignment */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Provider Verification */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <UserCheck className="size-4 text-sky-300" />
                Provider Verification
                <Badge className="ml-auto bg-sky-500/20 text-sky-200 border-0">
                  {data.providerVerifications.filter((p) => p.status === 'Pending').length} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {data.providerVerifications.map((provider) => (
                    <div key={provider.id} className="rounded-xl bg-[#0a1628]/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-white">
                            <Users className="size-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1628]">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">{provider.service} &middot; {provider.documents} docs</p>
                          </div>
                        </div>
                        <VerificationStatusBadge status={provider.status} />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{provider.submittedAt}</span>
                        {provider.status === 'Pending' || provider.status === 'Under Review' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
                              onClick={() => handleVerifyProvider(provider.id, 'verify')}
                            >
                              <CheckCircle2 className="mr-1 size-3" /> Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleVerifyProvider(provider.id, 'reject')}
                            >
                              <XCircle className="mr-1 size-3" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-[#2d5a8e]">
                            <Eye className="mr-1 size-3" /> View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technician Assignment */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <Wrench className="size-4 text-sky-300" />
                Technician Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {data.technicianAssignments.map((tech) => (
                    <div key={tech.id} className="rounded-xl bg-[#0a1628]/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2d5a8e] to-sky-400 text-white">
                            <Wrench className="size-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1628]">{tech.name}</p>
                            <p className="text-xs text-muted-foreground">{tech.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TechnicianAvailabilityBadge status={tech.status} />
                          <div className="flex items-center gap-0.5">
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{tech.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {tech.currentJob ? `📍 ${tech.currentJob}` : 'No active assignment'}
                        </p>
                        {tech.status === 'Available' && (
                          <Button
                            size="sm"
                            className="h-7 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#0a1628] text-xs"
                          >
                            <ArrowRight className="mr-1 size-3" /> Assign Job
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Area Complaint Monitoring + Local Bookings Analytics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Area Complaint Monitoring */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="size-4 text-sky-300" />
                Area Complaints
                <Badge className="ml-auto bg-red-500/20 text-red-200 border-0">
                  {data.areaComplaints.length} open
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {data.areaComplaints.map((complaint) => (
                    <div key={complaint.id} className="rounded-xl bg-[#0a1628]/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-[#2d5a8e]" />
                          <span className="text-xs font-medium text-muted-foreground">{complaint.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={complaint.priority} />
                          <ComplaintStatusBadge status={complaint.status} />
                        </div>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-[#0a1628]">{complaint.issue}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Client: {complaint.client} &middot; Provider: {complaint.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">{complaint.createdAt}</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="h-7 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#0a1628] text-xs">
                          <Eye className="mr-1 size-3" /> Review
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 rounded-lg border-[#2d5a8e] text-[#1e3a5f] text-xs hover:bg-sky-50">
                          <MessageSquare className="mr-1 size-3" /> Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Local Bookings Analytics */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="size-4 text-sky-300" />
                Bookings Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#0a1628]/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="mt-1 text-xl font-bold text-[#0a1628]">{data.bookingsAnalytics.today}</p>
                </div>
                <div className="rounded-xl bg-[#0a1628]/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="mt-1 text-xl font-bold text-[#0a1628]">{data.bookingsAnalytics.thisWeek}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] p-4 text-center">
                  <p className="text-xs text-sky-300">This Month</p>
                  <p className="mt-1 text-xl font-bold text-white">{data.bookingsAnalytics.thisMonth}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">{data.bookingsAnalytics.completionRate}%</p>
                </div>
              </div>

              {/* Avg Value */}
              <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg. Booking Value</p>
                <p className="mt-1 text-xl font-bold text-yellow-700">₹{data.bookingsAnalytics.avgValue.toLocaleString()}</p>
              </div>

              {/* Top Services */}
              <div className="mt-4">
                <h4 className="mb-3 text-sm font-semibold text-[#0a1628]">Top Services</h4>
                <div className="space-y-2">
                  {data.bookingsAnalytics.topServices.map((svc, i) => {
                    const maxBookings = data.bookingsAnalytics.topServices[0]?.bookings || 1;
                    return (
                      <div key={svc.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#0a1628]">{svc.name}</span>
                          <span className="text-muted-foreground">{svc.bookings} bookings</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#0a1628]/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(svc.bookings / maxBookings) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

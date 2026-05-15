'use client';

import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Briefcase,
  CalendarCheck,
  DollarSign,
  FileWarning,
  Shield,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalProviders: number;
    totalClients: number;
    totalServices: number;
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
    completedBookings: number;
    activeDisputes: number;
    pendingKyc: number;
    pendingServiceApprovals: number;
  };
  recentBookings: {
    id: string;
    bookingNumber: string;
    status: string;
    finalPrice: number;
    createdAt: string;
    client: { id: string; name: string };
    provider: { id: string; name: string };
    service: { id: string; title: string };
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: { name: string };
    createdAt: string;
  }[];
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-orange-100 text-orange-800 border-orange-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function AdminDashboardPage() {
  const { navigate } = useApp();
  const { data, loading } = useApi<DashboardData>('/api/admin/dashboard');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const recentBookings = data?.recentBookings || [];
  const recentUsers = data?.recentUsers || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="mt-1 text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="size-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Providers</p>
                <p className="mt-1 text-2xl font-bold">{stats?.totalProviders || 0}</p>
              </div>
              <Briefcase className="size-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bookings</p>
                <p className="mt-1 text-2xl font-bold">{stats?.totalBookings || 0}</p>
              </div>
              <CalendarCheck className="size-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="mt-1 text-2xl font-bold">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="size-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Disputes</p>
                <p className="mt-1 text-2xl font-bold">{stats?.activeDisputes || 0}</p>
              </div>
              <FileWarning className="size-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-yellow-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Pending Bookings</p>
          <p className="mt-1 text-lg font-bold text-yellow-700">{stats?.pendingBookings || 0}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="mt-1 text-lg font-bold text-green-700">{stats?.completedBookings || 0}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Pending KYC</p>
          <p className="mt-1 text-lg font-bold text-blue-700">{stats?.pendingKyc || 0}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Pending Approvals</p>
          <p className="mt-1 text-lg font-bold text-orange-700">{stats?.pendingServiceApprovals || 0}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('admin-bookings')}>
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {recentBookings.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <ScrollArea className="max-h-80">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.service?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.client?.name} → {b.provider?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <span className="text-sm font-medium">₹{b.finalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('admin-users')}>
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {recentUsers.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No users yet</p>
            ) : (
              <ScrollArea className="max-h-80">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {u.role?.name?.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-wrap gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('admin-users')}>
              <Users className="mr-2 size-4" /> Manage Users
            </Button>
            <Button variant="outline" onClick={() => navigate('admin-services')}>
              <Shield className="mr-2 size-4" /> Pending Approvals
            </Button>
            <Button variant="outline" onClick={() => navigate('admin-disputes')}>
              <FileWarning className="mr-2 size-4" /> Disputes
            </Button>
            <Button variant="outline" onClick={() => navigate('admin-revenue')}>
              <DollarSign className="mr-2 size-4" /> Revenue
            </Button>
            <Button variant="outline" onClick={() => navigate('admin-logs')}>
              <Clock className="mr-2 size-4" /> Activity Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

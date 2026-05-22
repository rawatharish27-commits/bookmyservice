// TODO: Split into sub-components
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
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
  Activity,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wallet,
  CreditCard,
  Banknote,
  RefreshCcw,
  UserPlus,
  UserCheck,
  UserX,
  Star,
  Zap,
  BarChart3,
  Timer,
  Wrench,
  Eye,
  Lock,
  ShieldAlert,
  Download,
  FileText,
  Bell,
  AlertCircle,
  Package,
  Ticket,
  Bug,
  Ban,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalVisitors: number;
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalServices: number;
  activeVisitors: number;
}

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

// ─── Shared data interface for tab props ─────────────────────────────────────

interface TabData {
  totalUsers: number;
  totalProviders: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  activeDisputes: number;
  pendingKyc: number;
  pendingServiceApprovals: number;
  totalTechnicians: number;
  activeVisitors: number;
  platformHealth: number;
  recentBookings: DashboardData['recentBookings'];
  recentUsers: DashboardData['recentUsers'];
  financial: {
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    commissionEarned: number;
    pendingPayouts: number;
    completedPayouts: number;
    walletBalances: number;
    escrowHeld: number;
    refundAmount: number;
    revenueTrend: { date: string; revenue: number }[];
    topCategories: { name: string; revenue: number }[];
    revenueByCity: { city: string; revenue: number }[];
  };
  users: {
    registrationTrend: { date: string; users: number }[];
    newUsersToday: number;
    activeUsers7d: number;
    verifiedProviders: number;
    pendingProviders: number;
    suspendedUsers: number;
    ratingDistribution: { rating: string; count: number }[];
    topRatedProviders: { name: string; rating: number; jobs: number }[];
    cityWiseUsers: { city: string; users: number }[];
  };
  bookings: {
    bookingsToday: number;
    successRate: number;
    avgBookingValue: number;
    emergencyBookings: number;
    cancelledBookings: number;
    avgCompletionTime: string;
    mostBookedCategories: { name: string; bookings: number }[];
    mostBookedServices: { name: string; bookings: number }[];
    peakHours: { hour: string; bookings: number }[];
    bookingTrend: { date: string; bookings: number }[];
  };
  operations: {
    activeDisputes: number;
    unresolvedTickets: number;
    pendingRefunds: number;
    lowStockAlerts: number;
    expiredCoupons: number;
    systemErrorRate: number;
    failedPayments: number;
    securityAlerts: number;
    recentAdminActions: { action: string; user: string; time: string; type: string }[];
  };
  security: {
    failedLogins: number;
    suspiciousActivities: number;
    activeSessions: number;
    adminActionsToday: number;
    dataExportStatus: { name: string; status: string; time: string }[];
  };
  navigate: (page: any) => void;
}

// ─── Chart Configs ────────────────────────────────────────────────────────────

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
};

const userChartConfig: ChartConfig = {
  users: { label: 'New Users', color: 'hsl(var(--chart-2))' },
};

const bookingChartConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: 'hsl(var(--chart-3))' },
};

const peakHoursConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: 'hsl(var(--chart-4))' },
};

const categoryRevenueConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-5))' },
};

const ratingDistConfig: ChartConfig = {
  count: { label: 'Providers', color: 'hsl(var(--chart-2))' },
};

const cityUsersConfig: ChartConfig = {
  users: { label: 'Users', color: 'hsl(var(--chart-1))' },
};

// ─── Helper Components (declared outside render) ─────────────────────────────

function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  borderClass = 'border-l-emerald-500',
  subtitle,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  borderClass?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <Card className={`border-l-4 ${borderClass} transition-shadow hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            {trend && trendValue && (
              <div className="mt-1 flex items-center gap-1">
                {trend === 'up' && <ArrowUpRight className="size-3 text-emerald-600" />}
                {trend === 'down' && <ArrowDownRight className="size-3 text-red-600" />}
                {trend === 'neutral' && <Minus className="size-3 text-yellow-600" />}
                <span
                  className={`text-xs font-medium ${
                    trend === 'up'
                      ? 'text-emerald-600'
                      : trend === 'down'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-lg bg-primary/10 p-2.5 ${iconColor}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-sky-100 text-sky-800 border-sky-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function AdminActionTypeBadge({ type }: { type: string }) {
  const map: Record<string, { color: string; icon: React.ElementType }> = {
    approve: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    resolve: { color: 'bg-blue-100 text-blue-700', icon: Shield },
    suspend: { color: 'bg-red-100 text-red-700', icon: Ban },
    update: { color: 'bg-yellow-100 text-yellow-700', icon: RefreshCcw },
    refund: { color: 'bg-purple-100 text-purple-700', icon: CreditCard },
    create: { color: 'bg-emerald-100 text-emerald-700', icon: FileText },
  };
  const cfg = map[type] || { color: 'bg-gray-100 text-gray-700', icon: Activity };
  return (
    <Badge variant="outline" className={`${cfg.color} gap-1`}>
      <cfg.icon className="size-3" />
      {type}
    </Badge>
  );
}

function HealthScoreGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-emerald-600';
    if (s >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex size-24 items-center justify-center">
        <svg className="size-24 -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            className="text-muted/30"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            className={getColor(score)}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-2xl font-bold ${getColor(score)}`}>{score}</span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">Platform Health</span>
      <Progress value={score} className="h-2 w-full" />
    </div>
  );
}

// ─── Tab Components (declared outside render) ────────────────────────────────

function OverviewTab({ d }: { d: TabData }) {
  return (
    <div className="space-y-6">
      {/* Top Row - Key Metrics (1-6) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <MetricCard title="Total Users" value={d.totalUsers.toLocaleString()} icon={Users} iconColor="text-emerald-600" borderClass="border-l-emerald-500" />
        <MetricCard title="Providers" value={d.totalProviders.toLocaleString()} icon={Briefcase} iconColor="text-blue-600" borderClass="border-l-blue-500" subtitle={`${d.pendingServiceApprovals} pending`} />
        <MetricCard title="Clients" value={d.totalClients.toLocaleString()} icon={UserCheck} iconColor="text-violet-600" borderClass="border-l-violet-500" />
        <MetricCard title="Technicians" value={d.totalTechnicians} icon={Wrench} iconColor="text-orange-600" borderClass="border-l-orange-500" />
        <MetricCard title="Total Bookings" value={d.totalBookings.toLocaleString()} icon={CalendarCheck} iconColor="text-purple-600" borderClass="border-l-purple-500" subtitle={`${d.pendingBookings} pending`} />
        <MetricCard title="Total Revenue" value={`₹${d.totalRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-yellow-600" borderClass="border-l-yellow-500" />
      </div>

      {/* Second Row - Status Metrics (7-12) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard title="Active Now" value={d.activeVisitors} icon={Activity} iconColor="text-green-600" borderClass="border-l-green-500" />
        <MetricCard title="Pending KYC" value={d.pendingKyc} icon={Shield} iconColor="text-yellow-600" borderClass="border-l-yellow-400" />
        <MetricCard title="Pending Approvals" value={d.pendingServiceApprovals} icon={Clock} iconColor="text-blue-600" borderClass="border-l-blue-400" />
        <MetricCard title="Active Disputes" value={d.activeDisputes} icon={FileWarning} iconColor="text-red-600" borderClass="border-l-red-500" />
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Health Score</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{d.platformHealth}/100</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2.5">
                <Activity className="size-5 text-emerald-600" />
              </div>
            </div>
            <Progress value={d.platformHealth} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Server Status</p>
                <p className="mt-1 text-2xl font-bold text-green-600">Online</p>
              </div>
              <div className="rounded-lg bg-green-100 p-2.5">
                <Server className="size-5 text-green-600" />
              </div>
            </div>
            <p className="mt-1 text-xs text-green-600">● API connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-48 w-full">
              <AreaChart data={d.financial.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Booking Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bookingChartConfig} className="h-48 w-full">
              <AreaChart data={d.bookings.bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="bookings" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings + Recent Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => d.navigate('admin-bookings')}>
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {d.recentBookings.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <ScrollArea className="max-h-72">
                {d.recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.service?.title}</p>
                      <p className="text-xs text-muted-foreground">{b.client?.name} → {b.provider?.name}</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => d.navigate('admin-users')}>
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {d.recentUsers.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No users yet</p>
            ) : (
              <ScrollArea className="max-h-72">
                {d.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">{u.role?.name?.toLowerCase()}</Badge>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueTab({ d }: { d: TabData }) {
  const fin = d.financial;
  return (
    <div className="space-y-6">
      {/* Revenue Metrics (13-18) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <MetricCard title="Revenue Today" value={`₹${fin.revenueToday.toLocaleString()}`} icon={DollarSign} iconColor="text-emerald-600" borderClass="border-l-emerald-500" />
        <MetricCard title="Revenue This Week" value={`₹${fin.revenueWeek.toLocaleString()}`} icon={TrendingUp} iconColor="text-blue-600" borderClass="border-l-blue-500" />
        <MetricCard title="Revenue This Month" value={`₹${(fin.revenueMonth / 100000).toFixed(1)}L`} icon={BarChart3} iconColor="text-violet-600" borderClass="border-l-violet-500" />
        <MetricCard title="Commission Earned" value={`₹${fin.commissionEarned.toLocaleString()}`} icon={Banknote} iconColor="text-green-600" borderClass="border-l-green-500" />
        <MetricCard title="Pending Payouts" value={`₹${fin.pendingPayouts.toLocaleString()}`} icon={Clock} iconColor="text-orange-600" borderClass="border-l-orange-500" />
        <MetricCard title="Completed Payouts" value={`₹${(fin.completedPayouts / 100000).toFixed(1)}L`} icon={CheckCircle2} iconColor="text-emerald-600" borderClass="border-l-emerald-400" />
      </div>

      {/* Wallet + Escrow + Refund (19-22) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard title="Total Wallet Balances" value={`₹${fin.walletBalances.toLocaleString()}`} icon={Wallet} iconColor="text-violet-600" borderClass="border-l-violet-400" />
        <MetricCard title="Escrow Held" value={`₹${fin.escrowHeld.toLocaleString()}`} icon={Shield} iconColor="text-yellow-600" borderClass="border-l-yellow-400" />
        <MetricCard title="Refund Amount" value={`₹${fin.refundAmount.toLocaleString()}`} icon={RefreshCcw} iconColor="text-red-600" borderClass="border-l-red-400" />
      </div>

      {/* Charts Row (16, 23) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Growth (7-Day Trend)</CardTitle>
            <CardDescription className="text-xs">Daily revenue across all services</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-56 w-full">
              <AreaChart data={fin.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Revenue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryRevenueConfig} className="h-56 w-full">
              <BarChart data={fin.topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by City (24) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue by City</CardTitle>
        </CardHeader>
        <CardContent>
          {fin.revenueByCity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No city revenue data available</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {fin.revenueByCity.map((c, i) => (
                <div key={c.city} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-muted'}`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.city}</p>
                    <p className="text-xs text-muted-foreground">₹{(c.revenue / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab({ d }: { d: TabData }) {
  const u = d.users;
  return (
    <div className="space-y-6">
      {/* User Metrics (25-31) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard title="New Users Today" value={u.newUsersToday} icon={UserPlus} iconColor="text-emerald-600" borderClass="border-l-emerald-500" />
        <MetricCard title="Active Users (7d)" value={u.activeUsers7d.toLocaleString()} icon={Activity} iconColor="text-blue-600" borderClass="border-l-blue-500" />
        <MetricCard title="Verified Providers" value={u.verifiedProviders} icon={UserCheck} iconColor="text-green-600" borderClass="border-l-green-500" />
        <MetricCard title="Pending Providers" value={u.pendingProviders} icon={Clock} iconColor="text-yellow-600" borderClass="border-l-yellow-500" />
        <MetricCard title="Suspended Users" value={u.suspendedUsers} icon={UserX} iconColor="text-red-600" borderClass="border-l-red-500" />
      </div>

      {/* Charts (25, 31) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">User Registration Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userChartConfig} className="h-56 w-full">
              <BarChart data={u.registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Provider Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ratingDistConfig} className="h-56 w-full">
              <BarChart data={u.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Rated Providers + City Distribution (32, 33) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Rated Providers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {u.topRatedProviders.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No provider data available</p>
            ) : (
              <ScrollArea className="max-h-64">
                {u.topRatedProviders.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 border-b p-3 last:border-0">
                    <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.jobs} jobs completed</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{p.rating}</span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">City-wise User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cityUsersConfig} className="h-56 w-full">
              <BarChart data={u.cityWiseUsers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="city" fontSize={11} tickLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookingsTab({ d }: { d: TabData }) {
  const b = d.bookings;
  return (
    <div className="space-y-6">
      {/* Booking Metrics (34-39) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <MetricCard title="Bookings Today" value={b.bookingsToday} icon={CalendarCheck} iconColor="text-emerald-600" borderClass="border-l-emerald-500" />
        <MetricCard title="Success Rate" value={`${b.successRate}%`} icon={CheckCircle2} iconColor="text-green-600" borderClass="border-l-green-500" />
        <MetricCard title="Avg. Booking Value" value={`₹${b.avgBookingValue.toLocaleString()}`} icon={DollarSign} iconColor="text-blue-600" borderClass="border-l-blue-500" />
        <MetricCard title="Emergency Bookings" value={b.emergencyBookings} icon={Zap} iconColor="text-orange-600" borderClass="border-l-orange-500" />
        <MetricCard title="Cancelled" value={b.cancelledBookings} icon={XCircle} iconColor="text-red-600" borderClass="border-l-red-500" />
        <MetricCard title="Avg. Completion" value={b.avgCompletionTime} icon={Timer} iconColor="text-violet-600" borderClass="border-l-violet-500" />
      </div>

      {/* Charts (42, 43) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Booking Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bookingChartConfig} className="h-56 w-full">
              <AreaChart data={b.bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="bookings" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Peak Booking Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={peakHoursConfig} className="h-56 w-full">
              <BarChart data={b.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Booked Categories + Services (40, 41) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Most Booked Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {b.mostBookedCategories.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No category data available</p>
            ) : (
              <ScrollArea className="max-h-64">
                {b.mostBookedCategories.map((c, i) => {
                  const maxBookings = b.mostBookedCategories[0]?.bookings || 1;
                  return (
                    <div key={i} className="flex items-center gap-3 border-b p-3 last:border-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{c.name}</p>
                          <span className="text-sm font-semibold">{c.bookings}</span>
                        </div>
                        <Progress value={(c.bookings / maxBookings) * 100} className="mt-1.5 h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Most Booked Services</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {b.mostBookedServices.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No service data available</p>
            ) : (
              <ScrollArea className="max-h-64">
                {b.mostBookedServices.map((s, i) => {
                  const maxBookings = b.mostBookedServices[0]?.bookings || 1;
                  return (
                    <div key={i} className="flex items-center gap-3 border-b p-3 last:border-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{s.name}</p>
                          <span className="text-sm font-semibold">{s.bookings}</span>
                        </div>
                        <Progress value={(s.bookings / maxBookings) * 100} className="mt-1.5 h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OperationsTab({ d }: { d: TabData }) {
  const op = d.operations;
  return (
    <div className="space-y-6">
      {/* Alert Metrics (44-51) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard title="Active Disputes" value={op.activeDisputes} icon={FileWarning} iconColor="text-red-600" borderClass="border-l-red-500" />
        <MetricCard title="Unresolved Tickets" value={op.unresolvedTickets} icon={AlertCircle} iconColor="text-orange-600" borderClass="border-l-orange-500" />
        <MetricCard title="Pending Refunds" value={op.pendingRefunds} icon={RefreshCcw} iconColor="text-yellow-600" borderClass="border-l-yellow-500" />
        <MetricCard title="Low Stock Alerts" value={op.lowStockAlerts} icon={Package} iconColor="text-amber-600" borderClass="border-l-amber-500" />
        <MetricCard title="Expired Coupons" value={op.expiredCoupons} icon={Ticket} iconColor="text-gray-600" borderClass="border-l-gray-500" />
        <MetricCard title="System Error Rate" value={`${op.systemErrorRate}%`} icon={Bug} iconColor="text-red-600" borderClass="border-l-red-400" />
        <MetricCard title="Failed Payments" value={op.failedPayments} icon={CreditCard} iconColor="text-red-600" borderClass="border-l-red-600" />
        <MetricCard title="Security Alerts" value={op.securityAlerts} icon={ShieldAlert} iconColor="text-red-700" borderClass="border-l-red-700" />
      </div>

      {/* Admin Actions Log + Quick Actions (52, 53) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Admin Actions</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {op.recentAdminActions.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No admin actions recorded</p>
            ) : (
              <ScrollArea className="max-h-80">
                {op.recentAdminActions.map((a, i) => (
                  <div key={i} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.action}</p>
                      <p className="text-xs text-muted-foreground">{a.user} · {a.time}</p>
                    </div>
                    <AdminActionTypeBadge type={a.type} />
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-2 pt-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-users')}>
              <Shield className="mr-2 size-4 text-yellow-600" /> Approve KYC
              {d.pendingKyc > 0 && <Badge variant="secondary" className="ml-auto">{d.pendingKyc}</Badge>}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-disputes')}>
              <FileWarning className="mr-2 size-4 text-red-600" /> Resolve Dispute
              {d.activeDisputes > 0 && <Badge variant="secondary" className="ml-auto">{d.activeDisputes}</Badge>}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-services')}>
              <CheckCircle2 className="mr-2 size-4 text-blue-600" /> Approve Service
              {d.pendingServiceApprovals > 0 && <Badge variant="secondary" className="ml-auto">{d.pendingServiceApprovals}</Badge>}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-bookings')}>
              <CalendarCheck className="mr-2 size-4 text-purple-600" /> Manage Bookings
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-revenue')}>
              <DollarSign className="mr-2 size-4 text-emerald-600" /> Process Payouts
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-users')}>
              <Users className="mr-2 size-4 text-blue-600" /> Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => d.navigate('admin-logs')}>
              <Clock className="mr-2 size-4 text-gray-600" /> Activity Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SecurityTab({ d }: { d: TabData }) {
  const sec = d.security;
  return (
    <div className="space-y-6">
      {/* Security Metrics (54-58) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard title="Failed Logins Today" value={sec.failedLogins} icon={Lock} iconColor="text-red-600" borderClass="border-l-red-500" />
        <MetricCard title="Suspicious Activities" value={sec.suspiciousActivities} icon={ShieldAlert} iconColor="text-orange-600" borderClass="border-l-orange-500" />
        <MetricCard title="Active Sessions" value={sec.activeSessions.toLocaleString()} icon={Eye} iconColor="text-blue-600" borderClass="border-l-blue-500" />
        <MetricCard title="Admin Actions Today" value={sec.adminActionsToday} icon={FileText} iconColor="text-violet-600" borderClass="border-l-violet-500" />
      </div>

      {/* Security Alerts + Data Export (51, 58) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Security Alerts</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              {sec.suspiciousActivities === 0 ? (
                <div className="flex flex-col items-center gap-2 p-6">
                  <ShieldAlert className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No security alerts</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 border-b p-3">
                  <div className="rounded-full bg-orange-100 p-2"><ShieldAlert className="size-4 text-orange-600" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{sec.suspiciousActivities} suspicious activities detected</p>
                    <p className="text-xs text-muted-foreground">Review recommended</p>
                  </div>
                  <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">Warning</Badge>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Data Export Status</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              {sec.dataExportStatus.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No data exports</p>
              ) : (
                sec.dataExportStatus.map((exp, i) => (
                  <div key={i} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <Download className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{exp.name}</p>
                        <p className="text-xs text-muted-foreground">{exp.time}</p>
                      </div>
                    </div>
                    <StatusBadge status={exp.status} />
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Session Activity + Admin Audit (56, 57) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Session Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Active Sessions</span>
                <span className="text-sm font-bold">{sec.activeSessions.toLocaleString()}</span>
              </div>
              {sec.activeSessions > 0 && (
                <Progress value={Math.min(sec.activeSessions, 100)} className="h-2" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Admin Audit Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Admin Actions Today</span>
                <span className="text-sm font-bold">{sec.adminActionsToday}</span>
              </div>
              {sec.adminActionsToday === 0 && (
                <p className="text-xs text-muted-foreground">No admin actions recorded today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { navigate } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real API data
  const { data: dashboardData, loading: dashboardLoading, refetch: refetchDashboard } = useApi<DashboardData>('/api/admin/dashboard');
  const { data: platformStats, loading: platformLoading } = useApi<PlatformStats>('/api/stats/platform');

  // Tab-specific API data
  const { data: financialData } = useApi<TabData['financial']>('/api/admin/dashboard/financial');
  const { data: usersData } = useApi<TabData['users']>('/api/admin/dashboard/users');
  const { data: bookingsData } = useApi<TabData['bookings']>('/api/admin/dashboard/bookings');
  const { data: operationsData } = useApi<TabData['operations']>('/api/admin/dashboard/operations');
  const { data: securityData } = useApi<TabData['security']>('/api/admin/dashboard/security');

  // Derived stats
  const stats = dashboardData?.stats;
  const totalUsers = stats?.totalUsers || platformStats?.totalUsers || 0;
  const totalProviders = stats?.totalProviders || platformStats?.totalProviders || 0;
  const totalBookings = stats?.totalBookings || platformStats?.totalBookings || 0;
  const totalClients = stats?.totalClients || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingKyc = stats?.pendingKyc || 0;
  const pendingServiceApprovals = stats?.pendingServiceApprovals || 0;
  const activeDisputes = stats?.activeDisputes || 0;
  const pendingBookings = stats?.pendingBookings || 0;

  // Defaults when API data is not available (zero/empty, no mock data)
  const totalTechnicians = 0;
  const platformHealth = 0;

  const defaultEmptyRevenueTrend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ date: d, revenue: 0 }));
  const defaultEmptyUserTrend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ date: d, users: 0 }));
  const defaultEmptyBookingTrend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ date: d, bookings: 0 }));

  const financial: TabData['financial'] = financialData || {
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    commissionEarned: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    walletBalances: 0,
    escrowHeld: 0,
    refundAmount: 0,
    revenueTrend: defaultEmptyRevenueTrend,
    topCategories: [],
    revenueByCity: [],
  };

  const usersTabData: TabData['users'] = usersData || {
    registrationTrend: defaultEmptyUserTrend,
    newUsersToday: 0,
    activeUsers7d: 0,
    verifiedProviders: 0,
    pendingProviders: 0,
    suspendedUsers: 0,
    ratingDistribution: [],
    topRatedProviders: [],
    cityWiseUsers: [],
  };

  const bookingsTabData: TabData['bookings'] = bookingsData || {
    bookingsToday: 0,
    successRate: 0,
    avgBookingValue: 0,
    emergencyBookings: 0,
    cancelledBookings: 0,
    avgCompletionTime: '-',
    mostBookedCategories: [],
    mostBookedServices: [],
    peakHours: [],
    bookingTrend: defaultEmptyBookingTrend,
  };

  const operations: TabData['operations'] = operationsData || {
    activeDisputes: 0,
    unresolvedTickets: 0,
    pendingRefunds: 0,
    lowStockAlerts: 0,
    expiredCoupons: 0,
    systemErrorRate: 0,
    failedPayments: 0,
    securityAlerts: 0,
    recentAdminActions: [],
  };

  const security: TabData['security'] = securityData || {
    failedLogins: 0,
    suspiciousActivities: 0,
    activeSessions: 0,
    adminActionsToday: 0,
    dataExportStatus: [],
  };

  const loading = dashboardLoading || platformLoading;

  const handleRefresh = useCallback(() => {
    refetchDashboard();
    setLastRefresh(new Date());
  }, [refetchDashboard]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  // Assemble tab data
  const tabData: TabData = {
    totalUsers,
    totalProviders,
    totalClients,
    totalBookings,
    totalRevenue,
    pendingBookings,
    completedBookings: stats?.completedBookings || 0,
    activeDisputes,
    pendingKyc,
    pendingServiceApprovals,
    totalTechnicians,
    activeVisitors: platformStats?.activeVisitors || 0,
    platformHealth,
    recentBookings: dashboardData?.recentBookings || [],
    recentUsers: dashboardData?.recentUsers || [],
    financial,
    users: usersTabData,
    bookings: bookingsTabData,
    operations,
    security,
    navigate,
  };

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-6 h-4 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Monitoring Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time platform overview · Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="mr-2 size-4" />
            Refresh
          </Button>
          <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
            <span className="size-1.5 rounded-full bg-green-500" />
            Live
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="w-full min-w-max sm:w-auto">
            <TabsTrigger value="overview" className="gap-1.5">
              <Activity className="size-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1.5">
              <DollarSign className="size-3.5" /> Revenue
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="size-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5">
              <CalendarCheck className="size-3.5" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-1.5">
              <AlertTriangle className="size-3.5" /> Operations
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <ShieldAlert className="size-3.5" /> Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab d={tabData} />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueTab d={tabData} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab d={tabData} />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab d={tabData} />
        </TabsContent>

        <TabsContent value="operations">
          <OperationsTab d={tabData} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab d={tabData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

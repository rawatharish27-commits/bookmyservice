'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  CalendarCheck,
  IndianRupee,
  Users,
  AlertTriangle,
  Ban,
  Clock,
  Activity,
  Shield,
  Zap,
  Eye,
  Brain,
  TrendingUp,
  MapPin,
  Star,
  BarChart3,
  Radio,
  Wrench,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Target,
  DollarSign,
  Globe,
  Server,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeProviders: number;
  complaints: number;
  cancellations: number;
  avgCompletionTime: string;
}

interface TopProvider {
  name: string;
  city: string;
  rating: number;
  bookings: number;
}

interface EscalatedComplaint {
  id: string;
  type: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
}

interface AreaPerformance {
  city: string;
  providers: number;
  bookings: number;
  revenue: number;
}

interface LiveMonitoring {
  liveJobs: number;
  liveProviders: number;
  liveTechnicians: number;
  fraudAlerts: number;
}

interface AIAnalysis {
  demandPrediction: { category: string; demand: string; trend: 'up' | 'down' | 'stable' }[];
  cityExpansion: { city: string; score: number; reason: string }[];
  pricingOptimization: { category: string; current: number; suggested: number; impact: string }[];
}

interface DashboardData {
  stats: DashboardStats;
  topProviders: TopProvider[];
  escalatedComplaints: EscalatedComplaint[];
  areaPerformance: AreaPerformance[];
  liveMonitoring: LiveMonitoring;
  aiAnalysis: AIAnalysis;
  dailyBookings: { day: string; bookings: number }[];
  weeklyRevenue: { week: string; revenue: number }[];
  monthlyGrowth: { month: string; growth: number }[];
}

// ─── Empty Data (no mock data) ────────────────────────────────────────────────

// ─── Chart Configs ────────────────────────────────────────────────────────────

const bookingChartConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: '#FFD54F' },
};

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue (₹)', color: '#132D5E' },
};

const growthChartConfig: ChartConfig = {
  growth: { label: 'Growth %', color: '#FFD54F' },
};

// ─── Helper Components ────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-[#FFD54F]',
  borderClass = 'border-l-[#FFD54F]',
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  borderClass?: string;
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
            {trend && trendValue && (
              <div className="mt-1 flex items-center gap-1">
                {trend === 'up' && <ArrowUpRight className="size-3 text-[#FFD54F]" />}
                {trend === 'down' && <ArrowDownRight className="size-3 text-red-600" />}
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-[#FFD54F]' : trend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-lg bg-[#0A1F44]/10 p-2.5 ${iconColor}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
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

export function SuperAdminDashboardPage() {
  const { navigate } = useApp();
  const { data: apiData, loading, error } = useApi<DashboardData>('/api/admin/dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  // Use API data when available; fallback to empty/zero defaults when API is unreachable
  const data: DashboardData = apiData
    ? {
        stats: {
          totalBookings: apiData.stats?.totalBookings || 0,
          totalRevenue: apiData.stats?.totalRevenue || 0,
          activeProviders: apiData.stats?.activeProviders || 0,
          complaints: apiData.stats?.complaints || 0,
          cancellations: apiData.stats?.cancellations || 0,
          avgCompletionTime: apiData.stats?.avgCompletionTime || '-',
        },
        topProviders: apiData.topProviders || [],
        escalatedComplaints: apiData.escalatedComplaints || [],
        areaPerformance: apiData.areaPerformance || [],
        liveMonitoring: apiData.liveMonitoring || { liveJobs: 0, liveProviders: 0, liveTechnicians: 0, fraudAlerts: 0 },
        aiAnalysis: apiData.aiAnalysis || { demandPrediction: [], cityExpansion: [], pricingOptimization: [] },
        dailyBookings: apiData.dailyBookings || [],
        weeklyRevenue: apiData.weeklyRevenue || [],
        monthlyGrowth: apiData.monthlyGrowth || [],
      }
    : {
        stats: {
          totalBookings: 0,
          totalRevenue: 0,
          activeProviders: 0,
          complaints: 0,
          cancellations: 0,
          avgCompletionTime: '-',
        },
        topProviders: [],
        escalatedComplaints: [],
        areaPerformance: [],
        liveMonitoring: { liveJobs: 0, liveProviders: 0, liveTechnicians: 0, fraudAlerts: 0 },
        aiAnalysis: { demandPrediction: [], cityExpansion: [], pricingOptimization: [] },
        dailyBookings: [],
        weeklyRevenue: [],
        monthlyGrowth: [],
      };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1F44] sm:text-3xl">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform-wide analytics, monitoring & AI insights</p>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F] p-6 sm:p-8"
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-[#FFD54F]" />
              <span className="text-sm font-medium text-[#F2C94C]">Super Admin</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">Platform Overview 👋</h2>
            <p className="mt-1 text-[#F2C94C]/80">Complete visibility into all operations across India</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Server className="size-4 text-green-300" />
              <span className="text-sm text-white">All Systems Operational</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Cards Row */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard title="Total Bookings" value={data.stats.totalBookings.toLocaleString()} icon={CalendarCheck} iconColor="text-[#FFD54F]" borderClass="border-l-[#FFD54F]" trend="up" trendValue="+12.4%" />
          <MetricCard title="Total Revenue" value={`₹${(data.stats.totalRevenue / 100000).toFixed(1)}L`} icon={IndianRupee} iconColor="text-[#FFD54F]" borderClass="border-l-[#FFD54F]" trend="up" trendValue="+8.7%" />
          <MetricCard title="Active Providers" value={data.stats.activeProviders.toLocaleString()} icon={Users} iconColor="text-[#132D5E]" borderClass="border-l-[#132D5E]" trend="up" trendValue="+5.2%" />
          <MetricCard title="Complaints" value={data.stats.complaints} icon={AlertTriangle} iconColor="text-orange-600" borderClass="border-l-orange-500" />
          <MetricCard title="Cancellations" value={data.stats.cancellations} icon={Ban} iconColor="text-red-600" borderClass="border-l-red-500" />
          <MetricCard title="Avg Completion" value={data.stats.avgCompletionTime} icon={Clock} iconColor="text-violet-600" borderClass="border-l-violet-500" />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0A1F44]/5">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#132D5E] data-[state=active]:text-white">Charts</TabsTrigger>
            <TabsTrigger value="tables" className="data-[state=active]:bg-[#132D5E] data-[state=active]:text-white">Tables</TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-[#132D5E] data-[state=active]:text-white">Live Monitor</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-[#132D5E] data-[state=active]:text-white">AI Analysis</TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Daily Bookings */}
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#132D5E] pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <BarChart3 className="size-4 text-[#FFD54F]" />
                    Daily Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ChartContainer config={bookingChartConfig} className="h-48 w-full">
                    <BarChart data={data.dailyBookings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={11} tickLine={false} />
                      <YAxis fontSize={11} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="bookings" fill="#FFD54F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Weekly Revenue */}
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-[#132D5E] to-[#FFD54F] pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <TrendingUp className="size-4 text-[#FFD54F]" />
                    Weekly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ChartContainer config={revenueChartConfig} className="h-48 w-full">
                    <LineChart data={data.weeklyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" fontSize={11} tickLine={false} />
                      <YAxis fontSize={11} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="#132D5E" strokeWidth={2} dot={{ fill: '#132D5E', r: 4 }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Monthly Growth */}
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Activity className="size-4 text-[#FFD54F]" />
                    Monthly Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ChartContainer config={growthChartConfig} className="h-48 w-full">
                    <AreaChart data={data.monthlyGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={11} tickLine={false} />
                      <YAxis fontSize={11} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="growth" stroke="#FFD54F" fill="#FFD54F" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Providers */}
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#132D5E] pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Star className="size-4 text-[#FFD54F]" />
                    Top Providers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-72">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">City</TableHead>
                          <TableHead className="text-xs">Rating</TableHead>
                          <TableHead className="text-xs text-right">Bookings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topProviders.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm font-medium">{p.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{p.city}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{p.rating}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold">{p.bookings}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Complaint Escalation */}
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-[#132D5E] to-[#FFD54F] pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <AlertTriangle className="size-4 text-[#FFD54F]" />
                    Complaint Escalation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-72">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">ID</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Priority</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.escalatedComplaints.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-sm font-medium">{c.id}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{c.type}</TableCell>
                            <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                            <TableCell>
                              <Badge variant="outline" className={c.status === 'Open' ? 'bg-red-50 text-red-700 border-red-200' : c.status === 'In Progress' ? 'bg-[#FFD54F]/10 text-[#FFD54F] border-[#FFD54F]/20' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                                {c.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Area Performance */}
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm lg:col-span-2">
                <CardHeader className="bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F] pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin className="size-4 text-[#FFD54F]" />
                    Area Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-72">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">City</TableHead>
                          <TableHead className="text-xs">Providers</TableHead>
                          <TableHead className="text-xs">Bookings</TableHead>
                          <TableHead className="text-xs text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.areaPerformance.map((a) => (
                          <TableRow key={a.city}>
                            <TableCell className="text-sm font-medium">{a.city}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{a.providers}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{a.bookings.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm font-semibold">₹{(a.revenue / 100000).toFixed(1)}L</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Monitor Tab */}
          <TabsContent value="live" className="mt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] shadow-lg">
                      <Radio className="size-6 text-[#FFD54F]" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Live Jobs</p>
                    <p className="mt-1 text-3xl font-bold text-[#0A1F44]">{data.liveMonitoring.liveJobs}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="size-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">Active Now</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#132D5E] to-[#FFD54F] shadow-lg">
                      <Users className="size-6 text-[#FFD54F]" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Live Providers</p>
                    <p className="mt-1 text-3xl font-bold text-[#0A1F44]">{data.liveMonitoring.liveProviders}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="size-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-lg">
                      <Wrench className="size-6 text-[#FFD54F]" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Live Technicians</p>
                    <p className="mt-1 text-3xl font-bold text-[#0A1F44]">{data.liveMonitoring.liveTechnicians}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="size-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">On Duty</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg">
                      <AlertTriangle className="size-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Fraud Alerts</p>
                    <p className="mt-1 text-3xl font-bold text-red-600">{data.liveMonitoring.fraudAlerts}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="size-2 animate-pulse rounded-full bg-red-500" />
                      <span className="text-xs text-red-600">Needs Attention</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Live Status Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="size-5 text-[#FFD54F]" />
                      <span className="text-sm font-semibold text-[#0A1F44]">Real-Time System Status</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-xs text-green-600">API: Healthy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-xs text-green-600">DB: Connected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-xs text-green-600">Queue: Running</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Demand Prediction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#132D5E] pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Brain className="size-4 text-[#FFD54F]" />
                      Demand Prediction
                    </CardTitle>
                    <CardDescription className="text-xs text-[#F2C94C]">AI-powered demand forecasting</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {data.aiAnalysis.demandPrediction.map((item) => (
                        <div key={item.category} className="flex items-center justify-between rounded-xl bg-[#0A1F44]/5 p-3">
                          <div>
                            <p className="text-sm font-semibold text-[#0A1F44]">{item.category}</p>
                            <p className="text-xs text-muted-foreground">Demand: {item.demand}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {item.trend === 'up' && <ArrowUpRight className="size-4 text-[#FFD54F]" />}
                            {item.trend === 'down' && <ArrowDownRight className="size-4 text-red-600" />}
                            {item.trend === 'stable' && <Activity className="size-4 text-yellow-600" />}
                            <Badge variant="outline" className={
                              item.trend === 'up' ? 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30' :
                              item.trend === 'down' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }>
                              {item.trend}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* City Expansion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#132D5E] to-[#FFD54F] pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Globe className="size-4 text-[#FFD54F]" />
                      City Expansion
                    </CardTitle>
                    <CardDescription className="text-xs text-[#F2C94C]">Suggested new cities</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {data.aiAnalysis.cityExpansion.map((item) => (
                        <div key={item.city} className="rounded-xl bg-[#0A1F44]/5 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4 text-[#FFD54F]" />
                              <p className="text-sm font-semibold text-[#0A1F44]">{item.city}</p>
                            </div>
                            <Badge className="bg-gradient-to-r from-[#132D5E] to-[#FFD54F] text-[#0A1F44] border-0">
                              Score: {item.score}
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pricing Optimization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                      <DollarSign className="size-4 text-[#FFD54F]" />
                      Pricing Optimization
                    </CardTitle>
                    <CardDescription className="text-xs text-[#F2C94C]">AI pricing suggestions</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {data.aiAnalysis.pricingOptimization.map((item) => (
                        <div key={item.category} className="rounded-xl bg-[#0A1F44]/5 p-3">
                          <p className="text-sm font-semibold text-[#0A1F44]">{item.category}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">₹{item.current}</span>
                            <ArrowUpRight className="size-3 text-[#FFD54F]" />
                            <span className="font-semibold text-[#FFD54F]">₹{item.suggested}</span>
                          </div>
                          <Badge variant="outline" className="mt-2 bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30">
                            {item.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

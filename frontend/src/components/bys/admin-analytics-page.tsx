'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  CalendarCheck,
  Users,
  Briefcase,
  Building2,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Tag,
} from 'lucide-react';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface TopCategory {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

interface RecentBooking {
  id: string;
  bookingNumber: string;
  client: { id: string; name: string };
  service: { id: string; title: string };
  status: string;
  finalPrice: number;
  createdAt: string;
}

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalBookings: number;
    activeUsers: number;
    activeProviders: number;
    totalFranchises: number;
    cancellationRate: number;
    revenueGrowth?: number;
    bookingGrowth?: number;
    userGrowth?: number;
    providerGrowth?: number;
    franchiseGrowth?: number;
    cancellationRateChange?: number;
  };
  monthlyRevenue: MonthlyRevenue[];
  topCategories: TopCategory[];
  recentBookings: RecentBooking[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-sky-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString()}`;
}

export function AdminAnalyticsPage() {
  const { data, loading } = useApi<AnalyticsData>('/api/admin/dashboard');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const monthlyRevenue = data?.monthlyRevenue || [];
  const topCategories = data?.topCategories || [];
  const recentBookings = data?.recentBookings || [];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      growth: stats?.revenueGrowth,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-l-emerald-500',
    },
    {
      label: 'Total Bookings',
      value: (stats?.totalBookings || 0).toLocaleString(),
      icon: CalendarCheck,
      growth: stats?.bookingGrowth,
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-600',
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-700',
      borderColor: 'border-l-teal-500',
    },
    {
      label: 'Active Users',
      value: (stats?.activeUsers || 0).toLocaleString(),
      icon: Users,
      growth: stats?.userGrowth,
      color: 'cyan',
      gradient: 'from-cyan-500 to-sky-600',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-l-cyan-500',
    },
    {
      label: 'Active Providers',
      value: (stats?.activeProviders || 0).toLocaleString(),
      icon: Briefcase,
      growth: stats?.providerGrowth,
      color: 'sky',
      gradient: 'from-sky-500 to-blue-500',
      bgLight: 'bg-sky-50',
      textColor: 'text-sky-700',
      borderColor: 'border-l-sky-500',
    },
    {
      label: 'Total Franchises',
      value: (stats?.totalFranchises || 0).toLocaleString(),
      icon: Building2,
      growth: stats?.franchiseGrowth,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-700',
      borderColor: 'border-l-violet-500',
    },
    {
      label: 'Cancellation Rate',
      value: `${(stats?.cancellationRate || 0).toFixed(1)}%`,
      icon: TrendingDown,
      growth: stats?.cancellationRateChange,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-l-rose-500',
      invertGrowth: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Platform-wide analytics and business insights
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          const isPositiveGrowth = card.invertGrowth
            ? (card.growth ?? 0) < 0
            : (card.growth ?? 0) > 0;
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className={`border-l-4 ${card.borderColor} transition-shadow hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {card.label}
                      </p>
                      <p className={`mt-1 text-xl font-bold ${card.textColor}`}>{card.value}</p>
                      {card.growth !== undefined && card.growth !== null && (
                        <div className="mt-1 flex items-center gap-0.5">
                          {isPositiveGrowth ? (
                            <ArrowUpRight className="size-3 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="size-3 text-red-500" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              isPositiveGrowth ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {Math.abs(card.growth).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.bgLight}`}>
                      <Icon className={`size-4 ${card.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Revenue Chart + Top Categories */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 text-emerald-600" />
                  Monthly Revenue
                </CardTitle>
                {monthlyRevenue.length > 0 && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                    Last {monthlyRevenue.length} months
                  </Badge>
                )}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 pt-4">
              {monthlyRevenue.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                  <BarChart3 className="mb-2 size-10 opacity-40" />
                  <p className="text-sm">No revenue data available</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 flex h-52 flex-col justify-between text-right pr-2">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(maxRevenue)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(Math.round(maxRevenue / 2))}
                    </span>
                    <span className="text-xs text-muted-foreground">₹0</span>
                  </div>
                  {/* Chart Area */}
                  <div className="ml-14">
                    {/* Grid lines */}
                    <div className="relative h-52">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="border-b border-dashed border-gray-200" />
                        <div className="border-b border-dashed border-gray-200" />
                        <div className="border-b border-gray-200" />
                      </div>
                      {/* Bars */}
                      <div className="relative flex h-full items-end justify-between gap-1 px-1">
                        {monthlyRevenue.map((month, index) => {
                          const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                          const isHovered = hoveredBar === index;
                          return (
                            <div
                              key={month.month}
                              className="flex flex-1 flex-col items-center justify-end h-full"
                              onMouseEnter={() => setHoveredBar(index)}
                              onMouseLeave={() => setHoveredBar(null)}
                            >
                              {/* Tooltip */}
                              {isHovered && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mb-1 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
                                >
                                  {formatCurrency(month.revenue)}
                                </motion.div>
                              )}
                              {/* Bar */}
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(height, 2)}%` }}
                                transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
                                className={`w-full max-w-10 rounded-t-md transition-all duration-200 ${
                                  isHovered
                                    ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md'
                                    : 'bg-gradient-to-t from-emerald-500 to-teal-500'
                                }`}
                                style={{ minHeight: '2px' }}
                              />
                              {/* Month label */}
                              <span className="mt-2 text-xs text-muted-foreground truncate w-full text-center">
                                {month.month.slice(0, 3)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="size-4 text-teal-600" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {topCategories.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                  <Tag className="mb-2 size-10 opacity-40" />
                  <p className="text-sm">No category data available</p>
                </div>
              ) : (
                <ScrollArea className="max-h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Bookings</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCategories.map((cat, index) => (
                        <TableRow key={cat.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-xs font-bold text-emerald-700">
                                {index + 1}
                              </span>
                              <span className="truncate text-sm font-medium">{cat.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                              {cat.bookings}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(cat.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="size-4 text-emerald-600" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {recentBookings.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                <CalendarCheck className="mb-2 size-10 opacity-40" />
                <p className="text-sm">No recent bookings</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden sm:table-cell">Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="text-sm font-medium">
                          {booking.bookingNumber || `#${booking.id.slice(0, 8)}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.client?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {booking.service?.title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(booking.finalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

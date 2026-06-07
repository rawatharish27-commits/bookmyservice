'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import {
  Users,
  Briefcase,
  Calendar,
  IndianRupee,
  CreditCard,
  Star,
  Menu,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  LayoutDashboard,
  Settings,
  BarChart3,
  FileText,
  BellRing,
  Shield,
  Download,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  SprayCan,
  Snowflake,
  Wrench,
  Sofa,
  CookingPot,
  ChevronRight,
  X,
} from 'lucide-react'
import {
  adminMetrics,
  bookingStatsData,
  bookingsByStatusData,
  recentBookingsAdmin,
  revenueOverviewData,
  topServicesData,
  userGrowthData,
} from '@/lib/dashboard-data'

// ─── Chart Configs ──────────────────────────────────────────────────────────

const bookingChartConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: '#3b82f6' },
  completed: { label: 'Completed', color: '#10b981' },
}

const bookingStatusChartConfig: ChartConfig = {
  Completed: { label: 'Completed', color: '#10b981' },
  Pending: { label: 'Pending', color: '#f59e0b' },
  Confirmed: { label: 'Confirmed', color: '#3b82f6' },
  Cancelled: { label: 'Cancelled', color: '#8b5cf6' },
}

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#3b82f6' },
}

const userGrowthChartConfig: ChartConfig = {
  users: { label: 'Users', color: '#8b5cf6' },
}

// ─── Icon Map ───────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Briefcase,
  Calendar,
  IndianRupee,
  CreditCard,
  Star,
}

const metricColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#FFD54F]/15', text: 'text-[#0A1F44]' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
}

const statusBadgeMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  Completed: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  Confirmed: { variant: 'secondary', className: 'bg-[#FFD54F]/15 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/15' },
  Pending: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' },
  Cancelled: { variant: 'secondary', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
}

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '\u{1F9F9}': SprayCan,
  '\u{2744}\u{FE0F}': Snowflake,
  '\u{1F527}': Wrench,
  '\u{1F6CB}\u{FE0F}': Sofa,
  '\u{1F373}': CookingPot,
}

// ─── Sidebar Navigation ────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
]

const managementNav: NavItem[] = [
  { label: 'Users', icon: Users },
  { label: 'Providers', icon: Briefcase },
  { label: 'Bookings', icon: Calendar },
  { label: 'Services', icon: SprayCan },
  { label: 'Categories', icon: BarChart3 },
  { label: 'Coupons', icon: FileText },
  { label: 'Reviews', icon: Star },
  { label: 'Payments', icon: CreditCard },
  { label: 'Wallet', icon: IndianRupee },
  { label: 'Withdrawals', icon: Download },
]

const systemNav: NavItem[] = [
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Reports', icon: FileText },
  { label: 'Notifications', icon: BellRing },
  { label: 'Settings', icon: Settings },
  { label: 'Roles & Permissions', icon: Shield },
]

// ─── Custom Label for Pie Chart ────────────────────────────────────────────

function renderCustomizedLabel(props: Record<string, unknown>) {
  const { cx, cy, midAngle, outerRadius, percent, name } = props as {
    cx: number; cy: number; midAngle: number; outerRadius: number; percent: number; name: string
  }
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 28
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#64748b"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

// ─── Reusable Tooltip Style ────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
}

// ─── Component ─────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1e293b] text-white transition-transform duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight">BookMyService</span>
          <button
            className="rounded-md p-1 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <Separator className="bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Main */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Main
            </p>
            {mainNav.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${item.active ? 'bg-[#0A1F44] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                `}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Management */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Management
            </p>
            {managementNav.map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* System */}
          <div className="mb-2">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              System
            </p>
            {systemNav.map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="size-2 rounded-full bg-emerald-400" />
            BookMyService v1.0.0
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          {/* Hamburger */}
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>

          {/* Search */}
          <div className="relative hidden sm:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for users, bookings, services..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification Bell */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                5
              </span>
            </button>

            {/* Messages */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Messages">
              <MessageSquare className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#FFD54F]/100 text-[10px] font-bold text-white">
                2
              </span>
            </button>

            <Separator className="mx-1 h-8" orientation="vertical" />

            {/* User Profile */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#0A1F44] text-sm font-semibold text-white">
                A
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-slate-700">Admin User</p>
                <p className="text-[11px] text-slate-400">Super Admin</p>
              </div>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* ── Dashboard Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Dashboard Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, Admin! Here&apos;s what&apos;s happening with your platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="default" className="gap-2">
                <CalendarDays className="size-4" />
                <span className="hidden sm:inline">May 19 &ndash; Jun 19, 2024</span>
                <span className="sm:hidden">Date Range</span>
              </Button>
              <Button variant="default" size="default" className="gap-2 bg-[#0A1F44] hover:bg-[#0A1F44] text-white">
                <Download className="size-4" />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>

          {/* ── Metric Cards ── */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {adminMetrics.map((metric) => {
              const IconComp = iconMap[metric.icon]
              const colors = metricColorMap[metric.color]
              return (
                <Card
                  key={metric.title}
                  className="transition-shadow hover:shadow-md bg-white"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
                        {IconComp && <IconComp className={`size-5 ${colors.text}`} />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-500">
                          {metric.title}
                        </p>
                        <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="size-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="size-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {metric.change}
                      </span>
                      <span className="text-xs text-slate-400">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── Charts Section ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Booking Statistics - Line Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Booking Statistics
                </CardTitle>
                <CardDescription>Daily bookings vs completed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={bookingChartConfig} className="h-[300px] w-full">
                  <LineChart data={bookingStatsData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      domain={[0, 1200]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-slate-600">{value}</span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bookings by Status - Donut Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Bookings by Status
                </CardTitle>
                <CardDescription>Distribution of current booking statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={bookingStatusChartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie
                      data={bookingsByStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={renderCustomizedLabel as unknown as boolean}
                      labelLine={false}
                    >
                      {bookingsByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    {/* Center label */}
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-2xl font-bold">
                      8,632
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-xs">
                      Total
                    </text>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Recent Bookings ── */}
          <Card className="mb-6 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Recent Bookings
                  </CardTitle>
                  <CardDescription>Latest booking activity on the platform</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-[#0A1F44]">
                  View All
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-y border-slate-100">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date &amp; Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookingsAdmin.map((booking) => {
                      const badgeStyle = statusBadgeMap[booking.status] || statusBadgeMap.Pending
                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                                <Calendar className="size-4 text-slate-500" />
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {booking.service}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="text-sm text-slate-700">{booking.date}</p>
                            <p className="text-xs text-slate-400">{booking.time}</p>
                          </td>
                          <td className="px-6 py-3">
                            <Badge
                              variant={badgeStyle.variant}
                              className={badgeStyle.className}
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm font-semibold text-slate-700">
                              {booking.amount}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ── Bottom Section (3 columns) ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue Overview - Bar Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Revenue Overview
                </CardTitle>
                <CardDescription>Revenue trend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                  <BarChart data={revenueOverviewData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `\u20B9${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                       
                      formatter={(value: any) => [`\u20B9${Number(value).toLocaleString()}`, 'Revenue']}
                      contentStyle={tooltipStyle}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Services Table */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Top Services
                </CardTitle>
                <CardDescription>Best performing services by revenue</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-y border-slate-100">
                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Service
                        </th>
                        <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Revenue
                        </th>
                        <th className="hidden px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">
                          Bkgs
                        </th>
                        <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topServicesData.map((service) => {
                        const ServiceIcon = serviceIconMap[service.icon] || SprayCan
                        return (
                          <tr
                            key={service.rank}
                            className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                          >
                            <td className="px-4 py-2.5">
                              <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                {service.rank}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <ServiceIcon className="size-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">
                                  {service.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-semibold text-slate-700">
                              {service.revenue}
                            </td>
                            <td className="hidden px-4 py-2.5 text-right text-sm text-slate-500 sm:table-cell">
                              {service.bookings}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                                <TrendingUp className="size-3" />
                                {service.growth}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* User Growth - Area Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                  User Growth
                </CardTitle>
                <CardDescription>Platform user growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={userGrowthChartConfig} className="h-[280px] w-full">
                  <AreaChart data={userGrowthData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                      domain={[8000, 13000]}
                    />
                    <Tooltip
                       
                      formatter={(value: any) => [Number(value).toLocaleString(), 'Users']}
                      contentStyle={tooltipStyle}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#userGradient)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: '#8b5cf6' }}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

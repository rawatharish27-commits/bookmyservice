'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  IndianRupee,
  MapPin,
  Bell,
  ChevronRight,
  Settings,
  Users,
  Star,
  Wallet,
  Briefcase,
  MoreVertical,
  Plus,
  Gift,
  Headphones,
  LogOut,
  ChevronDown,
  Menu,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  X,
  LayoutDashboard,
  CreditCard,
  CalendarClock,
  UserCheck,
  BadgeCheck,
} from 'lucide-react'
import {
  providerMetrics,
  earningsOverviewData,
  providerRecentBookings,
  todaySchedule,
  providerServices,
  customerReviews,
  earningsSummary,
} from '@/lib/dashboard-data'

// ─── Chart Config ────────────────────────────────────────────────────────────

const earningsChartConfig: ChartConfig = {
  earnings: { label: 'Earnings', color: '#3b82f6' },
}

// ─── Icon Map ────────────────────────────────────────────────────────────────

const metricIconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  Calendar: { icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-600' },
  CheckCircle: { icon: CheckCircle, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  Clock: { icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600' },
  XCircle: { icon: XCircle, bg: 'bg-purple-100', text: 'text-purple-600' },
  IndianRupee: { icon: IndianRupee, bg: 'bg-blue-100', text: 'text-blue-600' },
}

// ─── Sidebar Navigation Items ───────────────────────────────────────────────

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: string
}

const sidebarNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Bookings', icon: Calendar, badge: '8' },
  { label: 'My Services', icon: Briefcase },
  { label: 'Earnings', icon: IndianRupee },
  { label: 'Schedule', icon: CalendarClock },
  { label: 'Profile', icon: UserCheck },
  { label: 'Reviews', icon: Star },
  { label: 'Wallet', icon: Wallet },
  { label: 'Payouts', icon: CreditCard },
  { label: 'Notifications', icon: Bell, badge: '3' },
  { label: 'Settings', icon: Settings },
  { label: 'Support', icon: Headphones },
]

// ─── Status Badge Styles ─────────────────────────────────────────────────────

const statusBadgeMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  Completed: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  Upcoming: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' },
  Cancelled: { variant: 'secondary', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
  Active: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
}

// ─── Schedule Color Map ──────────────────────────────────────────────────────

const scheduleColorMap: Record<string, string> = {
  upcoming: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
}

// ─── Service Icon Map ────────────────────────────────────────────────────────

const serviceIconMap: Record<string, string> = {
  'Air Conditioner': '❄️',
  'Water Tank Cleaning': '🧹',
  'Plumber': '🔧',
  'Electrician': '⚡',
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProviderDashboard() {
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

      {/* ── Left Sidebar (Dark Navy) ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1e293b] text-white transition-transform duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* User Profile Section */}
        <div className="px-6 py-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border-2 border-blue-500">
              <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">AK</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate">Arvind Kumar</span>
                <BadgeCheck className="size-4 text-blue-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-400">Service Provider</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-medium">Online</span>
              </div>
            </div>
            <button
              className="rounded-md p-1 text-slate-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="px-3 py-4">
            <div className="space-y-1">
              {sidebarNav.map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    ${item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`size-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-700 px-4 py-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Provider ID:</span>
              <span className="text-[11px] font-medium text-slate-300">#BMS12345</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Joined on:</span>
              <span className="text-[11px] font-medium text-slate-300">15 Mar 2023</span>
            </div>
          </div>
          <button className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut className="size-4" />
            <span>Logout</span>
          </button>
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

          {/* Location */}
          <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            <MapPin className="size-3.5 text-blue-600" />
            Delhi, India
          </button>

          {/* Go Offline Button */}
          <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hidden sm:flex gap-1.5">
            <span className="size-2 rounded-full bg-red-500" />
            Go Offline
          </Button>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification Bell */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <Separator className="mx-1 h-8" orientation="vertical" />

            {/* Profile Section */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
              <Avatar className="size-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">CC</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700">Cool Care Services</p>
                <p className="text-[11px] text-blue-600">View Profile</p>
              </div>
              <ChevronDown className="size-3.5 text-slate-400 hidden md:block" />
            </button>
          </div>
        </header>

        {/* ── Dashboard Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, Arvind! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s what&apos;s happening with your business today.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="size-4 text-slate-400" />
              <span>19 May 2024 - 26 May 2024</span>
            </div>
          </div>

          {/* ── 5 Metric Cards ── */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {providerMetrics.map((metric) => {
              const config = metricIconMap[metric.icon]
              if (!config) return null
              const IconComp = config.icon
              return (
                <Card
                  key={metric.title}
                  className="transition-shadow hover:shadow-md bg-white"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                        <IconComp className={`size-5 ${config.text}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-500">
                          {metric.title}
                        </p>
                        <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {metric.trend === 'up' && metric.change ? (
                        <TrendingUp className="size-3 text-emerald-500" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="size-3 text-red-500" />
                      ) : null}
                      {metric.change && (
                        <span
                          className={`text-xs font-semibold ${
                            metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-400'
                          }`}
                        >
                          {metric.change}
                        </span>
                      )}
                      {metric.change && (
                        <span className="text-xs text-slate-400">vs last period</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── 3-Column Main Content Grid ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* LEFT - Earnings Overview */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Earnings Overview
                  </CardTitle>
                  <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    Last 7 Days
                    <ChevronDown className="size-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={earningsChartConfig} className="h-[200px] w-full aspect-auto">
                  <LineChart data={earningsOverviewData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ChartContainer>

                {/* Bottom Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
                    <p className="text-[11px] font-medium text-emerald-600">Total Earnings</p>
                    <p className="text-base font-bold text-emerald-700">₹18,750</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 px-3 py-2.5">
                    <p className="text-[11px] font-medium text-amber-600">Pending Payout</p>
                    <p className="text-base font-bold text-amber-700">₹2,350</p>
                  </div>
                </div>

                <Button variant="outline" className="mt-4 w-full bg-white border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium gap-1.5">
                  View Earnings
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>

            {/* MIDDLE - Recent Bookings */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Recent Bookings
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-blue-600 text-xs">
                    View All
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <div className="max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
                  {providerRecentBookings.map((booking, index) => {
                    const badgeStyle = statusBadgeMap[booking.status] || statusBadgeMap.Upcoming
                    const emoji = serviceIconMap[booking.service] || '🔧'
                    return (
                      <div key={booking.id}>
                        <div className="flex items-center gap-3 py-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                            {emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{booking.service}</p>
                            <p className="text-xs text-slate-400">{booking.date}, {booking.time}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-semibold text-slate-700 hidden sm:block">{booking.amount}</span>
                            <Badge
                              variant={badgeStyle.variant}
                              className={badgeStyle.className}
                            >
                              {booking.status}
                            </Badge>
                            <ChevronRight className="size-4 text-slate-400" />
                          </div>
                        </div>
                        {index < providerRecentBookings.length - 1 && (
                          <Separator className="bg-slate-100" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* RIGHT - Today's Schedule (Timeline) */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Today&apos;s Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  {todaySchedule.map((item, index) => {
                    const dotColor = scheduleColorMap[item.status] || '#8b5cf6'
                    const isLast = index === todaySchedule.length - 1
                    return (
                      <div key={item.time} className="flex gap-4">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div
                            className="size-3 rounded-full shrink-0 mt-1.5 ring-4 ring-white"
                            style={{ backgroundColor: dotColor }}
                          />
                          {!isLast && (
                            <div className="w-px flex-1 bg-slate-200" />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                          <p className="text-xs font-semibold text-slate-500">{item.time}</p>
                          <p className="text-sm font-medium text-slate-900 mt-0.5">{item.service}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="size-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{item.location}</span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 h-5 ${
                                item.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : item.status === 'upcoming'
                                    ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5">
                  Manage Schedule
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── Bottom 3-Column Section ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* LEFT - My Services */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    My Services
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                {providerServices.map((service, index) => {
                  const emoji = serviceIconMap[service.name] || '🔧'
                  return (
                    <div key={service.name}>
                      <div className="flex items-center gap-3 py-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{service.name}</p>
                          <p className="text-xs text-slate-400">Starting from {service.price}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px]"
                        >
                          {service.status}
                        </Badge>
                        <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="More options">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                      {index < providerServices.length - 1 && (
                        <Separator className="bg-slate-100" />
                      )}
                    </div>
                  )
                })}
                <Button variant="outline" className="mt-4 w-full bg-white border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-700 font-medium gap-1.5">
                  <Plus className="size-4" />
                  Add New Service
                </Button>
              </CardContent>
            </Card>

            {/* MIDDLE - Customer Reviews */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Rating Summary */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{customerReviews.average}</p>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-4 ${
                            star <= Math.floor(customerReviews.average)
                              ? 'fill-amber-400 text-amber-400'
                              : star <= customerReviews.average
                                ? 'fill-amber-400/50 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{customerReviews.total} reviews</p>
                  </div>

                  {/* Distribution Bars */}
                  <div className="flex-1 space-y-1.5">
                    {customerReviews.distribution.map((item) => {
                      const maxCount = customerReviews.distribution[0].count
                      const percentage = (item.count / maxCount) * 100
                      return (
                        <div key={item.stars} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-4 text-right">{item.stars}</span>
                          <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-7 text-right">{item.count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator className="bg-slate-100 mb-4" />

                {/* Recent Review */}
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px] font-bold">RS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{customerReviews.recent.name}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{customerReviews.recent.time}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-3 ${
                          star <= customerReviews.recent.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &ldquo;{customerReviews.recent.text}&rdquo;
                  </p>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <span className="size-2 rounded-full bg-blue-600" />
                  <span className="size-2 rounded-full bg-slate-300" />
                  <span className="size-2 rounded-full bg-slate-300" />
                </div>
              </CardContent>
            </Card>

            {/* RIGHT - Earnings Summary */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Balance */}
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Wallet className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-100">Wallet Balance</p>
                      <p className="text-2xl font-bold">{earningsSummary.walletBalance}</p>
                    </div>
                  </div>
                </div>

                {/* Pending + Total Payouts */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[11px] font-medium text-amber-600">Pending Payout</p>
                    <p className="text-lg font-bold text-amber-700">{earningsSummary.pendingPayout}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-slate-500">Total Payouts</p>
                    <p className="text-lg font-bold text-slate-700">{earningsSummary.totalPayouts}</p>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5">
                  <Wallet className="size-4" />
                  Withdraw Earnings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── Footer Section ── */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Refer & Earn */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-500 text-white border-0 overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5 relative">
                <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/5" />
                <div className="absolute -right-2 bottom-0 size-16 rounded-full bg-white/10" />
                <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Gift className="size-6 text-white" />
                </div>
                <div className="relative flex-1 min-w-0">
                  <h3 className="text-sm font-bold">Refer & Earn More</h3>
                  <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                    Refer other service providers and earn up to ₹1000 for each successful referral.
                  </p>
                  <Button className="mt-2.5 bg-white text-purple-600 hover:bg-purple-50 font-semibold h-8 text-xs px-3">
                    Refer Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="bg-white border border-slate-200 overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Headphones className="size-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">Need Help?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Our support team is here to help you.
                  </p>
                  <Button variant="link" className="mt-1 h-auto p-0 text-blue-600 hover:text-blue-700 font-semibold text-xs gap-1">
                    Contact Support
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

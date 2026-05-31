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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  MapPin,
  ChevronRight,
  Search,
  Bell,
  User,
  Tag,
  Shield,
  Users,
  Heart,
  Star,
  Settings,
  LogOut,
  HelpCircle,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Zap,
  Gift,
  Copy,
} from 'lucide-react'
import {
  clientMetrics,
  upcomingBooking,
  clientRecentBookings,
  clientQuickActions,
  walletTransactions,
  activeAMC,
  clientOffers,
} from '@/lib/dashboard-data'

// ─── Icon Map ───────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Tag,
  Shield,
  Users,
}

const quickActionColorMap: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', border: 'border-cyan-100' },
  pink: { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
}

const metricColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  orange: { bg: 'bg-amber-100', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
}

const statusBadgeMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  Completed: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  Confirmed: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' },
  Pending: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' },
  Upcoming: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' },
  Cancelled: { variant: 'secondary', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
  Active: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
}

// ─── Sidebar Navigation Items ──────────────────────────────────────────────

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: string
}

const sidebarNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'My Bookings', icon: Calendar },
  { label: 'My Wallet', icon: Wallet },
  { label: 'My AMC', icon: Shield },
  { label: 'Coupons', icon: Tag },
  { label: 'My Favorites', icon: Heart },
  { label: 'Reviews', icon: Star },
  { label: 'Refer & Earn', icon: Users },
  { label: 'Notifications', icon: Bell, badge: '3' },
  { label: 'Support', icon: HelpCircle },
  { label: 'Settings', icon: Settings },
  { label: 'Logout', icon: LogOut },
]

// ─── Component ─────────────────────────────────────────────────────────────

export function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar (White) ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + Location */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <Zap className="size-4" />
            </div>
            <span className="text-lg font-bold text-slate-900">MyService</span>
          </div>
          <button className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-50">
            <MapPin className="size-3" />
            Delhi
          </button>
          <button
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
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
                      ? 'bg-blue-50 text-blue-700'
                      : item.label === 'Logout'
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`size-4 ${item.active ? 'text-blue-600' : ''}`} />
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
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar size="default">
              <AvatarFallback className="bg-blue-600 text-white text-xs">RK</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Rahul Kumar</p>
              <p className="text-[11px] text-slate-400">View Profile</p>
            </div>
            <ChevronRight className="size-4 text-slate-400" />
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

          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-white">
              <Zap className="size-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-900">MyService</span>
          </div>

          {/* Location Selector (desktop) */}
          <button className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            <MapPin className="size-3.5 text-blue-600" />
            Delhi
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative flex w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="h-9 w-full rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <Button className="h-9 rounded-l-none rounded-r-lg bg-blue-600 text-white px-4 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification Bell */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <Separator className="mx-1 h-8" orientation="vertical" />

            {/* User Profile */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
              <Avatar size="default">
                <AvatarFallback className="bg-blue-600 text-white text-xs">RK</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-slate-700">Rahul Kumar</p>
                <p className="text-[11px] text-slate-400">View Profile</p>
              </div>
              <ChevronRight className="size-4 text-slate-400 hidden md:block" />
            </button>
          </div>
        </header>

        {/* ── Dashboard Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Hey Rahul! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back! Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          {/* ── 5 Metric Cards ── */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {clientMetrics.map((metric) => {
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
                        <span className="text-xs text-slate-400">vs last month</span>
                      )}
                      {'link' in metric && metric.link && (
                        <button className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700">
                          {metric.link}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── Upcoming Booking + Recent Bookings Row ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Upcoming Booking Card */}
            <Card className="bg-white lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Upcoming Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Zap className="size-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900">{upcomingBooking.service}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                        {upcomingBooking.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span>{upcomingBooking.date} &bull; {upcomingBooking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-slate-400" />
                        <span className="truncate">{upcomingBooking.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-slate-400" />
                        <span>{upcomingBooking.provider}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-lg font-bold text-slate-900">{upcomingBooking.amount}</span>
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 gap-1">
                    View Details
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="bg-white lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Recent Bookings
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                    View All
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                {clientRecentBookings.map((booking, index) => {
                  const badgeStyle = statusBadgeMap[booking.status] || statusBadgeMap.Pending
                  return (
                    <div key={booking.id}>
                      <div className="flex items-center gap-3 py-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Calendar className="size-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{booking.service}</p>
                          <p className="text-xs text-slate-400">{booking.date} &bull; {booking.time}</p>
                        </div>
                        <Badge
                          variant={badgeStyle.variant}
                          className={badgeStyle.className}
                        >
                          {booking.status}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-700 hidden sm:block">{booking.amount}</span>
                        <ChevronRight className="size-4 text-slate-400 shrink-0" />
                      </div>
                      {index < clientRecentBookings.length - 1 && (
                        <Separator className="bg-slate-100" />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* ── Quick Actions ── */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {clientQuickActions.map((action) => {
                const IconComp = iconMap[action.icon]
                const colors = quickActionColorMap[action.color] || quickActionColorMap.blue
                return (
                  <Card
                    key={action.label}
                    className={`cursor-pointer transition-all hover:shadow-md border ${colors.border} bg-white`}
                  >
                    <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
                      <div className={`flex size-12 items-center justify-center rounded-xl ${colors.bg}`}>
                        {IconComp && <IconComp className={`size-6 ${colors.icon}`} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* ── Wallet + AMC Row ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Wallet Overview */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Wallet Overview
                  </CardTitle>
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 gap-1">
                    <Plus className="size-3.5" />
                    Add Money
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                  <p className="text-xs font-medium text-blue-100">Current Balance</p>
                  <p className="text-2xl font-bold">₹1,250</p>
                </div>
                <div className="space-y-0">
                  {walletTransactions.map((txn, index) => (
                    <div key={txn.id}>
                      <div className="flex items-center gap-3 py-2.5">
                        <div className={`flex size-8 items-center justify-center rounded-lg ${
                          txn.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {txn.type === 'credit' ? (
                            <TrendingUp className="size-4 text-emerald-600" />
                          ) : (
                            <TrendingDown className="size-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{txn.description}</p>
                          <p className="text-[11px] text-slate-400">{txn.date}</p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {txn.amount}
                        </span>
                      </div>
                      {index < walletTransactions.length - 1 && (
                        <Separator className="bg-slate-100" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                    View All
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active AMC */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Active AMC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-50">
                    <Shield className="size-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{activeAMC.name}</h3>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        {activeAMC.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Plan valid till: {activeAMC.validTill}</p>
                  </div>
                </div>

                {/* Progress Bar for Visits */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600">Total Visits</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeAMC.visitsUsed} / {activeAMC.visitsTotal} Used
                    </p>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${(activeAMC.visitsUsed / activeAMC.visitsTotal) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                  <Calendar className="size-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Next Visit</p>
                    <p className="text-sm font-medium text-slate-900">{activeAMC.nextVisit}</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-1 border-slate-200 text-slate-700 hover:bg-slate-50">
                  View AMC Details
                  <ChevronRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── Exclusive Offers + Refer & Earn ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Exclusive Offers */}
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Exclusive Offers</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {clientOffers.map((offer) => (
                  <div
                    key={offer.code}
                    className={`relative overflow-hidden rounded-xl p-5 text-white ${
                      offer.color === 'purple'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-500'
                        : 'bg-gradient-to-br from-orange-500 to-amber-500'
                    }`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10" />
                    <div className="absolute -right-2 bottom-0 size-16 rounded-full bg-white/5" />

                    <div className="relative">
                      <p className="text-lg font-bold">{offer.title}</p>
                      <p className="text-sm text-white/80 mt-0.5">{offer.subtitle}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-md bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                          <Tag className="size-3.5" />
                          <span className="text-xs font-semibold tracking-wider">{offer.code}</span>
                        </div>
                        <button className="rounded-md p-1.5 hover:bg-white/20 transition-colors" aria-label="Copy code">
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refer & Earn Banner */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0 overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center relative">
                {/* Decorative circles */}
                <div className="absolute -left-8 -top-8 size-32 rounded-full bg-white/5" />
                <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Gift className="size-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Refer & Earn</h3>
                  <p className="mt-2 text-sm text-blue-100">
                    Invite your friends and earn up to ₹500
                  </p>
                  <Button className="mt-4 w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                    Refer Now
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

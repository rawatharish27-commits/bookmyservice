'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Shield, User, Wrench, ChevronDown, X, Menu, Globe, Lock, Home as HomeIcon,
  LayoutDashboard, Settings, BarChart3, Briefcase, Calendar, Smartphone,
  Megaphone, Scale, MessageSquare, Cpu, AlertTriangle, ShoppingCart, MapPin,
  Star, Phone, Mail, ArrowRight, CheckCircle, Clock, Users, Zap, Award, Headphones,
  Activity, Eye, TrendingUp, CalendarDays, CalendarRange, Timer, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Service Data ─────────────────────────────────────────────────────────────
const services = [
  { name: 'Air Conditioner', icon: '❄️', price: '₹149', slug: 'air-conditioner' },
  { name: 'Refrigerator', icon: '🧊', price: '₹199', slug: 'refrigerator' },
  { name: 'Washing Machine', icon: '🫧', price: '₹149', slug: 'washing-machine' },
  { name: 'Kitchen Appliances', icon: '🍳', price: '₹99', slug: 'kitchen-appliances' },
  { name: 'TV Repair', icon: '📺', price: '₹199', slug: 'tv-repair' },
  { name: 'Water Purifier', icon: '💧', price: '₹149', slug: 'water-purifier' },
  { name: 'Geyser', icon: '🔥', price: '₹149', slug: 'geyser' },
  { name: 'Plumber', icon: '🔧', price: '₹199', slug: 'plumber' },
  { name: 'Electrician', icon: '⚡', price: '₹199', slug: 'electrician' },
  { name: 'Water Tank Cleaning', icon: '🚿', price: '₹299', slug: 'water-tank-cleaning' },
  { name: 'Movers and Packers', icon: '📦', price: '₹499', slug: 'movers-and-packers' },
]

const features = [
  { icon: Shield, title: 'Verified Professionals', desc: 'All service providers are background-verified and certified' },
  { icon: Zap, title: 'Quick Response', desc: 'Get matched with professionals within 30 minutes' },
  { icon: Award, title: 'Quality Guarantee', desc: '100% satisfaction guarantee or your money back' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer support for all your needs' },
]

const howItWorks = [
  { step: '1', title: 'Choose Service', desc: 'Browse our 11 verified home services' },
  { step: '2', title: 'Book Appointment', desc: 'Pick a convenient time slot' },
  { step: '3', title: 'Get It Done', desc: 'Verified professional arrives at your door' },
]

const testimonials = [
  { name: 'Rajesh K.', role: 'Homeowner', text: 'Excellent AC repair service! The technician was professional and fixed the issue in no time.', rating: 5 },
  { name: 'Priya S.', role: 'Working Professional', text: 'Booked a plumber through BookMyService and was impressed by the quick response and quality work.', rating: 5 },
  { name: 'Amit M.', role: 'Business Owner', text: 'Reliable and affordable. Have been using their services for 6 months now. Highly recommend!', rating: 4 },
]

// ─── Live IST Clock Hook ──────────────────────────────────────────────────────
function useISTClock() {
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Convert to IST string
  const istTime = time.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const istDate = time.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return { istTime, istDate }
}

// ─── Visitor Stats Hook ───────────────────────────────────────────────────────
interface VisitorStats {
  activeVisitors: number
  dailyVisitors: number
  weeklyVisitors: number
  monthlyVisitors: number
  yearlyVisitors: number
  totalVisitors: number
}

function useVisitorStats() {
  const [stats, setStats] = useState<VisitorStats>({
    activeVisitors: 0,
    dailyVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0,
    yearlyVisitors: 0,
    totalVisitors: 0,
  })
  const [loading, setLoading] = useState(true)
  const sessionIdRef = useRef<string>('')
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  // Generate or retrieve session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('bms_visitor_sid')
      if (!sid) {
        sid = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('bms_visitor_sid', sid)
      }
      sessionIdRef.current = sid
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats/platform')
      if (res.ok) {
        const data = await res.json()
        setStats({
          activeVisitors: data.activeVisitors || 0,
          dailyVisitors: data.dailyVisitors || 0,
          weeklyVisitors: data.weeklyVisitors || 0,
          monthlyVisitors: data.monthlyVisitors || 0,
          yearlyVisitors: data.yearlyVisitors || 0,
          totalVisitors: data.totalVisitors || 0,
        })
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!sessionIdRef.current) return
    try {
      await fetch('/api/stats/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          page: window.location.pathname,
          referrer: document.referrer || undefined,
        }),
      })
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    // Initial heartbeat + fetch
    sendHeartbeat()
    fetchStats()

    // Heartbeat every 60 seconds
    heartbeatRef.current = setInterval(() => {
      sendHeartbeat()
    }, 60000)

    // Refresh stats every 10 seconds for real-time feel
    const statsInterval = setInterval(fetchStats, 10000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      clearInterval(statsInterval)
    }
  }, [sendHeartbeat, fetchStats])

  return { stats, loading }
}

// ─── Animated Number Component ────────────────────────────────────────────────
function AnimatedNumber({ value, loading }: { value: number; loading: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    if (loading) return
    const start = prevValue.current
    const end = value
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = end
      }
    }

    requestAnimationFrame(animate)
  }, [value, loading])

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1">
        <RefreshCw className="size-4 animate-spin text-[#FFCE32]" />
      </span>
    )
  }

  return <span>{displayValue.toLocaleString('en-IN')}</span>
}

// ─── Live Pulse Dot ───────────────────────────────────────────────────────────
function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex size-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
      </span>
      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { istTime, istDate } = useISTClock()
  const { stats, loading } = useVisitorStats()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D63FF] to-[#FFCE32] flex items-center justify-center text-white font-bold text-sm shadow-lg">B</div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">BookMyService</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Home', 'Services', 'How It Works', 'About', 'Contact'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    const sectionId = item.toLowerCase().replace(/\s/g, '-')
                    setActiveSection(sectionId)
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-[#1D63FF] transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button className="text-sm font-medium text-slate-600 hover:text-[#1D63FF] px-4 py-2 transition-colors">
                Login
              </button>
              <button className="text-sm font-semibold text-white bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] hover:from-[#0B3D91] hover:to-[#1D63FF] px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
                Book Now
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-2">
              {['Home', 'Services', 'How It Works', 'About', 'Contact'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    document.getElementById(item.toLowerCase().replace(/\s/g, '-'))?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1D63FF] hover:bg-slate-50 rounded-lg"
                >
                  {item}
                </button>
              ))}
              <div className="pt-2 flex gap-2">
                <button className="flex-1 text-sm font-medium text-slate-600 px-4 py-2.5 border border-slate-200 rounded-xl">Login</button>
                <button className="flex-1 text-sm font-semibold text-white bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] px-4 py-2.5 rounded-xl">Book Now</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Live Clock & Visitor Stats Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0B3D91] via-[#1D63FF] to-[#0B3D91] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Live Clock */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <Timer className="size-4 text-[#FFCE32]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-slate-300">{istDate}</span>
                  <span className="text-sm font-bold tracking-wider font-mono">{istTime}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-300 font-medium">IST</span>
            </div>

            {/* Visitor Stats */}
            <div className="flex items-center gap-2 sm:gap-4">
              <LivePulse />
              <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5" title="Currently Active">
                  <Activity className="size-3.5 text-emerald-400" />
                  <span className="text-slate-300">Active:</span>
                  <span className="font-bold text-white"><AnimatedNumber value={stats.activeVisitors} loading={loading} /></span>
                </div>
                <div className="flex items-center gap-1.5" title="Today's Visitors">
                  <Eye className="size-3.5 text-[#FFCE32]" />
                  <span className="text-slate-300">Today:</span>
                  <span className="font-bold text-white"><AnimatedNumber value={stats.dailyVisitors} loading={loading} /></span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5" title="This Week">
                  <CalendarDays className="size-3.5 text-sky-300" />
                  <span className="text-slate-300">Week:</span>
                  <span className="font-bold text-white"><AnimatedNumber value={stats.weeklyVisitors} loading={loading} /></span>
                </div>
                <div className="hidden md:flex items-center gap-1.5" title="This Month">
                  <CalendarRange className="size-3.5 text-violet-300" />
                  <span className="text-slate-300">Month:</span>
                  <span className="font-bold text-white"><AnimatedNumber value={stats.monthlyVisitors} loading={loading} /></span>
                </div>
                <div className="hidden lg:flex items-center gap-1.5" title="This Year">
                  <TrendingUp className="size-3.5 text-rose-300" />
                  <span className="text-slate-300">Year:</span>
                  <span className="font-bold text-white"><AnimatedNumber value={stats.yearlyVisitors} loading={loading} /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section id="home" className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D91] via-[#1D63FF] to-[#3B82F6]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,206,50,0.15),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(255,184,0,0.2),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FFCE32] text-xs font-medium mb-6">
              <Zap className="size-3.5" /> Trusted by 10,000+ customers across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Expert Home Services,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCE32] to-[#FFB800]">Booked in Minutes</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
              From AC repair to plumbing, get verified professionals at your doorstep. Starting from just ₹99 with our satisfaction guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFCE32] to-[#FFB800] text-[#0B3D91] font-bold text-base hover:from-[#FFCE32] hover:to-[#FFB800] transition-all shadow-xl shadow-[#FFCE32]/25 hover:shadow-[#FFCE32]/40">
                Book a Service <ArrowRight className="size-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all">
                <Phone className="size-5" /> Call Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Visitor Stats Cards (Mobile-Visible Details) ─────────────────── */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { icon: Activity, label: 'Active Now', value: stats.activeVisitors, color: 'emerald', bgGradient: 'from-emerald-50 to-emerald-100/50', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
              { icon: Eye, label: 'Today', value: stats.dailyVisitors, color: 'amber', bgGradient: 'from-amber-50 to-amber-100/50', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
              { icon: CalendarDays, label: 'This Week', value: stats.weeklyVisitors, color: 'sky', bgGradient: 'from-sky-50 to-sky-100/50', iconColor: 'text-sky-600', valueColor: 'text-sky-700' },
              { icon: CalendarRange, label: 'This Month', value: stats.monthlyVisitors, color: 'violet', bgGradient: 'from-violet-50 to-violet-100/50', iconColor: 'text-violet-600', valueColor: 'text-violet-700' },
              { icon: TrendingUp, label: 'This Year', value: stats.yearlyVisitors, color: 'rose', bgGradient: 'from-rose-50 to-rose-100/50', iconColor: 'text-rose-600', valueColor: 'text-rose-700' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  'relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 sm:p-5 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300',
                  stat.bgGradient
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn('size-4', stat.iconColor)} />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className={cn('text-2xl sm:text-3xl font-extrabold', stat.valueColor)}>
                  <AnimatedNumber value={stat.value} loading={loading} />
                </div>
                {stat.label === 'Active Now' && !loading && (
                  <span className="absolute top-3 right-3 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            📊 Visitor stats update automatically every 10 seconds • Data refreshes in real-time
          </p>
        </div>
      </section>

      {/* ─── Services Section ─────────────────────────────────────────────── */}
      <section id="services" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D63FF]/5 text-[#1D63FF] text-xs font-semibold mb-4">OUR SERVICES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              11 Verified Home Services
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Professional home services at affordable prices. All our service providers are background-verified and certified.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service) => (
              <button
                key={service.slug}
                className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 hover:border-[#FFCE32]/30 hover:shadow-xl hover:shadow-[#FFCE32]/5 transition-all duration-300 text-left card-hover-lift"
              >
                <div className="text-3xl mb-3">{service.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 group-hover:text-[#1D63FF] transition-colors">{service.name}</h3>
                <p className="text-xs sm:text-sm text-amber-600 font-semibold">Starting {service.price}</p>
                <ArrowRight className="absolute top-5 right-5 size-4 text-slate-300 group-hover:text-[#FFCE32] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D63FF]/5 text-[#1D63FF] text-xs font-semibold mb-4">WHY CHOOSE US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              The BookMyService Difference
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl bg-white border border-slate-100 hover:border-[#FFCE32]/20 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-[#1D63FF]/10 to-amber-50 mb-4">
                  <feature.icon className="size-7 text-[#1D63FF]" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D63FF]/5 text-[#1D63FF] text-xs font-semibold mb-4">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Book in 3 Simple Steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, idx) => (
              <div key={item.step} className="text-center relative">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-[#1D63FF] to-[#0B3D91] text-white font-bold text-2xl mb-5 shadow-lg shadow-[#1D63FF]/20">
                  {item.step}
                </div>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[#1D63FF] to-[#FFCE32]/30" />
                )}
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D63FF]/5 text-[#1D63FF] text-xs font-semibold mb-4">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('size-4', i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-[#1D63FF] to-[#0B3D91] flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Section ────────────────────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D63FF]/5 text-[#1D63FF] text-xs font-semibold mb-4">ABOUT US</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
                India&apos;s Trusted Hyperlocal Service Marketplace
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                BookMyService connects you with verified, skilled professionals for all your home service needs. From appliance repair to home maintenance, we ensure quality service at transparent prices.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '10K+', label: 'Happy Customers' },
                  { value: '500+', label: 'Service Providers' },
                  { value: '11', label: 'Service Categories' },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4 rounded-xl bg-slate-50">
                    <p className="text-2xl font-extrabold text-[#1D63FF]">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1D63FF] via-[#0B3D91] to-[#FFCE32] p-8 flex items-center justify-center">
                <div className="text-center text-white space-y-6">
                  <div className="text-7xl">🏠</div>
                  <h3 className="text-2xl font-bold">Your Home, Our Priority</h3>
                  <p className="text-[#FFCE32] text-sm max-w-xs mx-auto">
                    Professional services delivered to your doorstep with care and precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#0B3D91] via-[#1D63FF] to-[#3B82F6] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,206,50,0.1),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to Book Your Service?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers. Get expert home services starting from just ₹99.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFCE32] to-[#FFB800] text-[#0B3D91] font-bold text-lg hover:from-[#FFCE32] hover:to-[#FFB800] transition-all shadow-xl shadow-[#FFCE32]/25">
              Book Now <ArrowRight className="size-5" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all">
              <Phone className="size-5" /> Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* ─── Contact Section ─────────────────────────────────────────────── */}
      <section id="contact" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D63FF]/5 text-[#1D63FF] text-xs font-semibold mb-4">CONTACT US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Get in Touch
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Phone, title: 'Call Us', detail: '+91 1800-XXX-XXXX', sub: 'Mon-Sat, 9AM-9PM' },
              { icon: Mail, title: 'Email Us', detail: 'support@bookmyservice.in', sub: 'We reply within 2 hours' },
              { icon: MessageSquare, title: 'Live Chat', detail: 'Chat with us', sub: 'Available 24/7' },
            ].map(item => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FFCE32]/20 hover:shadow-md transition-all">
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-[#1D63FF]/10 to-amber-50 mb-4">
                  <item.icon className="size-6 text-[#1D63FF]" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-[#1D63FF] font-semibold">{item.detail}</p>
                <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0B3D91] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFCE32] to-[#FFB800] flex items-center justify-center text-[#0B3D91] font-bold text-sm">B</div>
                <span className="font-bold text-lg">BookMyService</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                India&apos;s trusted hyperlocal service marketplace for professional home services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Services</h4>
              <ul className="space-y-2">
                {services.slice(0, 6).map(s => (
                  <li key={s.slug}><span className="text-sm text-slate-400 hover:text-[#FFCE32] transition-colors cursor-pointer">{s.name}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Press'].map(item => (
                  <li key={item}><span className="text-sm text-slate-400 hover:text-[#FFCE32] transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cancellation Policy'].map(item => (
                  <li key={item}><span className="text-sm text-slate-400 hover:text-[#FFCE32] transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} BookMyService. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">Made with ❤️ in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  MoreVertical,
  Users,
  Building2,
  TrendingUp,
  Clock,
  Package,
  Wrench,
  Sparkles,
  Droplets,
  Layers,
} from 'lucide-react'

type VendorStatus = 'Active' | 'Pending' | 'Suspended'
type VendorCategory = 'Water Tank Cleaning' | 'Air Conditioner' | 'Plumber' | 'Electrician' | 'Kitchen Appliances' | 'Geyser'

interface Vendor {
  id: number
  name: string
  category: VendorCategory
  city: string
  rating: number
  totalServices: number
  compliance: number
  status: VendorStatus
  onboardingProgress: number
  phone: string
  email: string
  joinDate: string
  revenue: string
}

const vendors: Vendor[] = [
  { id: 1, name: 'SparkClean Solutions', category: 'Water Tank Cleaning', city: 'Bengaluru', rating: 4.8, totalServices: 1245, compliance: 95, status: 'Active', onboardingProgress: 100, phone: '+91 98765 11111', email: 'info@sparkclean.in', joinDate: 'Jan 2023', revenue: '₹18,45,000' },
  { id: 2, name: 'CoolAir Technologies', category: 'Air Conditioner', city: 'Mumbai', rating: 4.6, totalServices: 876, compliance: 88, status: 'Active', onboardingProgress: 100, phone: '+91 98765 22222', email: 'support@coolair.in', joinDate: 'Mar 2023', revenue: '₹14,32,000' },
  { id: 3, name: 'PipeFix India', category: 'Plumber', city: 'Pune', rating: 4.5, totalServices: 654, compliance: 92, status: 'Active', onboardingProgress: 100, phone: '+91 98765 33333', email: 'contact@pipefix.in', joinDate: 'Feb 2023', revenue: '₹9,87,000' },
  { id: 4, name: 'PowerFix Electric', category: 'Electrician', city: 'Delhi', rating: 4.9, totalServices: 987, compliance: 97, status: 'Active', onboardingProgress: 100, phone: '+91 98765 44444', email: 'hello@powerfix.in', joinDate: 'Apr 2023', revenue: '₹16,54,000' },
  { id: 5, name: 'ProKitchen Services', category: 'Kitchen Appliances', city: 'Hyderabad', rating: 4.3, totalServices: 432, compliance: 78, status: 'Pending', onboardingProgress: 65, phone: '+91 98765 55555', email: 'info@prokitchen.in', joinDate: 'Dec 2024', revenue: '₹6,45,000' },
  { id: 6, name: 'HeatMaster Geyser', category: 'Geyser', city: 'Chennai', rating: 4.7, totalServices: 567, compliance: 90, status: 'Active', onboardingProgress: 100, phone: '+91 98765 66666', email: 'service@heatmaster.in', joinDate: 'May 2023', revenue: '₹8,76,000' },
  { id: 7, name: 'AquaFlow Plumbing', category: 'Plumber', city: 'Kolkata', rating: 3.8, totalServices: 234, compliance: 62, status: 'Suspended', onboardingProgress: 100, phone: '+91 98765 77777', email: 'info@aquaflow.in', joinDate: 'Jul 2023', revenue: '₹3,21,000' },
  { id: 8, name: 'FreshAir Systems', category: 'Air Conditioner', city: 'Jaipur', rating: 4.4, totalServices: 345, compliance: 82, status: 'Pending', onboardingProgress: 40, phone: '+91 98765 88888', email: 'hello@freshair.in', joinDate: 'Jan 2025', revenue: '₹2,34,000' },
]

const categoryColors: Record<VendorCategory, string> = {
  'Water Tank Cleaning': 'bg-[#1D63FF]/10 text-[#0B3D91]',
  'Air Conditioner': 'bg-cyan-100 text-cyan-700',
  'Plumber': 'bg-indigo-100 text-indigo-700',
  'Electrician': 'bg-yellow-100 text-yellow-700',
  'Kitchen Appliances': 'bg-amber-100 text-amber-700',
  'Geyser': 'bg-orange-100 text-orange-700',
}

const categoryIcons: Record<VendorCategory, React.ReactNode> = {
  'Water Tank Cleaning': <Droplets className="size-4" />,
  'Air Conditioner': <Wind className="size-4" />,
  'Plumber': <Wrench className="size-4" />,
  'Electrician': <Zap className="size-4" />,
  'Kitchen Appliances': <Package className="size-4" />,
  'Geyser': <Sparkles className="size-4" />,
}

const summaryStats = [
  { label: 'Total Vendors', value: '48', icon: Building2, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  { label: 'Active Vendors', value: '38', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Pending Review', value: '7', icon: Clock, color: 'bg-amber-100 text-amber-600' },
  { label: 'Suspended', value: '3', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
]

export function VendorManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all')

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage vendor partnerships and compliance</p>
          </div>
          <Button size="sm" className="gap-1 rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91] text-white">
            <Plus className="size-4" /> Add Vendor
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search vendors, cities..."
              className="pl-9 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as VendorCategory | 'all')}
          >
            <option value="all">All Categories</option>
            <option value="Water Tank Cleaning">Water Tank Cleaning</option>
            <option value="Air Conditioner">Air Conditioner</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Kitchen Appliances">Kitchen Appliances</option>
            <option value="Geyser">Geyser</option>
          </select>
          <select
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VendorStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Vendor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="bg-white rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${categoryColors[vendor.category]}`}>
                      {categoryIcons[vendor.category]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{vendor.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={`text-[10px] ${categoryColors[vendor.category]}`}>
                          {vendor.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{vendor.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                      vendor.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}
                  >
                    {vendor.status === 'Active' && <CheckCircle2 className="size-3 mr-1" />}
                    {vendor.status === 'Pending' && <Clock className="size-3 mr-1" />}
                    {vendor.status === 'Suspended' && <XCircle className="size-3 mr-1" />}
                    {vendor.status}
                  </Badge>
                </div>

                <Separator className="bg-slate-100 mb-3" />

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="size-3 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-slate-900">{vendor.rating}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Rating</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">{vendor.totalServices.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Services</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">{vendor.revenue.replace('₹', '')}</p>
                    <p className="text-[10px] text-slate-400">Revenue</p>
                  </div>
                </div>

                {/* Compliance */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Shield className="size-3 text-slate-400" />
                      <span className="text-xs text-slate-600">Compliance</span>
                    </div>
                    <span className={`text-xs font-medium ${vendor.compliance >= 85 ? 'text-emerald-600' : vendor.compliance >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {vendor.compliance}%
                    </span>
                  </div>
                  <Progress value={vendor.compliance} className="h-1.5" />
                </div>

                {/* Onboarding Progress (if not 100%) */}
                {vendor.onboardingProgress < 100 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Onboarding</span>
                      <span className="text-xs font-medium text-[#1D63FF]">{vendor.onboardingProgress}%</span>
                    </div>
                    <Progress value={vendor.onboardingProgress} className="h-1.5" />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">Joined {vendor.joinDate}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Phone className="size-3.5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Mail className="size-3.5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="size-3.5 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function Wind({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}

function Zap({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

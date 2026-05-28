'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  Star,
  Users,
  CalendarCheck,
  MoreVertical,
  TrendingUp,
  UserCircle,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react'

const branches = [
  {
    id: 1, name: 'Koramangala Branch', city: 'Bengaluru', state: 'Karnataka',
    manager: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@bms.com',
    status: 'Active' as const, revenue: '₹8,45,000', bookings: 856, rating: 4.8,
    providers: 34, since: 'Jan 2022',
  },
  {
    id: 2, name: 'Hinjewadi Branch', city: 'Pune', state: 'Maharashtra',
    manager: 'Priya Sharma', phone: '+91 98765 43211', email: 'priya@bms.com',
    status: 'Active' as const, revenue: '₹7,32,000', bookings: 723, rating: 4.7,
    providers: 28, since: 'Mar 2022',
  },
  {
    id: 3, name: 'Andheri West Branch', city: 'Mumbai', state: 'Maharashtra',
    manager: 'Amit Patel', phone: '+91 98765 43212', email: 'amit@bms.com',
    status: 'Active' as const, revenue: '₹6,98,000', bookings: 689, rating: 4.5,
    providers: 31, since: 'Feb 2022',
  },
  {
    id: 4, name: 'Salt Lake Branch', city: 'Kolkata', state: 'West Bengal',
    manager: 'Sneha Das', phone: '+91 98765 43213', email: 'sneha@bms.com',
    status: 'Inactive' as const, revenue: '₹5,67,000', bookings: 534, rating: 4.6,
    providers: 22, since: 'Jun 2022',
  },
  {
    id: 5, name: 'T. Nagar Branch', city: 'Chennai', state: 'Tamil Nadu',
    manager: 'Karthik Raja', phone: '+91 98765 43214', email: 'karthik@bms.com',
    status: 'Active' as const, revenue: '₹5,21,000', bookings: 498, rating: 4.4,
    providers: 19, since: 'Aug 2022',
  },
  {
    id: 6, name: 'Jubilee Hills Branch', city: 'Hyderabad', state: 'Telangana',
    manager: 'Lakshmi Reddy', phone: '+91 98765 43215', email: 'lakshmi@bms.com',
    status: 'Active' as const, revenue: '₹4,89,000', bookings: 467, rating: 4.5,
    providers: 21, since: 'Oct 2022',
  },
]

const performanceMetrics = [
  { label: 'Total Branches', value: '12', active: 10, inactive: 2 },
  { label: 'Combined Revenue', value: '₹48,75,000', change: '+22%' },
  { label: 'Total Providers', value: '285', change: '+15%' },
  { label: 'Avg Bookings/Branch', value: '628', change: '+8%' },
]

export function FranchiseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredBranches = branches.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && b.status === 'Active') ||
      (statusFilter === 'inactive' && b.status === 'Inactive')
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Franchise Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and monitor all franchise branches</p>
          </div>
          <Button size="sm" className="gap-1 rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91]">
            <Plus className="size-4" /> Add Branch
          </Button>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric) => (
            <Card key={metric.label} className="bg-white rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{metric.value}</p>
                {metric.active !== undefined ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-emerald-600">{metric.active} active</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-red-500">{metric.inactive} inactive</span>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="size-3" />{metric.change}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search branches, cities, managers..."
              className="pl-9 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-xl ${statusFilter === 'all' ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-xl gap-1 ${statusFilter === 'active' ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              <CheckCircle2 className="size-3" /> Active
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-xl gap-1 ${statusFilter === 'inactive' ? 'bg-[#1D63FF] hover:bg-[#0B3D91]' : ''}`}
              onClick={() => setStatusFilter('inactive')}
            >
              <XCircle className="size-3" /> Inactive
            </Button>
          </div>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="bg-white rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#1D63FF]/10">
                      <Building2 className="size-5 text-[#1D63FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{branch.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{branch.city}, {branch.state}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      branch.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {branch.status}
                  </Badge>
                </div>

                <Separator className="bg-slate-100 mb-3" />

                {/* Manager Info */}
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="size-4 text-slate-400" />
                  <span className="text-xs text-slate-600">{branch.manager}</span>
                  <span className="text-slate-300">|</span>
                  <Phone className="size-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{branch.phone}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <IndianRupee className="size-3 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-900">{branch.revenue.replace('₹', '')}</p>
                    <p className="text-[10px] text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <CalendarCheck className="size-3 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-900">{branch.bookings}</p>
                    <p className="text-[10px] text-slate-400">Bookings</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <Star className="size-3 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-900">{branch.rating}</p>
                    <p className="text-[10px] text-slate-400">Rating</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50">
                    <Users className="size-3 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-900">{branch.providers}</p>
                    <p className="text-[10px] text-slate-400">Providers</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">Since {branch.since}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    View Details <MoreVertical className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Branch Form Section */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-[#1D63FF]" />
              <CardTitle className="text-sm font-semibold text-slate-900">Add New Branch</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Branch Name</label>
                <Input placeholder="e.g., Indiranagar Branch" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">City</label>
                <Input placeholder="e.g., Bengaluru" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">State</label>
                <Input placeholder="e.g., Karnataka" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Manager Name</label>
                <Input placeholder="e.g., Rahul Verma" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Phone</label>
                <Input placeholder="+91 98765 43210" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Email</label>
                <Input placeholder="manager@bms.com" className="rounded-xl" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button size="sm" className="rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91]">Create Branch</Button>
              <Button variant="outline" size="sm" className="rounded-xl">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

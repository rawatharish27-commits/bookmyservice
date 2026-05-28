'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Phone,
  Video,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Clock,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  PhoneCall,
  VideoIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  MessageSquare,
  X,
} from 'lucide-react'

interface CallRecord {
  id: number
  name: string
  initials: string
  avatarColor: string
  type: 'video' | 'audio'
  direction: 'outgoing' | 'incoming'
  status: 'completed' | 'missed' | 'cancelled'
  duration: string
  date: string
  time: string
  serviceName?: string
  bookingId?: string
}

const callHistory: CallRecord[] = [
  {
    id: 1,
    name: 'Amit Sharma',
    initials: 'AS',
    avatarColor: 'bg-[#1D63FF]',
    type: 'video',
    direction: 'outgoing',
    status: 'completed',
    duration: '12:34',
    date: '4 Mar 2025',
    time: '10:00 AM',
    serviceName: 'Air Conditioner',
    bookingId: 'BK-2024-1847',
  },
  {
    id: 2,
    name: 'Priya Patel',
    initials: 'PP',
    avatarColor: 'bg-emerald-600',
    type: 'audio',
    direction: 'incoming',
    status: 'completed',
    duration: '5:12',
    date: '4 Mar 2025',
    time: '8:30 AM',
    serviceName: 'Water Tank Cleaning',
    bookingId: 'BK-2024-1832',
  },
  {
    id: 3,
    name: 'Rajesh Kumar',
    initials: 'RK',
    avatarColor: 'bg-amber-600',
    type: 'audio',
    direction: 'incoming',
    status: 'missed',
    duration: '—',
    date: '3 Mar 2025',
    time: '3:45 PM',
    serviceName: 'Plumber',
    bookingId: 'BK-2024-1801',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    initials: 'SR',
    avatarColor: 'bg-rose-600',
    type: 'video',
    direction: 'outgoing',
    status: 'completed',
    duration: '25:08',
    date: '3 Mar 2025',
    time: '11:00 AM',
    serviceName: 'Kitchen Appliances',
    bookingId: 'BK-2024-1795',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    initials: 'VS',
    avatarColor: 'bg-teal-600',
    type: 'audio',
    direction: 'outgoing',
    status: 'cancelled',
    duration: '—',
    date: '2 Mar 2025',
    time: '5:30 PM',
    serviceName: 'Geyser',
    bookingId: 'BK-2024-1756',
  },
  {
    id: 6,
    name: 'Mohammed Farooq',
    initials: 'MF',
    avatarColor: 'bg-cyan-600',
    type: 'video',
    direction: 'incoming',
    status: 'completed',
    duration: '8:45',
    date: '2 Mar 2025',
    time: '2:15 PM',
    serviceName: 'Washing Machine Repair',
    bookingId: 'BK-2024-1689',
  },
  {
    id: 7,
    name: 'Kavita Iyer',
    initials: 'KI',
    avatarColor: 'bg-indigo-600',
    type: 'audio',
    direction: 'incoming',
    status: 'missed',
    duration: '—',
    date: '1 Mar 2025',
    time: '9:00 AM',
    serviceName: 'Electrician',
    bookingId: 'BK-2024-1712',
  },
  {
    id: 8,
    name: 'Deepa Nair',
    initials: 'DN',
    avatarColor: 'bg-pink-600',
    type: 'video',
    direction: 'outgoing',
    status: 'completed',
    duration: '15:22',
    date: '28 Feb 2025',
    time: '4:00 PM',
    serviceName: 'Water Purifier',
    bookingId: 'BK-2024-1645',
  },
  {
    id: 9,
    name: 'Arjun Desai',
    initials: 'AD',
    avatarColor: 'bg-orange-600',
    type: 'audio',
    direction: 'outgoing',
    status: 'completed',
    duration: '3:56',
    date: '27 Feb 2025',
    time: '1:30 PM',
    serviceName: 'TV Repair',
    bookingId: 'BK-2024-1623',
  },
  {
    id: 10,
    name: 'Meera Joshi',
    initials: 'MJ',
    avatarColor: 'bg-violet-600',
    type: 'video',
    direction: 'incoming',
    status: 'cancelled',
    duration: '—',
    date: '26 Feb 2025',
    time: '6:00 PM',
    serviceName: 'Water Tank Cleaning',
    bookingId: 'BK-2024-1598',
  },
]

const statusConfig = {
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: Phone, iconColor: 'text-emerald-500', label: 'Completed' },
  missed: { color: 'bg-red-100 text-red-700', icon: PhoneMissed, iconColor: 'text-red-500', label: 'Missed' },
  cancelled: { color: 'bg-slate-100 text-slate-600', icon: PhoneOff, iconColor: 'text-slate-400', label: 'Cancelled' },
}

export function CallHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredCalls = callHistory.filter((call) => {
    const matchesSearch =
      call.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (call.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (call.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    if (activeFilter === 'video') return matchesSearch && call.type === 'video'
    if (activeFilter === 'audio') return matchesSearch && call.type === 'audio'
    if (activeFilter === 'missed') return matchesSearch && call.status === 'missed'
    return matchesSearch
  })

  const totalCalls = callHistory.length
  const videoCalls = callHistory.filter((c) => c.type === 'video').length
  const audioCalls = callHistory.filter((c) => c.type === 'audio').length
  const missedCalls = callHistory.filter((c) => c.status === 'missed').length
  const totalDuration = callHistory
    .filter((c) => c.status === 'completed')
    .reduce((sum, c) => {
      const parts = c.duration.split(':')
      return sum + parseInt(parts[0]) * 60 + parseInt(parts[1])
    }, 0)
  const totalHours = Math.floor(totalDuration / 60)
  const totalMins = totalDuration % 60

  // Group calls by date
  const groupedCalls: Record<string, CallRecord[]> = {}
  filteredCalls.forEach((call) => {
    if (!groupedCalls[call.date]) groupedCalls[call.date] = []
    groupedCalls[call.date].push(call)
  })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="sm:hidden text-slate-600">
                <ChevronLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Call History</h1>
                <p className="text-xs text-slate-500">{totalCalls} total calls</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`text-slate-400 ${showFilters ? 'bg-blue-50 text-[#1D63FF]' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <MoreVertical className="size-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, service, or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[#1D63FF]/20"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 text-slate-400"
                onClick={() => setSearchQuery('')}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          {showFilters && (
            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="bg-slate-100 p-1 rounded-xl w-full">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex-1"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex-1"
                >
                  <Video className="size-3 mr-1" />
                  Video ({videoCalls})
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex-1"
                >
                  <Phone className="size-3 mr-1" />
                  Audio ({audioCalls})
                </TabsTrigger>
                <TabsTrigger
                  value="missed"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex-1"
                >
                  <PhoneMissed className="size-3 mr-1" />
                  Missed ({missedCalls})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <PhoneCall className="size-5 text-[#1D63FF] mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{totalCalls}</p>
              <p className="text-[10px] sm:text-xs text-slate-500">Total Calls</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <VideoIcon className="size-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{videoCalls}</p>
              <p className="text-[10px] sm:text-xs text-slate-500">Video Calls</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <PhoneMissed className="size-5 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{missedCalls}</p>
              <p className="text-[10px] sm:text-xs text-slate-500">Missed</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <Clock className="size-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">
                {totalHours}h {totalMins}m
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">Total Duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Call List Grouped by Date */}
        {filteredCalls.length === 0 ? (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-12 text-center">
              <PhoneOff className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No calls found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedCalls).map(([date, calls]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">{date}</span>
                </div>
                <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {calls.map((call, i) => {
                    const sConfig = statusConfig[call.status]
                    const StatusIcon = sConfig.icon
                    return (
                      <div key={call.id}>
                        <div className="px-4 py-3.5 sm:px-6 flex items-center gap-3">
                          {/* Avatar & Call Type */}
                          <div className="relative shrink-0">
                            <Avatar className="size-11">
                              <AvatarFallback
                                className={`${call.avatarColor} text-white text-sm font-semibold`}
                              >
                                {call.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center border-2 border-white ${
                                call.type === 'video' ? 'bg-purple-500' : 'bg-blue-500'
                              }`}
                            >
                              {call.type === 'video' ? (
                                <Video className="size-2.5 text-white" />
                              ) : (
                                <Phone className="size-2.5 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Call Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {call.direction === 'outgoing' ? (
                                <ArrowUpRight className="size-3 text-emerald-500 shrink-0" />
                              ) : (
                                <ArrowDownLeft
                                  className={`size-3 shrink-0 ${
                                    call.status === 'missed' ? 'text-red-500' : 'text-blue-500'
                                  }`}
                                />
                              )}
                              <p
                                className={`text-sm font-medium truncate ${
                                  call.status === 'missed' ? 'text-red-600' : 'text-slate-900'
                                }`}
                              >
                                {call.name}
                              </p>
                            </div>
                            {call.serviceName && (
                              <p className="text-[11px] text-slate-400 truncate">
                                {call.serviceName} • {call.bookingId}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-400">{call.time}</span>
                              <Badge
                                className={`${sConfig.color} text-[9px] px-1.5 py-0 h-4 rounded-md border-0`}
                              >
                                {sConfig.label}
                              </Badge>
                              {call.status === 'completed' && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {call.duration}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full text-emerald-600 hover:bg-emerald-50"
                            >
                              <Phone className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full text-purple-600 hover:bg-purple-50"
                            >
                              <Video className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full text-[#1D63FF] hover:bg-blue-50 hidden sm:flex"
                            >
                              <MessageSquare className="size-4" />
                            </Button>
                          </div>
                        </div>
                        {i < calls.length - 1 && <Separator className="bg-slate-100" />}
                      </div>
                    )
                  })}
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        <Card className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] rounded-xl shadow-sm mt-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Need to make a call?</p>
                <p className="text-xs text-blue-200 mt-0.5">
                  Connect with your service provider via audio or video call
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-white/20 hover:bg-white/30 text-white rounded-xl border-0">
                  <Phone className="size-4 mr-2" />
                  Audio
                </Button>
                <Button className="bg-white text-[#0B3D91] hover:bg-blue-50 rounded-xl">
                  <Video className="size-4 mr-2" />
                  Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

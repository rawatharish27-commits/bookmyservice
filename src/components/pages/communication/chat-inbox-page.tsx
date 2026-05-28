'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  MessageSquare,
  Headphones,
  Filter,
  MoreVertical,
  Phone,
  ChevronLeft,
} from 'lucide-react'

interface Conversation {
  id: number
  name: string
  initials: string
  avatarColor: string
  lastMessage: string
  time: string
  unread: number
  type: 'client' | 'provider' | 'support'
  online: boolean
  serviceName?: string
  bookingId?: string
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'Amit Sharma',
    initials: 'AS',
    avatarColor: 'bg-[#1D63FF]',
    lastMessage: 'I will reach your place by 3 PM today',
    time: '2 min ago',
    unread: 3,
    type: 'provider',
    online: true,
    serviceName: 'Air Conditioner',
    bookingId: 'BK-2024-1847',
  },
  {
    id: 2,
    name: 'Priya Patel',
    initials: 'PP',
    avatarColor: 'bg-emerald-600',
    lastMessage: 'Thank you for the great service!',
    time: '15 min ago',
    unread: 0,
    type: 'client',
    online: true,
    serviceName: 'Water Tank Cleaning',
    bookingId: 'BK-2024-1832',
  },
  {
    id: 3,
    name: 'BookMyService Support',
    initials: 'BM',
    avatarColor: 'bg-purple-600',
    lastMessage: 'Your refund of ₹450 has been processed successfully',
    time: '1 hr ago',
    unread: 1,
    type: 'support',
    online: true,
  },
  {
    id: 4,
    name: 'Rajesh Kumar',
    initials: 'RK',
    avatarColor: 'bg-amber-600',
    lastMessage: 'Can we reschedule to tomorrow morning?',
    time: '2 hrs ago',
    unread: 2,
    type: 'provider',
    online: false,
    serviceName: 'Plumber',
    bookingId: 'BK-2024-1801',
  },
  {
    id: 5,
    name: 'Sneha Reddy',
    initials: 'SR',
    avatarColor: 'bg-rose-600',
    lastMessage: 'The Kitchen Appliances service looks amazing, thank you!',
    time: '3 hrs ago',
    unread: 0,
    type: 'client',
    online: false,
    serviceName: 'Kitchen Appliances',
    bookingId: 'BK-2024-1795',
  },
  {
    id: 6,
    name: 'Vikram Singh',
    initials: 'VS',
    avatarColor: 'bg-teal-600',
    lastMessage: 'I have shared the quotation on chat',
    time: '5 hrs ago',
    unread: 0,
    type: 'provider',
    online: false,
    serviceName: 'Kitchen Appliances',
    bookingId: 'BK-2024-1756',
  },
  {
    id: 7,
    name: 'BookMyService Support',
    initials: 'BM',
    avatarColor: 'bg-purple-600',
    lastMessage: 'Your complaint has been resolved. Is there anything else?',
    time: 'Yesterday',
    unread: 0,
    type: 'support',
    online: true,
  },
  {
    id: 8,
    name: 'Kavita Iyer',
    initials: 'KI',
    avatarColor: 'bg-indigo-600',
    lastMessage: 'Please share the invoice for the last booking',
    time: 'Yesterday',
    unread: 0,
    type: 'client',
    online: false,
    serviceName: 'Electrician',
    bookingId: 'BK-2024-1712',
  },
  {
    id: 9,
    name: 'Mohammed Farooq',
    initials: 'MF',
    avatarColor: 'bg-cyan-600',
    lastMessage: 'I will bring the spare parts tomorrow',
    time: '2 days ago',
    unread: 0,
    type: 'provider',
    online: false,
    serviceName: 'Washing Machine Repair',
    bookingId: 'BK-2024-1689',
  },
  {
    id: 10,
    name: 'Deepa Nair',
    initials: 'DN',
    avatarColor: 'bg-pink-600',
    lastMessage: 'When is the next available slot for pest control?',
    time: '2 days ago',
    unread: 0,
    type: 'client',
    online: false,
    serviceName: 'Water Purifier',
    bookingId: 'BK-2024-1645',
  },
]

export function ChatInboxPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    if (activeTab === 'unread') return matchesSearch && conv.unread > 0
    if (activeTab === 'support') return matchesSearch && conv.type === 'support'
    return matchesSearch
  })

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

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
                <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                <p className="text-xs text-slate-500">{totalUnread} unread messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400">
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
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-4"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-4"
              >
                Unread {totalUnread > 0 && `(${totalUnread})`}
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-4"
              >
                Support
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Conversation List */}
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        {filteredConversations.length === 0 ? (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No conversations found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ScrollArea className="max-h-[calc(100vh-280px)]">
              <div>
                {filteredConversations.map((conv, i) => (
                  <div key={conv.id}>
                    <button
                      onClick={() => setSelectedId(conv.id)}
                      className={`w-full text-left px-4 py-3.5 sm:px-6 hover:bg-slate-50 transition-colors ${
                        selectedId === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="size-12">
                            <AvatarFallback
                              className={`${conv.avatarColor} text-white text-sm font-semibold`}
                            >
                              {conv.initials}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  conv.unread > 0
                                    ? 'font-semibold text-slate-900'
                                    : 'font-medium text-slate-700'
                                }`}
                              >
                                {conv.name}
                              </p>
                              {conv.type === 'support' && (
                                <Headphones className="size-3.5 text-purple-500 shrink-0" />
                              )}
                            </div>
                            <span
                              className={`text-xs shrink-0 ml-2 ${
                                conv.unread > 0 ? 'text-[#1D63FF] font-medium' : 'text-slate-400'
                              }`}
                            >
                              {conv.time}
                            </span>
                          </div>
                          {conv.serviceName && (
                            <p className="text-xs text-[#1D63FF] mb-0.5 truncate">
                              {conv.serviceName} • {conv.bookingId}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs truncate pr-2 ${
                                conv.unread > 0 ? 'text-slate-700' : 'text-slate-400'
                              }`}
                            >
                              {conv.lastMessage}
                            </p>
                            {conv.unread > 0 && (
                              <Badge className="bg-[#1D63FF] text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 shrink-0">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    {i < filteredConversations.length - 1 && <Separator className="bg-slate-100" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <MessageSquare className="size-5 text-[#1D63FF] mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{conversations.length}</p>
              <p className="text-[10px] sm:text-xs text-slate-500">Total Chats</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <Headphones className="size-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">
                {conversations.filter((c) => c.type === 'support').length}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">Support</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <Phone className="size-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{totalUnread}</p>
              <p className="text-[10px] sm:text-xs text-slate-500">Unread</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MessageSquare,
  Headphones,
  Clock,
  AlertTriangle,
  Send,
  User,
  ChevronDown,
  Zap,
  CheckCheck,
  Paperclip,
  MoreVertical,
  ArrowUpRight,
  Flag,
} from 'lucide-react'

interface SupportTicket {
  id: number
  ticketId: string
  customerName: string
  customerInitials: string
  avatarColor: string
  subject: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'waiting'
  lastMessage: string
  lastMessageTime: string
  unread: number
  assignedAgent?: string
  category: string
}

interface ChatMessage {
  id: number
  from: 'customer' | 'agent' | 'system'
  senderName: string
  text: string
  time: string
  read: boolean
}

const supportTickets: SupportTicket[] = [
  {
    id: 1,
    ticketId: 'SUP-2024-452',
    customerName: 'Rahul Sharma',
    customerInitials: 'RS',
    avatarColor: 'bg-[#0A1F44]',
    subject: 'Refund not received for cancelled booking',
    priority: 'high',
    status: 'open',
    lastMessage: 'It has been 5 days and I still have not received my refund of ₹499',
    lastMessageTime: '2 min ago',
    unread: 2,
    category: 'Refund',
  },
  {
    id: 2,
    ticketId: 'SUP-2024-451',
    customerName: 'Priya Patel',
    customerInitials: 'PP',
    avatarColor: 'bg-emerald-600',
    subject: 'Provider did not show up for appointment',
    priority: 'high',
    status: 'in-progress',
    lastMessage: 'The electrician never arrived and I waited for 2 hours',
    lastMessageTime: '15 min ago',
    unread: 1,
    assignedAgent: 'Suresh M.',
    category: 'No-show',
  },
  {
    id: 3,
    ticketId: 'SUP-2024-450',
    customerName: 'Amit Verma',
    customerInitials: 'AV',
    avatarColor: 'bg-amber-600',
    subject: 'Wrong service performed by provider',
    priority: 'medium',
    status: 'waiting',
    lastMessage: 'I booked Water Tank Cleaning but they did basic cleaning only',
    lastMessageTime: '1 hr ago',
    unread: 0,
    assignedAgent: 'Kavitha R.',
    category: 'Service Issue',
  },
  {
    id: 4,
    ticketId: 'SUP-2024-449',
    customerName: 'Sonia Mehta',
    customerInitials: 'SM',
    avatarColor: 'bg-rose-600',
    subject: 'Coupon code not working at checkout',
    priority: 'low',
    status: 'open',
    lastMessage: 'I tried using FIRST50 but it says invalid code',
    lastMessageTime: '2 hrs ago',
    unread: 1,
    category: 'Coupon',
  },
  {
    id: 5,
    ticketId: 'SUP-2024-448',
    customerName: 'Vikram Singh',
    customerInitials: 'VS',
    avatarColor: 'bg-teal-600',
    subject: 'Unable to add payment method',
    priority: 'medium',
    status: 'in-progress',
    lastMessage: 'My UPI ID is not being accepted in the payment section',
    lastMessageTime: '3 hrs ago',
    unread: 0,
    assignedAgent: 'Suresh M.',
    category: 'Payment',
  },
  {
    id: 6,
    ticketId: 'SUP-2024-447',
    customerName: 'Deepa Nair',
    customerInitials: 'DN',
    avatarColor: 'bg-pink-600',
    subject: 'Provider requesting off-platform payment',
    priority: 'high',
    status: 'open',
    lastMessage: 'The plumber asked me to pay him directly instead of through the app',
    lastMessageTime: '4 hrs ago',
    unread: 3,
    category: 'Compliance',
  },
]

const ticketMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, from: 'customer', senderName: 'Rahul Sharma', text: 'Hi, I cancelled my Air Conditioner repair booking (BK-2024-1847) 5 days ago but I have not received my refund yet.', time: '10:30 AM', read: true },
    { id: 2, from: 'system', senderName: 'System', text: 'Ticket SUP-2024-452 created and assigned to queue.', time: '10:30 AM', read: true },
    { id: 3, from: 'agent', senderName: 'Suresh M.', text: 'Hello Rahul, I apologize for the delay. Let me check the status of your refund right away.', time: '10:35 AM', read: true },
    { id: 4, from: 'customer', senderName: 'Rahul Sharma', text: 'Please do. The amount is ₹499 and it was supposed to be refunded within 3-5 business days.', time: '10:37 AM', read: true },
    { id: 5, from: 'agent', senderName: 'Suresh M.', text: 'I can see the refund was initiated on our end. It seems there is a delay from the payment gateway. Let me escalate this.', time: '10:40 AM', read: true },
    { id: 6, from: 'customer', senderName: 'Rahul Sharma', text: 'It has been 5 days and I still have not received my refund of ₹499. This is really frustrating.', time: '10:45 AM', read: false },
  ],
  2: [
    { id: 1, from: 'customer', senderName: 'Priya Patel', text: 'I had a booking for Electrician repair today at 2 PM but the provider never showed up!', time: '2:15 PM', read: true },
    { id: 2, from: 'agent', senderName: 'Suresh M.', text: 'I am sorry to hear that, Priya. Let me check the provider status immediately.', time: '2:20 PM', read: true },
    { id: 3, from: 'customer', senderName: 'Priya Patel', text: 'The electrician never arrived and I waited for 2 hours. This is unacceptable.', time: '4:15 PM', read: false },
  ],
}

const agents = [
  { name: 'Unassigned', value: 'none' },
  { name: 'Suresh M.', value: 'suresh' },
  { name: 'Kavitha R.', value: 'kavitha' },
  { name: 'Arjun D.', value: 'arjun' },
  { name: 'Meena S.', value: 'meena' },
]

const quickReplies = [
  'Let me check that for you.',
  'I apologize for the inconvenience.',
  'Your refund has been processed.',
  'Let me escalate this to our team.',
  'Is there anything else I can help with?',
]

const priorityConfig = {
  high: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
  low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ChevronDown, iconColor: 'text-emerald-500' },
}

const statusConfig = {
  open: { color: 'bg-[#FFD54F]/10 text-[#0A1F44]', label: 'Open' },
  'in-progress': { color: 'bg-amber-100 text-amber-700', label: 'In Progress' },
  waiting: { color: 'bg-slate-100 text-slate-600', label: 'Waiting' },
}

export function AdminSupportChatPage() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket>(supportTickets[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [assignedAgent, setAssignedAgent] = useState(selectedTicket.assignedAgent || 'none')

  const filteredTickets = supportTickets.filter(
    (t) =>
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const messages = ticketMessages[selectedTicket.id] || []

  const highPriorityCount = supportTickets.filter((t) => t.priority === 'high').length
  const openCount = supportTickets.filter((t) => t.status === 'open').length

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setAssignedAgent(ticket.assignedAgent || 'none')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Support Chat Monitor</h1>
              <p className="text-xs text-slate-500">Manage and respond to customer support tickets</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle className="size-3 mr-1" />
                {highPriorityCount} High
              </Badge>
              <Badge className="bg-[#FFD54F]/10 text-[#0A1F44] border border-[#FFD54F]/20">
                {openCount} Open
              </Badge>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-white rounded-xl shadow-sm border-0">
              <CardContent className="p-3 text-center">
                <MessageSquare className="size-4 text-[#0A1F44] mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{supportTickets.length}</p>
                <p className="text-[10px] text-slate-500">Total Tickets</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-sm border-0">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="size-4 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{highPriorityCount}</p>
                <p className="text-[10px] text-slate-500">High Priority</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-sm border-0">
              <CardContent className="p-3 text-center">
                <Clock className="size-4 text-amber-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">
                  {supportTickets.filter((t) => t.status === 'in-progress').length}
                </p>
                <p className="text-[10px] text-slate-500">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-sm border-0">
              <CardContent className="p-3 text-center">
                <Headphones className="size-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{agents.length - 1}</p>
                <p className="text-[10px] text-slate-500">Active Agents</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-260px)] lg:h-[calc(100vh-220px)]">
        {/* Left Panel - Ticket List */}
        <div className="lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-[#0A1F44]/20"
              />
            </div>
          </div>

          {/* Ticket List */}
          <ScrollArea className="flex-1">
            <div>
              {filteredTickets.map((ticket, i) => {
                const pConfig = priorityConfig[ticket.priority]
                return (
                  <div key={ticket.id}>
                    <button
                      onClick={() => handleTicketSelect(ticket)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors ${
                        selectedTicket.id === ticket.id ? 'bg-[#FFD54F]/10 border-l-2 border-l-[#0A1F44]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback
                            className={`${ticket.avatarColor} text-white text-xs font-semibold`}
                          >
                            {ticket.customerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {ticket.customerName}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {ticket.lastMessageTime}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-700 truncate mb-1">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              className={`${pConfig.color} text-[9px] px-1.5 py-0 h-4 border rounded-md`}
                            >
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </Badge>
                            <Badge
                              className={`${statusConfig[ticket.status].color} text-[9px] px-1.5 py-0 h-4 rounded-md border-0`}
                            >
                              {statusConfig[ticket.status].label}
                            </Badge>
                            {ticket.unread > 0 && (
                              <span className="ml-auto bg-[#0A1F44] text-white text-[9px] size-4 rounded-full flex items-center justify-center">
                                {ticket.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    {i < filteredTickets.length - 1 && <Separator className="bg-slate-100" />}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Chat View */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="bg-white border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className={`${selectedTicket.avatarColor} text-white text-sm font-semibold`}>
                    {selectedTicket.customerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{selectedTicket.customerName}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedTicket.ticketId} • {selectedTicket.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-slate-500">Agent:</span>
                  <Select value={assignedAgent} onValueChange={(value: string | null) => setAssignedAgent(value ?? 'none')}>
                    <SelectTrigger className="h-8 w-36 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.value} value={agent.value} className="text-xs">
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 size-8">
                  <Flag className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 size-8">
                  <ArrowUpRight className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-2xl mx-auto space-y-3">
              {messages.map((msg) => {
                if (msg.from === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-slate-100 text-slate-500 text-[11px] px-4 py-2 rounded-full max-w-[85%] text-center">
                        {msg.text}
                      </div>
                    </div>
                  )
                }

                const isAgent = msg.from === 'agent'
                return (
                  <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl ${
                        isAgent
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'
                      }`}
                    >
                      <div className="p-3">
                        {!isAgent && (
                          <p className="text-[10px] font-semibold text-[#0A1F44] mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        {isAgent && (
                          <p className="text-[10px] font-medium text-emerald-200 mb-1">
                            {msg.senderName} (Agent)
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isAgent ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          <span className="text-[10px]">{msg.time}</span>
                          {isAgent && <CheckCheck className="size-3" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="bg-white border-t border-slate-100 px-4 py-2">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] text-slate-400 mb-1.5">Quick Replies</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickReplies.map((reply, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-[11px] whitespace-nowrap border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-7"
                    onClick={() => setReplyText(reply)}
                  >
                    <Zap className="size-3 mr-1" />
                    {reply}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-slate-200 p-3">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Button variant="ghost" size="icon" className="shrink-0 text-slate-400">
                <Paperclip className="size-4" />
              </Button>
              <input
                type="text"
                placeholder="Type a response..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <Button size="icon" className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

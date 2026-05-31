'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  X,
  Send,
  Clock,
  User,
  MoreVertical,
  Shield,
  Wrench,
  Star,
  ChevronRight,
  Phone,
  Maximize2,
  Settings,
  Users,
} from 'lucide-react'

interface ChatMessage {
  id: number
  from: 'self' | 'other'
  name: string
  text: string
  time: string
}

const chatMessages: ChatMessage[] = [
  { id: 1, from: 'other', name: 'Amit Sharma', text: 'Can you show me the AC unit?', time: '10:02' },
  { id: 2, from: 'self', name: 'You', text: 'Sure, let me adjust the camera', time: '10:03' },
  { id: 3, from: 'other', name: 'Amit Sharma', text: 'I can see the issue clearly now. The filter needs replacement.', time: '10:04' },
  { id: 4, from: 'self', name: 'You', text: 'How much will that cost?', time: '10:05' },
  { id: 5, from: 'other', name: 'Amit Sharma', text: 'Filter replacement will be around ₹350 + service charge ₹149', time: '10:05' },
]

export function VideoConsultationPage() {
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const sendMessage = () => {
    if (!chatInput.trim()) return
    setChatInput('')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
          {/* Simulated remote video */}
          <div className="text-center">
            <Avatar className="size-24 mx-auto mb-4">
              <AvatarFallback className="bg-[#1D63FF] text-white text-3xl font-bold">
                AS
              </AvatarFallback>
            </Avatar>
            <p className="text-white text-lg font-semibold">Amit Sharma</p>
            <p className="text-slate-400 text-sm">Air Conditioner Expert</p>
            {isCameraOff && (
              <Badge className="mt-3 bg-slate-700 text-slate-300 border-slate-600">
                <VideoOff className="size-3 mr-1" />
                Camera Off
              </Badge>
            )}
          </div>

          {/* Call Duration Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 size-9 rounded-full"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Wrench className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 size-9 rounded-full"
            >
              <Users className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 size-9 rounded-full"
            >
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>

        {/* Self View PiP */}
        <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 z-20">
          <div
            className={`w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 shadow-xl transition-all ${
              isScreenSharing ? 'border-blue-500' : 'border-white/20'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              {isCameraOff ? (
                <VideoOff className="size-8 text-slate-400" />
              ) : (
                <div className="text-center">
                  <Avatar className="size-12 mx-auto">
                    <AvatarFallback className="bg-emerald-600 text-white text-sm font-semibold">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-[10px] text-slate-300 mt-1">You</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-800 border-l border-slate-700 z-30 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Chat</h3>
              <p className="text-[10px] text-slate-400">Amit Sharma</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white size-8"
              onClick={() => setShowChat(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'self' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-2.5 ${
                      msg.from === 'self'
                        ? 'bg-[#1D63FF] text-white rounded-br-sm'
                        : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.from !== 'self' && (
                      <p className="text-[10px] font-medium text-blue-400 mb-0.5">{msg.name}</p>
                    )}
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-[9px] mt-1 text-right ${
                        msg.from === 'self' ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
              />
              <Button
                size="icon"
                className="bg-[#1D63FF] hover:bg-[#0B3D91] text-white size-8 rounded-lg shrink-0"
                onClick={sendMessage}
              >
                <Send className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Panel */}
      {showDetails && (
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 border-r border-slate-700 z-30 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Booking Details</h3>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white size-8"
              onClick={() => setShowDetails(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Service Info */}
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="size-4 text-blue-400" />
                  <p className="text-sm font-semibold text-white">Air Conditioner</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-400">Booking ID</span>
                    <span className="text-[11px] text-slate-200 font-mono">BK-2024-1847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-400">Date & Time</span>
                    <span className="text-[11px] text-slate-200">4 Mar, 10:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-400">Duration</span>
                    <span className="text-[11px] text-slate-200">1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-400">Amount</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">₹499</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-400">Status</span>
                    <Badge className="bg-emerald-600/20 text-emerald-400 text-[10px] border-0 h-5">
                      In Progress
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Provider Info */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Service Provider</p>
                <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-[#1D63FF] text-white text-sm font-semibold">
                      AS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Amit Sharma</p>
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] text-slate-400">4.8 • 1,240 services</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 size-8">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Customer</p>
                <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-emerald-600 text-white text-sm font-semibold">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Rahul Sharma</p>
                    <p className="text-[11px] text-slate-400">Flat 302, Tower B, Prestige Shantiniketan</p>
                  </div>
                </div>
              </div>

              {/* Issue Description */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Issue Description</p>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AC not cooling properly since last week. The indoor unit makes unusual noise when
                    turned on. Gas refill or filter cleaning may be needed.
                  </p>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-xl p-3">
                <Shield className="size-4 text-emerald-400" />
                <p className="text-[11px] text-slate-400">
                  Video consultation is recorded for quality & safety
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 px-4 py-4 z-20">
        <div className="mx-auto max-w-3xl flex items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={`size-12 rounded-full ${
              isMuted
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`size-12 rounded-full ${
              isCameraOff
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            onClick={() => setIsCameraOff(!isCameraOff)}
          >
            {isCameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`size-12 rounded-full ${
              isScreenSharing
                ? 'bg-[#1D63FF] text-white hover:bg-[#0B3D91]'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
          >
            <MonitorUp className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`size-12 rounded-full ${
              showChat
                ? 'bg-[#1D63FF] text-white hover:bg-[#0B3D91]'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-12 rounded-full bg-slate-700 text-white hover:bg-slate-600"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Wrench className="size-5" />
          </Button>

          <Button
            size="icon"
            className="size-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
          >
            <PhoneOff className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

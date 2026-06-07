'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Check,
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  MapPin,
  Clock,
  AlertCircle,
  Mic,
  Smile,
  Wrench,
  X,
} from 'lucide-react'

interface Message {
  id: number
  from: 'provider' | 'customer' | 'system'
  text: string
  time: string
  read: boolean
  type: 'text' | 'image' | 'document' | 'location' | 'system'
  fileName?: string
  fileSize?: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    from: 'system',
    text: 'Booking #BK-2024-1847 has been confirmed for Air Conditioner on 4 Mar 2025, 10:00 AM',
    time: '9:00 AM',
    read: true,
    type: 'system',
  },
  {
    id: 2,
    from: 'provider',
    text: 'Good morning Rahul! I am Amit, your assigned technician for AC service today.',
    time: '9:15 AM',
    read: true,
    type: 'text',
  },
  {
    id: 3,
    from: 'customer',
    text: 'Hi Amit! Yes, I have been waiting. The AC is not cooling properly since last week.',
    time: '9:17 AM',
    read: true,
    type: 'text',
  },
  {
    id: 4,
    from: 'provider',
    text: 'I understand. Let me check the service history. Could you also share a photo of the AC unit?',
    time: '9:18 AM',
    read: true,
    type: 'text',
  },
  {
    id: 5,
    from: 'customer',
    text: 'Sure, here is the photo of the AC indoor unit',
    time: '9:20 AM',
    read: true,
    type: 'image',
    fileName: 'ac-unit-photo.jpg',
    fileSize: '2.4 MB',
  },
  {
    id: 6,
    from: 'provider',
    text: 'I can see the issue — it looks like the filters are clogged and there might be a gas leak. I will bring the necessary tools and refrigerant.',
    time: '9:22 AM',
    read: true,
    type: 'text',
  },
  {
    id: 7,
    from: 'provider',
    text: 'Here is the service estimate document for your reference',
    time: '9:23 AM',
    read: true,
    type: 'document',
    fileName: 'service-estimate-BK1847.pdf',
    fileSize: '156 KB',
  },
  {
    id: 8,
    from: 'customer',
    text: 'Thanks for the estimate. What time will you arrive?',
    time: '9:30 AM',
    read: true,
    type: 'text',
  },
  {
    id: 9,
    from: 'provider',
    text: 'I will reach your location by 10:00 AM. Here is my current location:',
    time: '9:35 AM',
    read: true,
    type: 'location',
  },
  {
    id: 10,
    from: 'customer',
    text: 'Great! The gate code is 4521. I am in Flat 302, Tower B.',
    time: '9:36 AM',
    read: true,
    type: 'text',
  },
  {
    id: 11,
    from: 'provider',
    text: 'Noted! I am on my way now. Will reach in about 20 minutes.',
    time: '9:40 AM',
    read: false,
    type: 'text',
  },
]

const quickReplies = [
  'On my way!',
  'Will be there in 10 mins',
  'Please share your location',
  'I need to reschedule',
  'Thank you!',
]

export function ProviderCustomerChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const newMsg: Message = {
      id: messages.length + 1,
      from: 'customer',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false,
      type: 'text',
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setShowQuickReplies(false)

    // Simulate typing indicator
    setTimeout(() => setIsTyping(true), 1000)
    setTimeout(() => {
      setIsTyping(false)
      const reply: Message = {
        id: messages.length + 2,
        from: 'provider',
        text: 'Got it! I will update you shortly.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        read: false,
        type: 'text',
      }
      setMessages((prev) => [...prev, reply])
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Booking Context Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-3xl">
          {/* Provider Info Bar */}
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" className="sm:hidden text-slate-600 shrink-0">
              <ChevronLeft className="size-5" />
            </Button>
            <div className="relative shrink-0">
              <Avatar className="size-11">
                <AvatarFallback className="bg-[#0A1F44] text-white text-sm font-semibold">
                  AS
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">Amit Sharma</p>
              <p className="text-xs text-emerald-500">Online • Air Conditioner Expert</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 shrink-0">
              <Phone className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 shrink-0">
              <Video className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 shrink-0">
              <MoreVertical className="size-5" />
            </Button>
          </div>

          {/* Booking Context */}
          <div className="mx-4 mb-3 p-3 bg-[#FFD54F]/10 border border-[#0A1F44]/10 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Wrench className="size-4 text-[#0A1F44] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-900 truncate">
                    Air Conditioner
                  </p>
                  <p className="text-[10px] text-[#0A1F44]">BK-2024-1847 • 4 Mar, 10:00 AM</p>
                </div>
              </div>
              <Badge className="bg-[#0A1F44] text-white text-[10px] shrink-0">In Progress</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="mx-auto max-w-3xl space-y-3">
          {/* Date Separator */}
          <div className="flex items-center gap-3 py-2">
            <Separator className="flex-1 bg-slate-200" />
            <span className="text-[10px] text-slate-400 font-medium">Today</span>
            <Separator className="flex-1 bg-slate-200" />
          </div>

          {messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-slate-100 text-slate-600 text-[11px] px-4 py-2 rounded-full max-w-[85%] text-center">
                    <AlertCircle className="size-3 inline mr-1 -mt-0.5" />
                    {msg.text}
                  </div>
                </div>
              )
            }

            const isSent = msg.from === 'customer'

            return (
              <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] sm:max-w-[65%] rounded-2xl ${
                    isSent
                      ? 'bg-[#0A1F44] text-white rounded-br-md'
                      : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'
                  }`}
                >
                  {/* Image Message */}
                  {msg.type === 'image' && (
                    <div className="p-1.5 pb-0">
                      <div className="bg-slate-100 rounded-xl overflow-hidden">
                        <div className="h-48 flex items-center justify-center bg-gradient-to-br from-[#0A1F44]/10 to-slate-100">
                          <ImageIcon className="size-10 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Message */}
                  {msg.type === 'document' && (
                    <div className="p-3 pb-1.5">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          isSent ? 'bg-[#FFD54F]/100/30' : 'bg-slate-50'
                        }`}
                      >
                        <div
                          className={`size-10 rounded-lg flex items-center justify-center ${
                            isSent ? 'bg-blue-400/30' : 'bg-red-100'
                          }`}
                        >
                          <FileText className={`size-5 ${isSent ? 'text-white' : 'text-red-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isSent ? 'text-white' : 'text-slate-700'}`}>
                            {msg.fileName}
                          </p>
                          <p className={`text-[10px] ${isSent ? 'text-blue-200' : 'text-slate-400'}`}>
                            {msg.fileSize}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Message */}
                  {msg.type === 'location' && (
                    <div className="p-1.5 pb-0">
                      <div
                        className={`rounded-xl overflow-hidden h-36 flex items-center justify-center ${
                          isSent ? 'bg-[#FFD54F]/100/30' : 'bg-slate-50'
                        }`}
                      >
                        <div className="text-center">
                          <MapPin className={`size-8 mx-auto mb-1 ${isSent ? 'text-white' : 'text-[#0A1F44]'}`} />
                          <p className={`text-xs ${isSent ? 'text-blue-200' : 'text-slate-500'}`}>
                            Koramangala, Bangalore
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text */}
                  <div className="p-3">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${
                        isSent ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-[10px]">{msg.time}</span>
                      {isSent &&
                        (msg.read ? (
                          <CheckCheck className="size-3.5 text-blue-200" />
                        ) : (
                          <Check className="size-3.5" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-slate-100 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="size-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Replies */}
      {showQuickReplies && (
        <div className="bg-white border-t border-slate-100 px-4 py-2">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Quick Replies</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 ml-auto text-slate-400"
                onClick={() => setShowQuickReplies(false)}
              >
                <X className="size-3" />
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickReplies.map((reply, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs whitespace-nowrap border-[#FFD54F]/20 text-[#0A1F44] hover:bg-[#FFD54F]/10"
                  onClick={() => sendMessage(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <Paperclip className="size-5" />
            </Button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]/20"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-slate-400"
              >
                <Smile className="size-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-slate-600"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
            >
              <Mic className="size-5" />
            </Button>
            <Button
              size="icon"
              className="shrink-0 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl"
              onClick={() => sendMessage(inputText)}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

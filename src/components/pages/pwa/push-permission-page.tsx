'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  BellOff,
  CalendarCheck,
  Tag,
  Clock,
  MessageSquare,
  Volume2,
  Vibrate,
  Moon,
  Sun,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Eye,
  Megaphone,
  Star,
  Wrench,
  Shield,
  Info,
} from 'lucide-react'

interface NotificationCategory {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  enabled: boolean
  count: number
}

interface NotificationPreview {
  id: string
  category: string
  title: string
  body: string
  time: string
  icon: React.ElementType
  color: string
}

const initialCategories: NotificationCategory[] = [
  {
    id: 'booking',
    title: 'Booking Updates',
    description: 'Confirmations, cancellations, rescheduling, and status changes',
    icon: CalendarCheck,
    color: 'text-[#0A1F44]',
    bgColor: 'bg-[#FFD54F]/10',
    enabled: true,
    count: 12,
  },
  {
    id: 'promotions',
    title: 'Promotions & Offers',
    description: 'Seasonal deals, discount codes, and flash sales',
    icon: Tag,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    enabled: true,
    count: 5,
  },
  {
    id: 'reminders',
    title: 'Service Reminders',
    description: 'Upcoming bookings, provider arrival, and follow-ups',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    enabled: true,
    count: 8,
  },
  {
    id: 'messages',
    title: 'Provider Messages',
    description: 'Chat messages, queries, and service updates from providers',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    enabled: true,
    count: 3,
  },
  {
    id: 'reviews',
    title: 'Review Reminders',
    description: 'Reminders to rate and review completed services',
    icon: Star,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    enabled: false,
    count: 2,
  },
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Login alerts, password changes, and security notifications',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    enabled: true,
    count: 1,
  },
]

const notificationPreviews: NotificationPreview[] = [
  {
    id: '1',
    category: 'Booking',
    title: 'Booking Confirmed! ✅',
    body: 'Your Water Tank Cleaning service is confirmed for tomorrow, 10 AM. Provider: Rajesh K.',
    time: 'Just now',
    icon: CalendarCheck,
    color: 'text-[#0A1F44]',
  },
  {
    id: '2',
    category: 'Promotion',
    title: '🎉 Flat 30% Off Air Conditioner!',
    body: 'Summer special! Book AC service this week and save big. Use code: COOL30',
    time: '2 hrs ago',
    icon: Tag,
    color: 'text-emerald-600',
  },
  {
    id: '3',
    category: 'Reminder',
    title: 'Provider arriving in 15 min',
    body: 'Suresh M. is on the way for your plumbing service. Track live location.',
    time: '15 min ago',
    icon: Clock,
    color: 'text-amber-600',
  },
  {
    id: '4',
    category: 'Message',
    title: 'New message from Priya S.',
    body: 'Hi! I can arrive 30 mins early if that works for you. Let me know!',
    time: '1 hr ago',
    icon: MessageSquare,
    color: 'text-purple-600',
  },
]

export function PushPermissionPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')
  const [showPreviews, setShowPreviews] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(true)

  const toggleCategory = (id: string) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    )
  }

  const enableAll = () => {
    setCategories(prev => prev.map(c => ({ ...c, enabled: true })))
  }

  const disableAll = () => {
    setCategories(prev => prev.map(c => ({ ...c, enabled: false })))
  }

  const enabledCount = categories.filter(c => c.enabled).length

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Notification Preferences</h1>
              <p className="text-xs text-slate-500">Customize what alerts you receive</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              permissionGranted ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {permissionGranted ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              {permissionGranted ? 'Allowed' : 'Blocked'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Permission Status */}
        {!permissionGranted && (
          <Card className="bg-red-50 rounded-xl shadow-sm border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Notifications Blocked</p>
                  <p className="text-xs text-red-600 mt-1">
                    You&apos;ve blocked push notifications. Please enable them in your browser settings to receive alerts.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white text-xs"
                    onClick={() => setPermissionGranted(true)}
                  >
                    Open Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Card */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD54F]/10 flex items-center justify-center">
                <Bell className="w-7 h-7 text-[#0A1F44]" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-900">{enabledCount}/{categories.length}</p>
                <p className="text-xs text-slate-500">Categories enabled</p>
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={enableAll} className="text-[10px]">
                  All On
                </Button>
                <Button size="xs" variant="outline" onClick={disableAll} className="text-[10px]">
                  All Off
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`h-1.5 rounded-full ${cat.enabled ? 'bg-[#FFD54F]/100' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notification Categories</CardTitle>
            <CardDescription>Toggle specific types of notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 py-3">
                    <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center shrink-0`}>
                      <category.icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{category.title}</p>
                        <Switch
                          checked={category.enabled}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500 truncate">{category.description}</p>
                      </div>
                      {category.enabled && category.count > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-slate-400">{category.count} recent</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < categories.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#0A1F44]" />
              <CardTitle className="text-base">Quiet Hours</CardTitle>
            </div>
            <CardDescription>Silence notifications during specific hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Enable Quiet Hours</p>
                <p className="text-xs text-slate-500">Mute non-urgent notifications</p>
              </div>
              <Switch
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
              />
            </div>

            {quietHoursEnabled && (
              <div className="bg-indigo-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-medium">From</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Moon className="w-4 h-4 text-[#0A1F44]" />
                      <span className="text-lg font-semibold text-slate-900">{quietStart}</span>
                    </div>
                  </div>
                  <div className="text-slate-300">—</div>
                  <div className="flex-1">
                    <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-medium">Until</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-lg font-semibold text-slate-900">{quietEnd}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <p className="text-xs text-[#0A1F44]">
                    Urgent notifications (booking cancellations, security alerts) will still come through.
                  </p>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2">
                  {[
                    { label: 'Night', start: '22:00', end: '08:00' },
                    { label: 'Afternoon', start: '13:00', end: '15:00' },
                    { label: 'Weekend', start: '09:00', end: '11:00' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => { setQuietStart(preset.start); setQuietEnd(preset.end) }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs font-medium text-[#0A1F44] hover:bg-[#0A1F44]/10 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sound & Vibration */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sound & Vibration</CardTitle>
            <CardDescription>How notifications alert you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Volume2 className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Notification Sound</p>
                    <p className="text-xs text-slate-500">Play sound for new notifications</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Vibrate className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Vibration</p>
                    <p className="text-xs text-slate-500">Vibrate on notification</p>
                  </div>
                </div>
                <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFD54F]/10 flex items-center justify-center">
                    <Eye className="w-4.5 h-4.5 text-[#0A1F44]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Show Previews</p>
                    <p className="text-xs text-slate-500">Show content in notification banner</p>
                  </div>
                </div>
                <Switch checked={showPreviews} onCheckedChange={setShowPreviews} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preview */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notification Preview</CardTitle>
            <CardDescription>See how different notifications appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationPreviews.map((preview) => {
                const isCatEnabled = categories.find(c =>
                  c.id === preview.category.toLowerCase() ||
                  (preview.category === 'Booking' && c.id === 'booking') ||
                  (preview.category === 'Promotion' && c.id === 'promotions') ||
                  (preview.category === 'Reminder' && c.id === 'reminders') ||
                  (preview.category === 'Message' && c.id === 'messages')
                )?.enabled ?? true

                return (
                  <div
                    key={preview.id}
                    className={`rounded-xl p-3 border transition-opacity ${
                      isCatEnabled
                        ? 'bg-slate-50 border-slate-100 opacity-100'
                        : 'bg-slate-50 border-slate-100 opacity-40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <preview.icon className={`w-4 h-4 ${preview.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900">{preview.title}</p>
                          <span className="text-[10px] text-slate-400">{preview.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{preview.body}</p>
                        <Badge variant="outline" className="mt-1.5 text-[9px]">{preview.category}</Badge>
                      </div>
                    </div>
                    {!isCatEnabled && (
                      <div className="flex items-center gap-1 mt-2 pl-11">
                        <BellOff className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400">This notification type is disabled</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pb-6">
          <Button className="w-full h-11 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white font-semibold rounded-xl">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Changes take effect immediately. You can update these anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

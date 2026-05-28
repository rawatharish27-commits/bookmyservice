'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  Shield,
  ShieldAlert,
  LogOut,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Fingerprint,
  Globe,
  Trash2,
  Eye,
  Lock,
  Info,
} from 'lucide-react'

interface DeviceSession {
  id: string
  deviceName: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
  os: string
  browser: string
  location: string
  ip: string
  lastActive: string
  loginTime: string
  isCurrent: boolean
  isTrusted: boolean
}

const mockSessions: DeviceSession[] = [
  {
    id: '1',
    deviceName: 'Samsung Galaxy S24 Ultra',
    deviceType: 'mobile',
    os: 'Android 14',
    browser: 'Chrome 122',
    location: 'Mumbai, Maharashtra',
    ip: '103.xx.xx.45',
    lastActive: 'Active now',
    loginTime: 'Today, 9:15 AM',
    isCurrent: true,
    isTrusted: true,
  },
  {
    id: '2',
    deviceName: 'MacBook Pro 16"',
    deviceType: 'desktop',
    os: 'macOS Sonoma',
    browser: 'Safari 17',
    location: 'Bangalore, Karnataka',
    ip: '49.xx.xx.112',
    lastActive: '2 hours ago',
    loginTime: 'Yesterday, 6:30 PM',
    isCurrent: false,
    isTrusted: true,
  },
  {
    id: '3',
    deviceName: 'iPad Air (5th Gen)',
    deviceType: 'tablet',
    os: 'iPadOS 17',
    browser: 'Safari 17',
    location: 'Delhi, NCR',
    ip: '223.xx.xx.78',
    lastActive: '5 hours ago',
    loginTime: 'Mar 3, 2025, 11:00 AM',
    isCurrent: false,
    isTrusted: true,
  },
  {
    id: '4',
    deviceName: 'OnePlus 12',
    deviceType: 'mobile',
    os: 'Android 14',
    browser: 'Chrome 121',
    location: 'Pune, Maharashtra',
    ip: '157.xx.xx.33',
    lastActive: '2 days ago',
    loginTime: 'Mar 1, 2025, 8:45 AM',
    isCurrent: false,
    isTrusted: false,
  },
  {
    id: '5',
    deviceName: 'Windows Desktop',
    deviceType: 'desktop',
    os: 'Windows 11',
    browser: 'Edge 122',
    location: 'Hyderabad, Telangana',
    ip: '103.xx.xx.91',
    lastActive: '5 days ago',
    loginTime: 'Feb 26, 2025, 3:20 PM',
    isCurrent: false,
    isTrusted: false,
  },
]

const securityEvents = [
  {
    id: 'e1',
    type: 'login' as const,
    message: 'New login from Samsung Galaxy S24 Ultra',
    time: 'Today, 9:15 AM',
    location: 'Mumbai',
  },
  {
    id: 'e2',
    type: 'login' as const,
    message: 'Login from MacBook Pro',
    time: 'Yesterday, 6:30 PM',
    location: 'Bangalore',
  },
  {
    id: 'e3',
    type: 'warning' as const,
    message: 'Unrecognized device login attempt blocked',
    time: 'Mar 2, 2025',
    location: 'Unknown',
  },
  {
    id: 'e4',
    type: 'logout' as const,
    message: 'Signed out from old iPhone 13',
    time: 'Mar 1, 2025',
    location: 'Mumbai',
  },
]

function getDeviceIcon(type: DeviceSession['deviceType']) {
  switch (type) {
    case 'mobile': return Smartphone
    case 'desktop': return Monitor
    case 'tablet': return Tablet
  }
}

function getDeviceColor(type: DeviceSession['deviceType']) {
  switch (type) {
    case 'mobile': return { icon: 'text-[#1D63FF]', bg: 'bg-blue-50' }
    case 'desktop': return { icon: 'text-emerald-600', bg: 'bg-emerald-50' }
    case 'tablet': return { icon: 'text-purple-600', bg: 'bg-purple-50' }
  }
}

export function DeviceSessionsPage() {
  const [sessions, setSessions] = useState(mockSessions)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [showSignOutAll, setShowSignOutAll] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const currentSession = sessions.find(s => s.isCurrent)
  const otherSessions = sessions.filter(s => !s.isCurrent)
  const untrustedSessions = sessions.filter(s => !s.isTrusted && !s.isCurrent)

  const handleSignOutDevice = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const handleSignOutAll = () => {
    setSigningOut(true)
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.isCurrent))
      setSigningOut(false)
      setShowSignOutAll(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Device Sessions</h1>
              <p className="text-xs text-slate-500">Manage your active logins</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {sessions.length} device{sessions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Current Device */}
        {currentSession && (
          <Card className="bg-white rounded-xl shadow-sm border-2 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-600">This Device</span>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl ${getDeviceColor(currentSession.deviceType).bg} flex items-center justify-center shrink-0`}>
                  {(() => {
                    const Icon = getDeviceIcon(currentSession.deviceType)
                    return <Icon className={`w-6 h-6 ${getDeviceColor(currentSession.deviceType).icon}`} />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{currentSession.deviceName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500">{currentSession.os} • {currentSession.browser}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{currentSession.location}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-blue-50 text-[#0B3D91] border-0 text-[10px]">
                  <Wifi className="w-3 h-3 mr-1" /> Active
                </Badge>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">Logged in at {currentSession.loginTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Trusted</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Alert */}
        {untrustedSessions.length > 0 && (
          <Card className="bg-amber-50 rounded-xl shadow-sm border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Unrecognized Devices</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {untrustedSessions.length} device{untrustedSessions.length > 1 ? 's' : ''} that you haven&apos;t marked as trusted {untrustedSessions.length > 1 ? 'are' : 'is'} logged into your account.
                    Review and sign out if you don&apos;t recognize {untrustedSessions.length > 1 ? 'them' : 'it'}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Devices */}
        {otherSessions.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Other Devices</CardTitle>
              <CardDescription>{otherSessions.length} other active session{otherSessions.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {otherSessions.map((session, index) => {
                  const Icon = getDeviceIcon(session.deviceType)
                  const colors = getDeviceColor(session.deviceType)
                  const isExpanded = expandedSession === session.id

                  return (
                    <div key={session.id}>
                      <div className="rounded-xl hover:bg-slate-50 transition-colors">
                        <button
                          onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                          className="w-full flex items-center gap-3 p-3 text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 truncate">{session.deviceName}</p>
                              {!session.isTrusted && (
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-500 truncate">{session.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px] text-slate-400">{session.lastActive}</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-0">
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">OS</p>
                                  <p className="text-xs text-slate-700 font-medium">{session.os}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Browser</p>
                                  <p className="text-xs text-slate-700 font-medium">{session.browser}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">IP Address</p>
                                  <p className="text-xs text-slate-700 font-medium">{session.ip}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Logged In</p>
                                  <p className="text-xs text-slate-700 font-medium">{session.loginTime}</p>
                                </div>
                              </div>

                              <Separator />

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {session.isTrusted ? (
                                    <>
                                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                      <span className="text-xs text-emerald-600">Trusted device</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                      <span className="text-xs text-amber-600">Not trusted</span>
                                    </>
                                  )}
                                </div>
                                <Button
                                  size="xs"
                                  variant="destructive"
                                  className="text-xs"
                                  onClick={() => handleSignOutDevice(session.id)}
                                >
                                  <LogOut className="w-3 h-3 mr-1" /> Sign Out
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < otherSessions.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state after signing out all */}
        {otherSessions.length === 0 && (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-semibold text-slate-900">Only This Device</p>
              <p className="text-xs text-slate-500 mt-1">
                You&apos;re only logged in on this device. Your account is secure.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sign Out All Devices */}
        {otherSessions.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 sm:p-6">
              {!showSignOutAll ? (
                <Button
                  onClick={() => setShowSignOutAll(true)}
                  variant="destructive"
                  className="w-full h-11 rounded-xl font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out All Other Devices
                </Button>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900 mb-1">Sign Out All Other Devices?</p>
                  <p className="text-xs text-slate-500 mb-4">
                    This will sign out {otherSessions.length} device{otherSessions.length > 1 ? 's' : ''}. You&apos;ll stay logged in on this device only.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-xl"
                      onClick={() => setShowSignOutAll(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-10 rounded-xl"
                      onClick={handleSignOutAll}
                      disabled={signingOut}
                    >
                      {signingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Signing out...
                        </>
                      ) : (
                        'Confirm'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1D63FF]" />
              <CardTitle className="text-base">Security Notice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security to your account with 2FA.</p>
                  <Button size="xs" variant="outline" className="mt-2 text-xs">
                    Enable 2FA
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">Login Alerts</p>
                  <p className="text-xs text-slate-500">Get notified when a new device logs into your account.</p>
                  <Badge className="mt-1 bg-emerald-50 text-emerald-700 border-0 text-[10px]">Enabled</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Eye className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">Session Timeout</p>
                  <p className="text-xs text-slate-500">Automatically sign out after 30 days of inactivity.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Security events on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    event.type === 'login' ? 'bg-blue-500' :
                    event.type === 'warning' ? 'bg-amber-500' :
                    'bg-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{event.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400">{event.location}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{event.time}</span>
                    </div>
                  </div>
                  {event.type === 'warning' && (
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Info */}
        <div className="text-center pb-6">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
            <Info className="w-3 h-3" />
            <span>Sessions automatically expire after 30 days of inactivity</span>
          </div>
        </div>
      </div>
    </div>
  )
}

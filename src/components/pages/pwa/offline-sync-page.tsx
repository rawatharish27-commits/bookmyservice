'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUpDown,
  CalendarCheck,
  Star,
  MessageSquare,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  AlertTriangle,
  Loader2,
  CloudOff,
  Cloud,
  Database,
} from 'lucide-react'

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'conflict'

interface PendingAction {
  id: string
  type: 'booking' | 'review' | 'payment' | 'cancellation'
  title: string
  subtitle: string
  timestamp: string
  status: 'pending' | 'syncing' | 'failed' | 'conflict'
  retryCount: number
}

interface ConflictItem {
  id: string
  title: string
  localData: string
  serverData: string
  field: string
}

const mockPendingActions: PendingAction[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Book Water Tank Cleaning Service',
    subtitle: '3 BHK, Koramangala • ₹499',
    timestamp: '2 min ago',
    status: 'pending',
    retryCount: 0,
  },
  {
    id: '2',
    type: 'review',
    title: 'Submit Review for Rajesh K.',
    subtitle: 'Plumber Repair • ⭐ 4.5/5',
    timestamp: '15 min ago',
    status: 'failed',
    retryCount: 2,
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment for Air Conditioner',
    subtitle: 'Wallet payment • ₹499',
    timestamp: '28 min ago',
    status: 'syncing',
    retryCount: 0,
  },
  {
    id: '4',
    type: 'cancellation',
    title: 'Cancel Kitchen Appliances Booking',
    subtitle: 'Scheduled for Mar 8 • Refund ₹499',
    timestamp: '1 hr ago',
    status: 'conflict',
    retryCount: 1,
  },
  {
    id: '5',
    type: 'booking',
    title: 'Book Geyser Visit',
    subtitle: 'Door repair, HSR Layout • ₹499',
    timestamp: '2 hrs ago',
    status: 'pending',
    retryCount: 0,
  },
]

const mockConflicts: ConflictItem[] = [
  {
    id: 'c1',
    title: 'Kitchen Appliances Booking #BK-2847',
    localData: 'Cancelled',
    serverData: 'Provider already en route',
    field: 'Status',
  },
  {
    id: 'c2',
    title: 'Wallet Balance',
    localData: '₹4,500',
    serverData: '₹3,201',
    field: 'Amount',
  },
]

const syncHistory = [
  { time: '12:45 PM', status: 'synced' as const, items: 3, detail: '3 bookings synced' },
  { time: '12:30 PM', status: 'partial' as const, items: 2, detail: '2 of 4 items synced' },
  { time: '11:15 AM', status: 'failed' as const, items: 0, detail: 'Network timeout' },
  { time: '10:00 AM', status: 'synced' as const, items: 5, detail: 'All data synced' },
]

function getTypeIcon(type: PendingAction['type']) {
  switch (type) {
    case 'booking': return CalendarCheck
    case 'review': return Star
    case 'payment': return CreditCard
    case 'cancellation': return XCircle
  }
}

function getTypeColor(type: PendingAction['type']) {
  switch (type) {
    case 'booking': return { icon: 'text-[#1D63FF]', bg: 'bg-blue-50' }
    case 'review': return { icon: 'text-amber-600', bg: 'bg-amber-50' }
    case 'payment': return { icon: 'text-emerald-600', bg: 'bg-emerald-50' }
    case 'cancellation': return { icon: 'text-red-600', bg: 'bg-red-50' }
  }
}

function getStatusBadge(status: PendingAction['status']) {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="text-slate-500 border-slate-300 text-[10px]">Pending</Badge>
    case 'syncing': return <Badge className="bg-blue-50 text-[#1D63FF] border-0 text-[10px]"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Syncing</Badge>
    case 'failed': return <Badge variant="destructive" className="text-[10px]">Failed</Badge>
    case 'conflict': return <Badge className="bg-amber-50 text-amber-700 border-0 text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />Conflict</Badge>
  }
}

export function OfflineSyncPage() {
  const [isOnline, setIsOnline] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [expandedAction, setExpandedAction] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState(mockConflicts)

  const handleSyncNow = () => {
    if (syncing) return
    setSyncing(true)
    setSyncProgress(0)
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setSyncing(false)
          setIsOnline(true)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleResolveConflict = (id: string, resolution: 'local' | 'server') => {
    setConflicts(prev => prev.filter(c => c.id !== id))
  }

  const pendingCount = mockPendingActions.filter(a => a.status === 'pending').length
  const failedCount = mockPendingActions.filter(a => a.status === 'failed').length
  const conflictCount = conflicts.length

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Offline & Sync</h1>
              <p className="text-xs text-slate-500">Manage your offline data and sync status</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Sync Status Card */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isOnline ? 'bg-emerald-50' : syncing ? 'bg-blue-50' : 'bg-red-50'
                }`}>
                  {isOnline ? (
                    <Cloud className="w-6 h-6 text-emerald-600" />
                  ) : syncing ? (
                    <RefreshCw className="w-6 h-6 text-[#1D63FF] animate-spin" />
                  ) : (
                    <CloudOff className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {isOnline ? 'All Synced' : syncing ? 'Syncing...' : 'Offline Mode'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isOnline
                      ? 'Last synced: Just now'
                      : syncing
                      ? `Syncing ${syncProgress}%...`
                      : 'Connect to sync your data'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {(syncing || !isOnline) && (
              <div className="mb-4">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOnline ? 'bg-emerald-500' : 'bg-[#1D63FF]'
                    }`}
                    style={{ width: `${syncing ? syncProgress : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">
                    {syncing ? `${syncProgress}% complete` : 'Waiting for connection...'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {mockPendingActions.length} items in queue
                  </span>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
                <p className="text-[10px] text-slate-500">Pending</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-red-600">{failedCount}</p>
                <p className="text-[10px] text-slate-500">Failed</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-amber-600">{conflictCount}</p>
                <p className="text-[10px] text-slate-500">Conflicts</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoSync(!autoSync)}
                  className="flex items-center gap-2"
                >
                  {autoSync ? (
                    <ToggleRight className="w-8 h-8 text-[#1D63FF]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-700">Auto-sync</span>
                </button>
              </div>
              <Button
                onClick={handleSyncNow}
                disabled={syncing || isOnline}
                size="sm"
                className="bg-[#1D63FF] hover:bg-[#0B3D91]"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : isOnline ? 'Synced' : 'Sync Now'}
              </Button>
            </div>

            {!autoSync && (
              <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Auto-sync is off. You&apos;ll need to sync manually.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Actions Queue */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pending Actions</CardTitle>
              <Badge variant="outline" className="text-[10px]">{mockPendingActions.length} items</Badge>
            </div>
            <CardDescription>Actions queued for next sync</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {mockPendingActions.map((action) => {
                const Icon = getTypeIcon(action.type)
                const colors = getTypeColor(action.type)
                const isExpanded = expandedAction === action.id

                return (
                  <div key={action.id} className="rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <button
                      onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                      className="w-full flex items-center gap-3 p-3 text-left"
                    >
                      <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 truncate pr-2">{action.title}</p>
                          {getStatusBadge(action.status)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 truncate">{action.subtitle}</p>
                          <span className="text-[10px] text-slate-300">•</span>
                          <p className="text-[10px] text-slate-400">{action.timestamp}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Retry Count</span>
                            <span className="font-medium text-slate-700">{action.retryCount} / 5</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Status</span>
                            <span className="font-medium text-slate-700 capitalize">{action.status}</span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            {action.status === 'failed' && (
                              <Button size="xs" className="bg-[#1D63FF] hover:bg-[#0B3D91] text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" /> Retry
                              </Button>
                            )}
                            <Button size="xs" variant="outline" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Conflict Resolution */}
        {conflicts.length > 0 && (
          <Card className="bg-white rounded-xl shadow-sm border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base text-amber-800">Sync Conflicts</CardTitle>
              </div>
              <CardDescription>Resolve conflicts between local and server data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="bg-amber-50 rounded-xl p-4">
                    <p className="font-medium text-sm text-slate-900 mb-3">{conflict.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-medium">
                      Conflict: {conflict.field}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-[10px] text-[#1D63FF] font-medium mb-1">Your Version</p>
                        <p className="text-sm font-semibold text-slate-900">{conflict.localData}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-medium mb-1">Server Version</p>
                        <p className="text-sm font-semibold text-slate-900">{conflict.serverData}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#1D63FF] hover:bg-[#0B3D91] text-xs flex-1"
                        onClick={() => handleResolveConflict(conflict.id, 'local')}
                      >
                        Keep Mine
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1"
                        onClick={() => handleResolveConflict(conflict.id, 'server')}
                      >
                        Use Server
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Synced Info */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    entry.status === 'synced' ? 'bg-emerald-500' :
                    entry.status === 'partial' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{entry.detail}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">{entry.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#1D63FF]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Local Storage</p>
                <p className="text-xs text-slate-500">Offline data on this device</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Bookings Cache</span>
                  <span className="font-medium text-slate-700">12.4 MB</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Images & Media</span>
                  <span className="font-medium text-slate-700">24.8 MB</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">User Data</span>
                  <span className="font-medium text-slate-700">3.2 MB</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total: 40.4 MB / 100 MB</span>
              <Button size="xs" variant="outline" className="text-xs">
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

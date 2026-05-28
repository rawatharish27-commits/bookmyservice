'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { HardDrive, Plus, RotateCcw, Clock, Download, Database } from 'lucide-react'

const backups = [
  { id: 1, name: 'Daily Auto Backup', date: '22 May 2024 03:00 AM', size: '245 MB', type: 'Auto', status: 'Completed' },
  { id: 2, name: 'Daily Auto Backup', date: '21 May 2024 03:00 AM', size: '243 MB', type: 'Auto', status: 'Completed' },
  { id: 3, name: 'Pre-maintenance Backup', date: '20 May 2024 10:00 PM', size: '248 MB', type: 'Manual', status: 'Completed' },
  { id: 4, name: 'Daily Auto Backup', date: '20 May 2024 03:00 AM', size: '241 MB', type: 'Auto', status: 'Completed' },
  { id: 5, name: 'Daily Auto Backup', date: '19 May 2024 03:00 AM', size: '239 MB', type: 'Auto', status: 'Failed' },
]

export function AdminBackupPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Backup</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Create Backup</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Database className="size-5 text-[#1D63FF] mx-auto mb-1" /><p className="text-lg font-bold text-slate-900">245 MB</p><p className="text-xs text-slate-500">Latest Backup Size</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><Clock className="size-5 text-emerald-600 mx-auto mb-1" /><p className="text-lg font-bold text-emerald-600">Daily 3 AM</p><p className="text-xs text-slate-500">Auto Schedule</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><HardDrive className="size-5 text-purple-600 mx-auto mb-1" /><p className="text-lg font-bold text-slate-900">2.4 GB</p><p className="text-xs text-slate-500">Total Storage Used</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Backup History</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {backups.map((backup, i) => (
              <div key={backup.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50"><HardDrive className="size-5 text-[#1D63FF]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{backup.name}</p><Badge variant="secondary" className={backup.type === 'Auto' ? 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'}>{backup.type}</Badge></div>
                    <p className="text-xs text-slate-400">{backup.date} • {backup.size}</p>
                  </div>
                  <Badge variant="secondary" className={backup.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>{backup.status}</Badge>
                  {backup.status === 'Completed' && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7" title="Restore"><RotateCcw className="size-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-7" title="Download"><Download className="size-3" /></Button>
                    </div>
                  )}
                </div>
                {i < backups.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Backup Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-900">Automatic Daily Backup</p><p className="text-xs text-slate-400">Runs every day at 3:00 AM IST</p></div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Enabled</Badge>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-900">Retention Period</p><p className="text-xs text-slate-400">Backups older than 30 days are auto-deleted</p></div>
              <span className="text-sm text-slate-700">30 Days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

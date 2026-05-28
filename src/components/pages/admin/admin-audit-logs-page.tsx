'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollText, Search, Download, Filter, Clock, User } from 'lucide-react'

const auditLogs = [
  { id: 1, user: 'Super Admin', action: 'Updated system settings', category: 'Settings', ip: '192.168.1.1', date: '22 May 2024 14:30', severity: 'Info' },
  { id: 2, user: 'Rakesh Verma', action: 'Approved refund REF-200', category: 'Finance', ip: '192.168.1.2', date: '22 May 2024 13:15', severity: 'Info' },
  { id: 3, user: 'Sneha Reddy', action: 'Blocked user #2847', category: 'Security', ip: '192.168.1.3', date: '22 May 2024 11:45', severity: 'Warning' },
  { id: 4, user: 'System', action: 'Auto-logout after 3 failed attempts', category: 'Security', ip: '10.0.0.5', date: '22 May 2024 10:20', severity: 'Warning' },
  { id: 5, user: 'Super Admin', action: 'Created new admin: Amit Joshi', category: 'User Management', ip: '192.168.1.1', date: '21 May 2024 16:00', severity: 'Info' },
  { id: 6, user: 'System', action: 'Database backup completed', category: 'System', ip: '127.0.0.1', date: '21 May 2024 03:00', severity: 'Info' },
]

const severityColors: Record<string, string> = {
  Info: 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200',
  Warning: 'bg-amber-100 text-amber-700 border-amber-200',
  Critical: 'bg-red-100 text-red-700 border-red-200',
}

export function AdminAuditLogsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input placeholder="Search logs..." className="pl-10 rounded-xl" /></div>
          <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Filter className="size-4" /> Filter</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden lg:table-cell">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Date</th>
                </tr></thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><User className="size-3.5 text-slate-400" /><span className="text-sm text-slate-700">{log.user}</span></div></td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate">{log.action}</td>
                      <td className="px-4 py-3 hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{log.category}</Badge></td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono hidden lg:table-cell">{log.ip}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={severityColors[log.severity]}>{log.severity}</Badge></td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell whitespace-nowrap">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

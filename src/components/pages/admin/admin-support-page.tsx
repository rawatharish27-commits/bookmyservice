'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Headphones, User, ArrowUp, Eye } from 'lucide-react'

const tickets = [
  { id: 'TK-201', subject: 'Refund not processed', user: 'Rahul Sharma', date: '22 May 2024', priority: 'High', status: 'Open', assignee: 'Sneha Reddy' },
  { id: 'TK-200', subject: 'Provider dispute on booking', user: 'Cool Care Services', date: '21 May 2024', priority: 'Medium', status: 'In Progress', assignee: 'Rakesh Verma' },
  { id: 'TK-199', subject: 'Payment failed but money deducted', user: 'Priya Patel', date: '20 May 2024', priority: 'High', status: 'Open', assignee: 'Unassigned' },
  { id: 'TK-198', subject: 'Cannot add service', user: 'HomePro Services', date: '19 May 2024', priority: 'Low', status: 'Resolved', assignee: 'Sneha Reddy' },
]

const priorityColors: Record<string, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200',
}

const statusColors: Record<string, string> = {
  Open: 'bg-red-100 text-red-700 border-red-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export function AdminSupportPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <Badge className="bg-red-100 text-red-700 border-red-200">{tickets.filter(t => t.status === 'Open').length} Open</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-red-600">{tickets.filter(t => t.status === 'Open').length}</p><p className="text-xs text-slate-500">Open Tickets</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-amber-600">{tickets.filter(t => t.status === 'In Progress').length}</p><p className="text-xs text-slate-500">In Progress</p></CardContent></Card>
          <Card className="bg-white rounded-xl"><CardContent className="p-4 text-center"><p className="text-lg font-bold text-emerald-600">{tickets.filter(t => t.status === 'Resolved').length}</p><p className="text-xs text-slate-500">Resolved</p></CardContent></Card>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Assignee</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{t.subject}</p><p className="text-xs text-slate-400">{t.id} • {t.user} • {t.date}</p></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="secondary" className={priorityColors[t.priority]}>{t.priority}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={statusColors[t.status]}>{t.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden md:table-cell">{t.assignee}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7"><User className="size-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7"><ArrowUp className="size-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button>
                        </div>
                      </td>
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

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Shield, MoreVertical } from 'lucide-react'

const admins = [
  { id: 1, name: 'Super Admin', email: 'admin@bookmyservice.com', role: 'Super Admin', lastLogin: '22 May 2024', status: 'Active' },
  { id: 2, name: 'Rakesh Verma', email: 'rakesh@bookmyservice.com', role: 'Manager', lastLogin: '21 May 2024', status: 'Active' },
  { id: 3, name: 'Sneha Reddy', email: 'sneha@bookmyservice.com', role: 'Support Lead', lastLogin: '20 May 2024', status: 'Active' },
  { id: 4, name: 'Amit Joshi', email: 'amit@bookmyservice.com', role: 'Support Agent', lastLogin: '15 May 2024', status: 'Inactive' },
]

export function AdminAdminsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Add Admin</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search admins..." className="pl-10 rounded-xl" />
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#1D63FF]/10 text-xs font-bold text-[#1D63FF]">{a.name.charAt(0)}</div>
                          <div><p className="text-sm font-medium text-slate-700">{a.name}</p><p className="text-xs text-slate-400">{a.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="secondary" className={a.role === 'Super Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200'}>{a.role}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{a.lastLogin}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className={a.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>{a.status}</Badge></td>
                      <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-7"><MoreVertical className="size-4 text-slate-400" /></Button></td>
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

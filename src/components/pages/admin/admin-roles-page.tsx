'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Shield, Edit2, Trash2 } from 'lucide-react'

const roles = [
  { id: 1, name: 'Super Admin', description: 'Full access to all features and settings', users: 1, permissions: 42 },
  { id: 2, name: 'Manager', description: 'Access to management features, limited settings', users: 2, permissions: 28 },
  { id: 3, name: 'Support Lead', description: 'Access to support and communication tools', users: 1, permissions: 18 },
  { id: 4, name: 'Support Agent', description: 'Basic support access only', users: 3, permissions: 12 },
  { id: 5, name: 'Viewer', description: 'Read-only access to dashboards', users: 5, permissions: 6 },
]

const permissionCategories = [
  { category: 'Dashboard', permissions: ['View Dashboard', 'Export Data'] },
  { category: 'Users', permissions: ['View Users', 'Edit Users', 'Delete Users', 'Create Users'] },
  { category: 'Bookings', permissions: ['View Bookings', 'Edit Bookings', 'Cancel Bookings', 'Refund Bookings'] },
  { category: 'Finance', permissions: ['View Payments', 'Process Refunds', 'View Wallets'] },
  { category: 'Settings', permissions: ['View Settings', 'Edit Settings', 'Manage Roles'] },
]

export function AdminRolesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl"><Plus className="size-4" /> Add Role</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden sm:table-cell">Users</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 hidden md:table-cell">Permissions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{role.name}</p><p className="text-xs text-slate-400">{role.description}</p></td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden sm:table-cell">{role.users}</td>
                      <td className="px-4 py-3 hidden md:table-cell"><Badge variant="secondary" className="bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200">{role.permissions} permissions</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7"><Edit2 className="size-3" /></Button>
                          {role.name !== 'Super Admin' && <Button variant="ghost" size="sm" className="h-7 text-red-500"><Trash2 className="size-3" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Shield className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Permissions Matrix</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {permissionCategories.map((cat, i) => (
              <div key={cat.category}>
                <div className="py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-2">{cat.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.permissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">{perm}</Badge>
                    ))}
                  </div>
                </div>
                {i < permissionCategories.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

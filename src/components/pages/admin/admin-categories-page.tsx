'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Edit2, GripVertical, LayoutGrid } from 'lucide-react'

const categories = [
  { id: 1, name: 'Air Conditioner', services: 45, icon: '❄️', active: true, order: 1 },
  { id: 2, name: 'Water Tank Cleaning', services: 38, icon: '💧', active: true, order: 2 },
  { id: 3, name: 'Plumber', services: 24, icon: '🔧', active: true, order: 3 },
  { id: 4, name: 'Electrician', services: 20, icon: '⚡', active: true, order: 4 },
  { id: 5, name: 'Geyser', services: 12, icon: '🔥', active: true, order: 5 },
  { id: 6, name: 'Movers and Packers', services: 8, icon: '📦', active: false, order: 6 },
]

export function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <Button size="sm" className="gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl"><Plus className="size-4" /> Add Category</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="bg-white rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-slate-50 text-2xl">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{cat.name}</p>
                      <Badge variant="secondary" className={`text-[9px] ${cat.active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.services} services</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1 rounded-lg"><Edit2 className="size-3" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs"><GripVertical className="size-3 text-slate-400" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

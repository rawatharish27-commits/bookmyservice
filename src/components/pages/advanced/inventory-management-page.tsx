'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Boxes,
  RefreshCw,
  Download,
} from 'lucide-react'

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

interface InventoryItem {
  id: number
  name: string
  category: string
  sku: string
  currentStock: number
  maxStock: number
  reorderPoint: number
  unitPrice: string
  totalValue: string
  status: StockStatus
  lastRestocked: string
  supplier: string
}

const inventoryItems: InventoryItem[] = [
  { id: 1, name: 'Cleaning Solution (5L)', category: 'Cleaning', sku: 'CLN-001', currentStock: 145, maxStock: 200, reorderPoint: 50, unitPrice: '₹320', totalValue: '₹46,400', status: 'In Stock', lastRestocked: '10 Mar 2025', supplier: 'CleanPro Supplies' },
  { id: 2, name: 'AC Gas R32 (1kg)', category: 'AC & HVAC', sku: 'AC-001', currentStock: 28, maxStock: 100, reorderPoint: 30, unitPrice: '₹850', totalValue: '₹23,800', status: 'Low Stock', lastRestocked: '05 Mar 2025', supplier: 'CoolTech India' },
  { id: 3, name: 'Paint Roller Set', category: 'Painting', sku: 'PNT-001', currentStock: 67, maxStock: 150, reorderPoint: 40, unitPrice: '₹180', totalValue: '₹12,060', status: 'In Stock', lastRestocked: '12 Mar 2025', supplier: 'PaintMaster Co.' },
  { id: 4, name: 'PVC Pipe 1-inch (10m)', category: 'Plumbing', sku: 'PLM-001', currentStock: 0, maxStock: 80, reorderPoint: 25, unitPrice: '₹450', totalValue: '₹0', status: 'Out of Stock', lastRestocked: '20 Feb 2025', supplier: 'PipeFix Wholesale' },
  { id: 5, name: 'Facial Kit (Premium)', category: 'Beauty', sku: 'BTY-001', currentStock: 42, maxStock: 100, reorderPoint: 35, unitPrice: '₹560', totalValue: '₹23,520', status: 'In Stock', lastRestocked: '08 Mar 2025', supplier: 'GlowUp Beauty Supply' },
  { id: 6, name: 'Wire Cable 2.5mm (100m)', category: 'Electrical', sku: 'ELC-001', currentStock: 15, maxStock: 60, reorderPoint: 20, unitPrice: '₹2,800', totalValue: '₹42,000', status: 'Low Stock', lastRestocked: '01 Mar 2025', supplier: 'WireMaster Electric' },
  { id: 7, name: 'Disinfectant Spray (1L)', category: 'Cleaning', sku: 'CLN-002', currentStock: 180, maxStock: 250, reorderPoint: 60, unitPrice: '₹280', totalValue: '₹50,400', status: 'In Stock', lastRestocked: '11 Mar 2025', supplier: 'CleanPro Supplies' },
  { id: 8, name: 'AC Filter (Universal)', category: 'AC & HVAC', sku: 'AC-002', currentStock: 5, maxStock: 50, reorderPoint: 15, unitPrice: '₹220', totalValue: '₹1,100', status: 'Low Stock', lastRestocked: '25 Feb 2025', supplier: 'CoolTech India' },
  { id: 9, name: 'Wall Primer (20L)', category: 'Painting', sku: 'PNT-002', currentStock: 0, maxStock: 40, reorderPoint: 12, unitPrice: '₹1,850', totalValue: '₹0', status: 'Out of Stock', lastRestocked: '15 Feb 2025', supplier: 'PaintMaster Co.' },
  { id: 10, name: 'Pipe Wrench (12 inch)', category: 'Plumbing', sku: 'PLM-002', currentStock: 38, maxStock: 60, reorderPoint: 20, unitPrice: '₹650', totalValue: '₹24,700', status: 'In Stock', lastRestocked: '07 Mar 2025', supplier: 'PipeFix Wholesale' },
]

const categories = ['All', 'Cleaning', 'AC & HVAC', 'Painting', 'Plumbing', 'Beauty', 'Electrical']

const summaryStats = [
  { label: 'Total Items', value: '156', icon: Package, color: 'bg-blue-100 text-blue-600' },
  { label: 'In Stock', value: '118', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Low Stock', value: '24', icon: AlertTriangle, color: 'bg-amber-100 text-amber-600' },
  { label: 'Out of Stock', value: '14', icon: XCircle, color: 'bg-red-100 text-red-600' },
  { label: 'Total Value', value: '₹12,45,000', icon: IndianRupee, color: 'bg-purple-100 text-purple-600' },
]

export function InventoryManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeTab === 'All' || item.category === activeTab
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventoryItems.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock')

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track stock levels and supplies</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1 rounded-xl bg-blue-600 hover:bg-blue-700"><Plus className="size-4" /> Add Item</Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {summaryStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${stat.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="bg-amber-50 border-amber-200 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="size-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Low Stock Alerts</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">{lowStockItems.length} items</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-amber-200">
                    <span className="text-xs font-medium text-slate-700">{item.name}</span>
                    <Badge variant="secondary" className={`text-[10px] ${
                      item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'Low Stock' ? `${item.currentStock} left` : 'Out of Stock'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search items by name, SKU..."
              className="pl-9 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white rounded-xl h-auto p-1 flex-wrap">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="rounded-lg text-xs">
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-1 text-[10px] text-slate-400">
                      ({inventoryItems.filter(i => i.category === cat).length})
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Inventory Table */}
        <Card className="bg-white rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Item</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">SKU</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Stock Level</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Unit Price</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Total Value</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Reorder</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const stockPercent = (item.currentStock / item.maxStock) * 100
                    return (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.supplier}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.sku}</td>
                        <td className="py-3 px-4">
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-700">{item.currentStock}</span>
                              <span className="text-xs text-slate-400">/ {item.maxStock}</span>
                            </div>
                            <Progress
                              value={stockPercent}
                              className={`h-2 ${item.status === 'Out of Stock' ? '[&>div]:bg-red-500' : item.status === 'Low Stock' ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary" className={`text-[10px] ${
                            item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                            item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">{item.unitPrice}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">{item.totalValue}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs text-slate-500">{item.reorderPoint}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 rounded-lg" disabled={item.status === 'In Stock'}>
                            <ShoppingCart className="size-3" />
                            Reorder
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

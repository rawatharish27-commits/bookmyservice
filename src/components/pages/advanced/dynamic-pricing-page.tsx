'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  DollarSign,
  Clock,
  TrendingUp,
  MapPin,
  Zap,
  Sun,
  Moon,
  CloudRain,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  Activity,
  Map,
  Download,
} from 'lucide-react'

type PricingType = 'time-based' | 'demand-based' | 'location-based'

interface PricingRule {
  id: number
  name: string
  type: PricingType
  service: string
  multiplier: string
  condition: string
  active: boolean
  impact: string
  lastModified: string
}

const pricingRules: PricingRule[] = [
  { id: 1, name: 'Weekend Rush Pricing', type: 'time-based', service: 'All Services', multiplier: '1.3x', condition: 'Sat-Sun, 9AM-6PM', active: true, impact: '+₹2.4L/mo', lastModified: '10 Mar 2025' },
  { id: 2, name: 'Late Night Surcharge', type: 'time-based', service: 'All Services', multiplier: '1.5x', condition: 'After 9PM', active: true, impact: '+₹1.8L/mo', lastModified: '08 Mar 2025' },
  { id: 3, name: 'Early Bird Discount', type: 'time-based', service: 'Water Tank Cleaning', multiplier: '0.85x', condition: 'Mon-Fri, 8AM-11AM', active: true, impact: '-₹0.6L/mo', lastModified: '05 Mar 2025' },
  { id: 4, name: 'Festival Demand Surge', type: 'demand-based', service: 'All Services', multiplier: '1.4x', condition: 'Booking volume > 80%', active: true, impact: '+₹3.2L/mo', lastModified: '12 Mar 2025' },
  { id: 5, name: 'Monsoon Premium', type: 'demand-based', service: 'Plumber, Water Purifier', multiplier: '1.25x', condition: 'Jul-Sep (Monsoon)', active: false, impact: '+₹1.5L/mo', lastModified: '01 Mar 2025' },
  { id: 6, name: 'Summer AC Surge', type: 'demand-based', service: 'Air Conditioner', multiplier: '1.35x', condition: 'Apr-Jun (Summer)', active: true, impact: '+₹4.1L/mo', lastModified: '15 Mar 2025' },
  { id: 7, name: 'Metro City Premium', type: 'location-based', service: 'All Services', multiplier: '1.2x', condition: 'Mumbai, Delhi, Bengaluru', active: true, impact: '+₹5.8L/mo', lastModified: '10 Mar 2025' },
  { id: 8, name: 'Tier-2 City Discount', type: 'location-based', service: 'All Services', multiplier: '0.9x', condition: 'Indore, Jaipur, Kochi', active: true, impact: '-₹1.2L/mo', lastModified: '08 Mar 2025' },
  { id: 9, name: 'Premium Locality', type: 'location-based', service: 'Electrician', multiplier: '1.15x', condition: 'South Delhi, Bandra, Jubilee Hills', active: false, impact: '+₹0.8L/mo', lastModified: '02 Mar 2025' },
]

const multiplierCards = [
  { label: 'Peak Hours', multiplier: '1.5x', icon: Sun, color: 'bg-amber-100 text-amber-600', services: 45, bookings: 234 },
  { label: 'Off-Peak', multiplier: '0.85x', icon: Moon, color: 'bg-indigo-100 text-indigo-600', services: 32, bookings: 156 },
  { label: 'High Demand', multiplier: '1.4x', icon: TrendingUp, color: 'bg-red-100 text-red-600', services: 28, bookings: 189 },
  { label: 'Weekend', multiplier: '1.3x', icon: Calendar, color: 'bg-purple-100 text-purple-600', services: 50, bookings: 312 },
]

const zonePricing = [
  { zone: 'South Mumbai', city: 'Mumbai', multiplier: '1.25x', avgPrice: '₹499', bookings: 456 },
  { zone: 'Koramangala', city: 'Bengaluru', multiplier: '1.15x', avgPrice: '₹449', bookings: 389 },
  { zone: 'Connaught Place', city: 'Delhi', multiplier: '1.2x', avgPrice: '₹499', bookings: 342 },
  { zone: 'Hinjewadi', city: 'Pune', multiplier: '1.0x', avgPrice: '₹349', bookings: 267 },
  { zone: 'T. Nagar', city: 'Chennai', multiplier: '1.05x', avgPrice: '₹399', bookings: 198 },
  { zone: 'Salt Lake', city: 'Kolkata', multiplier: '0.95x', avgPrice: '₹299', bookings: 145 },
  { zone: 'Jubilee Hills', city: 'Hyderabad', multiplier: '1.1x', avgPrice: '₹449', bookings: 234 },
  { zone: 'Vijay Nagar', city: 'Indore', multiplier: '0.85x', avgPrice: '₹249', bookings: 112 },
]

const typeConfig: Record<PricingType, { label: string; color: string; icon: React.ReactNode }> = {
  'time-based': { label: 'Time-Based', color: 'bg-blue-50 text-[#0B3D91]', icon: <Clock className="size-3" /> },
  'demand-based': { label: 'Demand-Based', color: 'bg-red-50 text-red-700', icon: <Activity className="size-3" /> },
  'location-based': { label: 'Location-Based', color: 'bg-emerald-50 text-emerald-700', icon: <MapPin className="size-3" /> },
}

export function DynamicPricingPage() {
  const [rules, setRules] = useState(pricingRules)

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic Pricing</h1>
            <p className="text-sm text-slate-500 mt-1">Configure and manage pricing rules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1 rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91] text-white"><Plus className="size-4" /> Add Rule</Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#1D63FF]/10 text-[#1D63FF]">
                  <Settings className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Active Rules</p>
                  <p className="text-lg font-bold text-slate-900">{rules.filter(r => r.active).length}/{rules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Revenue Impact</p>
                  <p className="text-lg font-bold text-slate-900">+₹17.8L</p>
                </div>
              </div>
              <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><ArrowUpRight className="size-3" />+24% vs static</span>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Multiplier</p>
                  <p className="text-lg font-bold text-slate-900">1.18x</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Booking Impact</p>
                  <p className="text-lg font-bold text-slate-900">-3.2%</p>
                </div>
              </div>
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><ArrowDownRight className="size-3" />slight dip</span>
            </CardContent>
          </Card>
        </div>

        {/* Price Multiplier Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {multiplierCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${card.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">{card.multiplier}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{card.label}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{card.services} services</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{card.bookings} bookings</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pricing Rules Table */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Pricing Rules</CardTitle>
              <Badge variant="secondary" className="text-[10px] bg-slate-50">{rules.filter(r => r.active).length} active</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Rule Name</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Service</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Multiplier</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Condition</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Impact</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{rule.name}</p>
                        <p className="text-[10px] text-slate-400">Modified: {rule.lastModified}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className={`text-[10px] gap-1 ${typeConfig[rule.type].color}`}>
                          {typeConfig[rule.type].icon} {typeConfig[rule.type].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{rule.service}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${
                          parseFloat(rule.multiplier) > 1 ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {rule.multiplier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{rule.condition}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-xs font-medium ${rule.impact.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                          {rule.impact}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className="inline-flex items-center gap-1"
                        >
                          {rule.active ? (
                            <div className="flex items-center gap-1.5">
                              <ToggleRight className="size-6 text-emerald-500" />
                              <span className="text-[10px] text-emerald-600">On</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <ToggleLeft className="size-6 text-slate-400" />
                              <span className="text-[10px] text-slate-400">Off</span>
                            </div>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Zone-based Pricing Map Placeholder */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Map className="size-4 text-[#1D63FF]" />
              <CardTitle className="text-sm font-semibold text-slate-900">Zone-Based Pricing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map Placeholder */}
            <div className="h-48 bg-gradient-to-br from-blue-50 to-slate-100 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
              <div className="text-center">
                <Map className="size-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Interactive Map View</p>
                <p className="text-xs text-slate-300">Zone pricing visualization</p>
              </div>
            </div>

            {/* Zone List */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 text-xs font-medium text-slate-500">Zone</th>
                    <th className="text-left py-2 text-xs font-medium text-slate-500">City</th>
                    <th className="text-center py-2 text-xs font-medium text-slate-500">Multiplier</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-500">Avg Price</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-500">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {zonePricing.map((zone) => (
                    <tr key={zone.zone} className="border-b border-slate-50">
                      <td className="py-2.5 font-medium text-slate-800">{zone.zone}</td>
                      <td className="py-2.5 text-slate-600">{zone.city}</td>
                      <td className="py-2.5 text-center">
                        <Badge variant="secondary" className={`text-[10px] ${
                          parseFloat(zone.multiplier) > 1.1 ? 'bg-red-50 text-red-700' :
                          parseFloat(zone.multiplier) < 0.95 ? 'bg-emerald-50 text-emerald-700' :
                          'bg-slate-50 text-slate-700'
                        }`}>
                          {zone.multiplier}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">{zone.avgPrice}</td>
                      <td className="py-2.5 text-right text-slate-600">{zone.bookings}</td>
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

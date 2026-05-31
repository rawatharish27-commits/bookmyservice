'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Brain,
  Clock,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Settings,
  TestTube,
  ToggleLeft,
  ToggleRight,
  Lightbulb,
  CalendarCheck,
  Star,
  Zap,
  RefreshCw,
  Download,
  Eye,
  MousePointerClick,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react'

type RecommendationType = 'service' | 'provider' | 'timeslot'

interface RecommendationConfig {
  id: number
  name: string
  type: RecommendationType
  description: string
  active: boolean
  priority: number
  ctr: number
  conversion: number
  impressions: number
}

const recommendationConfigs: RecommendationConfig[] = [
  { id: 1, name: 'Frequently Booked Together', type: 'service', description: 'Suggest services commonly booked together (e.g., Air Conditioner + Water Tank Cleaning)', active: true, priority: 1, ctr: 18.5, conversion: 8.2, impressions: 45230 },
  { id: 2, name: 'Seasonal Services', type: 'service', description: 'Recommend services based on current season (AC in summer, Plumber in monsoon)', active: true, priority: 2, ctr: 22.3, conversion: 11.5, impressions: 38450 },
  { id: 3, name: 'Top-Rated Provider', type: 'provider', description: 'Recommend highest-rated providers in the customer\'s area', active: true, priority: 1, ctr: 24.7, conversion: 14.8, impressions: 52340 },
  { id: 4, name: 'Previous Provider', type: 'provider', description: 'Suggest providers the customer has booked before', active: true, priority: 3, ctr: 32.1, conversion: 22.4, impressions: 28900 },
  { id: 5, name: 'Nearest Available', type: 'provider', description: 'Recommend closest available provider for faster service', active: false, priority: 4, ctr: 15.8, conversion: 6.9, impressions: 41200 },
  { id: 6, name: 'Off-Peak Slots', type: 'timeslot', description: 'Suggest less busy time slots with discount incentive', active: true, priority: 2, ctr: 19.2, conversion: 9.8, impressions: 32100 },
  { id: 7, name: 'Preferred Time', type: 'timeslot', description: 'Recommend time slots based on customer\'s booking history', active: true, priority: 1, ctr: 28.4, conversion: 18.6, impressions: 25600 },
  { id: 8, name: 'Weekend Specials', type: 'timeslot', description: 'Highlight weekend availability with premium providers', active: false, priority: 5, ctr: 12.4, conversion: 5.3, impressions: 18700 },
]

const performanceMetrics = [
  { label: 'Avg CTR', value: '21.7%', change: '+3.2%', icon: MousePointerClick, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  { label: 'Conversion Rate', value: '12.2%', change: '+2.1%', icon: Target, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Revenue Impact', value: '₹8.4L', change: '+28%', icon: IndianRupee, color: 'bg-amber-100 text-amber-600' },
  { label: 'Active Rules', value: '6/8', change: '+1', icon: Settings, color: 'bg-purple-100 text-purple-600' },
]

const abTests = [
  { id: 1, name: 'Service Card Layout', variant: 'Grid vs List', status: 'Running', controlCTR: 18.2, variantCTR: 21.5, winner: 'variant', startDate: '01 Mar 2025', confidence: 92 },
  { id: 2, name: 'Provider Photo Size', variant: 'Large vs Small', status: 'Running', controlCTR: 22.1, variantCTR: 20.8, winner: 'control', startDate: '05 Mar 2025', confidence: 78 },
  { id: 3, name: 'Time Slot Display', variant: 'Timeline vs Grid', status: 'Completed', controlCTR: 16.5, variantCTR: 24.3, winner: 'variant', startDate: '15 Feb 2025', confidence: 95 },
  { id: 4, name: 'Price Anchor Text', variant: '"Popular" vs "Recommended"', status: 'Running', controlCTR: 19.8, variantCTR: 23.1, winner: 'variant', startDate: '08 Mar 2025', confidence: 65 },
]

const typeConfig: Record<RecommendationType, { label: string; color: string; icon: React.ReactNode }> = {
  'service': { label: 'Service', color: 'bg-blue-50 text-[#0B3D91]', icon: <Sparkles className="size-3" /> },
  'provider': { label: 'Provider', color: 'bg-emerald-50 text-emerald-700', icon: <Users className="size-3" /> },
  'timeslot': { label: 'Time Slot', color: 'bg-purple-50 text-purple-700', icon: <Clock className="size-3" /> },
}

export function RecommendationEnginePage() {
  const [configs, setConfigs] = useState(recommendationConfigs)

  const toggleConfig = (id: number) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Recommendation Engine</h1>
            <p className="text-sm text-slate-500 mt-1">AI-powered recommendation settings and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><RefreshCw className="size-4" /> Retrain</Button>
            <Button size="sm" className="gap-1 rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91] text-white"><Brain className="size-4" /> New Rule</Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${metric.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{metric.label}</p>
                      <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="size-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">{metric.change}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="rules">
          <TabsList className="bg-white rounded-xl h-auto p-1">
            <TabsTrigger value="rules" className="rounded-lg text-xs">Recommendation Rules</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-lg text-xs">Performance</TabsTrigger>
            <TabsTrigger value="ab" className="rounded-lg text-xs">A/B Testing</TabsTrigger>
          </TabsList>

          {/* Recommendation Rules Tab */}
          <TabsContent value="rules" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map((config) => (
                <Card key={config.id} className={`bg-white rounded-xl ${!config.active ? 'opacity-70' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[10px] gap-1 ${typeConfig[config.type].color}`}>
                          {typeConfig[config.type].icon} {typeConfig[config.type].label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] bg-slate-50">Priority {config.priority}</Badge>
                      </div>
                      <button onClick={() => toggleConfig(config.id)} className="shrink-0">
                        {config.active ? (
                          <div className="flex items-center gap-1">
                            <ToggleRight className="size-6 text-emerald-500" />
                            <span className="text-[10px] text-emerald-600">On</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <ToggleLeft className="size-6 text-slate-400" />
                            <span className="text-[10px] text-slate-400">Off</span>
                          </div>
                        )}
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{config.name}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{config.description}</p>

                    <Separator className="bg-slate-100 mb-3" />

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg bg-slate-50">
                        <p className="text-xs font-bold text-slate-900">{config.ctr}%</p>
                        <p className="text-[10px] text-slate-400">CTR</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-slate-50">
                        <p className="text-xs font-bold text-slate-900">{config.conversion}%</p>
                        <p className="text-[10px] text-slate-400">Conversion</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-slate-50">
                        <p className="text-xs font-bold text-slate-900">{(config.impressions / 1000).toFixed(1)}k</p>
                        <p className="text-[10px] text-slate-400">Views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CTR by Type */}
              <Card className="bg-white rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">CTR by Recommendation Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['service', 'provider', 'timeslot'] as RecommendationType[]).map((type) => {
                    const typeConfigs = configs.filter(c => c.type === type && c.active)
                    const avgCTR = typeConfigs.length > 0
                      ? typeConfigs.reduce((sum, c) => sum + c.ctr, 0) / typeConfigs.length
                      : 0
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] gap-1 ${typeConfig[type].color}`}>
                              {typeConfig[type].icon} {typeConfig[type].label}
                            </Badge>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{avgCTR.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              type === 'service' ? 'bg-blue-500' : type === 'provider' ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${(avgCTR / 35) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Conversion by Type */}
              <Card className="bg-white rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">Conversion Rate by Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['service', 'provider', 'timeslot'] as RecommendationType[]).map((type) => {
                    const typeConfigs = configs.filter(c => c.type === type && c.active)
                    const avgConversion = typeConfigs.length > 0
                      ? typeConfigs.reduce((sum, c) => sum + c.conversion, 0) / typeConfigs.length
                      : 0
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] gap-1 ${typeConfig[type].color}`}>
                              {typeConfig[type].icon} {typeConfig[type].label}
                            </Badge>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{avgConversion.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              type === 'service' ? 'bg-blue-500' : type === 'provider' ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${(avgConversion / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Top Performing Rules */}
              <Card className="bg-white rounded-xl lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">Top Performing Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[...configs].sort((a, b) => b.conversion - a.conversion).slice(0, 5).map((config, i) => (
                    <div key={config.id}>
                      <div className="flex items-center gap-4 py-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1D63FF]">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{config.name}</p>
                          <Badge variant="secondary" className={`text-[10px] gap-1 mt-1 ${typeConfig[config.type].color}`}>
                            {typeConfig[config.type].icon} {typeConfig[config.type].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">{config.ctr}%</p>
                            <p className="text-[10px] text-slate-400">CTR</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-600">{config.conversion}%</p>
                            <p className="text-[10px] text-slate-400">Conv.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">{(config.impressions / 1000).toFixed(1)}k</p>
                            <p className="text-[10px] text-slate-400">Views</p>
                          </div>
                        </div>
                      </div>
                      {i < 4 && <Separator className="bg-slate-100" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="ab" className="mt-4">
            <div className="space-y-4">
              {abTests.map((test) => (
                <Card key={test.id} className="bg-white rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TestTube className="size-4 text-[#1D63FF]" />
                          <h3 className="text-sm font-semibold text-slate-900">{test.name}</h3>
                        </div>
                        <p className="text-xs text-slate-500">Variant: {test.variant} • Started {test.startDate}</p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] w-fit ${
                        test.status === 'Running' ? 'bg-blue-50 text-[#0B3D91]' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {test.status === 'Running' ? <Zap className="size-3 mr-1" /> : <CheckCircle2 className="size-3 mr-1" />}
                        {test.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-500 mb-1">Control CTR</p>
                        <p className="text-lg font-bold text-slate-900">{test.controlCTR}%</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-500 mb-1">Variant CTR</p>
                        <p className="text-lg font-bold text-slate-900">{test.variantCTR}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <Progress value={test.confidence} className="h-2 w-24" />
                        <span className="text-xs font-medium text-slate-700">{test.confidence}%</span>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${
                        test.winner === 'variant' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#0B3D91]'
                      }`}>
                        {test.winner === 'variant' ? '↑ Variant Leading' : '↑ Control Leading'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

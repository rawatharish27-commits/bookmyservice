'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  IndianRupee,
  Users,
  Clock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  MapPin,
  Zap,
  Target,
  RefreshCw,
  ChevronRight,
  Star,
  Activity,
  Layers,
  DollarSign,
  UserPlus,
  Wrench,
  Calendar,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from 'lucide-react'

type SuggestionCategory = 'pricing' | 'expansion' | 'allocation' | 'optimization'

interface Suggestion {
  id: number
  title: string
  description: string
  category: SuggestionCategory
  confidence: number
  impact: string
  effort: 'Low' | 'Medium' | 'High'
  status: 'new' | 'accepted' | 'dismissed'
  metric: string
  metricChange: string
  metricDirection: 'up' | 'down'
  details: string[]
}

const suggestions: Suggestion[] = [
  {
    id: 1, title: 'Increase AC Service Pricing by 15%', description: 'Demand for AC services has increased 45% in the last 2 weeks. Current pricing is 20% below market average for your top metro cities.',
    category: 'pricing', confidence: 92, impact: '₹4.2L/mo', effort: 'Low', status: 'new',
    metric: 'Revenue', metricChange: '+15%', metricDirection: 'up',
    details: ['Mumbai AC bookings up 52%', 'Delhi AC bookings up 38%', 'Current avg price ₹2,800 vs market ₹3,400', 'Premium time slots fully booked']
  },
  {
    id: 2, title: 'Expand to Whitefield, Bengaluru', description: 'High demand area with 3,400+ monthly searches and zero active providers. Estimated 120+ bookings/month potential.',
    category: 'expansion', confidence: 87, impact: '₹2.8L/mo', effort: 'Medium', status: 'new',
    metric: 'New Customers', metricChange: '+340', metricDirection: 'up',
    details: ['3,400 monthly service searches', 'Nearest provider 12km away', 'Average wait time: 4.2 hrs', 'IT corridor with high disposable income']
  },
  {
    id: 3, title: 'Reallocate 3 Providers to Hinjewadi', description: 'Hinjewadi branch has 23% more bookings than capacity. Koramangala has 15% spare capacity. Rebalancing can reduce wait times by 40%.',
    category: 'allocation', confidence: 89, impact: '₹1.5L/mo', effort: 'Low', status: 'new',
    metric: 'Wait Time', metricChange: '-40%', metricDirection: 'down',
    details: ['Hinjewadi: 89% utilization, avg wait 2.3hrs', 'Koramangala: 74% utilization, avg wait 45min', '3 plumbing providers available for transfer', 'Similar service profiles match']
  },
  {
    id: 4, title: 'Launch Weekend Deep Cleaning Package', description: 'Analysis shows 68% of deep cleaning bookings happen on weekends. A bundled package with 10% discount can increase conversion by 25%.',
    category: 'expansion', confidence: 78, impact: '₹1.8L/mo', effort: 'Medium', status: 'new',
    metric: 'Conversion', metricChange: '+25%', metricDirection: 'up',
    details: ['68% weekend booking concentration', 'Average basket size: ₹3,500', 'Bundle: Deep Clean + Kitchen Clean', 'Target: 2BHK/3BHK apartments']
  },
  {
    id: 5, title: 'Reduce Plumber Response Time in Pune', description: 'Average plumber response time in Pune is 3.2 hours vs 1.8 hours national average. Adding 2 on-call plumbers can reduce to 1.5 hours.',
    category: 'optimization', confidence: 94, impact: '₹0.8L/mo', effort: 'Low', status: 'new',
    metric: 'Response Time', metricChange: '-53%', metricDirection: 'down',
    details: ['Current avg: 3.2 hrs', 'National avg: 1.8 hrs', '6 active plumbers in Pune', 'Peak demand: 10AM-2PM weekdays']
  },
  {
    id: 6, title: 'Implement Dynamic Surge for Morning Slots', description: '8AM-10AM slots have 35% higher cancellation rate due to price sensitivity. A 10% morning discount could reduce cancellations by 20%.',
    category: 'pricing', confidence: 82, impact: '₹1.2L/mo', effort: 'Low', status: 'new',
    metric: 'Cancellations', metricChange: '-20%', metricDirection: 'down',
    details: ['35% cancellation in morning slots', 'Competitors offer 15% morning discount', 'Customer survey: price is top concern', 'Morning capacity utilization: 58%']
  },
]

const categoryConfig: Record<SuggestionCategory, { label: string; color: string; icon: React.ReactNode }> = {
  'pricing': { label: 'Pricing', color: 'bg-amber-50 text-amber-700', icon: <DollarSign className="size-3.5" /> },
  'expansion': { label: 'Service Expansion', color: 'bg-blue-50 text-blue-700', icon: <Layers className="size-3.5" /> },
  'allocation': { label: 'Provider Allocation', color: 'bg-purple-50 text-purple-700', icon: <Users className="size-3.5" /> },
  'optimization': { label: 'Optimization', color: 'bg-emerald-50 text-emerald-700', icon: <Zap className="size-3.5" /> },
}

const insightTimeline = [
  { time: '2 hrs ago', event: 'AC service demand spike detected in Mumbai', type: 'expansion' as const, impact: '+45% bookings' },
  { time: '5 hrs ago', event: 'Pune plumber response time exceeded threshold', type: 'optimization' as const, impact: '3.2 hrs avg' },
  { time: '8 hrs ago', event: 'Whitefield search volume crossed 3K/month', type: 'expansion' as const, impact: '3,400 searches' },
  { time: 'Yesterday', event: 'Morning slot cancellation rate above 30%', type: 'pricing' as const, impact: '35% cancel rate' },
  { time: '2 days ago', event: 'Hinjewadi capacity utilization hit 89%', type: 'allocation' as const, impact: 'Over capacity' },
  { time: '3 days ago', event: 'Weekend cleaning demand pattern identified', type: 'expansion' as const, impact: '68% weekend' },
]

export function AISuggestionsPage() {
  const [items, setItems] = useState(suggestions)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState<SuggestionCategory | 'all'>('all')

  const acceptSuggestion = (id: number) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' as const } : s))
  }

  const dismissSuggestion = (id: number) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, status: 'dismissed' as const } : s))
  }

  const filteredSuggestions = items.filter(s =>
    filterCategory === 'all' || s.category === filterCategory
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Suggestions</h1>
            <p className="text-sm text-slate-500 mt-1">AI-powered insights and recommendations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><RefreshCw className="size-4" /> Refresh</Button>
            <Button size="sm" className="gap-1 rounded-xl bg-blue-600 hover:bg-blue-700"><Brain className="size-4" /> Analyze</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Lightbulb className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Suggestions</p>
                  <p className="text-lg font-bold text-slate-900">{items.filter(s => s.status === 'new').length} New</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Accepted</p>
                  <p className="text-lg font-bold text-slate-900">{items.filter(s => s.status === 'accepted').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Target className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Potential Impact</p>
                  <p className="text-lg font-bold text-slate-900">₹12.3L/mo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Brain className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Confidence</p>
                  <p className="text-lg font-bold text-slate-900">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className={`rounded-xl ${filterCategory === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All
          </Button>
          {(['pricing', 'expansion', 'allocation', 'optimization'] as SuggestionCategory[]).map(cat => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              className={`rounded-xl gap-1 ${filterCategory === cat ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {categoryConfig[cat].icon} {categoryConfig[cat].label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Suggestion Cards */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className={`bg-white rounded-xl transition-all ${
                suggestion.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/30' :
                suggestion.status === 'dismissed' ? 'opacity-50' : ''
              }`}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] gap-1 ${categoryConfig[suggestion.category].color}`}>
                        {categoryConfig[suggestion.category].icon} {categoryConfig[suggestion.category].label}
                      </Badge>
                      <Badge variant="secondary" className={`text-[10px] ${
                        suggestion.effort === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                        suggestion.effort === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {suggestion.effort} Effort
                      </Badge>
                      {suggestion.status === 'accepted' && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 gap-1">
                          <CheckCircle2 className="size-3" /> Accepted
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{suggestion.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{suggestion.description}</p>

                  {/* Confidence + Impact */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-lg border border-slate-100 p-2.5">
                      <p className="text-[10px] text-slate-400 mb-1">Confidence Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={suggestion.confidence} className="h-2 flex-1" />
                        <span className="text-sm font-bold text-slate-900">{suggestion.confidence}%</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-100 p-2.5">
                      <p className="text-[10px] text-slate-400 mb-1">Est. Impact</p>
                      <p className="text-sm font-bold text-emerald-600">{suggestion.impact}</p>
                    </div>
                  </div>

                  {/* Key Metric */}
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Key Metric:</span>
                    <span className="text-xs font-medium text-slate-800">{suggestion.metric}</span>
                    <span className={`text-xs font-bold ${suggestion.metricDirection === 'up' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {suggestion.metricDirection === 'up' ? '↑' : '↓'} {suggestion.metricChange}
                    </span>
                  </div>

                  {/* Expandable Details */}
                  {expandedId === suggestion.id && (
                    <div className="mb-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                      <p className="text-xs font-medium text-blue-800 mb-2">Supporting Data:</p>
                      <ul className="space-y-1">
                        {suggestion.details.map((detail, i) => (
                          <li key={i} className="text-xs text-blue-700 flex items-center gap-1.5">
                            <ChevronRight className="size-3 text-blue-400" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-blue-600"
                      onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                    >
                      {expandedId === suggestion.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    {suggestion.status === 'new' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 gap-1"
                          onClick={() => acceptSuggestion(suggestion.id)}
                        >
                          <ThumbsUp className="size-3" /> Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs rounded-lg gap-1"
                          onClick={() => dismissSuggestion(suggestion.id)}
                        >
                          <ThumbsDown className="size-3" /> Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insights Timeline */}
          <Card className="bg-white rounded-xl h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-blue-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">Insights Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6">
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-200" />
                {insightTimeline.map((insight, i) => (
                  <div key={i} className="relative pb-5 last:pb-0">
                    <div className={`absolute left-[-14px] top-1 size-3 rounded-full border-2 ${
                      insight.type === 'expansion' ? 'bg-blue-500 border-blue-200' :
                      insight.type === 'pricing' ? 'bg-amber-500 border-amber-200' :
                      insight.type === 'allocation' ? 'bg-purple-500 border-purple-200' :
                      'bg-emerald-500 border-emerald-200'
                    }`} />
                    <p className="text-xs text-slate-800 font-medium">{insight.event}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{insight.time}</span>
                      <Badge variant="secondary" className="text-[10px] bg-slate-50">{insight.impact}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

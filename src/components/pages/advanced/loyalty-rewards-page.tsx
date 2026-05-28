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
  Crown,
  Award,
  Star,
  Gift,
  TrendingUp,
  ArrowUpRight,
  Users,
  IndianRupee,
  Calculator,
  Zap,
  CheckCircle2,
  Target,
  Sparkles,
  Shield,
  Truck,
  HeadphonesIcon,
  Percent,
  RotateCcw,
  Plus,
  Download,
  Trophy,
  Medal,
  Gem,
} from 'lucide-react'

const tiers = [
  {
    name: 'Bronze',
    icon: Medal,
    color: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-200',
    minPoints: 0,
    maxPoints: 999,
    members: 8765,
    benefits: ['1x points on all bookings', 'Birthday bonus 50 points', 'Access to basic offers', 'Email support'],
    pointsMultiplier: '1x',
    discount: '0%',
    iconColor: 'text-amber-600',
  },
  {
    name: 'Silver',
    icon: Award,
    color: 'bg-slate-100 text-slate-700',
    borderColor: 'border-slate-200',
    minPoints: 1000,
    maxPoints: 4999,
    members: 5432,
    benefits: ['1.5x points on all bookings', 'Birthday bonus 100 points', '5% discount on select services', 'Priority email support', 'Early access to deals'],
    pointsMultiplier: '1.5x',
    discount: '5%',
    iconColor: 'text-slate-600',
  },
  {
    name: 'Gold',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-200',
    minPoints: 5000,
    maxPoints: 19999,
    members: 2345,
    benefits: ['2x points on all bookings', 'Birthday bonus 200 points', '10% discount on all services', 'Priority phone support', 'Free rescheduling', 'Exclusive offers'],
    pointsMultiplier: '2x',
    discount: '10%',
    iconColor: 'text-yellow-600',
  },
  {
    name: 'Platinum',
    icon: Gem,
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-200',
    minPoints: 20000,
    maxPoints: 999999,
    members: 654,
    benefits: ['3x points on all bookings', 'Birthday bonus 500 points', '15% discount on all services', '24/7 dedicated support', 'Free cancellation', 'VIP offers', 'Free AMC plan'],
    pointsMultiplier: '3x',
    discount: '15%',
    iconColor: 'text-purple-600',
  },
]

const pointsRules = [
  { action: 'Booking Completion', points: '10 pts per ₹100', category: 'Earning', status: 'Active' },
  { action: 'First Booking', points: '100 pts bonus', category: 'Earning', status: 'Active' },
  { action: 'Review Submission', points: '25 pts per review', category: 'Earning', status: 'Active' },
  { action: 'Referral - New User', points: '200 pts per referral', category: 'Earning', status: 'Active' },
  { action: 'Social Media Share', points: '15 pts per share', category: 'Earning', status: 'Active' },
  { action: 'Birthday Bonus (Silver+)', points: '100-500 pts', category: 'Earning', status: 'Active' },
  { action: 'AMC Plan Purchase', points: '500 pts bonus', category: 'Earning', status: 'Active' },
  { action: 'Service Discount (Silver+)', points: '5-15% off', category: 'Redemption', status: 'Active' },
  { action: 'Free Rescheduling (Gold+)', points: '100 pts', category: 'Redemption', status: 'Active' },
  { action: 'Free Cancellation (Platinum)', points: '0 pts', category: 'Redemption', status: 'Active' },
]

const memberStats = [
  { label: 'Total Members', value: '17,196', change: '+1,234', icon: Users, color: 'bg-[#1D63FF]/10 text-[#1D63FF]' },
  { label: 'Active This Month', value: '8,432', change: '+18%', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Points Issued', value: '24.5L', change: '+22%', icon: Star, color: 'bg-amber-100 text-amber-600' },
  { label: 'Points Redeemed', value: '8.2L', change: '+15%', icon: Gift, color: 'bg-purple-100 text-purple-600' },
]

const rewardCatalog = [
  { id: 1, name: '₹200 Off Next Booking', points: 500, category: 'Discount', popularity: 92, stock: 'Unlimited' },
  { id: 2, name: 'Free Water Tank Cleaning', points: 2500, category: 'Service', popularity: 78, stock: 'Limited' },
  { id: 3, name: 'Free Air Conditioner Service', points: 1800, category: 'Service', popularity: 85, stock: 'Available' },
  { id: 4, name: '₹500 Off AMC Plan', points: 1000, category: 'Discount', popularity: 88, stock: 'Unlimited' },
  { id: 5, name: 'Priority Booking Access', points: 300, category: 'Perk', popularity: 72, stock: 'Unlimited' },
  { id: 6, name: 'Free Water Purifier Service', points: 1500, category: 'Service', popularity: 65, stock: 'Limited' },
]

export function LoyaltyRewardsPage() {
  const [calcAmount, setCalcAmount] = useState('')
  const [calcTier, setCalcTier] = useState('Bronze')

  const multipliers: Record<string, number> = { Bronze: 1, Silver: 1.5, Gold: 2, Platinum: 3 }
  const calculatedPoints = calcAmount
    ? Math.floor((parseFloat(calcAmount) / 100) * 10 * (multipliers[calcTier] || 1))
    : 0

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Loyalty & Rewards</h1>
            <p className="text-sm text-slate-500 mt-1">Manage loyalty program, tiers, and rewards</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1 rounded-xl bg-[#1D63FF] hover:bg-[#0B3D91]"><Plus className="size-4" /> Add Reward</Button>
          </div>
        </div>

        {/* Member Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="size-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tier System */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-amber-600" />
              <CardTitle className="text-sm font-semibold text-slate-900">Tier System</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier) => {
                const Icon = tier.icon
                return (
                  <div key={tier.name} className={`rounded-xl border-2 ${tier.borderColor} p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`flex size-8 items-center justify-center rounded-lg ${tier.color}`}>
                        <Icon className={`size-4 ${tier.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tier.name}</p>
                        <p className="text-[10px] text-slate-500">{tier.minPoints.toLocaleString()} - {tier.maxPoints.toLocaleString()} pts</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-slate-50">
                        <p className="text-xs font-bold text-slate-900">{tier.pointsMultiplier}</p>
                        <p className="text-[10px] text-slate-400">Points</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-slate-50">
                        <p className="text-xs font-bold text-slate-900">{tier.discount}</p>
                        <p className="text-[10px] text-slate-400">Discount</p>
                      </div>
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 mb-2">Benefits:</p>
                    <ul className="space-y-1 mb-3">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="size-3 text-emerald-500 mt-0.5 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500">{tier.members.toLocaleString()} members</span>
                      <Badge variant="secondary" className={`text-[10px] ${tier.color}`}>{tier.name}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Points Rules, Reward Catalog, Calculator */}
        <Tabs defaultValue="rules">
          <TabsList className="bg-white rounded-xl h-auto p-1">
            <TabsTrigger value="rules" className="rounded-lg text-xs">Points Rules</TabsTrigger>
            <TabsTrigger value="catalog" className="rounded-lg text-xs">Reward Catalog</TabsTrigger>
            <TabsTrigger value="calculator" className="rounded-lg text-xs">Points Calculator</TabsTrigger>
          </TabsList>

          {/* Points Rules */}
          <TabsContent value="rules" className="mt-4">
            <Card className="bg-white rounded-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Action</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Points / Reward</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Category</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsRules.map((rule, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-800">{rule.action}</td>
                          <td className="py-3 px-4 text-slate-700">{rule.points}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary" className={`text-[10px] ${
                              rule.category === 'Earning' ? 'bg-blue-50 text-[#0B3D91]' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {rule.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700">
                              {rule.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reward Catalog */}
          <TabsContent value="catalog" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardCatalog.map((reward) => (
                <Card key={reward.id} className="bg-white rounded-xl hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${
                        reward.category === 'Discount' ? 'bg-[#1D63FF]/10' :
                        reward.category === 'Service' ? 'bg-emerald-100' :
                        'bg-purple-100'
                      }`}>
                        {reward.category === 'Discount' ? <Percent className="size-5 text-[#1D63FF]" /> :
                         reward.category === 'Service' ? <Sparkles className="size-5 text-emerald-600" /> :
                         <Zap className="size-5 text-purple-600" />}
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${
                        reward.stock === 'Unlimited' ? 'bg-emerald-50 text-emerald-700' :
                        reward.stock === 'Limited' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        {reward.stock}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{reward.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="size-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-900">{reward.points} pts</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-slate-50">{reward.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-400">Popularity</span>
                      <span className="text-[10px] font-medium text-slate-600">{reward.popularity}%</span>
                    </div>
                    <Progress value={reward.popularity} className="h-1.5" />
                    <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs rounded-lg">
                      Edit Reward
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Points Calculator */}
          <TabsContent value="calculator" className="mt-4">
            <Card className="bg-white rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-[#1D63FF]" />
                  <CardTitle className="text-sm font-semibold text-slate-900">Points Calculator</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">Booking Amount (₹)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount e.g., 2500"
                        className="rounded-xl"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">Customer Tier</label>
                      <select
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                        value={calcTier}
                        onChange={(e) => setCalcTier(e.target.value)}
                      >
                        {tiers.map(t => (
                          <option key={t.name} value={t.name}>{t.name} ({t.pointsMultiplier})</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-[#1D63FF]/10">
                      <p className="text-xs text-[#1D63FF] mb-1">Points Earned</p>
                      <p className="text-3xl font-bold text-[#0B3D91]">{calculatedPoints} pts</p>
                      <p className="text-xs text-blue-500 mt-1">
                        Base: {calcAmount ? Math.floor((parseFloat(calcAmount) / 100) * 10) : 0} pts × {multipliers[calcTier]}x multiplier
                      </p>
                    </div>
                  </div>

                  {/* Tier Progression Preview */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-700">Points Needed for Next Tier</p>
                    {tiers.map((tier) => {
                      const earned = calculatedPoints
                      const progress = tier.maxPoints < 999999
                        ? Math.min(((earned) / tier.maxPoints) * 100, 100)
                        : earned > tier.minPoints ? 100 : ((earned) / tier.minPoints) * 100
                      const isCurrentOrBelow = earned >= tier.minPoints
                      return (
                        <div key={tier.name} className={`rounded-lg border p-3 ${isCurrentOrBelow ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <tier.icon className={`size-3.5 ${tier.iconColor}`} />
                              <span className="text-xs font-medium text-slate-800">{tier.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{tier.minPoints.toLocaleString()}+ pts</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tier Distribution Chart Placeholder */}
        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">Member Distribution by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6 justify-center h-48">
              {tiers.map((tier) => {
                const maxMembers = Math.max(...tiers.map(t => t.members))
                const height = (tier.members / maxMembers) * 160
                return (
                  <div key={tier.name} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{(tier.members / 1000).toFixed(1)}K</span>
                    <div
                      className={`w-16 rounded-t-lg ${tier.color} transition-all hover:opacity-80`}
                      style={{ height: `${height}px` }}
                    />
                    <div className="flex items-center gap-1">
                      <tier.icon className={`size-3 ${tier.iconColor}`} />
                      <span className="text-xs text-slate-600">{tier.name}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

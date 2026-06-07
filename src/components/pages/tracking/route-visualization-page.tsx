'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Navigation, ArrowUp, ArrowRight, ArrowDown, CornerDownRight, CornerDownLeft, Flag } from 'lucide-react'

const directions = [
  { instruction: 'Head north on Main Road', distance: '0.5 km', icon: ArrowUp },
  { instruction: 'Turn right at Rajouri Chowk', distance: '0.8 km', icon: CornerDownRight },
  { instruction: 'Continue on Ring Road', distance: '0.7 km', icon: ArrowRight },
  { instruction: 'Turn left at Metro Station', distance: '0.3 km', icon: CornerDownLeft },
  { instruction: 'Turn right onto Rajouri Garden', distance: '0.2 km', icon: CornerDownRight },
  { instruction: 'Arrive at destination', distance: '', icon: Flag },
]

export function RouteVisualizationPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Route Map</h1>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="relative h-56 bg-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <MapPin className="size-8" />
              <span className="text-sm">Route Visualization</span>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-4 rounded-lg bg-white/90 px-4 py-2 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-[#0A1F44]" />
                <span className="text-xs text-slate-600">Provider</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-emerald-600" />
                <span className="text-xs text-slate-600">Your Location</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Distance', value: '2.5 km', color: 'text-[#0A1F44] bg-[#FFD54F]/10' },
            { label: 'Est. Time', value: '12 min', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Turns', value: '4', color: 'text-purple-600 bg-purple-50' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white rounded-xl">
              <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Turn-by-Turn Directions</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {directions.map((d, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-slate-50">
                    <d.icon className={`size-4 ${d.icon === Flag ? 'text-emerald-600' : 'text-[#0A1F44]'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{d.instruction}</p>
                    {d.distance && <p className="text-xs text-slate-400">{d.distance}</p>}
                  </div>
                  {i === 0 && <Badge variant="secondary" className="bg-[#FFD54F]/10 text-[#0A1F44] border-[#FFD54F]/20 hover:bg-[#FFD54F]/10 text-[10px]">Next</Badge>}
                </div>
                {i < directions.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

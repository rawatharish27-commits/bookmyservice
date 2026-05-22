'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, Star, MapPin, X, Zap, Wrench, Droplets } from 'lucide-react'

const favorites = [
  { id: 1, name: 'Amit Sharma', service: 'AC Service', rating: 4.9, reviews: 500, area: 'Delhi NCR', icon: Zap, color: 'text-blue-600 bg-blue-50' },
  { id: 2, name: 'Priya Services', service: 'Deep Cleaning', rating: 4.8, reviews: 350, area: 'Gurugram', icon: Droplets, color: 'text-emerald-600 bg-emerald-50' },
  { id: 3, name: 'QuickFix Repairs', service: 'Plumbing', rating: 4.7, reviews: 280, area: 'South Delhi', icon: Wrench, color: 'text-purple-600 bg-purple-50' },
  { id: 4, name: 'HomeCare Pro', service: 'Electrician', rating: 4.6, reviews: 190, area: 'Noida', icon: Zap, color: 'text-amber-600 bg-amber-50' },
]

export function ClientFavoritesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Favorites</h1>

        <div className="space-y-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="bg-white rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${fav.color}`}>
                    <fav.icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900">{fav.name}</h3>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-[10px]"><Star className="size-2.5 mr-0.5 fill-amber-400 text-amber-400" />{fav.rating}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{fav.service} • {fav.reviews}+ reviews</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400"><MapPin className="size-3" />{fav.area}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs">Book Now</Button>
                    <Button variant="ghost" size="icon" className="size-8 text-red-400 hover:text-red-600 hover:bg-red-50"><Heart className="size-4 fill-red-400" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

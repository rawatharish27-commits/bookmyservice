'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Heart, Star, MapPin, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { useApp } from '@/lib/app-context'

interface FavoriteProvider {
  id: string
  name: string
  service: string
  rating: number
  reviews: number
  area: string
}

export function ClientFavoritesPage() {
  const { navigate } = useApp()
  const { data: favorites, loading, error, refetch } = useApi<FavoriteProvider[]>(async () => {
    const res = await fetch('/api/client/favorites')
    if (!res.ok) throw new Error('Failed to load favorites')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading favorites">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load favorites</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Favorites</h1>

        {!favorites || favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No favorite providers yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <Card key={fav.id} className="bg-white rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1D63FF]">
                      <Heart className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-900">{fav.name}</h3>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-[10px]"><Star className="size-2.5 mr-0.5 fill-amber-400 text-amber-400" />{fav.rating}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{fav.service} &bull; {fav.reviews}+ reviews</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400"><MapPin className="size-3" />{fav.area}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-lg text-xs" aria-label={`Book ${fav.name}`}>Book Now</Button>
                      <Button variant="ghost" size="icon" className="size-8 text-red-400 hover:text-red-600 hover:bg-red-50" aria-label={`Remove ${fav.name} from favorites`}><Heart className="size-4 fill-red-400" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

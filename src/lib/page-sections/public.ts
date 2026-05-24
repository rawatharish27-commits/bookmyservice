import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'home': () => import('@/components/pages/public/home-page').then(m => ({ default: m.HomePage })),
  'categories': () => import('@/components/pages/public/categories-page').then(m => ({ default: m.CategoriesPage })),
  'service-listing': () => import('@/components/pages/public/service-listing-page').then(m => ({ default: m.ServiceListingPage })),
  'service-detail': () => import('@/components/pages/public/service-detail-page').then(m => ({ default: m.ServiceDetailPage })),
  'search': () => import('@/components/pages/public/search-page').then(m => ({ default: m.SearchPage })),
  'nearby-providers': () => import('@/components/pages/public/nearby-providers-page').then(m => ({ default: m.NearbyProvidersPage })),
  'featured-services': () => import('@/components/pages/public/featured-services-page').then(m => ({ default: m.FeaturedServicesPage })),
  'trending-services': () => import('@/components/pages/public/trending-services-page').then(m => ({ default: m.TrendingServicesPage })),
  'offers-deals': () => import('@/components/pages/public/offers-deals-page').then(m => ({ default: m.OffersDealsPage })),
  'popular-providers': () => import('@/components/pages/public/popular-providers-page').then(m => ({ default: m.PopularProvidersPage })),
}

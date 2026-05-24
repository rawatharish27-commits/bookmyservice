import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'live-tracking': () => import('@/components/pages/tracking/live-tracking-page').then(m => ({ default: m.LiveTrackingPage })),
  'technician-eta': () => import('@/components/pages/tracking/technician-eta-page').then(m => ({ default: m.TechnicianEtaPage })),
  'route-visualization': () => import('@/components/pages/tracking/route-visualization-page').then(m => ({ default: m.RouteVisualizationPage })),
  'booking-timeline': () => import('@/components/pages/tracking/booking-timeline-page').then(m => ({ default: m.BookingTimelinePage })),
  'technician-contact': () => import('@/components/pages/tracking/technician-contact-page').then(m => ({ default: m.TechnicianContactPage })),
}

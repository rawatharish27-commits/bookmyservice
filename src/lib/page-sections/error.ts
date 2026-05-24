import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'not-found': () => import('@/components/pages/error/not-found-page').then(m => ({ default: m.NotFoundPage })),
  'server-error': () => import('@/components/pages/error/server-error-page').then(m => ({ default: m.ServerErrorPage })),
  'maintenance': () => import('@/components/pages/error/maintenance-page').then(m => ({ default: m.MaintenancePage })),
  'no-internet': () => import('@/components/pages/error/no-internet-page').then(m => ({ default: m.NoInternetPage })),
  'access-denied': () => import('@/components/pages/error/access-denied-page').then(m => ({ default: m.AccessDeniedPage })),
  'session-expired': () => import('@/components/pages/error/session-expired-page').then(m => ({ default: m.SessionExpiredPage })),
}
